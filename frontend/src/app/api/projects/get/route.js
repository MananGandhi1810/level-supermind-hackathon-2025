import { createClient } from "@astrajs/collections";
import { NextResponse } from "next/server";

let astraClient = null;

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

export async function GET(request) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json(
        { message: "userId is required" },
        { status: 400 }
      );
    }

    let astraClient = await getAstraClient();
    const usersCollection = astraClient
      .namespace(process.env.ASTRA_DB_KEYSPACE)
      .collection("users");

    // Fetch the user's data by userId
    let userData = await usersCollection.get(userId).catch(() => null);

    // If user doesn't exist, create a new user
    if (!userData) {
      const newUser = {
        id: userId,
        projects: [],
        createdAt: new Date().toISOString(),
      };

      // Create the new user in the database
      await usersCollection.create(userId, newUser);

      // Fetch the newly created user
      userData = await usersCollection.get(userId);
    }

    // Return the user's data
    return NextResponse.json({ user: userData }, { status: 200 });
  } catch (error) {
    console.error("Error handling user data:", error);
    return NextResponse.json(
      { message: "Failed to handle user data", error: error.message },
      { status: 500 }
    );
  }
}
