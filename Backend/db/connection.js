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
});

module.exports = db;