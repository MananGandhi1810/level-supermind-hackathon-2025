"use client";
import React, { useEffect, useState } from "react";
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
import { Bar, BarChart } from "recharts";
import { AlertCircle, Star, ThumbsDown, Youtube } from "lucide-react";

const placeholderData = {
  reddit:
    "Reddit analysis reveals user dissatisfaction with browsing, autoplaying trailers, and the lack of filtering options.",
  youtube: [
    {
      link: "https://www.youtube.com/watch?v=NALpUMraeug",
      analysis: "High engagement but lacks focus on user concerns.",
    },
    {
      link: "https://www.youtube.com/watch?v=tnEsBAPvJ9o",
      analysis: "Festive advertisement with strong user engagement.",
    },
  ],
  user_pain_points: [
    "Difficult content browsing experience",
    "Auto-playing trailers",
    "Lack of filtering options",
  ],
  trustpilot:
    "Trustpilot reveals a 1.4 TrustScore, with 67% 1-star reviews based on over 10,500 ratings.",
  ad_storyline:
    "Hook: 'Tired of endless scrolling?' A new feature solves the 'what to watch' problem.",
};

const CompanyProjectPage = ({ slug }) => {
  const [data, setData] = useState(placeholderData);
  const [loading, setLoading] = useState(true);

  // Fetch data dynamically based on slug
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Replace this with your actual API endpoint
        const response = await fetch(`/api/company-data/${slug}`);
        if (response.ok) {
          const jsonData = await response.json();
          setData(jsonData);
        } else {
          console.error("Failed to fetch data");
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [slug]);

  // Transform pain points for chart visualization
  const painPointsData = data.user_pain_points.map((point) => ({
    issue: point,
    count: Math.floor(Math.random() * 100) + 1, // Simulating frequency data
  }));

  // Extract YouTube video IDs
  const getYouTubeId = (url) => {
    const match = url.match(
      /(?:youtu\.be\/|youtube\.com(?:\/embed\/|\/v\/|\/watch\?v=|\/user\/\S+|\/ytscreeningroom\?v=|\/sandalsResorts#\w\/\w\/.*\/))([^\/&]{10,12})/
    );
    return match?.[1] || "";
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background p-6 pt-24">Loading...</div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-6 pt-24">
      <div className="mx-auto max-w-7xl space-y-8">
        {/* Main Stats Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Star className="h-5 w-5 text-yellow-400" />
                Trustpilot Score
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">1.4/5.0</div>
              <p className="text-sm text-muted-foreground">
                Based on 10,500+ reviews
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ThumbsDown className="h-5 w-5 text-red-500" />
                Negative Reviews
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">67%</div>
              <p className="text-sm text-muted-foreground">1-star reviews</p>
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
              <div className="text-3xl font-bold">{data.youtube.length}</div>
              <p className="text-sm text-muted-foreground">Videos analyzed</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="analysis" className="space-y-4">
          <TabsList>
            <TabsTrigger value="analysis">Analysis</TabsTrigger>
            <TabsTrigger value="videos">Videos</TabsTrigger>
            <TabsTrigger value="pain-points">Pain Points</TabsTrigger>
          </TabsList>

          <TabsContent value="analysis" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Reddit Sentiment Analysis</CardTitle>
                <CardDescription>User feedback and discussions</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">{data.reddit}</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Trustpilot Overview</CardTitle>
                <CardDescription>Customer reviews and ratings</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  {data.trustpilot}
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="videos" className="space-y-4">
            {data.youtube.map((video, index) => (
              <Card key={index}>
                <CardContent className="space-y-6">
                  <div className="aspect-video">
                    <iframe
                      className="w-full h-full rounded-lg"
                      src={`https://www.youtube.com/embed/${getYouTubeId(
                        video.link
                      )}`}
                      allowFullScreen
                    />
                  </div>
                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Video Analysis</AlertTitle>
                    <AlertDescription>{video.analysis}</AlertDescription>
                  </Alert>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="pain-points">
            <Card>
              <CardContent>
                <BarChart
                  data={painPointsData}
                  title="Pain Points Frequency"
                  index="issue"
                  categories={["count"]}
                  colors={["blue"]}
                  className="h-[400px]"
                />
                <ScrollArea className="h-[200px] mt-8">
                  <ul className="space-y-4">
                    {data.user_pain_points.map((point, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <AlertCircle className="h-5 w-5 text-red-500 mt-0.5" />
                        <span>{point}</span>
                      </li>
                    ))}
                  </ul>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Ad Strategy Section */}
        <Card>
          <CardHeader>
            <CardTitle>Proposed Ad Strategy</CardTitle>
            <CardDescription>
              Recommended advertising approach based on analysis
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">{data.ad_storyline}</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CompanyProjectPage;
