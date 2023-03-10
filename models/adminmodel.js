const mongoose =require('mongoose')

const userSchema = new mongoose.Schema({
    name:{
        type:String,
        required:true
    },
    userid:{
        type:String
    },
    phone:{
        type:String,
        required:true
    },
    password:{
        type:String,
        required:true
    },
    wallet:{
        type:Number,
        required:true,
    },
    works:[Object]
})

const adminmodel =mongoose.model('admin',userSchema)

module.exports = adminmodel;