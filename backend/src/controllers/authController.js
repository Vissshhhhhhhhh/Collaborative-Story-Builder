const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const { OAuth2Client } = require("google-auth-library");
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const signup = async (req, res)=>{
    try{
        const {name, email, password} =  req.body;
        const existingUser = await User.findOne({email});
        if(existingUser){
            return res.status(400).json({message: "Email already registered"});
        }

        const user = await User.create({
            name, email, password
        });

        res.status(201).json({
            message:"User registered successfully",
            userId:user._id
        });
    }
    catch(err){
        res.status(500).json({message:"SignUp failed", error: err.message});
    }
};

const Login = async (req,res)=>{
    try{
        const {email,password} = req.body;
        const user = await User.findOne({email});
        //checks user is present or not
        if(!user){
            return res.status(400).json({message:"User not found Invalid email or password"});t
        }

        // creates JWT token using jwt.sign()
        const isMatch = await bcrypt.compare(password,user.password);
        const token = jwt.sign({userId : user._id},process.env.JWT_SECRET,{expiresIn:"1d"});

        //sends response
        res.status(200).json({
            message:"Login Successful",
            token
        });
    }
    catch(err){
        res.status(500).json({
            message:"Login Failed",
            error: err.message
        });
    }
}

// Google login

const googleLogin = async (req, res) => {
  try {
    const { token } = req.body;

    // 1. Verify Google token
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID
    });

    const payload = ticket.getPayload();
    const { email, name, sub } = payload;

    // 2. Check if user already exists
    let user = await User.findOne({ email });

    // 3. If not, create user
    if (!user) {
      user = await User.create({
        name,
        email,
        googleId: sub
      });
    }

    // 4. Issue YOUR JWT
    const jwtToken = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.status(200).json({
      token: jwtToken
    });

  } catch (err) {
    res.status(401).json({
      message: "Google authentication failed",
      error: err.message
    });
  }
};


module.exports = {signup, Login, googleLogin};