const { BasicService } = require("./BasicService");
const Users = require("../models/User.model");
const { Product } = require("../models/Product.model");
const { Cart } = require("../models/Cart.model");
const { Order } = require("../models/Order.model");

class userServices extends BasicService {
  constructor() {
    super(Users);
  }
}

class productService extends BasicService {
  constructor() {
    super(Product);
  }
}

class cartServices extends BasicService {
  constructor() {
    super(Cart);
  }
}
class orderServices extends BasicService {
  constructor() {
    super(Order);
  }
}

module.exports.userServices = new userServices();
module.exports.productService = new productService();
module.exports.cartServices = new cartServices();
