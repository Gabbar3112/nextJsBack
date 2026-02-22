import postgres from "postgres";
import { migrate } from "drizzle-orm/postgres-js/migrator";
import { drizzle } from "drizzle-orm/postgres-js";
import dotenv from "dotenv";
dotenv.config();

const DATABASE_URL = process.env.DATABASE_URL!;
const DB_NAME = process.env.DB_NAME; // change this

async function main() {
    // Connect to default postgres database
    const admin = postgres(
        DATABASE_URL.replace(DB_NAME, "postgres"),
        { max: 1 }
    );

    // Check if database exists
    const result = await admin`
    SELECT 1 FROM pg_database WHERE datname = ${DB_NAME}
  `;

    if (result.length === 0) {
        console.log("Creating database...");
        await admin`CREATE DATABASE ${admin(DB_NAME)}`;
    } else {
        console.log("Database already exists.");
    }

    await admin.end();

    // Now connect to your actual DB
    const client = postgres(DATABASE_URL);
    const db = drizzle(client);

    // Run migrations (creates tables)
    console.log("Running migrations...");
    await migrate(db, {
        migrationsFolder: "./drizzle",
    });

    console.log("Database & tables are ready.");
    await client.end();
}

main().catch((err) => {
    console.error(err);
    process.exit(1);
});