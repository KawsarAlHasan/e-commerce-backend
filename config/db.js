const mysql = require("mysql2/promise"); // Import MySQL promise-based library
require("dotenv").config();

// Create a MySQL connection pool using environment variables
const mySqlPool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

// Export the connection pool for use in other parts of the application
module.exports = mySqlPool;
