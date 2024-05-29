// const cors = require("cors");
const cloudinary = require("cloudinary").v2;
const fs = require("fs");

module.exports = async (app) => {
  const PORT = process.env.PORT || 5000;
  console.log("port is:", PORT);

  await require("./db.startup")();

  require("./multer.startup");

  console.log("cloudinary setup ready");
  cloudinary.config({
    cloud_name: process.env.cloud_name,
    api_key: process.env.api_key,
    api_secret: process.env.api_secret,
  });

  require("./routes.startup")(app);

  app.listen(PORT, () => {
    console.log("listening to port:", PORT);
  });
};
