import express from "express";
import {
  userRegister,
  getAllUser,
  getUserById,
  updateUserById,
  deleteUserById,
  login,
  sendEmail,
  restPassword,
  changePassword,
} from "../controllers/useController.js";
import authenticateToken from "../middleware/authenticateToken.js";
const router = express();
router.post("/register", userRegister);
router.get("/getAllUsers", getAllUser);
router.get("/getUserById", getUserById);
router.put("/updateUserById", updateUserById);
router.delete("/deleteUserById", deleteUserById);
router.post("/login", login);
router.get("/protected-route", authenticateToken, (req, res) => {
  res.json({ message: "This is a protected route", user: req.user });
});
router.post("/send-email", sendEmail);
router.post("/reset-password", restPassword);
router.post("/change-password", changePassword);

export default router;
