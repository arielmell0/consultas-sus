'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { useLocalStorage } from '@/hooks/useLocalStorage';

interface FormData {
  email: string;
  password: string;
  cpf: string;
  phone: string;
}

export default function CadastroPage() {
  const [formData, setFormData] = useState<FormData>({
    email: '',
    password: '',
    cpf: '',
    phone: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Partial<FormData>>({});
  const router = useRouter();
  const { saveUser, userExists } = useLocalStorage();

  // Format CPF input
  const formatCPF = (value: string): string => {
    const numbers = value.replace(/\D/g, '');
    return numbers
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d{1,2})/, '$1-$2')
      .replace(/(-\d{2})\d+?$/, '$1');
  };

  // Format phone input
  const formatPhone = (value: string): string => {
    const numbers = value.replace(/\D/g, '');
    return numbers
      .replace(/(\d{2})(\d)/, '($1) $2')
      .replace(/(\d{5})(\d)/, '$1-$2')
      .replace(/(-\d{4})\d+?$/, '$1');
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
  const handleInputChange = (field: keyof FormData, value: string) => {
    let formattedValue = value;
    
    if (field === 'cpf') {
      formattedValue = formatCPF(value);
    } else if (field === 'phone') {
      formattedValue = formatPhone(value);
    }
    
    setFormData(prev => ({ ...prev, [field]: formattedValue }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  // Validate form
  const validateForm = (): boolean => {
    const newErrors: Partial<FormData> = {};

    if (!formData.email) {
      newErrors.email = 'Email é obrigatório';
    } else if (!isValidEmail(formData.email)) {
      newErrors.email = 'Email inválido';
    }

    if (!formData.password) {
      newErrors.password = 'Senha é obrigatória';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Senha deve ter pelo menos 6 caracteres';
    }

    if (!formData.cpf) {
      newErrors.cpf = 'CPF é obrigatório';
    } else if (!isValidCPF(formData.cpf)) {
      newErrors.cpf = 'CPF inválido';
    }

    if (!formData.phone) {
      newErrors.phone = 'Telefone é obrigatório';
    } else if (formData.phone.replace(/\D/g, '').length < 10) {
      newErrors.phone = 'Telefone inválido';
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
      // Check if user already exists
      if (userExists(formData.email, formData.cpf)) {
        setErrors({
          email: 'Email ou CPF já cadastrado',
          cpf: 'Email ou CPF já cadastrado'
        });
        return;
      }
      
      // Save user
      const success = saveUser({
        email: formData.email,
        password: formData.password,
        cpf: formData.cpf.replace(/\D/g, ''),
        phone: formData.phone
      });
      
      if (success) {
        alert('Usuário cadastrado com sucesso!');
        router.push('/login');
      } else {
        alert('Erro ao cadastrar usuário. Tente novamente.');
      }
    } catch (error) {
      console.error('Error during registration:', error);
      alert('Erro inesperado. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-10">
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
            Cadastro de Usuário
          </h1>
          <p className="text-gray-600">
            Preencha os dados abaixo para criar sua conta
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Email */}
          <div>
            <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2 uppercase tracking-wide">
              Email
            </label>
            <input
              type="email"
              id="email"
              placeholder="Insira seu email"
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

          {/* CPF */}
          <div>
            <label htmlFor="cpf" className="block text-sm font-semibold text-gray-700 mb-2 uppercase tracking-wide">
              CPF
            </label>
            <input
              type="text"
              id="cpf"
              placeholder="Insira seu CPF"
              maxLength={14}
              className={`w-full px-4 py-4 border-2 rounded-lg text-base text-gray-900 transition-all duration-300 bg-gray-50 focus:bg-white focus:outline-none ${
                errors.cpf 
                  ? 'border-red-500 focus:border-red-500 focus:ring-red-100' 
                  : 'border-gray-200 focus:border-blue-600 focus:ring-blue-100'
              } focus:ring-4`}
              value={formData.cpf}
              onChange={(e) => handleInputChange('cpf', e.target.value)}
            />
            {errors.cpf && (
              <p className="mt-2 text-sm text-red-600">{errors.cpf}</p>
            )}
          </div>

          {/* Phone */}
          <div>
            <label htmlFor="phone" className="block text-sm font-semibold text-gray-700 mb-2 uppercase tracking-wide">
              Telefone
            </label>
            <input
              type="tel"
              id="phone"
              placeholder="Insira seu número de telefone"
              className={`w-full px-4 py-4 border-2 rounded-lg text-base text-gray-900 transition-all duration-300 bg-gray-50 focus:bg-white focus:outline-none ${
                errors.phone 
                  ? 'border-red-500 focus:border-red-500 focus:ring-red-100' 
                  : 'border-gray-200 focus:border-blue-600 focus:ring-blue-100'
              } focus:ring-4`}
              value={formData.phone}
              onChange={(e) => handleInputChange('phone', e.target.value)}
            />
            {errors.phone && (
              <p className="mt-2 text-sm text-red-600">{errors.phone}</p>
            )}
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
                  Cadastrando...
                </>
              ) : (
                <span>Cadastrar</span>
              )}
            </div>
          </button>
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