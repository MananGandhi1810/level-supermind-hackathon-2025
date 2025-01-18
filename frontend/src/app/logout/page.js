"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function LogoutPage() {
  const router = useRouter();

  useEffect(() => {
    window.location.href = "/api/auth/logout";
  }, []);

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center text-white">
            Logging Out...
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center gap-6">
          <p className="text-center text-gray-400">
            You are being logged out. Please wait...
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
