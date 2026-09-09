import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { chatSessions } from "@/lib/db/shema";
import { desc } from "drizzle-orm";


export async function POST(request: Request) {
  try {
    const body = await request.json();

    const title = body.title || "New Chat";

    const [session] = await db
      .insert(chatSessions)
      .values({
        title,
      })
      .returning();

    return NextResponse.json({
      success: true,
      session,
    });
  } catch (error) {
    console.error("Failed to create session:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to create chat session",
      },
      { status: 500 },
    );
  }
}

export async function GET() {
  try {
    const sessions = await db
      .select()
      .from(chatSessions)
      .orderBy(desc(chatSessions.updatedAt));

    return NextResponse.json({
      success: true,
      sessions,
    });
  } catch (error) {
    console.error("Failed to get sessions:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to get chat sessions",
      },
      { status: 500 },
    );
  }
}

export async function DELETE() {
  try {
    await db.delete(chatSessions);

    return NextResponse.json({
      success: true,
      message: "All sessions deleted successfully",
    });
  } catch (error) {
    console.error("Failed to delete all sessions:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to delete all sessions",
      },
      { status: 500 },
    );
  }
}