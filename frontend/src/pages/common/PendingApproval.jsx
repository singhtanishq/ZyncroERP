import React from "react";
import useAuth from "../../lib/auth/useAuth";
import { 
  Clock, 
  User, 
  Mail, 
  Phone, 
  ShieldCheck, 
  LogOut, 
  CheckCircle2,
  Shield,
  LayoutDashboard,
  ArrowRight
} from "lucide-react";

export default function PendingApproval() {
  const { user, logout } = useAuth();

  if (!user) return null;

  const roleText = user.role 
    ? user.role.charAt(0).toUpperCase() + user.role.slice(1) 
    : "Member";

  const steps = [
    { id: 1, label: "Created", status: "completed", desc: "Registration received." },
    { id: 2, label: "Review", status: "active", desc: "Identity verification." },
    { id: 3, label: "Access", status: "pending", desc: "Dashboard ready." },
  ];

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-slate-50 font-sans p-4 sm:p-6 lg:p-8">
      
      {/* 1. Dynamic Animated Blobs (Matching Login) */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[20%] -left-[10%] w-[80%] sm:w-[50%] h-[50%] rounded-full bg-violet-400/30 blur-[100px] sm:blur-[120px] mix-blend-multiply animate-blob"></div>
        <div className="absolute top-[20%] -right-[10%] w-[70%] sm:w-[40%] h-[50%] rounded-full bg-cyan-300/30 blur-[100px] sm:blur-[120px] mix-blend-multiply animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-[20%] left-[20%] w-[90%] sm:w-[60%] h-[50%] rounded-full bg-yellow-200/30 blur-[100px] sm:blur-[120px] mix-blend-multiply animate-blob animation-delay-4000"></div>
      </div>

      {/* 2. Modern Grid Overlay Pattern */}
      <div className="absolute inset-0 z-0 bg-grid-pattern pointer-events-none opacity-60"></div>

      <style>{`
        @keyframes blob {
          0% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
          100% { transform: translate(0px, 0px) scale(1); }
        }
        .animate-blob { animation: blob 10s infinite alternate ease-in-out; }
        .animation-delay-2000 { animation-delay: 2s; }
        .animation-delay-4000 { animation-delay: 4s; }

        .bg-grid-pattern {
          background-size: 40px 40px;
          background-image: 
            linear-gradient(to right, rgba(15, 23, 42, 0.04) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(15, 23, 42, 0.04) 1px, transparent 1px);
        }

        @keyframes float {
          0% { transform: translateY(0px) rotate(var(--rotation, 0deg)); }
          50% { transform: translateY(-15px) rotate(var(--rotation, 0deg)); }
          100% { transform: translateY(0px) rotate(var(--rotation, 0deg)); }
        }
        .animate-float-slow { animation: float 6s ease-in-out infinite; }
      `}</style>

      {/* Main Glass Card */}
      <div className="relative z-10 w-full max-w-6xl mx-auto flex flex-col lg:flex-row rounded-3xl sm:rounded-[2.5rem] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.1)] overflow-hidden bg-white/60 backdrop-blur-2xl border border-white/40 min-h-[75vh]">
        
        {/* Left Side: Information Area */}
        <div className="w-full lg:w-[55%] flex flex-col justify-between p-6 sm:p-10 lg:p-14 bg-white/80 shrink-0">
          <div>
            <div className="flex justify-between items-center mb-8 sm:mb-12">
              <img
                src="/assets/logos/logo_color.png"
                alt="Zyncro ERP logo"
                className="h-10 sm:h-12 w-auto object-contain drop-shadow-sm"
              />
              <button
                onClick={logout}
                  className="flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-red-50 text-slate-600 hover:text-red-600 rounded-xl transition-all duration-200 font-bold text-xs hover:scale-105 active:scale-95"              >
                <LogOut size={16} /> Sign Out
              </button>
            </div>

            <div className="space-y-3 mb-10">
              <div className="inline-flex items-center gap-2 bg-brand-teal-500/10 text-brand-teal-700 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider">
                <Clock size={12} className="animate-spin [animation-duration:3s]" /> Application Pending
              </div>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight">
                Almost there, <br/>
                <span className="text-brand-teal-600">{user.name?.split(' ')[0]}!</span>
              </h2>
              <p className="text-sm sm:text-base text-slate-500 font-medium max-w-md">
                Your request for <span className="text-slate-900 font-bold">{roleText}</span> access is being verified by our team.
              </p>
            </div>

            {/* Profile Fields */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <CompactField label="Legal Name" value={user.name} icon={<User size={16}/>} />
              <CompactField label="Email Address" value={user.email} icon={<Mail size={16}/>} />
              <CompactField label="Phone Number" value={user.mobile || "Not provided"} icon={<Phone size={16}/>} />
              <CompactField label="Role" value={roleText} icon={<Shield size={16}/>} />
            </div>
          </div>

          <div className="mt-10 pt-6 border-t border-slate-100 flex items-center justify-between">
             <div className="flex items-center gap-2 text-slate-400">
                <ShieldCheck size={16} className="text-emerald-500" />
                <span className="text-[10px] font-bold uppercase tracking-widest">Secure Session</span>
             </div>
          </div>
        </div>

        {/* Right Side: Status Progress (Dark Theme Matching Login Dashboard) */}
        <div className="w-full lg:flex-1 relative flex flex-col p-8 sm:p-12 bg-gradient-to-br from-brand-blue-700 via-brand-teal-800 to-brand-teal-950 overflow-hidden">
          
          {/* Ambient Lighting */}
          <div className="absolute top-[-15%] left-[-15%] w-[130%] h-[130%] bg-[radial-gradient(circle_at_top_left,rgba(167,139,250,0.3)_0%,transparent_50%)] pointer-events-none" />
          
          <div className="relative z-10 h-full flex flex-col justify-center">
            <h3 className="text-white font-bold text-lg mb-8 flex items-center gap-3">
              <LayoutDashboard className="text-brand-teal-300" />
              Approval Timeline
            </h3>

            <div className="space-y-8 relative">
              {steps.map((step, idx) => (
                <div key={step.id} className="relative flex gap-6 group">
                  {/* Connector Line */}
                  {idx !== steps.length - 1 && (
                    <div className={`absolute left-[15px] top-10 w-[2px] h-[calc(100%+12px)] ${
                      step.status === 'completed' ? 'bg-brand-teal-500' : 'bg-white/10'
                    }`} />
                  )}
                  
                  {/* Circle Indicator */}
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center z-10 shrink-0 border-2 transition-all duration-500 ${
                    step.status === 'completed' ? 'bg-brand-teal-500 border-yellow-200 text-slate-900 shadow-[0_0_15px_rgba(250,204,21,0.4)]' : 
                    step.status === 'active' ? 'bg-white/10 border-white text-white ring-4 ring-white/5' : 
                    'bg-transparent border-white/20 text-white/30'
                  }`}>
                    {step.status === 'completed' ? (
                      <CheckCircle2 size={16} strokeWidth={3} />
                    ) : (
                      <span className="text-xs font-bold">{step.id}</span>
                    )}
                  </div>

                  <div className="flex flex-col gap-1">
                    <h4 className={`text-sm font-bold uppercase tracking-wider ${
                      step.status === 'pending' ? 'text-white/30' : 'text-white'
                    }`}>
                      {step.label}
                    </h4>
                    <p className={`text-xs font-medium leading-relaxed ${
                      step.status === 'pending' ? 'text-white/20' : 'text-indigo-200'
                    }`}>
                      {step.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Support Card Widget (Floating style) */}
            <div className="mt-16 p-5 bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl animate-float-slow">
               <p className="text-white/70 text-xs leading-relaxed mb-3">
                 Need immediate assistance or have questions about your role?
               </p>
               <a href="mailto:no-reply@localhost" className="text-brand-teal-300 font-bold text-xs flex items-center gap-2 hover:gap-3 transition-all">
                 Contact Administration <ArrowRight size={14} />
               </a>
            </div>
          </div>

          
        </div>
      </div>
    </div>
  );
}

/* HELPER COMPONENT (Matching Input Style) */
function CompactField({ label, value, icon }) {
  return (
    <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/60 transition-all duration-300 hover:bg-white hover:shadow-lg hover:shadow-brand-teal-500/5 hover:border-violet-200 group">
      <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2 mb-1.5">
        <span className="text-slate-400 group-hover:text-brand-teal-500 transition-colors">
          {icon}
        </span> 
        {label}
      </div>
      <div className="text-sm font-bold text-slate-800 truncate">
        {value || "—"}
      </div>
    </div>
  );
}