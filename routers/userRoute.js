const express = require("express");
const {
  signUpUser,
  userLogin,
  getMeUser,
  getAllUsers,
  getSingleUser,
  updateUser,
  changeProfilePicture,
  userStatusUpdate,
  updateUserPassword,
  deleteUser,
} = require("../controllers/userController");
const verifyUser = require("../middlewares/verifyUser");

const uploader = require("../middlewares/uploader");

const router = express.Router();

router.post("/signup", signUpUser);
router.post("/login", userLogin);
router.get("/me", verifyUser, getMeUser);
router.get("/all", getAllUsers); // all user for admin
router.get("/:id", getSingleUser);
router.put("/update", verifyUser, updateUser);
router.put(
  "/change-profile-picture",
  uploader.single("image"),
  verifyUser,
  changeProfilePicture
);
router.put("/status/:id", userStatusUpdate); // status update only for admin
router.put("/password-change", verifyUser, updateUserPassword); // status update only for admin
router.delete("/delete/:id", deleteUser); // user delete only for admin

module.exports = router;
