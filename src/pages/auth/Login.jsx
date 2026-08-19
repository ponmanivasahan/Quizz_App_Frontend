import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authApi } from '../../api/authApi';
import { AuthContext } from '../../context/AuthContext';
import { Eye, EyeOff, BookOpen, Mail, Lock, Check } from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);



    try {
      const response = await authApi.login({ email, password });
      login(response.token, response.user);
      
      if (response.user.role === 'admin') {
        navigate('/admin/dashboard');
      } else {
        navigate('/student/dashboard');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Incorrect email or password.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-white overflow-hidden font-sans">
      
      {/* Left Section - Educational Visual */}
      <div className="flex w-full lg:w-1/2 relative bg-[#0a192f] flex-col overflow-hidden animate-fade-in lg:min-h-screen">
        {/* Subtle Background Gradients & Patterns */}
        <div className="absolute top-[-20%] left-[-10%] w-[70%] h-[70%] rounded-full bg-blue-600/10 blur-[120px] pointer-events-none"></div>
        <div className="absolute bottom-[-10%] right-[-20%] w-[80%] h-[80%] rounded-full bg-indigo-500/10 blur-[150px] pointer-events-none"></div>
        
        {/* Subtle Dotted Pattern */}
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(#ffffff 1px, transparent 1px)', backgroundSize: '30px 30px' }}></div>

        {/* Content Area */}
        <div className="relative z-10 px-8 lg:px-16 pt-12 lg:pt-24 pb-8 lg:pb-0 animate-slide-up text-center lg:text-left">
          <h1 className="text-3xl sm:text-4xl lg:text-[3.5rem] font-bold tracking-tight text-white leading-[1.2] lg:leading-[1.1] mb-2">
            Test Your Knowledge,<br className="hidden lg:block" />
            <span className="text-blue-500">Shape Your Future.</span>
          </h1>
          <p className="text-sm lg:text-lg text-blue-100/70 font-medium max-w-md mx-auto lg:mx-0 mt-4 lg:mt-6 leading-relaxed hidden sm:block">
            Join thousands of learners and take your skills to the next level with our quizzes.
          </p>
        </div>

        {/* Educational Illustration Area (Lower Half) - Hidden on smallest mobile, visible on sm+ */}
        <div className="relative z-10 flex-grow hidden sm:flex items-end justify-center pb-12 px-8 lg:px-12 animate-fade-in stagger-2">
          {/* AI Generated Educational Laptop Image */}
          <div className="w-full max-w-xl relative transform lg:translate-y-4">
            <img 
              src="/login-illustration.jpg" 
              alt="Digital Knowledge Assessment Laptop" 
              className="w-full h-auto object-contain drop-shadow-[0_20px_50px_rgba(0,0,0,0.5)] scale-110 sm:scale-100"
            />
          </div>
        </div>
      </div>

      {/* Right Section - Login Form */}
      <div className="w-full lg:w-1/2 flex-1 flex justify-center items-center p-4 sm:p-8 lg:p-12 bg-gray-50/50 lg:bg-white relative z-20">
        
        <div className="w-full max-w-[440px] animate-slide-in-right stagger-1">
          
          <div className="mb-6 lg:mb-10 text-center">
            <div className="inline-flex justify-center mb-4 lg:mb-6">
              <div className="bg-blue-50 p-3.5 rounded-2xl">
                <BookOpen className="w-8 h-8 text-blue-600" />
              </div>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2 tracking-tight">Welcome Back!</h2>
            <p className="text-gray-500 font-medium text-sm">Login to continue your learning journey</p>
          </div>

          <div className="bg-white p-6 sm:p-8 lg:p-10 rounded-[2rem] shadow-[0_8px_40px_rgb(0,0,0,0.04)] border border-gray-100">
            <form onSubmit={handleSubmit} className="space-y-5">
              {error && (
                <div className="bg-red-50/80 border border-red-100 p-3.5 rounded-xl flex items-center gap-2 animate-zoom-in text-sm text-red-700 font-medium">
                  <div className="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0"></div>
                  {error}
                </div>
              )}

              <div className="space-y-1.5 animate-slide-up stagger-2">
                <label className="block text-sm font-bold text-gray-700" htmlFor="email">
                  Email or Username
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                  </div>
                  <input
                    id="email"
                    type="email"
                    className="w-full pl-11 pr-4 py-3.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all duration-200 text-gray-900 bg-white placeholder-gray-400 font-medium"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="space-y-1.5 animate-slide-up stagger-3">
                <label className="block text-sm font-bold text-gray-700" htmlFor="password">
                  Password
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                  </div>
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    className="w-full pl-11 pr-12 py-3.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all duration-200 text-gray-900 bg-white placeholder-gray-400 font-medium"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600 transition-colors focus:outline-none"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2 pb-2 animate-slide-up stagger-4">
                <label className="flex items-center gap-2 cursor-pointer group">
                  <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${rememberMe ? 'bg-blue-600 border-blue-600' : 'bg-white border-gray-300 group-hover:border-blue-400'}`}>
                    {rememberMe && <Check className="w-3.5 h-3.5 text-white" />}
                  </div>
                  <input 
                    type="checkbox" 
                    className="hidden" 
                    checked={rememberMe}
                    onChange={() => setRememberMe(!rememberMe)}
                  />
                  <span className="text-sm font-semibold text-gray-600 select-none">Remember me</span>
                </label>
                <a href="#" className="text-sm font-bold text-blue-600 hover:text-blue-700 transition-colors">
                  Forgot Password?
                </a>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-blue-600 text-white font-bold py-4 px-4 rounded-xl hover:bg-blue-700 hover:shadow-lg hover:shadow-blue-600/20 focus:outline-none focus:ring-4 focus:ring-blue-500/20 transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed active:scale-[0.98] mt-2 animate-slide-up stagger-4 flex justify-center items-center"
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    <span>Signing in...</span>
                  </div>
                ) : (
                  <span>Login</span>
                )}
              </button>
            </form>
          </div>

          <div className="mt-8 text-center animate-fade-in stagger-4">
            <p className="text-sm text-gray-500 font-semibold">
              Don't have an account?{' '}
              <Link to="/register" className="font-bold text-blue-600 hover:text-blue-700 transition-colors">
                Sign up
              </Link>
            </p>
          </div>
          
        </div>
      </div>
    </div>
  );
};

export default Login;
