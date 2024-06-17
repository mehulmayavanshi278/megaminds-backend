const { BasicService } = require("./BasicService");
const User = require("../models/User.model");
const { Product } = require("../models/Product.model");
const { Cart } = require("../models/Cart.model");
const { Order } = require("../models/Order.model");
const { Category } = require("../models/Category.model");
const { Chat } = require("../models/Chat.model");
const { Message } = require("../models/Message.model");
const { Notification } = require("../models/Notification");

class userServices extends BasicService {
  constructor() {
    super(User);
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
class categoryService extends BasicService {
  constructor() {
    super(Category);
  }
}
class chatService extends BasicService {
  constructor() {
    super(Chat);
  }
}
class messageService extends BasicService {
  constructor() {
    super(Message);
  }
}
class notificationService extends BasicService {
  constructor() {
    super(Notification);
  }
}

module.exports.userServices = new userServices();
module.exports.productService = new productService();
module.exports.cartServices = new cartServices();
module.exports.orderServices = new orderServices();
module.exports.categoryService = new categoryService();
module.exports.chatService = new chatService();
module.exports.messageService = new messageService();
module.exports.notificationService = new notificationService();
