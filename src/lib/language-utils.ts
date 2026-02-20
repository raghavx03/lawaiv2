// Language utilities for multilingual support
// Supports: English, Hindi, Hinglish

export type Language = 'en' | 'hi' | 'hinglish'

// Common Hindi words for detection
const HINDI_WORDS = [
  'क्या', 'है', 'नहीं', 'हाँ', 'और', 'में', 'को', 'से', 'के', 'का',
  'यह', 'वह', 'जो', 'कि', 'तो', 'भी', 'ही', 'अगर', 'तब', 'जब',
  'कहा', 'किया', 'दिया', 'लिया', 'बताया', 'समझा', 'देखा', 'सुना',
  'कर', 'करना', 'करते', 'करेंगे', 'करूंगा', 'करूंगी', 'करेंगी'
]

// Common Hinglish words (Hindi words in Roman script)
const HINGLISH_WORDS = [
  'kya', 'hai', 'nahi', 'haan', 'aur', 'mein', 'ko', 'se', 'ke', 'ka',
  'yeh', 'woh', 'jo', 'ki', 'to', 'bhi', 'hi', 'agar', 'tab', 'jab',
  'kaha', 'kiya', 'diya', 'liya', 'bataya', 'samjha', 'dekha', 'suna',
  'kar', 'karna', 'karte', 'karenge', 'karunga', 'karungi', 'karengi',
  'bhai', 'bro', 'acha', 'theek', 'samjha', 'dekh', 'suno', 'sunao',
  'likha', 'likhe', 'likhi', 'likho', 'likhe', 'likha', 'likhi', 'likho'
]

// Devanagari script range
const DEVANAGARI_RANGE = /[\u0900-\u097F]/g

/**
 * Detect language from text
 * Returns: 'en' (English), 'hi' (Hindi), 'hinglish' (Hinglish)
 */
export function detectLanguage(text: string): Language {
  if (!text || text.length === 0) return 'en'
  
  // Check for Devanagari script (Hindi)
  const devanagariMatches = text.match(DEVANAGARI_RANGE)
  if (devanagariMatches && devanagariMatches.length > text.length * 0.2) {
    return 'hi'
  }
  
  // Check for Hinglish patterns
  const lowerText = text.toLowerCase()
  let hinglishScore = 0
  
  for (const word of HINGLISH_WORDS) {
    const regex = new RegExp(`\\b${word}\\b`, 'gi')
    const matches = lowerText.match(regex)
    if (matches) {
      hinglishScore += matches.length
    }
  }
  
  // If we found multiple Hinglish words, it's likely Hinglish
  if (hinglishScore > 3) {
    return 'hinglish'
  }
  
  // Default to English
  return 'en'
}

/**
 * Get language name for display
 */
export function getLanguageName(language: Language): string {
  const names: Record<Language, string> = {
    'en': 'English',
    'hi': 'Hindi',
    'hinglish': 'Hinglish'
  }
  return names[language]
}

/**
 * Get language flag emoji
 */
export function getLanguageFlag(language: Language): string {
  const flags: Record<Language, string> = {
    'en': '🇬🇧',
    'hi': '🇮🇳',
    'hinglish': '🇮🇳'
  }
  return flags[language]
}

/**
 * Translate common UI strings to Hindi
 */
export const HINDI_TRANSLATIONS: Record<string, string> = {
  'Ask a legal question': 'कानूनी सवाल पूछें',
  'Send': 'भेजें',
  'Loading': 'लोड हो रहा है',
  'Error': 'त्रुटि',
  'Copy': 'कॉपी करें',
  'Copied': 'कॉपी किया गया',
  'Delete': 'हटाएं',
  'Edit': 'संपादित करें',
  'Save': 'सहेजें',
  'Cancel': 'रद्द करें',
  'Close': 'बंद करें',
  'Back': 'वापस',
  'Next': 'अगला',
  'Previous': 'पिछला',
  'Search': 'खोजें',
  'Filter': 'फ़िल्टर',
  'Sort': 'क्रमबद्ध करें',
  'Download': 'डाउनलोड करें',
  'Upload': 'अपलोड करें',
  'Share': 'साझा करें',
  'Settings': 'सेटिंग्स',
  'Help': 'मदद',
  'About': 'के बारे में',
  'Legal Disclaimer': 'कानूनी अस्वीकरण',
  'Terms of Service': 'सेवा की शर्तें',
  'Privacy Policy': 'गोपनीयता नीति',
  'Contact Us': 'हमसे संपर्क करें',
  'No results found': 'कोई परिणाम नहीं मिला',
  'Something went wrong': 'कुछ गलत हो गया',
  'Please try again': 'कृपया फिर से प्रयास करें',
  'Generating response': 'प्रतिक्रिया उत्पन्न की जा रही है',
  'Response generated': 'प्रतिक्रिया उत्पन्न की गई',
  'Failed to generate response': 'प्रतिक्रिया उत्पन्न करने में विफल'
}

/**
 * Translate common UI strings to Hinglish
 */
export const HINGLISH_TRANSLATIONS: Record<string, string> = {
  'Ask a legal question': 'Koi legal sawal poochiye',
  'Send': 'Bhejiye',
  'Loading': 'Load ho raha hai',
  'Error': 'Koi problem hai',
  'Copy': 'Copy karo',
  'Copied': 'Copy ho gaya',
  'Delete': 'Hatao',
  'Edit': 'Edit karo',
  'Save': 'Save karo',
  'Cancel': 'Cancel karo',
  'Close': 'Band karo',
  'Back': 'Wapas jao',
  'Next': 'Agle pe jao',
  'Previous': 'Pichle pe jao',
  'Search': 'Dhundo',
  'Filter': 'Filter karo',
  'Sort': 'Arrange karo',
  'Download': 'Download karo',
  'Upload': 'Upload karo',
  'Share': 'Share karo',
  'Settings': 'Settings',
  'Help': 'Madad',
  'About': 'Ke baare mein',
  'Legal Disclaimer': 'Legal Disclaimer',
  'Terms of Service': 'Service ke niyam',
  'Privacy Policy': 'Privacy Policy',
  'Contact Us': 'Hum se contact karo',
  'No results found': 'Koi result nahi mila',
  'Something went wrong': 'Kuch galat ho gaya',
  'Please try again': 'Dobara try karo',
  'Generating response': 'Response ban raha hai',
  'Response generated': 'Response ban gaya',
  'Failed to generate response': 'Response banana fail ho gaya'
}

/**
 * Get translation for a string
 */
export function translate(text: string, language: Language): string {
  if (language === 'en') return text
  
  if (language === 'hi') {
    return HINDI_TRANSLATIONS[text] || text
  }
  
  if (language === 'hinglish') {
    return HINGLISH_TRANSLATIONS[text] || text
  }
  
  return text
}

/**
 * Format text for language
 */
export function formatForLanguage(text: string, language: Language): string {
  if (language === 'en') {
    return text
  }
  
  // For Hindi and Hinglish, ensure proper spacing and formatting
  return text.trim()
}
