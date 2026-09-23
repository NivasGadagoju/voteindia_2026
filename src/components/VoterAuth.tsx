import React, { useState, useRef, useEffect } from 'react';
import { Voter } from '../types';
import { verifyVoter } from '../services/api';
import { ShieldCheck, Camera, Smartphone, Award, Lock, Sparkles, RefreshCw, CheckCircle2, AlertCircle, UserCheck } from 'lucide-react';

interface VoterAuthProps {
  onAuthenticated: (voter: Voter) => void;
}

export const VoterAuth: React.FC<VoterAuthProps> = ({ onAuthenticated }) => {
  const [tab, setTab] = useState<'EPIC' | 'BIOMETRIC' | 'AADHAAR'>('EPIC');
  const [voterId, setVoterId] = useState('HYD4928172');
  const [constituency, setConstituency] = useState('Hyderabad');
  const [otp, setOtp] = useState('892410');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraScanned, setCameraScanned] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Quick preset profiles
  const DEMO_VOTERS = [
    { name: 'Gadagoju Sainivas', epic: 'HYD4928172', constituency: 'Hyderabad', state: 'Telangana' },
    { name: 'Priya Sharma', epic: 'DEL8839201', constituency: 'New Delhi', state: 'NCT of Delhi' },
    { name: 'Narendra Tripathi', epic: 'VAR9021482', constituency: 'Varanasi', state: 'Uttar Pradesh' },
  ];

  const handleSelectPreset = (preset: typeof DEMO_VOTERS[0]) => {
    setVoterId(preset.epic);
    setConstituency(preset.constituency);
    setError('');
  };

  // Camera handling for Biometric tab
  const startCamera = async () => {
    try {
      setError('');
      setCameraScanned(false);
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 640 }, height: { ideal: 480 }, facingMode: 'user' },
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setCameraActive(true);
    } catch (err: any) {
      console.warn('Camera access prevented or not available:', err);
      // Fallback: mock camera scanner visual
      setCameraActive(true);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setCameraActive(false);
  };

  useEffect(() => {
    if (tab === 'BIOMETRIC') {
      startCamera();
    } else {
      stopCamera();
    }
    return () => {
      stopCamera();
    };
  }, [tab]);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const cleanId = voterId.trim().toUpperCase();
    if (cleanId.length < 6) {
      setError('Please enter a valid 10-character EPIC Voter ID (e.g. HYD4928172 or ABC1234567).');
      return;
    }

    if (tab === 'AADHAAR' && otp.length !== 6) {
      setError('Please enter the 6-digit Aadhaar OTP.');
      return;
    }

    setLoading(true);
    try {
      const voter = await verifyVoter({
        voterId: cleanId,
        biometricVerified: tab === 'BIOMETRIC',
        constituencyPreference: constituency,
      });

      onAuthenticated(voter);
    } catch (err: any) {
      setError(err.message || 'Verification service error. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 sm:py-12">
      {/* Top Banner Notice */}
      <div className="bg-gradient-to-r from-orange-50 via-white to-emerald-50 border border-slate-200 rounded-3xl p-6 sm:p-8 mb-8 shadow-sm text-center relative overflow-hidden">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-100 text-orange-800 text-xs font-bold uppercase tracking-wider mb-3">
          <Award className="w-3.5 h-3.5" />
          General Elections 2026 • Official Digital Gateway
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight mb-2">
          Elector Identity Authentication
        </h1>
        <p className="text-slate-600 max-w-xl mx-auto text-sm sm:text-base font-medium">
          Verify your identity through the National Voter Services Electoral Roll (ECI) database to enter the secure virtual polling booth.
        </p>

        {/* 1-Click Demo Profiles */}
        <div className="mt-6 pt-6 border-t border-slate-200/80">
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2.5 flex items-center justify-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-orange-500" />
            Quick Demo Electors (1-Click Test):
          </div>
          <div className="flex flex-wrap justify-center gap-2.5">
            {DEMO_VOTERS.map((preset) => (
              <button
                key={preset.epic}
                type="button"
                onClick={() => handleSelectPreset(preset)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all border ${
                  voterId === preset.epic
                    ? 'bg-slate-900 text-white border-slate-900 shadow-sm scale-105'
                    : 'bg-white text-slate-700 border-slate-200 hover:border-orange-400 hover:bg-orange-50/50'
                }`}
              >
                {preset.name} ({preset.constituency})
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Authentication Card */}
      <div className="bg-white rounded-3xl shadow-xl border border-slate-200 overflow-hidden">
        {/* Verification Method Tabs */}
        <div className="grid grid-cols-3 bg-slate-50 border-b border-slate-200 p-2 gap-2 text-center text-xs font-bold">
          <button
            type="button"
            onClick={() => setTab('EPIC')}
            className={`py-3 px-3 rounded-2xl transition-all flex items-center justify-center gap-2 ${
              tab === 'EPIC'
                ? 'bg-white text-slate-900 shadow-sm border border-slate-200/80'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <UserCheck className="w-4 h-4 text-orange-500" />
            <span className="hidden sm:inline">EPIC Card</span>
            <span>Digital ID</span>
          </button>

          <button
            type="button"
            onClick={() => setTab('BIOMETRIC')}
            className={`py-3 px-3 rounded-2xl transition-all flex items-center justify-center gap-2 ${
              tab === 'BIOMETRIC'
                ? 'bg-white text-slate-900 shadow-sm border border-slate-200/80'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Camera className="w-4 h-4 text-emerald-600" />
            <span className="hidden sm:inline">Facial</span>
            <span>Biometric</span>
          </button>

          <button
            type="button"
            onClick={() => setTab('AADHAAR')}
            className={`py-3 px-3 rounded-2xl transition-all flex items-center justify-center gap-2 ${
              tab === 'AADHAAR'
                ? 'bg-white text-slate-900 shadow-sm border border-slate-200/80'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Smartphone className="w-4 h-4 text-blue-600" />
            <span className="hidden sm:inline">Aadhaar Linked</span>
            <span>OTP</span>
          </button>
        </div>

        {/* Verification Form */}
        <form onSubmit={handleVerify} className="p-6 sm:p-10 space-y-6">
          {/* EPIC Number Input */}
          <div>
            <label className="block text-xs font-extrabold text-slate-700 uppercase tracking-wider mb-2">
              Elector's Photo Identity Card (EPIC) Number
            </label>
            <div className="relative">
              <input
                type="text"
                value={voterId}
                onChange={(e) => setVoterId(e.target.value.toUpperCase())}
                placeholder="e.g. HYD4928172 or ABC1234567"
                maxLength={12}
                className="w-full px-4 py-3.5 rounded-2xl border border-slate-300 font-mono text-base font-bold tracking-wider text-slate-900 uppercase focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-all shadow-inner"
                required
              />
              <div className="absolute right-3.5 top-3.5">
                <span className="px-2 py-0.5 rounded-md bg-slate-100 text-[11px] font-mono text-slate-600 border border-slate-200">
                  {voterId.length}/10 chars
                </span>
              </div>
            </div>
            <p className="text-[11px] text-slate-500 mt-1.5 flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              Standard ECI format: 3 uppercase letters followed by 7 numerals.
            </p>
          </div>

          {/* Constituency Selector */}
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-extrabold text-slate-700 uppercase tracking-wider mb-2">
                Parliamentary Constituency
              </label>
              <select
                value={constituency}
                onChange={(e) => setConstituency(e.target.value)}
                className="w-full px-4 py-3 rounded-2xl border border-slate-300 font-bold text-slate-900 bg-white focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-all"
              >
                <option value="Hyderabad">Hyderabad (Telangana)</option>
                <option value="New Delhi">New Delhi (NCT of Delhi)</option>
                <option value="Varanasi">Varanasi (Uttar Pradesh)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-extrabold text-slate-700 uppercase tracking-wider mb-2">
                Election Phase
              </label>
              <div className="px-4 py-3 rounded-2xl border border-slate-200 bg-slate-50 text-slate-700 font-bold text-sm flex items-center justify-between">
                <span>Phase 7 (2026 General Elections)</span>
                <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-extrabold uppercase">
                  Polls Open
                </span>
              </div>
            </div>
          </div>

          {/* Biometric Face Scanner Simulation */}
          {tab === 'BIOMETRIC' && (
            <div className="p-5 rounded-3xl bg-slate-900 text-white space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Camera className="w-4 h-4 text-emerald-400" />
                  <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                    Live Facial Liveness Detection
                  </span>
                </div>
                <span className="text-[11px] font-mono text-slate-400">ECI Standard STQC Level-1</span>
              </div>

              <div className="relative aspect-video max-h-56 bg-slate-800 rounded-2xl overflow-hidden border border-slate-700 flex items-center justify-center">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover"
                />

                {/* Face Target Scanner HUD */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="w-36 h-44 rounded-[40px] border-2 border-dashed border-emerald-400/80 flex flex-col items-center justify-between p-2">
                    <span className="text-[9px] font-mono uppercase bg-emerald-500/30 px-1.5 py-0.5 rounded text-emerald-200">
                      Align Face
                    </span>
                    <div className="w-full h-0.5 bg-emerald-400 shadow-[0_0_8px_#34d399] animate-pulse"></div>
                    <span className="text-[9px] font-mono uppercase bg-emerald-500/30 px-1.5 py-0.5 rounded text-emerald-200">
                      Ready
                    </span>
                  </div>
                </div>
              </div>
              <p className="text-xs text-slate-400 text-center">
                Position your face within the frame. Matches your digital photograph on the Electoral Roll.
              </p>
            </div>
          )}

          {/* Aadhaar OTP Input */}
          {tab === 'AADHAAR' && (
            <div className="p-5 rounded-2xl bg-blue-50/70 border border-blue-200 space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-extrabold text-blue-900 uppercase tracking-wider">
                  6-Digit OTP sent to Aadhaar Linked Mobile (XXXX-XXX-892)
                </label>
                <span className="text-[10px] font-bold text-blue-700">Demo Code: 892410</span>
              </div>
              <input
                type="text"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                placeholder="892410"
                maxLength={6}
                className="w-full px-4 py-3 rounded-xl border border-blue-300 font-mono text-xl font-bold tracking-[0.3em] text-center text-blue-900 focus:ring-2 focus:ring-blue-500 outline-none bg-white"
              />
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="p-4 rounded-2xl bg-red-50 text-red-700 text-xs sm:text-sm font-semibold border border-red-200 flex items-start gap-2.5">
              <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
              <div>{error}</div>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 px-6 rounded-2xl font-black text-base uppercase tracking-wider text-white bg-slate-900 hover:bg-slate-800 active:scale-[0.99] transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg flex items-center justify-center gap-3 cursor-pointer"
          >
            {loading ? (
              <>
                <RefreshCw className="w-5 h-5 animate-spin text-orange-400" />
                <span>Authenticating with ECI Roll...</span>
              </>
            ) : (
              <>
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                <span>Authenticate & Access Ballot</span>
              </>
            )}
          </button>

          {/* Legal & Security Badge */}
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500 border-t border-slate-100">
            <div className="flex items-center gap-2">
              <Lock className="w-3.5 h-3.5 text-emerald-600" />
              <span>Ballot Secrecy protected by Article 326 of the Constitution</span>
            </div>
            <div className="text-[11px] font-mono text-slate-400">
              ECI Toll-Free Voter Helpline: 1950
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
