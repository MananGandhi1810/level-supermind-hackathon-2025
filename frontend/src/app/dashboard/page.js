"use client";

import { useUser } from "@auth0/nextjs-auth0/client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function DashboardPage() {
  const { user, isLoading } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (!user && !isLoading) {
      router.push("/login");
    }
  }, [user, isLoading, router]);

  if (isLoading) return <div>Loading...</div>;

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center text-white">
            Welcome, {user.name}!
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center gap-6">
          <div className="flex flex-col items-center gap-4">
            <div className="relative w-24 h-24 rounded-full overflow-hidden">
              <img
                src={user.picture || "/placeholder.svg"}
                alt={user.name || "User"}
                className="object-cover"
              />
            </div>
            <div className="text-center">
              <h2 className="text-xl font-semibold text-white">{user.name}</h2>
              <p className="text-gray-400">{user.email}</p>
            </div>
          </div>
          <Button
            onClick={() => router.push("/logout")}
            variant="outline"
            className="text-gray-300 border-gray-600 hover:bg-gray-700"
          >
            Log Out
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
