const QRCodeInstance = require("qrcode");

class QRCode {
  publish = async (data) => {
    try {
      const stringData = JSON.stringify(data);
      const result = await QRCodeInstance.toDataURL(stringData);
      return result;
    } catch (err) {
      console.log(err);
    }
  };
}

module.exports.QRCode = new QRCode();
