import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { SEED_USERS } from '../data/seedData';
import { GlassCard } from '../components/common/GlassCard';
import { RoleBadge } from '../components/common/RoleBadge';
import {
  Lock,
  Mail,
  User,
  GraduationCap,
  ArrowRight,
  ShieldCheck,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  KeyRound,
  Check,
} from 'lucide-react';

interface AuthPageProps {
  onNavigate: (tab: string, slug?: string) => void;
  initialMode?: 'LOGIN' | 'REGISTER' | 'RESET';
}

export const AuthPage: React.FC<AuthPageProps> = ({
  onNavigate,
  initialMode = 'LOGIN',
}) => {
  const { user, login, register, resetPassword, quickSwitchUser } = useAuth();
  const [mode, setMode] = useState<'LOGIN' | 'REGISTER' | 'RESET'>(initialMode);

  // Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  // Registration specific fields
  const [fullName, setFullName] = useState('');
  const [rollNumber, setRollNumber] = useState('');
  const [department, setDepartment] = useState('Computer Science & Engineering');
  const [year, setYear] = useState(1);
  const [selectedInterests, setSelectedInterests] = useState<string[]>(['Code Crackers', 'Devspire']);

  // Feedback states
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const clubOptions = [
    'Code Crackers',
    'Innovation',
    'Devspire',
    'Sports',
    'Social responsibility sankalpa',
    'Cultural',
  ];

  const handleInterestToggle = (clubName: string) => {
    setSelectedInterests((prev) =>
      prev.includes(clubName) ? prev.filter((c) => c !== clubName) : [...prev, clubName]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      if (mode === 'LOGIN') {
        const ok = await login(email, password);
        if (ok) {
          setSuccess('Signed in successfully! Redirecting...');
          setTimeout(() => onNavigate('home'), 500);
        } else {
          setError('Invalid email or password. You can also pick any persona from the instant login list below.');
        }
      } else if (mode === 'REGISTER') {
        if (!email || !password || !fullName) {
          setError('Please provide your full name, college email, and password.');
          setLoading(false);
          return;
        }
        if (password !== confirmPassword) {
          setError('Passwords do not match. Please re-enter carefully.');
          setLoading(false);
          return;
        }
        if (password.length < 6) {
          setError('Password should be at least 6 characters long.');
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
          setTimeout(() => onNavigate('home'), 600);
        } else {
          setError('Could not create account. An account with this email may already exist.');
        }
      } else if (mode === 'RESET') {
        if (!email) {
          setError('Please enter your college email address.');
          setLoading(false);
          return;
        }
        const ok = await resetPassword(email, password || 'password123');
        if (ok) {
          setSuccess('Password updated successfully! You can now sign in.');
          setMode('LOGIN');
          setPassword('');
        } else {
          setError('Could not reset password. Please check the email address provided.');
        }
      }
    } catch {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handlePersonaClick = (preset: string, redirectTab = 'home') => {
    quickSwitchUser(preset);
    setSuccess('Signed in! Redirecting...');
    setTimeout(() => onNavigate(redirectTab), 400);
  };

  return (
    <div className="py-6 sm:py-10 max-w-5xl mx-auto space-y-12">
      {/* Top Header */}
      <div className="text-center space-y-3 max-w-2xl mx-auto">
        <div className="inline-flex items-center gap-2 text-xs font-mono font-medium text-white bg-white/5 border border-white/20 px-3.5 py-1 rounded-full">
          <Sparkles className="w-3.5 h-3.5 text-zinc-300" />
          <span>Apex College Clubs Authentication Portal</span>
        </div>

        <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white">
          {mode === 'LOGIN' && 'Sign in to your student account'}
          {mode === 'REGISTER' && 'Create your collegiate membership'}
          {mode === 'RESET' && 'Reset your account password'}
        </h1>

        <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">
          {mode === 'LOGIN' &&
            'Access private club chats, RSVP for hackathons, review club activities, and participate in campus leadership.'}
          {mode === 'REGISTER' &&
            'Join any of our 6 official guilds: Code Crackers, Innovation, Devspire, Sports, Sankalpa, and Cultural.'}
          {mode === 'RESET' &&
            'Enter your registered @apex.edu institutional email address to set a new password.'}
        </p>
      </div>

      {/* Main Authentication Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Form Card */}
        <div className="lg:col-span-7">
          <GlassCard className="p-6 sm:p-8 space-y-6">
            {/* Segmented Mode Switcher */}
            <div className="flex items-center gap-1 p-1 bg-zinc-900 rounded-xl border border-white/10 text-xs">
              <button
                type="button"
                onClick={() => {
                  setMode('LOGIN');
                  setError('');
                  setSuccess('');
                }}
                className={`flex-1 py-2 font-bold rounded-lg transition-all text-center ${
                  mode === 'LOGIN'
                    ? 'bg-white text-black shadow-md'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => {
                  setMode('REGISTER');
                  setError('');
                  setSuccess('');
                }}
                className={`flex-1 py-2 font-bold rounded-lg transition-all text-center ${
                  mode === 'REGISTER'
                    ? 'bg-white text-black shadow-md'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                Sign Up / Register
              </button>
            </div>

            {/* Error & Success Banners */}
            {error && (
              <div className="p-3.5 rounded-xl bg-zinc-900 border border-white/30 text-xs text-white flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-zinc-400" />
                <span className="leading-relaxed">{error}</span>
              </div>
            )}
            {success && (
              <div className="p-3.5 rounded-xl bg-white text-black text-xs font-semibold flex items-start gap-2.5 shadow-lg">
                <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-black" />
                <span className="leading-relaxed">{success}</span>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              {mode === 'REGISTER' && (
                <>
                  <div>
                    <label className="block text-zinc-300 font-medium mb-1">
                      Full Name
                    </label>
                    <div className="relative">
                      <User className="w-4 h-4 text-zinc-400 absolute left-3 top-3" />
                      <input
                        type="text"
                        required
                        placeholder="e.g. Rahul Verma"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-white/15 bg-zinc-900 text-white placeholder-zinc-500 focus:outline-none focus:border-white focus:ring-1 focus:ring-white"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-zinc-300 font-medium mb-1">
                        Student ID / Roll No.
                      </label>
                      <input
                        type="text"
                        placeholder="2026CSB1090"
                        value={rollNumber}
                        onChange={(e) => setRollNumber(e.target.value)}
                        className="w-full px-3 py-2.5 rounded-xl border border-white/15 bg-zinc-900 text-white placeholder-zinc-500 focus:outline-none focus:border-white focus:ring-1 focus:ring-white"
                      />
                    </div>

                    <div>
                      <label className="block text-zinc-300 font-medium mb-1">
                        Academic Year
                      </label>
                      <select
                        value={year}
                        onChange={(e) => setYear(Number(e.target.value))}
                        className="w-full px-3 py-2.5 rounded-xl border border-white/15 bg-zinc-900 text-white focus:outline-none focus:border-white focus:ring-1 focus:ring-white"
                      >
                        <option value={1}>1st Year (Freshman)</option>
                        <option value={2}>2nd Year (Sophomore)</option>
                        <option value={3}>3rd Year (Junior)</option>
                        <option value={4}>4th Year (Senior)</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-zinc-300 font-medium mb-1">
                      Department / Major
                    </label>
                    <div className="relative">
                      <GraduationCap className="w-4 h-4 text-zinc-400 absolute left-3 top-3" />
                      <input
                        type="text"
                        placeholder="Computer Science, Robotics, Humanities, etc."
                        value={department}
                        onChange={(e) => setDepartment(e.target.value)}
                        className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-white/15 bg-zinc-900 text-white placeholder-zinc-500 focus:outline-none focus:border-white focus:ring-1 focus:ring-white"
                      />
                    </div>
                  </div>
                </>
              )}

              <div>
                <label className="block text-zinc-300 font-medium mb-1">
                  College Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-zinc-400 absolute left-3 top-3" />
                  <input
                    type="email"
                    required
                    placeholder="student@apex.edu"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-white/15 bg-zinc-900 text-white placeholder-zinc-500 focus:outline-none focus:border-white focus:ring-1 focus:ring-white"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-zinc-300 font-medium">
                    {mode === 'RESET' ? 'New Password' : 'Password'}
                  </label>
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
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-9 pr-10 py-2.5 rounded-xl border border-white/15 bg-zinc-900 text-white placeholder-zinc-500 focus:outline-none focus:border-white focus:ring-1 focus:ring-white"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-zinc-400 hover:text-white"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {mode === 'REGISTER' && (
                <div>
                  <label className="block text-zinc-300 font-medium mb-1">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-zinc-400 absolute left-3 top-3" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      placeholder="••••••••"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-white/15 bg-zinc-900 text-white placeholder-zinc-500 focus:outline-none focus:border-white focus:ring-1 focus:ring-white"
                    />
                  </div>
                </div>
              )}

              {mode === 'REGISTER' && (
                <div>
                  <label className="block text-zinc-300 font-medium mb-1.5">
                    Clubs of Interest
                  </label>
                  <div className="flex flex-wrap gap-1.5">
                    {clubOptions.map((club) => {
                      const selected = selectedInterests.includes(club);
                      return (
                        <button
                          key={club}
                          type="button"
                          onClick={() => handleInterestToggle(club)}
                          className={`px-3 py-1.5 rounded-xl text-[11px] font-medium transition-all flex items-center gap-1.5 ${
                            selected
                              ? 'bg-white text-black font-semibold shadow-md'
                              : 'bg-zinc-900 text-zinc-400 border border-white/10 hover:border-white/30'
                          }`}
                        >
                          {selected && <Check className="w-3 h-3 text-black" />}
                          <span>{club}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {mode === 'LOGIN' && (
                <div className="flex items-center justify-between text-xs pt-1">
                  <label className="flex items-center gap-2 cursor-pointer text-zinc-400 hover:text-white">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="rounded border-zinc-700 bg-zinc-900 text-white focus:ring-white"
                    />
                    <span>Remember my session</span>
                  </label>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 text-xs sm:text-sm font-bold text-black bg-white hover:bg-zinc-200 rounded-xl transition-all shadow-xl hover:scale-102 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <span>Processing...</span>
                ) : mode === 'LOGIN' ? (
                  <>
                    <span>Sign In to Hub</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                ) : mode === 'REGISTER' ? (
                  <>
                    <span>Complete Registration</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                ) : (
                  <span>Set New Password</span>
                )}
              </button>
            </form>

            {/* Switch Mode Links */}
            <div className="pt-2 border-t border-white/10 text-center text-xs text-zinc-400">
              {mode === 'LOGIN' && (
                <>
                  New to Apex Clubs?{' '}
                  <button
                    onClick={() => {
                      setMode('REGISTER');
                      setError('');
                    }}
                    className="text-white font-bold hover:underline"
                  >
                    Create student membership
                  </button>
                </>
              )}
              {mode === 'REGISTER' && (
                <>
                  Already registered?{' '}
                  <button
                    onClick={() => {
                      setMode('LOGIN');
                      setError('');
                    }}
                    className="text-white font-bold hover:underline"
                  >
                    Sign in here
                  </button>
                </>
              )}
              {mode === 'RESET' && (
                <button
                  onClick={() => {
                    setMode('LOGIN');
                    setError('');
                  }}
                  className="text-white font-bold hover:underline"
                >
                  Back to Sign In
                </button>
              )}
            </div>
          </GlassCard>
        </div>

        {/* Right Column: Instant Demo Login Personas & Info */}
        <div className="lg:col-span-5 space-y-6">
          {/* Quick Demo Switcher */}
          <GlassCard className="p-6 space-y-4">
            <div className="flex items-center gap-2">
              <KeyRound className="w-4 h-4 text-white" />
              <h3 className="font-bold text-sm text-white">
                One-Click Demo Personas
              </h3>
            </div>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Explore different permissions instantly by clicking any role below:
            </p>

            <div className="space-y-2.5">
              {/* HOD */}
              <button
                type="button"
                onClick={() => handlePersonaClick('HOD', 'admin')}
                className="w-full p-3.5 rounded-xl border border-white/10 bg-zinc-900/80 hover:border-white/40 hover:bg-zinc-850 text-left transition-all flex items-center justify-between group"
              >
                <div className="flex items-center gap-3">
                  <img
                    src={SEED_USERS[0].avatarUrl}
                    alt="HOD"
                    className="w-9 h-9 rounded-full object-cover ring-2 ring-white/30"
                  />
                  <div>
                    <div className="font-bold text-xs text-white group-hover:text-zinc-200 transition-colors">
                      Prof. Dr. Rajesh Sundaram
                    </div>
                    <div className="text-[11px] text-zinc-400 font-mono">hod@apex.edu · Super Admin</div>
                  </div>
                </div>
                <RoleBadge role="HOD" size="sm" />
              </button>

              {/* Code Crackers President */}
              <button
                type="button"
                onClick={() => handlePersonaClick('PRESIDENT', 'home')}
                className="w-full p-3.5 rounded-xl border border-white/10 bg-zinc-900/80 hover:border-white/40 hover:bg-zinc-850 text-left transition-all flex items-center justify-between group"
              >
                <div className="flex items-center gap-3">
                  <img
                    src={SEED_USERS[1].avatarUrl}
                    alt="President"
                    className="w-9 h-9 rounded-full object-cover ring-2 ring-white/30"
                  />
                  <div>
                    <div className="font-bold text-xs text-white group-hover:text-zinc-200 transition-colors">
                      Aryan Sharma
                    </div>
                    <div className="text-[11px] text-zinc-400 font-mono">President · Code Crackers</div>
                  </div>
                </div>
                <RoleBadge role="PRESIDENT" size="sm" />
              </button>

              {/* Innovation President */}
              <button
                type="button"
                onClick={() => handlePersonaClick('PRESIDENT_DEV', 'home')}
                className="w-full p-3.5 rounded-xl border border-white/10 bg-zinc-900/80 hover:border-white/40 hover:bg-zinc-850 text-left transition-all flex items-center justify-between group"
              >
                <div className="flex items-center gap-3">
                  <img
                    src={SEED_USERS[3].avatarUrl}
                    alt="President"
                    className="w-9 h-9 rounded-full object-cover ring-2 ring-white/30"
                  />
                  <div>
                    <div className="font-bold text-xs text-white group-hover:text-zinc-200 transition-colors">
                      Marcus Vance
                    </div>
                    <div className="text-[11px] text-zinc-400 font-mono">President · Innovation</div>
                  </div>
                </div>
                <RoleBadge role="PRESIDENT" size="sm" />
              </button>

              {/* Devspire President */}
              <button
                type="button"
                onClick={() => handlePersonaClick('PRESIDENT_DEVSPIRE', 'home')}
                className="w-full p-3.5 rounded-xl border border-white/10 bg-zinc-900/80 hover:border-white/40 hover:bg-zinc-850 text-left transition-all flex items-center justify-between group"
              >
                <div className="flex items-center gap-3">
                  <img
                    src={SEED_USERS[5].avatarUrl}
                    alt="President"
                    className="w-9 h-9 rounded-full object-cover ring-2 ring-white/30"
                  />
                  <div>
                    <div className="font-bold text-xs text-white group-hover:text-zinc-200 transition-colors">
                      Elena Rostova
                    </div>
                    <div className="text-[11px] text-zinc-400 font-mono">President · Devspire</div>
                  </div>
                </div>
                <RoleBadge role="PRESIDENT" size="sm" />
              </button>

              {/* Sports President */}
              <button
                type="button"
                onClick={() => handlePersonaClick('PRESIDENT_SPORTS', 'home')}
                className="w-full p-3.5 rounded-xl border border-white/10 bg-zinc-900/80 hover:border-white/40 hover:bg-zinc-850 text-left transition-all flex items-center justify-between group"
              >
                <div className="flex items-center gap-3">
                  <img
                    src={SEED_USERS[7].avatarUrl}
                    alt="President"
                    className="w-9 h-9 rounded-full object-cover ring-2 ring-white/30"
                  />
                  <div>
                    <div className="font-bold text-xs text-white group-hover:text-zinc-200 transition-colors">
                      Zoya Qureshi
                    </div>
                    <div className="text-[11px] text-zinc-400 font-mono">President · Sports</div>
                  </div>
                </div>
                <RoleBadge role="PRESIDENT" size="sm" />
              </button>

              {/* Social responsibility sankalpa President */}
              <button
                type="button"
                onClick={() => handlePersonaClick('PRESIDENT_SANKALPA', 'home')}
                className="w-full p-3.5 rounded-xl border border-white/10 bg-zinc-900/80 hover:border-white/40 hover:bg-zinc-850 text-left transition-all flex items-center justify-between group"
              >
                <div className="flex items-center gap-3">
                  <img
                    src={SEED_USERS[9].avatarUrl}
                    alt="President"
                    className="w-9 h-9 rounded-full object-cover ring-2 ring-white/30"
                  />
                  <div>
                    <div className="font-bold text-xs text-white group-hover:text-zinc-200 transition-colors">
                      Neil Deshmukh
                    </div>
                    <div className="text-[11px] text-zinc-400 font-mono">President · Sankalpa</div>
                  </div>
                </div>
                <RoleBadge role="PRESIDENT" size="sm" />
              </button>

              {/* Cultural President */}
              <button
                type="button"
                onClick={() => handlePersonaClick('PRESIDENT_CULTURAL', 'home')}
                className="w-full p-3.5 rounded-xl border border-white/10 bg-zinc-900/80 hover:border-white/40 hover:bg-zinc-850 text-left transition-all flex items-center justify-between group"
              >
                <div className="flex items-center gap-3">
                  <img
                    src={SEED_USERS[11].avatarUrl}
                    alt="President"
                    className="w-9 h-9 rounded-full object-cover ring-2 ring-white/30"
                  />
                  <div>
                    <div className="font-bold text-xs text-white group-hover:text-zinc-200 transition-colors">
                      Kevin Zhang
                    </div>
                    <div className="text-[11px] text-zinc-400 font-mono">President · Cultural</div>
                  </div>
                </div>
                <RoleBadge role="PRESIDENT" size="sm" />
              </button>

              {/* Vice President */}
              <button
                type="button"
                onClick={() => handlePersonaClick('VICE_PRESIDENT', 'home')}
                className="w-full p-3.5 rounded-xl border border-white/10 bg-zinc-900/80 hover:border-white/40 hover:bg-zinc-850 text-left transition-all flex items-center justify-between group"
              >
                <div className="flex items-center gap-3">
                  <img
                    src={SEED_USERS[2].avatarUrl}
                    alt="VP"
                    className="w-9 h-9 rounded-full object-cover ring-2 ring-white/30"
                  />
                  <div>
                    <div className="font-bold text-xs text-white group-hover:text-zinc-200 transition-colors">
                      Tara Sen
                    </div>
                    <div className="text-[11px] text-zinc-400 font-mono">VP · Code Crackers</div>
                  </div>
                </div>
                <RoleBadge role="VICE_PRESIDENT" size="sm" />
              </button>

              {/* Student Member */}
              <button
                type="button"
                onClick={() => handlePersonaClick('MEMBER', 'home')}
                className="w-full p-3.5 rounded-xl border border-white/10 bg-zinc-900/80 hover:border-white/40 hover:bg-zinc-850 text-left transition-all flex items-center justify-between group"
              >
                <div className="flex items-center gap-3">
                  <img
                    src={SEED_USERS[13].avatarUrl}
                    alt="Student"
                    className="w-9 h-9 rounded-full object-cover ring-2 ring-white/30"
                  />
                  <div>
                    <div className="font-bold text-xs text-white group-hover:text-zinc-200 transition-colors">
                      Rahul Verma
                    </div>
                    <div className="text-[11px] text-zinc-400 font-mono">Student Member · 3rd Year</div>
                  </div>
                </div>
                <RoleBadge role="MEMBER" size="sm" />
              </button>
            </div>
          </GlassCard>

          {/* Security & Access Info */}
          <GlassCard className="p-5 space-y-3">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-white" />
              <h4 className="font-bold text-xs text-white uppercase tracking-wider font-mono">
                Role Permissions Policy
              </h4>
            </div>
            <ul className="space-y-2 text-xs text-zinc-400">
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-white mt-1.5 shrink-0" />
                <span><strong className="text-white">HOD</strong> has supervisory control over all 6 guilds, approvals, credentials, and college announcements.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-zinc-400 mt-1.5 shrink-0" />
                <span><strong className="text-white">Presidents & VPs</strong> manage their specific club roster, events, photo gallery, and group chatroom.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-zinc-500 mt-1.5 shrink-0" />
                <span><strong className="text-white">Members</strong> can join clubs upon approval, register for hackathons and workshops, and message in joined channels.</span>
              </li>
            </ul>
          </GlassCard>
        </div>
      </div>
    </div>
  );
};
