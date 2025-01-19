# Adgen: The Market Intelligence Platform  

Adgen is your all-in-one platform to gather competitive intelligence, analyze market positioning, and track social sentiment across multiple channels—all in one place. Whether you're a marketer, product manager, or a founder trying to stay ahead of the game, Adgen makes it easy to access actionable insights.  

---

## Tech Stack  

We’ve chosen technologies that are reliable, scalable, and fast:  
- **Frontend:** Next.js  
- **Backend:** FastAPI  
- **AI & Data:** LangChain  
- **Database:** AstraDB  
- **Web Scraping:** Firecrawl  
- **APIs:** SerpAPI, YouTube Comments API, Reddit API  
- **Utilities:** yt-dlp, WebVTT  
- **Authentication:** Auth0  
- **AI Engine:** Gemini 2.0 Flash  

---

## System Architecture  

![image](https://github.com/user-attachments/assets/4fe1c3ab-3c89-441e-ab3a-740d0bbe196e)

Our architecture is simple, modular and easy to upgrade. 

```
market-intelligence-platform/
├── frontend/         # Next.js-based frontend
├── agent/            # Python-powered analysis module
└── backend/          # FastAPI based backendd + competitor mapping service
```  

---

### **Frontend (Next.js)**  

- Sleek, responsive interface built with modern React.  
- Features real-time data visualization and interactive dashboards.  
- Supports authentication, user management, and seamless device compatibility.  

---

### **Agent Service**  

The core engine behind Adgen handles heavy-duty analytics:  
- Analyzes YouTube content for trends and sentiment.  
- Monitors Reddit for user discussions and brand sentiment.  
- Tracks competitors and provides actionable intelligence.  

---

### **Backend (FastAPI)**  

The backend API powers the platform with these capabilities:  
- Centralized endpoints for competitor and social analysis.  
- Seamless database management.  
- Secure and scalable with logging, and monitoring baked in.  

---

## Who’s Adgen For?  

Adgen is designed for teams and individuals who need to stay sharp in competitive markets:  

1. **Marketing Teams**  
   Track sentiment, and analyze competitors.  

2. **Product Managers**  
   Research features, and gather feedback to improve products.  

3. **Business Analysts**  
   Stay informed with competitor landscapes.  

4. **Startup Founders**  
   Understand your competition, identify how you can distinguish yourself.

---

## Real Problems We Solve  

1. **Simplifying Market Research**  
   Say goodbye to manual data collection. Adgen centralizes information from various sources and provides real-time insights.  

2. **Social Sentiment at Scale**  
   Monitor your brand's perception and engagement metrics across platforms like YouTube and Reddit.  

3. **Competitive Intelligence That Works**  
   Identify key competitors, analyze their strategies, and understand your market position.  

4. **Optimize Ad Campaigns**  
   Evaluate ad performance, track retention, and gain actionable feedback to improve ROI.  

---

## Installation Guide  

### Frontend  

```bash
cd frontend  
npm install  
npm run dev  
```  

### Agent  

```bash
cd agent  
python -m venv venv  
source venv/bin/activate  # For Windows: venv\Scripts\activate  
pip install -r requirements.txt  
```  

### Backend  

```bash
cd backend  
python -m venv venv  
source venv/bin/activate  # For Windows: venv\Scripts\activate  
pip install -r requirements.txt  
```  

## How It Works  

1. User submits a company name and URL through the frontend.  
2. The backend API processes the request and initiates various analyses, using Agentic RAG:  
   - Agent 1: Scraping your website for insights on customer pain points 
   - Agent 2: Discovering and scraping competitor websites, finding their pain points.
3. The agent processes raw data, and generates insights.  
4. Combined results are sent back to the frontend for display.  
5. Users interact with visualizations and detailed reports to take action.  

---

## What’s Next for Adgen?  

Here’s what’s we can upgrade:

### **Smarter Analytics**  
- Advanced social sentiment analysis.  
- Custom insight generation.  

### **New Features**  
- Customizable reports.  
- Notifications and alert systems.  
- Storyboarding: We can work on a feature that will allow users to input a basic storyline, and Adgen will generate a storyboard tailored to their concept

### **Technical Upgrades**  
- Enhanced caching for faster performance.
- Custom reddit and youtube scraping agents to bypass blocking 


Adgen isn’t just a tool; it’s your partner in navigating the ever-changing business landscape. Try it out today!  

--- 
