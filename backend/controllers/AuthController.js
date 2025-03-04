import bcrypt from "bcrypt";
import { compare } from "bcrypt";
import User from "../models/UserModel.js";
import jwt from "jsonwebtoken";
import { fileURLToPath } from "url";
import path from "path";
import dotenv from "dotenv";
import fs from "fs"
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
import { renameSync , unlinkSync } from "fs";
const maxAge = 3*24*60*60*1000;
dotenv.config();
const createToken = (email,userId) =>
{
    return jwt.sign({email,userId},process.env.JWT_KEY,{expiresIn:maxAge})
}

export const signup = async (request,responce,next) =>
{
    try {
        const {email,password} = request.body;
        if(!email || !password)
        {
            return responce.status(400).send("Email and Password is required");
        }
        const user = await User.create({email,password});
        responce.cookie("jwt",createToken(email,user.id),{maxAge,secure:true,sameSite:"None"});
        return responce.status(201).json({user:{
            id:user.id,
            email:user.email,
            profileSetup:user.profileSetup
        },
        })
    } catch (error) {
        console.log(error);
        return responce.status(500).send("Internal Server Error");
    }
}


export const login = async (req, res) => {
    try {
      const { email, password } = req.body;
  
      // Validate input
      if (!email || !password) {
        return res.status(400).json({ error: "Email and password are required" });
      }
  
      // Find user in DB
      const user = await User.findOne({ email });
      if (!user) {
        return res.status(404).json({ error: "User with this email not found" });
      }
  
      // Check password validity
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(401).json({ error: "Invalid credentials" });
      }
  
      // Generate token
      const token = createToken(user.email, user._id);
  
      // Set secure cookie
      res.cookie("jwt", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: process.env.NODE_ENV === "production" ? "None" : "Lax",
        maxAge: maxAge * 1000,
      });
  
      // Send response
      return res.status(200).json({
        message: "Login successful",
        user: {
          id: user._id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          profileSetup: user.profileSetup,
          images: user.images,
          color: user.color,
        },
        token,
      });
    } catch (error) {
      console.error("Login Error:", error);
      return res.status(500).json({ error: "Internal Server Error" });
    }
  };

export const getUserInfo = async (request,responce,next) =>
{
    try {
            const userData = await User.findById(request.userId);
            if (!userData) {
                return responce.status(404).send("User with the given id not found.");
            }

        // responce.cookie("jwt",createToken(email,user.id),{maxAge,secure:true,sameSite:"None"});
        return responce.status(200).json({
            id:userData.id,
            email:userData.email,
            profileSetup:userData.profileSetup,
            firstName:userData.firstName,
            lastName:userData.lastName,
            images:userData.images,
            color:userData.color,
        
        })
    } catch (error) {
        console.log(error);
        return responce.status(500).send("Internal Server Error");
    }
}
export const updateProfile = async (request,responce,next) =>
{
    try {
            const userId = request.userId;
            const {firstName,lastName,color} = request.body
            if (!firstName || !lastName) {
                return responce.status(400).send("Firstname , Lastname and color is required for this api");
            }
            const userData = await User.findByIdAndUpdate(userId,{
                firstName,lastName,color,profileSetup:true
            },{new:true,runValidators:true})
        // responce.cookie("jwt",createToken(email,user.id),{maxAge,secure:true,sameSite:"None"});
        return responce.status(200).json({
            id:userData.id,
            email:userData.email,
            profileSetup:userData.profileSetup,
            firstName:userData.firstName,
            lastName:userData.lastName,
            images:userData.images,
            color:userData.color,
        
        })
    } catch (error) {
        console.log(error);
        return responce.status(500).send("Internal Server Error");
    }
}

export const addProfileImage = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: "File is required" });
        }

        const uploadDir = path.join(__dirname, "../uploads/profiles");
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }

        const filePath = `uploads/profiles/${req.file.filename}`; // Relative Path Only

        // Update user profile with image path
        const updatedUser = await User.findByIdAndUpdate(
            req.userId, 
            { images: filePath }, 
            { new: true, runValidators: true }
        );

        return res.status(200).json({
            images: filePath, // Return only the relative path
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: "Internal Server Error" });
    }
};
export const removeProfileImage = async (request, response, next) => {
    try {
        const userId = request.userId;
        const user = await User.findById(userId);

        if (!user) {
            return response.status(404).send("User not found");
        }

        if (user.images) {
            const imagePath = path.join(__dirname, `../${user.images}`); // Ensure correct path

            if (fs.existsSync(imagePath)) {
                fs.unlinkSync(imagePath); // Delete file only if it exists
            } else {
                console.warn("File not found:", imagePath); // Log warning
            }
        }

        user.images = null;
        await user.save();

        return response.status(200).send("Profile image removed successfully");
    } catch (error) {
        console.error(error);
        return response.status(500).send("Internal Server Error");
    }
};
export const logout = async (request, response, next) => {
    try {
        response.cookie("jwt","",{maxAge:1,secure:true,sameSite:"none"})

        return response.status(200).send("Logout Successfully");
    } catch (error) {
        console.error(error);
        return response.status(500).send("Internal Server Error");
    }
};
