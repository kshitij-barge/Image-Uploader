import express from "express";
import mongoose from "mongoose";
import multer from "multer";
import path from "path";

const app = express();

import { v2 as cloudinary } from "cloudinary";
// Configuration
cloudinary.config({
  cloud_name: "ddhji46ow",
  api_key: "691935398311395",
  api_secret: "arshP_bHDcempJ5XtSwP0YHja8o",
});

mongoose
  .connect(
    "mongodb+srv://kshitijbarge15:8bOZcqzDd4S59kUW@cluster0.ksots.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0",
    {
      dbName: "NodeJs_Mastery_Course",
    }
  )
  .then(() => console.log("MongoDB Connected...!"))
  .catch((err) => console.log(err));

//Rendering ejs file
app.get("/", (req, res) => {
  res.render("index.ejs", { url: null });
});

const storage = multer.diskStorage({
  // destination: './public/uploads',
  filename: function (req, file, cb) {
    cb(null, "/tmp/my-uploads");
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + path.extname(file.originalname);
    cb(null, file.fieldname + "-" + uniqueSuffix);
  },
});

const upload = multer({ storage: storage });

const imageSchema = new mongoose.Schema({
  filename: String,
  public_id: String,
  imgUrl: String,
});

const File = mongoose.model("cloudinary", imageSchema);

app.post("/upload", upload.single("file"), async (req, res) => {
  const file = req.file.path;

  const cloudinaryRes = await cloudinary.uploader.upload(file, {
    folder: "NodeJS_Mastery_Course",
  });

  // Save to database
  const db = await File.create({
    filename: file.originalname,
    public_id: cloudinaryRes.public_id,
    imgUrl: cloudinaryRes.secure_url,
  });

  res.render("index.ejs", { url: cloudinaryRes.secure_url });

  // res.json({message:'file uploaded Successfully',cloudinaryRes})
  // req.file is the `avatar` file
  // req.body will hold the text fields, if there were any
});

app.use(express.static("public"));


const port = 5050;

app.listen(port, () => {
  console.log(`Server is running at port ${port}`);
});
