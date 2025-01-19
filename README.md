# Adgen, A Market Intelligence Platform

A comprehensive platform for gathering competitive intelligence, analyzing market positioning, and tracking social sentiment across multiple channels.

## Tech Stack

-   Next.js
-   FastAPI
-   Langchain
-   AstraDB
-   Firecrawl
-   SerpAPI
-   Gemini 1.5 Flash
-   YouTube Comments API
-   yt-dlp
-   Reddit API
-   WebVTT
-   Auth0

## 🏗️ System Architecture

```
market-intelligence-platform/
├── frontend/                 # Next.js Frontend Application
├── agent/                    # Python-based Analysis Agent
└── backend/                 # FastAPI Backend Service
```

### Frontend (Next.js)

-   Modern React-based web interface
-   Real-time data visualization
-   Interactive dashboards
-   Authentication and user management
-   Responsive design for all devices

### Agent Service

-   YouTube content analysis
-   Reddit sentiment analysis
-   Competitor tracking
-   Social media monitoring
-   Retention and engagement metrics
-   Ad performance analysis

### Backend API

-   FastAPI-based REST API
-   Competitor analysis endpoint
-   Social media analysis integration
-   Database management
-   Authentication and rate limiting
-   Logging and monitoring

## 🎯 Target Users

1. **Marketing Teams**

    - Track competitor advertising strategies
    - Analyze market positioning
    - Monitor brand sentiment

2. **Product Managers**

    - Research competitor features
    - Track market trends
    - Gather user feedback

3. **Business Analysts**

    - Generate market insights
    - Track industry movements
    - Analyze competitive landscape

4. **Startup Founders**
    - Research market opportunities
    - Analyze competition
    - Track industry trends

## 🔧 Problems Solved

1. **Market Research Automation**

    - Automates manual competitor research
    - Centralizes data from multiple sources
    - Provides real-time market insights

2. **Social Sentiment Analysis**

    - Tracks brand perception across platforms
    - Analyzes user feedback and comments
    - Monitors engagement metrics

3. **Competitive Intelligence**

    - Identifies direct competitors
    - Analyzes competitor strategies
    - Tracks market positioning

4. **Advertisement Optimization**
    - Analyzes ad performance
    - Tracks retention metrics
    - Provides actionable insights

## 🚀 Installation

### Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

### Agent Setup

```bash
cd agent
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
```

Required environment variables:

```env
GEMINI_API_KEY=your-gemini-key
COMMENTS_API_KEY=your-youtube-api-key
```

### Backend Setup

```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
```

Required environment variables:

```env
GEMINI_KEY=your-gemini-key
FIRECRAWL_KEY=your-firecrawl-key
SERPAPI_KEY=your-serpapi-key
ASTRADB_KEY=your-astradb-key
```

## 🔄 System Flow

1. User submits company URL and name through frontend
2. Backend processes request and initiates parallel analysis:
    - Competitor analysis via web scraping
    - Social media analysis via YouTube/Reddit
3. Agent processes social data and generates insights
4. Results are combined and returned to frontend
5. Frontend displays interactive visualizations

## 🔮 Future Scope

1. **Enhanced Analytics**

    - Machine learning for trend prediction
    - Advanced sentiment analysis
    - Real-time market monitoring
    - Custom insight generation

2. **Platform Expansion**

    - LinkedIn integration
    - Twitter analysis
    - Instagram monitoring
    - TikTok trend analysis

3. **Feature Additions**

    - Custom report generation
    - Email notifications
    - Alert systems
    - API access for enterprises

4. **Technical Improvements**
    - GraphQL implementation
    - Real-time WebSocket updates
    - Enhanced caching
    - Improved error handling

## 🔐 Security

-   JWT-based authentication
-   Rate limiting
-   Input validation
-   SQL injection protection
-   XSS prevention
