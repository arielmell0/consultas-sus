'use client';

import { useState, useEffect, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useLocalStorage } from '@/hooks/useLocalStorage';

interface LoginFormData {
  email: string;
  password: string;
  remember: boolean;
}

export default function LoginPage() {
  const [formData, setFormData] = useState<LoginFormData>({
    email: '',
    password: '',
    remember: false
  });
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Partial<LoginFormData>>({});
  const [showExpiredMessage, setShowExpiredMessage] = useState(false);
  const router = useRouter();
  const { authenticateUser, getSavedCredentials, isSessionExpired } = useLocalStorage();

  // Check for saved credentials and session status on mount
  useEffect(() => {
    const savedCredentials = getSavedCredentials();
    const sessionExpired = isSessionExpired();
    
    if (savedCredentials) {
      // Auto-fill credentials
      setFormData(prev => ({
        ...prev,
        email: savedCredentials.emailOrCpf,
        password: savedCredentials.password,
        remember: true // Set remember me as true since these are saved credentials
      }));
      
      // Show expired message if session was expired
      if (sessionExpired) {
        setShowExpiredMessage(true);
        setTimeout(() => setShowExpiredMessage(false), 5000); // Hide after 5 seconds
      }
    }
  }, []); // Empty dependency array to run only on mount

  // Format CPF input
  const formatCPF = (value: string): string => {
    const numbers = value.replace(/\D/g, '');
    return numbers
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d{1,2})/, '$1-$2')
      .replace(/(-\d{2})\d+?$/, '$1');
  };

  // Validate CPF
  const isValidCPF = (cpf: string): boolean => {
    const numbers = cpf.replace(/\D/g, '');
    if (numbers.length !== 11) return false;
    
    // Check for repeated numbers
    if (/^(\d)\1{10}$/.test(numbers)) return false;
    
    // Validate CPF algorithm
    let sum = 0;
    for (let i = 0; i < 9; i++) {
      sum += parseInt(numbers.charAt(i)) * (10 - i);
    }
    let remainder = (sum * 10) % 11;
    if (remainder === 10 || remainder === 11) remainder = 0;
    if (remainder !== parseInt(numbers.charAt(9))) return false;
    
    sum = 0;
    for (let i = 0; i < 10; i++) {
      sum += parseInt(numbers.charAt(i)) * (11 - i);
    }
    remainder = (sum * 10) % 11;
    if (remainder === 10 || remainder === 11) remainder = 0;
    if (remainder !== parseInt(numbers.charAt(10))) return false;
    
    return true;
  };

  // Validate email
  const isValidEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // Handle input changes
  const handleInputChange = (field: keyof LoginFormData, value: string | boolean) => {
    let formattedValue = value;
    
    // Auto-format CPF if detected
    if (field === 'email' && typeof value === 'string') {
      const numbers = value.replace(/\D/g, '');
      // If it looks like CPF (only numbers and more than 3 digits)
      if (numbers.length > 3 && numbers.length <= 11 && !/[@.]/.test(value)) {
        formattedValue = formatCPF(value);
      }
    }
    
    setFormData(prev => ({ ...prev, [field]: formattedValue }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
    
    // Hide expired message when user starts typing
    if (showExpiredMessage && field === 'email') {
      setShowExpiredMessage(false);
    }
  };

  // Validate form
  const validateForm = (): boolean => {
    const newErrors: Partial<LoginFormData> = {};

    if (!formData.email) {
      newErrors.email = 'Email ou CPF é obrigatório';
    } else {
      const isCPF = /^\d{3}\.\d{3}\.\d{3}-\d{2}$/.test(formData.email);
      const isEmail = isValidEmail(formData.email);
      
      if (!isCPF && !isEmail) {
        newErrors.email = 'Insira um email válido ou CPF no formato xxx.xxx.xxx-xx';
      } else if (isCPF && !isValidCPF(formData.email)) {
        newErrors.email = 'CPF inválido';
      }
    }

    if (!formData.password) {
      newErrors.password = 'Senha é obrigatória';
    } else if (formData.password.length < 6) {
      newErrors.password = 'A senha deve ter pelo menos 6 caracteres';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsLoading(true);
    
    try {
      // Simulate API call delay for better UX
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Try to authenticate user with remember me preference
      const user = authenticateUser(formData.email, formData.password, formData.remember);
      
      if (user) {
        alert(`Login realizado com sucesso!\n\nBem-vindo(a), ${user.email}!`);
        router.push('/dashboard'); // Redirect to dashboard
      } else {
        setErrors({
          email: 'Email/CPF ou senha incorretos',
          password: 'Email/CPF ou senha incorretos'
        });
      }
    } catch (error) {
      console.error('Error during login:', error);
      alert('Erro inesperado. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = () => {
    alert('Funcionalidade de recuperação de senha será implementada em breve.');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-10">
        {/* Expired Session Message */}
        {showExpiredMessage && (
          <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-lg">
            <div className="flex items-center">
              <svg className="w-5 h-5 text-amber-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.464 0L4.35 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
              <div>
                <h4 className="text-amber-800 font-medium text-sm">Sessão Expirada</h4>
                <p className="text-amber-700 text-xs mt-1">
                  Sua sessão expirou. Suas credenciais foram preenchidas automaticamente.
                </p>
              </div>
            </div>
          </div>
        )}

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
            Acesso ao Sistema
          </h1>
          <p className="text-gray-600">
            Entre com suas credenciais para acessar sua conta
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Email/CPF */}
          <div>
            <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2 uppercase tracking-wide">
              Email ou CPF
            </label>
            <input
              type="text"
              id="email"
              placeholder="Insira seu email ou CPF"
              className={`w-full px-4 py-4 border-2 rounded-lg text-base text-gray-900 transition-all duration-300 bg-gray-50 focus:bg-white focus:outline-none ${
                errors.email 
                  ? 'border-red-500 focus:border-red-500 focus:ring-red-100' 
                  : 'border-gray-200 focus:border-blue-600 focus:ring-blue-100'
              } focus:ring-4`}
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
            />
            {errors.email && (
              <p className="mt-2 text-sm text-red-600">{errors.email}</p>
            )}
          </div>

          {/* Password */}
          <div>
            <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-2 uppercase tracking-wide">
              Senha
            </label>
            <input
              type="password"
              id="password"
              placeholder="Insira sua senha"
              className={`w-full px-4 py-4 border-2 rounded-lg text-base text-gray-900 transition-all duration-300 bg-gray-50 focus:bg-white focus:outline-none ${
                errors.password 
                  ? 'border-red-500 focus:border-red-500 focus:ring-red-100' 
                  : 'border-gray-200 focus:border-blue-600 focus:ring-blue-100'
              } focus:ring-4`}
              value={formData.password}
              onChange={(e) => handleInputChange('password', e.target.value)}
            />
            {errors.password && (
              <p className="mt-2 text-sm text-red-600">{errors.password}</p>
            )}
          </div>

          {/* Form Options */}
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="remember"
                className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                checked={formData.remember}
                onChange={(e) => handleInputChange('remember', e.target.checked)}
              />
              <label htmlFor="remember" className="ml-2 text-sm text-gray-600">
                Lembrar de mim
              </label>
            </div>
            <button
              type="button"
              onClick={handleForgotPassword}
              className="text-sm text-blue-600 hover:text-blue-800 hover:underline font-medium transition-colors duration-200"
            >
              Esqueci minha senha
            </button>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-4 px-6 rounded-lg text-white font-semibold text-base uppercase tracking-wide transition-all duration-300 bg-gradient-to-r from-blue-700 to-blue-600 hover:from-blue-800 hover:to-blue-700 hover:-translate-y-0.5 hover:shadow-lg active:translate-y-0 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
          >
            <div className="flex items-center justify-center">
              {isLoading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Entrando...
                </>
              ) : (
                <span>Entrar</span>
              )}
            </div>
          </button>

          {/* Divider */}
          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-white text-gray-600">ou</span>
            </div>
          </div>

          {/* Register Link */}
          <div className="text-center">
            <p className="text-gray-600">
              Não tem uma conta?{' '}
              <Link 
                href="/cadastro"
                className="text-blue-600 hover:text-blue-800 hover:underline font-semibold transition-colors duration-200"
              >
                Cadastre-se aqui
              </Link>
            </p>
          </div>
        </form>

        {/* Footer */}
        <div className="text-center mt-8 pt-6 border-t border-gray-200">
          <p className="text-gray-500 text-sm">
            © 2025 Sistema Único de Saúde - Ministério da Saúde
          </p>
        </div>
      </div>
    </div>
  );
} 