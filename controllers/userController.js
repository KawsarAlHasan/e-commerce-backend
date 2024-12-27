const db = require("../config/db");
const bcrypt = require("bcrypt");
const { generateUserToken } = require("../config/userToken");
const { newUserEmail } = require("../middlewares/sandEmail");

// Sign up User
exports.signUpUser = async (req, res) => {
  try {
    const { first_name, last_name, email, password } = req.body;

    // Validate required fields
    if (!first_name || !last_name || !email || !password) {
      return res.status(400).send({
        success: false,
        message: "Please provide full_name, email & password required fields",
      });
    }

    // Check if email already exists in the database
    const [checkEmail] = await db.query(`SELECT * FROM users WHERE email=?`, [
      email,
    ]);

    if (checkEmail.length > 0) {
      return res.status(400).send({
        success: false,
        message: "Email already exists. Please use a different email.",
      });
    }

    // Hash the password before saving it to the database
    const hashedPassword = await bcrypt.hash(password, 10);

    const query =
      "INSERT INTO users (first_name, last_name, email, password) VALUES (?, ?, ?, ?)";

    const values = [first_name, last_name, email, hashedPassword];

    // Insert the user into the database
    const [result] = await db.query(query, values);

    // Handle failure in user insertion
    if (result.affectedRows === 0) {
      return res.status(500).send({
        success: false,
        message: "Failed to insert User, please try again",
      });
    }

    // Generate a JWT token for the newly created user
    const token = generateUserToken({ id: result.insertId, email });

    const emailData = {
      first_name,
      last_name,
      email,
      password,
    };

    // Send a welcome email to the new user
    const emailResult = await newUserEmail(emailData);
    if (!emailResult.messageId) {
      res.status(500).send("Failed to send email");
    }

    // Return success response with the generated token
    return res.status(200).json({
      success: true,
      message: "User signed up successfully",
      token,
    });
  } catch (error) {
    // Handle any errors that occur during the process
    return res.status(500).send({
      success: false,
      message: "An error occurred while signing up the user",
      error: error.message,
    });
  }
};

// User login
exports.userLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check if both email and password are provided
    if (!email || !password) {
      return res.status(401).json({
        success: false,
        error: "Please provide your credentials",
      });
    }

    // Check if the user exists in the database
    const [results] = await db.query(`SELECT * FROM users WHERE email=?`, [
      email,
    ]);
    if (results.length === 0) {
      return res.status(401).json({
        success: false,
        error: "Email and Password is not correct",
      });
    }

    const user = results[0];

    // Compare the provided password with the hashed password in the database
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        error: "Email and Password is not correct",
      });
    }

    // Generate token for the user after successful authentication
    const token = generateUserToken({ id: user.id });

    // Remove password from the user data before sending the response
    const { password: pwd, ...usersWithoutPassword } = user;

    // Respond with user data and token
    res.status(200).json({
      success: true,
      message: "Successfully logged in",
      data: {
        user: usersWithoutPassword,
        token,
      },
    });
  } catch (error) {
    res.status(400).send({
      success: false,
      message: "User Login Unsuccessful",
      error: error.message,
    });
  }
};

// Get current authenticated user
exports.getMeUser = async (req, res) => {
  try {
    // Retrieve the user from the decoded token
    const user = req.decodedUser;

    // Respond with the user data
    res.status(200).json(user);
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message,
    });
  }
};

// Get all users with pagination and optional filtering by status
exports.getAllUsers = async (req, res) => {
  try {
    let { page, limit, status } = req.query;

    // User status options: 'Active', 'Inactive', 'Pending', 'Suspended', 'Deactivated', 'Banned', 'Verified', 'Unverified', 'Archived'

    // Set default pagination values if not provided
    page = parseInt(page) || 1; // Default to page 1
    limit = parseInt(limit) || 20; // Default to 20 users per page
    const offset = (page - 1) * limit; // Calculate the offset for the query

    // Initialize SQL query and parameters array
    let sqlQuery = "SELECT * FROM users WHERE 1=1"; // 1=1 simplifies appending conditions
    const queryParams = [];

    // Add status filter if provided
    if (status) {
      sqlQuery += " AND status LIKE ?";
      queryParams.push(`%${status}%`); // Use LIKE for partial match on status
    }

    // Add pagination to the query
    sqlQuery += " LIMIT ? OFFSET ?";
    queryParams.push(limit, offset);

    // Execute the query with filters and pagination
    const [data] = await db.query(sqlQuery, queryParams);

    // If no users found, send an appropriate response
    if (!data || data.length === 0) {
      return res.status(200).send({
        success: true,
        message: "No users found",
        data: [],
      });
    }

    // Get the total count of users for pagination info (apply same filters)
    let countQuery = "SELECT COUNT(*) as count FROM users WHERE 1=1";
    const countParams = [];

    // Apply the same filters to the total count query
    if (status) {
      countQuery += " AND status LIKE ?";
      countParams.push(`%${status}%`);
    }

    // Execute the count query
    const [totalUsersCount] = await db.query(countQuery, countParams);
    const totalUsers = totalUsersCount[0].count;

    // Send response with user data and pagination info
    res.status(200).send({
      success: true,
      message: "Get All Users",
      totalUsers: totalUsers,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(totalUsers / limit),
        limit,
      },
      data: data,
    });
  } catch (error) {
    // Handle any errors that occur during the process
    res.status(500).send({
      success: false,
      message: "Error in Get All Users",
      error: error.message,
    });
  }
};

// Get a single user by their ID
exports.getSingleUser = async (req, res) => {
  try {
    const userId = req.params.id;

    // Query the database for a user with the provided ID
    const [data] = await db.query(`SELECT * FROM users WHERE id=?`, [userId]);

    // If no user found, send a 404 response
    if (!data || data.length === 0) {
      return res.status(201).send({
        success: false,
        message: "No user found",
      });
    }

    // Send the user data as the response
    res.status(200).send({
      success: true,
      message: "Get Single User by ID",
      data: data[0],
    });
  } catch (error) {
    // Handle any errors that occur during the process
    res.status(500).send({
      success: false,
      message: "Error in getting user",
      error: error.message,
    });
  }
};

// Update user data based on the provided information
exports.updateUser = async (req, res) => {
  try {
    const userPreData = req.decodedUser; // Retrieve the current user data from the decoded token

    // Extract the updated data from the request body
    const { first_name, last_name, phone_number, date_of_birth, gender } =
      req.body;

    // Execute the update query in the database
    const [data] = await db.query(
      `UPDATE users SET first_name=?, last_name=?, phone_number=?, date_of_birth=?, gender=? WHERE id = ?`,
      [
        first_name || userPreData.first_name, // Use provided values or keep existing ones if not provided
        last_name || userPreData.last_name,
        phone_number || userPreData.phone_number,
        date_of_birth || userPreData.date_of_birth,
        gender || userPreData.gender,
        userPreData.id, // Update the user record with the current user's ID
      ]
    );

    // Check if any rows were affected (indicating a successful update)
    if (data.affectedRows == 0) {
      return res.status(500).send({
        success: false,
        message: "Error in updating user", // If no rows were affected, the update failed
      });
    }

    // Send success response after the update
    res.status(200).send({
      success: true,
      message: "User updated successfully",
    });
  } catch (error) {
    // Handle any errors that occur during the process
    res.status(500).send({
      success: false,
      message: "Error in updating user",
      error: error.message,
    });
  }
};
