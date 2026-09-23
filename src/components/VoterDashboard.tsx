import React from 'react';
import { Voter, AppState } from '../types';
import { ShieldCheck, Vote, Award, MapPin, CheckCircle2, QrCode, FileText, ArrowRight, Clock, AlertTriangle, Fingerprint } from 'lucide-react';

interface VoterDashboardProps {
  voter: Voter;
  setState: (state: AppState) => void;
}

export const VoterDashboard: React.FC<VoterDashboardProps> = ({ voter, setState }) => {
  return (
    <div className="max-w-5xl mx-auto px-4 py-8 sm:py-12 space-y-8">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 text-xs font-bold uppercase tracking-wider mb-2">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            Verified Electoral Identity
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Welcome, {voter.name}
          </h1>
          <p className="text-slate-500 text-sm font-medium mt-1">
            You are enrolled in the official electoral roll for <span className="font-bold text-slate-800">{voter.constituency}</span> constituency, {voter.state}.
          </p>
        </div>

        <div>
          {voter.hasVoted ? (
            <div className="px-4 py-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold">
                ✓
              </div>
              <div>
                <div className="text-xs font-extrabold uppercase tracking-wider">Ballot Cast</div>
                <div className="text-[11px] text-emerald-700">Digital Ink Applied</div>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setState(AppState.VOTING_BOOTH)}
              className="w-full sm:w-auto px-8 py-4 rounded-2xl font-black text-sm uppercase tracking-wider text-white bg-orange-600 hover:bg-orange-700 active:scale-[0.99] transition-all shadow-lg shadow-orange-500/20 flex items-center justify-center gap-2 cursor-pointer"
            >
              <Vote className="w-5 h-5" />
              <span>Proceed to Official Ballot</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      <div className="grid lg:grid-cols-12 gap-8">
        {/* Left Column: Authentic Digital EPIC Card */}
        <div className="lg:col-span-6 space-y-4">
          <div className="text-xs font-extrabold uppercase tracking-wider text-slate-500 flex items-center justify-between">
            <span>Digital Elector Photo Identity Card (EPIC)</span>
            <span className="text-[10px] text-emerald-600 font-mono font-bold">● DIGITALLY VERIFIED</span>
          </div>

          <div className="bg-gradient-to-b from-white via-slate-50 to-orange-50/30 rounded-3xl border-2 border-slate-300 shadow-xl overflow-hidden relative">
            {/* Card Header */}
            <div className="bg-gradient-to-r from-orange-500 via-white to-emerald-600 p-1">
              <div className="bg-slate-900 text-white px-4 py-3 rounded-t-[20px] flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-full bg-white text-slate-900 flex items-center justify-center font-black text-sm">
                    🇮🇳
                  </div>
                  <div>
                    <div className="text-[10px] font-bold text-orange-400 uppercase tracking-widest leading-tight">
                      भारत निर्वाचन आयोग
                    </div>
                    <div className="text-xs font-extrabold tracking-tight">
                      ELECTION COMMISSION OF INDIA
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-[9px] font-mono text-slate-400 uppercase">CARD SERIAL</div>
                  <div className="text-xs font-mono font-black text-orange-400">{voter.voterId}</div>
                </div>
              </div>
            </div>

            {/* Card Body */}
            <div className="p-6 space-y-5">
              <div className="flex gap-5 items-start">
                {/* Photo with ECI watermark simulation */}
                <div className="relative shrink-0">
                  <div className="w-28 h-36 rounded-2xl bg-slate-200 border-2 border-slate-300 overflow-hidden shadow-inner flex flex-col items-center justify-center">
                    <img
                      src={`https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(voter.name)}&backgroundColor=0f172a&textColor=ffffff`}
                      alt={voter.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full bg-gradient-to-br from-amber-400 to-yellow-600 border-2 border-white shadow-md flex items-center justify-center text-[10px] font-black text-slate-900" title="ECI Hologram Seal">
                    🏛️
                  </div>
                </div>

                {/* Voter Details */}
                <div className="flex-1 space-y-2 text-xs">
                  <div>
                    <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">
                      Elector's Name / निर्वाचक का नाम
                    </span>
                    <span className="text-base font-black text-slate-900 block">
                      {voter.name}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <div>
                      <span className="text-[9px] font-bold text-slate-400 uppercase block">Gender / लिंग</span>
                      <span className="font-bold text-slate-800">{voter.gender}</span>
                    </div>
                    <div>
                      <span className="text-[9px] font-bold text-slate-400 uppercase block">Age / आयु</span>
                      <span className="font-bold text-slate-800">{voter.age} Years</span>
                    </div>
                  </div>

                  <div className="pt-1">
                    <span className="text-[9px] font-bold text-slate-400 uppercase block">Constituency / निर्वाचन क्षेत्र</span>
                    <span className="font-extrabold text-slate-900 text-xs">
                      {voter.constituency} ({voter.state})
                    </span>
                  </div>
                </div>
              </div>

              {/* Polling Station Information Strip */}
              <div className="p-3.5 rounded-2xl bg-slate-100/90 border border-slate-200 space-y-1.5 text-xs">
                <div className="flex items-start gap-2">
                  <MapPin className="w-4 h-4 text-orange-600 shrink-0 mt-0.5" />
                  <div>
                    <div className="font-extrabold text-slate-800 text-[11px] uppercase tracking-wider">
                      Designated Polling Booth
                    </div>
                    <div className="text-slate-600 text-xs font-semibold">{voter.pollingBooth}</div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-200/80 text-[11px]">
                  <div>
                    <span className="text-slate-400 font-bold">Part No:</span>{' '}
                    <span className="font-mono font-bold text-slate-800">{voter.partNumber}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 font-bold">Serial in Roll:</span>{' '}
                    <span className="font-mono font-bold text-slate-800">#{voter.serialNumber}</span>
                  </div>
                </div>
              </div>

              {/* Card Footer Barcode representation */}
              <div className="pt-1 flex items-center justify-between text-slate-400 text-[10px] font-mono">
                <div className="flex items-center gap-1.5 text-slate-500">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  <span>ECI Anti-Counterfeit Micro-Print 2026</span>
                </div>
                <div className="tracking-[0.25em] font-bold text-slate-600">
                  ||| | |||| || ||| |||||
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Voting Action & Guidelines */}
        <div className="lg:col-span-6 space-y-6">
          <div className="text-xs font-extrabold uppercase tracking-wider text-slate-500">
            Voting Booth Guidelines & Rights
          </div>

          <div className="bg-white p-6 sm:p-7 rounded-3xl border border-slate-200 shadow-sm space-y-6">
            <div className="flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-2xl bg-orange-100 text-orange-700 flex items-center justify-center shrink-0">
                <Fingerprint className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-slate-900">
                  Absolute Ballot Secrecy (Article 326)
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 mt-1 leading-relaxed">
                  Your identity qualifies you to vote, but your ballot selection is decoupled and cryptographically blinded. The election authorities cannot know whom you vote for.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-slate-900">
                  7-Second VVPAT Verification Window
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 mt-1 leading-relaxed">
                  After pressing the candidate's blue button on the EVM, an official VVPAT paper slip will appear behind the transparent viewing window for exactly 7 seconds before dropping into the sealed ballot box.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-2xl bg-blue-100 text-blue-700 flex items-center justify-center shrink-0">
                <Award className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-slate-900">
                  Digital Indelible Ink & Audit Receipt
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 mt-1 leading-relaxed">
                  Upon completion, you will receive a digital certificate with the indelible voter ink mark and a cryptographic SHA-256 transaction hash to independently verify that your vote was counted.
                </p>
              </div>
            </div>

            {/* Main Action Bar */}
            <div className="pt-4 border-t border-slate-100">
              {!voter.hasVoted ? (
                <button
                  onClick={() => setState(AppState.VOTING_BOOTH)}
                  className="w-full py-4 px-6 rounded-2xl font-black text-sm sm:text-base uppercase tracking-wider text-white bg-slate-900 hover:bg-slate-800 active:scale-[0.99] transition-all shadow-lg flex items-center justify-center gap-3 cursor-pointer"
                >
                  <Vote className="w-5 h-5 text-orange-400" />
                  <span>Enter Polling Booth (Cast Vote)</span>
                </button>
              ) : (
                <div className="space-y-3">
                  <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-center">
                    <p className="text-xs font-bold text-emerald-800 flex items-center justify-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      You have successfully exercised your democratic franchise!
                    </p>
                  </div>
                  <div className="flex gap-3">
                    <button
                      onClick={() => setState(AppState.CONFIRMATION)}
                      className="flex-1 py-3 px-4 rounded-xl text-xs font-extrabold bg-slate-900 text-white hover:bg-slate-800 transition-colors text-center"
                    >
                      View Digital Slip
                    </button>
                    <button
                      onClick={() => setState(AppState.RESULTS)}
                      className="flex-1 py-3 px-4 rounded-xl text-xs font-extrabold bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 transition-colors text-center"
                    >
                      Live Seat Tally
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
