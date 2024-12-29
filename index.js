const express = require("express");
const dotenv = require("dotenv");
const bodyParser = require("body-parser");
const mySqlPool = require("./config/db");
const path = require("path");
const cors = require("cors");

// Load environment variables from .env file
dotenv.config();

// Initialize the Express application
const app = express();

// Configure global CORS options to allow requests from any origin
const globalCorsOptions = {
  origin: "*",
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
  allowedHeaders: "Content-Type,Authorization",
};
app.use(cors(globalCorsOptions)); // Enable CORS with the specified options
app.options("*", cors(globalCorsOptions)); // Pre-flight handling for all routes

// Middleware for parsing JSON and URL-encoded payloads
app.use(bodyParser.json());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static Files
app.use("/public", express.static(path.join(__dirname, "public")));

// Routers
app.use("/api/v1/user", require("./routers/userRoute"));

// Test MySQL database connection
mySqlPool
  .query("SELECT 1")
  .then(() => {
    console.log("MYSQL DB Connected");
  })
  .catch((error) => {
    console.log(error);
  });

// Define the root route for verifying server functionality
app.get("/", (req, res) => {
  res.status(200).send("E-Commerce server is working");
});

// Catch-all route for undefined endpoints, returning a 404 error
app.use("*", (req, res, next) => {
  res.status(404).json({
    error: "You have hit the wrong route",
  });
});

// Set the server's port from the environment variables or default to 5000
const port = process.env.PORT || 5000;

// Start the server and log the port it is running on
app.listen(port, () => {
  console.log(`E-Commerce server is running on port ${port}`);
});
