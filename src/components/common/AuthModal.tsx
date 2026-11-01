import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { X, Lock, Mail, User, GraduationCap, ArrowRight } from 'lucide-react';
import { RoleBadge } from './RoleBadge';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const { login, register, resetPassword, quickSwitchUser } = useAuth();
  const [mode, setMode] = useState<'LOGIN' | 'REGISTER' | 'RESET'>('LOGIN');

  // Login form state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Register form state
  const [fullName, setFullName] = useState('');
  const [rollNumber, setRollNumber] = useState('');
  const [department, setDepartment] = useState('Computer Science & Engineering');
  const [year, setYear] = useState(1);

  // Status & error state
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      if (mode === 'LOGIN') {
        const ok = await login(email, password);
        if (ok) {
          onClose();
        } else {
          setError('Invalid email or password. You can also pick a demo persona below.');
        }
      } else if (mode === 'REGISTER') {
        if (!email || !password || !fullName) {
          setError('Please provide your name, college email, and password.');
          setLoading(false);
          return;
        }
        const ok = await register({
          email,
          password,
          fullName,
          rollNumber,
          department,
          year,
        });
        if (ok) {
          setSuccess('Account created! Welcome to Apex Clubs Hub.');
          setTimeout(() => onClose(), 600);
        } else {
          setError('Failed to create account. Email may already be in use.');
        }
      } else if (mode === 'RESET') {
        const ok = await resetPassword(email, password || 'password123');
        if (ok) {
          setSuccess('Password updated successfully! You can now sign in.');
          setMode('LOGIN');
        } else {
          setError('Could not reset password. Please check the email entered.');
        }
      }
    } catch {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = (role: string) => {
    quickSwitchUser(role);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg rounded-2xl border border-white/20 bg-zinc-950 shadow-2xl p-6 sm:p-8 text-white max-h-[95vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-900 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Title */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2.5 h-2.5 rounded-full bg-white ring-4 ring-white/20" />
            <h2 className="text-xl font-bold text-white">
              {mode === 'LOGIN' && 'Sign in to Clubs Hub'}
              {mode === 'REGISTER' && 'Create Student Membership'}
              {mode === 'RESET' && 'Reset Account Password'}
            </h2>
          </div>
          <p className="text-xs text-zinc-400">
            {mode === 'LOGIN'
              ? 'Access private club rooms, member rosters, and event registrations.'
              : mode === 'REGISTER'
              ? 'Join official clubs: Code Crackers, Innovation, Devspire, Sports, Sankalpa, and Cultural.'
              : 'Enter your collegiate @apex.edu email address.'}
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-zinc-900 border border-white/30 text-xs text-white">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-4 p-3 rounded-xl bg-white text-black font-semibold text-xs shadow-md">
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {mode === 'REGISTER' && (
            <>
              <div>
                <label className="block text-zinc-300 font-medium mb-1">Full Name</label>
                <div className="relative">
                  <User className="w-4 h-4 text-zinc-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    required
                    placeholder="Rahul Verma"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 rounded-xl border border-white/15 bg-zinc-900 text-white placeholder-zinc-500 focus:outline-none focus:border-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-zinc-300 font-medium mb-1">Roll / ID Number</label>
                  <input
                    type="text"
                    placeholder="2026CSB1090"
                    value={rollNumber}
                    onChange={(e) => setRollNumber(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-white/15 bg-zinc-900 text-white placeholder-zinc-500 focus:outline-none focus:border-white"
                  />
                </div>

                <div>
                  <label className="block text-zinc-300 font-medium mb-1">Academic Year</label>
                  <select
                    value={year}
                    onChange={(e) => setYear(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-white/15 bg-zinc-900 text-white focus:outline-none focus:border-white"
                  >
                    <option value={1}>1st Year</option>
                    <option value={2}>2nd Year</option>
                    <option value={3}>3rd Year</option>
                    <option value={4}>4th Year</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-zinc-300 font-medium mb-1">Department</label>
                <div className="relative">
                  <GraduationCap className="w-4 h-4 text-zinc-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    placeholder="Computer Science, Robotics, etc."
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 rounded-xl border border-white/15 bg-zinc-900 text-white placeholder-zinc-500 focus:outline-none focus:border-white"
                  />
                </div>
              </div>
            </>
          )}

          <div>
            <label className="block text-zinc-300 font-medium mb-1">College Email</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-zinc-400 absolute left-3 top-3" />
              <input
                type="email"
                required
                placeholder="student@apex.edu"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-9 pr-3 py-2 rounded-xl border border-white/15 bg-zinc-900 text-white placeholder-zinc-500 focus:outline-none focus:border-white"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-zinc-300 font-medium">Password</label>
              {mode === 'LOGIN' && (
                <button
                  type="button"
                  onClick={() => setMode('RESET')}
                  className="text-[11px] text-zinc-400 hover:text-white underline"
                >
                  Forgot password?
                </button>
              )}
            </div>
            <div className="relative">
              <Lock className="w-4 h-4 text-zinc-400 absolute left-3 top-3" />
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-9 pr-3 py-2 rounded-xl border border-white/15 bg-zinc-900 text-white placeholder-zinc-500 focus:outline-none focus:border-white"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 font-bold rounded-xl text-black bg-white hover:bg-zinc-200 transition-all flex items-center justify-center gap-1.5 shadow-md"
          >
            {loading ? (
              <span>Please wait...</span>
            ) : mode === 'LOGIN' ? (
              <>
                <span>Sign In</span>
                <ArrowRight className="w-4 h-4" />
              </>
            ) : mode === 'REGISTER' ? (
              <span>Create Account</span>
            ) : (
              <span>Reset Password</span>
            )}
          </button>
        </form>

        <div className="mt-4 pt-4 border-t border-white/10 text-center text-xs text-zinc-400">
          {mode === 'LOGIN' ? (
            <>
              Don't have an account?{' '}
              <button
                onClick={() => {
                  setMode('REGISTER');
                  setError('');
                }}
                className="text-white font-bold hover:underline"
              >
                Sign up
              </button>
            </>
          ) : (
            <>
              Already have an account?{' '}
              <button
                onClick={() => {
                  setMode('LOGIN');
                  setError('');
                }}
                className="text-white font-bold hover:underline"
              >
                Sign in
              </button>
            </>
          )}
        </div>

        {/* 1-Click Fast Persona testing */}
        <div className="mt-6 pt-4 border-t border-white/10">
          <div className="text-[10px] font-mono uppercase tracking-wider text-zinc-400 mb-2">
            1-Click Demo Login
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <button
              onClick={() => handleQuickLogin('HOD')}
              className="p-2 rounded-xl border border-white/10 bg-zinc-900 hover:border-white/30 text-left transition-colors"
            >
              <div className="font-semibold text-white truncate">HOD Admin</div>
              <div className="text-[10px] text-zinc-400">Dr. Rajesh</div>
            </button>
            <button
              onClick={() => handleQuickLogin('PRESIDENT')}
              className="p-2 rounded-xl border border-white/10 bg-zinc-900 hover:border-white/30 text-left transition-colors"
            >
              <div className="font-semibold text-white truncate">Code Crackers</div>
              <div className="text-[10px] text-zinc-400">Aryan Sharma</div>
            </button>
            <button
              onClick={() => handleQuickLogin('PRESIDENT_DEV')}
              className="p-2 rounded-xl border border-white/10 bg-zinc-900 hover:border-white/30 text-left transition-colors"
            >
              <div className="font-semibold text-white truncate">Innovation</div>
              <div className="text-[10px] text-zinc-400">Marcus Vance</div>
            </button>
            <button
              onClick={() => handleQuickLogin('MEMBER')}
              className="p-2 rounded-xl border border-white/10 bg-zinc-900 hover:border-white/30 text-left transition-colors"
            >
              <div className="font-semibold text-white truncate">Student Member</div>
              <div className="text-[10px] text-zinc-400">Rahul Verma</div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
