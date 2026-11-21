type QuestionBase = {
  id: string;
  title: string;
  description: string;
  example: string;
  prompt: string;
  hint: string;
  success: string;
  retry: string;
};

export type CodePuzzle = {
  before: string;
  after?: string;
  blocks: { id: string; text: string }[];
  solutionIds: string[];
};

export type Question = QuestionBase & (
  | { options: { id: string; label: string }[]; correctId: string; code?: never }
  | { code: CodePuzzle; options?: never; correctId?: never }
);

export type Lesson = {
  id: string;
  number: string;
  title: string;
  pattern: string;
  difficulty: 'Easy' | 'Medium';
  leetcode: string;
  intro: string;
  takeaway: string;
  questions: Question[];
};

// Original mobile exercises based on real LeetCode problem patterns.
// Fixed answers keep the demo reliable even when Gemini is unavailable.
export const lessons: Lesson[] = [
  {
    id: 'two-sum', number: '01', title: 'Two Sum', pattern: 'Hash map', difficulty: 'Easy', leetcode: '#1',
    intro: 'Return the indices of two different numbers that add up to the target.',
    takeaway: 'Look up the complement in a hash map before storing the current number.',
    questions: [
      {
        id: 'two-sum-indices', title: 'Return indices,\nnot values.',
        description: 'Two Sum asks where the matching numbers are. Indices start at 0.',
        example: 'nums = [3, 2, 4]\ntarget = 6', prompt: 'Which indices do you return?',
        options: [{ id: 'a', label: '[0, 0]' }, { id: 'b', label: '[1, 2]' }, { id: 'c', label: '[0, 2]' }],
        correctId: 'b', hint: 'Find two different positions whose values add to 6.',
        success: 'Yes. nums[1] + nums[2] is 2 + 4 = 6.',
        retry: 'Use two different indices whose values sum to 6.',
      },
      {
        id: 'two-sum-duplicate', title: 'Equal values.\nDifferent positions.',
        description: 'You can use equal values when they come from different positions.',
        example: 'nums = [3, 3]\ntarget = 6', prompt: 'What is the valid answer?',
        options: [{ id: 'a', label: '[0, 0]' }, { id: 'b', label: '[0, 1]' }, { id: 'c', label: 'No solution' }],
        correctId: 'b', hint: 'The two 3s live at different indices.',
        success: 'Exactly. Indices 0 and 1 are distinct, even though both values are 3.',
        retry: 'Look at the positions of the two 3s.',
      },
      {
        id: 'two-sum-hash', title: 'Make it one pass.',
        description: 'A hash map remembers values you have seen and their indices.',
        example: 'for each number:\n  need = target - number\n  ?\n  remember number and index',
        prompt: 'What belongs at the question mark?',
        options: [
          { id: 'a', label: 'If need is in the map, return both indices' },
          { id: 'b', label: 'Sort and return the new indices' },
          { id: 'c', label: 'Try every pair from the beginning' },
        ],
        correctId: 'a', hint: 'Ask whether the needed partner was seen earlier.',
        success: 'That is the O(n) hash map solution. Check first, then store.',
        retry: 'Use the map to find a previously seen partner.',
      },
      {
        id: 'two-sum-code', title: 'Build the one-pass solution.',
        description: 'Put the missing Python lines in order. Check for the partner before remembering this number.',
        example: 'nums = [2, 7, 11, 15]\ntarget = 9 → [0, 1]',
        prompt: 'Drag the lines into the code slots.',
        code: {
          before: 'def two_sum(nums, target):\n    seen = {}\n    for i, number in enumerate(nums):',
          blocks: [
            { id: 'store', text: '        seen[number] = i' },
            { id: 'find', text: '        if need in seen:\n            return [seen[need], i]' },
            { id: 'need', text: '        need = target - number' },
          ],
          solutionIds: ['need', 'find', 'store'],
        },
        hint: 'First compute the complement. Then look it up. Only then store the current number.',
        success: 'You built the O(n) hash map solution. One scan, one lookup per number.',
        retry: 'The lookup must happen before you store the current number.',
      },
    ],
  },
  {
    id: 'valid-parentheses', number: '02', title: 'Valid Parentheses', pattern: 'Stack', difficulty: 'Easy', leetcode: '#20',
    intro: 'Check whether every opening bracket closes in the correct order.',
    takeaway: 'The most recent opening bracket must be the first one closed.',
    questions: [
      {
        id: 'brackets-order', title: 'The order matters.',
        description: 'Matching counts are not enough. The latest opening bracket must close first.',
        example: 's = "([)]"', prompt: 'Is this string valid?',
        options: [
          { id: 'a', label: 'Yes, it has one of each bracket' },
          { id: 'b', label: 'No, ) appears while [ is on top' },
          { id: 'c', label: 'Yes, both pairs eventually close' },
        ],
        correctId: 'b', hint: 'Which opening bracket is most recent when you reach )?',
        success: 'Right. The stack top is [, so ) is a mismatch.',
        retry: 'A closing bracket must match the latest unclosed opening bracket.',
      },
      {
        id: 'brackets-finish', title: 'Check the stack\nat the end.',
        description: 'Push openings. Pop a matching top item for each closing bracket.',
        example: 's = "(()"\nstack after scan = (', prompt: 'What should the algorithm return?',
        options: [
          { id: 'a', label: 'true: no mismatch happened' },
          { id: 'b', label: 'false: the stack is not empty' },
          { id: 'c', label: 'true: two ( were found' },
        ],
        correctId: 'b', hint: 'A leftover opening bracket never found its closing partner.',
        success: 'Exactly. No mismatch occurred, but one ( is still open.',
        retry: 'Check the stack after scanning. One ( remains.',
      },
      {
        id: 'brackets-code', title: 'Complete the stack scan.',
        description: 'Build the core of the Valid Parentheses solution. The stack remembers opening brackets.',
        example: 's = "([])" → true\ns = "([)]" → false',
        prompt: 'Drag the lines into the code slots.',
        code: {
          before: 'def is_valid(s):\n    pairs = {")": "(", "]": "[", "}": "{"}\n    stack = []\n    for ch in s:',
          blocks: [
            { id: 'mismatch', text: '        elif not stack or stack.pop() != pairs[ch]:\n            return False' },
            { id: 'finish', text: '    return not stack' },
            { id: 'push', text: '        if ch in "([{":\n            stack.append(ch)' },
          ],
          solutionIds: ['push', 'mismatch', 'finish'],
        },
        hint: 'Push openings, reject a closing mismatch, then make sure nothing is left open.',
        success: 'Yes. The stack enforces both the matching type and closing order.',
        retry: 'Handle opening brackets before the closing-bracket case; check the stack after the loop.',
      },
    ],
  },
  {
    id: 'longest-substring', number: '03', title: 'Longest Substring', pattern: 'Sliding window', difficulty: 'Medium', leetcode: '#3',
    intro: 'Find the longest contiguous stretch with no repeated characters.',
    takeaway: 'Slide the left edge past a repeat; never move it backward.',
    questions: [
      {
        id: 'substring-length', title: 'Find the longest\nclean window.',
        description: 'A substring is contiguous. Every character in the window must be unique.',
        example: 's = "pwwkew"', prompt: 'What is the longest length?',
        options: [{ id: 'a', label: '2' }, { id: 'b', label: '3' }, { id: 'c', label: '4' }],
        correctId: 'b', hint: 'Look at a contiguous run like "wke" or "kew".',
        success: 'Yes. "wke" and "kew" each contain 3 unique characters.',
        retry: 'Do not skip characters. A substring must stay contiguous.',
      },
      {
        id: 'substring-repeat', title: 'A repeat appears.',
        description: 'Track each character’s last index and the left edge of your window.',
        example: 's = "abba"\nindices: 0 1 2 3\nreading the second b at index 2',
        prompt: 'Where should the left edge move?',
        options: [{ id: 'a', label: 'index 1' }, { id: 'b', label: 'index 2' }, { id: 'c', label: 'index 3' }],
        correctId: 'b', hint: 'The previous b was at index 1. Start just after it.',
        success: 'Right. Move left to 1 + 1 = 2.',
        retry: 'Move left one position after the previous b.',
      },
      {
        id: 'substring-left', title: 'Never move back.',
        description: 'A character may have last appeared before the current window.',
        example: 's = "abba"\nafter index 2: left = 2\nnext: a at index 3 (last seen at 0)',
        prompt: 'What should left be now?',
        options: [{ id: 'a', label: '0' }, { id: 'b', label: '1' }, { id: 'c', label: '2' }],
        correctId: 'c', hint: 'The old a is outside the window. Keep left where it is.',
        success: 'Exactly. left = max(left, lastSeen[a] + 1), so it stays 2.',
        retry: 'Do not move left backward for a repeat outside the window.',
      },
      {
        id: 'substring-code', title: 'Build the sliding window.',
        description: 'Move the left edge past repeated characters, then update the best window length.',
        example: 's = "pwwkew" → 3',
        prompt: 'Drag the lines into the code slots.',
        code: {
          before: 'def length_of_longest_substring(s):\n    left = 0\n    last_seen = {}\n    best = 0\n    for right, ch in enumerate(s):',
          after: '    return best',
          blocks: [
            { id: 'best', text: '        best = max(best, right - left + 1)' },
            { id: 'left', text: '        if ch in last_seen:\n            left = max(left, last_seen[ch] + 1)' },
            { id: 'remember', text: '        last_seen[ch] = right' },
          ],
          solutionIds: ['left', 'remember', 'best'],
        },
        hint: 'Move left if needed, remember where this character appeared, then measure the current window.',
        success: 'Exactly. The left edge never moves backward, so the window stays valid.',
        retry: 'Fix the left edge before you measure the current window.',
      },
    ],
  },
];

export function getLesson(id: string | undefined): Lesson {
  return lessons.find((lesson) => lesson.id === id) ?? lessons[0];
}
