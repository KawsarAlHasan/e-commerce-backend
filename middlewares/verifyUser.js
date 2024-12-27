const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
const db = require("../config/db");
dotenv.config();

/**
 * Middleware for authenticating users based on JWT tokens.
 * Extracts the token from the Authorization header, verifies it, and fetches the user from the database.
 * If valid, attaches the user information to the `req` object and allows the request to proceed.
 */
module.exports = async (req, res, next) => {
  try {
    // Extract the token from the Authorization header
    const token = req.headers?.authorization?.split(" ")?.[1];

    // If no token is provided, return an unauthorized error
    if (!token) {
      return res.status(401).json({
        success: false,
        error: "You are not logged in", // Unauthorized: Missing token
      });
    }

    // Verify the provided token using the secret key
    jwt.verify(token, process.env.TOKEN_SECRET, async (err, decoded) => {
      if (err) {
        // If the token is invalid or expired, return a forbidden error
        return res.status(403).send({ message: "Forbidden access" });
      }

      // Extract the user ID from the decoded token
      const userID = decoded.id;

      // Query the database to find the user associated with the ID
      const [result] = await db.query(`SELECT * FROM users WHERE id=?`, [
        userID,
      ]);
      const user = result[0];

      // If the user does not exist, return a not found error
      if (!user) {
        return res.status(404).json({
          error: "User not found. Please Login Again", // User record not found
        });
      }

      // Attach the user details to the request object for downstream use
      req.decodedUser = user;

      // Allow the request to proceed to the next middleware or route handler
      next();
    });
  } catch (error) {
    // Handle any unexpected errors during token verification or database query
    res.status(403).json({
      success: false,
      message: "Invalid Token",
      error: error.message,
    });
  }
};
