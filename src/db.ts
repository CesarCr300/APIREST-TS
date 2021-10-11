import mongoose from 'mongoose';
let dbName = "exercise-api"
if(process.env.NODE_ENV == 'test'){ dbName = "exercise-api-test"}

export const connectDB = async()=>{
    await mongoose.connect(`mongodb://localhost:27017/${dbName}`,{
        autoIndex: true,
    })
}

export const closeDB = async()=>{
    await mongoose.connection.close()
}
