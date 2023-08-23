import express from "express";
const programRouter = require("./routes/program")
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

app.use("/program", programRouter)

app.listen(port, () => {
  return console.log(`Express is listening at http://localhost:${port}`);
});
