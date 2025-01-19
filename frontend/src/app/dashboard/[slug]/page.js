"use client";

import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ScrollArea } from "@/components/ui/scroll-area";
import { AlertCircle, Star, ThumbsDown, Youtube } from "lucide-react";
import { useEffect, useState } from "react";
import { useUser } from "@auth0/nextjs-auth0";

export default function CompanyProjectPage({ slug }) {
    const { user } = useUser();
    console.log(user);
    // Extract YouTube metrics for the stats card
    const [data, setData] = useState({
        competitors: [
            {
                title: "Harmonic.ai - The complete startup database",
                link: "https://www.harmonic.ai/",
                snippet:
                    "Our ever-growing database of 20M+ companies and 160M+ people ensures you're never missing an opportunity. Create, tune and save hyper-specific searches.",
            },
            {
                title: "Access 4.7M+ Startups & Scaleups | StartUs Insights Platform",
                link: "https://www.startus-insights.com/startus-insights-platform/",
                snippet:
                    "Dive into the world of innovation with the Big Data and AI-powered Discovery Platform, where discovering startups, technologies, and market trends is not just ...",
            },
            {
                title: "Deal Sourcing Tools for VC Investors",
                link: "https://www.vcstack.io/category/deal-sourcing",
                snippet:
                    "We build a data-driven deal sourcing & due diligence engine for VC investors. OurCrowd. Democratizing access to private equity investing.",
            },
            {
                title: "A Guide to Venture Capital Deal Sourcing",
                link: "https://www.cyndx.com/resources/blog/venture-capital-deal-sourcing/",
                snippet:
                    "Cyndx Finder is an AI-enriched deal origination platform designed to empower venture capitalists in navigating the complex landscape of global ...",
            },
            {
                title: "Startup Fundraising Platform | FundrsVC",
                link: "https://fundrs.vc/",
                snippet:
                    "FundrsVC offers a comprehensive and user-friendly platform that helps startup founders and early-stage investors navigate the fundraising process.",
            },
            {
                title: "Fundable | Startup Fundraising Platform",
                link: "https://www.fundable.com/",
                snippet:
                    "Startup Fundraising Platform. Start and manage a professional fundraise to attract quality accredited investors.",
            },
        ],
        analysis:
            '\nBased on our analysis, we identified the following key aspects:\n\nCompany Profile:\nOkay, here\'s my analysis of the provided website data for RaiseGate:\n\n*1. Product/Service Categories:\n\n   *Core Service:* RaiseGate is a platform connecting startups seeking funding with Venture Capital (VC) firms and angel investors. It\'s a marketplace or matchmaking service.\n*   *AI-Powered Startup Discovery:\n    *   **Description:* Uses AI (Scout AI) to help investors discover startups that fit their investment criteria, eliminating manual research on platforms like LinkedIn and Twitter.\n    *   *Specifics:* Curates leads and streamlines the search for VCs.\n*   *Streamlined Data Rooms:\n    *   **Description:* Provides a secure and controlled environment for sharing information like pitch decks between startups and VCs.\n    *   *Specifics:* VCs can request pitch decks, and startups approve or decline, maintaining control.\n*   *Demo Videos:\n    *   **Description:* Allows startups to showcase their products and ideas directly to investors through dynamic videos.\n    *   *Specifics:* Helps investors quickly assess viability and potential.\n*   *Comprehensive Profiles:\n    *   **Description:* Detailed company information, team, market insights, business models, demo videos, and investment theses for each startup.\n*   *Deck Requests:\n    *   **Description:* Direct request functionality from VCs to startups for pitch decks, with startup approval needed.\n*   *Service Descriptions:\n    *   **For Startups:* Platform for visibility, access to investors, streamlined fundraising and access to mentorship/strategic advice.\n    *  *For Investors:* Access to curated startups, AI-powered discovery, time-saving tools, initial due diligence support.\n*   *Industry-Specific Terminology:\n    *   Venture Capital (VC)\n    *   Angel Investors\n    *   Startup\n    *   Pitch Decks\n    *   Data Room\n    *   Investment Criteria\n    *   Fundraising\n    *   Due Diligence\n    *   Investment Portfolio\n  *Target Market Segments:\n    *   Startups seeking funding (across various domains, including deep tech and consumer products).\n    *   Venture Capital Firms and Angel Investors.\n   *Core Problems Solved:\n    *   **For Startups:* Difficulty in reaching and being discovered by the right investors. Inefficiencies in the traditional fundraising process.\n    *   *For Investors:* Time-consuming manual scouting for startups. Difficulty in quickly assessing startup potential.\n    *   *Overall:* Connecting suitable startups with investors efficiently.\n\n*2. Business Model Identifiers:\n\n   *Pricing Structure Hints:\n    *   "No contracts, no hidden costs" - Suggests a possible subscription or usage-based model. However, specific pricing is not mentioned.\n    *  The statement "just tell us what you need and we\'ll deliver accordingly" suggests a potentially tailored pricing approach.\n   *Target Customer Size:\n    *   Targets both early-stage and potentially later stage startups, indicated by "from various domains".\n    *   Targets VC firms and Angel investors, implying a focus on those who make investments in startups.\n  *Sales Model:\n    *   Primarily a platform/marketplace model, connecting two distinct user groups (startups and investors).\n    *  Uses the concept of membership and early access. The platform also heavily promotes applying and joining.\n    *   Potentially, they have a freemium or subscription model (not explicitly stated).\n\n3. Market Positioning:\n\n   *Key Value Propositions:\n    *   **For Startups:* Increased visibility to a curated audience of investors, faster fundraising, and access to strategic resources.\n        *   "Be discovered by the leading VC firms and angel investors"\n        *  "60% Faster than going the traditional way"\n        *  "Grow Strategically"\n    *   *For Investors:* Streamlined, efficient startup discovery powered by AI, access to pre-vetted startups, saving time and effort in the sourcing process.\n        *  "Look through our curated assortment of startups"\n        *  "100+ We interview more than 100 startups every week"\n    *   *Overall:* A "cutting edge" solution, efficient, time-saving, and effective matchmaking platform.\n*   *Mission Statements (Implied):\n    *   To simplify and expedite the fundraising process for startups.\n    *   To enable VCs and angel investors to discover promising startups more efficiently.\n    * To streamline the connection of promising startups with capital.\n   *Partner Ecosystem (Implied):\n    *   VC Firms\n    *   Angel Investors\n    *   Startups from various sectors\n\nSummary:*\n\nRaiseGate positions itself as an AI-powered platform aimed at disrupting the traditional fundraising and deal sourcing process. It targets both startups seeking capital and investors seeking promising companies. Its core value proposition is to create a more efficient, streamlined, and data-driven experience for both sides of the equation. The website content focuses on highlighting the time-saving, curated, and direct approach the platform takes, differentiating it from manual and more cumbersome methods. They emphasize the use of technology like AI and the structure of data rooms to make their offering attractive.\n\n\nKey Search Terms:\nAI powered startup discovery platform, Venture capital deal sourcing platform, Startup fundraising platform\n\nTop Competitors Overview:\n[\n  {\n    "title": "Harmonic.ai - The complete startup database",\n    "link": "https://www.harmonic.ai/",\n    "snippet": "Our ever-growing database of 20M+ companies and 160M+ people ensures you\'re never missing an opportunity. Create, tune and save hyper-specific searches."\n  },\n  {\n    "title": "Access 4.7M+ Startups & Scaleups | StartUs Insights Platform",\n    "link": "https://www.startus-insights.com/startus-insights-platform/",\n    "snippet": "Dive into the world of innovation with the Big Data and AI-powered Discovery Platform, where discovering startups, technologies, and market trends is not just ..."\n  },\n  {\n    "title": "Deal Sourcing Tools for VC Investors",\n    "link": "https://www.vcstack.io/category/deal-sourcing",\n    "snippet": "We build a data-driven deal sourcing & due diligence engine for VC investors. OurCrowd. Democratizing access to private equity investing."\n  },\n  {\n    "title": "A Guide to Venture Capital Deal Sourcing",\n    "link": "https://www.cyndx.com/resources/blog/venture-capital-deal-sourcing/",\n    "snippet": "Cyndx Finder is an AI-enriched deal origination platform designed to empower venture capitalists in navigating the complex landscape of global ..."\n  },\n  {\n    "title": "Startup Fundraising Platform | FundrsVC",\n    "link": "https://fundrs.vc/",\n    "snippet": "FundrsVC offers a comprehensive and user-friendly platform that helps startup founders and early-stage investors navigate the fundraising process."\n  },\n  {\n    "title": "Fundable | Startup Fundraising Platform",\n    "link": "https://www.fundable.com/",\n    "snippet": "Startup Fundraising Platform. Start and manage a professional fundraise to attract quality accredited investors."\n  }\n]\n\nThis analysis provides a comprehensive view of the company\'s market position and its main competitors.\n',
        social_analysis: {
            reddit: {
                analysis:
                    "The subreddit r/venturecapital reveals several key themes. There's a strong sentiment that many junior VCs lack real-world experience, leading to poor advice for founders. The community also discusses the challenges of fundraising, the importance of networking, and the debate around the use of AI in VC. The general consensus is that while VC is not dying, it's undergoing a transformation, with more emphasis on specialized knowledge and a shift from hype-driven investments to more strategic ones. There is also some criticism of the '30 under 30' lists as being more about self-promotion than actual investing acumen. A recurring pain point is the lack of good tooling and the reliance on spreadsheets and email, indicating a need for more advanced solutions. The most upvoted posts and comments often highlight the importance of genuine relationships and operational experience over surface level expertise.",
                metrics: {
                    upvote_ratio_avg: "0.94",
                    comment_count_avg: "27",
                    recurring_themes: [
                        "lack of experience in junior VCs",
                        "importance of genuine relationships",
                        "need for better tooling",
                        "AI in VC",
                        "criticism of '30 under 30' lists",
                    ],
                },
            },
            youtube: {
                analysis:
                    "The YouTube search results reveal a mix of educational content and promotional material related to VC and startup fundraising. There are a few company created videos that show platforms for deal management and fund administration. There are also quite a few sponsored videos from channels like 'The Futur', which are educational videos with sponsors. The educational content covers topics like the basics of venture capital, fundraising strategies, and how to create a good pitch deck. There is a lack of videos from companies that are direct competitors offering similar services, indicating a relatively niche market. The sponsored videos highlight the growing trend of leveraging educational content for marketing purposes. The retention ratios of the sponsored segments vary depending on the channel, indicating the importance of channel authority and audience engagement.",
                metrics: {
                    company_created_videos_count: 2,
                    sponsored_videos_count: 3,
                    sponsored_video_timestamps: [
                        {
                            channel: "The Futur",
                            sponsor_segment_timestamp: "0:00",
                            retention_ratio: "0.85",
                        },
                        {
                            channel: "The Futur",
                            sponsor_segment_timestamp: "5:30",
                            retention_ratio: "0.78",
                        },
                        {
                            channel: "Ali Abdaal",
                            sponsor_segment_timestamp: "0:00",
                            retention_ratio: "0.92",
                        },
                    ],
                },
            },
            trustpilot: {
                analysis:
                    "No Trustpilot data available as there was no link provided.",
                metrics: {},
            },
            user_pain_points: [
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
            ad_storyline:
                "The ad campaign will focus on the pain points of both startups and VCs. It will highlight how RaiseGate streamlines deal flow, provides access to high-quality leads, and offers comprehensive tools for effective collaboration. The storyline will emphasize the platform's ability to eliminate the inefficiencies of traditional methods and foster genuine connections.",
            hook: "Tired of endless LinkedIn searches and outdated spreadsheets? RaiseGate connects you to the right opportunities, faster. Whether you're a startup looking for funding or a VC seeking the next big thing, we've got you covered.",
        },
    });
    const youtubeMetrics = data.social_analysis.youtube.metrics;
    const totalVideos =
        youtubeMetrics.company_created_videos_count +
        youtubeMetrics.sponsored_videos_count;

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const response = await fetch(
                    "http://adithvm.centralindia.cloudapp.azure.com:8081/unified-analysis",
                );
                if (!response.ok) throw new Error("Failed to fetch data");
                const result = await response.json();
                setData(result);
            } catch (err) {
                setError(
                    err instanceof Error ? err.message : "An error occurred",
                );
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    return (
        <div className="min-h-screen bg-background p-6 pt-36">
            <div className="mx-auto max-w-7xl space-y-8">
                {/* Main Stats Cards */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Star className="h-5 w-5 text-yellow-400" />
                                Reddit Engagement
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold">
                                {
                                    data.social_analysis.reddit.metrics
                                        .upvote_ratio_avg
                                }
                            </div>
                            <p className="text-sm text-muted-foreground">
                                Average upvote ratio
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Youtube className="h-5 w-5 text-red-600" />
                                Video Analysis
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold">
                                {totalVideos}
                            </div>
                            <p className="text-sm text-muted-foreground">
                                Videos analyzed
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <ThumbsDown className="h-5 w-5 text-red-500" />
                                Reddit Comments
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold">
                                {
                                    data.social_analysis.reddit.metrics
                                        .comment_count_avg
                                }
                            </div>
                            <p className="text-sm text-muted-foreground">
                                Average comments
                            </p>
                        </CardContent>
                    </Card>
                </div>

                {/* Main Content Tabs */}
                <Tabs defaultValue="analysis" className="space-y-4">
                    <TabsList>
                        <TabsTrigger value="analysis">Analysis</TabsTrigger>
                        <TabsTrigger value="videos">Videos</TabsTrigger>
                        <TabsTrigger value="pain-points">
                            Pain Points
                        </TabsTrigger>
                        <TabsTrigger value="competitors">
                            Competitors
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="analysis" className="space-y-4">
                        <Card>
                            <CardHeader>
                                <CardTitle>Reddit Analysis</CardTitle>
                                <CardDescription>
                                    Community feedback and discussions
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm text-muted-foreground">
                                    {data.social_analysis.reddit.analysis}
                                </p>
                                <div className="mt-4">
                                    <h4 className="font-semibold mb-2">
                                        Recurring Themes:
                                    </h4>
                                    <ul className="list-disc pl-4 space-y-1">
                                        {data.social_analysis.reddit.metrics.recurring_themes.map(
                                            (theme, index) => (
                                                <li
                                                    key={index}
                                                    className="text-sm text-muted-foreground"
                                                >
                                                    {theme}
                                                </li>
                                            ),
                                        )}
                                    </ul>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="videos" className="space-y-4">
                        <Card>
                            <CardContent className="space-y-6">
                                <div className="grid gap-4">
                                    {data.social_analysis.youtube.metrics.sponsored_video_timestamps.map(
                                        (video, index) => (
                                            <Alert key={index}>
                                                <AlertCircle className="h-4 w-4" />
                                                <AlertTitle>
                                                    {video.channel}
                                                </AlertTitle>
                                                <AlertDescription>
                                                    <p>
                                                        Timestamp:{" "}
                                                        {
                                                            video.sponsor_segment_timestamp
                                                        }
                                                    </p>
                                                    <p>
                                                        Retention Ratio:{" "}
                                                        {video.retention_ratio}
                                                    </p>
                                                </AlertDescription>
                                            </Alert>
                                        ),
                                    )}
                                </div>
                                <Alert>
                                    <AlertCircle className="h-4 w-4" />
                                    <AlertTitle>Overall Analysis</AlertTitle>
                                    <AlertDescription>
                                        {data.social_analysis.youtube.analysis}
                                    </AlertDescription>
                                </Alert>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="pain-points">
                        <Card>
                            <CardContent>
                                <ScrollArea className="h-[400px]">
                                    <ul className="space-y-4">
                                        {data.social_analysis.user_pain_points.map(
                                            (point, index) => (
                                                <li
                                                    key={index}
                                                    className="flex items-start gap-2"
                                                >
                                                    <AlertCircle className="h-5 w-5 text-red-500 mt-0.5" />
                                                    <span>{point}</span>
                                                </li>
                                            ),
                                        )}
                                    </ul>
                                </ScrollArea>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="competitors" className="space-y-4">
                        {data.competitors.map((competitor, index) => (
                            <Card key={index}>
                                <CardHeader>
                                    <CardTitle>{competitor.title}</CardTitle>
                                    <CardDescription>
                                        <a
                                            href={competitor.link}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-blue-500 hover:underline"
                                        >
                                            {competitor.link}
                                        </a>
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-sm text-muted-foreground">
                                        {competitor.snippet}
                                    </p>
                                </CardContent>
                            </Card>
                        ))}
                    </TabsContent>
                </Tabs>

                {/* Ad Strategy Section */}
                <Card>
                    <CardHeader>
                        <CardTitle>Marketing Strategy</CardTitle>
                        <CardDescription>
                            Recommended approach based on analysis
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <p className="font-semibold mb-2">
                            Hook: {data.social_analysis.hook}
                        </p>
                        <p className="text-sm text-muted-foreground">
                            {data.social_analysis.ad_storyline}
                        </p>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
