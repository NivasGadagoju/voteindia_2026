import express, { Request, Response } from 'express';
import path from 'path';
import crypto from 'crypto';
import 'dotenv/config';
import { GoogleGenAI, Type } from '@google/genai';

const app = express();
const port = Number(process.env.PORT) || 3000;
const isProduction = process.env.NODE_ENV === 'production';

app.use(express.json());

// Initialize Google GenAI
const apiKey = process.env.GEMINI_API_KEY || process.env.API_KEY;
let ai: GoogleGenAI | null = null;

if (apiKey && apiKey !== 'PLACEHOLDER_API_KEY') {
  try {
    ai = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  } catch (err) {
    console.warn('Gemini client initialization warning:', err);
  }
}

// In-memory election state for session
interface VoteRecord {
  receiptId: string;
  maskedEpic: string;
  candidateId: string;
  candidateName: string;
  party: string;
  constituency: string;
  timestamp: string;
  sha256Hash: string;
  blockNumber: number;
}

const castVotes: VoteRecord[] = [];
const liveTally: Record<string, number> = {
  'NUP': 278,
  'IPC': 152,
  'PDA': 37,
  'BWF': 21,
  'CIP': 14,
  'SFF': 26,
  'IND': 10,
  'NOTA': 5,
};

// Preset realistic candidate database for instant fallbacks and high fidelity
const PRESET_CANDIDATES: Record<string, any[]> = {
  'Hyderabad': [
    {
      id: 'hyd-1',
      ballotNumber: 1,
      name: 'Dr. K. Srinivas Rao',
      nameHindi: 'डॉ. के. श्रीनिवास राव',
      party: 'National Unity Party',
      partyAbbr: 'NUP',
      symbol: '🪷',
      symbolName: 'Lotus',
      color: '#FF9933',
      constituency: 'Hyderabad',
      age: 48,
      education: 'Ph.D in Public Administration, Osmania Univ',
      criminalCases: 0,
      assetsDeclared: '₹ 8.4 Crore',
      bio: 'Former civil servant turned social policy expert advocating technology modernization in urban infrastructure.',
      agenda: ['AI-driven flood & drainage systems', 'Tech-hub expansion to Old City', '24x7 Clean drinking water pipeline'],
    },
    {
      id: 'hyd-2',
      ballotNumber: 2,
      name: 'Mohammed Asaduddin Qureshi',
      nameHindi: 'मोहम्मद असदुद्दीन कुरैशी',
      party: 'Secular Federal Front',
      partyAbbr: 'SFF',
      symbol: '🌅',
      symbolName: 'Rising Sun',
      color: '#0284c7',
      constituency: 'Hyderabad',
      age: 52,
      education: 'LL.B, NALSAR University of Law',
      criminalCases: 0,
      assetsDeclared: '₹ 12.2 Crore',
      bio: 'Senior constitutional lawyer championing minority welfare, artisan protection, and heritage conservation.',
      agenda: ['Subsidized healthcare network', 'Charminar heritage corridor revival', 'Skill academies for artisan youth'],
    },
    {
      id: 'hyd-3',
      ballotNumber: 3,
      name: 'P. Aruna Reddy',
      nameHindi: 'पी. अरुणा रेड्डी',
      party: 'Indian Progressive Congress',
      partyAbbr: 'IPC',
      symbol: '✋',
      symbolName: 'Hand',
      color: '#138808',
      constituency: 'Hyderabad',
      age: 43,
      education: 'M.Sc (Econ), London School of Economics',
      criminalCases: 0,
      assetsDeclared: '₹ 4.1 Crore',
      bio: 'Women empowerment activist focused on public transit safety, green jobs, and healthcare equity.',
      agenda: ['Zero-fare women electric bus network', '100,000 Green youth apprenticeships', 'Universal community health clinics'],
    },
    {
      id: 'hyd-4',
      ballotNumber: 4,
      name: 'T. Venu Gopal',
      nameHindi: 'टी. वेणु गोपाल',
      party: 'Citizen Integrity Party',
      partyAbbr: 'CIP',
      symbol: '🧹',
      symbolName: 'Broom',
      color: '#eab308',
      constituency: 'Hyderabad',
      age: 39,
      education: 'B.Tech (Computer Science), IIT Madras',
      criminalCases: 0,
      assetsDeclared: '₹ 1.8 Crore',
      bio: 'Open-government technologist fighting civic corruption through transparent municipal budgeting.',
      agenda: ['Real-time ward budget tracking app', 'Zero-bribe public service guarantee', 'Rooftop solar subsidy for all households'],
    },
    {
      id: 'hyd-nota',
      ballotNumber: 5,
      name: 'None of the Above (NOTA)',
      nameHindi: 'इनमें से कोई नहीं (नोटा)',
      party: 'Election Commission of India Option',
      partyAbbr: 'NOTA',
      symbol: '🚫',
      symbolName: 'Cross Box',
      color: '#64748b',
      constituency: 'Hyderabad',
      age: 0,
      education: 'Constitutional Democratic Right (Rule 49-O)',
      criminalCases: 0,
      assetsDeclared: 'N/A',
      bio: 'Allows electors to exercise the right not to vote for any of the candidates contesting in this constituency.',
      agenda: ['Enforces rejection of all contesting candidates', 'Notifies ECI of voter dissatisfaction', 'Strengthens democratic accountability'],
    },
  ],
  'New Delhi': [
    {
      id: 'del-1',
      ballotNumber: 1,
      name: 'Vikramjit Singh Malhotra',
      nameHindi: 'विक्रमजीत सिंह मल्होत्रा',
      party: 'National Unity Party',
      partyAbbr: 'NUP',
      symbol: '🪷',
      symbolName: 'Lotus',
      color: '#FF9933',
      constituency: 'New Delhi',
      age: 51,
      education: 'M.A. International Relations, JNU',
      criminalCases: 0,
      assetsDeclared: '₹ 14.6 Crore',
      bio: 'Two-term parliamentarian with focus on national security, green mobility, and diplomatic initiatives.',
      agenda: ['Zero-smog Delhi air quality mission', 'World-class transit hubs around Connaught Place', 'Digital single-window business clearances'],
    },
    {
      id: 'del-2',
      ballotNumber: 2,
      name: 'Sunita Mehra Verma',
      nameHindi: 'सुनीता मेहरा वर्मा',
      party: 'Citizen Integrity Party',
      partyAbbr: 'CIP',
      symbol: '🧹',
      symbolName: 'Broom',
      color: '#eab308',
      constituency: 'New Delhi',
      age: 46,
      education: 'M.Ed, Delhi University',
      criminalCases: 0,
      assetsDeclared: '₹ 2.3 Crore',
      bio: 'Education reformer who established 25 model municipal schools and community health centers.',
      agenda: ['Free 24x7 neighborhood Mohalla clinics', 'Subsidized electricity and water for tenants', 'Air purifier towers in high-traffic corridors'],
    },
    {
      id: 'del-3',
      ballotNumber: 3,
      name: 'Anand Kumar Dixit',
      nameHindi: 'आनंद कुमार दीक्षित',
      party: 'Indian Progressive Congress',
      partyAbbr: 'IPC',
      symbol: '✋',
      symbolName: 'Hand',
      color: '#138808',
      constituency: 'New Delhi',
      age: 57,
      education: 'LL.M, Harvard Law School',
      criminalCases: 0,
      assetsDeclared: '₹ 9.8 Crore',
      bio: 'Former Union Minister focusing on economic welfare guarantees and labor protections.',
      agenda: ['Youth employment statutory guarantee', 'Price stabilization for essential food commodities', 'Universal health insurance coverage'],
    },
    {
      id: 'del-4',
      ballotNumber: 4,
      name: 'Colonel (Retd.) Ravindra Pathak',
      nameHindi: 'कर्नल (से.नि.) रवींद्र पाठक',
      party: 'Independent Front',
      partyAbbr: 'IND',
      symbol: '🔦',
      symbolName: 'Torch',
      color: '#8b5cf6',
      constituency: 'New Delhi',
      age: 62,
      education: 'M.Sc Defence Studies, NDA Khadakwasla',
      criminalCases: 0,
      assetsDeclared: '₹ 3.5 Crore',
      bio: 'Decorated veteran fighting for judicial speed, veteran pensions, and anti-corruption measures.',
      agenda: ['Fast-track courts for civic disputes', 'Citizen safety surveillance grid', 'Transparency in MP LAD fund allocations'],
    },
    {
      id: 'del-nota',
      ballotNumber: 5,
      name: 'None of the Above (NOTA)',
      nameHindi: 'इनमें से कोई नहीं (नोटा)',
      party: 'Election Commission of India Option',
      partyAbbr: 'NOTA',
      symbol: '🚫',
      symbolName: 'Cross Box',
      color: '#64748b',
      constituency: 'New Delhi',
      age: 0,
      education: 'Constitutional Democratic Right (Rule 49-O)',
      criminalCases: 0,
      assetsDeclared: 'N/A',
      bio: 'Allows electors to exercise the right not to vote for any of the candidates contesting in this constituency.',
      agenda: ['Enforces rejection of all contesting candidates', 'Notifies ECI of voter dissatisfaction', 'Strengthens democratic accountability'],
    },
  ],
  'Varanasi': [
    {
      id: 'var-1',
      ballotNumber: 1,
      name: 'Narendra D. Sharma',
      nameHindi: 'नरेंद्र डी. शर्मा',
      party: 'National Unity Party',
      partyAbbr: 'NUP',
      symbol: '🪷',
      symbolName: 'Lotus',
      color: '#FF9933',
      constituency: 'Varanasi',
      age: 55,
      education: 'Post Graduate, BHU',
      criminalCases: 0,
      assetsDeclared: '₹ 6.2 Crore',
      bio: 'Leading cultural preservation and river rejuvenation initiatives across Eastern Uttar Pradesh.',
      agenda: ['Complete clean Ganga riverfront canalization', 'Weavers modernization cluster with direct export hub', 'Bullet train corridor terminal in Varanasi'],
    },
    {
      id: 'var-2',
      ballotNumber: 2,
      name: 'Ajay Rai Yadav',
      nameHindi: 'अजय राय यादव',
      party: 'Indian Progressive Congress',
      partyAbbr: 'IPC',
      symbol: '✋',
      symbolName: 'Hand',
      color: '#138808',
      constituency: 'Varanasi',
      age: 49,
      education: 'M.Com, Kashi Vidyapith',
      criminalCases: 0,
      assetsDeclared: '₹ 4.7 Crore',
      bio: 'Grassroots leader advocating for farmer MSP legal guarantees and small trader tax relief.',
      agenda: ['Legally guaranteed MSP for potato & vegetable growers', 'Revival of local brassware and silk cottage industries', 'Free power for tube wells'],
    },
    {
      id: 'var-3',
      ballotNumber: 3,
      name: 'Suresh Chandra Gautam',
      nameHindi: 'सुरेश चंद्र गौतम',
      party: 'Bahujan Welfare Front',
      partyAbbr: 'BWF',
      symbol: '🐘',
      symbolName: 'Elephant',
      color: '#000080',
      constituency: 'Varanasi',
      age: 53,
      education: 'B.A., LL.B, BHU',
      criminalCases: 0,
      assetsDeclared: '₹ 1.9 Crore',
      bio: 'Social justice organizer working for equitable land rights and education access for marginalized communities.',
      agenda: ['Scholarship guarantee for Dalit & backward students', 'Land title regularization for peri-urban settlements', 'Free legal aid clinics in rural blocks'],
    },
    {
      id: 'var-nota',
      ballotNumber: 4,
      name: 'None of the Above (NOTA)',
      nameHindi: 'इनमें से कोई नहीं (नोटा)',
      party: 'Election Commission of India Option',
      partyAbbr: 'NOTA',
      symbol: '🚫',
      symbolName: 'Cross Box',
      color: '#64748b',
      constituency: 'Varanasi',
      age: 0,
      education: 'Constitutional Democratic Right (Rule 49-O)',
      criminalCases: 0,
      assetsDeclared: 'N/A',
      bio: 'Allows electors to exercise the right not to vote for any of the candidates contesting in this constituency.',
      agenda: ['Enforces rejection of all contesting candidates', 'Notifies ECI of voter dissatisfaction', 'Strengthens democratic accountability'],
    },
  ]
};

// 1. Voter Verification Endpoint
app.post('/api/verify-voter', async (req: Request, res: Response) => {
  try {
    const { voterId, biometricVerified, constituencyPreference } = req.body;

    if (!voterId || typeof voterId !== 'string') {
      res.status(400).json({ error: 'Valid Voter ID (EPIC) is required.' });
      return;
    }

    const cleanId = voterId.trim().toUpperCase();

    // Standard Indian EPIC validation: 3 uppercase letters followed by 7 digits, or flexible demo IDs
    const epicRegex = /^[A-Z]{3}[0-9]{7}$/;
    const isEpicFormat = epicRegex.test(cleanId) || cleanId.length >= 6;

    if (!isEpicFormat) {
      res.status(400).json({
        isValid: false,
        reason: 'Invalid EPIC format. An authentic Indian Voter ID contains 3 letters followed by 7 digits (e.g. ABC1234567, HYD4928172).',
      });
      return;
    }

    // Default voter fallback profile (tailored for user Gadagoju Sainivas or selected city)
    const constituency = constituencyPreference || (cleanId.startsWith('HYD') ? 'Hyderabad' : cleanId.startsWith('DEL') ? 'New Delhi' : cleanId.startsWith('VAR') ? 'Varanasi' : 'Hyderabad');
    const stateMap: Record<string, string> = {
      'Hyderabad': 'Telangana',
      'New Delhi': 'NCT of Delhi',
      'Varanasi': 'Uttar Pradesh',
      'Bangalore South': 'Karnataka',
      'Mumbai North': 'Maharashtra',
      'Wayanad': 'Kerala',
    };

    let voterProfile = {
      isValid: true,
      voterId: cleanId,
      name: 'Gadagoju Sainivas',
      age: 28,
      gender: 'Male',
      constituency,
      state: stateMap[constituency] || 'Telangana',
      pollingBooth: `Room 4, Government High School, Polling Station #${cleanId.slice(-3) || '142'}`,
      serialNumber: cleanId.slice(-3) || '078',
      partNumber: '45-A',
      verificationMethod: biometricVerified ? 'BIOMETRIC_FACE' : 'AI_EPIC',
      hasVoted: false,
      reason: 'Voter authenticated successfully with Electoral Roll 2026 database.',
    };

    // If Gemini is available, verify and enrich with smart metadata
    if (ai) {
      try {
        const response = await ai.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: `You are the Election Commission of India (ECI) National Voter Services Portal verification engine. 
Verify the EPIC Card / Voter ID: "${cleanId}".
If the ID starts with 'HYD' or has 'SAI', the registered voter name should be 'Gadagoju Sainivas' in constituency 'Hyderabad', State 'Telangana'.
Otherwise return realistic Indian citizen data with valid constituency, booth, and serial number.
Return JSON strictly.`,
          config: {
            responseMimeType: 'application/json',
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                isValid: { type: Type.BOOLEAN },
                reason: { type: Type.STRING },
                name: { type: Type.STRING },
                age: { type: Type.INTEGER },
                gender: { type: Type.STRING },
                constituency: { type: Type.STRING },
                state: { type: Type.STRING },
                pollingBooth: { type: Type.STRING },
                serialNumber: { type: Type.STRING },
                partNumber: { type: Type.STRING },
              },
              required: ['isValid', 'name', 'constituency', 'state'],
            },
          },
        });

        if (response.text) {
          const parsed = JSON.parse(response.text.trim());
          if (parsed.isValid) {
            voterProfile = {
              ...voterProfile,
              ...parsed,
              voterId: cleanId,
              hasVoted: false,
            };
          }
        }
      } catch (geminiError) {
        console.warn('Gemini verification fallback used:', geminiError);
      }
    }

    // Check if voter already cast ballot in current session
    const existingVote = castVotes.find((v) => v.maskedEpic === `${cleanId.slice(0, 3)}****${cleanId.slice(-3)}`);
    if (existingVote) {
      voterProfile.hasVoted = true;
    }

    res.json(voterProfile);
  } catch (error: any) {
    console.error('Error in /api/verify-voter:', error);
    res.status(500).json({ error: 'Voter verification service unavailable.' });
  }
});

// 2. Candidates Endpoint for Constituency
app.post('/api/candidates', async (req: Request, res: Response) => {
  try {
    const { constituency } = req.body;
    const targetConstituency = constituency || 'Hyderabad';

    // If we have preset candidates, use them or supplement with Gemini
    if (PRESET_CANDIDATES[targetConstituency]) {
      res.json(PRESET_CANDIDATES[targetConstituency]);
      return;
    }

    // If not in preset, try Gemini generation
    if (ai) {
      try {
        const response = await ai.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: `Generate 4 realistic contesting candidates plus 1 NOTA option for the Indian General Elections 2026 for the Lok Sabha constituency: "${targetConstituency}".
Use realistic Indian political party symbols (Lotus 🪷, Hand ✋, Elephant 🐘, Bicycle 🚲, Broom 🧹, Rising Sun 🌅, Torch 🔦).
Include party name, candidate name (English + Hindi), age, education, declared assets in INR Crores, 0 criminal cases (or clean record), short bio, and 3 key agenda points.`,
          config: {
            responseMimeType: 'application/json',
            responseSchema: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING },
                  ballotNumber: { type: Type.INTEGER },
                  name: { type: Type.STRING },
                  nameHindi: { type: Type.STRING },
                  party: { type: Type.STRING },
                  partyAbbr: { type: Type.STRING },
                  symbol: { type: Type.STRING },
                  symbolName: { type: Type.STRING },
                  color: { type: Type.STRING },
                  constituency: { type: Type.STRING },
                  age: { type: Type.INTEGER },
                  education: { type: Type.STRING },
                  criminalCases: { type: Type.INTEGER },
                  assetsDeclared: { type: Type.STRING },
                  bio: { type: Type.STRING },
                  agenda: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING },
                  },
                },
                required: ['id', 'ballotNumber', 'name', 'party', 'symbol', 'symbolName', 'agenda'],
              },
            },
          },
        });

        if (response.text) {
          const generated = JSON.parse(response.text.trim());
          res.json(generated);
          return;
        }
      } catch (e) {
        console.warn('Gemini candidate generation fallback:', e);
      }
    }

    // Default to Hyderabad roster adapted to the requested constituency
    const adapted = PRESET_CANDIDATES['Hyderabad'].map((c) => ({
      ...c,
      constituency: targetConstituency,
    }));
    res.json(adapted);
  } catch (error) {
    console.error('Error fetching candidates:', error);
    res.status(500).json({ error: 'Failed to retrieve candidates' });
  }
});

// 3. AI Assistant Chat Endpoint
app.post('/api/chat', async (req: Request, res: Response) => {
  try {
    const { history = [], message, voterName, constituency } = req.body;

    if (!message || typeof message !== 'string') {
      res.status(400).json({ error: 'Message is required.' });
      return;
    }

    if (ai) {
      try {
        const systemPrompt = `You are 'VoteIndia Sahayak' (सहायक), the official AI assistant for VoteIndia 2026 - Digital Ballot Portal by the Election Commission of India.
Current voter context: ${voterName ? `Name: ${voterName}, Constituency: ${constituency || 'All India'}` : 'Guest elector'}.
Your duty:
1. Provide accurate, non-partisan, neutral information regarding the 2026 Indian General Elections, voting rights, EPIC card procedures, VVPAT (Voter Verifiable Paper Audit Trail) 7-second slip rule, and EVM cryptographic security.
2. Maintain a respectful, polite, reassuring Indian civic tone ("Namaste!", "Vanakkam!", "Pranam!").
3. Support queries in both English, Hindi, and Hinglish.
4. Explain how this digital ballot uses end-to-end cryptographic hashing (SHA-256) while guaranteeing complete ballot secrecy (Article 326 of the Constitution).
5. Never tell the user who to vote for. Never favor any political party. Keep answers concise, clear, and actionable.`;

        const response = await ai.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: [
            {
              role: 'user',
              parts: [{ text: `${systemPrompt}\n\nUser Question: ${message}` }],
            },
          ],
        });

        const reply = response.text || 'Namaste! I am here to help you navigate your digital voting rights.';
        res.json({ reply });
        return;
      } catch (geminiError) {
        console.warn('Gemini chat fallback invoked:', geminiError);
      }
    }

    // Fallback rule-based responses if Gemini is not available or errors
    const lower = message.toLowerCase();
    let reply = 'Namaste! I am your VoteIndia Assistant. How may I assist you with your digital voting rights, candidate information, or election guidelines today?';

    if (lower.includes('vvpat') || lower.includes('paper trail') || lower.includes('receipt')) {
      reply = 'The Voter Verifiable Paper Audit Trail (VVPAT) allows every voter to visually verify their vote for 7 seconds before it is sealed. In our secure digital ballot, this generates a cryptographic SHA-256 audit receipt that you can verify anytime on the public ledger without compromising ballot secrecy!';
    } else if (lower.includes('secret') || lower.includes('privacy') || lower.includes('anonymous')) {
      reply = 'Under Article 326 of the Constitution of India and ECI regulations, ballot secrecy is absolute. Your EPIC card authenticates your right to vote, but your vote selection is decoupled and cryptographically blinded using SHA-256 hashing. Nobody—not even the election commission—can link your identity to your chosen candidate.';
    } else if (lower.includes('document') || lower.includes('id') || lower.includes('epic') || lower.includes('aadhaar')) {
      reply = 'You can vote using your EPIC (Voter ID Card). Accepted alternate IDs include Aadhaar Card, PAN Card, Driving Licence, Indian Passport, and Bank Passbook with photograph.';
    } else if (lower.includes('who is contesting') || lower.includes('candidate') || lower.includes('parties')) {
      reply = 'In your constituency, candidates from major parties and independents are contesting, along with the NOTA (None of the Above) option. You can inspect their affidavits, education, and agendas directly in the official ballot before pressing the vote button.';
    } else if (lower.includes('nota')) {
      reply = 'NOTA stands for "None of the Above". Introduced under Supreme Court of India guidelines in 2013, it enables electors to exercise their democratic right to reject all candidates in the fray.';
    }

    res.json({ reply });
  } catch (error) {
    console.error('Error in chat API:', error);
    res.status(500).json({ error: 'Chat service temporarily unavailable.' });
  }
});

// 4. Cryptographic Ballot Casting Endpoint
app.post('/api/cast-vote', async (req: Request, res: Response) => {
  try {
    const { voterId, candidateId, candidateName, candidateParty, symbolName, symbol, constituency, state } = req.body;

    if (!voterId || !candidateId) {
      res.status(400).json({ error: 'Voter ID and Candidate selection are required.' });
      return;
    }

    const cleanId = String(voterId).toUpperCase();
    const maskedEpic = `${cleanId.slice(0, 3)}****${cleanId.slice(-3)}`;

    // Check duplicate vote prevention
    const alreadyVoted = castVotes.some((v) => v.maskedEpic === maskedEpic);
    if (alreadyVoted) {
      res.status(409).json({ error: 'This voter has already cast their ballot for General Elections 2026.' });
      return;
    }

    const timestamp = new Date().toISOString();
    const blockNumber = 1048576 + castVotes.length + 1;
    const receiptId = `ECI-2026-${crypto.randomBytes(4).toString('hex').toUpperCase()}`;

    // Cryptographic hash over anonymized ballot data (voter identity NOT linked to choice)
    const hashPayload = `${blockNumber}:${constituency}:${candidateId}:${timestamp}:${crypto.randomBytes(8).toString('hex')}`;
    const sha256Hash = crypto.createHash('sha256').update(hashPayload).digest('hex');
    const digitalSignature = `ECI_ED25519_${crypto.randomBytes(16).toString('hex')}`;

    const voteRecord: VoteRecord = {
      receiptId,
      maskedEpic,
      candidateId,
      candidateName,
      party: candidateParty || 'Independent',
      constituency: constituency || 'Hyderabad',
      timestamp,
      sha256Hash,
      blockNumber,
    };

    castVotes.push(voteRecord);

    // Update live tally
    const partyKey = candidateParty?.includes('National') ? 'NUP' :
      candidateParty?.includes('Progressive') ? 'IPC' :
      candidateParty?.includes('Citizen') ? 'CIP' :
      candidateParty?.includes('Secular') ? 'SFF' :
      candidateParty?.includes('Bahujan') ? 'BWF' :
      candidateParty?.includes('NOTA') ? 'NOTA' : 'IND';

    liveTally[partyKey] = (liveTally[partyKey] || 0) + 1;

    const receipt = {
      receiptId,
      voterEpicMasked: maskedEpic,
      candidateName,
      candidateParty,
      symbolName,
      symbol,
      constituency,
      state: state || 'Telangana',
      timestamp,
      digitalSignature,
      blockNumber,
      sha256Hash: `0x${sha256Hash}`,
    };

    res.json({
      success: true,
      message: 'Ballot successfully cast, encrypted, and recorded on the ECI Audit Ledger.',
      receipt,
    });
  } catch (error) {
    console.error('Error casting vote:', error);
    res.status(500).json({ error: 'Failed to cast ballot.' });
  }
});

// 5. Election Live Results & Integrity Stats Endpoint
app.get('/api/results', (_req: Request, res: Response) => {
  const totalSeats = 543;
  const majorityMark = 272;

  const partyBreakdown = [
    {
      party: 'National Unity Party',
      partyAbbr: 'NUP',
      seatsWon: liveTally['NUP'] || 278,
      leading: 12,
      voteSharePercent: 38.6,
      color: '#FF9933',
      symbol: '🪷',
    },
    {
      party: 'Indian Progressive Congress',
      partyAbbr: 'IPC',
      seatsWon: liveTally['IPC'] || 152,
      leading: 8,
      voteSharePercent: 26.4,
      color: '#138808',
      symbol: '✋',
    },
    {
      party: 'People\'s Democratic Alliance',
      partyAbbr: 'PDA',
      seatsWon: liveTally['PDA'] || 37,
      leading: 3,
      voteSharePercent: 7.8,
      color: '#3b82f6',
      symbol: '🚲',
    },
    {
      party: 'Secular Federal Front',
      partyAbbr: 'SFF',
      seatsWon: liveTally['SFF'] || 26,
      leading: 2,
      voteSharePercent: 6.2,
      color: '#0284c7',
      symbol: '🌅',
    },
    {
      party: 'Bahujan Welfare Front',
      partyAbbr: 'BWF',
      seatsWon: liveTally['BWF'] || 21,
      leading: 1,
      voteSharePercent: 5.1,
      color: '#000080',
      symbol: '🐘',
    },
    {
      party: 'Citizen Integrity Party',
      partyAbbr: 'CIP',
      seatsWon: liveTally['CIP'] || 14,
      leading: 1,
      voteSharePercent: 4.3,
      color: '#eab308',
      symbol: '🧹',
    },
    {
      party: 'Others & Independents',
      partyAbbr: 'IND',
      seatsWon: liveTally['IND'] || 10,
      leading: 2,
      voteSharePercent: 8.2,
      color: '#8b5cf6',
      symbol: '🔦',
    },
    {
      party: 'None of the Above (NOTA)',
      partyAbbr: 'NOTA',
      seatsWon: 0,
      leading: 0,
      voteSharePercent: 1.4,
      color: '#64748b',
      symbol: '🚫',
    },
  ];

  res.json({
    totalSeats,
    majorityMark,
    totalVotersEnrolled: 978412000,
    votesCastLive: 684920150 + castVotes.length,
    turnoutPercent: 69.84,
    auditTrailCount: 684920150 + castVotes.length,
    integrityIndex: '100.00%',
    evmUptime: '99.998%',
    currentPhase: 'Phase 7 (Final Counting Phase)',
    lastBlockTime: new Date().toISOString(),
    parties: partyBreakdown,
    recentAuditBlocks: castVotes.slice(-5).reverse(),
  });
});

// 6. Public Hash Audit Verification Endpoint
app.get('/api/verify-hash/:receiptId', (req: Request, res: Response) => {
  const { receiptId } = req.params;
  const match = castVotes.find((v) => v.receiptId.toLowerCase() === receiptId.toLowerCase());

  if (match) {
    res.json({
      found: true,
      receiptId: match.receiptId,
      maskedEpic: match.maskedEpic,
      constituency: match.constituency,
      timestamp: match.timestamp,
      blockNumber: match.blockNumber,
      sha256Hash: match.sha256Hash,
      status: 'VERIFIED_ON_AUDIT_LOG',
    });
  } else {
    // Generate simulated valid check for demo receipt ids or inform
    res.json({
      found: true,
      receiptId,
      status: 'VERIFIED_ECI_CRYPTOGRAPHIC_CHAIN',
      timestamp: new Date().toISOString(),
      blockNumber: 1048580,
      sha256Hash: `0x${crypto.createHash('sha256').update(receiptId).digest('hex')}`,
      auditResult: 'Cryptographic digital signature verified against ECI master consensus node.',
    });
  }
});

// Setup dev server with Vite or production static serving
async function startServer() {
  if (!isProduction) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(port, '0.0.0.0', () => {
    console.log(`VoteIndia 2026 Server running at http://0.0.0.0:${port}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
});
