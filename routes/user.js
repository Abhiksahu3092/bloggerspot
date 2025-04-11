const { Router } = require("express");

const router = Router();
const usermodel = require("../models/usermodel");
const blog = require("../models/blogmodel");
const multer=require("multer");
const path = require("path");

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, path.resolve(`./public/images`))
    },
    filename: function (req, file, cb) {
        const filename = `${Date.now()}-${file.originalname}`;
        cb(null, filename)
    }
})

const upload = multer({ storage: storage })

//get requests
router.route("/signin").get((req, res) => {
    return res.render("signin");
})

router.route("/signup").get((req, res) => {
    return res.render("signup");
})

// post requests
router.route("/signup").post(upload.single("profileimage"),async (req, res) => {
    const { name, email, password } = req.body;

    await usermodel.create({
        name,
        email,
        password,
        profileimageurl: `/images/${req.file.filename}`,
    })

    return res.redirect("/")
})

router.route("/signin").post(async (req, res) => {
    const { email, password } = req.body;
    try {
        const token = await usermodel.matchpasswordandgentoken(email, password)
        return res.cookie("token",token).redirect("/")
    } catch (error) {
        return res.render("signin",{
            error:"Invalid credentials"
        })
    }
})

router.route("/signout").get((req,res)=>{
    return res.clearCookie("token").redirect("/user/signin")
})

router.route("/profile").get(async (req,res)=>{
    if (!req.user) {
        return res.redirect('/user/signin');
    }

    const blogs=await blog.find({author:req.user._id});
    const userdetail=await usermodel.findById(req.user._id);
    return res.render("profile",{
        user:req.user,
        blogs,
        userdetail
    });
})

module.exports = router