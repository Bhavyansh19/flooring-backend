import mongoose from "mongoose";

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      dbName: "avenue-surface",
    });

    console.log(`✅ MongoDB: ${conn.connection.host}`);
    console.log(`🔥 Connected DB: ${conn.connection.name}`);
  } catch (error) {
    console.error("❌ DB Error:", error.message);
    process.exit(1);
  }
};

export default connectDB;
