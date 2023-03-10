const mongoose =require('mongoose')

const userSchema = new mongoose.Schema({
    date:{
        type:String,
        required:true
    },
   amount:{
        type:Number,
        required:true
    },
    description:{
        type:String,
        required:true
    },
    who:{
        type:String
    }
})

const expendituremodel =mongoose.model('expenditure',userSchema)

module.exports = expendituremodel;