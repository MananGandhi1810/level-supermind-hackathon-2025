"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import CreateProjectCard from "@/components/CreateProjectCard";
import { Card, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useUser } from "@auth0/nextjs-auth0/client";


export default function Dashboard() {
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const { user } = useUser();
  const userId = user?.email;

  useEffect(() => {
    const fetchCompanies = async (userId) => {
      console.log("Fetching companies for user ID:", userId);
      try {
        const response = await fetch(`/api/projects/get?userId=${userId}`, {
        });

        if (!response.ok) {
          throw new Error("Failed to fetch companies");
        }

        const data = await response.json();
        console.log("Fetched data:", data);

        if (data.user && data.user.companies) {
          setCompanies(data.user.companies);
          console.log(data.user.companies);
        } else {
          setCompanies([]);
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (userId) {
      fetchCompanies(userId);
    }
  }, [userId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-900 p-6 pt-48">
        <div className="mx-auto max-w-7xl space-y-8">
          {/* Recent Companies Section */}
          <section className="space-y-6">
            <div className="h-9 w-48 bg-neutral-800 rounded animate-pulse" />
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {/* Create Project Card Skeleton */}
              <Card className="flex flex-col h-full w-full border-neutral-700">
                <CardHeader className="flex-1">
                  <div className="h-6 w-32 bg-neutral-800 rounded animate-pulse" />
                </CardHeader>
                <CardFooter className="border-t border-neutral-700 bg-neutral-800/50 px-6 py-4">
                  <div className="h-4 w-24 bg-neutral-700 rounded animate-pulse" />
                </CardFooter>
              </Card>
              {/* Company Card Skeletons */}
              {[...Array(5)].map((_, index) => (
                <Card
                  key={index}
                  className="flex flex-col h-full w-full border-neutral-700"
                >
                  <CardHeader className="flex-1">
                    <CardTitle className="text-xl">
                      <div className="h-6 w-32 bg-neutral-800 rounded animate-pulse" />
                    </CardTitle>
                  </CardHeader>
                  <CardFooter className="border-t border-neutral-700 bg-neutral-800/50 px-6 py-4">
                    <div className="h-4 w-24 bg-neutral-700 rounded animate-pulse" />
                  </CardFooter>
                </Card>
              ))}
            </div>
          </section>

          <Separator className="bg-neutral-700" />

          {/* All Companies Section */}
          <section className="space-y-6">
            <div className="h-9 w-40 bg-neutral-800 rounded animate-pulse" />
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {[...Array(9)].map((_, index) => (
                <Card key={index} className="flex flex-col border-neutral-700">
                  <CardHeader className="flex-1">
                    <CardTitle className="text-xl">
                      <div className="h-6 w-32 bg-neutral-800 rounded animate-pulse" />
                    </CardTitle>
                  </CardHeader>
                  <CardFooter className="border-t border-neutral-700 bg-neutral-800/50 px-6 py-4 rounded-b-xl">
                    <div className="h-4 w-24 bg-neutral-700 rounded animate-pulse" />
                  </CardFooter>
                </Card>
              ))}
            </div>
          </section>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="h-screen flex items-center justify-center bg-background">
        <h1 className="text-4xl font-extrabold tracking-tight font-nf">
          Error: Please log in again!
        </h1>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-screen flex items-center justify-center bg-background">
        <h1 className="text-4xl font-extrabold tracking-tight font-nf">
          Error: {error}
        </h1>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-6 pt-48">
      <div className="mx-auto max-w-7xl space-y-8">
        {companies.length === 0 ? (
          <section className="space-y-6">
            <h2 className="text-3xl font-semibold tracking-tight font-nf">
              Add Your First Company
            </h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 font-geist">
              <CreateProjectCard />
            </div>
          </section>
        ) : (
          <>
            {/* Recent Companies Section */}
            <section className="space-y-6">
              <h2 className="text-3xl font-semibold tracking-tight font-nf">
                Recent Companies
              </h2>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 font-geist">
                <CreateProjectCard />
                {/* Company Cards */}
                {companies.slice(0, 5).map((company) => (
                  <Link
                    key={company.id}
                    href={`/dashboard/${company.id}`}
                    className="rounded-2xl group h-full w-full"
                  >
                    <Card className="flex flex-col h-full w-full group-hover:border-primary">
                      <CardHeader className="flex-1">
                        <CardTitle className="text-xl group-hover:text-primary transition-colors duration-150 ease-in-out">
                          {company.name}
                        </CardTitle>
                      </CardHeader>
                      <CardFooter className="border-t bg-muted/50 px-6 py-4">
                        <p className="text-sm text-muted-foreground group-hover:underline">
                          {company.id}
                        </p>
                      </CardFooter>
                    </Card>
                  </Link>
                ))}
              </div>
            </section>

            <Separator />

            {/* All Companies Section */}
            <section className="space-y-6">
              <h2 className="text-3xl font-semibold tracking-tight">
                All Companies
              </h2>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 font-geist">
                {companies.map((company) => (
                  <Link
                    key={company.id}
                    href={`/dashboard/${company.id}`}
                    className="rounded-2xl group"
                  >
                    <Card className="flex flex-col hover:border-primary">
                      <CardHeader className="flex-1">
                        <CardTitle className="text-xl group-hover:text-primary transition-colors duration-150 ease-in-out">
                          {company.name}
                        </CardTitle>
                      </CardHeader>
                      <CardFooter className="border-t bg-muted/50 px-6 py-4 rounded-b-xl">
                        <p className="text-sm text-muted-foreground group-hover:underline">
                          {company.id}
                        </p>
                      </CardFooter>
                    </Card>
                  </Link>
                ))}
              </div>
            </section>
          </>
        )}
      </div>
    </div>
  );
}
