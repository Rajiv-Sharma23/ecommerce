import User from "../Models/User.model.js";
import jwt from "jsonwebtoken";
import { redis } from "../lib/redis.js";




const generateTokens = (userId) => {
    const accessToken = jwt.sign({userId},process.env.ACCESS_TOKEN_SECRET,{expiresIn:"15m"},)
    
    const refreshToken = jwt.sign({userId},process.env.REFRESH_TOKEN_SECRET,{expiresIn:"7d"},)

    return {accessToken,refreshToken}
};

const storeRefreshToken = async (userId,refreshToken) => {
    await redis.set(`refresh_token:${userId}`,refreshToken,"EX",7*24*60*60);//7 days
};

const setCookies = (res,accessToken,refreshToken) => {
    res.cookie("accessToken",accessToken,{
        httpOnly:true,
        secure:process.env.NODE_ENV==="production",
        sameSite:"strict",
        maxAge:15 * 60 * 1000 ,//    15 minutes
    });
    res.cookie("refreshToken",refreshToken,{
        httpOnly:true,
        secure:process.env.NODE_ENV==="production",
        sameSite:"strict",
        maxAge:7 *24 * 60  * 60 * 1000 ,//    7 days
    });
}
export const Signup = async (req,res) => {
    
    const {name,email,password} = req.body;
    try {
        const userExists = await User.findOne({email});
        if(userExists) return res.status(400).json({message:"User already exists"});
        
        const user = await User.create({name,email,password});

        // Authenticate

        const { accessToken,refreshToken} = generateTokens(user._id)
        await storeRefreshToken(user._id,refreshToken);

        setCookies(res,accessToken,refreshToken);
        //user creation

        res.status(201).json({user :{
            id:user._id,
            name:user.name,
            email:user.email,
            role:user.role,
        },message:"User created successfully"})
    } catch (error) {
        console.log(error,"error in Signup Controller");
        res.status(500).json({message:error.message});
    }
}
export const Login = async (req,res) => {
    res.send("Login done");
}
export const Logout = async (req, res) => {
	try {
		const refreshToken = req.cookies.refreshToken;
		if (refreshToken) {
			const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
			await redis.del(`refresh_token:${decoded.userId}`);
		}

		res.clearCookie("accessToken");
		res.clearCookie("refreshToken");
		res.json({ message: "Logged out successfully" });
	} catch (error) {
		console.log("Error in logout controller", error);
		res.status(500).json({ message: "Server error", error: error.message });
	}
};