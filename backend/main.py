from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import List, Dict, Any
import google.generativeai as genai
import os
import requests
import json
import logging
import traceback
from dotenv import load_dotenv
from firecrawl import FirecrawlApp
from astrapy import DataAPIClient
import asyncio
import yt_dlp
import webvtt
import io
import numpy as np
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain.agents import tool, AgentExecutor, create_react_agent
from langchain_core.messages import AIMessage, HumanMessage
from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder

# Configure detailed logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - [%(filename)s:%(lineno)d] - %(message)s',
    handlers=[
        logging.FileHandler('app.log'),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

# Load environment variables
load_dotenv()
required_env_vars = ["GEMINI_KEY", "FIRECRAWL_KEY", "SERPAPI_KEY", "ASTRADB_KEY", "COMMENTS_API_KEY"]
for var in required_env_vars:
    if not os.getenv(var):
        logger.critical(f"Missing required environment variable: {var}")
        raise EnvironmentError(f"Missing required environment variable: {var}")

#Initialize AstraDB
client = DataAPIClient(os.getenv("ASTRADB_KEY"))
db = client.get_database_by_api_endpoint(
  "https://76def820-552c-4b62-a2de-db7646bb920a-us-east1.apps.astra.datastax.com"
)

print(f"Connected to Astra DB: {db.list_collection_names()}")
# Initialize FastAPI app
app = FastAPI(title="Market Analysis API")

try:
    # Configure Gemini
    genai.configure(api_key=os.getenv("GEMINI_KEY"))
    fcapp = FirecrawlApp(api_key=os.getenv("FIRECRAWL_KEY"))
    logger.info("Successfully initialized Gemini and Firecrawl")
except Exception as e:
    logger.critical(f"Failed to initialize core services: {str(e)}\n{traceback.format_exc()}")
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
class SearchQueries(BaseModel):
    queries: List[str]

class MarketAnalysisRequest(BaseModel):
    url: str
    company_name: str

class MarketAnalysisResponse(BaseModel):
    competitors: List[Dict]
    competitor_analysis: str
    ad_analysis: Dict[str, Any]

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

# Initialize Gemini models for competitor analysis
try:
    analysis_model = genai.GenerativeModel(
        model_name="gemini-2.0-flash-exp",
        system_instruction=analysis_system_prompt,
        generation_config=gemini_generation_config
    )

    searchquery_model = genai.GenerativeModel(
        model_name="gemini-2.0-flash-exp",
        generation_config=gemini_generation_config,
        system_instruction=searchquery_system_prompt,
    )

    competitorfinder_model = genai.GenerativeModel(
        model_name="gemini-2.0-flash-exp",
        system_instruction=competitorfinder_system_prompt,
        generation_config=structured_gemini_generation_config
    )
    logger.info("Successfully initialized all Gemini models")
except Exception as e:
    logger.critical(f"Failed to initialize Gemini models: {str(e)}\n{traceback.format_exc()}")
    raise

# Agent tools for ad analysis
@tool
def scrape_url(url: str) -> str:
    """
    Returns data in HTML by scraping the url. Provide full link: https://{domain}/{path(s)}
    """
    url = url.strip().replace("\n", "").replace("'", "").replace('"', "")
    print(f"Requesting URL: {url}")
    response = requests.get(url)
    return response.content

@tool
def scrape_yt(url: str) -> str:
    """
    Get description and transcript for any youtube video. Provide full link: https://youtube.com/watch?v={videoId}
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

            # Calculate Sponsorship Retention Ratio
            if retention_data:
                sponsor_retention = []
                non_sponsor_retention = []
                for segment in sponsor_segments:
                    start, end = segment["segment"]
                    for retention in retention_data:
                        if start <= retention["start_time"] and end >= retention["end_time"]:
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
            # Get English subtitles
            en_subtitle = info.get("requested_subtitles", {}).get("en") or info.get(
                "requested_subtitles", {}
            ).get("en-auto")

            # Process sponsor transcript from subtitles
            if en_subtitle and sponsor_segments:
                subtitle_url = en_subtitle["url"]
                subtitle_content = ydl.urlopen(subtitle_url).read().decode("utf-8")
                vtt = webvtt.read_buffer(io.StringIO(subtitle_content))

                seen_lines = set()
                for segment in sponsor_segments:
                    start, end = segment["segment"]
                    for caption in vtt:
                        if start <= caption.start_in_seconds <= end or start <= caption.end_in_seconds <= end:
                            for line in caption.text.strip().splitlines():
                                if line not in seen_lines:
                                    output["Sponsor Transcript"] += line + " "
                                    seen_lines.add(line)
            else:
                output["Sponsor Transcript"] = "No sponsor segments or English subtitles available."
        except:
            output["Sponsor Transcript"] = "No sponsor segments or English subtitles available."

        try:
            # Get comments
            video_id = url.split("=")[-1]
            params = {
                "part": "snippet",
                "videoId": video_id,
                "maxResults": "50",
                "textFormat": "plainText",
                "key": os.environ.get("COMMENTS_API_KEY"),
            }

            response = requests.get(
                "https://www.googleapis.com/youtube/v3/commentThreads",
                params=params,
                headers={"Referer": "https://ytcomment.kmcat.uk/"},
            )

            # Extract comments
            output["Comments"] = [
                comment["snippet"]["topLevelComment"]["snippet"]["textDisplay"].strip()
                for comment in response.json().get("items", [])
            ]
        except:
            output["Comments"] = []

        return output

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
                    "url": "https://www.reddit.com" + data["data"]["children"][i]["data"]["permalink"],
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
                                "text": data[1]["data"]["children"][j]["data"]["replies"]["data"]["children"][k]["data"]["body"],
                                "upvotes": data[1]["data"]["children"][j]["data"]["replies"]["data"]["children"][k]["data"]["ups"],
                            }
                    except:
                        pass
            except Exception as e:
                pass
        else:
            print("Failed to fetch comments from Reddit")
            print(r.status_code)

    return output

@tool
def search_youtube(search_query: str) -> dict:
    """
    Search for a query on YouTube and return the top 5 results as a dictionary.
    """
    search_query = search_query.strip().replace("\n", "").replace("'", "").replace('"', "")
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
            result = ydl.extract_info(f"ytsearch50:{search_query}", download=False)
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

def format_log_to_messages(intermediate_steps):
    """Construct the scratchpad that lets the agent continue its thought process."""
    thoughts = []
    for action, observation in intermediate_steps:
        thoughts.append(AIMessage(content=action.log))
        human_message = HumanMessage(content=f"Observation: {observation}")
        thoughts.append(human_message)
    return thoughts

# Initialize the ad analysis agent
load_dotenv()
llm = ChatGoogleGenerativeAI(
    model="gemini-1.0-pro",
    api_key=os.environ.get("GEMINI_KEY"),
)
tools = [scrape_url, scrape_yt, search_youtube, scrape_reddit]
prompt = ChatPromptTemplate.from_messages(
    [
        (
            "system",
            """{
  "mode": "JSON",
  "instructions": "Answer all questions with detailed, data-backed insights and numerical metrics. Extract, analyze, and compare measurable outcomes from YouTube, Reddit, and TrustPilot. Every platform’s analysis must contain precise numbers, percentages, and comparative benchmarks. Focus on actionable insights backed by granular metrics.",
  "tools": "{tools}",
  "rules": [
    { "id": 1, "rule": "Use scrape_url for extracting data from specific URLs only." },
    { "id": 2, "rule": "Use scrape_yt to analyze video descriptions, transcripts, retention metrics, and audience engagement." },
    { "id": 3, "rule": "Use scrape_reddit to collect subreddit data and identify recurring themes with percentages." },
    { "id": 4, "rule": "Use search_youtube to find videos using refined queries. Limit to 2 calls per task." },
    { "id": 5, "rule": "Do not use scrape_url for YouTube video searches." },
    { "id": 6, "rule": "Do not auto-generate YouTube video IDs." },
    { "id": 7, "rule": "Exclude YouTube Shorts from the analysis." }
  ],
  "objective": "Your role is to gather and analyze company-related insights through YouTube, Reddit, and TrustPilot data. Prioritize measurable, numbers-driven insights to highlight trends, identify user pain points, and propose data-backed advertisement strategies.",
  "tasks": [
    {
      "id": "query_refinement",
      "description": "Generate at least 5 refined YouTube search queries for the company or product, using specific keywords. Each query must be distinct and designed to maximize relevant results."
    },
    {
      "id": "youtube_analysis",
      "description": "Search for 4 videos (2 advertisements, 2 sponsored videos) using refined queries. Analyze video retention, watch times, likes, dislikes, comments, and timestamps with the highest retention percentages. Provide a full breakdown of retention patterns, comparing retention hotspots."
    },
    {
      "id": "reddit_analysis",
      "description": "Analyze subreddit discussions with metrics like the total number of posts, comments per post, upvotes, and sentiment polarity. Identify common pain points or praises with percentages of mentions and recurring keywords."
    },
    {
      "id": "trustpilot_analysis",
      "description": "Review TrustPilot feedback to calculate satisfaction rates, percentage breakdown of review types, and common trends. Compare the company’s ratings with industry averages and highlight strengths or weaknesses numerically."
    },
    {
      "id": "ad_storyline",
      "description": "Develop a storyline for a new ad campaign based on data insights. Use timestamps from YouTube retention, pain points from Reddit, and numerical claims from TrustPilot to make the ad relatable and impactful."
    }
  ],
  "process": [
    {
      "step": 1,
      "action": "Search YouTube for videos.",
      "instructions": [
        "Generate 5 specific search queries like '[company name] ad 2024', '[product name] sponsored review', '[company name] best commercial', etc.",
        "Use search_youtube to find relevant videos.",
        "Use scrape_yt to extract and analyze audience retention graphs, engagement stats, timestamps with highest retention percentages, and engagement comparisons."
      ]
    },
    {
      "step": 2,
      "action": "Analyze Reddit data.",
      "instructions": [
        "Search for subreddit posts related to the company or product.",
        "Quantify total posts, average upvotes, sentiment polarity (e.g., 70% positive), and frequently mentioned phrases or themes (e.g., 'fast delivery' mentioned in 25% of posts).",
        "Highlight recurring complaints or praises with percentages."
      ]
    },
    {
      "step": 3,
      "action": "Analyze TrustPilot reviews.",
      "instructions": [
        "Calculate the company’s average rating, breakdown of review types (e.g., 30% positive, 50% neutral, 20% negative), and comparison with competitors.",
        "Highlight recurring feedback themes numerically (e.g., 'poor customer service' mentioned in 18% of reviews)."
      ]
    },
    {
      "step": 4,
      "action": "Propose ad improvements.",
      "instructions": [
        "Use retention hotspots from YouTube data to structure the ad.",
        "Address user pain points identified in Reddit and TrustPilot reviews.",
        "Integrate precise metrics (e.g., '89% of users recommend X') to build trust."
      ]
    }
  ],
  "response_structure": {
    "question": "The input question you must answer.",
    "thought": "Detailed reasoning behind your approach.",
    "action": "Action taken, specifying the tool used.",
    "action_input": "Input provided for the action.",
    "observation": "Result of the action.",
    "final_answer": {
      "query_suggestions": [
        "List of 5 refined YouTube search queries."
      ],
      "youtube": {
        "videos": [
          {
            "title": "Video title",
            "url": "Video URL",
            "metrics": {
              "views": "Number of views",
              "likes": "Number of likes",
              "dislikes": "Number of dislikes",
              "comments": "Number of comments",
              "retention_hotspots": [
                {
                  "time": "Timestamp (e.g., 2:10)",
                  "retention_percentage": "Percentage of audience retained."
                }
              ],
              "watch_time_analysis": {
                "average_watch_time": "Average watch time in minutes/seconds.",
                "completion_rate": "Percentage of viewers who finish the video."
              }
            }
          }
        ],
        "engagement_comparison": "Comparative analysis of engagement metrics across videos."
      },
      "reddit": {
        "total_posts": "Total number of posts mentioning the company or product.",
        "average_upvotes": "Average upvotes per post.",
        "common_themes": [
          {
            "theme": "Recurring theme or complaint",
            "percentage_mentions": "Percentage of posts mentioning this theme."
          }
        ],
        "sentiment_breakdown": {
          "positive": "Percentage of posts with positive sentiment.",
          "negative": "Percentage of posts with negative sentiment."
        }
      },
      "trustpilot": {
        "average_rating": "Company's average rating.",
        "review_distribution": {
          "positive": "Percentage of positive reviews.",
          "neutral": "Percentage of neutral reviews.",
          "negative": "Percentage of negative reviews."
        },
        "common_feedback": [
          {
            "feedback": "Specific praise or complaint",
            "percentage_mentions": "Percentage of reviews mentioning this."
          }
        ],
        "industry_comparison": "How the company’s rating compares to competitors."
      },
      "ad_storyline": {
        "hook": "Catchy opening line based on insights.",
        "main_message": "Key points addressing user pain points and leveraging strengths.",
        "data_integration": "Numerical data used in the ad to build credibility (e.g., '89% customer satisfaction')."
      }
    }
  }
}""",
        ),
        MessagesPlaceholder(variable_name="chat_history"),
        ("user", "User: {input}"),
        ("ai", "Scratchpad: {agent_scratchpad}"),
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

# Competitor analysis function
async def analyze_competitors(url: str):
    try:
        logger.info(f"Starting competitor analysis")
        
        # Scrape website data
        try:
            data = fcapp.scrape_url(url)
            logger.info(f"Successfully scraped website data")
        except Exception as e:
            logger.error(f"Failed to scrape URL: {str(e)}\n{traceback.format_exc()}")
            raise HTTPException(status_code=500, detail=f"Failed to scrape website: {str(e)}")

        # Analyze website
        try:
            llmanalysis = analysis_model.generate_content(f"Scraped website data: {data}")
            logger.info("Completed website analysis")
            logger.debug(f"Analysis result: {llmanalysis.text}")
        except Exception as e:
            logger.error(f"Failed to analyze website: {str(e)}\n{traceback.format_exc()}")
            raise HTTPException(status_code=500, detail=f"Failed to analyze website: {str(e)}")

        # Generate search queries
        try:
            queries = searchquery_model.generate_content(f"Company analysis: {llmanalysis}")
            cleaned_queries = eval(queries.text.replace('```python', '').replace('```', '').strip())
            logger.info(f"Generated {len(cleaned_queries)} search queries")
            logger.debug(f"Search queries: {cleaned_queries}")
        except Exception as e:
            logger.error(f"Failed to generate search queries: {str(e)}\n{traceback.format_exc()}")
            raise HTTPException(status_code=500, detail=f"Failed to generate search queries: {str(e)}")

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
                    "hl": "en"
                }
                url = "https://serpapi.com/search"
                response = requests.get(url, params=params)
                response.raise_for_status()
                results = response.json()
                setofresults.append(results)
                logger.info(f"Completed search {i+1}/{len(cleaned_queries)}: {q}")
        except requests.exceptions.RequestException as e:
            logger.error(f"Failed to search competitors: {str(e)}\n{traceback.format_exc()}")
            raise HTTPException(status_code=500, detail=f"Failed to search competitors: {str(e)}")

        # Process results
        try:
            processed_results = []
            for result in setofresults:
                organic = result["organic_results"][:20]
                record = []
                for entry in organic:
                    record.append({
                        "title": entry["title"],
                        "link": entry["link"],
                        "snippet": entry["snippet"]
                    })
                processed_results.append(record)
            logger.info(f"Processed {len(processed_results)} search results")
            logger.debug(f"Processed results: {json.dumps(processed_results, indent=2)}")
        except Exception as e:
            logger.error(f"Failed to process search results: {str(e)}\n{traceback.format_exc()}")
            raise HTTPException(status_code=500, detail=f"Failed to process search results: {str(e)}")

        # Find top competitors
        try:
            competitors = competitorfinder_model.generate_content(
                f"Company Data: {cleaned_queries}, Probable competitors: {processed_results}"
            )
            top_competitors = json.loads(competitors.text)
            logger.info(f"Identified {len(top_competitors)} top competitors")
            logger.debug(f"Top competitors: {json.dumps(top_competitors, indent=2)}")
        except Exception as e:
            logger.error(f"Failed to identify top competitors: {str(e)}\n{traceback.format_exc()}")
            raise HTTPException(status_code=500, detail=f"Failed to identify top competitors: {str(e)}")

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

        return {
            "competitors": top_competitors,
            "analysis": complete_analysis
        }

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Unexpected error during competitor analysis: {str(e)}\n{traceback.format_exc()}")
        raise HTTPException(status_code=500, detail=f"Unexpected error: {str(e)}")

# Ad analysis function
async def analyze_ads(company_name: str):
    try:
        result = agent_executor.invoke(
            {
                "input": company_name,
                "chat_history": [],
                "agent_scratchpad": format_log_to_messages([]),
            }
        )
        return json.loads(result["output"].replace("```json", "").replace("```", "").strip("\"").strip("'").replace("\\n", ""))
    except Exception as e:
        logger.error(f"Failed to analyze ads: {str(e)}\n{traceback.format_exc()}")
        raise HTTPException(status_code=500, detail=f"Failed to analyze ads: {str(e)}")

# Combined market analysis endpoint
@app.post("/analyze-market", response_model=MarketAnalysisResponse)
async def analyze_market(request: MarketAnalysisRequest):
    try:
        # Run both analyses concurrently
        competitor_task = asyncio.create_task(analyze_competitors(request.url))
        ad_task = asyncio.create_task(analyze_ads(request.company_name))
        
        # Wait for both tasks to complete
        competitor_results, ad_results = await asyncio.gather(competitor_task, ad_task)
        
        return MarketAnalysisResponse(
            competitors=competitor_results["competitors"],
            competitor_analysis=competitor_results["analysis"],
            ad_analysis=ad_results
        )
    except Exception as e:
        logger.error(f"Failed to perform market analysis: {str(e)}\n{traceback.format_exc()}")
        raise HTTPException(status_code=500, detail=f"Failed to perform market analysis: {str(e)}")

@app.get("/health")
async def health_check():
    return {"status": "healthy"}