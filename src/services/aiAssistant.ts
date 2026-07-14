import { supabase } from '../auth/supabase';

export type AssistantRole = 'user' | 'assistant';

export type AssistantMessage = {
  id: string;
  role: AssistantRole;
  text: string;
};

type AssistantRequest = {
  question: string;
  messages: AssistantMessage[];
  page: string;
};

const localAnswers = [
  {
    keywords: ['taxi', 'cab', 'ride', 'pathao', 'indrive', 'fare'],
    answer: 'For taxis in tourist areas, compare Pathao/inDrive first, ask for the meter, and agree on the fare before entering. If the price feels pressured or changes mid-ride, step away and use a ride app or hotel/restaurant help.'
  },
  {
    keywords: ['sos', 'emergency', 'police', 'help', 'unsafe'],
    answer: 'If this is urgent, move to a public place and use Yatri’s SOS calls: Police 100, Ambulance 102, or Tourist Police 1144. Share your GPS location with a trusted contact. Short-code coverage can vary in remote areas, so ask a nearby hotel, guide, health post, or resident if a call fails.'
  },
  {
    keywords: ['temple', 'photo', 'dress', 'etiquette', 'culture'],
    answer: 'At temples, dress modestly, remove shoes where required, avoid pointing feet at shrines, and ask before taking photos of people, priests, rituals, or inner courtyards. If signs say no entry or no photos, follow them.'
  },
  {
    keywords: ['offline', 'internet', 'download', 'district'],
    answer: 'Before you leave Wi-Fi, save district packs, phrases, emergency contacts, and your last GPS fix. If you submit a scam report offline, Yatri queues it and syncs when you reconnect.'
  },
  {
    keywords: ['scam', 'report', 'fake', 'guide', 'ticket'],
    answer: 'Common travel scams include inflated taxi fares, unofficial guides, fake ticket counters, and forced shopping stops. Prefer official counters, compare prices, avoid urgency pressure, and report details with location in Yatri.'
  },
  {
    keywords: ['price', 'fair', 'cost', 'bargain', 'money'],
    answer: 'Use Yatri fair-price ranges as a sanity check, not an official tariff. Ask “Kati parcha?” before buying, compare nearby shops, and be extra careful around transport hubs and major tourist sites.'
  }
];

function findLocalAnswer(question: string) {
  const normalized = question.toLowerCase();
  return localAnswers.find((entry) => entry.keywords.some((keyword) => normalized.includes(keyword)))?.answer ?? null;
}

function localAssistantReply(question: string, page: string) {
  const match = findLocalAnswer(question);
  if (match) return match;

  return page === 'safety'
    ? 'For safety, focus on public places, verified contacts, and clear location sharing. If this is urgent, use the SOS panel: Police 100, Ambulance 102, Tourist Police 1144, or contact your embassy/trusted person.'
    : 'I can help with Nepal travel safety, scam checks, fair prices, phrases, offline prep, SOS steps, and local etiquette. Tell me what happened, where you are, and whether it is urgent.';
}

export async function askYatriAssistant({ question, messages, page }: AssistantRequest) {
  const fallback = localAssistantReply(question, page);

  const instant = findLocalAnswer(question);
  if (instant) return { text: instant, source: 'offline' as const };

  if (!supabase) return { text: fallback, source: 'offline' as const };

  try {
    const request = supabase.functions.invoke('travel-assistant', {
      body: {
        question,
        page,
        messages: messages.slice(-8).map(({ role, text }) => ({ role, content: text }))
      }
    });
    const timeout = new Promise<never>((_, reject) => setTimeout(() => reject(new Error('AI timeout')), 6500));
    const { data, error } = await Promise.race([request, timeout]);

    if (error) throw error;
    const text = typeof data?.answer === 'string' ? data.answer.trim() : '';
    return { text: text || fallback, source: text ? 'ai' as const : 'offline' as const };
  } catch {
    return { text: fallback, source: 'offline' as const };
  }
}
