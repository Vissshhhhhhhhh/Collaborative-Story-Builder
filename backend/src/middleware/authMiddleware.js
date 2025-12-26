const jwt = require("jsonwebtoken");
const authMiddleware = (req,res,next)=>{
    
try{
    // get token from header
    const authHeader = req.headers.authorization;

    if(!authHeader) {
        return res.status(401).json({message:"No token provided"});
    }

    //2. Format: "Bearer Token"
    const token = authHeader.split(" ")[1];

    //3. Verify token
    const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET
    );

    //4.Attach userId to request

    req.userId = decoded.userId;

    //5.Continue to Controller

    next();
}
catch(err){
    return res.status(401).json({message:"Invalid or expired token"});
}
}

module.exports = authMiddleware;