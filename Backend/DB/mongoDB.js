import mongoose from "mongoose";

const mongoDB = async () => {
    try {
       const MongoDB = await mongoose.connect(process.env.MONGO_URL);
        console.log(`MongoDB connected successfully : ${MongoDB.connection.host}`);
    } catch (error) {
        console.error("Error connecting to MongoDB:", error);
    }
};

export default mongoDB;