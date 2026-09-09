import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { chatSessions } from "@/lib/db/shema";
import { eq } from "drizzle-orm";

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

    const [session] = await db
      .select()
      .from(chatSessions)
      .where(eq(chatSessions.id, sessionId))
      .limit(1);

    if (!session) {
      return NextResponse.json(
        {
          success: false,
          message: "Session not found",
        },
        { status: 404 },
      );
    }

    return NextResponse.json({
      success: true,
      session,
    });
  } catch (error) {
    console.error("Failed to get session:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to get session",
      },
      { status: 500 },
    );
  }
}

export async function PATCH(
  request: Request,
  context: Context,
) {
  try {
    const { sessionId } = await context.params;
    const body = await request.json();
    const { title } = body;

    if (!title || typeof title !== "string") {
      return NextResponse.json(
        {
          success: false,
          message: "A valid title is required",
        },
        { status: 400 },
      );
    }

    const [updatedSession] = await db
      .update(chatSessions)
      .set({
        title: title.trim(),
        updatedAt: new Date(),
      })
      .where(eq(chatSessions.id, sessionId))
      .returning();

    if (!updatedSession) {
      return NextResponse.json(
        {
          success: false,
          message: "Session not found",
        },
        { status: 404 },
      );
    }

    return NextResponse.json({
      success: true,
      session: updatedSession,
    });
  } catch (error) {
    console.error("Failed to update session:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to update session",
      },
      { status: 500 },
    );
  }
}

export async function DELETE(
  request: Request,
  context: Context,
) {
  try {
    const { sessionId } = await context.params;

    const [deletedSession] = await db
      .delete(chatSessions)
      .where(eq(chatSessions.id, sessionId))
      .returning();

    if (!deletedSession) {
      return NextResponse.json(
        {
          success: false,
          message: "Session not found",
        },
        { status: 404 },
      );
    }

    return NextResponse.json({
      success: true,
      message: "Session deleted successfully",
    });
  } catch (error) {
    console.error("Failed to delete session:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to delete session",
      },
      { status: 500 },
    );
  }
}
