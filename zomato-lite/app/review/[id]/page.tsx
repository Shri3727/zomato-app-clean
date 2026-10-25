"use client";
// FRONTEND: Screen 1. Collects input, hands it to the backend, shows what the backend says.
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

export default function ReviewPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [name, setName] = useState("");
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    fetch(`/api/restaurants/${id}`).then((r) => r.json()).then((d) => setName(d.name ?? ""));
  }, [id]);

  async function submit() {
    setBusy(true); setError("");
    const res = await fetch("/api/reviews", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ restaurantId: Number(id), rating, comment }),
    });
    const data = await res.json();
    if (!res.ok) { setError(data.error); setBusy(false); return; }
    router.push(`/restaurant/${id}`);
  }

  return (
    <div>
      <p className="text-sm text-[var(--muted)]">Write a review for</p>
      <h1 className="mt-1 text-2xl font-semibold">{name}</h1>

      <div className="mt-8 flex gap-2" role="radiogroup" aria-label="Rating">
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            type="button"
            onClick={() => setRating(n)}
            aria-label={`${n} star${n > 1 ? "s" : ""}`}
            className={`h-11 w-11 rounded-md border text-lg transition-colors ${
              n <= rating
                ? "border-[var(--accent)] bg-[var(--accent)] text-white"
                : "border-[var(--line)] text-[var(--muted)]"
            }`}
          >
            {n}
          </button>
        ))}
      </div>

      <textarea
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        rows={5}
        placeholder="What was it like?"
        className="mt-6 w-full rounded-md border border-[var(--line)] bg-transparent p-3 outline-none focus:border-[var(--fg)]"
      />

      {error && <p className="mt-3 text-sm text-[var(--accent)]">{error}</p>}

      <button
        onClick={submit}
        disabled={busy || rating === 0 || comment.trim() === ""}
        className="mt-6 w-full rounded-md bg-[var(--fg)] py-3 text-[var(--bg)] disabled:opacity-30"
      >
        Submit
      </button>
    </div>
  );
}
