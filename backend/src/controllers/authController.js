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

        const token = jwt.sign(
          { userId: user._id },
          process.env.JWT_SECRET,
          { expiresIn: "1d" }
        );

        res.cookie("token", token, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: process.env.NODE_ENV === "production" ? "None" : "Lax",
          maxAge: 24 * 60 * 60 * 1000
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
            return res.status(400).json({message:"User not found Invalid email or password"});
        }

        // creates JWT token using jwt.sign()
        const isMatch = await bcrypt.compare(password,user.password);
        if(!isMatch){
          return res.status(400).json({message:"Invalid email or password"});
        }

        const token = jwt.sign({userId : user._id},process.env.JWT_SECRET,{expiresIn:"1d"});

        //sends response via cookie
         res.cookie("token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: process.env.NODE_ENV === "production" ? "None" : "Lax",
            maxAge: 24 * 60 * 60 * 1000
          });


        res.status(200).json({
          message: "Login Successful"
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

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "None" : "Lax",
      maxAge: 24 * 60 * 60 * 1000
    });


    res.status(200).json({
      message: "Google login successful"
    });


  } catch (err) {
    res.status(401).json({
      message: "Google authentication failed",
      error: err.message
    });
  }
};

// get the user details even when the react state refreshed
const getMe = async (req, res) => {
  const user = await User.findById(req.userId);

  if (!user) {
    return res.status(401).json({
      message: "User not found"
    });
  }

  res.status(200).json({
    userId: user._id,
    name: user.name,
    email: user.email
  });
};


module.exports = {signup, Login, googleLogin, getMe};