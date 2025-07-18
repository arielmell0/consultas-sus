import { useState, useEffect } from 'react';

export interface User {
  id: string;
  email: string;
  password: string;
  cpf: string;
  phone: string;
  createdAt: string;
}

export interface Doctor {
  id: string;
  email: string;
  password: string;
  name: string;
  crm: string;
  specialty: string;
  phone: string;
  createdAt: string;
}

export interface BookedAppointment {
  id: string;
  userId: string;
  doctor: string;
  specialty: string;
  day: string;
  time: string;
  date: string;
  bookedAt: string;
}

export interface SessionData {
  userId: string;
  expiresAt: string;
  remember: boolean;
}

export interface SavedCredentials {
  emailOrCpf: string;
  password: string;
  lastUsed: string;
}

export interface DoctorAppointment {
  id: string;
  doctorId: string;
  patientName?: string;
  patientCpf?: string;
  patientPhone?: string;
  specialty: string;
  startTime: string;
  endTime: string;
  date: string;
  status: 'scheduled' | 'completed' | 'cancelled';
  createdAt: string;
  notes?: string;
}

const STORAGE_KEY = 'sus_users';
const APPOINTMENTS_KEY = 'sus_appointments';
const SESSION_KEY = 'sus_session';
const CREDENTIALS_KEY = 'sus_saved_credentials';
const DOCTORS_KEY = 'sus_doctors';
const DOCTOR_APPOINTMENTS_KEY = 'sus_doctor_appointments';
const DOCTOR_SESSION_KEY = 'sus_doctor_session';
const SEVEN_DAYS_IN_MS = 7 * 24 * 60 * 60 * 1000; // 7 days in milliseconds

export const useLocalStorage = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [appointments, setAppointments] = useState<BookedAppointment[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [doctorAppointments, setDoctorAppointments] = useState<DoctorAppointment[]>([]);

  // Load users and appointments from localStorage on mount
  useEffect(() => {
    try {
      const storedUsers = localStorage.getItem(STORAGE_KEY);
      if (storedUsers) {
        setUsers(JSON.parse(storedUsers));
      }

      const storedAppointments = localStorage.getItem(APPOINTMENTS_KEY);
      if (storedAppointments) {
        setAppointments(JSON.parse(storedAppointments));
      }

      const storedDoctors = localStorage.getItem(DOCTORS_KEY);
      if (storedDoctors) {
        setDoctors(JSON.parse(storedDoctors));
      }

      const storedDoctorAppointments = localStorage.getItem(DOCTOR_APPOINTMENTS_KEY);
      if (storedDoctorAppointments) {
        setDoctorAppointments(JSON.parse(storedDoctorAppointments));
      }
    } catch (error) {
      console.error('Error loading data from localStorage:', error);
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
    // Read users directly from localStorage to avoid race condition
    try {
      const storedUsers = localStorage.getItem(STORAGE_KEY);
      if (storedUsers) {
        const usersFromStorage: User[] = JSON.parse(storedUsers);
        return usersFromStorage.some(user => 
          user.email.toLowerCase() === email.toLowerCase() || 
          user.cpf.replace(/\D/g, '') === cpf.replace(/\D/g, '')
        );
      }
      return false;
    } catch (error) {
      console.error('Error reading users from localStorage:', error);
      return false;
    }
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

  // Create session (sessionStorage for regular, localStorage for remember me)
  const createSession = (userId: string, remember: boolean): boolean => {
    try {
      const expiresAt = new Date(Date.now() + SEVEN_DAYS_IN_MS).toISOString();
      const sessionData: SessionData = {
        userId,
        expiresAt,
        remember
      };

      if (remember) {
        // Save to localStorage with expiration for remember me
        localStorage.setItem(SESSION_KEY, JSON.stringify(sessionData));
      } else {
        // Save to sessionStorage for regular login (expires when browser closes)
        sessionStorage.setItem(SESSION_KEY, JSON.stringify(sessionData));
      }

      return true;
    } catch (error) {
      console.error('Error creating session:', error);
      return false;
    }
  };

  // Get current session
  const getCurrentSession = (): SessionData | null => {
    try {
      // Check sessionStorage first (regular login)
      let sessionStr = sessionStorage.getItem(SESSION_KEY);
      if (sessionStr) {
        const session: SessionData = JSON.parse(sessionStr);
        return session; // sessionStorage doesn't expire until browser closes
      }

      // Check localStorage (remember me)
      sessionStr = localStorage.getItem(SESSION_KEY);
      if (sessionStr) {
        const session: SessionData = JSON.parse(sessionStr);
        
        // Check if expired
        if (new Date(session.expiresAt) > new Date()) {
          return session;
        } else {
          // Session expired, remove it
          localStorage.removeItem(SESSION_KEY);
          return null;
        }
      }

      return null;
    } catch (error) {
      console.error('Error getting current session:', error);
      return null;
    }
  };

  // Clear session
  const clearSession = (): void => {
    try {
      sessionStorage.removeItem(SESSION_KEY);
      localStorage.removeItem(SESSION_KEY);
    } catch (error) {
      console.error('Error clearing session:', error);
    }
  };

  // Save credentials for auto-fill
  const saveCredentials = (emailOrCpf: string, password: string): boolean => {
    try {
      const credentials: SavedCredentials = {
        emailOrCpf,
        password,
        lastUsed: new Date().toISOString()
      };
      localStorage.setItem(CREDENTIALS_KEY, JSON.stringify(credentials));
      return true;
    } catch (error) {
      console.error('Error saving credentials:', error);
      return false;
    }
  };

  // Get saved credentials
  const getSavedCredentials = (): SavedCredentials | null => {
    try {
      const credentialsStr = localStorage.getItem(CREDENTIALS_KEY);
      if (credentialsStr) {
        return JSON.parse(credentialsStr);
      }
      return null;
    } catch (error) {
      console.error('Error getting saved credentials:', error);
      return null;
    }
  };

  // Clear saved credentials
  const clearSavedCredentials = (): void => {
    try {
      localStorage.removeItem(CREDENTIALS_KEY);
    } catch (error) {
      console.error('Error clearing saved credentials:', error);
    }
  };

  // Get user by email/CPF and password (for login)
  const authenticateUser = (emailOrCpf: string, password: string, remember: boolean = false): User | null => {
    // Read users directly from localStorage to avoid race condition
    let usersFromStorage: User[] = [];
    try {
      const storedUsers = localStorage.getItem(STORAGE_KEY);
      if (storedUsers) {
        usersFromStorage = JSON.parse(storedUsers);
      }
    } catch (error) {
      console.error('Error reading users from localStorage:', error);
      return null;
    }

    const cleanCpf = emailOrCpf.replace(/\D/g, '');
    
    const user = usersFromStorage.find(user => {
      // Check if login is by email
      const emailMatch = user.email.toLowerCase() === emailOrCpf.toLowerCase();
      
      // Check if login is by CPF
      const cpfMatch = user.cpf.replace(/\D/g, '') === cleanCpf;
      
      // Return user if email or CPF matches and password is correct
      return (emailMatch || cpfMatch) && user.password === password;
    });
    
    if (user) {
      // Create session
      createSession(user.id, remember);
      
      // Save credentials for auto-fill (only if remember me is checked)
      if (remember) {
        saveCredentials(emailOrCpf, password);
      }
    }
    
    return user || null;
  };

  // Get current logged user
  const getCurrentUser = (): User | null => {
    try {
      const session = getCurrentSession();
      if (session) {
        // Read users directly from localStorage to avoid race condition
        const storedUsers = localStorage.getItem(STORAGE_KEY);
        if (storedUsers) {
          const usersFromStorage: User[] = JSON.parse(storedUsers);
          const user = usersFromStorage.find(u => u.id === session.userId);
          return user || null;
        }
      }
      return null;
    } catch (error) {
      console.error('Error getting current user:', error);
      return null;
    }
  };

  // Check if session is expired (for UI feedback)
  const isSessionExpired = (): boolean => {
    const session = getCurrentSession();
    return session === null;
  };

  // Book appointment
  const bookAppointment = (appointmentData: Omit<BookedAppointment, 'id' | 'bookedAt'>): boolean => {
    try {
      const newAppointment: BookedAppointment = {
        ...appointmentData,
        id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
        bookedAt: new Date().toISOString()
      };

      const updatedAppointments = [...appointments, newAppointment];
      localStorage.setItem(APPOINTMENTS_KEY, JSON.stringify(updatedAppointments));
      setAppointments(updatedAppointments);
      return true;
    } catch (error) {
      console.error('Error booking appointment:', error);
      return false;
    }
  };

  // Check if appointment slot is already booked
  const isAppointmentBooked = (doctor: string, day: string, time: string, date: string): boolean => {
    return appointments.some(appointment => 
      appointment.doctor === doctor &&
      appointment.day === day &&
      appointment.time === time &&
      appointment.date === date
    );
  };

  // Get user appointments
  const getUserAppointments = (userId: string): BookedAppointment[] => {
    try {
      // Get regular appointments (old format)
      const regularAppointments = appointments.filter(appointment => appointment.userId === userId);
      
      // Get doctor appointments that were booked by this user
      const storedDoctorAppointments = localStorage.getItem(DOCTOR_APPOINTMENTS_KEY);
      const bookedDoctorAppointments: BookedAppointment[] = [];
      
      if (storedDoctorAppointments) {
        const allDoctorAppointments: DoctorAppointment[] = JSON.parse(storedDoctorAppointments);
        
        // Filter doctor appointments that have this user as patient
        const userDoctorAppointments = allDoctorAppointments.filter(appointment => 
          appointment.patientName && appointment.status === 'scheduled'
        );
        
        // Get doctor information to convert to BookedAppointment format
        const storedDoctors = localStorage.getItem(DOCTORS_KEY);
        if (storedDoctors) {
          const allDoctors: Doctor[] = JSON.parse(storedDoctors);
          
          // Get current user to match by email/cpf
          const storedUsers = localStorage.getItem(STORAGE_KEY);
          if (storedUsers) {
            const allUsers: User[] = JSON.parse(storedUsers);
            const currentUser = allUsers.find(u => u.id === userId);
            
            if (currentUser) {
              userDoctorAppointments.forEach(appointment => {
                // Check if this appointment belongs to current user (by email prefix or CPF)
                const emailPrefix = currentUser.email.split('@')[0];
                if (appointment.patientName === emailPrefix || 
                    appointment.patientCpf === currentUser.cpf) {
                  
                  const doctor = allDoctors.find(d => d.id === appointment.doctorId);
                  if (doctor) {
                    // Convert to BookedAppointment format
                    const dateParts = appointment.date.split('/');
                    const appointmentDate = new Date(parseInt(dateParts[2]), parseInt(dateParts[1]) - 1, parseInt(dateParts[0]));
                    const dayNames = ['Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado'];
                    const dayOfWeek = dayNames[appointmentDate.getDay()];
                    
                    bookedDoctorAppointments.push({
                      id: appointment.id,
                      userId: userId,
                      doctor: doctor.name,
                      specialty: appointment.specialty,
                      day: dayOfWeek,
                      time: `${appointment.startTime} - ${appointment.endTime}`,
                      date: appointment.date,
                      bookedAt: appointment.createdAt
                    });
                  }
                }
              });
            }
          }
        }
      }
      
      // Combine both types of appointments and remove duplicates
      const allAppointments = [...regularAppointments, ...bookedDoctorAppointments];
      
      // Remove duplicates based on doctor, date, and time
      const uniqueAppointments = allAppointments.filter((appointment, index, self) => 
        index === self.findIndex(a => 
          a.doctor === appointment.doctor && 
          a.date === appointment.date && 
          a.time === appointment.time
        )
      );
      
      return uniqueAppointments;
    } catch (error) {
      console.error('Error getting user appointments:', error);
      return appointments.filter(appointment => appointment.userId === userId);
    }
  };

  // Cancel appointment
  const cancelAppointment = (appointmentId: string): boolean => {
    try {
      // First try to cancel regular appointment (old format)
      const regularAppointment = appointments.find(appointment => appointment.id === appointmentId);
      if (regularAppointment) {
        const updatedAppointments = appointments.filter(appointment => appointment.id !== appointmentId);
        localStorage.setItem(APPOINTMENTS_KEY, JSON.stringify(updatedAppointments));
        setAppointments(updatedAppointments);
        return true;
      }
      
      // If not found in regular appointments, try doctor appointments
      const storedDoctorAppointments = localStorage.getItem(DOCTOR_APPOINTMENTS_KEY);
      if (storedDoctorAppointments) {
        const allDoctorAppointments: DoctorAppointment[] = JSON.parse(storedDoctorAppointments);
        const doctorAppointment = allDoctorAppointments.find(appointment => appointment.id === appointmentId);
        
        if (doctorAppointment && doctorAppointment.patientName) {
          // Clear patient information to make it available again
          const updatedDoctorAppointments = allDoctorAppointments.map(appointment => 
            appointment.id === appointmentId 
              ? { 
                  ...appointment, 
                  patientName: undefined,
                  patientCpf: undefined,
                  patientPhone: undefined
                }
              : appointment
          );
          
          localStorage.setItem(DOCTOR_APPOINTMENTS_KEY, JSON.stringify(updatedDoctorAppointments));
          setDoctorAppointments(updatedDoctorAppointments);
          return true;
        }
      }
      
      return false;
    } catch (error) {
      console.error('Error canceling appointment:', error);
      return false;
    }
  };

  // DOCTOR FUNCTIONS

  // Save doctor to localStorage
  const saveDoctor = (doctorData: Omit<Doctor, 'id' | 'createdAt'>): boolean => {
    try {
      const newDoctor: Doctor = {
        ...doctorData,
        id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
        createdAt: new Date().toISOString()
      };

      const updatedDoctors = [...doctors, newDoctor];
      localStorage.setItem(DOCTORS_KEY, JSON.stringify(updatedDoctors));
      setDoctors(updatedDoctors);
      return true;
    } catch (error) {
      console.error('Error saving doctor to localStorage:', error);
      return false;
    }
  };

  // Check if doctor exists (by email or CRM)
  const doctorExists = (email: string, crm: string): boolean => {
    try {
      const storedDoctors = localStorage.getItem(DOCTORS_KEY);
      if (storedDoctors) {
        const doctorsFromStorage: Doctor[] = JSON.parse(storedDoctors);
        return doctorsFromStorage.some(doctor => 
          doctor.email.toLowerCase() === email.toLowerCase() || 
          doctor.crm.replace(/\D/g, '') === crm.replace(/\D/g, '')
        );
      }
      return false;
    } catch (error) {
      console.error('Error reading doctors from localStorage:', error);
      return false;
    }
  };

  // Authenticate doctor
  const authenticateDoctor = (emailOrCrm: string, password: string, remember: boolean = false): Doctor | null => {
    let doctorsFromStorage: Doctor[] = [];
    try {
      const storedDoctors = localStorage.getItem(DOCTORS_KEY);
      if (storedDoctors) {
        doctorsFromStorage = JSON.parse(storedDoctors);
      }
    } catch (error) {
      console.error('Error reading doctors from localStorage:', error);
      return null;
    }

    const cleanCrm = emailOrCrm.replace(/\D/g, '');
    
    const doctor = doctorsFromStorage.find(doctor => {
      const emailMatch = doctor.email.toLowerCase() === emailOrCrm.toLowerCase();
      const crmMatch = doctor.crm.replace(/\D/g, '') === cleanCrm;
      return (emailMatch || crmMatch) && doctor.password === password;
    });
    
    if (doctor) {
      createDoctorSession(doctor.id, remember);
    }
    
    return doctor || null;
  };

  // Create doctor session
  const createDoctorSession = (doctorId: string, remember: boolean): boolean => {
    try {
      const expiresAt = new Date(Date.now() + SEVEN_DAYS_IN_MS).toISOString();
      const sessionData: SessionData = {
        userId: doctorId,
        expiresAt,
        remember
      };

      if (remember) {
        localStorage.setItem(DOCTOR_SESSION_KEY, JSON.stringify(sessionData));
      } else {
        sessionStorage.setItem(DOCTOR_SESSION_KEY, JSON.stringify(sessionData));
      }

      return true;
    } catch (error) {
      console.error('Error creating doctor session:', error);
      return false;
    }
  };

  // Get current doctor session
  const getCurrentDoctorSession = (): SessionData | null => {
    try {
      let sessionStr = sessionStorage.getItem(DOCTOR_SESSION_KEY);
      if (sessionStr) {
        const session: SessionData = JSON.parse(sessionStr);
        return session;
      }

      sessionStr = localStorage.getItem(DOCTOR_SESSION_KEY);
      if (sessionStr) {
        const session: SessionData = JSON.parse(sessionStr);
        
        if (new Date(session.expiresAt) > new Date()) {
          return session;
        } else {
          localStorage.removeItem(DOCTOR_SESSION_KEY);
          return null;
        }
      }

      return null;
    } catch (error) {
      console.error('Error getting current doctor session:', error);
      return null;
    }
  };

  // Get current logged doctor
  const getCurrentDoctor = (): Doctor | null => {
    try {
      const session = getCurrentDoctorSession();
      if (session) {
        const storedDoctors = localStorage.getItem(DOCTORS_KEY);
        if (storedDoctors) {
          const doctorsFromStorage: Doctor[] = JSON.parse(storedDoctors);
          const doctor = doctorsFromStorage.find(d => d.id === session.userId);
          return doctor || null;
        }
      }
      return null;
    } catch (error) {
      console.error('Error getting current doctor:', error);
      return null;
    }
  };

  // Clear doctor session
  const clearDoctorSession = (): void => {
    try {
      sessionStorage.removeItem(DOCTOR_SESSION_KEY);
      localStorage.removeItem(DOCTOR_SESSION_KEY);
    } catch (error) {
      console.error('Error clearing doctor session:', error);
    }
  };

  // Create doctor appointment
  const createDoctorAppointment = (appointmentData: Omit<DoctorAppointment, 'id' | 'createdAt'>): boolean => {
    try {
      const newAppointment: DoctorAppointment = {
        ...appointmentData,
        id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
        createdAt: new Date().toISOString()
      };

      const updatedAppointments = [...doctorAppointments, newAppointment];
      localStorage.setItem(DOCTOR_APPOINTMENTS_KEY, JSON.stringify(updatedAppointments));
      setDoctorAppointments(updatedAppointments);
      return true;
    } catch (error) {
      console.error('Error creating doctor appointment:', error);
      return false;
    }
  };

  // Get doctor appointments
  const getDoctorAppointments = (doctorId: string): DoctorAppointment[] => {
    try {
      const storedDoctorAppointments = localStorage.getItem(DOCTOR_APPOINTMENTS_KEY);
      if (!storedDoctorAppointments) return [];
      
      const allDoctorAppointments: DoctorAppointment[] = JSON.parse(storedDoctorAppointments);
      return allDoctorAppointments.filter(appointment => appointment.doctorId === doctorId);
    } catch (error) {
      console.error('Error getting doctor appointments:', error);
      return [];
    }
  };

  // Update appointment status
  const updateAppointmentStatus = (appointmentId: string, status: 'scheduled' | 'completed' | 'cancelled', notes?: string): boolean => {
    try {
      const updatedAppointments = doctorAppointments.map(appointment => 
        appointment.id === appointmentId 
          ? { ...appointment, status, notes: notes || appointment.notes }
          : appointment
      );
      localStorage.setItem(DOCTOR_APPOINTMENTS_KEY, JSON.stringify(updatedAppointments));
      setDoctorAppointments(updatedAppointments);
      return true;
    } catch (error) {
      console.error('Error updating appointment status:', error);
      return false;
    }
  };

  // Delete doctor appointment
  const deleteDoctorAppointment = (appointmentId: string): boolean => {
    try {
      const updatedAppointments = doctorAppointments.filter(appointment => appointment.id !== appointmentId);
      localStorage.setItem(DOCTOR_APPOINTMENTS_KEY, JSON.stringify(updatedAppointments));
      setDoctorAppointments(updatedAppointments);
      return true;
    } catch (error) {
      console.error('Error deleting doctor appointment:', error);
      return false;
    }
  };

  // Get all available doctor appointments for patient dashboard
  const getAvailableDoctorAppointments = () => {
    try {
      const storedDoctorAppointments = localStorage.getItem(DOCTOR_APPOINTMENTS_KEY);
      if (!storedDoctorAppointments) return [];
      
      const allDoctorAppointments: DoctorAppointment[] = JSON.parse(storedDoctorAppointments);
      
      // Filter only scheduled appointments without patients (available slots)
      const availableSlots = allDoctorAppointments.filter(appointment => 
        appointment.status === 'scheduled' && !appointment.patientName
      );

      // Get doctor information
      const storedDoctors = localStorage.getItem(DOCTORS_KEY);
      if (!storedDoctors) return [];
      
      const allDoctors: Doctor[] = JSON.parse(storedDoctors);

      // Convert to format expected by patient dashboard
      const convertedAppointments = availableSlots.map(appointment => {
        const doctor = allDoctors.find(d => d.id === appointment.doctorId);
        if (!doctor) return null;

        // Convert date from DD/MM/YYYY to a day of week (simplified)
        const dateParts = appointment.date.split('/');
        const appointmentDate = new Date(parseInt(dateParts[2]), parseInt(dateParts[1]) - 1, parseInt(dateParts[0]));
        const dayNames = ['Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado'];
        const dayOfWeek = dayNames[appointmentDate.getDay()];

        return {
          day: dayOfWeek,
          time: `${appointment.startTime} - ${appointment.endTime}`,
          date: appointment.date,
          doctorName: doctor.name,
          doctorId: doctor.id,
          specialty: appointment.specialty,
          appointmentId: appointment.id
        };
      }).filter(Boolean);

      return convertedAppointments;
    } catch (error) {
      console.error('Error getting available doctor appointments:', error);
      return [];
    }
  };

  // Book a doctor appointment created by a doctor
  const bookDoctorAppointment = (appointmentId: string, userId: string, patientCpf?: string, patientPhone?: string): boolean => {
    try {
      // Get the appointment details first
      const storedDoctorAppointments = localStorage.getItem(DOCTOR_APPOINTMENTS_KEY);
      if (!storedDoctorAppointments) return false;
      
      const allDoctorAppointments: DoctorAppointment[] = JSON.parse(storedDoctorAppointments);
      const appointment = allDoctorAppointments.find(apt => apt.id === appointmentId);
      
      if (!appointment || appointment.patientName) {
        return false; // Appointment not found or already booked
      }

      // Get user information
      const storedUsers = localStorage.getItem(STORAGE_KEY);
      if (!storedUsers) return false;
      
      const allUsers: User[] = JSON.parse(storedUsers);
      const user = allUsers.find(u => u.id === userId);
      
      if (!user) return false;

      // Update the doctor appointment with patient information
      const updatedDoctorAppointments = allDoctorAppointments.map(apt => 
        apt.id === appointmentId 
          ? { 
              ...apt, 
              patientName: user.email.split('@')[0], // Use email prefix as name
              patientCpf: patientCpf || user.cpf,
              patientPhone: patientPhone || user.phone
            }
          : apt
      );

      localStorage.setItem(DOCTOR_APPOINTMENTS_KEY, JSON.stringify(updatedDoctorAppointments));
      setDoctorAppointments(updatedDoctorAppointments);

      return true;
    } catch (error) {
      console.error('Error booking doctor appointment:', error);
      return false;
    }
  };

  return {
    users,
    appointments,
    doctors,
    doctorAppointments,
    saveUser,
    userExists,
    clearAllUsers,
    authenticateUser,
    getCurrentUser,
    createSession,
    getCurrentSession,
    clearSession,
    saveCredentials,
    getSavedCredentials,
    clearSavedCredentials,
    isSessionExpired,
    bookAppointment,
    isAppointmentBooked,
    getUserAppointments,
    cancelAppointment,
    // Doctor functions
    saveDoctor,
    doctorExists,
    authenticateDoctor,
    getCurrentDoctor,
    clearDoctorSession,
    createDoctorAppointment,
    getDoctorAppointments,
    updateAppointmentStatus,
    deleteDoctorAppointment,
    // New functions for integrating doctor appointments with patient dashboard
    getAvailableDoctorAppointments,
    bookDoctorAppointment
  };
}; 