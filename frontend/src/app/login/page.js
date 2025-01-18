"use client";

import { useUser } from "@auth0/nextjs-auth0/client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function LoginPage() {
  const { user, isLoading } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (user) {
      router.push("/dashboard");
    }
  }, [user, router]);

  if (isLoading) return <div>Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center text-white">
            Welcome to Our App
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center gap-6">
          <p className="text-center text-gray-400">
            Please log in to see your profile details.
          </p>
          <Button
            onClick={() => (window.location.href = "/api/auth/login")}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            Log In
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
