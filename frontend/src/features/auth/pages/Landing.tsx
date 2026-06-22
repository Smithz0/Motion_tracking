import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { 
  Activity, 
  Shield, 
  ArrowRight, 
  Dumbbell, 
  TrendingUp, 
  User, 
  Sparkles, 
  EyeOff, 
  Lock,
  ChevronRight
} from 'lucide-react';

const Landing: React.FC = () => {
  const { signInMock } = useAuth();
  const navigate = useNavigate();

  const handleSandboxLogin = async (role: 'admin' | 'patient') => {
    if (role === 'admin') {
      await signInMock('admin', 'demo.clinician@chosenmotion.com', 'Marcus', 'Aurelius');
    } else {
      await signInMock('patient', 'demo.patient@chosenmotion.com', 'Sarah', 'Connor');
    }
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-slate-905 bg-slate-900 text-slate-100 flex flex-col font-sans selection:bg-primary-500 selection:text-white overflow-x-hidden">
      
      {/* Background Glows */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-primary-500/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute top-1/3 right-1/4 w-[600px] h-[600px] bg-indigo-500/10 rounded-full blur-[140px] pointer-events-none" />

      {/* Navigation Header */}
      <header className="relative z-10 max-w-7xl mx-auto w-full px-6 h-20 flex items-center justify-between border-b border-slate-800/80 bg-slate-900/60 backdrop-blur-md sticky top-0">
        <div className="flex items-center gap-2.5">
          <div className="h-10 w-10 bg-gradient-to-tr from-primary-500 to-indigo-600 rounded-xl flex items-center justify-center text-white shadow-premium">
            <Activity className="h-5 w-5 animate-pulse" />
          </div>
          <span className="font-display font-extrabold text-xl tracking-tight bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">
            Chosen Motion
          </span>
        </div>
        
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-400">
          <a href="#features" className="hover:text-white transition-colors duration-200">Features</a>
          <a href="#about" className="hover:text-white transition-colors duration-200">About Privacy</a>
          <a href="#sandbox" className="hover:text-white transition-colors duration-200">Sandbox Access</a>
        </nav>

        <div className="flex items-center gap-4">
          <Link 
            to="/login" 
            className="px-4 py-2 text-sm font-semibold text-slate-300 hover:text-white hover:bg-slate-800/50 rounded-xl transition-all duration-200 border border-transparent hover:border-slate-800"
          >
            Sign In
          </Link>
          <Link 
            to="/register" 
            className="px-5 py-2.5 text-sm font-semibold bg-gradient-to-r from-primary-500 to-indigo-600 hover:from-primary-600 hover:to-indigo-700 text-white rounded-xl shadow-lg hover:shadow-primary-500/15 hover:scale-[1.02] transition-all duration-200"
          >
            Get Started
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-grow">
        <section className="relative z-10 max-w-7xl mx-auto px-6 pt-20 pb-24 text-center md:pt-32 md:pb-36">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-800/70 border border-slate-700/80 text-xs font-semibold tracking-wider text-primary-400 uppercase mb-8 shadow-inner">
            <Sparkles className="h-3.5 w-3.5" />
            Next-Generation Clinical Telemetry
          </div>

          <h1 className="font-display font-extrabold text-4xl sm:text-5xl md:text-7xl leading-tight sm:leading-none tracking-tight text-white mb-6">
            Precision Motion Tracking. <br className="hidden md:block"/>
            <span className="bg-gradient-to-r from-primary-400 via-indigo-400 to-violet-500 bg-clip-text text-transparent">
              No Video Files Stored.
            </span>
          </h1>

          <p className="max-w-2xl mx-auto text-base sm:text-lg md:text-xl text-slate-400 leading-relaxed mb-12">
            A premium full-stack telemetry platform designed for patients and clinicians. Capture relative skeletal coordinates in real-time, generate automated joint-angle coaching, and trace rehabilitation progress securely.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-20">
            <Link 
              to="/register" 
              className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-primary-500 to-indigo-600 hover:from-primary-600 hover:to-indigo-700 text-white font-semibold rounded-2xl shadow-xl shadow-primary-500/10 hover:shadow-primary-500/20 hover:scale-[1.02] transition-all duration-200 flex items-center justify-center gap-2"
            >
              Get Started Now
              <ArrowRight className="h-5 w-5" />
            </Link>
            <Link 
              to="/login" 
              className="w-full sm:w-auto px-8 py-4 bg-slate-800 hover:bg-slate-750 text-slate-200 font-semibold rounded-2xl border border-slate-700 hover:border-slate-600 transition-all duration-200 flex items-center justify-center gap-2"
            >
              Practitioner Access
              <ChevronRight className="h-5 w-5 text-slate-500" />
            </Link>
          </div>

          {/* Quick Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto p-6 rounded-3xl bg-slate-900/50 border border-slate-800/80 backdrop-blur-sm">
            <div className="p-4 border-r border-slate-800/60 last:border-0">
              <div className="font-display font-extrabold text-2xl md:text-3xl text-white">5 FPS</div>
              <div className="text-xs text-slate-500 font-medium uppercase mt-1 tracking-wider">Telemetry Logging</div>
            </div>
            <div className="p-4 border-r border-slate-800/60 last:border-0">
              <div className="font-display font-extrabold text-2xl md:text-3xl text-white">100%</div>
              <div className="text-xs text-slate-500 font-medium uppercase mt-1 tracking-wider">Video-free privacy</div>
            </div>
            <div className="p-4 border-r border-slate-800/60 last:border-0">
              <div className="font-display font-extrabold text-2xl md:text-3xl text-white">0s</div>
              <div className="text-xs text-slate-500 font-medium uppercase mt-1 tracking-wider">Cloud Storage Bloat</div>
            </div>
            <div className="p-4 last:border-0">
              <div className="font-display font-extrabold text-2xl md:text-3xl text-white">Real-Time</div>
              <div className="text-xs text-slate-500 font-medium uppercase mt-1 tracking-wider">ROM Calculations</div>
            </div>
          </div>
        </section>

        {/* Feature Grid */}
        <section id="features" className="relative z-10 border-t border-slate-800/60 bg-slate-950/40 py-24">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center mb-16">
              <h2 className="font-display font-bold text-3xl md:text-4xl text-white">
                Engineered for Modern Clinical Workflows
              </h2>
              <p className="text-slate-400 mt-3 max-w-xl mx-auto">
                Discover the advanced technical components driving patient rehabilitation tracking.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Feature 1 */}
              <div className="p-8 rounded-3xl bg-slate-900/40 border border-slate-800/80 hover:border-primary-500/30 hover:scale-[1.02] transition-all duration-300">
                <div className="h-12 w-12 rounded-2xl bg-primary-500/10 text-primary-400 flex items-center justify-center mb-6 border border-primary-500/15">
                  <EyeOff className="h-6 w-6" />
                </div>
                <h3 className="font-display font-bold text-lg text-white mb-2">Video-Free Telemetry</h3>
                <p className="text-sm text-slate-400 leading-relaxed">
                  Calculates coordinate telemetry in-browser and logs only joint coordinates. Camera files are never saved or sent.
                </p>
              </div>

              {/* Feature 2 */}
              <div className="p-8 rounded-3xl bg-slate-900/40 border border-slate-800/80 hover:border-indigo-500/30 hover:scale-[1.02] transition-all duration-300">
                <div className="h-12 w-12 rounded-2xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center mb-6 border border-indigo-500/15">
                  <Dumbbell className="h-6 w-6" />
                </div>
                <h3 className="font-display font-bold text-lg text-white mb-2">Interactive 3D Replay</h3>
                <p className="text-sm text-slate-400 leading-relaxed">
                  Clinicians can play back recordings as animated skeleton structures with play controls and live joint-angle HUD overlays.
                </p>
              </div>

              {/* Feature 3 */}
              <div className="p-8 rounded-3xl bg-slate-900/40 border border-slate-800/80 hover:border-violet-500/30 hover:scale-[1.02] transition-all duration-300">
                <div className="h-12 w-12 rounded-2xl bg-violet-500/10 text-violet-400 flex items-center justify-center mb-6 border border-violet-500/15">
                  <Activity className="h-6 w-6" />
                </div>
                <h3 className="font-display font-bold text-lg text-white mb-2">Form Error Coaching</h3>
                <p className="text-sm text-slate-400 leading-relaxed">
                  Automated heuristics analyze shoulder compensation, torso lean, hip rotation, fast speeds, and incomplete ROM.
                </p>
              </div>

              {/* Feature 4 */}
              <div className="p-8 rounded-3xl bg-slate-900/40 border border-slate-800/80 hover:border-emerald-500/30 hover:scale-[1.02] transition-all duration-300">
                <div className="h-12 w-12 rounded-2xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center mb-6 border border-emerald-500/15">
                  <TrendingUp className="h-6 w-6" />
                </div>
                <h3 className="font-display font-bold text-lg text-white mb-2">Comparative Analytics</h3>
                <p className="text-sm text-slate-400 leading-relaxed">
                  Track patient recovery session-over-session with progression delta indexes, charts, and compliance trackers.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Sandbox Dev Shortcuts */}
        <section id="sandbox" className="relative z-10 border-t border-slate-800/60 py-24 bg-slate-900/30">
          <div className="max-w-4xl mx-auto px-6 text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-800 border border-slate-700/60 text-[10px] font-bold tracking-widest text-slate-400 uppercase mb-6">
              <Lock className="h-3.5 w-3.5 text-indigo-400" />
              Sandbox Environment
            </div>

            <h2 className="font-display font-bold text-3xl text-white mb-4">
              Developer & Sandbox Shortcuts
            </h2>
            <p className="text-slate-400 max-w-xl mx-auto mb-10 text-sm">
              Running without configured environment variables? Use these pre-configured mock credentials to bypass authentication and inspect patient/clinician portals immediately.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-md mx-auto">
              <button
                onClick={() => handleSandboxLogin('patient')}
                className="py-4 px-6 bg-slate-800 hover:bg-slate-750 border border-slate-700/80 text-white rounded-2xl flex items-center justify-center gap-3 transition-all duration-200 shadow-md group hover:border-primary-500/40"
              >
                <User className="h-5 w-5 text-primary-400 group-hover:scale-110 transition-transform" />
                <div className="text-left">
                  <div className="text-xs text-slate-400 font-medium">Bypass Auth</div>
                  <div className="font-semibold text-sm">Demo Patient Dashboard</div>
                </div>
              </button>

              <button
                onClick={() => handleSandboxLogin('admin')}
                className="py-4 px-6 bg-slate-800 hover:bg-slate-750 border border-slate-700/80 text-white rounded-2xl flex items-center justify-center gap-3 transition-all duration-200 shadow-md group hover:border-indigo-500/40"
              >
                <Shield className="h-5 w-5 text-indigo-400 group-hover:scale-110 transition-transform" />
                <div className="text-left">
                  <div className="text-xs text-slate-400 font-medium">Bypass Auth</div>
                  <div className="font-semibold text-sm">Demo Clinician Portal</div>
                </div>
              </button>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-slate-800/60 bg-slate-950/60 py-10">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-6 text-sm text-slate-500">
          <div>
            &copy; {new Date().getFullYear()} Chosen Motion. All rights reserved.
          </div>
          <div className="flex gap-6">
            <a href="#" className="hover:text-slate-400 transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-slate-400 transition-colors">Terms of Service</a>
          </div>
        </div>
      </footer>

    </div>
  );
};

export default Landing;
