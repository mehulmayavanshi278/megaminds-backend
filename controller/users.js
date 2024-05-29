const { userServices, cartServices } = require("../Services/services");
const bcrypt = require("bcrypt");

class userController {
  getUsers = async (req, res) => {
    const id = req.params.id || req.user._id;
    console.log(id);
    try {
      const data = await userServices.findById(id);
      return res.status(200).send(data);
    } catch (err) {
      console.log(err);
    }
  };
  create = async (req, res) => {
    try {
      const body = req?.body;
      const { email, phoneNo, firstName, lastName, password } = req.body;
      const checkUser = await userServices.findOne({
        $or: [{ email }, { phoneNo }],
      });
      if (checkUser) {
        console.log();
        return res.status(400).send({message:"Already registered with this credentials"});
      }
      let user = await userServices.create(body);
      await cartServices.create({ customerId: user });
      return res.status(200).send(user);
    } catch (err) {
      console.log(err);
    }
  };

  login = async (req, res) => {
    try {
      const { email, password } = req.body;
      const checkUser = await userServices.findOne({ email });
      if (!checkUser) {
        return res.status(400).send({message:"user not registered with this Email!"});
      }
      const checkPw = await bcrypt.compare(password, checkUser.password);
      console.log("checkpw", checkPw);
      if (!checkPw) {
        return res.status(400).send({message:"Invalid Credentials"});
      }
      const token = await checkUser.generateAuthToken();
      return res.status(200).send({ token });
    } catch (err) {
      console.log(err);
    }
  };
  update = async (req, res) => {
    const body = req.body;
    const id = req.user._id;
    try {
      await userServices.findByIdAndUpdate(id, body);
      return res.status(200).send({ message: "updated successfully" });
    } catch (err) {
      console.log(err);
    }
  };
  loginWithGoogle = async (req, res) => {};
  delete = async (req, res) => {};
}

module.exports.userController = new userController();
