import express, { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { PORT, JWT_SECRET, JWT_EXPIRY, SALT_ROUNDS, MIN_PASSWORD_LENGTH, EMAIL_REGEX } from './config/constants';
import { userDb } from './database/userDb';
import { verifyToken, AuthRequest } from './middleware/authMiddleware';

const app = express();

// Middleware
app.use(express.json());

// Signup endpoint
app.post('/signup', async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      res.status(400).json({ 
        success: false, 
        message: 'Email and password are required' 
      });
      return;
    }

    // Email format validation
    if (!EMAIL_REGEX.test(email)) {
      res.status(400).json({ 
        success: false, 
        message: 'Invalid email format' 
      });
      return;
    }

    // Password length validation
    if (password.length < MIN_PASSWORD_LENGTH) {
      res.status(400).json({ 
        success: false, 
        message: `Password must be at least ${MIN_PASSWORD_LENGTH} characters long` 
      });
      return;
    }

    // Check if user already exists
    if (userDb.findByEmail(email)) {
      res.status(409).json({ 
        success: false, 
        message: 'User already exists' 
      });
      return;
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

    // Create new user
    const newUser = userDb.create(email, hashedPassword);

    // Generate JWT token
    const token = jwt.sign(
      { id: newUser.id, email: newUser.email },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRY }
    );

    res.status(201).json({
      success: true,
      message: 'User created successfully',
      data: {
        id: newUser.id,
        email: newUser.email,
        token
      }
    });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error' 
    });
  }
});

// Login endpoint
app.post('/login', async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      res.status(400).json({ 
        success: false, 
        message: 'Email and password are required' 
      });
      return;
    }

    // Find user
    const user = userDb.findByEmail(email);
    if (!user) {
      res.status(401).json({ 
        success: false, 
        message: 'Invalid email or password' 
      });
      return;
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      res.status(401).json({ 
        success: false, 
        message: 'Invalid email or password' 
      });
      return;
    }

    // Generate JWT token
    const token = jwt.sign(
      { id: user.id, email: user.email },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRY }
    );

    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: {
        id: user.id,
        email: user.email,
        token
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error' 
    });
  }
});

// Protected endpoint - requires valid JWT token
app.get('/profile', verifyToken, (req: AuthRequest, res: Response): void => {
  try {
    // User data is available from the middleware
    const user = userDb.findByEmail(req.user!.email);

    if (!user) {
      res.status(404).json({
        success: false,
        message: 'User not found'
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: 'Profile retrieved successfully',
      data: {
        id: user.id,
        email: user.email,
        createdAt: user.createdAt
      }
    });
  } catch (error) {
    console.error('Profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
  console.log(`\nAvailable endpoints:`);
  console.log(`- POST http://localhost:${PORT}/signup`);
  console.log(`- POST http://localhost:${PORT}/login`);
  console.log(`- GET  http://localhost:${PORT}/profile (Protected - requires token)`);
});
