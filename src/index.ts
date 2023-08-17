import express from "express";
import {User, Program} from "./model"
require("dotenv").config();
console.log(process.env.HELLO);
const app = express();
const port = 5000;
const cors = require('cors');



const mongoose = require("mongoose");
mongoose.connect("mongodb://127.0.0.1:27017/keraleeyam");

app.use(cors());
app.use(express.urlencoded({ extended: true }))
app.use(express.json())

app.post("/program", async (req, res) => {
  const data = req.body
  const result = await Program.findOneAndUpdate({ programName: data.programName }, data, {
    upsert: true,
    new: true,
  })
  res.send(result);
});

app.post("/program/addMember", async (req, res) => {
  const {member, ...other} = req.body
  const progress = {
    userPresent: false,
    programAlreadyPresent: false,
    addedProgram: false,
    addedProgramAndUser: false,
    updatedUsersPogram: false
  }
  try{

    const user = await User.find({name:member.name})
    if (user.length){
      progress.userPresent = true;
      const pgm = user[0].participatedPrograms.find(el=> el.programName === other.programName)
      if(!pgm) {
        const result = await User.findOneAndUpdate({name:member.name}, 
          {
            $push: {
              participatedPrograms: other
            }
          },
          {
            upsert: true,
            new: true,
          })
          if (result._id){
            progress.addedProgram = true
          }
      } else {
        progress.programAlreadyPresent = true;
      }
      console.log(pgm)
    } else {

      const userData = {
        ...member,
        participatedPrograms:[other]
      }
      const result = await User.findOneAndUpdate({ name:member.name}, userData, {
        upsert: true,
        new: true,
      })
      if (result._id){
        progress.addedProgramAndUser = true
      }
    }
    if (progress.programAlreadyPresent) {
      res.send("Program already present, not able to update")
    } else {
      if(other.isGroupProgram){
        const result = await Program.findOneAndUpdate({ programName: other.programName, groupDetails: { $elemMatch: { groupName: other.groupName } } }, 
          {
            $addToSet: {
              "groupDetails.$.groupMembers":  member
            }
          },
          {
            upsert: true,
            new: true,
          })
          res.send(result)
      } else {
        const result = await Program.findOneAndUpdate({ programName: other.programName }, 
          {
            $addToSet: {
              participants:  member
            }
          },
          {
            upsert: true,
            new: true,
          })
          res.send(result)
      }
      
    }
    console.log(user)
   
  //     const {programName, isStageProgram, isGroupProgram, groupDetails, participants} = result
  } catch (e){
    res.send(e)
   
    
    
    // const {programName, isStageProgram, isGroupProgram, groupDetails, participants} = result
    // if (isGroupProgram) {

    // }
  }
  
  
});

app.post("/program/addGroup", async (req, res) => {
  const data = req.body
  try{
    const result = await Program.findOneAndUpdate({ programName: data.programName}, 
      {
        $push: {
          groupDetails: {
             $each: [{groupName:data.groupName, groupMembers:data.groupMembers || []}]
          }
        }
      },
      {
        upsert: true,
        new: true,
      })
      res.send(result)
    } catch{

    }
  })

app.listen(port, () => {
  return console.log(`Express is listening at http://localhost:${port}`);
});
