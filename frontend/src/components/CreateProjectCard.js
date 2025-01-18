import React, { useState } from "react";
import { Plus } from "lucide-react";
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

const CreateProjectCard = () => {
  const { user } = useUser();
  const [isOpen, setIsOpen] = useState(false);
  const [projectData, setProjectData] = useState({
    name: "",
    description: "",
  });
  const [isLoading, setIsLoading] = useState(false);

  // Submit handler for project creation
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Ensure user is logged in
    if (!user) {
      console.error("No user found. Please log in.");
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
          userId: user.sid, // User ID from Auth0
          projectName: projectData.name,
          projectDescription: projectData.description,
          createdAt: new Date().toISOString(),
        }),
      });

      // Handle response
      if (!response.ok) {
        throw new Error("Failed to create project");
      }

      const result = await response.json();
      console.log("Project created successfully:", result);

      // Close dialog and reset form state
      setIsOpen(false);
      setProjectData({ name: "", description: "" });

      // Refresh the projects list here if needed
    } catch (error) {
      console.error("Error creating project:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Card className="flex flex-col border-dashed cursor-pointer hover:border-primary/50 transition-colors">
          <CardHeader className="flex-1">
            <CardTitle>
              <div className="flex h-full flex-col items-center justify-center gap-4 py-8 text-center">
                <Plus className="h-12 w-12 text-primary" />
                <span className="text-xl text-primary">Create a project</span>
              </div>
            </CardTitle>
          </CardHeader>
          <CardFooter className="border-t bg-muted/50 px-6 py-4">
            <p className="text-sm text-muted-foreground hover:text-primary">
              Explore a demo project
            </p>
          </CardFooter>
        </Card>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Create New Project</DialogTitle>
          <DialogDescription>
            Enter the details for your new project.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Project Name</Label>
              <Input
                id="name"
                type="text"
                required
                value={projectData.name}
                onChange={(e) =>
                  setProjectData((prev) => ({ ...prev, name: e.target.value }))
                }
                placeholder="Enter project name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Input
                id="description"
                type="text"
                value={projectData.description}
                onChange={(e) =>
                  setProjectData((prev) => ({
                    ...prev,
                    description: e.target.value,
                  }))
                }
                placeholder="Enter project description"
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Creating..." : "Create Project"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateProjectCard;
