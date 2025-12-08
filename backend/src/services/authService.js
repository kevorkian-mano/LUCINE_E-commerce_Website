import bcrypt from "bcryptjs";
import { generateToken } from "../utils/jwt.js";
import { validateEmail, validatePassword } from "../utils/validators.js";
import userRepository from "../repositories/userRepository.js";
import { AppError } from "../utils/AppError.js";

class AuthService {
  constructor(userRepositoryParam = null) {
    // Accept repository as dependency (Dependency Injection)
    // If not provided, use default singleton for backward compatibility
    this.userRepository = userRepositoryParam || userRepository;
  }

  // Imperative registration logic
  async register(userData) {
    const { name, email, password } = userData;

    // Validation
    if (!name || !email || !password) {
      throw new AppError("Name, email, and password are required", 400);
    }

    if (!validateEmail(email)) {
      throw new AppError("Invalid email format", 400);
    }

    if (!validatePassword(password)) {
      throw new AppError("Password must be at least 6 characters", 400);
    }

    // Check if user exists
    const existingUser = await this.userRepository.findByEmail(email);
    if (existingUser) {
      throw new AppError("User already exists with this email", 400);
    }

    // Create user (password hashing happens in model pre-save hook)
    const user = await this.userRepository.create({ name, email, password });
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

    const user = await this.userRepository.findByEmail(email);
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
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new Error("User not found");
    }
    return user;
  }
}

// Export both: singleton for backward compatibility and class for factory
export default new AuthService();
export { AuthService };

