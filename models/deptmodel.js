const mongoose =require('mongoose')

const currentDebtSchema = new mongoose.Schema({
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
    dept_amount:{
        type:Number,
        required:true
    }
})


const DebtModel =mongoose.model('DebtModel',currentDebtSchema)
module.exports = DebtModel;