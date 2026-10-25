import Link from "next/link";

export default function Home() {
  return (
    <p className="text-[var(--muted)]">
      Zomato Lite is alive. <Link className="underline" href="/restaurant/1">See the restaurant</Link>
    </p>
  );
}
