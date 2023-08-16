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
  const result = await Program.findOneAndUpdate({ name: data.name }, data, {
    upsert: true,
    new: true,
  })
  res.send(result);
});

app.post("/program/addMember", async (req, res) => {
  const data = req.body
  
  try{
    const result = await Program.findOneAndUpdate({ name: data.name, groupDetails: { $elemMatch: { groupName: data.groupName } } }, 
      {
        $push: {
          "groupDetails.$.groupMembers": {
             $each: data.groupMembers
          }
        }
      },
      {
        upsert: true,
        new: true,
      })
      res.send(result);
  } catch  {
    try{
      const result = await Program.findOneAndUpdate({ name: data.name}, 
        {
          $push: {
            groupDetails: {
               $each: [{groupName:data.groupName, groupMembers:data.groupMembers}]
            }
          }
        },
        {
          upsert: true,
          new: true,
        })
        res.send(result);
    }
    catch (e){
      res.send(e)
    }
  }
  
  
});


app.listen(port, () => {
  return console.log(`Express is listening at http://localhost:${port}`);
});
