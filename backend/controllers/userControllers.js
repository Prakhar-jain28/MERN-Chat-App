const asyncHandler = require("express-async-handler");
const User = require("../Models/userModel");
const generateToken = require("../config/generateToken");

const registerUser = asyncHandler(async (req, res) => {
  const { name, email, password, pic } = req.body;

  if (!name || !email || !password) {
    res.status(400);
    throw new Error("Please Enter all the Credentials");
  }

  const userExists = await User.findOne({ email });
  if (userExists) {
    res.status(400);
    throw Error("The Email is already Registered");
  }

  const user = await User.create({
    name,
    email,
    password,
    pic,
  });

  if (User) {
    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      pic: user.pic,
      token: generateToken(user._id),
    });
  } else {
    res.status(400);
    throw Error("Failed to Create New Account");
  }
});

const authUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });

  if (user && (await user.matchPassword(password))) {
    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      pic: user.pic,
      token: generateToken(user._id),
    });
  } else {
    res.status(401);
    throw Error("Invalid Email or Password");
  }
});
//   /api/user?search
const allUsers = asyncHandler(async (req, res) => {
  const keyword = req.query.search
    ? {
        $or: [
          { name: { $regex: req.query.search, $options: "-i" } },
          { email: { $regex: req.query.search, $options: "-i" } },
        ],
      }
    : {};

  const users = await User.find(keyword);
  res.send(users);
});

module.exports = { registerUser, authUser, allUsers };
