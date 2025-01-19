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
- **AI Engine:** Gemini 1.5 Flash  

---

## System Architecture  

![image](https://github.com/user-attachments/assets/4fe1c3ab-3c89-441e-ab3a-740d0bbe196e)

Our architecture is simple, modular, and built to scale.  

```
market-intelligence-platform/
├── frontend/         # Next.js-based frontend
├── agent/            # Python-powered analysis module
└── backend/          # FastAPI backend service
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
- Tracks competitors and provides actionable intelligence on ads and retention metrics.  

---

### **Backend (FastAPI)**  

The backend API powers the platform with these capabilities:  
- Centralized endpoints for competitor and social analysis.  
- Seamless database management.  
- Secure and scalable with rate limiting, logging, and monitoring baked in.  

---

## Who’s Adgen For?  

Adgen is designed for teams and individuals who need to stay sharp in competitive markets:  

1. **Marketing Teams**  
   Track advertising strategies, monitor brand sentiment, and analyze competitors.  

2. **Product Managers**  
   Research features, track trends, and gather feedback to improve products.  

3. **Business Analysts**  
   Stay informed with market insights, industry trends, and competitor landscapes.  

4. **Startup Founders**  
   Understand your competition, identify market opportunities, and track industry shifts.  

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
2. The backend API processes the request and initiates various analyses:  
   - Web scraping for competitor insights.  
   - Social sentiment analysis via YouTube and Reddit.  
3. The agent processes raw data, identifies trends, and generates insights.  
4. Combined results are sent back to the frontend for display.  
5. Users interact with visualizations and detailed reports to take action.  

---

## What’s Next for Adgen?  

We’re not stopping here. Here’s what’s coming soon:  

### **Smarter Analytics**  
- Predict trends with AI.  
- Advanced social sentiment analysis.  
- Custom insight generation.  

### **Wider Platform Coverage**  
- Adding integrations with LinkedIn, Twitter, Instagram, and TikTok.  

### **New Features**  
- Customizable reports.  
- Notifications and alert systems.  
- **Video Ad Generation:** We’re working on a feature that will allow users to input a basic storyline, and Adgen will generate a video ad tailored to the concept.  

### **Technical Upgrades**  
- Introducing GraphQL for flexible querying.  
- Real-time updates via WebSockets.  
- Enhanced caching for faster performance.  

---

## Built with Security in Mind  

We take security seriously:  
- Rate-limiting to prevent abuse.  
- Input validation to avoid injection attacks.  
- XSS protection for a safe user experience.  

Adgen isn’t just a tool; it’s your partner in navigating the ever-changing business landscape. Try it out today!  

--- 
