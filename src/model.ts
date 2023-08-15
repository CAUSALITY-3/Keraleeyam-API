const mongoose = require("mongoose");

const userProgramSchema = new mongoose.Schema({
  program: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    default: 0,
  },
});

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  age: {
    type: Number,
  },
  parentName: {
    type: Number,
  },
  participatedPrograms: {
    type: [userProgramSchema],
  },
});

const User = mongoose.model("User", userSchema);

module.exports = User;

const programSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    unique: true,
  },
  type: {
    type: String,
    required: true,
  },
  groupName: String,
  groupMembers: [],
});

const Program = mongoose.model("Program", programSchema);

module.exports = Program;
