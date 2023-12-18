import jwt from "jsonwebtoken";
import envConfig from "../config/envConfig.js";
const authenticateToken = (req, res, next) => {
  const token = req.header("Authorization")?.split(" ")[1];

  if (!token) {
    return res.status(401).json({ error: "Access denied. Token not provided" });
  }

  jwt.verify(token, envConfig.SECREAT_KEY, (err, user) => {
    if (err) {
      return res.status(403).json({ error: "Invalid token" });
    }
    req.user = user;
    next();
  });
};

export default authenticateToken;
