import type { Student } from '../types';

export type SupportedLanguage = 'en' | 'te' | 'hi' | 'ta' | 'kn' | 'mr';

export interface LanguageMeta {
  code: SupportedLanguage;
  name: string;
  nativeName: string;
  flag: string;
}

export const SUPPORTED_LANGUAGES: Record<SupportedLanguage, LanguageMeta> = {
  te: { code: 'te', name: 'Telugu', nativeName: 'తెలుగు', flag: '🇮🇳' },
  ta: { code: 'ta', name: 'Tamil', nativeName: 'தமிழ்', flag: '🇮🇳' },
  kn: { code: 'kn', name: 'Kannada', nativeName: 'ಕನ್ನಡ', flag: '🇮🇳' },
  mr: { code: 'mr', name: 'Marathi', nativeName: 'मराठी', flag: '🇮🇳' },
  hi: { code: 'hi', name: 'Hindi', nativeName: 'हिंदी', flag: '🇮🇳' },
  en: { code: 'en', name: 'English', nativeName: 'English', flag: '🌐' },
};

// District name normalization & mapping
const TELUGU_DISTRICTS = [
  'nellore', 'chittoor', 'kadapa', 'anantapur', 'anantapuramu', 'tirupati',
  'kurnool', 'nandyal', 'guntur', 'krishna', 'vijayawada', 'prakasam',
  'visakhapatnam', 'vizag', 'east godavari', 'west godavari', 'srikakulam',
  'vizianagaram', 'hyderabad', 'rangareddy', 'medchal', 'warangal', 'khammam', 'karimnagar'
];

const TAMIL_DISTRICTS = [
  'chennai', 'vellore', 'hosur', 'kanchipuram', 'tiruvallur', 'coimbatore',
  'salem', 'madurai', 'tiruchirappalli', 'trichy', 'thanjavur', 'tirupattur', 'ranipet'
];

const KANNADA_DISTRICTS = [
  'bengaluru', 'bangalore', 'kolar', 'ballari', 'bellary', 'chikkaballapur',
  'tumakuru', 'tumkur', 'mysuru', 'mysore', 'hubballi', 'dharwad', 'belagavi', 'mangaluru'
];

const MARATHI_DISTRICTS = [
  'pune', 'mumbai', 'nagpur', 'nashik', 'thane', 'aurangabad',
  'chhatrapati sambhajinagar', 'solapur', 'kolhapur', 'satara'
];

/**
 * Resolves regional language based on homeDistrict, state, or parentLanguage override
 */
export function detectStudentLanguage(student: Partial<Student>): SupportedLanguage {
  // 1. If explicit parentLanguage is already set and supported, respect it
  if (student.parentLanguage && (student.parentLanguage in SUPPORTED_LANGUAGES)) {
    return student.parentLanguage as SupportedLanguage;
  }

  const district = (student.homeDistrict || '').trim().toLowerCase();
  const state = (student.state || '').trim().toLowerCase();

  // 2. Match District keywords
  if (district) {
    if (TELUGU_DISTRICTS.some((d) => district.includes(d))) return 'te';
    if (TAMIL_DISTRICTS.some((d) => district.includes(d))) return 'ta';
    if (KANNADA_DISTRICTS.some((d) => district.includes(d))) return 'kn';
    if (MARATHI_DISTRICTS.some((d) => district.includes(d))) return 'mr';
  }

  // 3. Match State keywords
  if (state) {
    if (state.includes('andhra') || state.includes('telangana') || state === 'ap' || state === 'ts') return 'te';
    if (state.includes('tamil') || state === 'tn') return 'ta';
    if (state.includes('karnataka') || state === 'ka') return 'kn';
    if (state.includes('maharashtra') || state === 'mh') return 'mr';
    if (state.includes('uttar') || state.includes('madhya') || state.includes('bihar') || state.includes('delhi') || state.includes('rajasthan')) return 'hi';
  }

  // 4. Default for JNTUA region (Rayalaseema / AP border) is Telugu ('te')
  return 'te';
}

/**
 * Returns formatted label: e.g., "తెలుగు (Telugu)"
 */
export function getLanguageLabel(code: SupportedLanguage): string {
  const meta = SUPPORTED_LANGUAGES[code] || SUPPORTED_LANGUAGES.en;
  return `${meta.nativeName} (${meta.name})`;
}
