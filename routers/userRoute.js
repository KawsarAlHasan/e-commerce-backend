const express = require("express");
const {
  signUpUser,
  userLogin,
  getMeUser,
  getAllUsers,
  getSingleUser,
  updateUser,
} = require("../controllers/userController");
const verifyUser = require("../middlewares/verifyUser");

const router = express.Router();

router.post("/signup", signUpUser);
router.post("/login", userLogin);
router.get("/me", verifyUser, getMeUser);
router.get("/all", getAllUsers); // all user for admin
router.get("/:id", getSingleUser);
router.put("/update", verifyUser, updateUser);

module.exports = router;
