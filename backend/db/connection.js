//Code for database connection using the pg library
const pg = require("pg");
const dotenv = require("dotenv");

dotenv.config();

const { Pool } = pg;

const db = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
  max: 10,
    idleTimeoutMillis: 10000,
    connectionTimeoutMillis: 10000,
    keepAlive: true,
});

db.on('error', (err) => {
    console.error("Unexpected database error:", err);
});

module.exports = db;