"use client";

import { useState, useEffect } from "react";
import { Plus } from "lucide-react";
import Link from "next/link";
import CreateProjectCard from "@/components/CreateProjectCard";

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

export default function Dashboard() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const { user } = useUser();
  console.log(user);
  const userId = user?.sid;

  useEffect(() => {
    const fetchProjects = async (userId) => {
      try {
        const response = await fetch(`/api/projects/get?userId=${userId}`);
        if (!response.ok) {
          throw new Error("Failed to fetch projects");
        }
        const data = await response.json();
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
    return <div>Loading...</div>;
  }
  if (!user) {
    return <>Errrorbroskie</>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="mx-auto max-w-7xl space-y-8">
        {/* Recent Projects Section */}
        <section className="space-y-6">
          <h2 className="text-3xl font-semibold tracking-tight">
            Recent projects
          </h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {/* Create Project Card */}
            <CreateProjectCard />
            {/* Project Cards */}
            {projects.slice(0, 5).map((project) => (
              <Card key={project.id} className="flex flex-col">
                <CardHeader className="flex-1">
                  <CardTitle className="text-xl">{project.name}</CardTitle>
                </CardHeader>
                <CardFooter className="border-t bg-muted/50 px-6 py-4">
                  <p className="text-sm text-muted-foreground">{project.id}</p>
                </CardFooter>
              </Card>
            ))}
          </div>
        </section>

        <Separator />

        {/* All Projects Section */}
        <section className="space-y-6">
          <h2 className="text-3xl font-semibold tracking-tight">
            All Firebase projects
          </h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {projects.map((project) => (
              <Card key={project.id} className="flex flex-col">
                <CardHeader className="flex-1">
                  <CardTitle className="text-xl">{project.name}</CardTitle>
                </CardHeader>
                <CardFooter className="border-t bg-muted/50 px-6 py-4">
                  <p className="text-sm text-muted-foreground">{project.id}</p>
                </CardFooter>
              </Card>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
