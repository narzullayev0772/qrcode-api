const Router = require("express").Router();
const bcryptjs = require("bcryptjs");
const User = require("../model/user.model");
const { createToken } = require("../util/token.util");

Router.post("/register", async (req, res) => {
  try {
    const { name, username, password } = req.body;
    const user = await User.findOne({ username });
    if (user) {
      return res.status(400).json({ message: "User already exists" });
    }
    const hashedPassword = await bcryptjs.hash(password, 10);
    const newUser = new User({
      name,
      username,
      password: hashedPassword,
    });
    const thisUser = await newUser.save();
    res
      .status(201)
      .json({ message: "User created successfully", user: thisUser });
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
});

Router.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }
    const isPasswordValid = await bcryptjs.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(400).json({ message: "Invalid credentials" });
    }
    const token = createToken(user._id);
    res.status(200).json({ message: "Login successful", token, user });
  } catch (error) {
    res.status(500).json({ message: "Internal server error", error });
  }
});

module.exports = Router;
