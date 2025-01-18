import { createClient } from "@astrajs/collections";
import { NextResponse } from "next/server";

let astraClient;

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
    console.log(userId);

    if (!userId) {
      return NextResponse.json(
        { message: "userId is required" },
        { status: 400 }
      );
    }

    const astraClient = await getAstraClient();
    const usersCollection = astraClient
      .namespace(process.env.ASTRA_DB_KEYSPACE)
      .collection("users");

    // Fetch the user's data by userId
    const userData = await usersCollection.get(userId).catch(() => null);

    if (!userData) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    // Return the user's data (including projects)
    return NextResponse.json({ user: userData }, { status: 200 });
  } catch (error) {
    console.error("Error fetching user data:", error);
    return NextResponse.json(
      { message: "Failed to fetch user data", error: error.message },
      { status: 500 }
    );
  }
}
