"use client";

import { useInView } from "motion/react";
import { useRef } from "react";
import { useUser } from "@auth0/nextjs-auth0/client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export default function LoginPage() {
  const { user, isLoading } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (user) {
      router.push("/dashboard");
    }
  }, [user, router]);

  if (isLoading)
    return (
      <div className="h-screen flex items-center justify-center bg-background">
        <div
          className={cn(
            "w-full max-w-md p-8 space-y-4 bg-neutral-950 rounded-lg shadow-lg border",
            "animate-pulse"
          )}
        >
          <div className="h-12 bg-neutral-900 rounded-2xl border"></div>
          <div className="h-12 bg-neutral-900 rounded-2xl border"></div>
          <div className="h-12 bg-neutral-900 rounded-2xl border"></div>
        </div>
      </div>
    );

  return (
    <div className="flex min-h-screen bg-background">
      <VideoOverlay />
      <div className="w-full md:w-1/2 flex items-center justify-center p-4">
        <Card className="w-full max-w-md bg-background/80 backdrop-blur-md border border-border rounded-2xl shadow-lg transition-transform transform duration-300 ease-in-out space-y-10">
          <CardHeader>
            <CardTitle className="text-4xl font-extrabold  text-primary tracking-tight">
              Welcome Back
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-start gap-6 font-geist ">
            <p className="text-foreground/70 text-lg">
              Unlock personalized insights, manage your data, and explore
              powerful tools with ease.
            </p>
            <Button
              onClick={() => (window.location.href = "/api/auth/login")}
              className="bg-gradient-to-r from-secondary to-secondary/80 text-secondary-foreground font-semibold rounded-lg px-8 py-3 text-lg transition-transform transform hover:bg-primary/80 duration-300 ease-in-out"
            >
              Get Started
            </Button>
            <p className="text-sm text-foreground/50">
              New to our platform?{" "}
              <span
                className="text-secondary hover:underline cursor-pointer"
                onClick={() => (window.location.href = "/signup")}
              >
                Sign up here.
              </span>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function VideoOverlay({ children }) {
  const ref = useRef(null);
  const videoRef = useRef(null);
  const isInView = useInView(ref, { once: true });

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.playbackRate = 0.5;
    }
  }, []);

  return (
    <div
      ref={ref}
      className="absolute md:block w-full md:w-1/2 h-screen md:relative overflow-hidden"
    >
      <video
        ref={videoRef}
        autoPlay
        loop
        muted
        playsInline
        className="absolute top-0 left-0 w-full h-full object-cover"
        style={{
          filter: isInView ? "brightness(0.3)" : "brightness(0)",
          transition: "all 0.9s cubic-bezier(0.17, 0.55, 0.55, 1) 0.5s",
        }}
      >
        <source src="/bg.mp4" type="video/mp4" />
        Your browser does not support the video tag.
      </video>
    </div>
  );
}
