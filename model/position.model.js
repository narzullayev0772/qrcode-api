const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const patientsSchema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: "User",
  },
  index: {
    type: Number,
    required: true,
  },
});

// hospital scema
const hospitalSchema = new Schema({
  patients: [
    {
      type: Schema.Types.ObjectId,
      ref: "Patient",
    },
  ],
});

patientsSchema.pre("save", function (next) {
  this.populate("user");
  next();
});

hospitalSchema.pre("save", function (next) {
  this.populate("patients");
  next();
});
hospitalSchema.pre("find", function (next) {
  this.populate("patients");
  next();
});

const Hospital = mongoose.model("Hospital", hospitalSchema);
const Patient = mongoose.model("Patient", patientsSchema);

module.exports = { Hospital, Patient };
