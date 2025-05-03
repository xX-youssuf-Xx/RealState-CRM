import type { Request, Response } from "express";
import bcryptjs from "bcryptjs";
import jwt from "jsonwebtoken";
import type { Secret } from "jsonwebtoken";
import { EmployeeModel } from "../models/employee.model";
import dotenv from "dotenv";

dotenv.config();

const jwtSecret = process.env.JWT_SECRET as Secret;
const adminNumber = process.env.ADMIN_NUMBER!;
const adminHashedPassword = process.env.ADMIN_PASSWORD;

export const login = async (req: Request, res: Response): Promise<void> => {
  const { number, password } = req.body;

  try {
    const employee = await EmployeeModel.getByNumber(number);

    if (employee?.role === "DELETED") {
      res.status(401).json({ message: "User not allowed" });
      return;
    }

    if (employee?.hashedpass) {
      const comparisonResult = await bcryptjs.compare(password, employee.hashedpass);
      if (comparisonResult) {
        const token = jwt.sign(
          { id: employee.id, role: employee.role },
          jwtSecret,
          { expiresIn: "30d" }
        );
        res.status(200).json({
          token,
          employee: {
            id: employee.id,
            name: employee.name,
            role: employee.role,
            number: employee.number,
          },
        });
        return;
      }
    }

    // If not found in DB or password doesn't match, check admin fallback
    const isAdmin = number === adminNumber;
    const isAdminPasswordValid = await bcryptjs.compare(password, adminHashedPassword!);

    if (isAdmin && isAdminPasswordValid) {
      const token = jwt.sign(
        { id: "1", role: "ADMIN" },
        jwtSecret,
        { expiresIn: "1y" }
      );
      res.status(200).json({
        token,
        employee: {
          id: "1",
          name: "Manager",
          role: "ADMIN",
          number: adminNumber,
        },
      });
      return;
    }

    // Final fallback: invalid credentials
    res.status(401).json({ message: "Invalid credentials" });

  } catch (error) {
    console.error("Error during login:", error);
    res.status(500).json({ message: "Login failed" });
  }
};
