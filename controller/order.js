const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const YOUR_DOMAIN = "http://localhost:3000";

class orderController {
  create = async (req, res) => {
    console.log("called");
    const body = req.body.cartItems;
    const line_items = body.map((elm) => {
      return {
        price_data: {
          currency: "INR",
          product_data: {
            name: elm.name,
            images: elm.images,
            description: elm.description,
          },
          unit_amount: Math.floor(elm.price * 100),
        },
        quantity: elm.quantity,
      };
    });
    const session = await stripe.checkout.sessions.create({
      line_items,
      mode: "payment",
      success_url: `${YOUR_DOMAIN}/checkout-success`,
      cancel_url: `${YOUR_DOMAIN}/cart`,
      shipping_address_collection: {
        allowed_countries: [
          "US",
          "CA",
          "GB",
          "AU",
          "SG",
          "FR",
          "DE",
          "NZ",
          "IN",
        ],
      },
    });
    console.log(session);

    res.send({ url: session.url });
  };
}

module.exports.orderController = new orderController();

// This is your test secret API key.
