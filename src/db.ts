import mongoose from 'mongoose';

export const connectDB = async()=>{
    await mongoose
    .connect("mongodb://localhost:27017/exercise-api",{
        autoIndex: true,
    })
}

export const closeDB = async()=>{
    await mongoose.connection.close()
}
