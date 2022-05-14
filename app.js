require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
// const bcrypt = require("bcrypt");
const session = require("express-session");
const passport = require("passport");
const passportLocalMongoose = require("passport-local-mongoose");
// const encrypt = require("mongoose-encryption")
// const md5 = require("md5");
// const { redirect } = require("express/lib/response");
// const saultRounds = 10;




const app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(__dirname + "/public"));
app.set('view engine', 'ejs');
app.use(session({
    secret: "mysecretaaaaaaaaaa",
    resave: false,
    saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());




mongoose.connect("mongodb://localhost:27017/secretsDB");

// const usersSchema = new mongoose.Schema({
//     userName: {
//         type: String,
//         required: [true,"user name is required"]
//     },
//     password: {
//         type: String,
//         required: [true,"password is required"]
//     }
// });

const usersSchema = new mongoose.Schema({
    username: String,
    password: String
});

usersSchema.plugin(passportLocalMongoose);

// let secret = process.env.SECRET;

// usersSchema.plugin(encrypt,{secret:secret, encryptedFields: ['password']});




const User = new mongoose.model("user", usersSchema);

passport.use(User.createStrategy());
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());


app.use((req,res,next)=>{
    console.log(req.session);
    console.log(req.user);
    next();
});


let port = 3000;

app.listen(port, () => {
    console.log("Server started on port " + port);
});

app.get("/",checkNotAuthenticated, (req, res) => {
    res.render("home", {});
})

// app.get("/register",(req,res)=>{
//     res.render("register",{});
// })

app.route("/login")
    .get(checkNotAuthenticated,(req, res) => {
        res.render("login", {});
    })
    .post(passport.authenticate("local",{
        successRedirect:"/secretes",
        failureRedirect:"/",
        failureMessage: true
    }));
    // .post((req, res) => {
    //     let user = User.find({ userName: req.body.email }, (err, data) => {
    //         if (err) {
    //             console.log(err);
    //         }
    //         else {
    //             if (data.length == 1) {
    //                 // bcrypt.compare(req.body.password,data[0].password).then(result=>{
    //                 //     if(result){
    //                 //         res.send("Login Succesful!");
    //                 //     }
    //                 //     else{
    //                 //         res.redirect("/");
    //                 //     }
    //                 // }).catch(err=>{
    //                 //     console.log(err);
    //                 // // 
    //                 // });
    //                 console.log("compair user input to DB value here");
    //             }
    //             else {
    //                 res.redirect("/");
    //             }
    //         }
    //     })
    // })

app.route("/register")
    .get(checkNotAuthenticated,(req, res) => {
        res.render("register", {});
    })
    .post((req, res) => {
        console.log("User name :" + req.body.username);
        console.log("User password :" + req.body.password);
        User.register({ username: req.body.username }, req.body.password, (err, user) => {
            if (!err) {
                console.log("no error");
                console.log(user);
                passport.authenticate("local")(req, res, () => {
                    console.log("success!");
                    res.redirect("/secretes");
                })
            }
            else {
                console.log("some error");
                console.log(err);
                res.redirect("/register");
            }


        });

        // User.register({userName:req.body.userName,password:req.body.password},req.body.password,(err,user)=>{
        //     if(err){
        //         console.log(err);
        //         res.redirect("/register");
        //     }
        //     else{
        //         passport.authenticate("local")(req,res,()=>{
        //             console.log("registered!");
        //             res.redirect("/secretes");
        //         });
        //     }
        // });
    });


app.get("/secretes",checkAuthenticated,(req,res)=>{
    res.render("secrets",{email:req.user.username});
});

app.post("/logout",(req,res)=>{
    req.logOut();
    res.redirect("/");
});


function checkAuthenticated(req,res,next) {
    if(!req.isAuthenticated()){
        res.redirect("/login");
    }
    else{
        return next();
    }  
}

function checkNotAuthenticated(req,res,next) {
    if(req.isAuthenticated()){
        res.redirect("/secretes");
    }
    else{
        return next();
    }  
}

// app.route("/secretes")
//     .get((req, res) => {
//         console.log("in secrets get function");
//         console.log("is req authenticated : " + req.isAuthenticated());

//         // if(req.isAuthenticated())
//         // res.render("secrets",{});
//         // else
//         // res.redirect("/");

//     });