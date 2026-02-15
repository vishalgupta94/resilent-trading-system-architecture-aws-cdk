// User interface
export interface User {
  id: string;
  email: string;
  password: string;
  createdAt: Date;
}

// In-memory database
const users: User[] = [];

// Database operations
export const userDb = {
  /**
   * Find a user by email
   */
  findByEmail: (email: string): User | undefined => {
    return users.find(user => user.email === email);
  },

  /**
   * Create a new user
   */
  create: (email: string, hashedPassword: string): User => {
    const newUser: User = {
      id: Date.now().toString(),
      email,
      password: hashedPassword,
      createdAt: new Date()
    };
    users.push(newUser);
    return newUser;
  },

  /**
   * Get all users (for debugging purposes)
   */
  getAll: (): User[] => {
    return users;
  },

  /**
   * Get user count
   */
  count: (): number => {
    return users.length;
  },

  /**
   * Clear all users (for testing purposes)
   */
  clear: (): void => {
    users.length = 0;
  }
};
