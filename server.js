import express from "express";
import mongoose from "mongoose";
import multer from "multer";
import path from "path";

const app = express();
app.set("view engine", "ejs"); // Set EJS as the template engine
app.use(express.urlencoded({ extended: true })); // To parse form data
app.use(express.static("public")); // Serve static files

import { v2 as cloudinary } from "cloudinary";

// Cloudinary Configuration
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
  .then(() => console.log(" MongoDB Connected..."))
  .catch((err) => console.log(err));

// Mongoose Schema
const imageSchema = new mongoose.Schema({
  filename: String,
  public_id: String,
  imgUrl: String,
});

const File = mongoose.model("cloudinary", imageSchema);

// Rendering EJS file with all uploaded images
app.get("/", async (req, res) => {
  const images = await File.find();
  res.render("index", { images });
});

// Multer Storage (Temporary before Cloudinary Upload)
const upload = multer({ dest: "uploads/" });

// Upload Image Route
app.post("/upload", upload.single("file"), async (req, res) => {
  try {
    const file = req.file.path;

    const cloudinaryRes = await cloudinary.uploader.upload(file, {
      folder: "NodeJS_Mastery_Course",
    });

    // Save to MongoDB
    await File.create({
      filename: req.file.originalname,
      public_id: cloudinaryRes.public_id,
      imgUrl: cloudinaryRes.secure_url,
    });

    res.redirect("/");
  } catch (err) {
    console.log("Upload Error:", err);
    res.status(500).send("Error uploading file.");
  }
});

// Delete Image Route (Cloudinary + MongoDB)
app.post("/delete/:id", async (req, res) => {
  try {
    const image = await File.findById(req.params.id);
    if (!image) return res.status(404).send("Image not found");

    // Delete from Cloudinary
    await cloudinary.uploader.destroy(image.public_id);

    // Delete from MongoDB
    await File.findByIdAndDelete(req.params.id);

    res.redirect("/");
  } catch (err) {
    console.log("Delete Error:", err);
    res.status(500).send("Error deleting file.");
  }
});

const port = 5050;
app.listen(port, () => {
  console.log(` Server is running at port ${port}`);
});
