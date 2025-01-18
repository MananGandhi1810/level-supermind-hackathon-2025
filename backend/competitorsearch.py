from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import List, Dict, Any
import google.generativeai as genai
import os
import requests
import json
import logging
from dotenv import load_dotenv
from firecrawl import FirecrawlApp

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Load environment variables
load_dotenv()

# Initialize FastAPI app
app = FastAPI(title="Competitor Search API")

# Configure Gemini
genai.configure(api_key=os.getenv("GEMINI_KEY"))
fcapp = FirecrawlApp(api_key=os.getenv("FIRECRAWL_KEY"))

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
    competitors: List[Dict[str, Any]]

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
that offers some products and/or services. Your job, is to, from this data give, construct 5 search queries that might result in companies that
do/offer similar products/services. focusing on what the given company does. essentially searching for potential competitors that offer similar products/services.
These 5 queries must distill the essence of their product, each query must be a distinct core value add that the company provides, and queries must not overlap.
Return your data in a List of Strings format that is parsable in python."""

competitorfinder_system_prompt = """You are a helpful assistant who has json mode enabled. Your responses will strictly be in json format. You will be given 1. the details of a company, 
these details represent the core purpose, features and USPs of a company. You will also be given 2. 15 links that are probably competitors. Here is your job:
Find the 5 top companies from the 15 probably competitors that most closely compete with the core values of the company initially mentioned in 1. Return your output as the records of the json
as seen in 2. (For example if you are given title link and snippet, return the same 3 of those top 5 companies)"""

# Initialize models
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

@app.post("/analyze-competitors", response_model=CompetitorSearchResponse)
async def analyze_competitors(request: CompetitorSearchRequest):
    try:
        logger.info(f"Starting competitor analysis for URL: {request.url}")
        
        # Scrape website data
        data = fcapp.scrape_url(request.url)
        logger.info("Successfully scraped website data")

        # Analyze website
        llmanalysis = analysis_model.generate_content(f"Scraped website data: {data}")
        logger.info("Completed website analysis")

        # Generate search queries
        queries = searchquery_model.generate_content(f"Company analysis: {llmanalysis}")
        cleaned_queries = eval(queries.text.replace('```python', '').replace('```', '').strip())
        logger.info(f"Generated {len(cleaned_queries)} search queries")

        # Search for competitors
        setofresults = []
        for q in cleaned_queries:
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
            results = response.json()
            setofresults.append(results)
        logger.info("Completed competitor search")

        # Process results
        processed_results = []
        for result in setofresults:
            organic = result["organic_results"][:3]
            record = []
            for entry in organic:
                record.append({
                    "title": entry["title"],
                    "link": entry["link"],
                    "snippet": entry["snippet"]
                })
            processed_results.append(record)
        logger.info("Processed search results")

        # Find top competitors
        competitors = competitorfinder_model.generate_content(
            f"Company Data: {cleaned_queries}, Probable competitors: {processed_results}"
        )
        top_competitors = json.loads(competitors.text)
        logger.info("Identified top competitors")

        return CompetitorSearchResponse(competitors=top_competitors)

    except Exception as e:
        logger.error(f"Error during competitor analysis: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000) 