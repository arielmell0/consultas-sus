import { useState, useEffect } from 'react';

export interface User {
  id: string;
  email: string;
  password: string;
  cpf: string;
  phone: string;
  createdAt: string;
}

const STORAGE_KEY = 'sus_users';

export const useLocalStorage = () => {
  const [users, setUsers] = useState<User[]>([]);

  // Load users from localStorage on mount
  useEffect(() => {
    try {
      const storedUsers = localStorage.getItem(STORAGE_KEY);
      if (storedUsers) {
        setUsers(JSON.parse(storedUsers));
      }
    } catch (error) {
      console.error('Error loading users from localStorage:', error);
    }
  }, []);

  // Save user to localStorage
  const saveUser = (userData: Omit<User, 'id' | 'createdAt'>): boolean => {
    try {
      const newUser: User = {
        ...userData,
        id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
        createdAt: new Date().toISOString()
      };

      const updatedUsers = [...users, newUser];
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedUsers));
      setUsers(updatedUsers);
      return true;
    } catch (error) {
      console.error('Error saving user to localStorage:', error);
      return false;
    }
  };

  // Check if user exists (by email or CPF)
  const userExists = (email: string, cpf: string): boolean => {
    return users.some(user => 
      user.email.toLowerCase() === email.toLowerCase() || 
      user.cpf.replace(/\D/g, '') === cpf.replace(/\D/g, '')
    );
  };

  // Clear all users from localStorage
  const clearAllUsers = (): boolean => {
    try {
      localStorage.removeItem(STORAGE_KEY);
      setUsers([]);
      return true;
    } catch (error) {
      console.error('Error clearing users from localStorage:', error);
      return false;
    }
  };

  // Get user by email/CPF and password (for login)
  const authenticateUser = (emailOrCpf: string, password: string): User | null => {
    const cleanCpf = emailOrCpf.replace(/\D/g, '');
    
    const user = users.find(user => {
      // Check if login is by email
      const emailMatch = user.email.toLowerCase() === emailOrCpf.toLowerCase();
      
      // Check if login is by CPF
      const cpfMatch = user.cpf.replace(/\D/g, '') === cleanCpf;
      
      // Return user if email or CPF matches and password is correct
      return (emailMatch || cpfMatch) && user.password === password;
    });
    
    return user || null;
  };

  return {
    users,
    saveUser,
    userExists,
    clearAllUsers,
    authenticateUser
  };
}; 