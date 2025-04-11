const {validatetoken}=require("../service/authentication")

function checkforauth(cookiename){
    return (req,res,next)=>{
        const token=req.cookies[cookiename]
        if(!token){
            next();
        }
        else{
            try {
                const userpayload=validatetoken(token); 
                req.user=userpayload;           
            } catch (error) {
                
            }
            next();      
        }
    }
}

module.exports={
    checkforauth
}