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
from fastapi.middleware.cors import CORSMiddleware

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
required_env_vars = ["GEMINI_KEY", "FIRECRAWL_KEY", "SERPAPI_KEY", "ASTRADB_KEY"]
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
app = FastAPI(title="Competitor Search API")

# Configure CORS
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

class CompetitorSearchRequest(BaseModel):
    url: str

class CompetitorSearchResponse(BaseModel):
    competitors: List[Dict]
    analysis: str

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
Return your data in a List of Strings format that is parsable in python. If a given list seems like a listicle, guide, blog, article, or video skip it entirely. Stuff like wikipedia, imdb, guides, youtube, reddit, quora are forbidden. include only companies."""

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
        generation_config=gemini_generation_config
    )

    searchquery_model = genai.GenerativeModel(
        model_name="gemini-exp-1206",
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

@app.post("/analyze-competitors", response_model=CompetitorSearchResponse)
async def analyze_competitors(request: CompetitorSearchRequest):
    try:
        logger.info(f"Starting competitor analysis")
        
        # Scrape website data
        try:
            data = fcapp.scrape_url(request.url)
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
                response.raise_for_status()  # Raise exception for bad status codes
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

        return CompetitorSearchResponse(
            competitors=top_competitors,
            analysis=complete_analysis
        )

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Unexpected error during competitor analysis: {str(e)}\n{traceback.format_exc()}")
        raise HTTPException(status_code=500, detail=f"Unexpected error: {str(e)}")

@app.get("/health")
async def health_check():
    return {"status": "healthy"} 