import {db} from "../libs/db.js"
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken"

export const register = async (req, res) => {
  const {name, email, password} = req.body;

  try {
    const existingUser = await db.User.findUnique({
      where: {
        email
      }
    })

    if(existingUser) {
      // data conflicts
      return res.status(409).json({
        success: false,
        error: "User already exisits"
      })
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await db.User.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: "USER"
      }
    })

    const token = jwt.sign(
      {id: newUser.id},
      process.env.JWT_SECRET,
      {expiresIn: "1d"}
    )

    res.cookie("jwt", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 1000*60*60*24,
      sameSite: 'lax'
    })

    // new resource creation
    return res.status(201).json({
      success: true,
      message: "User created succesfully",
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email
      }
    })
  } catch (error) {
    console.error("Error in registration:", error);
    // internal server issue
    res.status(500).json({
      success: false,
      error: "Error in registration"
    })
  }
};

export const login = async (req, res) => {
  const {email, password} = req.body;

  try {
    const user = await db.User.findUnique({
      where:{
        email
      }
    })

    if(!user) {
      // missing data, bad request
      return res.status(400).json({
        success: false,
        error: "user not found"
      })
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if(!isMatch) {
      return res.status(401).json({
        success: false,
        error: "Invalid credential"
      })
    }

    const token = jwt.sign(
      {id: user.id},
      process.env.JWT_SECRET,
      {expiresIn: "1d"}
    )

    res.cookie("jwt", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 1000*60*60*24,
      sameSite: 'lax'
    })

    return res.status(200).json({
      success: true,
      message: "User logged in",
      user: {
        id: user.id,
        name: user.name,
        email: user.email
      }
    })
  } catch (error) {
    console.error("Error in login:", error);
    // internal server issue
    res.status(500).json({
      success: false,
      error: "Error in login"
    })
  }
};

export const logout = async (req, res) => {
  try {
    res.clearCookie("jwt", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 1000*60*60*24,
      sameSite: 'lax'
    })

    // no response need
    return res.status(204).json({
      success: true,
      message: "User logged out"
    })
  } catch (error) {
    console.error("Error in logout:", error);
    // internal server issue
    return res.status(500).json({
      success: false,
      message: "Error in logout"
    })
  }
}

export const me = async (req, res) => {
  try {
    return res.status(200).json({
      success: true,
      message: "User authenticated successfully",
      user:req.user
    })
  } catch (error) {
    // unauthorized
    return res.status(401).json({
      success: false,
      error: "User authentication failed"
    })
  }
};