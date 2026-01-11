import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Button, Input } from '../common/FormElements';
import { FileText, Eye, EyeOff, AlertCircle } from 'lucide-react';

const LoginPage = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const result = await login(username, password);
    
    if (result.success) {
      navigate('/dashboard');
    } else {
      setError(result.message);
    }
    
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex">
      {/* Left side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-industrial-900 p-12 flex-col justify-between relative overflow-hidden">
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }} />
        </div>
        
        <div className="relative">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-primary-600 rounded-xl flex items-center justify-center">
              <FileText className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">QuotePro</h1>
              <p className="text-industrial-400 text-sm">Manufacturing Excellence</p>
            </div>
          </div>
        </div>

        <div className="relative space-y-8">
          <div>
            <h2 className="text-4xl font-bold text-white leading-tight">
              Streamline Your<br />
              <span className="text-primary-400">Quotation Process</span>
            </h2>
            <p className="mt-4 text-industrial-300 text-lg max-w-md">
              Professional quotation management for manufacturing and engineering businesses. 
              Accurate costing, seamless workflows, and complete visibility.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {[
              { label: 'Multi-part quotations', value: '✓' },
              { label: 'Machine costing', value: '✓' },
              { label: 'Approval workflows', value: '✓' },
              { label: 'Real-time calculations', value: '✓' },
            ].map((feature, index) => (
              <div key={index} className="flex items-center gap-2 text-industrial-300">
                <span className="text-primary-400 font-bold">{feature.value}</span>
                <span className="text-sm">{feature.label}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="relative text-industrial-500 text-sm">
          © 2024 QuotePro. Built for manufacturing excellence.
        </div>
      </div>

      {/* Right side - Login form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-industrial-50">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center justify-center gap-3 mb-8">
            <div className="w-12 h-12 bg-primary-600 rounded-xl flex items-center justify-center">
              <FileText className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-industrial-900">QuotePro</h1>
              <p className="text-industrial-500 text-sm">Management System</p>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-xl p-8 border border-industrial-200">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-industrial-900">Welcome back</h2>
              <p className="text-industrial-500 mt-2">Sign in to your account to continue</p>
            </div>

            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3">
                <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <Input
                label="Username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter your username"
                required
                autoFocus
              />

              <div className="space-y-1">
                <label className="label">Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    required
                    className="input pr-12"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-industrial-400 hover:text-industrial-600"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                loading={loading}
                className="w-full"
                size="lg"
              >
                Sign In
              </Button>
            </form>

            <div className="mt-8 pt-6 border-t border-industrial-200">
              <p className="text-center text-sm text-industrial-500">
                Demo credentials:
              </p>
              <div className="mt-2 grid grid-cols-2 gap-2 text-xs">
                <div className="bg-industrial-50 p-2 rounded-lg">
                  <span className="text-industrial-400">Admin:</span>
                  <span className="ml-1 text-industrial-700 font-mono">admin / admin123</span>
                </div>
                <div className="bg-industrial-50 p-2 rounded-lg">
                  <span className="text-industrial-400">Sales:</span>
                  <span className="ml-1 text-industrial-700 font-mono">john.sales / password123</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
