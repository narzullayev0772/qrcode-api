const mongoose = require("mongoose");
const { Hospital } = require("./model/position.model");

mongoose.set("strictQuery", true);
mongoose.connect(process.env.MONGO_URL, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const db = mongoose.connection;

db.on("error", console.error.bind(console, "connection error:"));
db.once("open", async function () {
  console.log("Connected to database");
  await Hospital.deleteMany({});
  await Hospital.create({
    patients: [],
  });
});

module.exports = db;
