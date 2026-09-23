import { Candidate, VVPATReceipt, Voter } from '../types';

export async function verifyVoter(payload: {
  voterId: string;
  biometricVerified?: boolean;
  constituencyPreference?: string;
}): Promise<Voter> {
  const res = await fetch('/api/verify-voter', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Verification failed' }));
    throw new Error(err.reason || err.error || 'Failed to verify voter identity');
  }

  const data = await res.json();
  return {
    voterId: data.voterId,
    name: data.name || 'Gadagoju Sainivas',
    age: data.age || 28,
    gender: data.gender || 'Male',
    constituency: data.constituency || 'Hyderabad',
    state: data.state || 'Telangana',
    pollingBooth: data.pollingBooth || 'Government High School, Polling Booth #142',
    serialNumber: data.serialNumber || '078',
    partNumber: data.partNumber || '45-A',
    isVerified: true,
    verificationMethod: data.verificationMethod || 'AI_EPIC',
    hasVoted: Boolean(data.hasVoted),
  };
}

export async function getCandidates(constituency: string): Promise<Candidate[]> {
  const res = await fetch('/api/candidates', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ constituency }),
  });

  if (!res.ok) {
    throw new Error('Failed to load candidate roster');
  }

  return res.json();
}

export async function castVote(payload: {
  voterId: string;
  candidateId: string;
  candidateName: string;
  candidateParty: string;
  symbolName: string;
  symbol: string;
  constituency: string;
  state: string;
}): Promise<{ success: boolean; receipt: VVPATReceipt; message: string }> {
  const res = await fetch('/api/cast-vote', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Voting error' }));
    throw new Error(err.error || 'Could not record vote');
  }

  return res.json();
}

export async function getElectionResults() {
  const res = await fetch('/api/results');
  if (!res.ok) {
    throw new Error('Failed to fetch election results');
  }
  return res.json();
}

export async function verifyReceiptHash(receiptId: string) {
  const res = await fetch(`/api/verify-hash/${encodeURIComponent(receiptId)}`);
  if (!res.ok) {
    throw new Error('Receipt verification failed');
  }
  return res.json();
}

export async function sendChatMessage(payload: {
  message: string;
  voterName?: string;
  constituency?: string;
}): Promise<string> {
  const res = await fetch('/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    throw new Error('Chat service unreachable');
  }

  const data = await res.json();
  return data.reply;
}
