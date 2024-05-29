const mongoose = require("mongoose");
const URL = process.env.DB_URL;


module.exports = () => {
  return mongoose
    .connect(URL)
    .then(() => {
      console.log("connected to database");
    })
    .catch((err) => {
      console.log(err);
    });
};
