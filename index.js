require("dotenv").config();
const express = require("express");
const app = express();
require("./database");
const { verifyToken } = require("./util/token.util");
const User = require("./model/user.model");

app.use(express.json());

app.use("/auth", require("./router/auth.router"));

// token middleware
app.use(async (req, res, next) => {
  try {
    const token = req.headers["authorization"];
    if (!token) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    const data = verifyToken(token);
    const user = await User.findById(data._id);

    if (!user) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({ message: "Unauthorized" });
  }
});

app.use("/reception", require("./router/reception.router"));

app.listen(3000, () => {
  console.log("Server started on port 3000");
});
