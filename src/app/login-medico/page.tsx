'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useLocalStorage } from '@/hooks/useLocalStorage';

export default function LoginMedicoPage() {
  const [formData, setFormData] = useState({
    emailOrCrm: '',
    password: '',
    remember: false
  });

  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { authenticateDoctor, getCurrentDoctor } = useLocalStorage();

  // Check if doctor is already logged in
  useEffect(() => {
    const currentDoctor = getCurrentDoctor();
    if (currentDoctor) {
      window.location.href = '/dashboard-medico';
    }
  }, [getCurrentDoctor]);

  const validateForm = (): boolean => {
    const newErrors: { [key: string]: string } = {};

    // Email or CRM validation
    if (!formData.emailOrCrm.trim()) {
      newErrors.emailOrCrm = 'Email ou CRM é obrigatório';
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = 'Senha é obrigatória';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));

    // Clear specific error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      const doctor = authenticateDoctor(
        formData.emailOrCrm.trim(),
        formData.password,
        formData.remember
      );

      if (doctor) {
        // Redirect to doctor dashboard
        window.location.href = '/dashboard-medico';
      } else {
        setErrors({ general: 'Email/CRM ou senha incorretos' });
      }
    } catch (error) {
      console.error('Error during login:', error);
      setErrors({ general: 'Erro inesperado. Tente novamente.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-500 px-8 py-6">
          <div className="flex items-center justify-center mb-4">
            <svg viewBox="0 0 320 80" className="w-48 h-12">
              <text x="10" y="55" fill="white" fontSize="36" fontWeight="bold" fontFamily="Arial, sans-serif">
                SUS
              </text>
              <g transform="translate(100, 10)">
                <rect x="20" y="0" width="20" height="60" fill="white"/>
                <rect x="0" y="20" width="60" height="20" fill="white"/>
              </g>
              <text x="180" y="25" fill="white" fontSize="12" fontWeight="normal" fontFamily="Arial, sans-serif">
                Sistema
              </text>
              <text x="180" y="40" fill="white" fontSize="12" fontWeight="normal" fontFamily="Arial, sans-serif">
                Único
              </text>
              <text x="180" y="55" fill="white" fontSize="12" fontWeight="normal" fontFamily="Arial, sans-serif">
                de Saúde
              </text>
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-white text-center">
            Login Médico
          </h1>
          <p className="text-blue-100 text-center mt-2">
            Acesse a plataforma médica
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          {errors.general && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-600 text-sm">{errors.general}</p>
            </div>
          )}

          {/* Email or CRM */}
          <div>
            <label htmlFor="emailOrCrm" className="block text-sm font-medium text-gray-700 mb-2">
              Email ou CRM
            </label>
            <input
              type="text"
              id="emailOrCrm"
              name="emailOrCrm"
              value={formData.emailOrCrm}
              onChange={handleInputChange}
              className={`w-full px-4 py-3 border rounded-lg text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                errors.emailOrCrm ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Digite seu email ou CRM"
            />
            {errors.emailOrCrm && <p className="text-red-500 text-sm mt-1">{errors.emailOrCrm}</p>}
          </div>

          {/* Password */}
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
              Senha
            </label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              className={`w-full px-4 py-3 border rounded-lg text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                errors.password ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Digite sua senha"
            />
            {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password}</p>}
          </div>

          {/* Remember Me */}
          <div className="flex items-center">
            <input
              type="checkbox"
              id="remember"
              name="remember"
              checked={formData.remember}
              onChange={handleInputChange}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="remember" className="ml-2 text-sm text-gray-600">
              Lembrar de mim
            </label>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className={`w-full px-6 py-3 rounded-lg font-semibold transition-all duration-300 ${
              isSubmitting
                ? 'bg-gray-400 text-white cursor-not-allowed'
                : 'bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white hover:-translate-y-0.5 hover:shadow-lg'
            }`}
          >
            {isSubmitting ? (
              <div className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Entrando...
              </div>
            ) : (
              'Entrar'
            )}
          </button>

          {/* Links */}
          <div className="text-center space-y-2">
            <Link
              href="/cadastro-medico"
              className="text-blue-600 hover:text-blue-700 font-medium transition-colors duration-200"
            >
              Não tem conta? Cadastre-se
            </Link>
            <br />
            <Link
              href="/"
              className="text-gray-600 hover:text-blue-600 font-medium transition-colors duration-200"
            >
              Voltar ao início
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
} 