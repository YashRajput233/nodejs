import User from "../models/useModules.js";
import bcrypt from "bcrypt";
import jwt, { decode } from "jsonwebtoken";
import { isValidEmail, isValidPassword } from "../utils/validation.js";
import envConfig from "../config/envConfig.js";
import transporter from "../middleware/emailConfig.js";

// user register

const userRegister = async (req, res) => {
  try {
    const { fullName, email, password } = req.body;
    if (!fullName || !email || !password) {
      return res.status(404).json({ message: "all fields are required" });
    }
    const findUserEmail = await User.findOne({ email });
    if (findUserEmail) {
      return res
        .status(402)
        .json({ message: "this email is already in use,please try again" });
    }
    const validEmail = isValidEmail(email);
    if (!validEmail) {
      return res.status(401).json({ message: "email is not valid" });
    }
    const validPassword = isValidPassword(password);
    if (!validPassword) {
      return res.status(401).json({ message: "password is not valid" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashPassword = await bcrypt.hash(password, salt);
    const newDoc = new User({
      fullName,
      email,
      password: hashPassword,
    });
    const saveUser = newDoc.save();
    if (saveUser) {
      return res.status(200).json({ message: "user register succesfully" });
    } else {
      return res.status(400).json({ message: "user not register" });
    }
  } catch (error) {
    console.error("error in user registration");
    return res
      .status(500)
      .json({ message: "error in user registration", error });
  }
};

//get all users

const getAllUser = async (req, res) => {
  try {
    const getUsers = await User.find({});
    if (!getUsers) {
      return res.status(404).json({ message: "User not found" });
    } else {
      return res.status(200).json({ message: "User found", getUsers });
    }
  } catch (error) {
    return res.status(500).json({ message: "error in get user ", error });
  }
};

//get user by id only

const getUserById = async (req, res) => {
  try {
    const token = req.header("Authorization")?.split(" ")[1];
    const decode = jwt.verify(token, envConfig.SECREAT_KEY);
    if (!decode) {
      return res.status(401).json({ message: "Invalid token" });
    }
    const getUsers = await User.findById(decode.id);
    if (!getUsers) {
      return res.status(404).json({ message: "User not found" });
    } else {
      return res.status(200).json({ message: "User found", getUsers });
    }
  } catch (error) {
    return res.status(500).json({ message: "error in get user ", error });
  }
};
// update user by id

const updateUserById = async (req, res) => {
  try {
    const token = req.header("Authorization")?.split(" ")[1];
    const decode = jwt.verify(token, envConfig.SECREAT_KEY);
    if (!decode) {
      return res.status(401).json({ message: "Invalid token" });
    }
    const { fullName } = req.body;
    const user = await User.findById(decode.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    const updatedUser = await User.findByIdAndUpdate(
      decode.id,
      { fullName },
      {
        new: true,
      }
    );
    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    } else {
      return res.status(200).json({ message: "User updated", updatedUser });
    }
  } catch (error) {
    return res.status(500).json({ message: "Error updating user", error });
  }
};

// delete user by id
const deleteUserById = async (req, res) => {
  try {
    const token = req.header("Authorization")?.split(" ")[1];
    const decode = jwt.verify(token, envConfig.SECREAT_KEY);
    if (!decode) {
      return res.status(401).json({ message: "Invalid token" });
    }
    const deletedUser = await User.findByIdAndDelete(decode.id);
    if (!deletedUser) {
      return res.status(404).json({ message: "User not deleted" });
    } else {
      return res.status(200).json({ message: "User deleted", deletedUser });
    }
  } catch (error) {
    return res.status(500).json({ message: "Error deleting user", error });
  }
};

//login api

const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const mainuser = await User.findOne({ email });
    if (!mainuser) {
      return res.status(401).json({ message: "user not exist" });
    }
    const matchpassword = await bcrypt.compare(password, mainuser.password);
    if (!matchpassword) {
      return res.status(401).json({ message: "not match password" });
    }
    const token = jwt.sign({ id: mainuser._id }, envConfig.SECREAT_KEY, {
      expiresIn: "1h",
    });
    let userInfo={token:token}
    return res.status(200).json({ message: "login sucessful", userInfo });
  } catch (error) {
    res.status(500).json({ error: "Error during login", error });
  }
};

// send email

const sendEmail = async (req, res) => {
  try {
    const { email } = req.body;
    if (email) {
      const user = await User.findOne({ email });
      if (!user) {
        return res.status(401).json({ message: "Email is not found" });
      } else {
        const genToken = jwt.sign({ _id: user._id }, envConfig.SECREAT_KEY, {
          expiresIn: "1h",
        });
        const link = `http://localhost:3000/reset-password/?token=${genToken}`;
        const sendMail = await transporter.sendMail({
          from: envConfig.EMAIL_USER,
          to: user.email,
          subject: "Reset Password",
          html: `Click here to reset your password <a href= ${link}>click here</a> `,
        });
        return res
          .status(200)
          .json({ message: "Email is sent, please check your email" });
      }
    }
  } catch (error) {
    res.status(500).json({ error: "Error during sending mail", error });
  }
};

//reset password

const restPassword = async (req, res) => {
  try {
    const { newpassword, confirmPassword } = req.body;
    const token = req.query.token;
    const decode = jwt.verify(token, envConfig.SECREAT_KEY);
    const user = await User.findById(decode._id);
    if (!newpassword) {
      return res.status(400).json({ message: "new passoword is required" });
    }
    if (!confirmPassword) {
      return res.status(400).json({ message: "confirm passoword is required" });
    }
    if (newpassword !== confirmPassword) {
      return res
        .status(500)
        .json({ message: "new password and confirm password are not match" });
    } else {
      const salt = await bcrypt.genSalt(10);
      const newHashPassword = await bcrypt.hash(newpassword, salt);
      user.password = newHashPassword;
      await user.save();
      return res.status(500).json({ message: "password reset successfully" });
    }
  } catch (error) {
    res.status(500).json({ error: "Error in reset password", error });
  }
};

//change password
const changePassword = async (req, res) => {
  try {
    const token = req.header("Authorization")?.split(" ")[1];
    const { oldPassword, newPassword, confirmPassword } = req.body;
    const decode = jwt.verify(token, envConfig.SECREAT_KEY);
    if (!decode) {
      return res.status(401).json({ message: "Invalid token" });
    }
    const find = await User.findById(decode.id);
    if (!find) {
      return res.status(404).json({ message: "user not found" });
    }
    if (!newPassword) {
      return res.status(400).json({ message: "new passoword is required" });
    }
    if (!confirmPassword) {
      return res.status(400).json({ message: "confirm passoword is required" });
    }
    if (newPassword !== confirmPassword) {
      return res
        .status(400)
        .json({ message: "new password and confirm password are not match" });
    }
    const match = await bcrypt.compare(oldPassword, find.password);
    if (!match) {
      return res.status(400).json({ message: "password is not matched" });
    } else {
      const salt = await bcrypt.genSalt(10);
      const newHashPassword = await bcrypt.hash(newPassword, salt);
      find.password = newHashPassword;
      //both are working
      const updateOne = await User.findByIdAndUpdate(
        find._id,
        { password: newHashPassword },
        { new: true }
      );
      //or
      // const updateOne = await find.save();
      return res
        .status(200)
        .json({ message: "old password is update", updateOne });
    }
  } catch (error) {
    return res.status(404).json({ message: "Error in change password", error });
  }
};
export {
  userRegister,
  getAllUser,
  getUserById,
  updateUserById,
  deleteUserById,
  login,
  sendEmail,
  restPassword,
  changePassword,
};
