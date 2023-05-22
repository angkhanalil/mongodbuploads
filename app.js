const express = require("express");
const bodyParser = require("body-parser");
const path = require("path");
const crypto = require("crypto");
const mongoose = require("mongoose");
const MongoClient = require("mongodb").MongoClient;
const multer = require("multer");
const { GridFsStorage } = require("multer-gridfs-storage");
const Grid = require("gridfs-stream");
const methodOverride = require("method-override");
const app = express();

// app.set('')
//Middleware
app.use(bodyParser.json());
app.use(methodOverride("_method"));

//mongodb URI
const mongoURI = "mongodb://127.0.0.1:27017/mongouploads";

const conn = mongoose.createConnection(mongoURI);

// MongoClient.connect(mongoURI, function (err, db) {
//   if (err) throw err;
//   console.log("Database created!");
//   db.close();
// });
// // const bucket = new mongodb.GridFSBucket(db);
// const bucket = new mongodb.GridFSBucket(db, { bucketName: "myCustomBucket" });
//Init gfs
let gfs;
conn.once("open", () => {
  //init stream
  gfs = Grid(conn.db, mongoose.mongo);
  gfs.collection("uploads");
});

//create storage engine
const storage = new GridFsStorage({
  url: mongoURI,
  file: (req, file) => {
    return new Promise((resolve, reject) => {
      crypto.randomBytes(16, (err, buf) => {
        if (err) {
          return reject(err);
        }
        const filename = buf.toString("hex") + path.extname(file.originalname);
        const fileInfo = {
          filename: filename,
          bucketName: "uploads",
        };
        resolve(fileInfo);
      });
    });
  },
});

const upload = multer({ storage });

app.get("/", (req, res) => {
  res.status(200).json({ message: "200" });
});

app.post("/upload", upload.single("file"), (req, res) => {
  let file = req.file;

  res.status(200).json(file);
});

// @route GET /files
// @desc  Display all files in JSON
app.get("/files", (req, res) => {
  gfs.files.findOne(
    { filename: "6a8556779a0d0ab44b739a31146f2654.jpg" },
    (err, file) => {
      if (err) {
        res.status(404).json({
          err: "No file exists",
        });
      }
      res.status(200).json("fiels");
    }
  );
});
const port = 5000;
app.listen(port, () => console.log(`server started on port ${port} `));
