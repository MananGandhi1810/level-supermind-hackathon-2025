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
def get_url_data(url: str) -> str:
    """Returns data in HTML by scraping the url"""
    url = url.strip()
    print(f"Requesting URL: {url}")
    response = requests.get(url)
    data = response.content
    return data


@tool
def scrape_yt(url: str) -> str:
    """Get description and transcript for any youtube video"""
    ydl_opts = {
        "quiet": True,
        "skip_download": True,
        "writesubtitles": True,
        "writeautomaticsub": True,
        "writeinfojson": False,
    }

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
        return output


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
    model="gemini-2.0-flash-exp",
    api_key=os.environ.get("GEMINI_API_KEY"),
)
tools = [get_url_data, scrape_yt]
prompt = ChatPromptTemplate.from_messages(
    [
        (
            "system",
            """Answer the following questions as best you can. You have access to the following tools:
{tools}

YOU HAVE INTERNET ACCESS SO YOU CAN USE ANY TOOL THAT REQUIRES INTERNET ACCESS
SEARCH GOOGLE IF YOU NEED ANY HELP
Use the scrape_yt tool if you need to get the description and transcript of a youtube video
Provide https or http before the domain in the tool
Do not use get_url_data to search for youtube videos

Use the following format:

Question: the input question you must answer

Thought: you should always think about what to do

Action: the action to take, should be one of [{tool_names}]

Action Input: the input to the action

Observation: the result of the action

... (this Thought/Action/Action Input/Observation can repeat N times)

Thought: I now know the final answer

Final Answer: the final answer to the original input question

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
