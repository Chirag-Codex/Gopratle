const mongoose=require("mongoose");

const connectDB=async(url)=>{
    if(!url){
        throw new Error("MongoDB URL is not provided");
    }
    await mongoose.connect(url);
    console.log(`MongoDB connected: ${mongoose.connection.host}`);
}

module.exports=connectDB;