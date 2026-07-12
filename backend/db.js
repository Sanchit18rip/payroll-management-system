import pg from "pg";

const { Pool } = pg;

const db = new Pool({
  host: "aws-1-ap-northeast-2.pooler.supabase.com",
  port: 6543,
  database: "postgres",
  user: "postgres.eikeuvwyjxghyzjepcfm",
  password: "Data@base0901",
  ssl: {
    rejectUnauthorized: false
  }
});

db.connect()
  .then(() => {
    console.log("Supabase PostgreSQL Connected");
  })
  .catch((err) => {
    console.log(err);
  });

export default db;