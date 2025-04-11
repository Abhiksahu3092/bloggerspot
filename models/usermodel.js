const mongoose = require('mongoose');
const { createHmac, randomBytes } = require('crypto');
const { createtoken } = require('../service/authentication');

const userschema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true,
    },
    salt: {
        type: String,
    },
    profileimageurl: {
        type: String,
        required: false,
        default: "./images/default.png"
    },
    role: {
        type: String,
        enum: ["USER", "ADMIN"],
        default: "USER"
    }
}, { timestamps: true });

userschema.pre("save", function (next) {
    const user = this;
    if (!user.isModified("password")) {
        return;
    }

    const salt = randomBytes(16).toString();
    const hash = createHmac("sha256", salt).update(user.password).digest("hex");

    this.salt=salt;
    this.password = hash;

    next();
})

userschema.static("matchpasswordandgentoken", async function(email,password){
    const user = await this.findOne({email});
    if(!user){
        throw new Error("user not found")
    }

    const salt=user.salt;
    const hashedpassword=user.password;

    const userprovidedhash = createHmac("sha256", salt).update(password).digest("hex");

    if(userprovidedhash !== hashedpassword){
        throw new Error("Incorrect Password")
    }

    const token=createtoken(user);
    return token;
})

const user = mongoose.model("user", userschema);
module.exports = user;