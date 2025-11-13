import authService from "../services/authService.js";
import { asyncHandler } from "../utils/asyncHandler.js";

class AuthController {
  // Register new user
  register = asyncHandler(async (req, res) => {
    const result = await authService.register(req.body);
    res.status(201).json({
      success: true,
      message: "User registered successfully",
      data: result
    });
  });

  // Login user
  login = asyncHandler(async (req, res) => {
    const { email, password } = req.body;
    const result = await authService.login(email, password);
    res.json({
      success: true,
      message: "Login successful",
      data: result
    });
  });

  // Get user profile
  getProfile = asyncHandler(async (req, res) => {
    const user = await authService.getProfile(req.user.id);
    res.json({
      success: true,
      data: user
    });
  });

  // Logout (client-side token removal, but we can add token blacklisting here if needed)
  logout = asyncHandler(async (req, res) => {
    res.json({
      success: true,
      message: "Logged out successfully"
    });
  });
}

export default new AuthController();

