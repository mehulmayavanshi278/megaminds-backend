require("dotenv").config();
const express = require("express");
const cors = require("cors");
const http = require("http");
const bodyParser = require("body-parser");
const fileUpload = require("express-fileupload");
const app = express();
const path = require("path");

const fs = require("fs");

const tempUploadDirectory = "/var/task/tmp";
// if (!fs.existsSync(tempUploadDirectory)) {
//   fs.mkdirSync(tempUploadDirectory);
// }

// Create directory if it doesn't exist

// app.use(express.static(path.join(__dirname,"/public/Images")));
app.use(express.static("public"));
app.use(express.json());
app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE"], // Allowed HTTP methods
    credentials:true
  })
);
app.options("*", cors());

// app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }));
app.use(
  fileUpload({
    useTempFiles: true,
    tempFileDir: tempUploadDirectory,
  })
);

// app.get("/" , (req , res)=>{
//     return res.send("ok");
// })

require("./startup/index.startup")(app);
const Redis = require("ioredis");
const redis = new Redis({
  password: "n0RixKwGVyYjGnhs2D2Lr730w0bKqv4c",
  host: "redis-16246.c91.us-east-1-3.ec2.redns.redis-cloud.com",
  port: 16246,
});

module.exports.redis = redis;
