// const cors = require("cors");

const fs = require("fs");

module.exports = async (app , server) => {
  const PORT = process.env.PORT || 5000;
  console.log("port is:", PORT);

  await require("./db.startup")();

  require("./multer.startup");



  require("./routes.startup")(app);

  server.listen(PORT, () => {
    console.log("listening to port:", PORT);
  });
};
