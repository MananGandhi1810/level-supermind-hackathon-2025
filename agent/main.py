import os
import requests
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain.agents import tool
from langchain.agents import AgentExecutor, create_react_agent
from langchain_core.messages import AIMessage, HumanMessage
from dotenv import load_dotenv
from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder
import yt_dlp
import webvtt
import io


@tool
def scrape_url(url: str) -> str:
    """
    Returns data in HTML by scraping the url. Provide full link: https://{domain}/{path(s)}
    """
    url = url.strip()
    print(f"Requesting URL: {url}")
    response = requests.get(url)
    return response.content


@tool
def scrape_yt(url: str) -> str:
    """
    Get description and transcript for any youtube video. Provide full link: https://youtube.com/watch?v={videoId}
    """
    print(f"Scraping YouTube: {url}")

    ydl_opts = {
        "quiet": True,
        "skip_download": True,
        "writesubtitles": True,
        "writeautomaticsub": True,
        "writeinfojson": False,
    }

    try:
        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            info = ydl.extract_info(url, download=False)

            description = info.get("description", "No description available.")

            subtitles = info.get("requested_subtitles", {})
            en_subtitle = subtitles.get("en") or subtitles.get("en-auto")
            transcript = ""

            if en_subtitle:
                subtitle_url = en_subtitle["url"]
                subtitle_content = ydl.urlopen(subtitle_url).read().decode("utf-8")

                vtt = webvtt.read_buffer(io.StringIO(subtitle_content))
                lines = []
                for line in vtt:
                    lines.extend(line.text.strip().splitlines())

                seen = set()
                for line in lines:
                    if line not in seen:
                        transcript += " " + line
                        seen.add(line)
            else:
                transcript = "No English subtitles available."

            output = f"""Transcript:         
        {transcript}
        ---------------------------------------
        ---------------------------------------
        ---------------------------------------
        Description:
        {description}
        """
    except:
        return "Some error occured when trying to scrape this youtube video"
    return output


@tool
def scrape_reddit(subreddit: str) -> dict:
    """
    Extract top 10 posts from a subreddit with its top 10 comments using the subreddit name. Only provide subreddit name without r/
    """
    subreddit = subreddit.strip().replace("\n", "")
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
            output[i] = {
                "title": data["data"]["children"][i]["data"]["title"],
                "description": data["data"]["children"][i]["data"]["selftext"],
                "url": "https://www.reddit.com"
                + data["data"]["children"][i]["data"]["permalink"],
                "upvote_ratio": data["data"]["children"][i]["data"]["upvote_ratio"],
                "comments": {},
            }
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


@tool
def search_youtube(search_query: str) -> dict:
    """
    Search for a query on YouTube and return the top 5 results as a dictionary.
    """
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
            # Search for the query on YouTube
            result = ydl.extract_info(f"ytsearch50:{search_query}", download=False)
            videos = result.get("entries", [])

            # Sort the videos based on view count and get the top 5
            sorted_videos = sorted(
                videos, key=lambda x: x.get("view_count", 0), reverse=True
            )

            # Create a dictionary for the top 5 videos
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


load_dotenv()
llm = ChatGoogleGenerativeAI(
    model="gemini-1.5-flash",
    api_key=os.environ.get("GEMINI_API_KEY"),
)
tools = [scrape_url, scrape_yt, search_youtube, scrape_reddit]
prompt = ChatPromptTemplate.from_messages(
    [
        (
            "system",
            """JSON MODE ON
Answer the following questions as best you can. You have access to the following tools:
{tools}

USE the scrape_url tool ot search for any URL
USE the scrape_yt tool if you need to get the description and transcript of a youtube video
USE the scrape_reddit tool to get data from subreddits
USE the search_youtube tool to get a list of youtube videos related to the search query
DO NOT USE scrape_url to search for youtube videos at all or else the 
DO NOT auto-generate youtube video IDs
DO NOT call the search_youtube tool more than 2 times

You are an ad-bot which can process data about a company based on the reddit reviews, youtube video description and transcript and the trustpilot reviews.
You need to search for advertisements on youtube sponsored by the company, and get relevant results and insights
Search for 2 company-created advertisements/commercials, and 2 sponsored videos by the company
Generate an advertisement story-line and a hook to create an advertisement for a company in the similar field

Always give a verbose response to the user

To get data about a company sponsoring a video:
1. Search YouTube using the search_youtube tool
2. Check the description and transcript for the resultant videos, and if they actually sponsor the video using the scrape_yt tool
3. If the video is sponsored by the company, redo the process if multiple results are required. If not, check back for another video
ONLY follow this process and no other way

Always search *YouTube, Reddit, and TrustPilot* before responding to the user

SEARCH GOOGLE IF YOU NEED ANY HELP

Use the following format:

Question: the input question you must answer

Thought: you should always think about what to do

Action: the action to take, should be one of [{tool_names}]

Action Input: the input to the action

Observation: the result of the action

... (this Thought/Action/Action Input/Observation can repeat N times)

Thought: I now know the final answer

Final Answer: the final answer to the original input question. The final output SHOULD be in JSON
reddit: provide analysis using reddit,
youtube: provide youtube video links (compulsory) sponsored by the company along with an analysis (at least 2 videos as a list),
user_pain_points: provide user pain points related to the product based on user feedback
trustpilot: provide analysis of the reviews from trustpilot
ad_storyline: provide a storyline with a hook for the advertisement

Begin!""",
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

chat_history = []
agent_scratchpad = format_log_to_messages([])
while True:
    message = input("> ")
    if message == "exit":
        break
    result = agent_executor.invoke(
        {
            "input": message,
            "chat_history": chat_history,
        }
    )
    print(result["output"])
    chat_history.extend(
        [
            HumanMessage(content=message),
            AIMessage(content=result["output"]),
        ]
    )
