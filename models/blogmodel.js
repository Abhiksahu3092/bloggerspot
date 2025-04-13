const mongoose = require('mongoose');

const blogschema=new mongoose.Schema({
    title:{
        type:String,
        required:true
    },
    content:{
        type:String,
        required:true
    },
    coverimageurl:{
        type:String,
        required:true,
        default:"./images/bloglogo.png"
    },
    author:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"user"
    }
},{timestamps:true});

const blog=mongoose.model("blog",blogschema);
module.exports=blog;