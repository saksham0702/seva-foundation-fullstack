import mongoose from "mongoose";
import { VolunteerCategoryModel } from "../modules/volunteer/volunteercategories.model.js";
import { VolunteerApplicationModel } from "../modules/volunteer/volunteerapplications.model.js";

const MONGO_URI = "";

if (!MONGO_URI) {
  throw new Error("MONGO_URI is not defined");
}

async function migrate() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("Connected to DB");

    const catResult = await VolunteerCategoryModel.updateMany(
      { formType: { $exists: false } },
      { $set: { formType: "volunteer" } }
    );

    console.log(`Categories updated: ${catResult.modifiedCount}`);

    const appResult = await VolunteerApplicationModel.updateMany(
      { formType: { $exists: false } },
      { $set: { formType: "volunteer" } }
    );

    console.log(`Applications updated: ${appResult.modifiedCount}`);

    console.log("Migration completed successfully");
  } catch (error) {
    console.error("Migration failed:", error);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
}

migrate();