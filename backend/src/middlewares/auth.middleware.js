import jwt from "jsonwebtoken";
import {db} from "../libs/db.js";

export const authMiddleware = async (req, res, next) => {
  const token = req.cookies.jwt;

  if(!token) {
    return res.status(401).json({
      success: false,
      error: "Unauthorized token"
    })
  }

  let decoded;
  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET);
  } catch (error) {
    console.error("Unautorized token")
    // unauthorized
    return res.status(401).json({
      success: false,
      error: "Unauthorized token"
    })
  }
  
  try {
    const user = await db.user.findUnique({
      where:{
        id:decoded.id
      },
      select: {
        id:true,
        name:true,
        email:true,
        role:true
      }
    });

    if(!user) {
      return res.status(404).json({
        success: false,
        error: "user doesn't found"
      })
    }

    req.user = user;
    next();
  } catch (error) {
    console.error("error in authentication middleware: ", error);
    return res.status(500).json({
      success: false,
      error: "error in authentication"
    })
  }
}

// no need to vaidate in db, as we have already checked in auth middleware
export const checkAdmin = (req, res, next) => {
  if(req.user.role !== "ADMIN") {
    // authenticated, but don't have this permission
    return res.status(403).json({
      success: false,
      error: "Access denied"
    })
  }
  next();
}