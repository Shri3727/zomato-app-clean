// BACKEND: POST /api/reviews. Never trusts the caller; validates everything.
import { NextResponse } from "next/server";
import { sql } from "@/lib/db";

const bad = (error: string) => NextResponse.json({ error }, { status: 400 });

export async function POST(req: Request) {
  let body: { restaurantId?: unknown; rating?: unknown; comment?: unknown } | null;
  try { body = await req.json(); } catch { return bad("Request body must be valid JSON."); }

  const { restaurantId, rating, comment } = body ?? {};

  if (typeof rating !== "number" || !Number.isInteger(rating) || rating < 1 || rating > 5)
    return bad("Rating must be a whole number from 1 to 5.");

  if (typeof comment !== "string" || comment.trim() === "")
    return bad("Comment cannot be empty.");

  if (typeof restaurantId !== "number" || !Number.isInteger(restaurantId))
    return bad("That restaurant does not exist.");
  const found = await sql`SELECT id FROM restaurants WHERE id = ${restaurantId}`;
  if (found.length === 0) return bad("That restaurant does not exist.");

  const rows = await sql`
    INSERT INTO reviews (restaurant_id, rating, comment)
    VALUES (${restaurantId}, ${rating}, ${comment.trim()})
    RETURNING id`;
  return NextResponse.json({ success: true, reviewId: rows[0].id }, { status: 201 });
}
