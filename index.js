const express = require("express");
const http = require("http");
const app = express();
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const multer = require("multer");
const cors = require("cors");
const port = 8080;
const fs = require("fs");
const userModel=require("./models/usermodel")
const collectormodel=require("./models/collectormodel")
const deptmodel=require('./models/deptmodel')
const paidmodel=require('./models/paidmodel');
const expenditureModel=require('./models/Expenditure')
const DebtModel = require("./models/deptmodel");
const adminModel=require("./models/adminmodel")

//added after deploy
app.use((req, res, next) => {
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
  next();
});
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


app.use(cors());

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

mongoose
  .connect(
    'mongodb+srv://sd-jothi-finance:sdjothi123@cluster0.argwhtr.mongodb.net/sd-jothi-finance?retryWrites=true&w=majority',
    { useNewUrlParser: true, useUnifiedTopology: true }
  )
  .then(() => console.log("connected successfully"))
  .catch((err) => console.log("it has an error", err));

var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './uploads')
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname)
  }
})

const upload = multer({ storage: storage }).single('img');

// Instances

const server = http.createServer(app);

// End point
app.get('/',(req,res) => {
  res.json("Api is working");
})



app.post('/adduser',(req,res)=>{
    const{name,userId,phone,amount,weeks,startDate,center,savings}=req.body;
    const aa=-1*amount;
    // console.log(aa)
    adminModel.updateOne({userid:"admin"},{ $inc: { wallet:aa } },(err,rese)=>{
      if(err) throw err
      console.log("saved");
      console.log(rese);
    const principle=amount/weeks;
    let i,interest=principle*20/100,temp={},date =new Date(startDate);
    const collection =[];
    const selectDate=(date,week)=>{
        const copyDate =new Date(date)
        copyDate.setDate(copyDate.getDate()+(week*7))
        return copyDate.toLocaleDateString() 
    } 

    for(i=1;i<=weeks;i++){
        let instalment=principle+interest,outstanding=amount-(i*principle);
        if(instalment%10===0){
          instalment=instalment;
        }
        else{
          let instalment2 = instalment+(10-instalment%10);
          let remain_interest = instalment2 - instalment;
          instalment=instalment2;
          interest+=remain_interest;
        }
        temp={
            s_no:(i<10)?`0${i}`:`${i}`,
            date:i===1?selectDate(date,0):selectDate(date,i-1),
            instalment,
            interest,
            principle,
            saving:i*savings,
            instalment,
            outstanding,
            status:'pending ..',
            collector:" "
        }
        collection.push(temp)
        if(i%5===0){
            if(i==weeks-5){
                interest=0;
            }else{
                interest-=10;
            }
        }
       
    }
  
    const lab =  userModel({
      name:name,
      userId:userId,
      amount:amount,
      weeks:weeks,
     center:center,
      phone:phone,
      collections:collection
    });
    lab
      .save()
      .then(() => {
        console.log("record saves");
      res.send("success")
      })
      .catch((err) => {
        console.log(err, "error has occur");
      });

      const current = deptmodel({
        Date:new Date(Date.now()).toLocaleDateString(),userId:userId,userName:name,dept_amount:amount
      })
      current.save().catch((err)=>console.log(err))

    })
})


app.get('/generateid',async(req,res)=>{
    let ids = await userModel.findOne({},{userId:1}).sort({ _id: -1 }).exec();
    console.log(ids.userId);
    let id = ids.userId; 
let num = parseInt(id.replace(/^DJF0*/, '')); 
num++; 
id = "DJF" + num.toString().padStart(4, '0'); 
console.log(id); 
res.send(id);
})

app.post('/addexpenditure',(req,res)=>{
  console.log(req.body)
  const lab =  expenditureModel({
    who:req.body.who,
    amount:req.body.amount,
    description:req.body.decription,
    date:new Date(Date.now()).toLocaleDateString()
  });
  lab
    .save()
    .then(() => {
      adminModel.updateOne({userid:"admin"},{ $inc: { wallet:-req.body.amount } },(err,rese)=>{
        if(err) throw err
        console.log("saved");
        // console.log(rese);
      })
    })
    .catch((err) => {
      console.log(err, "error has occur");
    });
})

app.get('/getexpenditure',(req,res)=>{
  expenditureModel.find({},(err,result)=>{
    if (err) throw err;
    console.log(result);
    res.send(result)
   })
})

app.get('/getprofile',(req,res)=>{
    adminModel.find({},(err,result)=>{
        if (err) throw err;
        console.log(result);
        res.send(result)
       })
})

app.get('/getallusers',(req,res)=>{
    userModel.find({},(err,result)=>{
        if (err) throw err;
        console.log(result);
        res.send(result)
       })
})

app.get('/getcollector',(req,res)=>{
  collectormodel.find({},(err,result)=>{
      if (err) throw err;
      console.log(result);
      res.send(result)
     })
})

app.post('/deleteuser',(req,res)=>{
  userModel.deleteOne({userId:req.body.n},(err,result)=>{
    if (err) throw err;
    console.log(result);
    res.send(result);
  })
})

app.post('/getpaidlist',(req,res)=>{
  const {date}=req.body;
  paidmodel.find({Date:date},(err,data)=>{
    let totalAmount=0;
    let td=0;
      if(data.length){
          data.forEach(doc => {
              totalAmount+=doc.amount;
              td+=doc.savingamount;
          });
          return res.json({totalAmount,td})
      }else{
          return res.json({totalAmount,td})
      }   
  })
})

app.post('/getexpenditureamd',(req,res)=>{
  const {date}=req.body;
  // console.log(req.body)
  expenditureModel.find({date:date},(err,data)=>{
    let totalAmount=0;
    let td=0;
      if(data.length){
          data.forEach(doc => {
              totalAmount+=doc.amount;
              // td+=doc.savingamount;
          });
          return res.json({totalAmount})
      }else{
          return res.json({totalAmount})
      }   
  })
})

app.post('/getpaidlist2', (req, res) => {
  console.log(req.body);
  const fromdate = new Date(req.body.fromdate).toLocaleDateString();
  const enddate = new Date(req.body.enddate).toLocaleDateString();
  paidmodel.find({ Date: { $gte: fromdate, $lte: enddate } }, (err, result) => {
    if (err) throw err;
    console.log(result);
    res.send(result);
  });
});

app.post('/getdebtlist', (req, res) => {
  console.log(req.body);
  const fromdate = new Date(req.body.fromdate).toLocaleDateString();
  const enddate = new Date(req.body.enddate).toLocaleDateString();
  DebtModel.find({ Date: { $gte: fromdate, $lte: enddate }, }, (err, result) => {
    if (err) throw err;
    console.log(result);
    res.send(result);
  });
});

app.post('/deletecollector',(req,res)=>{
  collectormodel.deleteOne({name:req.body.n},(err,result)=>{
    if (err) throw err;
    console.log(result);
    res.send(result);
  })
})
app.post('/getpendinglist', (req, res) => {
  console.log(req.body);
  const fromdate = new Date(req.body.fromdate).toLocaleDateString();
  const enddate = new Date(req.body.enddate).toLocaleDateString();
  userModel.find(
    {
      collections: {
        $elemMatch: {
          date: {
            $gte: fromdate,
            $lte: fromdate,
          },
          status: "pending ..",
        },
      },
    },
    (err, result) => {
      if (err) throw err;
      console.log(result);
      res.send(result);
    }
  );  
});

app.post('/getquicklist', (req, res) => {
  console.log(req.body);
  const fromdate = new Date(Date.now()).toLocaleDateString();
  console.log(fromdate)
  userModel.find(
    {
      collections: {
        $elemMatch: {
          date: {
            $gte: fromdate,
            $lte: fromdate,
          },
          status: "pending ..",
        },
      },
    },
    (err, result) => {
      if (err) throw err;
      console.log(result);
      res.send(result);
    }
  );  
});

app.post('/login',(req,res)=>{
  let as=req.body.user;
  console.log(as);
  if(as.includes("admin")){
    adminModel.findOne({userid:req.body.user,password:req.body.pwd},(err,result)=>{
      if (err) throw err;
      console.log(result);
      res.send(result)
     })
  }
  else if(as.includes("DJF")){
    userModel.findOne({userId:req.body.user,phone:req.body.pwd},(err,result)=>{
      if (err) throw err;
      console.log("sfv");
      res.send(result)
     })
  }
else{
  console.log("sdjd")
  collectormodel.findOne({name:req.body.user,password:req.body.pwd},(err,result)=>{
    if (err) throw err;
    console.log(result);
    res.send(result)
   }) }


})

app.post('/addcollector',(req,res)=>{
  const lab =  collectormodel({
    name:req.body.name,
    phone:req.body.phone,
   password:req.body.password,
  });
  lab
    .save()
    .then(() => {
      console.log("record saves");
     res.send("success")
    })
    .catch((err) => {
      console.log(err, "error has occur");
    });
})


app.post("/todaysale",(req,res)=>{
  const {date}=req.body;
  deptmodel.find({Date:date},(err,data)=>{
    let totalSale=0;
      if(data.length){
          data.forEach(doc => {
              totalSale+=doc.dept_amount;
          });
          return res.json({ts:totalSale})
      }else{
          return res.json({ts:totalSale})
      }   
  })
})

app.post("/todayuser",(req,res)=>{
  const {date}=req.body;
  console.log(date)
  DebtModel.find({Date:date},(err,data)=>{
      return (data.length)?  res.json({todayuser:data.length}):res.json({todayuser:data.length});
     })
})

app.post("/updateprofile",(req,res)=>{
  adminModel.updateOne({},{$set:{name:req.body.name,phone:req.body.phone,address:req.body.address}},(err,result)=>{
    if(err) throw err
    res.send('saved');
  })
})




app.post('/updatestatus',upload,(req,res)=>{
  console.log(req.body.useri);
  userModel.updateOne({userId:req.body.useri,"collections.s_no":req.body.s_no},{$set:{'collections.$.status':'paid','collections.$.collector':req.body.who}},
  (err,result)=>{
      if(err) throw err
      const {useri,usern,who,amount,savings,s_no} = req.body;
      let cc=parseInt(savings,10)/parseInt(s_no,10);
      console.log(cc)
    const paidmodels = paidmodel({
      Date:new Date(Date.now()).toLocaleDateString(),userId:useri,userName:usern,collectionerName:who,amount:amount,savingamount:cc,
    })
    paidmodels.save()
    adminModel.updateOne({},{ $inc: { wallet: req.body.amount } },(err,rese)=>{
      if(err) throw err
      console.log("saved");
      res.send('saved');
      res.status(100)
    })
   
  })
  
   

})

app.post('/getoneuser',(req,res)=>{
  console.log(req.body.userId)
  userModel.findOne({userId:req.body.userId},(err,result)=>{
    if (err) throw err;
    console.log(result);
    res.send(result)
   }) }
)

app.get('/wallet',(req,res)=>{
  adminModel.findOne({},{wallet:1},(err,result)=>{
    if (err) throw err;
    // console.log(result);
    res.send(result)
  })
})

server.listen(8000,() => console.log('Server started on 8000'))
