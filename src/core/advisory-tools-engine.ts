import type { ProxyAffinityResult, ProxyDefinition } from '../domain/types';

type QuizOption = {
  id: string;
  label: string;
  categoryHint: ProxyDefinition['category'];
};

export type QuizQuestion = {
  id: string;
  prompt: string;
  options: QuizOption[];
};

const questionPool: QuizQuestion[] = [
  {
    id: 'q1',
    prompt: 'In a dispute, select the response most aligned with your advisory profile.',
    options: [
      { id: 'q1a', label: 'Charge like a rampaging rhino.', categoryHint: 'Mammals and Land Creatures' },
      { id: 'q1b', label: 'Sting like a scorpion surprise.', categoryHint: 'Reptiles, Insects, and Invertebrates' },
      { id: 'q1c', label: 'Wriggle like a coordinated worm collective.', categoryHint: 'Other Bizarre Items and Collectives' },
    ],
  },
  {
    id: 'q2',
    prompt: 'Your negotiation soundtrack is best described as:',
    options: [
      { id: 'q2a', label: 'Goose honks with procedural rhythm.', categoryHint: 'Birds and Flying Creatures' },
      { id: 'q2b', label: 'Whale ballad in a vaulted conference room.', categoryHint: 'Aquatic and Marine Life' },
      { id: 'q2c', label: 'Werewolf howls in strict 4/4 time.', categoryHint: 'Mythical and Absurd Concepts' },
    ],
  },
  {
    id: 'q3',
    prompt: 'When paperwork stalls, you prefer to:',
    options: [
      { id: 'q3a', label: 'Summon a ferret compliance unit.', categoryHint: 'Mammals and Land Creatures' },
      { id: 'q3b', label: 'Deploy jellyfish mood lighting.', categoryHint: 'Aquatic and Marine Life' },
      { id: 'q3c', label: 'Open a goblin gadget escalation ticket.', categoryHint: 'Mythical and Absurd Concepts' },
    ],
  },
  {
    id: 'q4',
    prompt: 'Your ideal post-bid debrief room contains:',
    options: [
      { id: 'q4a', label: 'Llamas with index tabs.', categoryHint: 'Mammals and Land Creatures' },
      { id: 'q4b', label: 'Parrots reciting statutes.', categoryHint: 'Birds and Flying Creatures' },
      { id: 'q4c', label: 'Quantum socks and no further explanation.', categoryHint: 'Other Bizarre Items and Collectives' },
    ],
  },
  {
    id: 'q5',
    prompt: 'A certified wildcard clause should include:',
    options: [
      { id: 'q5a', label: 'Portal potatoes with timestamp controls.', categoryHint: 'Other Bizarre Items and Collectives' },
      { id: 'q5b', label: 'Crocodile witness protection.', categoryHint: 'Reptiles, Insects, and Invertebrates' },
      { id: 'q5c', label: 'Narwhal tusk notarization.', categoryHint: 'Aquatic and Marine Life' },
    ],
  },
  {
    id: 'q6',
    prompt: 'At peak volatility, your posture is:',
    options: [
      { id: 'q6a', label: 'Hawk-eyed and altitude-ready.', categoryHint: 'Birds and Flying Creatures' },
      { id: 'q6b', label: 'Toad-adjacent and mildly explosive.', categoryHint: 'Reptiles, Insects, and Invertebrates' },
      { id: 'q6c', label: 'Polite dragon energy with appendices.', categoryHint: 'Mythical and Absurd Concepts' },
    ],
  },
  {
    id: 'q7',
    prompt: 'Select your preferred advisory closing statement:',
    options: [
      { id: 'q7a', label: '“Respectfully submitted, by otter authority.”', categoryHint: 'Mammals and Land Creatures' },
      { id: 'q7b', label: '“Filed under avian urgency.”', categoryHint: 'Birds and Flying Creatures' },
      { id: 'q7c', label: '“Certified by interdimensional potato seal.”', categoryHint: 'Other Bizarre Items and Collectives' },
    ],
  },
];

export function buildQuizQuestions() {
  const shuffled = [...questionPool].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, 6);
}

export function resolveProxyAffinity(proxyLibrary: ProxyDefinition[], selectedOptions: QuizOption[]): ProxyAffinityResult {
  const tally = new Map<string, number>();
  selectedOptions.forEach((option) => {
    tally.set(option.categoryHint, (tally.get(option.categoryHint) || 0) + 1);
  });

  const topCategory = [...tally.entries()].sort((a, b) => b[1] - a[1])[0]?.[0];
  const proxy = proxyLibrary.find((item) => item.category === topCategory) || proxyLibrary[0];

  return {
    proxyId: proxy.id,
    proxyName: proxy.name,
    rate: proxy.ratePerCamel,
    rationale: `${proxy.description} Ideal for certified absurd bargaining posture.`,
    snippet: `Per Affinity Assessment 4.2, incorporate ${proxy.name.toLowerCase()} clause in subsequent bid sessions.`,
    assessedAtISO: new Date().toISOString(),
  };
}
