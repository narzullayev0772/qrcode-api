const qrCode = require("qrcode");

const qrCodeCreator = async (text) => {
  return await qrCode.toDataURL(text);
};

module.exports = qrCodeCreator;
