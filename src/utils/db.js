import pg from "pg";
import dotenv from "dotenv";

dotenv.config();

const { Pool } = pg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
});

pool.on("connect", () => {
  console.log("postgress connected,crm db is up");
});

pool.on("error", () => {
  console.log("failed to connect to crm db");
  process.exit(1);
});

export default pool;
