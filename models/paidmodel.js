const mongoose =require('mongoose')

const paidSchema = new mongoose.Schema({
    Date:{
        type:String,
        required:true
    },
    userId:{
        type:String,
        required:true,
    },
    userName:{
        type:String,
        required:true
    },
    collectionerName:{
        type:String,
        required:true
    },
   amount:{
        type:Number,
        required:true
    },
    savingamount:{
        type:Number
    }
},{collection:'paid_details'})

const paidModel =mongoose.model('paidModel',paidSchema)

module.exports = paidModel;