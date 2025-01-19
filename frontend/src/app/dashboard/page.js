"use client";

import { useState, useEffect } from "react";
import { Plus } from "lucide-react";
import Link from "next/link";
import CreateProjectCard from "@/components/CreateProjectCard";
import { cn } from "@/lib/utils";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useUser } from "@auth0/nextjs-auth0/client";
export const dynamic = "force-dynamic";
export default function Dashboard() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const { user } = useUser();
  console.log(user);
  const userId = user?.sid;

  useEffect(() => {
    const fetchProjects = async (userId) => {
      console.log("user id is", userId);
      try {
        const response = await fetch(`/api/projects/get?userId=${userId}`, {
          cache: "no-store",
        });
        if (!response.ok) {
          throw new Error("Failed to fetch projects");
        }
        const data = await response.json();
        console.log("data is", data);
        if (data.user && data.user.projects) {
          setProjects(data.user.projects); // Set the fetched projects
        } else {
          setError("No projects found for the user.");
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    if (userId) {
      fetchProjects(userId);
    }
  }, [userId]);

  if (loading) {
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
  }
  if (!user) {
    return (
      <>
        <div className="h-screen flex items-center justify-center bg-background">
          <h1 className="text-4xl font-extrabold tracking-tight font-nf"> Error, please login again!</h1>
        </div>
      </>
    );
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div className="min-h-screen bg-background p-6 pt-48">
      <div className="mx-auto max-w-7xl space-y-8">
        {/* Recent Projects Section */}
        <section className="space-y-6">
          <h2 className="text-3xl font-semibold tracking-tight font-nf">
            Recent projects
          </h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 font-geist">
            {/* Create Project Card */}
            <CreateProjectCard />
            {/* Project Cards */}
            {projects.slice(0, 5).map((project) => (
              <Link
                key={project.id}
                href={`/dashboard/${project.id}`}
                className="rounded-2xl group h-full w-full "
              >
                <Card
                  key={project.id}
                  className="flex flex-col h-full w-full group-hover:border-primary"
                >
                  <CardHeader className="flex-1">
                    <CardTitle className="text-xl group-hover:text-primary transition-colors duration-150 ease-in-out">
                      {project.name}
                    </CardTitle>
                  </CardHeader>
                  <CardFooter className="border-t bg-muted/50 px-6 py-4">
                    <p className="text-sm text-muted-foreground group-hover:underline">
                      {project.id}
                    </p>
                  </CardFooter>
                </Card>
              </Link>
            ))}
          </div>
        </section>

        <Separator />

        {/* All Projects Section */}
        <section className="space-y-6">
          <h2 className="text-3xl font-semibold tracking-tight font-nf">
            All Firebase projects
          </h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 font-geist">
            {projects.map((project) => (
              <Link
                key={project.id}
                href={`/dashboard/${project.id}`}
                className="rounded-2xl group"
              >
                <Card className="flex flex-col hover:border-primary">
                  <CardHeader className="flex-1">
                    <CardTitle className="text-xl group-hover:text-primary transition-colors duration-150 ease-in-out">
                      {project.name}
                    </CardTitle>
                  </CardHeader>
                  <CardFooter className="border-t bg-muted/50 px-6 py-4 rounded-b-xl">
                    <p className="text-sm text-muted-foreground group-hover:underline">
                      {project.id}
                    </p>
                  </CardFooter>
                </Card>
              </Link>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
