"use client";

import React, { useState } from "react";
import { Plus } from 'lucide-react';
import { useUser } from "@auth0/nextjs-auth0/client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";

const CreateProjectCard = () => {
  const { user } = useUser();
  const [isOpen, setIsOpen] = useState(false);
  const [companyData, setCompanyData] = useState({
    name: "",
    url: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({
    name: "",
    url: "",
    general: "",
  });

  const validateURL = (url) => {
    const pattern = /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/;
    return pattern.test(url);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Reset errors
    setErrors({ name: "", url: "", general: "" });

    // Validate inputs
    let hasErrors = false;
    if (!companyData.name.trim()) {
      setErrors((prev) => ({ ...prev, name: "Company name is required" }));
      hasErrors = true;
    }
    if (companyData.url && !validateURL(companyData.url)) {
      setErrors((prev) => ({ ...prev, url: "Please enter a valid URL" }));
      hasErrors = true;
    }

    if (hasErrors) return;

    // Ensure user is logged in
    if (!user) {
      setErrors((prev) => ({ ...prev, general: "No user found. Please log in." }));
      return;
    }

    // Disable form submission while loading
    setIsLoading(true);

    try {
      // API call to create the project
      const response = await fetch("/api/projects/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: user.email,
          companyName: companyData.name,
          companyURL: companyData.url,
          createdAt: new Date().toISOString(),
        }),
      });

      // Handle response
      if (!response.ok) {
        throw new Error("Failed to create project");
      }

      const result = await response.json();

      console.log("Project created successfully:", result);
      window.location.reload();

      // Close dialog and reset form state
      setIsOpen(false);
      setCompanyData({ name: "", url: "" });
      window.location.reload();
      // Refresh the projects list here if needed
    } catch (error) {
      console.error("Error creating company:", error);
      setErrors((prev) => ({ ...prev, general: "Failed to create company. Please try again." }));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Card className="flex flex-col border-2 border-dashed cursor-pointer hover:border-primary/50 transition-colors group">
          <CardHeader className="flex-1">
            <CardTitle>
              <div className="flex h-full flex-col items-center justify-center gap-4 py-8 text-center">
                <Plus className="h-12 w-12 text-primary" />
                <span className="text-xl text-primary">Add a company</span>
              </div>
            </CardTitle>
          </CardHeader>
          <CardFooter className="border-t bg-muted/50 px-6 py-4">
            <p className="text-sm text-muted-foreground hover:text-primary group-hover:underline ">
              Explore a demo project
            </p>
          </CardFooter>
        </Card>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add New company</DialogTitle>
          <DialogDescription>
            Enter the details for your company.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            {errors.general && (
              <Alert variant="destructive">
                <AlertDescription>{errors.general}</AlertDescription>
              </Alert>
            )}
            <div className="space-y-2">
              <Label htmlFor="name">Company Name</Label>
              <Input
                id="name"
                type="text"
                required
                value={companyData.name}
                onChange={(e) =>
                  setCompanyData((prev) => ({ ...prev, name: e.target.value }))
                }
                placeholder="Enter company name"
              />
              {errors.name && <p className="text-sm text-destructive">{errors.name}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="url">Company website URL</Label>
              <Input
                id="url"
                type="text"
                value={companyData.url}
                onChange={(e) =>
                  setCompanyData((prev) => ({
                    ...prev,
                    url: e.target.value,
                  }))
                }
                placeholder="Enter company URL"
              />
              {errors.url && <p className="text-sm text-destructive">{errors.url}</p>}
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Adding..." : "Add company"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateProjectCard;
