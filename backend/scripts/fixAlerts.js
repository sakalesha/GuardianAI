const mongoose = require("mongoose");
const Alert = require("../models/Alert");

mongoose.connect("mongodb+srv://ronadasakalesha_db_user:sakalesh2004@cluster0.mdwifgl.mongodb.net/?appName=Cluster0");

const updates = [
  {
    _id: "6915d600b8623838c7f8291b",
    latitude: 12.917658,
    longitude: 77.623123
  },
  {
    _id: "6915d5f5b8623838c7f82918",
    latitude: 12.922846,
    longitude: 77.610983
  },
  {
    _id: "6915d5e8b8623838c7f82915",
    latitude: 12.904652,
    longitude: 77.595624
  },
  {
    _id: "6915d5ccb8623838c7f82912",
    latitude: 12.971978,
    longitude: 77.601274
  }
];

(async () => {
  try {
    for (let item of updates) {
      await Alert.findByIdAndUpdate(
        item._id,
        {
          latitude: item.latitude,
          longitude: item.longitude
        },
        { new: true }
      );
    }

    console.log("All alerts updated successfully!");
  } catch (err) {
    console.error("Error updating alerts:", err);
  } finally {
    mongoose.disconnect();
  }
})();
