const jwt=require('jsonwebtoken');
const secretkey="trozan"

function createtoken(user){
    const payload={
        _id:user._id,
        name:user.name,
        email:user.email,
        profileimageurl:user.profileimageurl,
        role:user.role
    }

    const token=jwt.sign(payload,secretkey,)
    return token;
}

function validatetoken(token){
    return jwt.verify(token,secretkey);
}

module.exports={
    createtoken,
    validatetoken
}