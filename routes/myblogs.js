const { Router } = require("express");

const router = Router();
const usermodel = require("../models/usermodel");
const blog = require("../models/blogmodel");

router.route("/").get(async (req, res) => {
    if(!req.user){
        return res.redirect("/user/signin")
    }

    const myblogs= await blog.find({author:req.user._id});
    return res.render("myblogs",{
        myblogs,
        user:req.user
    })
})

module.exports = router