import bcrypt from "bcryptjs";
import userRepository from "../repositories/userRepository.js";
import { generateToken } from "../utils/jwt.js";
import { validateEmail, validatePassword } from "../utils/validators.js";

class AuthService {
  // Imperative registration logic
  async register(userData) {
    const { name, email, password } = userData;

    // Validation
    if (!name || !email || !password) {
      throw new Error("Name, email, and password are required");
    }

    if (!validateEmail(email)) {
      throw new Error("Invalid email format");
    }

    if (!validatePassword(password)) {
      throw new Error("Password must be at least 6 characters");
    }

    // Check if user exists
    const existingUser = await userRepository.findByEmail(email);
    if (existingUser) {
      throw new Error("User already exists with this email");
    }

    // Create user (password hashing happens in model pre-save hook)
    const user = await userRepository.create({ name, email, password });
    const token = generateToken(user._id);

    return {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      },
      token
    };
  }

  // Imperative login logic
  async login(email, password) {
    if (!email || !password) {
      throw new Error("Email and password are required");
    }

    const user = await userRepository.findByEmail(email);
    if (!user) {
      throw new Error("Invalid credentials");
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      throw new Error("Invalid credentials");
    }

    const token = generateToken(user._id);

    return {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      },
      token
    };
  }

  async getProfile(userId) {
    const user = await userRepository.findById(userId);
    if (!user) {
      throw new Error("User not found");
    }
    return user;
  }
}

export default new AuthService();

