require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const encrypt = require("mongoose-encryption")

const app = express();
app.use(bodyParser.urlencoded({extended:true}));
app.use(express.static(__dirname + "/public"));
app.set('view engine', 'ejs');

mongoose.connect("mongodb://localhost:27017/secretsDB");

const usersSchema = new mongoose.Schema({
    userName: {
        type: String,
        required: [true,"user name is required"]
    },
    password: {
        type: String,
        required: [true,"password is required"]
    }
});

let secret = process.env.SECRET;

usersSchema.plugin(encrypt,{secret:secret, encryptedFields: ['password']});


const User = mongoose.model("user",usersSchema);

let port = 3000;

app.listen(port,()=>{
    console.log("Server started on port "+ port);
});

app.get("/",(req,res)=>{
    res.render("home",{});
})

// app.get("/register",(req,res)=>{
//     res.render("register",{});
// })

app.route("/login")
.get((req,res)=>{
    res.render("login",{});
})
.post((req,res)=>{
    let user = User.find({userName:req.body.email},(err,data)=>{
        if(err){
            console.log(err);
        }
        else{
            if(data.length == 1){
                if(data[0].password == req.body.password){
                    res.send("Login Succesful!");
                }
                else{
                    res.redirect("/");
                }
            
            }
            else{
                res.redirect("/");
            }
        }
    })
})

app.route("/register")
.get((req,res)=>{
    res.render("register",{});
})
.post((req,res)=>{
    console.log("User name" + req.body.email);
    console.log("User password" + req.body.password);
    User.create({userName:req.body.email,
    password:req.body.password},err=>{
        if(err){
            console.log(err);
        }
        else{
            res.redirect("/");
        }
    });
    
})