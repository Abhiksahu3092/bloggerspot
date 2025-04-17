require('dotenv').config();

const express=require('express');
const app=express();
const path=require('path')
const userrouter=require("./routes/user")
const blogrouter=require("./routes/blog")
const mongoose=require("mongoose")
const cookieparser=require("cookie-parser")
const {checkforauth}=require("./middlewares/authentication")
const Blog=require("./models/blogmodel")
const changerouter=require("./routes/myblogs")


const port=process.env.PORT || 3000;


app.set("view engine","ejs")
app.set("views",path.resolve("./views"))
app.use(express.urlencoded({extended:true}))
app.use(cookieparser());
app.use(checkforauth("token"))
app.use(express.static('public'));

mongoose.connect(process.env.MONGO_URL).then(()=>{
    console.log("Connection Successful")
})
.catch(err =>{
    console.log("connection failed")
})

app.get("/",async (req,res)=>{
    const allblogs=await Blog.find({}).sort({createdAt: -1});
    if(req.user){
        return res.render("home",{
            user:req.user,
            blogs:allblogs
        });
    }
    else{
        return res.redirect("/user/signin")
    }
    //return res.render("home");
})

app.use("/user",userrouter)
app.use("/blogs",blogrouter)
app.use("/myblogs",changerouter)

app.listen(port,()=>{
    console.log(`server started at port ${port}`);
})