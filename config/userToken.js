const jwt = require("jsonwebtoken");

// Generates a JWT for a user, valid for 365 days
exports.generateUserToken = (userInfo) => {
  const payload = {
    id: userInfo.id,
    email: userInfo.email,
  };

  // Generate a signed token using the payload and secret key
  const userToken = jwt.sign(payload, process.env.TOKEN_SECRET, {
    expiresIn: "365 days", // Token expiration period
  });

  return userToken; // Return the generated token
};
