'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import moment from 'moment';
import { DayPicker } from 'react-day-picker';
import 'react-day-picker/style.css';
import { useLocalStorage, Doctor, DoctorAppointment } from '@/hooks/useLocalStorage';

export default function DashboardMedicoPage() {
  const [currentDoctor, setCurrentDoctor] = useState<Doctor | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'criar' | 'consultas'>('dashboard');
  const [appointments, setAppointments] = useState<DoctorAppointment[]>([]);
  
  // Form states for creating appointments
  const [isCreating, setIsCreating] = useState<boolean>(false);
  const [appointmentForm, setAppointmentForm] = useState({
    patientName: '',
    startTime: '',
    endTime: '',
    date: '',
    notes: ''
  });
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [showDatePicker, setShowDatePicker] = useState<boolean>(false);
  const datePickerRef = useRef<HTMLDivElement>(null);

  // Loading states
  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null);
  const [deletingAppointment, setDeletingAppointment] = useState<string | null>(null);

  const { 
    getCurrentDoctor, 
    clearDoctorSession, 
    createDoctorAppointment, 
    getDoctorAppointments, 
    updateAppointmentStatus, 
    deleteDoctorAppointment 
  } = useLocalStorage();

  // Generate time options for select dropdowns
  const generateTimeOptions = (selectedDate?: string) => {
    const options = [];
    const now = moment();
    const isToday = selectedDate && moment(selectedDate, 'DD/MM/YYYY').isSame(now, 'day');
    
    for (let hour = 7; hour <= 18; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const time = moment({ hour, minute });
        
        // Skip times that have already passed today
        if (isToday && time.isSameOrBefore(now)) {
          continue;
        }
        
        options.push(time.format('HH:mm'));
      }
    }
    return options;
  };

  // Check if there's a time conflict with existing appointments
  const hasTimeConflict = (startTime: string, endTime: string, date: string, doctorId: string): boolean => {
    const newStart = moment(`${date} ${startTime}`, 'DD/MM/YYYY HH:mm');
    const newEnd = moment(`${date} ${endTime}`, 'DD/MM/YYYY HH:mm');
    
    return appointments.some(appointment => {
      // Skip cancelled appointments
      if (appointment.status === 'cancelled') return false;
      
      // Check if it's the same doctor and same date
      if (appointment.doctorId !== doctorId || appointment.date !== date) return false;
      
      const existingStart = moment(`${appointment.date} ${appointment.startTime}`, 'DD/MM/YYYY HH:mm');
      const existingEnd = moment(`${appointment.date} ${appointment.endTime}`, 'DD/MM/YYYY HH:mm');
      
      // Check for overlap: new appointment starts before existing ends AND new appointment ends after existing starts
      return newStart.isBefore(existingEnd) && newEnd.isAfter(existingStart);
    });
  };

  // Check if the selected date and time have already passed
  const hasDateTimePassed = (date: string, time: string): boolean => {
    const selectedDateTime = moment(`${date} ${time}`, 'DD/MM/YYYY HH:mm');
    return selectedDateTime.isSameOrBefore(moment());
  };

  const timeOptions = generateTimeOptions(appointmentForm.date);

  const loadAppointments = (doctorId: string) => {
    const doctorAppointments = getDoctorAppointments(doctorId);
    setAppointments(doctorAppointments);
  };

  useEffect(() => {
    try {
      const doctor = getCurrentDoctor();
      if (doctor) {
        setCurrentDoctor(doctor);
        loadAppointments(doctor.id);
        setIsLoading(false);
      } else {
        window.location.href = '/login-medico';
      }
    } catch (error) {
      console.error('Error loading doctor data:', error);
      window.location.href = '/login-medico';
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Reload appointments when switching to consultation tab
  useEffect(() => {
    if (activeTab === 'consultas' && currentDoctor) {
      loadAppointments(currentDoctor.id);
    }
  }, [activeTab, currentDoctor?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleLogout = () => {
    if (confirm('Deseja realmente sair do sistema?')) {
      clearDoctorSession();
      window.location.href = '/';
    }
  };

  const formatCpf = (value: string): string => {
    const numbers = value.replace(/\D/g, '');
    if (numbers.length <= 3) {
      return numbers;
    } else if (numbers.length <= 6) {
      return `${numbers.slice(0, 3)}.${numbers.slice(3)}`;
    } else if (numbers.length <= 9) {
      return `${numbers.slice(0, 3)}.${numbers.slice(3, 6)}.${numbers.slice(6)}`;
    } else {
      return `${numbers.slice(0, 3)}.${numbers.slice(3, 6)}.${numbers.slice(6, 9)}-${numbers.slice(9, 11)}`;
    }
  };

  const formatPhone = (value: string): string => {
    const numbers = value.replace(/\D/g, '');
    if (numbers.length <= 2) {
      return numbers;
    } else if (numbers.length <= 6) {
      return `(${numbers.slice(0, 2)}) ${numbers.slice(2)}`;
    } else if (numbers.length <= 10) {
      return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 6)}-${numbers.slice(6)}`;
    } else {
      return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 7)}-${numbers.slice(7, 11)}`;
    }
  };

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    if (name === 'patientCpf') {
      setAppointmentForm(prev => ({ ...prev, [name]: formatCpf(value) }));
    } else if (name === 'patientPhone') {
      setAppointmentForm(prev => ({ ...prev, [name]: formatPhone(value) }));
    } else {
      setAppointmentForm(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleDateSelect = (date: Date | undefined) => {
    setSelectedDate(date);
    if (date) {
      const formattedDate = moment(date).format('DD/MM/YYYY');
      setAppointmentForm(prev => ({ 
        ...prev, 
        date: formattedDate,
        // Reset time selections when date changes to force user to select valid times
        startTime: '',
        endTime: ''
      }));
      setShowDatePicker(false); // Close the date picker after selection
    } else {
      setAppointmentForm(prev => ({ 
        ...prev, 
        date: '',
        startTime: '',
        endTime: ''
      }));
    }
  };

  const handleDateInputClick = () => {
    setShowDatePicker(!showDatePicker);
  };

  const handleDateInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setAppointmentForm(prev => ({ 
      ...prev, 
      date: value,
      // Reset time selections when date changes
      startTime: '',
      endTime: ''
    }));
    
    // Try to parse the date if it's in DD/MM/YYYY format
    if (value.length === 10) {
      const dateParts = value.split('/');
      if (dateParts.length === 3) {
        const day = parseInt(dateParts[0], 10);
        const month = parseInt(dateParts[1], 10) - 1; // Month is 0-indexed
        const year = parseInt(dateParts[2], 10);
        const parsedDate = new Date(year, month, day);
        
        if (!isNaN(parsedDate.getTime())) {
          setSelectedDate(parsedDate);
        }
      }
    }
  };

  const handleCreateAppointment = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!currentDoctor) return;

    // Basic validation
    if (!appointmentForm.startTime || !appointmentForm.endTime || !appointmentForm.date) {
      alert('Por favor, preencha todos os campos obrigatórios.');
      return;
    }

    // Validate that end time is after start time
    const startMoment = moment(appointmentForm.startTime, 'HH:mm');
    const endMoment = moment(appointmentForm.endTime, 'HH:mm');
    
    if (endMoment.isSameOrBefore(startMoment)) {
      alert('O horário de término deve ser posterior ao horário de início.');
      return;
    }

    // Check if the start time has already passed
    if (hasDateTimePassed(appointmentForm.date, appointmentForm.startTime)) {
      alert('Não é possível criar uma consulta em um horário que já passou.');
      return;
    }

    // Check for time conflicts with existing appointments
    if (hasTimeConflict(appointmentForm.startTime, appointmentForm.endTime, appointmentForm.date, currentDoctor.id)) {
      alert('Já existe uma consulta agendada neste horário. Por favor, escolha outro horário.');
      return;
    }

    setIsCreating(true);

    try {
      await new Promise(resolve => setTimeout(resolve, 1000));

      const success = createDoctorAppointment({
        doctorId: currentDoctor.id,
        patientName: appointmentForm.patientName,
        specialty: currentDoctor.specialty,
        startTime: appointmentForm.startTime,
        endTime: appointmentForm.endTime,
        date: appointmentForm.date,
        status: 'scheduled',
        notes: appointmentForm.notes
      });

      if (success) {
        const message = appointmentForm.patientName ? 'Consulta criada com sucesso!' : 'Horário disponível criado com sucesso!';
        alert(message);
        loadAppointments(currentDoctor.id);
        setAppointmentForm({
          patientName: '',
          startTime: '',
          endTime: '',
          date: '',
          notes: ''
        });
        setSelectedDate(undefined);
        setShowDatePicker(false);
        setActiveTab('consultas');
      } else {
        alert('Erro ao criar. Tente novamente.');
      }
    } catch (error) {
      console.error('Error creating appointment:', error);
      alert('Erro inesperado. Tente novamente.');
    } finally {
      setIsCreating(false);
    }
  };

  const handleStatusUpdate = async (appointmentId: string, newStatus: 'scheduled' | 'completed' | 'cancelled') => {
    setUpdatingStatus(appointmentId);

    try {
      await new Promise(resolve => setTimeout(resolve, 800));

      const success = updateAppointmentStatus(appointmentId, newStatus);

      if (success && currentDoctor) {
        loadAppointments(currentDoctor.id);
        alert(`Status atualizado para: ${getStatusText(newStatus)}`);
      } else {
        alert('Erro ao atualizar status. Tente novamente.');
      }
    } catch (error) {
      console.error('Error updating status:', error);
      alert('Erro inesperado. Tente novamente.');
    } finally {
      setUpdatingStatus(null);
    }
  };

  const handleDeleteAppointment = async (appointmentId: string, patientName?: string) => {
    if (!confirm(`Tem certeza que deseja excluir ${patientName ? `a consulta de ${patientName}` : 'este horário disponível'}?`)) {
      return;
    }

    setDeletingAppointment(appointmentId);

    try {
      await new Promise(resolve => setTimeout(resolve, 800));

      const success = deleteDoctorAppointment(appointmentId);

      if (success && currentDoctor) {
        loadAppointments(currentDoctor.id);
        alert(`${patientName ? 'Consulta excluída' : 'Horário disponível excluído'} com sucesso!`);
      } else {
        alert('Erro ao excluir. Tente novamente.');
      }
    } catch (error) {
      console.error('Error deleting appointment:', error);
      alert('Erro inesperado. Tente novamente.');
    } finally {
      setDeletingAppointment(null);
    }
  };

  const getStatusText = (status: string): string => {
    switch (status) {
      case 'scheduled': return 'Agendada';
      case 'completed': return 'Realizada';
      case 'cancelled': return 'Cancelada';
      default: return status;
    }
  };

  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'scheduled': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getAppointmentsByStatus = () => {
    const scheduled = appointments.filter(apt => apt.status === 'scheduled');
    const completed = appointments.filter(apt => apt.status === 'completed');
    const cancelled = appointments.filter(apt => apt.status === 'cancelled');
    return { scheduled, completed, cancelled };
  };

  // Close date picker when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (datePickerRef.current && !datePickerRef.current.contains(event.target as Node)) {
        setShowDatePicker(false);
      }
    };

    if (showDatePicker) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showDatePicker]);

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-100 pb-24">
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
              <div className="ml-4 text-sm text-gray-600">
                Portal Médico
              </div>
            </div>
            <div className="flex items-center space-x-4">
              {currentDoctor && (
                <div className="text-right">
                  <div className="text-sm font-medium text-gray-800">
                    Dr(a). {currentDoctor.name}
                  </div>
                  <div className="text-xs text-gray-600">
                    {currentDoctor.specialty} - CRM {currentDoctor.crm}
                  </div>
                </div>
              )}
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
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-xl shadow-lg p-8">
          {/* Dashboard Content */}
          {activeTab === 'dashboard' && (
            <div>
              <div className="text-center mb-10">
                <h1 className="text-3xl font-semibold text-gray-800 mb-2">
                  Dashboard Médico
                </h1>
                <p className="text-gray-600">
                  Gerencie suas consultas e pacientes
                </p>
              </div>

              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                {(() => {
                  const { scheduled, completed, cancelled } = getAppointmentsByStatus();
                  return (
                    <>
                      <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
                        <div className="flex items-center">
                          <div className="p-3 rounded-full bg-blue-100">
                            <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                          </div>
                          <div className="ml-4">
                            <p className="text-sm font-medium text-blue-600">Consultas Agendadas</p>
                            <p className="text-2xl font-semibold text-blue-800">{scheduled.length}</p>
                          </div>
                        </div>
                      </div>

                      <div className="bg-green-50 border border-green-200 rounded-xl p-6">
                        <div className="flex items-center">
                          <div className="p-3 rounded-full bg-green-100">
                            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                          </div>
                          <div className="ml-4">
                            <p className="text-sm font-medium text-green-600">Consultas Realizadas</p>
                            <p className="text-2xl font-semibold text-green-800">{completed.length}</p>
                          </div>
                        </div>
                      </div>

                      <div className="bg-red-50 border border-red-200 rounded-xl p-6">
                        <div className="flex items-center">
                          <div className="p-3 rounded-full bg-red-100">
                            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                          </div>
                          <div className="ml-4">
                            <p className="text-sm font-medium text-red-600">Consultas Canceladas</p>
                            <p className="text-2xl font-semibold text-red-800">{cancelled.length}</p>
                          </div>
                        </div>
                      </div>
                    </>
                  );
                })()}
              </div>

              {/* Quick Actions */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <button
                  onClick={() => setActiveTab('criar')}
                  className="bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white p-6 rounded-xl shadow-lg transition-all duration-300 hover:-translate-y-1"
                >
                  <div className="flex items-center justify-center mb-4">
                    <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold mb-2">Criar Horário Disponível</h3>
                  <p className="text-blue-100">Crie um horário para que pacientes possam agendar</p>
                </button>

                <button
                  onClick={() => setActiveTab('consultas')}
                  className="bg-gradient-to-r from-green-600 to-green-500 hover:from-green-700 hover:to-green-600 text-white p-6 rounded-xl shadow-lg transition-all duration-300 hover:-translate-y-1"
                >
                  <div className="flex items-center justify-center mb-4">
                    <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold mb-2">Gerenciar Consultas</h3>
                  <p className="text-green-100">Visualize e gerencie todas as suas consultas</p>
                </button>
              </div>
            </div>
          )}

          {/* Create Appointment Form */}
          {activeTab === 'criar' && (
            <div>
              <div className="text-center mb-8">
                <h1 className="text-3xl font-semibold text-gray-800 mb-2">
                  Criar Horário Disponível
                </h1>
                <p className="text-gray-600">
                  Crie um horário disponível para que os pacientes possam agendar
                </p>
              </div>

              <form onSubmit={handleCreateAppointment} className="max-w-2xl mx-auto space-y-6">
                {/* Patient Name */}
                <div>
                  <label htmlFor="patientName" className="block text-sm font-medium text-gray-700 mb-2">
                    Nome do Paciente (Opcional)
                  </label>
                  <input
                    type="text"
                    id="patientName"
                    name="patientName"
                    value={appointmentForm.patientName}
                    onChange={handleFormChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Deixe vazio para criar horário disponível"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Se vazio, qualquer paciente poderá agendar este horário
                  </p>
                </div>

                {/* Start and End Time */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="startTime" className="block text-sm font-medium text-gray-700 mb-2">
                      Horário de Início *
                    </label>
                    <select
                      id="startTime"
                      name="startTime"
                      value={appointmentForm.startTime}
                      onChange={handleFormChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    >
                      <option value="">Selecione o horário de início</option>
                      {timeOptions.map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label htmlFor="endTime" className="block text-sm font-medium text-gray-700 mb-2">
                      Horário de Término *
                    </label>
                    <select
                      id="endTime"
                      name="endTime"
                      value={appointmentForm.endTime}
                      onChange={handleFormChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    >
                      <option value="">Selecione o horário de término</option>
                      {timeOptions.map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Date */}
                <div className="relative" ref={datePickerRef}>
                  <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-2">
                    Data *
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      id="date"
                      name="date"
                      value={appointmentForm.date}
                      onChange={handleDateInputChange}
                      onClick={handleDateInputClick}
                      className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent cursor-pointer"
                      placeholder="DD/MM/AAAA"
                      maxLength={10}
                      required
                      readOnly
                    />
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                      <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                  </div>
                  
                  {showDatePicker && (
                    <div className="absolute top-full left-0 right-0 z-50 mt-2 bg-white border border-gray-300 rounded-lg shadow-lg p-4">
                      <div className="flex justify-center">
                        <DayPicker
                          mode="single"
                          selected={selectedDate}
                          onSelect={handleDateSelect}
                          disabled={{ before: new Date() }}
                          styles={{
                            caption: { color: '#374151' },
                            day: { 
                              color: '#374151',
                              borderRadius: '8px'
                            },
                            day_selected: { 
                              backgroundColor: '#3B82F6',
                              color: 'white'
                            },
                            day_today: {
                              fontWeight: 'bold',
                              color: '#DC2626'
                            }
                          }}
                        />
                      </div>
                      <div className="flex justify-end mt-3 pt-3 border-t border-gray-200">
                        <button
                          type="button"
                          onClick={() => setShowDatePicker(false)}
                          className="px-3 py-1 text-sm text-gray-600 hover:text-gray-800 transition-colors"
                        >
                          Fechar
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Notes */}
                <div>
                  <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-2">
                    Observações
                  </label>
                  <textarea
                    id="notes"
                    name="notes"
                    value={appointmentForm.notes}
                    onChange={handleFormChange}
                    rows={3}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Observações sobre a consulta (opcional)"
                  />
                </div>

                {/* Submit Button */}
                <div className="flex gap-4">
                  <button
                    type="submit"
                    disabled={isCreating}
                    className={`flex-1 px-6 py-3 rounded-lg font-semibold transition-all duration-300 ${
                      isCreating
                        ? 'bg-gray-400 text-white cursor-not-allowed'
                        : 'bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white hover:-translate-y-0.5 hover:shadow-lg'
                    }`}
                  >
                    {isCreating ? (
                      <div className="flex items-center justify-center">
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Criando...
                      </div>
                    ) : (
                      'Criar Horário Disponível'
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveTab('dashboard')}
                    className="px-6 py-3 border border-gray-300 text-gray-700 hover:bg-gray-50 rounded-lg font-semibold transition-colors duration-200"
                  >
                    Cancelar
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Manage Appointments */}
          {activeTab === 'consultas' && (
            <div>
              <div className="text-center mb-8">
                <h1 className="text-3xl font-semibold text-gray-800 mb-2">
                  Gerenciar Consultas
                </h1>
                <p className="text-gray-600">
                  Visualize e gerencie todas as suas consultas
                </p>
              </div>

              {appointments.length === 0 ? (
                <div className="text-center py-12">
                  <svg className="w-24 h-24 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                  <h3 className="text-xl font-semibold text-gray-600 mb-2">
                    Nenhum horário encontrado
                  </h3>
                  <p className="text-gray-500 mb-6">
                    Você ainda não criou nenhum horário disponível.
                  </p>
                  <button
                    onClick={() => setActiveTab('criar')}
                    className="bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white px-6 py-3 rounded-lg font-semibold transition-all duration-300"
                  >
                    Criar Primeiro Horário
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {appointments.map((appointment) => (
                    <div
                      key={appointment.id}
                      className="bg-gray-50 border border-gray-200 rounded-xl p-6"
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-3">
                            <h3 className="text-lg font-semibold text-gray-800">
                              {appointment.patientName || 'Horário Disponível'}
                            </h3>
                            <span className={`px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wide ${getStatusColor(appointment.status)}`}>
                              {getStatusText(appointment.status)}
                            </span>
                            {!appointment.patientName && (
                              <span className="px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wide bg-orange-100 text-orange-700">
                                Aguardando Paciente
                              </span>
                            )}
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm text-gray-600">
                            {appointment.patientCpf && (
                              <div className="flex items-center">
                                <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                                </svg>
                                {appointment.patientCpf}
                              </div>
                            )}
                            {appointment.patientPhone && (
                              <div className="flex items-center">
                                <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                  <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                                </svg>
                                {appointment.patientPhone}
                              </div>
                            )}
                            <div className="flex items-center">
                              <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                              </svg>
                              {appointment.date}
                            </div>
                            <div className="flex items-center">
                              <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                              </svg>
                              {appointment.startTime} - {appointment.endTime}
                            </div>
                          </div>

                          {appointment.notes && (
                            <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                              <p className="text-sm text-yellow-800">
                                <strong>Observações:</strong> {appointment.notes}
                              </p>
                            </div>
                          )}
                        </div>

                        <div className="flex flex-col gap-2 ml-4">
                          {appointment.status === 'scheduled' && (
                            <>
                              <button
                                onClick={() => handleStatusUpdate(appointment.id, 'completed')}
                                disabled={updatingStatus === appointment.id}
                                className={`px-3 py-2 rounded-lg text-xs font-semibold uppercase tracking-wide transition-all duration-300 ${
                                  updatingStatus === appointment.id
                                    ? 'bg-gray-400 text-white cursor-not-allowed'
                                    : 'bg-green-100 text-green-700 hover:bg-green-200'
                                }`}
                              >
                                {updatingStatus === appointment.id ? 'Atualizando...' : 'Marcar como Realizada'}
                              </button>
                              <button
                                onClick={() => handleStatusUpdate(appointment.id, 'cancelled')}
                                disabled={updatingStatus === appointment.id}
                                className={`px-3 py-2 rounded-lg text-xs font-semibold uppercase tracking-wide transition-all duration-300 ${
                                  updatingStatus === appointment.id
                                    ? 'bg-gray-400 text-white cursor-not-allowed'
                                    : 'bg-red-100 text-red-700 hover:bg-red-200'
                                }`}
                              >
                                {updatingStatus === appointment.id ? 'Atualizando...' : 'Cancelar'}
                              </button>
                            </>
                          )}
                          <button
                            onClick={() => handleDeleteAppointment(appointment.id, appointment.patientName)}
                            disabled={deletingAppointment === appointment.id}
                            className={`px-3 py-2 rounded-lg text-xs font-semibold uppercase tracking-wide transition-all duration-300 ${
                              deletingAppointment === appointment.id
                                ? 'bg-gray-400 text-white cursor-not-allowed'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                          >
                            {deletingAppointment === appointment.id ? (
                              <div className="flex items-center justify-center">
                                <svg className="animate-spin -ml-1 mr-1 h-3 w-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Excluindo...
                              </div>
                            ) : (
                              <>
                                <svg className="w-3 h-3 inline mr-1" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                                </svg>
                                Excluir
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </main>

      {/* Mobile Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-2 z-40">
        <div className="flex justify-around items-center max-w-md mx-auto">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`flex flex-col items-center py-2 px-4 rounded-lg transition-all duration-300 ${
              activeTab === 'dashboard'
                ? 'bg-blue-100 text-blue-600'
                : 'text-gray-600 hover:text-blue-600'
            }`}
          >
            <svg className="w-6 h-6 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5a2 2 0 012-2h4a2 2 0 012 2v6H8V5z" />
            </svg>
            <span className="text-xs font-semibold">Dashboard</span>
          </button>

          <button
            onClick={() => setActiveTab('criar')}
            className={`flex flex-col items-center py-2 px-4 rounded-lg transition-all duration-300 ${
              activeTab === 'criar'
                ? 'bg-blue-100 text-blue-600'
                : 'text-gray-600 hover:text-blue-600'
            }`}
          >
            <svg className="w-6 h-6 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            <span className="text-xs font-semibold">Criar</span>
          </button>

          <button
            onClick={() => setActiveTab('consultas')}
            className={`flex flex-col items-center py-2 px-4 rounded-lg transition-all duration-300 ${
              activeTab === 'consultas'
                ? 'bg-blue-100 text-blue-600'
                : 'text-gray-600 hover:text-blue-600'
            }`}
          >
            <svg className="w-6 h-6 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            <span className="text-xs font-semibold">Consultas</span>
          </button>
        </div>
      </div>
    </div>
  );
} 