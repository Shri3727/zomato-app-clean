// BACKEND: GET /api/restaurants/[id]. Computes the answers fresh on every request.
import { NextResponse } from "next/server";
import { sql } from "@/lib/db";

export const dynamic = "force-dynamic";

type Row = { id: number; rating: number; comment: string; created_at: string };
const shape = (r: Row) => ({
  id: r.id,
  rating: r.rating,
  comment: r.comment,
  createdAt: r.created_at,
});

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id: raw } = await params;
  const id = Number(raw);
  if (!Number.isInteger(id)) return NextResponse.json({ error: "Restaurant not found." }, { status: 404 });

  const rest = await sql`SELECT name, cuisine, area FROM restaurants WHERE id = ${id}`;
  if (rest.length === 0) return NextResponse.json({ error: "Restaurant not found." }, { status: 404 });

  // The three lines of intelligence:
  const stats = await sql`
    SELECT ROUND(AVG(rating)::numeric, 1) AS avg, COUNT(*)::int AS total
    FROM reviews WHERE restaurant_id = ${id}`;
  const all = await sql`
    SELECT id, rating, comment, created_at FROM reviews
    WHERE restaurant_id = ${id} ORDER BY created_at DESC`;

  const total = stats[0].total as number;
  return NextResponse.json({
    name: rest[0].name,
    cuisine: rest[0].cuisine,
    area: rest[0].area,
    averageRating: total === 0 ? null : Number(stats[0].avg),
    totalReviews: total,
    latestReview: all.length ? shape(all[0] as Row) : null,
    reviews: (all.slice(1) as Row[]).map(shape),
  });
}
