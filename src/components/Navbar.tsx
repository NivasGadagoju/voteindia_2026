import React from 'react';
import { AppState, Voter } from '../types';
import { ShieldCheck, Vote, BarChart3, Search, UserCheck, LogOut, Radio, HelpCircle } from 'lucide-react';

interface NavbarProps {
  state: AppState;
  setState: (state: AppState) => void;
  voter: Voter | null;
  onLogout: () => void;
  onOpenAssistant: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  state,
  setState,
  voter,
  onLogout,
  onOpenAssistant,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur border-b border-slate-200 shadow-sm">
      {/* Top Tricolor Strip */}
      <div className="h-1.5 w-full bg-gradient-to-r from-orange-500 via-white to-emerald-600"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="h-20 flex items-center justify-between">
          {/* Brand Logo & ECI Mark */}
          <div
            onClick={() => setState(voter ? AppState.DASHBOARD : AppState.AUTH)}
            className="flex items-center gap-3.5 cursor-pointer group"
          >
            <div className="relative w-12 h-12 rounded-xl bg-slate-900 flex items-center justify-center text-white shadow-md group-hover:scale-105 transition-transform overflow-hidden border border-slate-800">
              <div className="absolute inset-0 bg-gradient-to-br from-orange-500/20 via-transparent to-emerald-500/20"></div>
              <span className="text-2xl font-black tracking-tighter select-none">🇮🇳</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-black text-xl text-slate-900 tracking-tight">
                  Vote<span className="text-orange-500">India</span>
                </span>
                <span className="px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-widest bg-orange-100 text-orange-700 rounded-full border border-orange-200">
                  2026 General Elections
                </span>
              </div>
              <p className="text-[11px] font-semibold text-slate-500 flex items-center gap-1.5">
                <span>भारत निर्वाचन आयोग</span>
                <span className="text-slate-300">•</span>
                <span>Election Commission of India Portal</span>
              </p>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-1 bg-slate-100/80 p-1.5 rounded-2xl border border-slate-200/80">
            {voter && (
              <>
                <button
                  onClick={() => setState(AppState.DASHBOARD)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                    state === AppState.DASHBOARD
                      ? 'bg-white text-slate-900 shadow-sm'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
                  }`}
                >
                  <UserCheck className="w-3.5 h-3.5 text-orange-500" />
                  Voter Identity
                </button>

                <button
                  onClick={() => setState(AppState.VOTING_BOOTH)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                    state === AppState.VOTING_BOOTH
                      ? 'bg-white text-slate-900 shadow-sm'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
                  }`}
                >
                  <Vote className="w-3.5 h-3.5 text-emerald-600" />
                  Official Ballot (EVM)
                </button>
              </>
            )}

            <button
              onClick={() => setState(AppState.RESULTS)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                state === AppState.RESULTS
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5 text-blue-600" />
              Live Tally (543 Seats)
            </button>

            <button
              onClick={() => setState(AppState.VERIFY_RECEIPT)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                state === AppState.VERIFY_RECEIPT
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
              }`}
            >
              <Search className="w-3.5 h-3.5 text-purple-600" />
              Verify Audit Ledger
            </button>
          </nav>

          {/* Right Action Profile & Status */}
          <div className="flex items-center gap-3">
            {/* Live Security Pill */}
            <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200/80 text-[11px] font-bold">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              SHA-256 Sealed
            </div>

            {/* AI Sahayak Button */}
            <button
              onClick={onOpenAssistant}
              className="px-3.5 py-2 rounded-xl text-xs font-bold bg-orange-50 text-orange-700 hover:bg-orange-100 border border-orange-200 flex items-center gap-1.5 transition-colors"
              title="VoteIndia Sahayak AI Assistant"
            >
              <HelpCircle className="w-4 h-4 text-orange-600" />
              <span className="hidden sm:inline">AI Sahayak</span>
            </button>

            {/* Voter Status or Login */}
            {voter ? (
              <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
                <div className="text-right hidden sm:block">
                  <div className="text-xs font-extrabold text-slate-900 leading-tight">
                    {voter.name}
                  </div>
                  <div className="text-[10px] font-mono text-slate-500">
                    {voter.voterId} • {voter.constituency}
                  </div>
                </div>

                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-emerald-600 p-0.5 shadow-sm">
                  <div className="w-full h-full bg-white rounded-[10px] flex items-center justify-center font-black text-xs text-slate-800">
                    {voter.name.slice(0, 2).toUpperCase()}
                  </div>
                </div>

                <button
                  onClick={onLogout}
                  className="p-2 rounded-xl text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                  title="Sign out / Switch Voter"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => setState(AppState.AUTH)}
                className="px-4 py-2.5 rounded-xl text-xs font-extrabold bg-slate-900 text-white hover:bg-slate-800 transition-colors shadow-sm flex items-center gap-1.5"
              >
                <UserCheck className="w-4 h-4 text-orange-400" />
                Elector Login
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
