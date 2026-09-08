import { createInterface } from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";
import { Client } from "pg";
import bcrypt from "bcryptjs";

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) throw new Error("DATABASE_URL is required");

const readline = createInterface({ input, output });
const email = (await readline.question("Admin email: ")).trim().toLowerCase();
const password = await readline.question("Admin password: ", { hideEchoBack: true });
readline.close();
if (!email || password.length < 12) throw new Error("Use a valid email and a password of at least 12 characters");

const client = new Client({ connectionString: databaseUrl });
await client.connect();
const passwordHash = await bcrypt.hash(password, 12);
await client.query("BEGIN");
const updated = await client.query(
  "UPDATE users SET password_hash = $2, is_admin = true, updated_at = now() WHERE lower(email) = lower($1)",
  [email, passwordHash],
);
if (updated.rowCount === 0) {
  await client.query(
    "INSERT INTO users (id, email, password_hash, is_admin) VALUES (gen_random_uuid(), $1, $2, true)",
    [email, passwordHash],
  );
}
await client.query("COMMIT");
await client.end();
console.log("Neon admin account created or updated.");
