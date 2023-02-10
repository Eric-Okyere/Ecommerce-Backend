const express = require('express');
const app = express();
const mongoose = require ("mongoose")
require("dotenv").config()
const bcrypt = require("bcryptjs")
const cors = require("cors")
const User = require("./model/User")
const jwt = require("jsonwebtoken")
const imageDownloader = require("image-downloader");
const cookieParser = require("cookie-parser")

const bcryptSalt = bcrypt.genSaltSync(10);
const jwtSecret = "uewyjrgwiu3468edhgfj";



app.use(express.json());
app.use(cookieParser());
app.use(cors({
    credentials:true,
    origin:"http://localhost:3000"
}))


 mongoose.connect(process.env.MONGO_URL)

app.get("/test", (req, res)=>{
    res.json("tesk ok")
})

app.post("/register", async(req, res)=>{
    const {name, email, password} = req.body;
try {
    const userDoc= await User.create({
        name, email,
         password:bcrypt.hashSync(password, bcryptSalt)
       })
        res.json(userDoc)
   
} catch (e) {
    res.status(422).json(e)
}
})


app.post("/login", async(req, res)=>{
    const {email, password}= req.body
    const userDoc = await User.findOne({email});
    if(userDoc){
        const passOk = bcrypt.compareSync(password, userDoc.password)
    if(passOk){
        jwt.sign({email:userDoc.email, id:userDoc._id, name:userDoc.name}, jwtSecret, {}, (err, token)=>{
            if(err) throw err;
            res.cookie("token", token).json(userDoc)
        })
       
    } else{
        res.status(422).json("pass not ok")
    }
    } else{
        res.json("pass not found");
    }
})


app.get("/profile", (req, res)=>{
const {token} = req.cookies;
if(token){
    jwt.verify(token, jwtSecret, {}, async(err, userData)=>{
if (err) throw err;
const {name,email,_id}= await User.findById(userData.id)
res.json({name, email, _id})
    })
}else {
    res.json(null)
}
})


app.post("/logout", (req, res)=>{
    res.cookie("token", "").json(true);
});


console.log(__dirname)
app.post("/upload-by-link", async(req, res)=>{
    const {link} = req.body;
    const newName = Date.now()+ ".jpg"
    await imageDownloader.image({
        url: link,
        dest: __dirname + "/uploads/" + newName,
    })
    res.json(__dirname + "/upload/"+ newName)
})



app.listen(4000, ()=> console.log("Ready to do business"))