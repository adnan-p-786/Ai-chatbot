import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { chatMessages, chatSessions } from "@/lib/db/shema";
import { asc, eq } from "drizzle-orm";

type Context = {
  params: Promise<{
    sessionId: string;
  }>;
};

export async function GET(
  request: Request,
  context: Context,
) {
  try {
    const { sessionId } = await context.params;

    const messages = await db
      .select()
      .from(chatMessages)
      .where(eq(chatMessages.sessionId, sessionId))
      .orderBy(asc(chatMessages.createdAt));

    return NextResponse.json({
      success: true,
      messages,
    });
  } catch (error) {
    console.error("Failed to get messages:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to get messages",
      },
      { status: 500 },
    );
  }
}


export async function POST(
  request: Request,
  context: Context,
) {
  try {
    const { sessionId } = await context.params;

    const body = await request.json();

    const { role, content } = body;

    if (!role || !content) {
      return NextResponse.json(
        {
          success: false,
          message: "role and content are required",
        },
        { status: 400 },
      );
    }

    const [message] = await db
      .insert(chatMessages)
      .values({
        sessionId,
        role,
        content,
      })
      .returning();

    // Update session's last activity
    await db
      .update(chatSessions)
      .set({
        updatedAt: new Date(),
      })
      .where(eq(chatSessions.id, sessionId));

    return NextResponse.json({
      success: true,
      message,
    });
  } catch (error) {
    console.error("Failed to save message:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to save message",
      },
      { status: 500 },
    );
  }
}