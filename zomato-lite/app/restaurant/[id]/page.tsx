"use client";
// FRONTEND: Screen 2. Prints what the backend hands over. No maths, no sorting.
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";

type Review = { id: number; rating: number; comment: string; createdAt: string };
type Restaurant = {
  name: string; cuisine: string; area: string;
  averageRating: number | null; totalReviews: number;
  latestReview: Review | null; reviews: Review[];
};

const when = (iso: string) =>
  new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });

export default function RestaurantPage() {
  const { id } = useParams<{ id: string }>();
  const [data, setData] = useState<Restaurant | null>(null);
  const [missing, setMissing] = useState(false);

  useEffect(() => {
    fetch(`/api/restaurants/${id}`).then(async (r) => {
      if (!r.ok) return setMissing(true);
      setData(await r.json());
    });
  }, [id]);

  if (missing) return <p className="text-[var(--muted)]">Restaurant not found.</p>;
  if (!data) return <p className="text-[var(--muted)]">Loading…</p>;

  return (
    <div>
      <h1 className="text-2xl font-semibold">{data.name}</h1>
      <p className="mt-1 text-sm text-[var(--muted)]">{data.cuisine} · {data.area}</p>

      {data.totalReviews === 0 ? (
        <div className="mt-10 rounded-md border border-[var(--line)] p-6">
          <p>No reviews yet. Be the first to say what you thought.</p>
        </div>
      ) : (
        <>
          <p className="mt-10 flex items-baseline gap-3">
            <span className="text-7xl font-semibold leading-none">{data.averageRating}</span>
            <span className="text-sm text-[var(--muted)]">{data.totalReviews} reviews</span>
          </p>

          {data.latestReview && (
            <div className="mt-8 rounded-md border-l-4 border-[var(--accent)] bg-white/60 p-4">
              <p className="text-xs uppercase tracking-wide text-[var(--accent)]">Latest review</p>
              <p className="mt-2">{data.latestReview.comment}</p>
              <p className="mt-2 text-sm text-[var(--muted)]">
                {data.latestReview.rating} / 5 · {when(data.latestReview.createdAt)}
              </p>
            </div>
          )}

          <ul className="mt-8 divide-y divide-[var(--line)]">
            {data.reviews.map((r) => (
              <li key={r.id} className="py-4">
                <p>{r.comment}</p>
                <p className="mt-1 text-sm text-[var(--muted)]">{r.rating} / 5 · {when(r.createdAt)}</p>
              </li>
            ))}
          </ul>
        </>
      )}

      <Link href={`/review/${id}`} className="mt-10 inline-block underline">Write a review</Link>
    </div>
  );
}
