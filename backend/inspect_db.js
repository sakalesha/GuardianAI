require("dotenv").config({ path: __dirname + "/.env" });
const mongoose = require("mongoose");
const User = require("./models/User");
const Alert = require("./models/Alert");

async function inspectData() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    const user = await User.findOne({ name: /ronada sakalesha/i });
    const alerts = await Alert.find({ userId: user?._id });

    console.log("USER DATA:", JSON.stringify(user, null, 2));
    if (alerts.length > 0) {
      console.log("FIRST ALERT DATA:", JSON.stringify(alerts[0], null, 2));
    } else {
      console.log("NO ALERTS FOUND FOR THIS USER");
    }
  } catch (err) {
    console.error(err);
  } finally {
    mongoose.disconnect();
  }
}

inspectData();
