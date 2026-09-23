import React, { useState, useEffect, useRef } from 'react';
import { Candidate, Voter, VVPATReceipt } from '../types';
import { getCandidates, castVote } from '../services/api';
import { playEVMBeep, playPrinterSound } from '../utils/audio';
import { ShieldCheck, Vote, CheckCircle2, ChevronDown, ChevronUp, AlertCircle, Volume2, VolumeX, Eye, ArrowLeft } from 'lucide-react';

interface VotingBallotProps {
  voter: Voter;
  onVoteRecorded: (receipt: VVPATReceipt) => void;
  onBackToDashboard: () => void;
}

export const VotingBallot: React.FC<VotingBallotProps> = ({
  voter,
  onVoteRecorded,
  onBackToDashboard,
}) => {
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null);
  const [expandedCandidateId, setExpandedCandidateId] = useState<string | null>(null);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [error, setError] = useState('');

  // Confirmation and VVPAT state
  const [isConfirming, setIsConfirming] = useState(false);
  const [vvpatActive, setVvpatActive] = useState(false);
  const [vvpatCountdown, setVvpatCountdown] = useState(7);
  const [slipDropped, setSlipDropped] = useState(false);
  const [pendingReceipt, setPendingReceipt] = useState<VVPATReceipt | null>(null);

  const countdownIntervalRef = useRef<number | null>(null);

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        const list = await getCandidates(voter.constituency);
        setCandidates(list);
      } catch (err: any) {
        setError('Failed to load official candidates list.');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [voter.constituency]);

  // Handle vote button press
  const handleInitiateVote = (candidate: Candidate) => {
    setSelectedCandidate(candidate);
    setIsConfirming(true);
  };

  // Execute confirmed vote -> Starts VVPAT printer & 7s countdown
  const handleConfirmVote = async () => {
    if (!selectedCandidate) return;
    setIsConfirming(false);
    setVvpatActive(true);
    setVvpatCountdown(7);
    setSlipDropped(false);

    if (soundEnabled) {
      playPrinterSound();
      // Delay beep slightly to emulate EVM button confirmation
      setTimeout(() => {
        playEVMBeep();
      }, 500);
    }

    try {
      const response = await castVote({
        voterId: voter.voterId,
        candidateId: selectedCandidate.id,
        candidateName: selectedCandidate.name,
        candidateParty: selectedCandidate.party,
        symbolName: selectedCandidate.symbolName,
        symbol: selectedCandidate.symbol,
        constituency: voter.constituency,
        state: voter.state,
      });

      setPendingReceipt(response.receipt);
    } catch (err: any) {
      setError(err.message || 'Error recording vote.');
    }

    // 7-second countdown as mandated by Election Commission of India Conduct of Election Rules
    let timer = 7;
    countdownIntervalRef.current = window.setInterval(() => {
      timer -= 1;
      setVvpatCountdown(timer);
      if (timer <= 0) {
        if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
        setSlipDropped(true);
      }
    }, 1000);
  };

  // Complete VVPAT sequence after slip drops
  const handleFinishVVPAT = () => {
    if (pendingReceipt) {
      onVoteRecorded(pendingReceipt);
    }
  };

  useEffect(() => {
    if (slipDropped && pendingReceipt) {
      const timeout = setTimeout(() => {
        onVoteRecorded(pendingReceipt);
      }, 1200);
      return () => clearTimeout(timeout);
    }
  }, [slipDropped, pendingReceipt, onVoteRecorded]);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-24 text-center space-y-4">
        <div className="w-14 h-14 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
        <h3 className="text-xl font-black text-slate-900">Loading Official Ballot Unit...</h3>
        <p className="text-slate-500 text-sm font-medium">
          Verifying security seal for {voter.constituency} Parliamentary Constituency
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 sm:py-12 space-y-6">
      {/* Top Header & Booth Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-3">
          <button
            onClick={onBackToDashboard}
            className="p-2 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors"
            title="Back to Dashboard"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-black uppercase tracking-wider text-orange-600">
                Official Ballot Unit (EVM-M3)
              </span>
              <span className="text-slate-300">•</span>
              <span className="text-xs font-bold text-slate-500">{voter.constituency} (PC)</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Cast Your Digital Vote
            </h1>
          </div>
        </div>

        {/* Audio Toggle & Ready Light */}
        <div className="flex items-center gap-3 self-end sm:self-center">
          <button
            type="button"
            onClick={() => setSoundEnabled(!soundEnabled)}
            className="p-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors flex items-center gap-1.5 text-xs font-bold"
            title={soundEnabled ? 'Mute EVM Sound' : 'Enable EVM Beep Sound'}
          >
            {soundEnabled ? (
              <>
                <Volume2 className="w-4 h-4 text-emerald-600" />
                <span className="hidden sm:inline">EVM Beep ON</span>
              </>
            ) : (
              <>
                <VolumeX className="w-4 h-4 text-slate-400" />
                <span className="hidden sm:inline">EVM Beep OFF</span>
              </>
            )}
          </button>

          <div className="px-3.5 py-1.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center gap-2 text-xs font-extrabold uppercase tracking-wider">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
            EVM Ready
          </div>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-2xl bg-red-50 text-red-700 text-sm font-semibold border border-red-200 flex items-center gap-2">
          <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* EVM Ballot Unit Machine Frame */}
      <div className="bg-slate-100 rounded-3xl p-3 sm:p-5 border-4 border-slate-300 shadow-2xl space-y-3">
        {/* Machine Head Status Bar */}
        <div className="bg-slate-800 text-white px-5 py-3 rounded-2xl flex items-center justify-between text-xs font-bold uppercase tracking-wider">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-emerald-400 shadow-[0_0_8px_#34d399]"></span>
            <span>Ready for Voting</span>
          </div>
          <div className="text-[11px] font-mono text-slate-400">
            EVM SL NO: BU-2026-HYD-9104
          </div>
        </div>

        {/* Candidate Rows (EVM Ballot Sheet) */}
        <div className="bg-white rounded-2xl border border-slate-300 divide-y divide-slate-200 overflow-hidden shadow-inner">
          {candidates.map((candidate) => {
            const isSelected = selectedCandidate?.id === candidate.id;
            const isExpanded = expandedCandidateId === candidate.id;

            return (
              <div
                key={candidate.id}
                className={`transition-colors ${
                  isSelected ? 'bg-orange-50/70' : 'hover:bg-slate-50/80'
                }`}
              >
                <div className="p-4 sm:p-5 flex items-center justify-between gap-3 sm:gap-4">
                  {/* Serial Number */}
                  <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-xl bg-slate-900 text-white font-mono font-black text-sm sm:text-base flex items-center justify-center shrink-0 shadow-sm">
                    {candidate.ballotNumber}
                  </div>

                  {/* Candidate Name & Party */}
                  <div className="flex-1 min-w-0 pr-2">
                    <div className="flex flex-wrap items-baseline gap-x-2">
                      <h3 className="text-base sm:text-lg font-black text-slate-900 tracking-tight truncate">
                        {candidate.name}
                      </h3>
                      {candidate.nameHindi && (
                        <span className="text-xs sm:text-sm font-semibold text-slate-500">
                          ({candidate.nameHindi})
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-xs sm:text-sm font-extrabold text-slate-700">
                        {candidate.party}
                      </span>
                      <span className="text-slate-300">•</span>
                      <span className="text-[11px] font-mono font-bold text-slate-500 uppercase">
                        {candidate.symbolName}
                      </span>
                    </div>

                    {/* Quick Candidate Profile Toggle */}
                    <button
                      type="button"
                      onClick={() => setExpandedCandidateId(isExpanded ? null : candidate.id)}
                      className="mt-2 text-[11px] font-bold text-orange-600 hover:text-orange-700 flex items-center gap-1 cursor-pointer"
                    >
                      <span>{isExpanded ? 'Hide Affidavit & Promises' : 'View Candidate Affidavit & Promises'}</span>
                      {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                    </button>
                  </div>

                  {/* Party Symbol Column */}
                  <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-center text-3xl sm:text-4xl shrink-0 shadow-inner select-none">
                    {candidate.symbol}
                  </div>

                  {/* EVM LED Indicator */}
                  <div className="flex items-center gap-2 pl-2">
                    <div
                      className={`w-3.5 h-3.5 rounded-full transition-all ${
                        isSelected
                          ? 'bg-red-600 shadow-[0_0_10px_#dc2626]'
                          : 'bg-slate-300'
                      }`}
                      title={isSelected ? 'Vote registered on EVM' : 'Inactive'}
                    ></div>

                    {/* Authentic Blue EVM Vote Button */}
                    <button
                      type="button"
                      onClick={() => handleInitiateVote(candidate)}
                      className="w-16 sm:w-20 h-12 sm:h-14 rounded-xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-black text-xs uppercase tracking-wider shadow-[0_4px_0_#1d4ed8] active:shadow-none active:translate-y-1 transition-all flex flex-col items-center justify-center gap-0.5 cursor-pointer"
                    >
                      <Vote className="w-4 h-4" />
                      <span className="text-[10px] font-extrabold">VOTE</span>
                    </button>
                  </div>
                </div>

                {/* Candidate Transparency Drawer */}
                {isExpanded && (
                  <div className="px-4 sm:px-6 pb-5 pt-2 bg-slate-50/90 border-t border-slate-200/80 space-y-3 text-xs animate-in fade-in duration-200">
                    <p className="text-slate-700 text-xs sm:text-sm leading-relaxed">{candidate.bio}</p>

                    <div className="grid sm:grid-cols-3 gap-2.5">
                      <div className="p-3 bg-white rounded-xl border border-slate-200">
                        <span className="text-[10px] font-bold text-slate-400 uppercase block">Education</span>
                        <span className="font-bold text-slate-800 text-xs">{candidate.education}</span>
                      </div>
                      <div className="p-3 bg-white rounded-xl border border-slate-200">
                        <span className="text-[10px] font-bold text-slate-400 uppercase block">Assets Declared (ECI)</span>
                        <span className="font-mono font-bold text-slate-800 text-xs">{candidate.assetsDeclared}</span>
                      </div>
                      <div className="p-3 bg-white rounded-xl border border-slate-200">
                        <span className="text-[10px] font-bold text-slate-400 uppercase block">Criminal Cases</span>
                        <span className="font-bold text-emerald-700 text-xs flex items-center gap-1">
                          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                          {candidate.criminalCases === 0 ? 'Clean Record (0 Cases)' : `${candidate.criminalCases} Cases Declared`}
                        </span>
                      </div>
                    </div>

                    <div>
                      <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block mb-1">
                        Key Manifesto Commitments
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {candidate.agenda.map((item, i) => (
                          <span
                            key={i}
                            className="px-2.5 py-1 rounded-lg bg-orange-100/70 text-orange-800 text-[11px] font-bold border border-orange-200/60"
                          >
                            ✓ {item}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Machine Foot Legend */}
        <div className="p-3 bg-slate-200/80 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] text-slate-600 font-medium">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-700" />
            <span>Conduct of Elections Rules, 1961 (Rule 49B) Verified</span>
          </div>
          <div className="font-mono text-slate-500">
            Press the blue button corresponding to your choice
          </div>
        </div>
      </div>

      {/* Confirmation Modal */}
      {isConfirming && selectedCandidate && (
        <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border-4 border-orange-500 animate-in fade-in zoom-in duration-200 space-y-6">
            <div className="text-center space-y-2">
              <div className="w-16 h-16 rounded-2xl bg-orange-100 text-orange-600 flex items-center justify-center mx-auto text-3xl shadow-inner">
                {selectedCandidate.symbol}
              </div>
              <h3 className="text-2xl font-black text-slate-900 tracking-tight">
                Confirm Your Vote
              </h3>
              <p className="text-slate-600 text-sm">
                You are about to cast your vote for:
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2 text-center">
              <div className="text-xl font-black text-slate-900">{selectedCandidate.name}</div>
              <div className="text-sm font-extrabold text-orange-600">{selectedCandidate.party}</div>
              <div className="text-xs text-slate-500 font-mono">
                Ballot Number #{selectedCandidate.ballotNumber} • Symbol: {selectedCandidate.symbolName}
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs font-semibold flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <span>
                Once cast, this action is <span className="font-bold underline">irreversible</span> and will be permanently sealed on the ECI audit log.
              </span>
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setIsConfirming(false)}
                className="flex-1 py-3.5 px-4 rounded-xl border border-slate-300 font-extrabold text-slate-700 hover:bg-slate-50 transition-colors text-sm"
              >
                Back to Ballot
              </button>
              <button
                type="button"
                onClick={handleConfirmVote}
                className="flex-1 py-3.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-black text-sm uppercase tracking-wider shadow-lg transition-colors flex items-center justify-center gap-2 cursor-pointer"
              >
                <Vote className="w-4 h-4 text-emerald-400" />
                <span>Confirm & Cast</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* VVPAT (Voter Verifiable Paper Audit Trail) 7-Second Slip Inspection Simulation */}
      {vvpatActive && selectedCandidate && (
        <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 text-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-slate-700 space-y-6 animate-in fade-in zoom-in duration-300">
            {/* VVPAT Machine Top Housing */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-orange-500 text-white font-black text-xs flex items-center justify-center">
                  VVPAT
                </div>
                <div>
                  <h4 className="text-sm font-black tracking-tight">ECI VVPAT Unit</h4>
                  <p className="text-[10px] text-slate-400 uppercase font-mono">Paper Audit Verification Window</p>
                </div>
              </div>
              <div className="text-right">
                <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded-full border border-emerald-800">
                  RULE 49M COMPLIANT
                </span>
              </div>
            </div>

            {/* VVPAT Transparent Glass Chamber */}
            <div className="relative h-64 bg-gradient-to-b from-slate-950 to-slate-900 rounded-2xl border-4 border-slate-600 p-4 overflow-hidden shadow-inner flex flex-col items-center justify-center">
              {/* Glass Reflection Highlight */}
              <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-transparent pointer-events-none"></div>

              {!slipDropped ? (
                /* Paper Slip Animating Down Behind Glass */
                <div className="w-56 bg-white text-slate-900 rounded-lg p-4 shadow-2xl border border-slate-300 space-y-2 text-center transform transition-transform duration-700 animate-in slide-in-from-top-12">
                  <div className="text-[10px] font-extrabold uppercase tracking-widest text-slate-500 border-b border-slate-200 pb-1">
                    ECI VVPAT SLIP 2026
                  </div>

                  <div className="flex items-center justify-between py-1">
                    <div className="font-mono font-black text-xl text-slate-900">
                      #{selectedCandidate.ballotNumber}
                    </div>
                    <div className="text-4xl select-none">{selectedCandidate.symbol}</div>
                  </div>

                  <div className="border-t border-slate-200 pt-1">
                    <div className="font-black text-sm text-slate-900 leading-tight">
                      {selectedCandidate.name}
                    </div>
                    <div className="text-xs font-bold text-orange-600 mt-0.5">
                      {selectedCandidate.party}
                    </div>
                  </div>

                  <div className="text-[9px] font-mono text-slate-400 pt-1">
                    TIME: {new Date().toLocaleTimeString('en-IN')}
                  </div>
                </div>
              ) : (
                /* Slip Dropped Notification */
                <div className="text-center space-y-2 animate-in zoom-in duration-300">
                  <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto text-xl">
                    ✓
                  </div>
                  <div className="text-sm font-black text-emerald-400">
                    Slip Dropped in Sealed Ballot Box
                  </div>
                  <p className="text-xs text-slate-400">
                    Your physical vote slip has been deposited into the tamper-proof chamber.
                  </p>
                </div>
              )}
            </div>

            {/* 7-Second Inspection Timer Countdown */}
            <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700 text-center space-y-1">
              <div className="text-xs font-extrabold text-orange-400 uppercase tracking-widest flex items-center justify-center gap-2">
                <Eye className="w-4 h-4 text-orange-400" />
                <span>Verify Your Candidate & Symbol on Slip</span>
              </div>
              <div className="text-2xl font-mono font-black text-white">
                {vvpatCountdown > 0 ? (
                  <span>Inspection closes in: {vvpatCountdown}s</span>
                ) : (
                  <span className="text-emerald-400">Vote Sealed Successfully!</span>
                )}
              </div>
              <p className="text-[11px] text-slate-400">
                Mandated by Supreme Court of India & ECI: 7-second visual verification window.
              </p>
            </div>

            {/* Finish Button if not auto-redirected */}
            {slipDropped && (
              <button
                type="button"
                onClick={handleFinishVVPAT}
                className="w-full py-3.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-sm uppercase tracking-wider shadow-lg transition-colors cursor-pointer"
              >
                Proceed to Confirmation & Receipt →
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
