require("dotenv").config({ path: __dirname + "/.env" });
const mongoose = require("mongoose");
const User = require("./models/User");

async function patchUsers() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected. Patching user registration dates...");

    // Find all users missing createdAt and set it to a reasonable default (today or a few days ago)
    const users = await User.find({ createdAt: { $exists: false } });
    console.log(`Found ${users.length} users needing patch.`);

    for (const user of users) {
      user.createdAt = new Date();
      await user.save();
    }

    console.log("User patch complete.");
  } catch (err) {
    console.error(err);
  } finally {
    mongoose.disconnect();
  }
}

patchUsers();
