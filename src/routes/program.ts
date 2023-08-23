const express = require("express");
const router = express.Router();
import { User, Program } from "../model";

router.get("/fullData", async (req, res) => {
  const result = await Program.find();
  res.send(result);
});

router.post("/setPrice", async (req, res) => {
  const { isGroupProgram, programName, first, second, name } = req.body;
  const result = await Program.findOne({ programName });
  if (isGroupProgram) {
    const firstPrice = result.groupDetails.find(
      (item) => item.groupName === first
    );
    const secondPrice = result.groupDetails.find(
      (item) => item.groupName === second
    );

    await Program.findOneAndUpdate(
      { programName },
      {
        $set: {
          "price.first": firstPrice || result.price.first,
          "price.second": secondPrice || result.price.second,
        },
      }
    );
    const fir =
      firstPrice?.groupMembers?.map(async (user) => {
        await User.findOneAndUpdate(
          {
            name: user.name,
            participatedPrograms: { $elemMatch: { programName: programName } },
          },
          {
            $set: {
              "participatedPrograms.$.price": 1,
            },
          },
          {
            upsert: true,
            new: true,
          }
        );
      }) || [];
    const sec =
      secondPrice?.groupMembers?.map(async (user) => {
        await User.findOneAndUpdate(
          {
            name: user.name,
            participatedPrograms: { $elemMatch: { programName: programName } },
          },
          {
            $set: {
              "participatedPrograms.$.price": 2,
            },
          },
          {
            upsert: true,
            new: true,
          }
        );
      }) || [];
    const resuts = await Promise.all([...fir, ...sec]);

    res.send(resuts);
  } else {
    const firstUser = result.participants.find((user) => user.name === first);
    const secondUser = result.participants.find((user) => user.name === second);

    const result3 = await Program.findOneAndUpdate(
      { programName },
      {
        $set: {
          "price.first.indivitualUsers":
            firstUser || result.price.first.indivitualUsers,
          "price.second.indivitualUsers":
            secondUser || result.price.second.indivitualUsers,
        },
      }
    );

    console.log(result3);

    firstUser &&
      (await User.findOneAndUpdate(
        {
          name: first,
          participatedPrograms: { $elemMatch: { programName: programName } },
        },
        {
          $set: {
            "participatedPrograms.$.price": 1,
          },
        },
        {
          upsert: true,
          new: true,
        }
      ));

    secondUser &&
      (await User.findOneAndUpdate(
        {
          name: second,
          participatedPrograms: { $elemMatch: { programName: programName } },
        },
        {
          $set: {
            "participatedPrograms.$.price": 2,
          },
        },
        {
          upsert: true,
          new: true,
        }
      ));
    res.send("results");
  }
});

router.post("/addProgram", async (req, res) => {
  const data = req.body;
  const result = await Program.findOneAndUpdate(
    { programName: data.programName },
    data,
    {
      upsert: true,
      new: true,
    }
  );
  res.send(result);
});

router.post("/addMember", async (req, res) => {
  const { member, ...other } = req.body;
  console.log("raju",other)
  const progress = {
    userPresent: false,
    programAlreadyPresent: false,
    addedProgram: false,
    addedProgramAndUser: false,
    updatedUsersPogram: false,
  };
  try {
    const user = await User.find({ name: member.name });
    if (user.length) {
      progress.userPresent = true;
      const pgm = user[0].participatedPrograms.find(
        (el) => el.programName === other.programName
      );
      if (!pgm) {
        const result = await User.findOneAndUpdate(
          { name: member.name },
          {
            $push: {
              participatedPrograms: other,
            },
          },
          {
            upsert: true,
            new: true,
          }
        );
        if (result._id) {
          progress.addedProgram = true;
        }
      } else {
        progress.programAlreadyPresent = true;
      }
      console.log(pgm);
    } else {
      const userData = {
        ...member,
        participatedPrograms: [other],
      };
      const result = await User.findOneAndUpdate(
        { name: member.name },
        userData,
        {
          upsert: true,
          new: true,
        }
      );
      if (result._id) {
        progress.addedProgramAndUser = true;
      }
    }
    if (progress.programAlreadyPresent) {
      res.send("Program already present, not able to update");
    } else {
      if (other.isGroupProgram) {
        const result = await Program.findOneAndUpdate(
          {
            programName: other.programName,
            groupDetails: { $elemMatch: { groupName: other.groupName } },
          },
          {
            $addToSet: {
              "groupDetails.$.groupMembers": member,
            },
          },
          {
            upsert: true,
            new: true,
          }
        );
        res.send(result);
      } else {
        const result = await Program.findOneAndUpdate(
          { programName: other.programName },
          {
            $addToSet: {
              participants: member,
            },
          },
          {
            upsert: true,
            new: true,
          }
        );
        res.send(result);
      }
    }
    console.log(user);

    
  } catch (e) {
    res.send(e);
  }
});

router.post("/addGroup", async (req, res) => {
  const data = req.body;
  try {
    const result = await Program.findOneAndUpdate(
      { programName: data.programName },
      {
        $push: {
          groupDetails: {
            $each: [
              {
                groupName: data.groupName,
                groupMembers: data.groupMembers || [],
              },
            ],
          },
        },
      },
      {
        upsert: true,
        new: true,
      }
    );
    res.send(result);
  } catch {}
});

router.delete("/deleteProgram", async (req,res) => {
  const data = req.body;
  const result = await Program.findOneAndDelete(
    { programName: data.programName }
  );
  let participants = []
  if (result.programName === data.programName) {
    
    if(result.isGroupProgram) {

      for (const group of result.groupDetails){
        const groupParticipants = group.groupMembers.map((user)=>user.name)
        participants.push(...groupParticipants)
      }
      
    } else {
      participants = result.participants.map((user)=>user.name)
    }
    const ss = participants.map(async (user) => {
      await User.findOneAndUpdate(
        {
          name: user,
        },
        {'$pull':{ 'participatedPrograms':{'programName': data.programName }}}
      );
    }) || [];
    await Promise.all(ss)
  }
  
    res.send(participants)
})

router.delete("/deleteUser", async (req,res) => {
  const data = req.body;
  const result = await User.findOneAndDelete(
    { name: data.name }
  );
  let groupPrograms = []
    let singlePrograms = []
  if (result.name === data.name) {
    

    result.participatedPrograms.map(program=>{
      program.isGroupProgram ? groupPrograms.push(program) : singlePrograms.push(program)
    })

    const group = groupPrograms.map( async (program)=>{
      await Program.findOneAndUpdate(
        {
          programName: program.programName,
          groupDetails: { $elemMatch: { groupName: program.groupName } },
        },
        {
          $pull: {
            "groupDetails.$.groupMembers": {"name": data.name},
          },
        },
      );
    }) || [];

    const single = singlePrograms.map( async (program)=>{
      await Program.findOneAndUpdate(
        {
          programName: program.programName,
        },
        {
          $pull: {
            "participants": {"name": data.name},
          },
        },
      );
    }) || [];
    await Promise.all([...group, ...single])
  }
  
    res.send({groupPrograms, singlePrograms})
})

router.delete("/deleteGroup", async (req,res) => {
  const data = req.body;
  const result = await Program.findOneAndUpdate(
    { programName: data.programName },
    {'$pull':{ 'groupDetails':{'groupName': data.groupName }}}
  );
  if (result.programName === data.programName) {

    const group = result.groupDetails.find(group=>group.groupName === data.groupName)
    const members = group.groupMembers.map((user)=>user.name)

    const ss = members.map(async (user) => {
      await User.findOneAndUpdate(
        {
          name: user,
        },
        {'$pull':{ 'participatedPrograms':{'programName': data.programName }}}
      );
    }) || [];
    await Promise.all(ss)
    
  }
  
    res.send(result)
})
router.delete("/deleteGroupMember", async (req,res) => {
  const data = req.body;
  const result = await Program.findOneAndUpdate(
    {
      programName: data.programName,
      groupDetails: { $elemMatch: { groupName: data.groupName } },
    },
    {
      $pull: {
        "groupDetails.$.groupMembers": {"name": data.user.name},
      },
    },
  );
  if (result.programName === data.programName) {

    
      await User.findOneAndUpdate(
        {
          name: data.user.name,
        },
        {'$pull':{ 'participatedPrograms':{'programName': data.programName }}}
      );
    
  }
  
    res.send(result)
})

router.delete("/deleteIndividualMember", async (req,res) => {
  const data = req.body;
  const result = await Program.findOneAndUpdate(
    {
      programName: data.programName,
    },
    {
      $pull: {
        participants: {name: data.user.name},
      },
    },
  );
  if (result.programName === data.programName) {

    
      await User.findOneAndUpdate(
        {
          name: data.user.name,
        },
        {'$pull':{ 'participatedPrograms':{'programName': data.programName }}}
      );
    
  }
  
    res.send(result)
})

module.exports = router;
