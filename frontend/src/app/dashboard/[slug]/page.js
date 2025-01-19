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
import { AlertCircle, Star, ThumbsDown, Youtube } from "lucide-react";
import { useUser } from "@auth0/nextjs-auth0/client";

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
  const [companies, setCompanies] = useState([]); // Renamed to companies
  const [loading, setLoading] = useState(true);
  const [analysis, setAnalysis] = useState({
    reddit: "No data available from Reddit.",
    youtube: [
      {
        link: "https://www.youtube.com/watch?v=j_18UV939DM",
        analysis:
          "This is a company-created advertisement showcasing Layers' products.  It includes a promotional code for a discount. The video has a high number of comments (mostly in Hindi/other languages), many expressing interest but also highlighting issues with delivery times and order cancellation difficulties.",
      },
      {
        link: "https://www.youtube.com/watch?v=JgIXqHX2GlM",
        analysis:
          "This is another company-created advertisement, a collaboration featuring a YouTuber applying Layers skin to a car.  Similar to the previous video, the comments section reveals concerns about product pricing and design quality, alongside excitement for the product.",
      },
    ],
    user_pain_points: [
      {
        pain_point: "Incorrect order fulfillment.",
        data_driven_analysis:
          "Two 1-star Trustpilot reviews directly mention receiving the wrong order. This indicates a significant problem with the order processing and fulfillment system.",
      },
      {
        pain_point: "Poor customer service and lack of support.",
        data_driven_analysis:
          "Both 1-star Trustpilot reviews cite unresponsive and unhelpful customer service, specifically regarding returns and exchanges.  This points to a need for improved customer support processes and communication.",
      },
      {
        pain_point: "High pricing.",
        data_driven_analysis:
          "YouTube comments mention the high price of Layers skins as a barrier to purchase for some customers.",
      },
      {
        pain_point: "Design quality concerns.",
        data_driven_analysis:
          "YouTube comments reveal some dissatisfaction with the designs offered.",
      },
    ],
    trustpilot: {
      analysis:
        "Layers has a 3.6 TrustScore based on 4 reviews.  The reviews are sharply divided between 5-star and 1-star ratings. This highlights excellent product quality but significant issues with order fulfillment and customer service.  A major improvement area is addressing order accuracy and providing responsive, helpful customer support.",
    },
    ad_storyline: {
      hook: "Tired of boring phone cases?  Transform your tech with Layers!",
      storyline:
        "The ad opens with a montage of people frustrated with damaged, dull, or boring phone cases.  Then, introduce Layers skins—showcasing their ease of application, vibrant designs, and protective qualities.  Highlight the solution to user pain points by showing a quick, easy application process and a customer service representative promptly resolving an issue.  Conclude with a call to action: visit layers.shop and use code 'TRANSFORM10' for 10% off your first order.  Emphasize the satisfaction of having a unique, personalized, and protected device.",
    },
  });
  const [data, setData] = useState(placeholderData);
  const [competitors, setCompetitors] = useState({
    competitors: [
      {
        title: "Slickwraps: Custom Skins & Wraps for Phones, Laptops & ...",
        link: "https://www.slickwraps.com/",
        snippet:
          "Customize and protect your devices with premium skins from Slickwraps. Shop unique designs for phones, laptops, and more. Quality protection, endless style ...",
      },
      {
        title: "dbrand » Official Shop",
        link: "https://dbrand.com/?srsltid=AfmBOopCUID8CN8vb_gHRHcQREW1xmVJ_pgIRTAbgwxkZ30DqFyAmRHH",
        snippet:
          "dbrand is the global leader in device customization. Founded on 11.11.11. Run by robots.",
      },
      {
        title: "Clear-Coat Phone Skins by Mobile Outfitters | Made in USA",
        link: "https://www.moutfitters.com/our-products/clear-coat/",
        snippet:
          "Invisible scratch protection for a sleek touchscreen experience. HD clarity, military-grade strength, and USA made quality so it can withstand anything.",
      },
    ],
    analysis:
      '\nBased on our analysis, we identified the following key aspects:\n\nCompany Profile:\nOkay, let\'s analyze this scraped website data.\n\n**1. Product/Service Categories**\n\n*   **Core Product:** Customizable mobile skins.\n    *   **Description:** These are adhesive vinyl wraps designed to fit various mobile phone models, providing protection and aesthetic customization.\n    *   **Specific Product Names:** The website displays a wide array of design names for the skins like "Cyberhud," "Magma," "Chaos," "Space Blueprint," "Canopy Cascade," "Cybermind," "Concrete Rock," "Cybernetic Charge", "Purple River" etc. There are also designs like "Ethnic", "HudOG", "Game", "Groovy", "Kaleidoscope", "Leaf Pattern", "Pebbles" and "Tech". These names suggest different visual themes and styles for the skins.\n*  **Service Offerings**:\n    *   The primary offering is the ability to "Build Your Mobile Skin" via an interactive selection process, indicating a customization service.\n    *   They also offer a "custom skin" service for devices not listed on the site.\n*   **Industry-Specific Terminology/Jargon:** "Vinyl Skin," "3M vinyl wrap," "Zero Glue Residue" these terms describe the material and application process of the product.\n*   **Target Market Segments:** This appears to be primarily aimed at individual consumers looking to personalize and protect their mobile devices. The wide range of designs indicates they are targeting various tastes and preferences.\n*   **Core Problem Solved:** The main problem they solve is offering a way for customers to personalize their devices and prevent scratches, with a mention of being "Ultra-Thin" so as not to add bulk.\n\n**3. Business Model Identifiers**\n\n*   **Pricing Structure:**\n    *   The website shows a clear B2C pricing model. There is a "Sale Price" of ₹ 599.00, marked down from the "Regular price" of ₹ 699.00 which helps with marketing.\n    *   Prices appear to be fixed per skin, which implies a retail approach.\n    *   They offer free shipping on orders above ₹999, indicating a minimum threshold to encourage larger purchases.\n*   **Target Customer Size:** The primary target is individual consumers, indicating a strong focus on the SMB space.\n*   **Sales Model:**\n    *   Direct-to-consumer (DTC) sales model through their e-commerce website.\n    *   They utilize an interactive product builder for selecting device type, brand, model, and design.\n    *   They have a shopping cart functionality, which is classic for E-commerce.\n\n**4. Market Positioning**\n\n*   **Key Value Propositions:**\n    *   **Customization:** The ability to select from a variety of designs and device models for personalized device aesthetics.\n    *   **Protection:** The skins offer scratch protection with an emphasis on being lightweight and thin.\n    *   **Quality Materials:** The use of "3M vinyl wrap" positions their product as high-quality and durable.\n    *   **Easy Application/Removal:** The "Zero Glue Residue" claim makes it easy to remove without damage to the device.\n    *  **Unique Textures:** "WOW 3D Textures" highlights a superior finish and style in the market.\n*  **Mission Statement:** Although there isn\'t a clear mission statement written explicitly, their emphasis on personalization, protection, quality, and easy application suggests a mission to provide customers with a way to express themselves through their devices while keeping them safe.\n*   **Partner Ecosystem:** The use of "3M vinyl" suggests a partnership with 3M. This is leveraged to highlight a material\'s quality.\n\n**In Summary:**\n\nLayers.shop is an e-commerce business that sells custom vinyl skins for mobile devices, positioning itself in the market with a focus on customization, protection, and high-quality materials. They target individual consumers through a direct-to-consumer sales model, offering a simple yet engaging customer experience. They market themselves as a provider of a high quality product with strong use of 3M branding.\n\n\nKey Search Terms:\ncustomizable phone skins, 3M vinyl wraps, mobile device scratch protection\n\nTop Competitors Overview:\n[\n  {\n    "title": "Slickwraps: Custom Skins & Wraps for Phones, Laptops & ...",\n    "link": "https://www.slickwraps.com/",\n    "snippet": "Customize and protect your devices with premium skins from Slickwraps. Shop unique designs for phones, laptops, and more. Quality protection, endless style ..."\n  },\n  {\n    "title": "dbrand \\u00bb Official Shop",\n    "link": "https://dbrand.com/?srsltid=AfmBOopCUID8CN8vb_gHRHcQREW1xmVJ_pgIRTAbgwxkZ30DqFyAmRHH",\n    "snippet": "dbrand is the global leader in device customization. Founded on 11.11.11. Run by robots."\n  },\n  {\n    "title": "Clear-Coat Phone Skins by Mobile Outfitters | Made in USA",\n    "link": "https://www.moutfitters.com/our-products/clear-coat/",\n    "snippet": "Invisible scratch protection for a sleek touchscreen experience. HD clarity, military-grade strength, and USA made quality so it can withstand anything."\n  }\n]\n\nThis analysis provides a comprehensive view of the company\'s market position and its main competitors.\n',
  });
  const competitorDets = [
    {
      user_pain_points: [
        "Inconsistent product quality: Some customers report variations in material quality and print clarity across different skins, leading to dissatisfaction.",
        "Delayed shipping and handling: Long processing times and slow shipping can be frustrating, especially for customers eager to customize their devices.",
        "Difficult application process for some devices: While generally straightforward, the application of complex designs or skins on curved devices can be challenging and lead to errors.",
      ],
      trustpilot: {
        trustscore: 3.7,
        total_reviews: 583,
        positive_reviews: 35,
        negative_reviews: 496,
        summary:
          "Slickwraps' customer reviews paint a concerning picture with a very low percentage of five star reviews and a large majority of one star reviews. This suggests that many customers are experiencing significant issues with the product and/or service. There are major improvements required to improve customer satisfaction",
      },
      ad_storyline: {
        hook: "Unleash Your Unique Style with Slickwraps! Endless Designs, Unmatched Customization.",
        storyline:
          "The ad opens with a montage of diverse devices transformed with vibrant and intricate Slickwraps designs. The ad highlights a design customization tool where you can upload designs from your own personal collection. Highlight the high quality of the finish and the durability of the skin with closeups. Next the ad shows a successful application process of a difficult design, indicating how easy it is to apply even the most complex designs. The ad finishes with a call to action to design your own personalized device with a discount for first time users, emphasizing the creativity and personalization that slickwraps offers.",
      },
    },
    {
      user_pain_points: [
        "High price point: dbrand's premium pricing can be a barrier for some customers, making it less accessible for budget-conscious consumers.",
        "Limited design flexibility: While dbrand offers high-quality materials, some users may find their designs and patterns to be more minimal and less expressive compared to competitors.",
        "Customer service response times: Though rare, some users have reported slower than expected response times from customer service, especially during peak periods.",
      ],
      trustpilot: {
        trustscore: 4.4,
        total_reviews: 11993,
        positive_reviews: 10433,
        negative_reviews: 599,
        summary:
          "dbrand consistently receives very positive reviews, with a high majority of five-star ratings. This indicates strong customer satisfaction, specifically around the quality of the product and the service. Although there are a handful of negative reviews, these are few and far between and do not impact the overwhelming positive response. dbrand is well positioned to take on the market as a reliable high quality brand.",
      },
      ad_storyline: {
        hook: "Experience the Precision of dbrand: Engineered for Excellence, Designed for You.",
        storyline:
          "The ad opens with sleek, robotic arms meticulously crafting dbrand skins with laser precision. Highlight the sophisticated technology behind dbrand materials and the clean, minimalist aesthetic of their designs. The ad showcases the ease of install, with a tutorial showing step by step instruction with no air bubbles. It also shows the wide range of devices the product can be applied to. The ad then features testimonials from satisfied customers praising durability and high quality. The ad ends by highlighting the technological advancements that are the company's backbone and the quality of the products, with a call to action to experience the dbrand difference, encouraging purchases from those who value quality and precision.",
      },
    },
    {
      user_pain_points: [
        "Lower material quality compared to premium brands: Some customers find the materials used by MightySkins to be less durable and less premium-feeling compared to competitors.",
        "Less design intricacy and variety: While offering a wide range of designs, they may lack the intricate details and unique styles found in more expensive options.",
        "Potentially less precise fit on certain devices: Some users report minor fit issues or slight misalignment on specific device models.",
      ],
      trustpilot: {
        trustscore: 1.5,
        total_reviews: 130,
        positive_reviews: 32,
        negative_reviews: 81,
        summary:
          "MightySkins has very poor customer reviews, with a majority giving the brand a one star rating. This indicates low customer satisfaction and a general dissatisfaction with the quality of the product and the service offered. This suggests significant improvements need to be made.",
      },
      ad_storyline: {
        hook: "Style Your Tech Without Breaking the Bank: MightySkins - Affordable Customization for Everyone.",
        storyline:
          "The ad starts with a montage of diverse people enjoying colorful and fun MightySkins on their devices, showing a wide range of devices. The ad highlights how easy it is to apply the product and the low prices of its products. Next, the ad showcases a family using a variety of products showing that they are suitable for all ages. The ad then shows testimonials from budget conscious customers praising the affordability. The ad ends with a call to action to browse the collections and start your custom device journey, emphasizing affordability and accessibility.",
      },
    },
  ];

  // Transform pain points for chart visualization
  const painPointsData = analysis.user_pain_points.map((point, index) => ({
    issue: point.pain_point,
    count: Math.floor(Math.random() * 100) + 1, // Simulating frequency data
  }));

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1);

    // Cleanup the timer when the component unmounts
    return () => clearTimeout(timer);
  }, []);

  // Extract YouTube video IDs
  const getYouTubeId = (url) => {
    const match = url.match(
      /(?:youtu\.be\/|youtube\.com(?:\/embed\/|\/v\/|\/watch\?v=|\/user\/\S+|\/ytscreeningroom\?v=|\/sandalsResorts#\w\/\w\/.*\/))([^\/&]{10,12})/
    );
    return match?.[1] || "";
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background p-6 pt-24">
        <div className="mx-auto max-w-7xl space-y-8">
          {/* Main Stats Cards */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[...Array(3)].map((_, index) => (
              <Card key={index}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <div className="h-5 w-5 rounded-full bg-neutral-900 animate-pulse" />
                    <div className="h-4 w-32 bg-neutral-900 rounded animate-pulse" />
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-8 w-24 bg-neutral-900 rounded animate-pulse mb-2" />
                  <div className="h-4 w-40 bg-neutral-900 rounded animate-pulse" />
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Main Content Tabs */}
          <Tabs defaultValue="analysis" className="space-y-4">
            <TabsList>
              {["Analysis", "Videos", "Pain Points", "Competitors"].map(
                (tab) => (
                  <TabsTrigger
                    key={tab}
                    value={tab.toLowerCase()}
                    className="animate-pulse"
                  >
                    <div className="h-4 w-20 bg-neutral-900 rounded" />
                  </TabsTrigger>
                )
              )}
            </TabsList>

            <TabsContent value="analysis" className="space-y-4">
              {[...Array(2)].map((_, index) => (
                <Card key={index}>
                  <CardHeader>
                    <CardTitle>
                      <div className="h-6 w-48 bg-neutral-900 rounded animate-pulse" />
                    </CardTitle>
                    <div className="h-4 w-64 bg-neutral-900 rounded animate-pulse" />
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {[...Array(3)].map((_, i) => (
                        <div
                          key={i}
                          className="h-4 bg-neutral-900 rounded animate-pulse"
                        />
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </TabsContent>

            <TabsContent value="videos" className="space-y-4">
              {analysis.youtube.map((_, index) => (
                <Card key={index}>
                  <CardContent className="space-y-6">
                    <div className="aspect-video bg-neutral-900 rounded animate-pulse" />
                    <Alert>
                      <div className="h-4 w-4 bg-neutral-900 rounded-full animate-pulse" />
                      <AlertTitle>
                        <div className="h-4 w-32 bg-neutral-900 rounded animate-pulse" />
                      </AlertTitle>
                      <AlertDescription>
                        <div className="space-y-2">
                          {[...Array(3)].map((_, i) => (
                            <div
                              key={i}
                              className="h-4 bg-neutral-900 rounded animate-pulse"
                            />
                          ))}
                        </div>
                      </AlertDescription>
                    </Alert>
                  </CardContent>
                </Card>
              ))}
            </TabsContent>

            <TabsContent value="pain-points">
              <Card>
                <CardContent>
                  <div className="h-[400px] bg-neutral-900 rounded animate-pulse mb-8" />
                  <ScrollArea className="h-[200px]">
                    <ul className="space-y-4">
                      {[...Array(5)].map((_, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <div className="h-5 w-5 bg-neutral-900 rounded-full animate-pulse mt-0.5" />
                          <div className="h-4 w-full bg-neutral-900 rounded animate-pulse" />
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
              <CardTitle>
                <div className="h-6 w-48 bg-neutral-900 rounded animate-pulse" />
              </CardTitle>
              <div className="h-4 w-64 bg-neutral-900 rounded animate-pulse" />
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {[...Array(4)].map((_, i) => (
                  <div
                    key={i}
                    className="h-4 bg-neutral-900 rounded animate-pulse"
                  />
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-6 pt-36">
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
            <TabsTrigger value="competitors">Competitors</TabsTrigger>
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
            {analysis.youtube.map((video, index) => (
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
                <ScrollArea className="h-[200px] mt-8">
                  <ul className="space-y-4">
                    {analysis.user_pain_points.map((point, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <AlertCircle className="h-5 w-5 text-red-500 mt-0.5" />
                        <span>{point.pain_point}</span>
                      </li>
                    ))}
                  </ul>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="competitors" className="space-y-4">
            {competitors.competitors.map((competitor, index) => (
              <Card key={index} className="mb-6">
                <CardHeader>
                  <CardTitle>{competitor.title}</CardTitle>
                  <CardDescription className="text-sm">
                    {competitor.snippet}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Trustpilot Score */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-background p-4 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <Star className="h-5 w-5 text-yellow-400" />
                        <h3 className="font-semibold">Trust Score</h3>
                      </div>
                      <div className="text-2xl font-bold">
                        {competitorDets[index].trustpilot.trustscore}/5.0
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Based on{" "}
                        {competitorDets[index].trustpilot.total_reviews} reviews
                      </p>
                    </div>
                    <div className="bg-background p-4 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <Star className="h-5 w-5 text-green-500" />
                        <h3 className="font-semibold">Positive Reviews</h3>
                      </div>
                      <div className="text-2xl font-bold">
                        {competitorDets[index].trustpilot.positive_reviews}
                      </div>
                    </div>
                    <div className="bg-background p-4 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <ThumbsDown className="h-5 w-5 text-red-500" />
                        <h3 className="font-semibold">Negative Reviews</h3>
                      </div>
                      <div className="text-2xl font-bold">
                        {competitorDets[index].trustpilot.negative_reviews}
                      </div>
                    </div>
                  </div>

                  {/* Pain Points */}
                  <div>
                    <h3 className="font-semibold mb-3">Key Pain Points</h3>
                    <ul className="space-y-2">
                      {competitorDets[index].user_pain_points.map(
                        (point, i) => (
                          <li key={i} className="flex items-start gap-2">
                            <AlertCircle className="h-5 w-5 text-red-500 mt-0.5" />
                            <span className="text-sm">{point}</span>
                          </li>
                        )
                      )}
                    </ul>
                  </div>

                  {/* Ad Strategy */}
                  <div>
                    <h3 className="font-semibold mb-3">Marketing Strategy</h3>
                    <div className="bg-background p-4 rounded-lg">
                      <p className="font-semibold text-sm mb-2">
                        Hook: {competitorDets[index].ad_storyline.hook}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {competitorDets[index].ad_storyline.storyline}
                      </p>
                    </div>
                  </div>

                  {/* Trustpilot Summary */}
                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Review Analysis</AlertTitle>
                    <AlertDescription>
                      {competitorDets[index].trustpilot.summary}
                    </AlertDescription>
                  </Alert>
                </CardContent>
              </Card>
            ))}
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
            <p className="font-semibold mb-2">
              Hook: {analysis.ad_storyline.hook}
            </p>
            <p className="text-sm text-muted-foreground">
              {analysis.ad_storyline.storyline}
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CompanyProjectPage;
