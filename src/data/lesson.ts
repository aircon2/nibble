export type Question = {
  id: string;
  title: string;
  description: string;
  list: number[];
  target: number;
  prompt: string;
  options: { id: string; label: string }[];
  correctId: string;
  hint: string;
  success: string;
  retry: string;
};

// Authored and checked by hand so the hackathon demo is deterministic.
export const questions: Question[] = [
  {
    id: 'find-pair',
    title: 'Which two numbers\nmake 9?',
    description: 'A pair is just two numbers. Let’s find the ones that add up to our target.',
    list: [2, 7, 11, 15],
    target: 9,
    prompt: 'Choose a pair',
    options: [
      { id: 'a', label: '2 + 7' },
      { id: 'b', label: '7 + 11' },
      { id: 'c', label: '2 + 15' },
    ],
    correctId: 'a',
    hint: 'Start with 2. How much more do you need to reach 9?',
    success: 'That’s right — 2 + 7 makes 9.',
    retry: 'Not quite. Look for a pair that adds up to 9.',
  },
  {
    id: 'complement',
    title: 'What number are\nwe looking for?',
    description: 'We have seen 2. Instead of trying every pair, look for the number that completes 9.',
    list: [2, 7, 11, 15],
    target: 9,
    prompt: '2 needs…',
    options: [
      { id: 'a', label: '5' },
      { id: 'b', label: '7' },
      { id: 'c', label: '11' },
    ],
    correctId: 'b',
    hint: 'Subtract the number you have from the target: 9 − 2.',
    success: 'Exactly. 9 − 2 = 7, so we look for 7.',
    retry: 'Try subtracting 2 from 9.',
  },
  {
    id: 'transfer',
    title: 'Find one more\nmatch.',
    description: 'Same idea, new list. Which pair reaches the target this time?',
    list: [3, 5, 6, 10],
    target: 11,
    prompt: 'Choose a pair',
    options: [
      { id: 'a', label: '3 + 6' },
      { id: 'b', label: '5 + 10' },
      { id: 'c', label: '5 + 6' },
    ],
    correctId: 'c',
    hint: 'Pick 5. What number completes 11?',
    success: 'You found it. 5 + 6 = 11!',
    retry: 'Close! Add both numbers and compare with 11.',
  },
];
