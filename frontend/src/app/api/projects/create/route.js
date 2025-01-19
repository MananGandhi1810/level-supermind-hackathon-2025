import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@astrajs/collections";

let astraClient;

// Lazy initialization of Astra client
async function getAstraClient() {
  if (!astraClient) {
    astraClient = await createClient({
      astraDatabaseId: process.env.ASTRA_DB_ID,
      astraDatabaseRegion: process.env.ASTRA_DB_REGION,
      applicationToken: process.env.ASTRA_DB_APPLICATION_TOKEN,
    });
  }
  return astraClient;
}

export async function POST(req) {
  try {
    const body = await req.json();
    const { userId, companyName, companyURL, createdAt } = body;

    if (!userId || !companyName || !companyURL || !createdAt) {
      return NextResponse.json(
        {
          message:
            "Missing required fields: userId, projectName, projectDescription, or createdAt",
        },
        { status: 400 }
      );
    }

    const astraClient = await getAstraClient();
    const usersCollection = astraClient
      .namespace(process.env.ASTRA_DB_KEYSPACE)
      .collection("users");

    // Generate a unique project ID
    const companyId = `${companyName
      .toLowerCase()
      .replace(/\s+/g, "-")}-${Math.random().toString(36).substr(2, 5)}`;

    // Define the new project
    const newCompany = {
      id: companyId,
      name: companyName,
      url: companyURL,
      createdAt,
    };

    // Check if the user's collection already exists
    const userExists = await usersCollection.get(userId).catch(() => null);
    console.log(userExists);

    if (userExists) {
      // Append the new project to the user's `projects` array
      const updatedCompanies = [...(userExists.companies || []), newCompany];
      await usersCollection.update(userId, { companies: updatedCompanies });
    } else {
      // Create a new user collection and add the project
      const userData = {
        id: userId,
        companies: [newCompany],
      };
      console.log(await usersCollection.create(userId, userData));
    }

    return NextResponse.json(
      { message: "Company added successfully", company: newCompany },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating or updating user collection:", error);
    return NextResponse.json(
      { message: "Failed to add project", error: error.message },
      { status: 500 }
    );
  }
}
