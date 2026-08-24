import pg from "pg";
import dotenv from "dotenv";

dotenv.config();

const { Pool } = pg;

const db = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT || 6543,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  max: 2,
  idleTimeoutMillis: 5000,
  connectionTimeoutMillis: 10000,
  allowExitOnIdle: true,

  ssl: {
    rejectUnauthorized: false
  }
});

db.on("connect", () => {
  console.log("DB pool: new connection");
});
db.on("error", (err) => {
  console.error("DB pool error:", err.message);
});

export default db;