const Router = require("express").Router();
const { Hospital, Patient } = require("../model/position.model");
const qrCodeCreator = require("../util/qrcode.util");
const moment = require("moment");

Router.get("/all", async (req, res) => {
  try {
    const hospital = await Hospital.findOne({})
      .populate("patients")
      .populate({
        path: "patients",
        populate: {
          path: "user",
        },
      });
    const allPatients = hospital.patients;
    res.status(201).json({
      data: allPatients,
      message: "Barcha bemorlar",
    });
  } catch (error) {
    res.status(500).json({ message: "Internal server error", error });
  }
});

Router.get("/", async (req, res) => {
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
    if (!currentPatient) {
      return res
        .status(200)
        .json({ message: "Siz ro'yxatdan o'tmadingiz", data: {} });
    }
    const img = await qrCodeCreator(
      `Bemor: ${currentPatient.user.name}\n Index: ${currentPatient.index}`
    );
    res.status(201).json({
      data: { user: currentPatient, img },
      message: "Siz ro'yxatdan o'tgansiz",
    });
  } catch (error) {
    res.status(500).json({ message: "Internal server error", error });
  }
});

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
      ...req.body,
      user: user._id,
      index: allPatients.length,
    });
    hospital.patients.push(currentPatient);
    await hospital.save();
    const img = await qrCodeCreator(
      `Bemor: ${currentPatient.user.name}\n Index: ${currentPatient.index}`
    );
    res.status(201).json({
      message: "Siz qabulga yozildingiz",
      data: {
        user: currentPatient,
        img,
      },
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
      message: "Bekor qilindi",
    });
  } catch (error) {
    res.status(500).json({ message: "Internal server error", error });
  }
});

Router.post("/check", async (req, res) => {
  try {
    const hospital = await Hospital.findOne({})
      .populate("patients")
      .populate({
        path: "patients",
        populate: {
          path: "user",
        },
      });
    const allPatients = hospital.patients;
    const reception_time = req.body.reception_time;
    const reception_time_plus_30 = moment(reception_time).add(30, "minutes");
    const reception_time_minus_30 = moment(reception_time).subtract(
      30,
      "minutes"
    );
    const isEmpty = allPatients.find((patient) =>
      moment(patient.reception_time).isBetween(
        reception_time_minus_30,
        reception_time_plus_30
      )
    );
    if (isEmpty) {
      return res
        .status(200)
        .json({ message: "Bu vaqt bo'sh emas", isEmpty: false });
    }
    res.status(200).json({ message: "Bemorlar", isEmpty: true });
  } catch (error) {
    res.status(500).json({ message: "Internal server error", error });
  }
});

module.exports = Router;
