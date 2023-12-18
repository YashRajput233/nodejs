import nodemailer from "nodemailer";
import envConfig from "../config/envConfig.js";

const transporter = nodemailer.createTransport({
  host: envConfig.EMAIL_HOST,
  port: envConfig.EMAIL_PORT,
  secure: false,
  auth: {
    user: envConfig.EMAIL_USER,
    pass: envConfig.EMAIL_PASS,
  },
});
export default transporter;
