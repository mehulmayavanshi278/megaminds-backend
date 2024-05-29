module.exports = (err, req, res, next) => {
    try {
      const status = err.status || 500;
      const message = err.message || "Something went wrong";
      console.log(err)
      return res.status(status).error(message).send();
    } catch (error) {
      // next(error);
      console.log({error})
    }
  };