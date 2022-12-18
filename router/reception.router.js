const Router = require("express").Router();
const { Hospital, Patient } = require("../model/position.model");
const qrCodeCreator = require("../util/qrcode.util");

Router.post("/register", async (req, res) => {
  try {
    const { user } = req;
    const maxPatients = 25;
    const hospital = await Hospital.findOne({})
      .populate("patients")
      .populate({
        path: "patients",
        populate: {
          path: "user",
        },
      });
    const allPatients = hospital.patients;
    if (allPatients.length > maxPatients) {
      return res.status(200).json({ message: "Bugun uchun qabul tugadi" });
    }
    const hasUser = allPatients.find(
      (patient) => patient.user._id.toString() === user._id.toString()
    );
    if (hasUser) {
      return res.status(200).json({
        message: "Siz allaqachon ro'yxatdan o'tgansiz",
      });
    }
    const currentPatient = await Patient.create({
      user: user._id,
      index: allPatients.length,
    });
    hospital.patients.push(currentPatient);
    await hospital.save();
    const img = await qrCodeCreator(currentPatient.user.name);
    res.status(201).json({
      message: "Siz qabulga yozildingiz",
      data: currentPatient,
      img,
    });
  } catch (error) {
    res.status(500).json({ message: "Internal server error", error });
  }
});

Router.delete("/", async (req, res) => {
  try {
    const { user } = req;
    const hospital = await Hospital.findOne({})
      .populate("patients")
      .populate({
        path: "patients",
        populate: {
          path: "user",
        },
      });
    const allPatients = hospital.patients;
    const currentPatient = allPatients.find(
      (patient) => patient.user._id.toString() === user._id.toString()
    );
    await Patient.findByIdAndDelete(currentPatient._id);
    hospital.patients = hospital.patients.filter(
      (patient) => patient._id.toString() !== currentPatient._id.toString()
    );
    await hospital.save();
    res.status(200).json({
      message: "Siz ro'yxatdan o'tish bekor qilindi",
    });
  } catch (error) {
    res.status(500).json({ message: "Internal server error", error });
  }
});

module.exports = Router;
