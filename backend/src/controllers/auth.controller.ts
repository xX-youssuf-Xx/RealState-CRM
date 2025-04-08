import type { Request, Response } from "express";
import bcryptjs from "bcryptjs"; // Changed import
import jwt from "jsonwebtoken";
import type { Secret } from "jsonwebtoken";
import { EmployeeModel } from "../models/employee.model";
import dotenv from "dotenv";

dotenv.config();

const jwtSecret = process.env.JWT_SECRET as Secret;

export const login = async (req: Request, res: Response): Promise<void> => {
  const { number, password } = req.body;

  try {
    const employee = await EmployeeModel.getByNumber(number);
    console.log("Employee from DB:", employee);
    console.log("Value of employee?.hashedpass:", employee?.hashedpass); // Add this line
    if (!employee?.hashedpass) {
      console.log("No hashed password found for employee:", employee , !employee?.hashedpass);
      res.status(401).json({ message: "Invalid credentials" });
      return;
    }
    if(employee.role === "DELETED") {
      res.status(401).json({ message: "user not allowed" });
      return;
    }
    
    const comparisonResult = await bcryptjs.compare(
      password,
      employee.hashedpass
    ); // Changed to bcryptjs.compare
    console.log("Comparison Result:", comparisonResult); // Add this line
    const authorized = employee && employee.hashedpass && comparisonResult;
    console.log("Employee:", employee);
    console.log("Authorized:", authorized);

    if (authorized) {
      const token = jwt.sign(
        { id: employee.id, role: employee.role },
        jwtSecret,
        { expiresIn: "1d" }
      );
      res.status(200).json({ 
        token: token,
        employee: { 
          id: employee.id,
          name: employee.name,
          role: employee.role,
          number: employee.number,
        }
       });
    } else {
      res
        .status(401)
        .json({
          message: "Invalid credentials",
          result: { employee },
          authorized: authorized,
        });
    }
  } catch (error) {
    console.error("Error during login:", error);
    res.status(500).json({ message: "Login failed" });
  }
};
