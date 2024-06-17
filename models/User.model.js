const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const userSchema = mongoose.Schema({
  firstName: {
    type: String,
  },
  lastName: {
    type: String,
  },
  profileImg:{
   type:String
  },
  role:{
    type:String,
    default:"user"
  },
  email: {
    type: String,
  },
  country: {
    type: String,
  },
  city: {
    type: String,
  },
  billingAddress:{
    firstName:{
      type:String,
    },
    lastName:{
      type:String,
    },
    city:{
      type:String,
    },
    state:{
      type:String,
    },
    pinCode:{
      type:Number,
    },
    phone:{
      type:String,
    },
    addressLine1:{
      type:String,
    },
    addressLine2:{
      type:String,
    },
  },
  shippingAddress:{
    firstName:{
      type:String,
    },
    lastName:{
      type:String,
    },
    city:{
      type:String,
    },
    state:{
      type:String,
    },
    pinCode:{
      type:Number,
    },
    phone:{
      type:String,
    },
    addressLine1:{
      type:String,
    },
    addressLine2:{
      type:String,
    },
  },
  pincode: {
    type: String,
  },
  phoneNo: {
    type: Number,
  },
  gender: {
    type: String,
  },
  password: {
    type: String,
  },

  QRcode: {
    type: String,
  },

});

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    return next();
  }
  console.log(this.password);
  console.log(typeof this.password);
  if (!this.password) {
    return next();
  }
  try {
    const salt = await bcrypt.genSalt(10);
    console.log(salt);

    const hashedPassword = await bcrypt.hash(this.password, salt);

    this.password = hashedPassword;

    next();
  } catch (error) {
    next(error);
  }
});

userSchema.methods.generateAuthToken = async function () {
  const token = jwt.sign(
    { name: this.name, email: this.email, _id: this._id },
    process.env.JSONTOKEN_SECRET_KEY
  );
  await this.save();
  return token;
};

const User = mongoose.model("User", userSchema);
module.exports = User;
