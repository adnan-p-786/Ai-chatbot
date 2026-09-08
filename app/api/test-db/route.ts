import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { sql } from "drizzle-orm";

export async function GET() {
  try {
    const result = await db.execute(sql`SELECT NOW()`);

    return NextResponse.json({
      success: true,
      message: "PostgreSQL connected successfully",
      time: result,
    });
  } catch (error) {
    console.error("Database error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Database connection failed",
      },
      { status: 500 }
    );
  }
}