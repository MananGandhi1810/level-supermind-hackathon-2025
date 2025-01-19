from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import List, Dict, Any
import google.generativeai as genai
import google.generativeai as genai2
import os
import requests
import json
import logging
import traceback
from dotenv import load_dotenv
from firecrawl import FirecrawlApp
from astrapy import DataAPIClient
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain.agents import tool, AgentExecutor, create_react_agent
from langchain_core.messages import AIMessage, HumanMessage
from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder
import yt_dlp
import webvtt
import io
import numpy as np
import warnings
import asyncio
from fastapi.middleware.cors import CORSMiddleware

warnings.filterwarnings("ignore", category=DeprecationWarning)
warnings.filterwarnings("ignore", category=RuntimeWarning)

# Configure detailed logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - [%(filename)s:%(lineno)d] - %(message)s",
    handlers=[logging.FileHandler("app.log"), logging.StreamHandler()],
)
logger = logging.getLogger(__name__)


class CompetitorSearchRequest(BaseModel):
    url: str


class CompetitorSearchResponse(BaseModel):
    competitors: List[Dict[str, Any]]
    analysis: str


def format_log_to_messages(intermediate_steps):
    """Construct the scratchpad that lets the agent continue its thought process."""
    thoughts = []
    for action, observation in intermediate_steps:
        thoughts.append(AIMessage(content=action.log))
        human_message = HumanMessage(content=f"Observation: {observation}")
        thoughts.append(human_message)
    return thoughts


# Load environment variables
load_dotenv()
required_env_vars = [
    "GEMINI_KEY",
    "FIRECRAWL_KEY",
    "SERPAPI_KEY",
    "ASTRADB_KEY",
    "GEMINI_API_KEY",
]
for var in required_env_vars:
    if not os.getenv(var):
        logger.critical(f"Missing required environment variable: {var}")
        raise EnvironmentError(f"Missing required environment variable: {var}")

# Initialize AstraDB
client = DataAPIClient(os.getenv("ASTRADB_KEY"))
db = client.get_database_by_api_endpoint(
    "https://76def820-552c-4b62-a2de-db7646bb920a-us-east1.apps.astra.datastax.com"
)

print(f"Connected to Astra DB: {db.list_collection_names()}")

# Initialize FastAPI app
app = FastAPI(title="Unified Analysis API")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

try:
    # Configure Gemini
    genai.configure(api_key=os.getenv("GEMINI_KEY"))
    genai2.configure(api_key=os.getenv("GEMINI_API_KEY_2"))
    fcapp = FirecrawlApp(api_key=os.getenv("FIRECRAWL_KEY"))
    logger.info("Successfully initialized Gemini and Firecrawl")
except Exception as e:
    logger.critical(
        f"Failed to initialize core services: {str(e)}\n{traceback.format_exc()}"
    )
    raise

# Model configurations
gemini_generation_config = {
    "temperature": 1,
    "top_p": 0.95,
    "top_k": 40,
    "max_output_tokens": 8192,
}

structured_gemini_generation_config = {
    "temperature": 1,
    "top_p": 0.95,
    "top_k": 40,
    "max_output_tokens": 8192,
    "response_mime_type": "application/json",
}


# Pydantic models
class UnifiedRequest(BaseModel):
    url: str
    company_name: str


class UnifiedResponse(BaseModel):
    competitors: List[Dict]
    analysis: str
    social_analysis: Dict


# System prompts
analysis_system_prompt = """Adopt the role of a website analyst. You will be provided the scraped markdown data of a given website, from this site, you are to recognise the following:

1. Product/Service Categories
    - Specific product names and descriptions
    - Service offerings and their descriptions
    - Industry-specific terminology and jargon
    - Target market segments mentioned
    - Core problems they claim to solve

3. Business Model Identifiers
    - Pricing structure hints (B2B, B2C, enterprise)
    - Target customer size (SMB, Enterprise, etc.)
    - Sales model

4. Market Positioning
    - Key value propositions
    - Mission statements
    - Partner ecosystem"""

searchquery_system_prompt = """You are a helpful assistant that will be provided some information about a website. This website will contain data about a particular company 
that offers some products and/or services. Your job, is to, from this data give, construct 3 search queries that might result in companies that
do/offer similar products/services. focusing on what the given company does. essentially searching for potential competitors that offer similar products/services.
These 3 queries must distill the essence of their product, each query must be a distinct core value add that the company provides, and queries must not overlap.
Return your data in a List of Strings format that is parsable in python. If a given list seems like a listicle, guide, blog, article, skip it entirely. Stuff like wikipedia, imdb, guides are forbidden. include only companies."""

competitorfinder_system_prompt = """You are a helpful assistant who has json mode enabled. Your responses will strictly be in json format. You will be given 1. the details of a company, 
these details represent the core purpose, features and USPs of a company. You will also be given 2. 15 links that are probably competitors. Here is your job:
Find the 3 top companies from the probable competitors that most closely compete with the core values of the company initially mentioned in 1. Return your output as the records of the json
as seen in 2. (For example if you are given title link and snippet, return the same 3 of those top 3 companies). DO NOT INCLUDE LISTICLES. DO NOT INCLUDE ARTICLES OR ANY SITES THAT SOUND LIKE TOP 10 OR ARE BLOG WEBSITES
for example, netflix has prime video as their competitor. Samsung has Nothingphone and Pixel."""

try:
    # Initialize models
    analysis_model = genai.GenerativeModel(
        model_name="gemini-2.0-flash-exp",
        system_instruction=analysis_system_prompt,
        generation_config=gemini_generation_config,
    )

    searchquery_model = genai.GenerativeModel(
        model_name="gemini-2.0-flash-exp",
        generation_config=gemini_generation_config,
        system_instruction=searchquery_system_prompt,
    )

    competitorfinder_model = genai.GenerativeModel(
        model_name="gemini-2.0-flash-exp",
        system_instruction=competitorfinder_system_prompt,
        generation_config=structured_gemini_generation_config,
    )
    logger.info("Successfully initialized all Gemini models")
except Exception as e:
    logger.critical(
        f"Failed to initialize Gemini models: {str(e)}\n{traceback.format_exc()}"
    )
    raise


# Tools for agent
@tool
def scrape_url(url: str) -> str:
    """
    Returns data in HTML by scraping the url. Provide full link: https://<domain>/<path(s)>
    """
    url = url.strip().replace("\n", "").replace("'", "").replace('"', "")
    print(f"Requesting URL: {url}")
    response = requests.get(url)
    return response.content


@tool
def scrape_yt(url: str) -> str:
    """
    Get description and transcript for any youtube video. Provide full link: https://youtube.com/watch?v=<videoId>
    """
    url = url.strip().replace("'", "").replace('"', "").replace("\n", "")
    print(f"Scraping YouTube: {url}")

    ydl_opts = {
        "quiet": True,
        "skip_download": True,
        "writesubtitles": True,
        "writeautomaticsub": True,
        "writeinfojson": False,
    }

    if "youtube.com/shorts" in url:
        return "Cannot scrape YouTube Shorts, try some other long form video"

    with yt_dlp.YoutubeDL(ydl_opts) as ydl:
        output = {
            "Description": "",
            "Sponsor Transcript": "",
            "Sponsorship Retention Ratio": 1,
            "Comments": [],
        }
        info = ydl.extract_info(url, download=False)
        output["Description"] = info.get("description", "No description available.")

        try:
            # Get sponsor segments
            sponsor_segments = []
            response = requests.get(
                f"https://sponsor.ajay.app/api/skipSegments?videoID={info['id']}&category=sponsor"
            )
            if response.status_code == 200:
                sponsor_segments = response.json()
        except:
            sponsor_segments = []

        try:
            # Get retention data
            retention_data = info.get("heatmap")
            if retention_data and sponsor_segments:
                sponsor_retention = []
                non_sponsor_retention = []
                for segment in sponsor_segments:
                    start, end = segment["segment"]
                    for retention in retention_data:
                        if (
                            start <= retention["start_time"]
                            and end >= retention["end_time"]
                        ):
                            sponsor_retention.append(retention["value"])
                        else:
                            non_sponsor_retention.append(retention["value"])
                output["Sponsorship Retention Ratio"] = round(
                    (np.median(sponsor_retention) / np.median(non_sponsor_retention)), 4
                )
            else:
                output["Sponsorship Retention Ratio"] = -1
        except:
            output["Sponsorship Retention Ratio"] = -1

        try:
            # Get English subtitles and process sponsor transcript
            en_subtitle = info.get("requested_subtitles", {}).get("en") or info.get(
                "requested_subtitles", {}
            ).get("en-auto")

            if en_subtitle and sponsor_segments:
                subtitle_url = en_subtitle["url"]
                subtitle_content = ydl.urlopen(subtitle_url).read().decode("utf-8")
                vtt = webvtt.read_buffer(io.StringIO(subtitle_content))

                seen_lines = set()
                for segment in sponsor_segments:
                    start, end = segment["segment"]
                    for caption in vtt:
                        if (
                            start <= caption.start_in_seconds <= end
                            or start <= caption.end_in_seconds <= end
                        ):
                            for line in caption.text.strip().splitlines():
                                if line not in seen_lines:
                                    output["Sponsor Transcript"] += line + " "
                                    seen_lines.add(line)
            else:
                output["Sponsor Transcript"] = (
                    "No sponsor segments or English subtitles available."
                )
        except:
            output["Sponsor Transcript"] = (
                "No sponsor segments or English subtitles available."
            )

        return output


@tool
def search_youtube(search_query: str) -> dict:
    """
    Search for a query on YouTube and return the top 5 results as a dictionary.
    """
    search_query = (
        search_query.strip().replace("\n", "").replace("'", "").replace('"', "")
    )
    print(f"Searching YouTube: {search_query}")
    ydl_opts = {
        "quiet": True,
        "no_warnings": True,
        "extract_flat": "in_playlist",
        "geo_bypass": True,
        "noplaylist": True,
        "postprocessor_args": ["-match_lang", "en"],
    }
    try:
        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            result = yt_dlp.YoutubeDL(ydl_opts).extract_info(
                f"ytsearch50:{search_query}", download=False
            )
            videos = result.get("entries", [])
            sorted_videos = sorted(
                videos, key=lambda x: x.get("view_count", 0), reverse=True
            )
            top_videos = {
                i: {
                    "title": video.get("title", "Unknown"),
                    "url": video.get("url", ""),
                }
                for i, video in enumerate(sorted_videos[:5])
            }
            return top_videos
    except Exception as e:
        return {"error": str(e)}


@tool
def scrape_reddit(subreddit: str) -> dict:
    """
    Extract top 10 posts from a subreddit with its top 10 comments using the subreddit name. Only provide subreddit name without r/
    """
    subreddit = subreddit.strip().replace("\n", "").replace("'", "").replace('"', "")
    print(f"Scraping Subreddit: {subreddit}")
    url = f"https://www.reddit.com/r/{subreddit}/top/.json?t=all"

    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/117.0.0.0 Safari/537.36"
    }

    output = {}
    response = requests.get(url=url, headers=headers)
    if response.status_code == 200:
        data = response.json()
        for i in range(10):
            try:
                output[i] = {
                    "title": data["data"]["children"][i]["data"]["title"],
                    "description": data["data"]["children"][i]["data"]["selftext"],
                    "url": "https://www.reddit.com"
                    + data["data"]["children"][i]["data"]["permalink"],
                    "upvote_ratio": data["data"]["children"][i]["data"]["upvote_ratio"],
                    "comments": {},
                }
            except:
                break
    else:
        print("Failed to fetch data from Reddit")
        print(response.status_code)
        return "Could not scrape reddit"

    for i in output:
        url = output[i]["url"] + ".json?sort=top"
        r = requests.get(url=url, headers=headers)
        if r.status_code == 200:
            data = r.json()
            try:
                for j in range(10):
                    output[i]["comments"][j] = {
                        "text": data[1]["data"]["children"][j]["data"]["body"],
                        "upvotes": data[1]["data"]["children"][j]["data"]["ups"],
                        "replies": {},
                    }
                    try:
                        for k in range(5):
                            output[i]["comments"][j]["replies"][k] = {
                                "text": data[1]["data"]["children"][j]["data"][
                                    "replies"
                                ]["data"]["children"][k]["data"]["body"],
                                "upvotes": data[1]["data"]["children"][j]["data"][
                                    "replies"
                                ]["data"]["children"][k]["data"]["ups"],
                            }
                    except:
                        pass
            except Exception as e:
                pass
        else:
            print("Failed to fetch comments from Reddit")
            print(r.status_code)

    return output


extractor = genai2.GenerativeModel(
    model_name="gemini-1.5-flash",
    generation_config=genai.GenerationConfig(response_mime_type="application/json"),
    system_instruction="Extract the data and return it as a fixed JSON",
)

# Initialize LangChain components
llm = ChatGoogleGenerativeAI(
    model="gemini-1.5-flash",
    api_key=os.getenv("GEMINI_API_KEY"),
)

tools = [scrape_url, scrape_yt, search_youtube, scrape_reddit]
example_input = "https://www.raisegate.com"
example_output = {
    "competitors": [
        {
            "title": "Harmonic.ai - The complete startup database",
            "link": "https://www.harmonic.ai/",
            "snippet": "Our ever-growing database of 20M+ companies and 160M+ people ensures you're never missing an opportunity. Create, tune and save hyper-specific searches.",
        },
        {
            "title": "Access 4.7M+ Startups & Scaleups | StartUs Insights Platform",
            "link": "https://www.startus-insights.com/startus-insights-platform/",
            "snippet": "Dive into the world of innovation with the Big Data and AI-powered Discovery Platform, where discovering startups, technologies, and market trends is not just ...",
        },
        {
            "title": "Deal Sourcing Tools for VC Investors",
            "link": "https://www.vcstack.io/category/deal-sourcing",
            "snippet": "We build a data-driven deal sourcing & due diligence engine for VC investors. OurCrowd. Democratizing access to private equity investing.",
        },
        {
            "title": "A Guide to Venture Capital Deal Sourcing",
            "link": "https://www.cyndx.com/resources/blog/venture-capital-deal-sourcing/",
            "snippet": "Cyndx Finder is an AI-enriched deal origination platform designed to empower venture capitalists in navigating the complex landscape of global ...",
        },
        {
            "title": "Startup Fundraising Platform | FundrsVC",
            "link": "https://fundrs.vc/",
            "snippet": "FundrsVC offers a comprehensive and user-friendly platform that helps startup founders and early-stage investors navigate the fundraising process.",
        },
        {
            "title": "Fundable | Startup Fundraising Platform",
            "link": "https://www.fundable.com/",
            "snippet": "Startup Fundraising Platform. Start and manage a professional fundraise to attract quality accredited investors.",
        },
    ],
    "analysis": '\nBased on our analysis, we identified the following key aspects:\n\nCompany Profile:\nOkay, here\'s my analysis of the provided website data for RaiseGate:\n\n**1. Product/Service Categories:**\n\n*   **Core Service:** RaiseGate is a platform connecting startups seeking funding with Venture Capital (VC) firms and angel investors. It\'s a marketplace or matchmaking service.\n*   **AI-Powered Startup Discovery:**\n    *   **Description:** Uses AI (Scout AI) to help investors discover startups that fit their investment criteria, eliminating manual research on platforms like LinkedIn and Twitter.\n    *   **Specifics:** Curates leads and streamlines the search for VCs.\n*   **Streamlined Data Rooms:**\n    *   **Description:** Provides a secure and controlled environment for sharing information like pitch decks between startups and VCs.\n    *   **Specifics:** VCs can request pitch decks, and startups approve or decline, maintaining control.\n*   **Demo Videos:**\n    *   **Description:** Allows startups to showcase their products and ideas directly to investors through dynamic videos.\n    *   **Specifics:** Helps investors quickly assess viability and potential.\n*   **Comprehensive Profiles:**\n    *   **Description:** Detailed company information, team, market insights, business models, demo videos, and investment theses for each startup.\n*   **Deck Requests:**\n    *   **Description:** Direct request functionality from VCs to startups for pitch decks, with startup approval needed.\n*   **Service Descriptions:**\n    *   **For Startups:** Platform for visibility, access to investors, streamlined fundraising and access to mentorship/strategic advice.\n    *  **For Investors:** Access to curated startups, AI-powered discovery, time-saving tools, initial due diligence support.\n*   **Industry-Specific Terminology:**\n    *   Venture Capital (VC)\n    *   Angel Investors\n    *   Startup\n    *   Pitch Decks\n    *   Data Room\n    *   Investment Criteria\n    *   Fundraising\n    *   Due Diligence\n    *   Investment Portfolio\n*  **Target Market Segments:**\n    *   Startups seeking funding (across various domains, including deep tech and consumer products).\n    *   Venture Capital Firms and Angel Investors.\n*   **Core Problems Solved:**\n    *   **For Startups:** Difficulty in reaching and being discovered by the right investors. Inefficiencies in the traditional fundraising process.\n    *   **For Investors:** Time-consuming manual scouting for startups. Difficulty in quickly assessing startup potential.\n    *   **Overall:** Connecting suitable startups with investors efficiently.\n\n**2. Business Model Identifiers:**\n\n*   **Pricing Structure Hints:**\n    *   "No contracts, no hidden costs" - Suggests a possible subscription or usage-based model. However, specific pricing is not mentioned.\n    *  The statement "just tell us what you need and we\'ll deliver accordingly" suggests a potentially tailored pricing approach.\n*   **Target Customer Size:**\n    *   Targets both early-stage and potentially later stage startups, indicated by "from various domains".\n    *   Targets VC firms and Angel investors, implying a focus on those who make investments in startups.\n*  **Sales Model:**\n    *   Primarily a platform/marketplace model, connecting two distinct user groups (startups and investors).\n    *  Uses the concept of membership and early access. The platform also heavily promotes applying and joining.\n    *   Potentially, they have a freemium or subscription model (not explicitly stated).\n\n**3. Market Positioning:**\n\n*   **Key Value Propositions:**\n    *   **For Startups:** Increased visibility to a curated audience of investors, faster fundraising, and access to strategic resources.\n        *   "Be discovered by the leading VC firms and angel investors"\n        *  "60% Faster than going the traditional way"\n        *  "Grow Strategically"\n    *   **For Investors:** Streamlined, efficient startup discovery powered by AI, access to pre-vetted startups, saving time and effort in the sourcing process.\n        *  "Look through our curated assortment of startups"\n        *  "100+ We interview more than 100 startups every week"\n    *   **Overall:** A "cutting edge" solution, efficient, time-saving, and effective matchmaking platform.\n*   **Mission Statements (Implied):**\n    *   To simplify and expedite the fundraising process for startups.\n    *   To enable VCs and angel investors to discover promising startups more efficiently.\n    * To streamline the connection of promising startups with capital.\n*   **Partner Ecosystem (Implied):**\n    *   VC Firms\n    *   Angel Investors\n    *   Startups from various sectors\n\n**Summary:**\n\nRaiseGate positions itself as an AI-powered platform aimed at disrupting the traditional fundraising and deal sourcing process. It targets both startups seeking capital and investors seeking promising companies. Its core value proposition is to create a more efficient, streamlined, and data-driven experience for both sides of the equation. The website content focuses on highlighting the time-saving, curated, and direct approach the platform takes, differentiating it from manual and more cumbersome methods. They emphasize the use of technology like AI and the structure of data rooms to make their offering attractive.\n\n\nKey Search Terms:\nAI powered startup discovery platform, Venture capital deal sourcing platform, Startup fundraising platform\n\nTop Competitors Overview:\n[\n  {\n    "title": "Harmonic.ai - The complete startup database",\n    "link": "https://www.harmonic.ai/",\n    "snippet": "Our ever-growing database of 20M+ companies and 160M+ people ensures you\'re never missing an opportunity. Create, tune and save hyper-specific searches."\n  },\n  {\n    "title": "Access 4.7M+ Startups & Scaleups | StartUs Insights Platform",\n    "link": "https://www.startus-insights.com/startus-insights-platform/",\n    "snippet": "Dive into the world of innovation with the Big Data and AI-powered Discovery Platform, where discovering startups, technologies, and market trends is not just ..."\n  },\n  {\n    "title": "Deal Sourcing Tools for VC Investors",\n    "link": "https://www.vcstack.io/category/deal-sourcing",\n    "snippet": "We build a data-driven deal sourcing & due diligence engine for VC investors. OurCrowd. Democratizing access to private equity investing."\n  },\n  {\n    "title": "A Guide to Venture Capital Deal Sourcing",\n    "link": "https://www.cyndx.com/resources/blog/venture-capital-deal-sourcing/",\n    "snippet": "Cyndx Finder is an AI-enriched deal origination platform designed to empower venture capitalists in navigating the complex landscape of global ..."\n  },\n  {\n    "title": "Startup Fundraising Platform | FundrsVC",\n    "link": "https://fundrs.vc/",\n    "snippet": "FundrsVC offers a comprehensive and user-friendly platform that helps startup founders and early-stage investors navigate the fundraising process."\n  },\n  {\n    "title": "Fundable | Startup Fundraising Platform",\n    "link": "https://www.fundable.com/",\n    "snippet": "Startup Fundraising Platform. Start and manage a professional fundraise to attract quality accredited investors."\n  }\n]\n\nThis analysis provides a comprehensive view of the company\'s market position and its main competitors.\n',
    "social_analysis": {
        "reddit": {
            "analysis": "The subreddit r/venturecapital reveals several key themes. There's a strong sentiment that many junior VCs lack real-world experience, leading to poor advice for founders. The community also discusses the challenges of fundraising, the importance of networking, and the debate around the use of AI in VC. The general consensus is that while VC is not dying, it's undergoing a transformation, with more emphasis on specialized knowledge and a shift from hype-driven investments to more strategic ones. There is also some criticism of the '30 under 30' lists as being more about self-promotion than actual investing acumen. A recurring pain point is the lack of good tooling and the reliance on spreadsheets and email, indicating a need for more advanced solutions. The most upvoted posts and comments often highlight the importance of genuine relationships and operational experience over surface level expertise.",
            "metrics": {
                "upvote_ratio_avg": "0.94",
                "comment_count_avg": "27",
                "recurring_themes": [
                    "lack of experience in junior VCs",
                    "importance of genuine relationships",
                    "need for better tooling",
                    "AI in VC",
                    "criticism of '30 under 30' lists",
                ],
            },
        },
        "youtube": {
            "analysis": "The YouTube search results reveal a mix of educational content and promotional material related to VC and startup fundraising. There are a few company created videos that show platforms for deal management and fund administration. There are also quite a few sponsored videos from channels like 'The Futur', which are educational videos with sponsors. The educational content covers topics like the basics of venture capital, fundraising strategies, and how to create a good pitch deck. There is a lack of videos from companies that are direct competitors offering similar services, indicating a relatively niche market. The sponsored videos highlight the growing trend of leveraging educational content for marketing purposes. The retention ratios of the sponsored segments vary depending on the channel, indicating the importance of channel authority and audience engagement.",
            "metrics": {
                "company_created_videos_count": 2,
                "sponsored_videos_count": 3,
                "sponsored_video_timestamps": [
                    {
                        "channel": "The Futur",
                        "sponsor_segment_timestamp": "0:00",
                        "retention_ratio": "0.85",
                    },
                    {
                        "channel": "The Futur",
                        "sponsor_segment_timestamp": "5:30",
                        "retention_ratio": "0.78",
                    },
                    {
                        "channel": "Ali Abdaal",
                        "sponsor_segment_timestamp": "0:00",
                        "retention_ratio": "0.92",
                    },
                ],
            },
        },
        "trustpilot": {
            "analysis": "No Trustpilot data available as there was no link provided.",
            "metrics": {},
        },
        "user_pain_points": [
            "Difficulty for startups in finding the right investors.",
            "VCs wasting time on unqualified leads.",
            "Lack of transparency in the fundraising process.",
            "Inefficient methods of deal discovery and management.",
            "Junior VCs lacking practical experience.",
            "Reliance on outdated tools like spreadsheets and email.",
            "Need for better ways to showcase startups to investors.",
            "Desire for more authentic connections and less transactional interactions.",
            "Need for more streamlined due diligence processes",
        ],
        "ad_storyline": "The ad campaign will focus on the pain points of both startups and VCs. It will highlight how RaiseGate streamlines deal flow, provides access to high-quality leads, and offers comprehensive tools for effective collaboration. The storyline will emphasize the platform's ability to eliminate the inefficiencies of traditional methods and foster genuine connections.",
        "hook": "Tired of endless LinkedIn searches and outdated spreadsheets? RaiseGate connects you to the right opportunities, faster. Whether you're a startup looking for funding or a VC seeking the next big thing, we've got you covered.",
    },
}

system_prompt = """JSON MODE ON
Answer the following questions as best you can. You have access to the following tools:
{tools}

You are AdGen, a helpful AI assistant that streamlines the process of research for creating an advertising campaign. You have been tasked with analyzing a company's website to identify key aspects of their business model, product/service categories, and market positioning. You will then generate search queries to find potential competitors and identify the top competitors based on the company's core values.

You have access to the following tools:
- scrape_url -> Returns data in HTML by scraping the url. Provide full link: https://<domain>/<path(s)> (Use this to scrape trustpilot data as well)
- scrape_yt -> Get description and transcript for any youtube video. Provide full link: https://youtube.com/watch?v=<videoId>
- search_youtube -> Search for a query on YouTube and return the top 5 results as a dictionary.
- scrape_reddit -> Extract top 10 posts from a subreddit with its top 10 comments using the subreddit name. Only provide subreddit name without r/

Use the following format:

Question: the input question you must answer

Thought: you should always think about what to do

Action: the action to take, should be one of [{tool_names}]

Action Input: the input to the action

Observation: the result of the action

... (this Thought/Action/Action Input/Observation can repeat N times)

Thought: I now know the final answer

Final Answer: the final answer to the original input question

The following should be the fields in the final answer:
- reddit: Analysis of the top 10 posts from the subreddit along with metrics to support the analysis
- youtube: Analysis of the top 5 videos from the search query along with metrics to support the analysis, at least 2 company-created videos and 2 sponsored videos by other channels. Also include the timestamps of the sponsor segments and the retention ratios at those segments as a list of dictionaries. Also include the URL of the video, both company-created and sponsored.
- trustpilot: Analysis of the trustpilot data along with metrics to support the analysis
- user_pain_points: The user pain points identified from the website, reddit comments, youtube comments, and trustpilot reviews
- ad_storyline: The storyline for the ad campaign based on the user pain points identified
- hook: The hook for the ad campaign based on the user pain points identified

ANY FIELDS CANNOT BE EMPTY. If there is no data available, mention that in the analysis.
This format SHOULD BE FOLLOWED for all questions.

Example Input: {example_input}
Example Output: {example_output}

Begin!"""

prompt = ChatPromptTemplate.from_messages(
    [
        ("system", system_prompt),
        MessagesPlaceholder(variable_name="chat_history"),
        ("user", "{input}"),
        ("assistant", "Scratchpad: {agent_scratchpad}"),
    ]
)

llm_with_tools = llm.bind_tools(tools)
agent = create_react_agent(
    tools=tools,
    llm=llm,
    prompt=prompt,
)
agent_executor = AgentExecutor(
    agent=agent,
    tools=tools,
    return_intermediate_steps=True,
    handle_parsing_errors=True,
)


async def analyze_competitors_task(request_url: str):
    try:
        logger.info(f"Starting competitor analysis")

        # Scrape website data
        try:
            data = fcapp.scrape_url(request_url)
            logger.info(f"Successfully scraped website data")
        except Exception as e:
            logger.error(f"Failed to scrape URL: {str(e)}\n{traceback.format_exc()}")
            raise HTTPException(
                status_code=500, detail=f"Failed to scrape website: {str(e)}"
            )

        # Analyze website
        try:
            llmanalysis = analysis_model.generate_content(
                f"Scraped website data: {data}"
            )
            logger.info("Completed website analysis")
            logger.debug(f"Analysis result: {llmanalysis.text}")
        except Exception as e:
            logger.error(
                f"Failed to analyze website: {str(e)}\n{traceback.format_exc()}"
            )
            raise HTTPException(
                status_code=500, detail=f"Failed to analyze website: {str(e)}"
            )

        # Generate search queries
        try:
            queries = searchquery_model.generate_content(
                f"Company analysis: {llmanalysis}"
            )
            cleaned_queries = eval(
                queries.text.replace("```python", "").replace("```", "").strip()
            )
            logger.info(f"Generated {len(cleaned_queries)} search queries")
            logger.debug(f"Search queries: {cleaned_queries}")
        except Exception as e:
            logger.error(
                f"Failed to generate search queries: {str(e)}\n{traceback.format_exc()}"
            )
            raise HTTPException(
                status_code=500, detail=f"Failed to generate search queries: {str(e)}"
            )

        # Search for competitors
        setofresults = []
        try:
            for i, q in enumerate(cleaned_queries):
                params = {
                    "api_key": os.getenv("SERPAPI_KEY"),
                    "engine": "google",
                    "q": f"{q}",
                    "google_domain": "google.com",
                    "gl": "us",
                    "hl": "en",
                }
                url = "https://serpapi.com/search"
                response = requests.get(url, params=params)
                response.raise_for_status()  # Raise exception for bad status codes
                results = response.json()
                setofresults.append(results)
                logger.info(f"Completed search {i+1}/{len(cleaned_queries)}: {q}")
        except requests.exceptions.RequestException as e:
            logger.error(
                f"Failed to search competitors: {str(e)}\n{traceback.format_exc()}"
            )
            raise HTTPException(
                status_code=500, detail=f"Failed to search competitors: {str(e)}"
            )

        # Process results
        try:
            processed_results = []
            for result in setofresults:
                organic = result["organic_results"][:20]
                record = []
                for entry in organic:
                    record.append(
                        {
                            "title": entry["title"],
                            "link": entry["link"],
                            "snippet": entry["snippet"],
                        }
                    )
                processed_results.append(record)
            logger.info(f"Processed {len(processed_results)} search results")
            logger.debug(
                f"Processed results: {json.dumps(processed_results, indent=2)}"
            )
        except Exception as e:
            logger.error(
                f"Failed to process search results: {str(e)}\n{traceback.format_exc()}"
            )
            raise HTTPException(
                status_code=500, detail=f"Failed to process search results: {str(e)}"
            )

        # Find top competitors
        try:
            competitors = competitorfinder_model.generate_content(
                f"Company Data: {cleaned_queries}, Probable competitors: {processed_results}"
            )
            top_competitors = json.loads(competitors.text)
            logger.info(f"Identified {len(top_competitors)} top competitors")
            logger.debug(f"Top competitors: {json.dumps(top_competitors, indent=2)}")
        except Exception as e:
            logger.error(
                f"Failed to identify top competitors: {str(e)}\n{traceback.format_exc()}"
            )
            raise HTTPException(
                status_code=500, detail=f"Failed to identify top competitors: {str(e)}"
            )

        # Generate complete analysis
        complete_analysis = f"""
Based on our analysis, we identified the following key aspects:

Company Profile:
{llmanalysis.text}

Key Search Terms:
{', '.join(cleaned_queries)}

Top Competitors Overview:
{json.dumps(top_competitors, indent=2)}

This analysis provides a comprehensive view of the company's market position and its main competitors.
"""

        return CompetitorSearchResponse(
            competitors=top_competitors, analysis=complete_analysis
        )

    except HTTPException:
        raise
    except Exception as e:
        logger.error(
            f"Unexpected error during competitor analysis: {str(e)}\n{traceback.format_exc()}"
        )
        raise HTTPException(status_code=500, detail=f"Unexpected error: {str(e)}")


async def analyze_social_task(company_name: str):
    try:
        result = agent_executor.invoke(
            {
                "input": company_name,
                "chat_history": [],
                "agent_scratchpad": format_log_to_messages([]),
                "example_input": example_input,
                "example_output": example_output,
            }
        )
        parsed_json = extractor.generate_content(result["output"]).text
        return json.loads(parsed_json)
    except Exception as e:
        logger.error(f"Error in social analysis: {str(e)}")
        raise


@app.post("/unified-analysis")
async def unified_analysis(request: UnifiedRequest):
    try:
        # Run both analyses concurrently
        competitor_task = asyncio.create_task(analyze_competitors_task(request.url))
        social_task = asyncio.create_task(analyze_social_task(request.company_name))

        # Wait for both tasks to complete
        competitor_result, social_result = await asyncio.gather(
            competitor_task, social_task
        )

        return UnifiedResponse(
            competitors=competitor_result.competitors,
            analysis=competitor_result.analysis,
            social_analysis=social_result,
        )
    except Exception as e:
        logger.error(f"Error in unified analysis: {str(e)}\n{traceback.format_exc()}")
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/health")
async def health_check():
    return {"status": "healthy"}


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=8000)
