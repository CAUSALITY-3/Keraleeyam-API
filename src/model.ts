import mongoose from "mongoose";

const userProgramSchema = new mongoose.Schema({
  isStageProgram: {
    type: Boolean,
    required: true,
  },
  isGroupProgram: {
    type: Boolean,
    required: true,
  },
  groupName: {
    type: String
  },
  programName: {
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
    unique:true
  },
  age: {
    type: Number,
  },
  parentName: {
    type: String,
  },
  participatedPrograms: {
    type: [userProgramSchema],
  },
});

export const User = mongoose.model("User", userSchema);


const shortUserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  age: Number,
  parentName: String,
});

const groupDetailSchema = new mongoose.Schema({
  groupName: {
    type: String,
    required: true,
  },
  groupMembers: [shortUserSchema]
});

const programSchema = new mongoose.Schema({
  isStageProgram: {
    type: Boolean,
    required: true,
  },
  programName: {
    type: String,
    required: true,
    trim: true,
    unique: true,
  },
  isGroupProgram: {
    type: Boolean,
    required: true,
  },
  groupDetails: [groupDetailSchema],
  participants: [shortUserSchema],
  price: {
    first: {
      groupName: String,
      groupMembers: [shortUserSchema],
      indivitualUsers: [shortUserSchema]
    },
    second: {
      groupName: String,
      groupMembers: [shortUserSchema],
      indivitualUsers: [shortUserSchema]
    },
  },
});

export const Program = mongoose.model("Program", programSchema);



// "participants": [
//   {
//       "name": "Kallu",
//       "age": 10,
//       "parentName": "Ravi"
//   },
//   {
//       "name": "Rakendhu",
//       "age": 10,
//       "parentName": "Santhosh"
//   },
//   {
//       "name": "Dhyan",
//       "age": 7,
//       "parentName": "Ratheesh"
//   }
// ]