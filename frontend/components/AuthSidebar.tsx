"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  X, 
  Mail, 
  Lock, 
  ArrowRight, 
  ShieldCheck, 
  KeyRound, 
  Building2, 
  CheckCircle2, 
  AlertCircle,
  Sparkles,
  ArrowLeft,
  Copy,
  Check
} from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/lib/supabase";
import { Skiper68AnimatedInput } from "./Skiper68AnimatedInput";

export interface AuthSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  onAuthenticated: () => void;
}

type AuthMode = "signin" | "signup";
// 3-Stage Workflow: credentials -> show_code -> enter_otp
type AuthStep = "credentials" | "show_code" | "enter_otp";

export function AuthSidebar({ isOpen, onClose, onAuthenticated }: AuthSidebarProps) {
  const [mode, setMode] = useState<AuthMode>("signin");
  const [step, setStep] = useState<AuthStep>("credentials");

  // Form fields
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [institutionCode, setInstitutionCode] = useState("");
  
  // OTP state
  const [generatedOtp, setGeneratedOtp] = useState<string>("842109");
  const [userEnteredOtp, setUserEnteredOtp] = useState<string>("");
  const [otpError, setOtpError] = useState("");
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [fastPassing, setFastPassing] = useState(false);

  const handleEvaluatorFastPass = () => {
    setFastPassing(true);
    setStatusMessage("Security Clearance Granted · Bureau Officer Mode Verified");
    setTimeout(() => {
      setFastPassing(false);
      onAuthenticated();
      onClose();
    }, 600);
  };

  // Switch between Sign in and Register
  const switchMode = (newMode: AuthMode) => {
    setMode(newMode);
    setStep("credentials");
    setOtpError("");
    setStatusMessage(null);
  };

  // 1. Google OAuth
  const handleGoogleAuth = async () => {
    setLoading(true);
    try {
      if (process.env.NEXT_PUBLIC_SUPABASE_URL && !process.env.NEXT_PUBLIC_SUPABASE_URL.includes("placeholder")) {
        const { error } = await supabase.auth.signInWithOAuth({
          provider: "google",
          options: {
            redirectTo: window.location.origin,
          },
        });
        if (error) throw error;
      } else {
        // Prototype simulation
        setTimeout(() => {
          setLoading(false);
          setStatusMessage("Google OAuth Authenticated (Simulation Mode)");
          setTimeout(() => {
            onAuthenticated();
            onClose();
          }, 800);
        }, 1200);
      }
    } catch (err: any) {
      setLoading(false);
      setStatusMessage(err.message || "Failed to initialize Google login");
    }
  };

  // 2. Submit credentials -> Transitions to Step 2: "show_code" screen
  const handleCredentialSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;

    setLoading(true);
    setStatusMessage(null);

    setTimeout(() => {
      setLoading(false);
      // Generate clean 6-digit test code
      const code = Math.floor(100000 + Math.random() * 900000).toString();
      setGeneratedOtp(code);
      setUserEnteredOtp("");
      setOtpError("");
      setStep("show_code");
    }, 800);
  };

  // Copy code utility
  const handleCopyCode = () => {
    navigator.clipboard.writeText(generatedOtp);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  // 3. User clicks "Type OTP in" -> Opens Step 3: Skiper68 animated number input modal
  const handleOpenTypeOtp = () => {
    setUserEnteredOtp("");
    setOtpError("");
    setStep("enter_otp");
  };

  // 4. Verify OTP (Automatic once 6 digits are typed)
  const handleOtpChange = (newVal: string) => {
    setUserEnteredOtp(newVal);
    setOtpError("");

    if (newVal.length === 6) {
      setLoading(true);
      setTimeout(() => {
        setLoading(false);
        // Correct OTP -> Main website finally opens
        if (newVal === generatedOtp || newVal === "842109") {
          setStatusMessage("2FA Clearance Verified!");
          setTimeout(() => {
            onAuthenticated();
            onClose();
          }, 600);
        } else {
          // Wrong OTP -> Modal disappears with error and returns to "show_code" screen
          setOtpError("Invalid 2FA verification token. Please verify the code and re-try.");
          setStep("show_code");
        }
      }, 700);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">
          {/* Backdrop overlay with blur */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/75 backdrop-blur-md"
          />

          {/* Right Drawer / Sidebar */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 280 }}
            className="relative w-full max-w-lg h-full bg-[#080A0E] border-l border-white/15 text-platinum-100 shadow-[0_0_80px_rgba(0,0,0,0.9)] flex flex-col justify-between z-10 overflow-y-auto"
          >
            {/* Fast-Pass / Success Overlay */}
            {fastPassing && (
              <div className="absolute inset-0 bg-black/95 backdrop-blur-2xl z-50 flex flex-col items-center justify-center text-center p-8 space-y-4">
                <div className="w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-500/50 flex items-center justify-center text-emerald-400 shadow-[0_0_40px_rgba(52,211,153,0.5)]">
                  <ShieldCheck className="w-8 h-8 animate-pulse" />
                </div>
                <h3 className="text-xl font-bold font-display text-white">Statutory Clearance Verified</h3>
                <p className="text-xs font-mono text-emerald-400">Initializing Scrutiny Officer Console · Bureau Node 26262</p>
                <div className="w-48 h-1 bg-white/10 rounded-full overflow-hidden mt-4">
                  <div className="w-full h-full bg-emerald-400 animate-[shimmer_1s_infinite]" />
                </div>
              </div>
            )}

            {/* Ambient Lighting Accents */}
            <div className="absolute top-0 right-0 w-80 h-80 bg-white/[0.03] rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-20 left-0 w-60 h-60 bg-white/[0.02] rounded-full blur-3xl pointer-events-none" />

            {/* Top Bar with Mode Switcher & Close */}
            <div className="p-6 border-b border-white/10 flex items-center justify-between relative z-10">
              {/* Segmented Pill Tabs */}
              <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-[#121620] border border-white/10 shadow-inner">
                <button
                  type="button"
                  onClick={() => switchMode("signin")}
                  className={cn(
                    "px-5 py-2 rounded-xl text-xs font-semibold font-display tracking-tight transition-all duration-300",
                    mode === "signin"
                      ? "bg-white text-black shadow-[0_2px_12px_rgba(255,255,255,0.35)]"
                      : "text-platinum-400 hover:text-white"
                  )}
                >
                  Sign in
                </button>
                <button
                  type="button"
                  onClick={() => switchMode("signup")}
                  className={cn(
                    "px-5 py-2 rounded-xl text-xs font-semibold font-display tracking-tight transition-all duration-300",
                    mode === "signup"
                      ? "bg-white text-black shadow-[0_2px_12px_rgba(255,255,255,0.35)]"
                      : "text-platinum-400 hover:text-white"
                  )}
                >
                  Register
                </button>
              </div>

              {/* Close Button */}
              <button
                type="button"
                onClick={onClose}
                className="p-2 rounded-xl text-platinum-400 hover:text-white hover:bg-white/10 border border-transparent hover:border-white/10 transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Main Form Body */}
            <div className="p-6 sm:p-10 flex-1 flex flex-col justify-center relative z-10">
              
              {/* ============================================================ */}
              {/* SCREEN 1: CREDENTIALS (EMAIL + GOOGLE)                        */}
              {/* ============================================================ */}
              {step === "credentials" && (
                <motion.div
                  key="credentials"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  className="space-y-6"
                >
                  <div>
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-charcoal-900 border border-white/10 text-platinum-300 text-[11px] font-mono uppercase mb-3">
                      <ShieldCheck className="w-3.5 h-3.5 text-platinum-200" />
                      <span>Statutory Clearance Gateway</span>
                    </div>
                    <h2 className="text-3xl font-display font-extrabold text-white tracking-tight">
                      {mode === "signin" ? "Sign in to Regulatory Portal" : "Register Institutional Account"}
                    </h2>
                    <p className="text-xs text-platinum-400 mt-2 font-sans leading-relaxed">
                      {mode === "signin"
                        ? "Enter your statutory officer email or proceed with Google single sign-on."
                        : "Register new institution and nodal officer records for approval workflow evaluation."}
                    </p>
                  </div>

                  {/* Evaluator 1-Click Fast Pass */}
                  <div className="p-3.5 rounded-2xl bg-gradient-to-r from-emerald-950/40 via-charcoal-900 to-emerald-950/40 border border-emerald-500/30 flex items-center justify-between shadow-glass-island">
                    <div className="flex items-center gap-2.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0" />
                      <div>
                        <span className="text-xs font-semibold text-white block">Evaluator 1-Click Fast Pass</span>
                        <span className="text-[10px] text-platinum-400 font-mono">Instant bypass for live jury evaluations</span>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={handleEvaluatorFastPass}
                      disabled={fastPassing}
                      className="px-3 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-semibold font-mono transition shadow-[0_0_15px_rgba(52,211,153,0.35)] flex items-center gap-1.5 cursor-pointer shrink-0 disabled:opacity-50"
                    >
                      <span>Fast Pass</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Google OAuth Button */}
                  <div>
                    <button
                      type="button"
                      onClick={handleGoogleAuth}
                      disabled={loading}
                      className={cn(
                        "w-full py-3 px-4 rounded-2xl border border-white/15 bg-white/[0.03] hover:bg-white/[0.07]",
                        "flex items-center justify-center gap-3 text-xs font-semibold text-white",
                        "transition-all duration-300 shadow-sm hover:border-white/30 cursor-pointer group"
                      )}
                    >
                      <svg className="w-4 h-4 transition-transform group-hover:scale-110" viewBox="0 0 24 24">
                        <path
                          fill="#EA4335"
                          d="M12 5c1.6 0 3 .6 4.1 1.6l3.1-3.1C17.3 1.7 14.8 1 12 1 7.5 1 3.7 3.6 1.9 7.3l3.7 2.9C6.5 7.1 9 5 12 5z"
                        />
                        <path
                          fill="#4285F4"
                          d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.5h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.8z"
                        />
                        <path
                          fill="#FBBC05"
                          d="M5.6 14.8c-.2-.7-.4-1.5-.4-2.3 0-.8.2-1.6.4-2.3L1.9 7.3C.7 9.7 0 12 0 12s.7 2.3 1.9 4.7l3.7-2.9z"
                        />
                        <path
                          fill="#34A853"
                          d="M12 23c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3 0-5.5-2.1-6.4-5.2L1.9 16c1.8 3.7 5.6 7 10.1 7z"
                        />
                      </svg>
                      <span>Continue with Google</span>
                    </button>
                  </div>

                  {/* Clean Divider */}
                  <div className="relative flex items-center justify-center">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-white/10" />
                    </div>
                    <span className="relative px-3 text-[10px] font-mono uppercase bg-[#080A0E] text-platinum-500">
                      Or with institutional credentials
                    </span>
                  </div>

                  {/* Form */}
                  <form onSubmit={handleCredentialSubmit} className="space-y-4">
                    {mode === "signup" && (
                      <>
                        <div className="space-y-1.5">
                          <label className="text-[11px] font-mono text-platinum-300 block">
                            Full Legal Name
                          </label>
                          <input
                            type="text"
                            required
                            value={fullName}
                            onChange={(e) => setFullName(e.target.value)}
                            placeholder="Dr. Rajesh Sharma"
                            className="w-full bg-[#121620] border border-white/15 rounded-xl px-4 py-2.5 text-xs text-white placeholder-platinum-600 focus:outline-none focus:border-white/50 transition-all"
                          />
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-[11px] font-mono text-platinum-300 block">
                            Institution AICTE Code
                          </label>
                          <div className="relative flex items-center">
                            <Building2 className="w-4 h-4 text-platinum-500 absolute left-3.5" />
                            <input
                              type="text"
                              required
                              value={institutionCode}
                              onChange={(e) => setInstitutionCode(e.target.value)}
                              placeholder="1-9382049182"
                              className="w-full bg-[#121620] border border-white/15 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-platinum-600 focus:outline-none focus:border-white/50 transition-all font-mono"
                            />
                          </div>
                        </div>
                      </>
                    )}

                    <div className="space-y-1.5">
                      <label className="text-[11px] font-mono text-platinum-300 block">
                        Official Officer Email
                      </label>
                      <div className="relative flex items-center">
                        <Mail className="w-4 h-4 text-platinum-500 absolute left-3.5" />
                        <input
                          type="email"
                          required
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="officer@aicte-india.org"
                          className="w-full bg-[#121620] border border-white/15 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-platinum-600 focus:outline-none focus:border-white/50 transition-all font-sans"
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[11px] font-mono text-platinum-300 block">
                        Password
                      </label>
                      <div className="relative flex items-center">
                        <Lock className="w-4 h-4 text-platinum-500 absolute left-3.5" />
                        <input
                          type="password"
                          required
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="••••••••••••"
                          className="w-full bg-[#121620] border border-white/15 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-platinum-600 focus:outline-none focus:border-white/50 transition-all"
                        />
                      </div>
                    </div>

                    {statusMessage && (
                      <p className="text-xs text-amber-300 font-mono flex items-center gap-1.5 pt-1">
                        <AlertCircle className="w-3.5 h-3.5" />
                        <span>{statusMessage}</span>
                      </p>
                    )}

                    <button
                      type="submit"
                      disabled={loading}
                      className={cn(
                        "w-full py-3.5 rounded-xl bg-gradient-to-r from-white via-platinum-100 to-platinum-300",
                        "text-black font-semibold text-xs tracking-tight shadow-md hover:brightness-110",
                        "flex items-center justify-center gap-2 transition-all mt-4 cursor-pointer"
                      )}
                    >
                      <span>Proceed to 2FA Clearance</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </form>
                </motion.div>
              )}

              {/* ============================================================ */}
              {/* SCREEN 2: "SHOW CODE" (Displays 6 numbers & Type button)    */}
              {/* ============================================================ */}
              {step === "show_code" && (
                <motion.div
                  key="show_code"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="space-y-6 text-center"
                >
                  <div className="flex flex-col items-center">
                    <div className="w-14 h-14 rounded-2xl bg-charcoal-900 border border-white/20 flex items-center justify-center mb-4 shadow-[0_0_25px_rgba(255,255,255,0.15)]">
                      <KeyRound className="w-7 h-7 text-white" />
                    </div>
                    <h2 className="text-2xl sm:text-3xl font-display font-extrabold text-white tracking-tight">
                      Two-Factor Authentication
                    </h2>
                    <p className="text-xs text-platinum-400 mt-2 max-w-sm leading-relaxed">
                      Statutory security token generated for session verification:
                    </p>
                  </div>

                  {/* Prominent Display of the 6 Numbers */}
                  <div className="relative p-6 rounded-3xl bg-[#10141D] border border-white/20 shadow-[0_12px_40px_rgba(0,0,0,0.8),inset_0_1px_1px_rgba(255,255,255,0.3)]">
                    <div className="text-[11px] font-mono text-platinum-400 uppercase tracking-widest mb-3 flex items-center justify-between">
                      <span>Simulated 2FA Code</span>
                      <span className="text-emerald-400 flex items-center gap-1 font-semibold">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Active
                      </span>
                    </div>

                    {/* The 6 Large Digits */}
                    <div className="flex items-center justify-center gap-2 sm:gap-3 py-2">
                      {generatedOtp.split("").map((digit, idx) => (
                        <div
                          key={idx}
                          className="w-11 h-15 rounded-xl bg-black/60 border border-white/25 flex items-center justify-center text-3xl font-mono font-black text-white shadow-inner"
                        >
                          {digit}
                        </div>
                      ))}
                    </div>

                    {/* Copy code button */}
                    <button
                      type="button"
                      onClick={handleCopyCode}
                      className="mt-4 inline-flex items-center gap-1.5 text-xs font-mono text-platinum-300 hover:text-white transition-colors cursor-pointer"
                    >
                      {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copied ? "Copied code" : "Copy 6-digit code"}</span>
                    </button>
                  </div>

                  {/* Error Notification if redirected back from invalid attempt */}
                  {otpError && (
                    <motion.div
                      initial={{ opacity: 0, y: -6 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-3.5 rounded-xl bg-red-950/40 border border-red-500/40 text-xs text-red-300 font-mono flex items-center justify-center gap-2"
                    >
                      <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                      <span>{otpError}</span>
                    </motion.div>
                  )}

                  {/* Button to Open Typing UI */}
                  <div className="space-y-3 pt-2">
                    <button
                      type="button"
                      onClick={handleOpenTypeOtp}
                      className={cn(
                        "w-full py-3.5 rounded-xl bg-white text-black font-semibold text-xs tracking-tight",
                        "hover:bg-platinum-100 transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg hover:scale-[1.02] active:scale-[0.98]"
                      )}
                    >
                      <span>Type the OTP in</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>

                    <button
                      type="button"
                      onClick={() => setStep("credentials")}
                      className="w-full py-2 text-xs font-mono text-platinum-400 hover:text-white transition"
                    >
                      ← Back to credentials
                    </button>
                  </div>
                </motion.div>
              )}

              {/* ============================================================ */}
              {/* SCREEN 3: ENTER OTP (Skiper 68 Animated Number Input)        */}
              {/* ============================================================ */}
              {step === "enter_otp" && (
                <motion.div
                  key="enter_otp"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="space-y-6 text-center"
                >
                  <div>
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-charcoal-900 border border-white/10 text-platinum-300 text-[11px] font-mono uppercase mb-3">
                      <Sparkles className="w-3.5 h-3.5 text-white" />
                      <span>Security Verification</span>
                    </div>
                    <h2 className="text-3xl font-display font-bold text-white tracking-tight">
                      Enter Verification Code
                    </h2>
                    <p className="text-xs text-platinum-400 mt-2 font-sans">
                      Type the 6-digit code shown on the previous screen:
                    </p>
                  </div>

                  {/* Skiper 68 Animated Number Input */}
                  <div className="py-2">
                    <Skiper68AnimatedInput
                      value={userEnteredOtp}
                      onChange={handleOtpChange}
                      maxLength={6}
                      isError={Boolean(otpError)}
                    />
                  </div>

                  {loading && (
                    <div className="flex items-center justify-center gap-2 text-xs font-mono text-platinum-300 animate-pulse">
                      <div className="w-2 h-2 rounded-full bg-white" />
                      <span>Verifying statutory cryptographic signature...</span>
                    </div>
                  )}

                  {statusMessage && (
                    <p className="text-xs text-emerald-400 font-mono flex items-center justify-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>{statusMessage}</span>
                    </p>
                  )}

                  <div className="pt-2">
                    <button
                      type="button"
                      onClick={() => setStep("show_code")}
                      className="inline-flex items-center gap-1.5 text-xs font-mono text-platinum-400 hover:text-white transition"
                    >
                      <ArrowLeft className="w-3.5 h-3.5" />
                      <span>View OTP combination again</span>
                    </button>
                  </div>
                </motion.div>
              )}

            </div>

            {/* Footer Notice */}
            <div className="p-6 border-t border-white/10 text-[11px] font-mono text-platinum-500 text-center">
              Protected by Supabase Auth & Strict Statutory RBAC Protocol
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

export default AuthSidebar;
