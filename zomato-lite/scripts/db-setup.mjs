// Applies db/schema.sql and db/seed.sql. Run with: npm run db:setup
import { readFileSync } from "node:fs";
import { neon } from "@neondatabase/serverless";

const url = process.env.DATABASE_URL;
if (!url) { console.error("DATABASE_URL is missing."); process.exit(1); }
const sql = neon(url);

const run = async (file) => {
  const text = readFileSync(file, "utf8");
  const statements = text.split(";").map((s) => s.replace(/--.*$/gm, "").trim()).filter(Boolean);
  for (const s of statements) await sql.query(s);
};

await sql.query("DROP TABLE IF EXISTS reviews");
await sql.query("DROP TABLE IF EXISTS restaurants");
await run("db/schema.sql");
await run("db/seed.sql");
console.log(await sql.query("SELECT * FROM restaurants"));
console.log(await sql.query("SELECT * FROM reviews ORDER BY created_at"));
