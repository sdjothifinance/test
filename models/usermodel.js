const mongoose =require('mongoose')

const userSchema = new mongoose.Schema({
    name: {
        type :String,
        required:true
    },
    userId:{
        type:String,
        required:true,
        unique:true
    },
    amount:{
        type:Number,
        required:true
    },
    weeks:{
        type:Number,
        required:true
    },
    center:{
        type:String
    },
    phone:{
        type:String,
        required:true
    },
    collections:[Object]
},{collection:'users_data'})

const userModel =mongoose.model('user',userSchema)

module.exports = userModel;