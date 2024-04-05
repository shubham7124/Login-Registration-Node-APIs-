const mongoose=require("mongoose")

//connection
mongoose.connect("mongodb://127.0.0.1:27017/LoginRegistrationApi")
//schema
const schema=new mongoose.Schema({
    name:String,
    dateOfBirth:Date,
    email:String,
    password:String
});
//model
module.exports=mongoose.model("User",schema);