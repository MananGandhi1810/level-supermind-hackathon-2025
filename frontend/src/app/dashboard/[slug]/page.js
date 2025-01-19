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
import { useState, useEffect } from "react";
import { useUser } from "@auth0/nextjs-auth0/client";

export default function CompanyProjectPage({ params }) {
  const slug = params.slug;
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState();
  const { user } = useUser();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // First, fetch the user data to get the company ID
        const userResponse = await fetch(
          "/api/projects/get?userId=" + user.email
        );
        if (!userResponse.ok) throw new Error("Failed to fetch user data");
        const userData = await userResponse.json();

        // Find the company that matches the slug
        console.log(userData.user.companies);
        console.log(slug);
        const company = userData.user.companies.find((c) => c.id == slug);
        if (!company) throw new Error("Company not found");

        // Now fetch the company analysis data
        const analysisResponse = await fetch(
          `http://adithvm.centralindia.cloudapp.azure.com:8081/unified-analysis`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              url: company.url, // Assuming `website_url` is part of the company data
              company_name: company.name,
            }),
          }
        );
        if (!analysisResponse.ok)
          throw new Error("Failed to fetch company analysis");
        const result = await analysisResponse.json();
        setData(result);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [slug, user]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!data) return null;

  // Extract YouTube metrics for the stats card
  const youtubeMetrics = data.social_analysis.youtube.metrics;
  const totalVideos =
    youtubeMetrics.company_created_videos_count +
    youtubeMetrics.sponsored_videos_count;

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
                {data.social_analysis.reddit.metrics.upvote_ratio_avg}
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
              <div className="text-3xl font-bold">{totalVideos}</div>
              <p className="text-sm text-muted-foreground">Videos analyzed</p>
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
                {data.social_analysis.reddit.metrics.comment_count_avg}
              </div>
              <p className="text-sm text-muted-foreground">Average comments</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="analysis" className="space-y-4">
          <TabsList>
            <TabsTrigger value="analysis">Analysis</TabsTrigger>
            <TabsTrigger value="videos">Videos</TabsTrigger>
            <TabsTrigger value="pain-points">Pain Points</TabsTrigger>
            <TabsTrigger value="competitors">Competitors</TabsTrigger>
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
                  <h4 className="font-semibold mb-2">Recurring Themes:</h4>
                  <ul className="list-disc pl-4 space-y-1">
                    {data.social_analysis.reddit.metrics.recurring_themes.map(
                      (theme, index) => (
                        <li
                          key={index}
                          className="text-sm text-muted-foreground"
                        >
                          {theme}
                        </li>
                      )
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
                        <AlertTitle>{video.channel}</AlertTitle>
                        <AlertDescription>
                          <p>Timestamp: {video.sponsor_segment_timestamp}</p>
                          <p>Retention Ratio: {video.retention_ratio}</p>
                        </AlertDescription>
                      </Alert>
                    )
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
                        <li key={index} className="flex items-start gap-2">
                          <AlertCircle className="h-5 w-5 text-red-500 mt-0.5" />
                          <span>{point}</span>
                        </li>
                      )
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
