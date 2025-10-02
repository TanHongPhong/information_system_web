import mongoose from "mongoose";

export const connectDB = async () => {
  try {
    // console.log("🔍 MONGO_URI =", process.env.MONGODB_CONNECTIONSTRING);
    await mongoose.connect(process.env.MONGODB_CONNECTIONSTRING);

    console.log("Liên kết CSDL thành công!");
  } catch (error) {
    console.error("Lỗi khi kết nối CSDL:", error);
    process.exit(1); // exit with error
  }
};
