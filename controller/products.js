const { redis } = require("..");
const { productService } = require("../Services/services");

class productController {
  getProducts = async (req, res) => {
    let filter = {};
    let data;

    req.query.type ? (filter["category"] = { $in: [req.query.type] }) : "";
    req.query.tag ? (filter["tags"] = { $in: [req.query.tag] }) : "";
    req.query.search
      ? (filter["$or"] = [
          { name: { $regex: new RegExp(req.query.search, "i") } },
          { description: { $regex: new RegExp(req.query.search, "i") } },
        ])
      : "";

    req.query.price ? (filter["price"] = { $lt: req.query.price }) : "",
      console.log(filter);

    try {
      if (req.query.id) {
        data = await productService.findById(req?.query?.id);
        return res.status(200).send(data);
      }
      data = await productService.find(filter);
      return res.status(200).send({ data: data, length: data.length });
    } catch (err) {
      console.log(err);
    }
  };

  create = async (req, res) => {};
  update = async (req, res) => {};
  delete = async (req, res) => {};
}

module.exports.productController = new productController();
