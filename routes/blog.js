const { Router } = require("express");
const multer = require("multer");
const path = require("path");
const Blog = require("../models/blogmodel")
const Comment = require("../models/commentmodel")
const usermodel = require("../models/usermodel")

const router = Router();

// multer config
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, path.resolve(`./public/uploads`))
    },
    filename: function (req, file, cb) {
        const filename = `${Date.now()}-${file.originalname}`;
        cb(null, filename)
    }
})

const upload = multer({ storage: storage })

router.route("/add_blog").get((req, res) => {
    if (!req.user) {
        return res.redirect('/user/signin');
    }
    return res.render("home", {
        currentRoute: req.path,
        user: req.user,
        blogs: []
    })
})

router.route("/:id").get(async (req, res) => {
    if (!req.user) {
        return res.redirect('/user/signin');
    }

    const blog = await Blog.findById(req.params.id).populate("author");
    const comments = await Comment.find({ blogid: req.params.id }).populate("author");
    const userdetail = await usermodel.findById(req.user._id);
    const success = req.query.success;
    return res.render("blog", {
        user: req.user,
        blog,
        comments,
        userdetail,
        success
    })
})


router.route("/:id/delete").post(async (req, res) => {
    if (!req.user) {
        return res.redirect('/user/signin');
    }

    const blogid = req.params.id;
    const blog = await Blog.findById(blogid).populate("author");

    if (blog.author._id.toString() !== req.user._id.toString()) {
        return res.status(403).render("blog", {
            error: "You are not authorized to delete this blog.",
            blog: blog,
            user: req.user,
            comments: await Comment.find({ blogid: blog._id }).populate("author")
        });
    }

    await blog.deleteOne();
    return res.redirect("/myblogs");
});



router.route("/:id/update").get(async (req, res) => {
    if (!req.user) {
        return res.redirect('/user/signin');
    }

    const blog = await Blog.findById(req.params.id);
    const comment = req.body.comment;
    if (!blog || blog.author.toString() !== req.user._id.toString()) {
        return res.render("blog", {
            error: "You are not authorized to update this blog.",
            blog: blog,
            user: req.user,
            comments: await Comment.find({ blogid: req.params.id }).populate("author")
        }); 
    }

    return res.render("edit_blog", { blog, user: req.user });

})

router.route("/:id/update").post(upload.single("coverimage"), async (req, res) => {
    if (!req.user) {
        return res.redirect('/user/signin');
    }

    const { title, content } = req.body;
    const blog = await Blog.findById(req.params.id);

    if (!blog || blog.author.toString() !== req.user._id.toString()) {
        return res.render("blog", {
            error: "You are not authorized to update this blog.",
            blog: blog,
            user: req.user,
            comments: await Comment.find({ blogid: req.params.id }).populate("author")
        }); 
    }

    blog.title = title;
    blog.content = content;

    if (req.file) {
        blog.coverimageurl = `/uploads/${req.file.filename}`;
    }

    await blog.save();
    res.redirect(`/blogs/${req.params.id}?success=Blog updated successfully!`);
});


router.route("/comment/:id").post(async (req, res) => {
    if (!req.user) {
        return res.redirect('/user/signin');
    }

    const comment = req.body.comment;
    const blog = await Blog.findById(req.params.id).populate("author");


    if (!comment || comment.trim() === "") {
        return res.render("blog", {
            error: "Comment cannot be empty!",
            blog: blog,
            user: req.user,
            comments: await Comment.find({ blogid: req.params.id }).populate("author")
        });        
    }

    await Comment.create({
        comment: comment,
        blogid: req.params.id,
        author: req.user._id
    });

    return res.redirect(`/blogs/${req.params.id}`);
});

router.route("/").post(upload.single("coverimage"), async (req, res) => {
    if (!req.user) {
        return res.redirect('/user/signin');
    }

    const { title, content } = req.body;

    const blog = await Blog.create({
        title,
        content,
        coverimageurl: `/uploads/${req.file.filename}`,
        author: req.user._id
    })


    return res.redirect(`/blogs/${blog._id}`);
});



module.exports = router