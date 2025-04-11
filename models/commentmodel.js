const mongoose = require('mongoose');

const commentmodel=new mongoose.Schema({
    comment:{
        type:String,
        required:true
    },
    blogid:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"blog"
    },
    author:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"user"
    }
},{timestamps:true});

const comment=mongoose.model("comment",commentmodel);
module.exports=comment;