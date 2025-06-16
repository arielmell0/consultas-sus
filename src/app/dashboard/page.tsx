'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useLocalStorage, User } from '@/hooks/useLocalStorage';

interface Appointment {
  day: string;
  time: string;
  date: string;
}

interface Doctor {
  name: string;
  appointments: Appointment[];
}

interface SpecialtyData {
  title: string;
  doctors: Doctor[];
}

interface SpecialtiesData {
  [key: string]: SpecialtyData;
}

interface SuccessModalData {
  doctor: string;
  day: string;
  time: string;
  date: string;
}

export default function DashboardPage() {
  const [selectedSpecialty, setSelectedSpecialty] = useState<string>('ginecologia');
  const [userEmail, setUserEmail] = useState<string>('');
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [showSuccessModal, setShowSuccessModal] = useState<boolean>(false);
  const [successModalData, setSuccessModalData] = useState<SuccessModalData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  
  const { bookAppointment, isAppointmentBooked, getCurrentUser, clearSession } = useLocalStorage();

  const specialtiesData: SpecialtiesData = {
    'ginecologia': {
      title: 'Ginecologia - Horários Disponíveis',
      doctors: [
        {
          name: 'Dra. Ana Carolina - Ginecologia',
          appointments: [
            { day: 'Segunda-feira', time: '08:00 - 12:00', date: '17/06/2025' },
            { day: 'Quarta-feira', time: '14:00 - 18:00', date: '19/06/2025' },
            { day: 'Sexta-feira', time: '08:00 - 12:00', date: '21/06/2025' }
          ]
        },
        {
          name: 'Dra. Mariana Santos - Ginecologia',
          appointments: [
            { day: 'Terça-feira', time: '13:00 - 17:00', date: '18/06/2025' },
            { day: 'Quinta-feira', time: '08:00 - 12:00', date: '20/06/2025' },
            { day: 'Sábado', time: '09:00 - 13:00', date: '22/06/2025' }
          ]
        }
      ]
    },
    'pediatria': {
      title: 'Pediatria - Horários Disponíveis',
      doctors: [
        {
          name: 'Dr. Carlos Eduardo - Pediatria',
          appointments: [
            { day: 'Segunda-feira', time: '07:00 - 11:00', date: '17/06/2025' },
            { day: 'Terça-feira', time: '13:00 - 17:00', date: '18/06/2025' },
            { day: 'Quinta-feira', time: '08:00 - 12:00', date: '20/06/2025' },
            { day: 'Sexta-feira', time: '14:00 - 18:00', date: '21/06/2025' }
          ]
        },
        {
          name: 'Dra. Fernanda Lima - Pediatria',
          appointments: [
            { day: 'Segunda-feira', time: '14:00 - 18:00', date: '17/06/2025' },
            { day: 'Quarta-feira', time: '08:00 - 12:00', date: '19/06/2025' },
            { day: 'Sexta-feira', time: '13:00 - 17:00', date: '21/06/2025' }
          ]
        }
      ]
    },
    'clinica-geral': {
      title: 'Clínica Geral - Horários Disponíveis',
      doctors: [
        {
          name: 'Dr. Roberto Silva - Clínica Geral',
          appointments: [
            { day: 'Segunda-feira', time: '08:00 - 12:00', date: '17/06/2025' },
            { day: 'Terça-feira', time: '14:00 - 18:00', date: '18/06/2025' },
            { day: 'Quarta-feira', time: '08:00 - 12:00', date: '19/06/2025' },
            { day: 'Quinta-feira', time: '13:00 - 17:00', date: '20/06/2025' },
            { day: 'Sexta-feira', time: '08:00 - 12:00', date: '21/06/2025' }
          ]
        },
        {
          name: 'Dra. Patricia Oliveira - Clínica Geral',
          appointments: [
            { day: 'Segunda-feira', time: '13:00 - 17:00', date: '17/06/2025' },
            { day: 'Terça-feira', time: '08:00 - 12:00', date: '18/06/2025' },
            { day: 'Quarta-feira', time: '14:00 - 18:00', date: '19/06/2025' },
            { day: 'Quinta-feira', time: '08:00 - 12:00', date: '20/06/2025' }
          ]
        }
      ]
    },
    'cardiologia': {
      title: 'Cardiologia - Horários Disponíveis',
      doctors: [
        {
          name: 'Dr. João Cardoso - Cardiologia',
          appointments: [
            { day: 'Segunda-feira', time: '09:00 - 13:00', date: '17/06/2025' },
            { day: 'Quarta-feira', time: '15:00 - 19:00', date: '19/06/2025' },
            { day: 'Sexta-feira', time: '08:00 - 12:00', date: '21/06/2025' }
          ]
        }
      ]
    },
    'dermatologia': {
      title: 'Dermatologia - Horários Disponíveis',
      doctors: [
        {
          name: 'Dra. Sofia Pele - Dermatologia',
          appointments: [
            { day: 'Terça-feira', time: '14:00 - 18:00', date: '18/06/2025' },
            { day: 'Quinta-feira', time: '09:00 - 13:00', date: '20/06/2025' },
            { day: 'Sábado', time: '08:00 - 12:00', date: '22/06/2025' }
          ]
        }
      ]
    },
    'ortopedia': {
      title: 'Ortopedia - Horários Disponíveis',
      doctors: [
        {
          name: 'Dr. Marcos Ossos - Ortopedia',
          appointments: [
            { day: 'Segunda-feira', time: '14:00 - 18:00', date: '17/06/2025' },
            { day: 'Quarta-feira', time: '08:00 - 12:00', date: '19/06/2025' },
            { day: 'Sexta-feira', time: '13:00 - 17:00', date: '21/06/2025' }
          ]
        }
      ]
    }
  };

  useEffect(() => {
    // Get current user from session
    const user = getCurrentUser();
    if (user) {
      setCurrentUser(user);
      setUserEmail(user.email);
      setIsLoading(false);
    } else {
      // No valid session, redirect to login
      window.location.href = '/login';
    }
  }, []); // Empty dependency array to run only on mount

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando...</p>
        </div>
      </div>
    );
  }

  const handleSpecialtySelect = (specialty: string) => {
    setSelectedSpecialty(specialty);
  };

  const handleBookAppointment = (doctor: string, day: string, time: string, date: string) => {
    if (!currentUser) {
      alert('Você precisa estar logado para agendar uma consulta.');
      return;
    }

    // Check if already booked
    if (isAppointmentBooked(doctor, day, time, date)) {
      alert('Este horário já está agendado.');
      return;
    }

    const specialtyName = getSpecialtyName(selectedSpecialty);
    
    // Book the appointment
    const success = bookAppointment({
      userId: currentUser.id,
      doctor,
      specialty: specialtyName,
      day,
      time,
      date
    });

    if (success) {
      setSuccessModalData({ doctor, day, time, date });
      setShowSuccessModal(true);
    } else {
      alert('Erro ao agendar consulta. Tente novamente.');
    }
  };

  const handleCloseModal = () => {
    setShowSuccessModal(false);
    setSuccessModalData(null);
  };

  const handleLogout = () => {
    if (confirm('Deseja realmente sair do sistema?')) {
      clearSession();
      window.location.href = '/';
    }
  };

  const getSpecialtyIcon = (specialty: string): string => {
    const icons: { [key: string]: string } = {
      'ginecologia': '👩‍⚕️',
      'pediatria': '💉',
      'clinica-geral': '🩺',
      'cardiologia': '❤️',
      'dermatologia': '🧴',
      'ortopedia': '🦴'
    };
    return icons[specialty] || '🏥';
  };

  const getSpecialtyName = (specialty: string): string => {
    const names: { [key: string]: string } = {
      'ginecologia': 'Ginecologia',
      'pediatria': 'Pediatria',
      'clinica-geral': 'Clínica Geral',
      'cardiologia': 'Cardiologia',
      'dermatologia': 'Dermatologia',
      'ortopedia': 'Ortopedia'
    };
    return names[specialty] || specialty;
  };

  const isSlotBooked = (doctor: string, day: string, time: string, date: string): boolean => {
    return isAppointmentBooked(doctor, day, time, date);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-100 pb-20">
      {/* Success Modal */}
      {showSuccessModal && successModalData && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-8 transform transition-all duration-300 scale-100">
            <div className="text-center">
              {/* Success Icon */}
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              
              <h3 className="text-2xl font-semibold text-gray-800 mb-4">
                Consulta Agendada!
              </h3>
              
              <div className="bg-gray-50 rounded-lg p-4 mb-6 text-left">
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="font-medium text-gray-600">Médico:</span>
                    <span className="text-gray-800">{successModalData.doctor}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium text-gray-600">Data:</span>
                    <span className="text-gray-800">{successModalData.day}, {successModalData.date}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium text-gray-600">Horário:</span>
                    <span className="text-gray-800">{successModalData.time}</span>
                  </div>
                </div>
              </div>
              
              <p className="text-gray-600 mb-6">
                Sua consulta foi agendada com sucesso! Você receberá uma confirmação por email e SMS.
              </p>
              
              <button
                onClick={handleCloseModal}
                className="w-full bg-gradient-to-r from-green-600 to-green-500 hover:from-green-700 hover:to-green-600 text-white px-6 py-3 rounded-lg font-semibold transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg"
              >
                Perfeito!
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <Link href="/" className="flex items-center">
                <svg viewBox="0 0 320 80" className="w-48 h-12">
                  <text x="10" y="55" fill="#1e5ba8" fontSize="36" fontWeight="bold" fontFamily="Arial, sans-serif">
                    SUS
                  </text>
                  <g transform="translate(100, 10)">
                    <rect x="20" y="0" width="20" height="60" fill="#1e5ba8"/>
                    <rect x="0" y="20" width="60" height="20" fill="#1e5ba8"/>
                  </g>
                  <text x="180" y="25" fill="#1e5ba8" fontSize="12" fontWeight="normal" fontFamily="Arial, sans-serif">
                    Sistema
                  </text>
                  <text x="180" y="40" fill="#1e5ba8" fontSize="12" fontWeight="normal" fontFamily="Arial, sans-serif">
                    Único
                  </text>
                  <text x="180" y="55" fill="#1e5ba8" fontSize="12" fontWeight="normal" fontFamily="Arial, sans-serif">
                    de Saúde
                  </text>
                </svg>
              </Link>
            </div>
            <div className="flex items-center space-x-4">
              {userEmail && (
                <span className="text-sm text-gray-600">
                  Olá, {userEmail.split('@')[0]}
                </span>
              )}
              <Link 
                href="/usuarios" 
                className="text-gray-600 hover:text-blue-600 px-4 py-2 rounded-lg font-medium transition-colors duration-200"
              >
                Ver Usuários
              </Link>
              <button
                onClick={handleLogout}
                className="border border-red-600 text-red-600 hover:bg-red-600 hover:text-white px-4 py-2 rounded-lg font-medium transition-colors duration-200"
              >
                Sair
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-xl shadow-lg p-8">
          {/* Header */}
          <div className="text-center mb-10">
            <div className="mb-5">
              <svg viewBox="0 0 320 80" className="w-64 h-16 mx-auto">
                <text x="10" y="55" fill="#1e5ba8" fontSize="36" fontWeight="bold" fontFamily="Arial, sans-serif">
                  SUS
                </text>
                <g transform="translate(100, 10)">
                  <rect x="20" y="0" width="20" height="60" fill="#1e5ba8"/>
                  <rect x="0" y="20" width="60" height="20" fill="#1e5ba8"/>
                </g>
                <text x="180" y="25" fill="#1e5ba8" fontSize="12" fontWeight="normal" fontFamily="Arial, sans-serif">
                  Sistema
                </text>
                <text x="180" y="40" fill="#1e5ba8" fontSize="12" fontWeight="normal" fontFamily="Arial, sans-serif">
                  Único
                </text>
                <text x="180" y="55" fill="#1e5ba8" fontSize="12" fontWeight="normal" fontFamily="Arial, sans-serif">
                  de Saúde
                </text>
              </svg>
            </div>
            <h1 className="text-3xl font-semibold text-gray-800 mb-2">
              Horários Disponíveis por Especialidade
            </h1>
            <p className="text-gray-600">
              Selecione uma especialidade para ver os horários disponíveis
            </p>
          </div>

          {/* Specialties Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mb-10">
            {Object.keys(specialtiesData).map((specialty) => (
              <div
                key={specialty}
                className={`bg-gray-50 border-2 rounded-xl p-8 text-center cursor-pointer transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg ${
                  selectedSpecialty === specialty
                    ? 'border-blue-600 bg-blue-50'
                    : 'border-gray-200 hover:border-blue-600'
                }`}
                onClick={() => handleSpecialtySelect(specialty)}
              >
                <div className="text-5xl mb-4">
                  {getSpecialtyIcon(specialty)}
                </div>
                <div className="text-base font-semibold text-gray-800 uppercase tracking-wide">
                  {getSpecialtyName(specialty)}
                </div>
              </div>
            ))}
          </div>

          {/* Doctors Section */}
          <div className="mt-10">
            {selectedSpecialty ? (
              <div>
                <h2 className="text-2xl font-semibold text-gray-800 mb-6 pb-3 border-b-2 border-gray-200">
                  {specialtiesData[selectedSpecialty].title}
                </h2>
                <div className="space-y-5">
                  {specialtiesData[selectedSpecialty].doctors.map((doctor, doctorIndex) => (
                    <div
                      key={doctorIndex}
                      className="bg-gray-50 border-2 border-gray-200 rounded-xl p-6 transition-all duration-300 hover:border-blue-600 hover:bg-white"
                    >
                      <div className="text-xl font-semibold text-blue-600 mb-4">
                        {doctor.name}
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                        {doctor.appointments.map((appointment, appointmentIndex) => {
                          const isBooked = isSlotBooked(doctor.name, appointment.day, appointment.time, appointment.date);
                          
                          return (
                            <div
                              key={appointmentIndex}
                              className={`border rounded-lg p-4 flex justify-between items-center transition-all duration-300 ${
                                isBooked 
                                  ? 'bg-green-50 border-green-200' 
                                  : 'bg-white border-gray-200 hover:border-blue-600 hover:shadow-md'
                              }`}
                            >
                              <div className="flex items-center gap-3">
                                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-white text-xs ${
                                  isBooked ? 'bg-green-600' : 'bg-blue-600'
                                }`}>
                                  {isBooked ? '✓' : '🕒'}
                                </div>
                                <div>
                                  <div className="font-semibold text-gray-800 text-sm">
                                    {appointment.day}
                                  </div>
                                  <div className="text-gray-600 text-xs">
                                    {appointment.time}
                                  </div>
                                </div>
                              </div>
                              <div className="text-right">
                                <div className={`font-semibold text-sm mb-2 ${
                                  isBooked ? 'text-green-600' : 'text-blue-600'
                                }`}>
                                  {appointment.date}
                                </div>
                                {isBooked ? (
                                  <span className="bg-green-100 text-green-800 px-4 py-2 rounded-md text-xs font-semibold uppercase tracking-wide">
                                    Agendado
                                  </span>
                                ) : (
                                  <button
                                    onClick={() => handleBookAppointment(
                                      doctor.name,
                                      appointment.day,
                                      appointment.time,
                                      appointment.date
                                    )}
                                    className="bg-gradient-to-r from-blue-700 to-blue-600 hover:from-blue-800 hover:to-blue-700 text-white px-4 py-2 rounded-md text-xs font-semibold uppercase tracking-wide transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md"
                                  >
                                    Agendar
                                  </button>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-center py-16">
                <div className="text-6xl mb-5 opacity-50">📅</div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">
                  Selecione uma especialidade
                </h3>
                <p className="text-gray-600">
                  Clique em uma das especialidades acima para ver os horários disponíveis
                </p>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="text-center mt-10 pt-6 border-t border-gray-200">
            <p className="text-gray-500 text-sm">
              © 2025 Sistema Único de Saúde - Ministério da Saúde
            </p>
          </div>
        </div>
      </main>
    </div>
  );
} 