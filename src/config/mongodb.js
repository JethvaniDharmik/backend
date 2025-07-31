import mongoose from "mongoose";

    mongoose.connection.on('connected',() => console.log("Database Connected.."))


const connectDB = async () => {
     await mongoose.connect(`${process.env.MONGODB_URI}/sastamarket`)
}

export default connectDB