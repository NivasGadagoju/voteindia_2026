export interface Voter {
  voterId: string; // EPIC number e.g. GDJ8291045
  name: string;
  age: number;
  gender: 'Male' | 'Female' | 'Other';
  constituency: string;
  state: string;
  pollingBooth: string;
  serialNumber: string;
  partNumber: string;
  isVerified: boolean;
  verificationMethod: 'AI_EPIC' | 'BIOMETRIC_FACE' | 'AADHAAR_OTP';
  hasVoted: boolean;
  votedAt?: string;
  votedCandidateId?: string;
  txHash?: string;
  receiptNumber?: string;
}

export interface Candidate {
  id: string;
  ballotNumber: number;
  name: string;
  nameHindi?: string;
  party: string;
  partyAbbr: string;
  symbol: string;
  symbolName: string;
  color: string;
  constituency: string;
  age: number;
  education: string;
  criminalCases: number;
  assetsDeclared: string;
  bio: string;
  agenda: string[];
}

export interface ElectionPartyResult {
  party: string;
  partyAbbr: string;
  seatsWon: number;
  leading: number;
  voteSharePercent: number;
  color: string;
  symbol: string;
}

export interface VVPATReceipt {
  receiptId: string;
  voterEpicMasked: string;
  candidateName: string;
  candidateParty: string;
  symbolName: string;
  symbol: string;
  constituency: string;
  state: string;
  timestamp: string;
  digitalSignature: string;
  blockNumber: number;
  sha256Hash: string;
}

export interface ConstituencyInfo {
  name: string;
  state: string;
  totalElectors: number;
  currentTurnoutPercent: number;
  phase: number;
  votingDate: string;
  status: 'VOTING_OPEN' | 'VOTING_CLOSED' | 'COUNTING';
}

export enum AppState {
  AUTH = 'AUTH',
  DASHBOARD = 'DASHBOARD',
  VOTING_BOOTH = 'VOTING_BOOTH',
  VVPAT_PREVIEW = 'VVPAT_PREVIEW',
  CONFIRMATION = 'CONFIRMATION',
  RESULTS = 'RESULTS',
  VERIFY_RECEIPT = 'VERIFY_RECEIPT'
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
  timestamp?: string;
}
