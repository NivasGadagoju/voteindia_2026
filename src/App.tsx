import React, { useState } from 'react';
import { AppState, Voter, VVPATReceipt } from './types';
import { Navbar } from './components/Navbar';
import { VoterAuth } from './components/VoterAuth';
import { VoterDashboard } from './components/VoterDashboard';
import { VotingBallot } from './components/VotingBallot';
import { ConfirmationScreen } from './components/ConfirmationScreen';
import { Results } from './components/Results';
import { VerifyReceipt } from './components/VerifyReceipt';
import { AIAssistant } from './components/AIAssistant';
import { ShieldCheck, Phone, Mail, Award, ExternalLink } from 'lucide-react';

export default function App() {
  const [state, setState] = useState<AppState>(AppState.AUTH);
  const [voter, setVoter] = useState<Voter | null>(null);
  const [receipt, setReceipt] = useState<VVPATReceipt | null>(null);
  const [assistantOpen, setAssistantOpen] = useState(false);

  const handleAuthenticated = (authenticatedVoter: Voter) => {
    setVoter(authenticatedVoter);
    setState(AppState.DASHBOARD);
  };

  const handleVoteRecorded = (newReceipt: VVPATReceipt) => {
    setReceipt(newReceipt);
    if (voter) {
      setVoter({
        ...voter,
        hasVoted: true,
        votedAt: newReceipt.timestamp,
        receiptNumber: newReceipt.receiptId,
        txHash: newReceipt.sha256Hash,
      });
    }
    setState(AppState.CONFIRMATION);
  };

  const handleLogout = () => {
    setVoter(null);
    setReceipt(null);
    setState(AppState.AUTH);
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-100/60 font-['Plus_Jakarta_Sans',sans-serif] text-slate-900 selection:bg-orange-500 selection:text-white">
      {/* Navigation Bar */}
      <Navbar
        state={state}
        setState={setState}
        voter={voter}
        onLogout={handleLogout}
        onOpenAssistant={() => setAssistantOpen(true)}
      />

      {/* Main Content Body */}
      <main className="flex-1">
        {state === AppState.AUTH && (
          <VoterAuth onAuthenticated={handleAuthenticated} />
        )}

        {state === AppState.DASHBOARD && voter && (
          <VoterDashboard
            voter={voter}
            setState={setState}
          />
        )}

        {state === AppState.VOTING_BOOTH && voter && (
          <VotingBallot
            voter={voter}
            onVoteRecorded={handleVoteRecorded}
            onBackToDashboard={() => setState(AppState.DASHBOARD)}
          />
        )}

        {state === AppState.CONFIRMATION && receipt && voter && (
          <ConfirmationScreen
            receipt={receipt}
            voter={voter}
            setState={setState}
          />
        )}

        {state === AppState.RESULTS && (
          <Results />
        )}

        {state === AppState.VERIFY_RECEIPT && (
          <VerifyReceipt />
        )}
      </main>

      {/* Official ECI Civic Footer */}
      <footer className="bg-slate-900 text-white mt-auto border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pb-10 border-b border-slate-800">
            {/* ECI Description */}
            <div className="md:col-span-2 space-y-3">
              <div className="flex items-center gap-2.5">
                <span className="text-2xl">🇮🇳</span>
                <div>
                  <h3 className="text-base font-black tracking-tight">
                    Election Commission of India (ECI)
                  </h3>
                  <p className="text-[11px] text-orange-400 font-bold uppercase tracking-widest">
                    Digital Ballot Portal • General Elections 2026
                  </p>
                </div>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed max-w-md">
                VoteIndia 2026 provides secure digital voter authentication and cryptographic VVPAT ballot verification. Voter identity is verified under Article 326 of the Constitution, while vote choice remains 100% anonymized and tamper-evident.
              </p>
              <div className="flex items-center gap-2 text-xs text-emerald-400 font-mono font-bold">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>End-to-End Cryptographic SHA-256 Audit Trail</span>
              </div>
            </div>

            {/* Voter Awareness & Portals */}
            <div className="space-y-3">
              <h4 className="text-xs font-black uppercase tracking-wider text-orange-400">
                Electoral Portals
              </h4>
              <ul className="space-y-2 text-xs text-slate-400 font-medium">
                <li>
                  <button onClick={() => setState(AppState.RESULTS)} className="hover:text-white transition-colors">
                    Lok Sabha Seat Tally (543)
                  </button>
                </li>
                <li>
                  <button onClick={() => setState(AppState.VERIFY_RECEIPT)} className="hover:text-white transition-colors">
                    Public Audit Ledger Verification
                  </button>
                </li>
                <li>
                  <a href="https://voters.eci.gov.in" target="_blank" rel="noreferrer" className="hover:text-white transition-colors flex items-center gap-1">
                    <span>NVSP Voter Services Portal</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </li>
                <li>
                  <a href="https://cvigil.eci.gov.in" target="_blank" rel="noreferrer" className="hover:text-white transition-colors flex items-center gap-1">
                    <span>cVIGIL Citizen Reporting</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </li>
              </ul>
            </div>

            {/* ECI Helpline & SVEEP */}
            <div className="space-y-3">
              <h4 className="text-xs font-black uppercase tracking-wider text-emerald-400">
                Voter Helpline & Support
              </h4>
              <ul className="space-y-2 text-xs text-slate-400">
                <li className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-orange-400 shrink-0" />
                  <span>National Toll-Free: <strong>1950</strong></span>
                </li>
                <li className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>complaints@eci.gov.in</span>
                </li>
                <li className="text-[11px] text-slate-400 leading-relaxed pt-1">
                  SVEEP (Systematic Voters' Education and Electoral Participation) - "No Voter to be Left Behind".
                </li>
              </ul>
            </div>
          </div>

          {/* Copyright & Disclaimer */}
          <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
            <div>
              © 2026 Election Commission of India. All rights reserved.
            </div>
            <div className="flex gap-4">
              <span>Nirvachan Sadan, Ashoka Road, New Delhi 110001</span>
            </div>
          </div>
        </div>
      </footer>

      {/* AI Election Assistant (VoteIndia Sahayak) */}
      <AIAssistant
        isOpen={assistantOpen}
        onToggle={() => setAssistantOpen(!assistantOpen)}
        voter={voter}
      />
    </div>
  );
}
