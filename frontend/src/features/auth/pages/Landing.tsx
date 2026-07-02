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
import Button from '@/components/ui/Button';
import { Logo } from '@/components/ui/Logo';

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
    <div className="min-h-screen bg-white dark:bg-[#0d0c18] text-[#525252] dark:text-[#c7cbd2] flex flex-col font-sans selection:bg-[#A27B41] selection:text-white overflow-x-hidden transition-colors duration-250">
      
      {/* Background Soft Glows */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-[#A27B41]/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute top-1/3 right-1/4 w-[600px] h-[600px] bg-charcoal-200/5 dark:bg-charcoal-800/5 rounded-full blur-[140px] pointer-events-none" />

      {/* Navigation Header */}
      <header className="relative z-10 max-w-7xl mx-auto w-full px-6 h-20 flex items-center justify-between border-b border-[#E5E5E5] dark:border-charcoal-800 bg-white/60 dark:bg-[#0d0c18]/60 backdrop-blur-md sticky top-0">
        <Logo size="lg" />
        
        <nav className="hidden md:flex items-center gap-8 text-sm font-semibold text-[#525252] dark:text-[#c7cbd2]">
          <a href="#features" className="hover:text-[#A27B41] dark:hover:text-[#CDB07C] transition-colors duration-200">Features</a>
          <a href="#about" className="hover:text-[#A27B41] dark:hover:text-[#CDB07C] transition-colors duration-200">About Privacy</a>
          <a href="#sandbox" className="hover:text-[#A27B41] dark:hover:text-[#CDB07C] transition-colors duration-200">Sandbox Access</a>
        </nav>

        <div className="flex items-center gap-3">
          <Link 
            to="/login" 
            className="px-4 py-2 text-xs font-bold text-[#525252] hover:text-[#0D0C18] dark:text-[#c7cbd2] dark:hover:text-white hover:bg-[#F5F5F5] dark:hover:bg-charcoal-800 rounded-chosen-md transition-all duration-200 border border-transparent"
          >
            Sign In
          </Link>
          <Link to="/register">
            <Button variant="primary" size="sm">
              Get Started
            </Button>
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-grow">
        <section className="relative z-10 max-w-7xl mx-auto px-6 pt-16 pb-20 text-center md:pt-24 md:pb-28">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#F2F0EA] dark:bg-charcoal-800 border border-[#E5E5E5] dark:border-charcoal-700 text-xs font-bold tracking-wider text-[#A27B41] uppercase mb-8 select-none">
            <Sparkles className="h-3.5 w-3.5 fill-current" />
            Next-Generation Clinical Telemetry
          </div>

          <h1 className="font-display font-bold text-4xl sm:text-5xl md:text-6xl leading-tight tracking-tight text-[#0D0C18] dark:text-white mb-6 max-w-4xl mx-auto">
            Precision Motion Tracking. <br className="hidden md:block"/>
            <span className="bg-gradient-to-r from-[#A27B41] to-[#7f5d37] bg-clip-text text-transparent">
              No Video Files Stored.
            </span>
          </h1>

          <p className="max-w-xl mx-auto text-sm sm:text-base text-[#525252] dark:text-[#a3a3a3] leading-relaxed mb-10">
            A premium full-stack telemetry platform designed for patients and clinicians. Capture relative skeletal coordinates in real-time, generate automated joint-angle coaching, and trace rehabilitation progress securely.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16 max-w-md mx-auto">
            <Link to="/register" className="w-full">
              <Button variant="primary" size="lg" className="w-full flex items-center justify-center gap-2">
                Get Started Now
                <ArrowRight className="h-4.5 w-4.5" />
              </Button>
            </Link>
            <Link to="/login" className="w-full">
              <Button variant="outline" size="lg" className="w-full flex items-center justify-center gap-2">
                Practitioner Access
                <ChevronRight className="h-4.5 w-4.5 text-[#A27B41]" />
              </Button>
            </Link>
          </div>

          {/* Quick Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto p-6 rounded-chosen-xl bg-ai-gradient dark:bg-charcoal-800 border border-[#E5E5E5] dark:border-charcoal-850 shadow-chosen-lg">
            <div className="p-4 border-r border-[#E5E5E5] dark:border-charcoal-700 last:border-0 text-left">
              <div className="font-display font-bold text-2xl md:text-3xl text-[#0D0C18] dark:text-white">5 FPS</div>
              <div className="text-[10px] text-[#A27B41] font-bold uppercase mt-1 tracking-wider">Telemetry Logging</div>
            </div>
            <div className="p-4 border-r border-[#E5E5E5] dark:border-charcoal-700 last:border-0 text-left">
              <div className="font-display font-bold text-2xl md:text-3xl text-[#0D0C18] dark:text-white">100%</div>
              <div className="text-[10px] text-[#A27B41] font-bold uppercase mt-1 tracking-wider">Video-free privacy</div>
            </div>
            <div className="p-4 border-r border-[#E5E5E5] dark:border-charcoal-700 last:border-0 text-left">
              <div className="font-display font-bold text-2xl md:text-3xl text-[#0D0C18] dark:text-white">0s</div>
              <div className="text-[10px] text-[#A27B41] font-bold uppercase mt-1 tracking-wider">Cloud Storage Bloat</div>
            </div>
            <div className="p-4 last:border-0 text-left">
              <div className="font-display font-bold text-2xl md:text-3xl text-[#0D0C18] dark:text-white">Real-Time</div>
              <div className="text-[10px] text-[#A27B41] font-bold uppercase mt-1 tracking-wider">ROM Calculations</div>
            </div>
          </div>
        </section>

        {/* Feature Grid */}
        <section id="features" className="relative z-10 border-t border-[#E5E5E5] dark:border-charcoal-800 bg-[#FAFBFC] dark:bg-charcoal-900/30 py-20">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center mb-12">
              <h2 className="font-display font-bold text-2xl md:text-3xl text-[#0D0C18] dark:text-white">
                Engineered for Modern Clinical Workflows
              </h2>
              <p className="text-sm text-[#525252] dark:text-[#a3a3a3] mt-2 max-w-xl mx-auto">
                Discover the advanced technical components driving patient rehabilitation tracking.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Feature 1 */}
              <div className="p-6 rounded-chosen-lg bg-white dark:bg-charcoal-800 border border-[#E5E5E5] dark:border-charcoal-700 hover:border-[#A27B41]/50 dark:hover:border-[#A27B41]/50 transition-all duration-300 text-left space-y-4">
                <div className="h-10 w-10 rounded-chosen-md bg-[#F5E6E6] text-[#D15858] flex items-center justify-center">
                  <EyeOff className="h-5 w-5" />
                </div>
                <h3 className="font-display font-bold text-base text-[#0D0C18] dark:text-white">Video-Free Telemetry</h3>
                <p className="text-xs text-[#525252] dark:text-[#a3a3a3] leading-relaxed">
                  Calculates coordinate telemetry in-browser and logs only joint coordinates. Camera files are never saved or sent.
                </p>
              </div>

              {/* Feature 2 */}
              <div className="p-6 rounded-chosen-lg bg-white dark:bg-charcoal-800 border border-[#E5E5E5] dark:border-charcoal-700 hover:border-[#A27B41]/50 dark:hover:border-[#A27B41]/50 transition-all duration-300 text-left space-y-4">
                <div className="h-10 w-10 rounded-chosen-md bg-[#eff6ff] text-indigo-500 flex items-center justify-center">
                  <Dumbbell className="h-5 w-5" />
                </div>
                <h3 className="font-display font-bold text-base text-[#0D0C18] dark:text-white">Interactive 3D Replay</h3>
                <p className="text-xs text-[#525252] dark:text-[#a3a3a3] leading-relaxed">
                  Clinicians can play back recordings as animated skeleton structures with play controls and live joint-angle HUD overlays.
                </p>
              </div>

              {/* Feature 3 */}
              <div className="p-6 rounded-chosen-lg bg-white dark:bg-charcoal-800 border border-[#E5E5E5] dark:border-charcoal-700 hover:border-[#A27B41]/50 dark:hover:border-[#A27B41]/50 transition-all duration-300 text-left space-y-4">
                <div className="h-10 w-10 rounded-chosen-md bg-[#F2F0EA] text-[#A27B41] flex items-center justify-center">
                  <Activity className="h-5 w-5" />
                </div>
                <h3 className="font-display font-bold text-base text-[#0D0C18] dark:text-white">Form Error Coaching</h3>
                <p className="text-xs text-[#525252] dark:text-[#a3a3a3] leading-relaxed">
                  Automated heuristics analyze shoulder compensation, torso lean, hip rotation, fast speeds, and incomplete ROM.
                </p>
              </div>

              {/* Feature 4 */}
              <div className="p-6 rounded-chosen-lg bg-white dark:bg-charcoal-800 border border-[#E5E5E5] dark:border-charcoal-700 hover:border-[#A27B41]/50 dark:hover:border-[#A27B41]/50 transition-all duration-300 text-left space-y-4">
                <div className="h-10 w-10 rounded-chosen-md bg-[#ecfdf5] text-[#4F995E] flex items-center justify-center">
                  <TrendingUp className="h-5 w-5" />
                </div>
                <h3 className="font-display font-bold text-base text-[#0D0C18] dark:text-white">Comparative Analytics</h3>
                <p className="text-xs text-[#525252] dark:text-[#a3a3a3] leading-relaxed">
                  Track patient recovery session-over-session with progression delta indexes, charts, and compliance trackers.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Sandbox Dev Shortcuts */}
        <section id="sandbox" className="relative z-10 border-t border-[#E5E5E5] dark:border-charcoal-800 py-20 bg-white dark:bg-[#0d0c18]">
          <div className="max-w-4xl mx-auto px-6 text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#F5F5F5] dark:bg-charcoal-800 border border-[#E5E5E5] dark:border-charcoal-700 text-[10px] font-bold tracking-widest text-[#A27B41] uppercase mb-6 select-none">
              <Lock className="h-3.5 w-3.5" />
              Sandbox Environment
            </div>

            <h2 className="font-display font-bold text-2xl text-[#0D0C18] dark:text-white mb-4">
              Developer & Sandbox Shortcuts
            </h2>
            <p className="text-xs text-[#525252] dark:text-[#a3a3a3] max-w-xl mx-auto mb-10">
              Running without configured environment variables? Use these pre-configured mock credentials to bypass authentication and inspect patient/clinician portals immediately.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-md mx-auto">
              <button
                onClick={() => handleSandboxLogin('patient')}
                className="py-4 px-6 bg-[#F5F5F5] hover:bg-[#E6E6E6] dark:bg-charcoal-850 dark:hover:bg-charcoal-800 border border-[#E5E5E5] dark:border-charcoal-700 text-[#0D0C18] dark:text-white rounded-chosen-lg flex items-center justify-center gap-3.5 transition-all duration-200 shadow-chosen-sm group"
              >
                <User className="h-5 w-5 text-[#A27B41] group-hover:scale-110 transition-transform" />
                <div className="text-left">
                  <div className="text-[10px] text-chosen-text-secondary uppercase font-bold tracking-wider">Bypass Auth</div>
                  <div className="font-bold text-sm">Demo Patient Dashboard</div>
                </div>
              </button>

              <button
                onClick={() => handleSandboxLogin('admin')}
                className="py-4 px-6 bg-[#F5F5F5] hover:bg-[#E6E6E6] dark:bg-charcoal-850 dark:hover:bg-charcoal-800 border border-[#E5E5E5] dark:border-charcoal-700 text-[#0D0C18] dark:text-white rounded-chosen-lg flex items-center justify-center gap-3.5 transition-all duration-200 shadow-chosen-sm group"
              >
                <Shield className="h-5 w-5 text-[#A27B41] group-hover:scale-110 transition-transform" />
                <div className="text-left">
                  <div className="text-[10px] text-chosen-text-secondary uppercase font-bold tracking-wider">Bypass Auth</div>
                  <div className="font-bold text-sm">Demo Clinician Portal</div>
                </div>
              </button>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-[#E5E5E5] dark:border-charcoal-800 bg-[#FAFBFC] dark:bg-[#0d0c18] py-8">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-6 text-xs text-[#a3a3a3]">
          <div>
            &copy; {new Date().getFullYear()} Chosen Life. All rights reserved.
          </div>
          <div className="flex gap-6">
            <a href="#" className="hover:text-[#A27B41] transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-[#A27B41] transition-colors">Terms of Service</a>
          </div>
        </div>
      </footer>

    </div>
  );
};

export default Landing;
