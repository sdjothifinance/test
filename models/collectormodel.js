const mongoose =require('mongoose')

const userSchema = new mongoose.Schema({
    name:{
        type:String,
        required:true
    },
    phone:{
        type:String,
        required:true
    },
    password:{
        type:String,
        required:true
    },
    works:[Object]
})

const collectormodel =mongoose.model('collector',userSchema)

module.exports = collectormodel;