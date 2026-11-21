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
  difficulty: 'Easy' | 'Medium' | 'Hard';
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
    id: 'tree-traversals', number: '03', title: 'Tree Traversals', pattern: 'Tree DFS', difficulty: 'Easy', leetcode: '#94',
    intro: 'Visit every node of a binary tree. The order changes when you visit the root: before, between, or after its children.',
    takeaway: 'Preorder visits root first, inorder visits root between left and right, and postorder visits root last.',
    questions: [
      {
        id: 'tree-preorder', title: 'Root comes first.',
        description: 'Preorder means root → left subtree → right subtree. Trace the tree from A.',
        example: 'A is the root. B and C are its children.', prompt: 'Tap the nodes in preorder.',
        options: [
          { id: 'a', label: 'A → B → D → E → C → F → G' },
          { id: 'b', label: 'D → B → E → A → F → C → G' },
          { id: 'c', label: 'D → E → B → F → G → C → A' },
        ], correctId: 'a', hint: 'Visit A before anything below it. Then fully visit the left subtree.',
        success: 'Yes! The root is first, followed by each left and right subtree.', retry: 'Preorder starts at the root A.',
      },
      {
        id: 'tree-inorder', title: 'Root in the middle.',
        description: 'Inorder means left subtree → root → right subtree. For a binary search tree, this gives sorted values.',
        example: 'Visit all of B’s subtree before A.', prompt: 'Tap the nodes in inorder.',
        options: [
          { id: 'a', label: 'A → B → D → E → C → F → G' },
          { id: 'b', label: 'D → B → E → A → F → C → G' },
          { id: 'c', label: 'D → E → B → F → G → C → A' },
        ], correctId: 'b', hint: 'Within B’s subtree, visit D, then B, then E. A follows the entire left side.',
        success: 'Exactly. The root appears between its left and right subtrees.', retry: 'Inorder visits left, root, then right at every branch.',
      },
      {
        id: 'tree-postorder', title: 'Root comes last.',
        description: 'Postorder means left subtree → right subtree → root. Finish both children before their parent.',
        example: 'A is visited only after B and C are finished.', prompt: 'Tap the nodes in postorder.',
        options: [
          { id: 'a', label: 'A → B → D → E → C → F → G' },
          { id: 'b', label: 'D → B → E → A → F → C → G' },
          { id: 'c', label: 'D → E → B → F → G → C → A' },
        ], correctId: 'c', hint: 'Finish D and E before B; finish F and G before C; finish B and C before A.',
        success: 'Right! Every parent waits until both subtrees have been visited.', retry: 'In postorder, A must be the final node.',
      },
    ],
  },
  {
    id: 'longest-substring', number: '04', title: 'Longest Substring', pattern: 'Sliding window', difficulty: 'Medium', leetcode: '#3',
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
  {
    id: 'merge-sorted-arrays', number: '05', title: 'Merge Sorted Array', pattern: 'Two pointers', difficulty: 'Easy', leetcode: '#88',
    intro: 'Merge two sorted arrays into the first array without allocating another result array.',
    takeaway: 'Fill the destination from the back, where there is empty space.',
    questions: [
      {
        id: 'merge-backwards', title: 'Start at the back.',
        description: 'The first array has room at the end for every value in the second array.',
        example: 'nums1 = [1, 2, 3, 0, 0, 0]\nnums2 = [2, 5, 6]', prompt: 'Where should you write the largest value first?',
        options: [{ id: 'a', label: 'nums1[0]' }, { id: 'b', label: 'nums1[3]' }, { id: 'c', label: 'nums1[5]' }], correctId: 'c',
        hint: 'Use the final open slot so you do not overwrite an unmerged value.', success: 'Right. Write 6 at the final index, then move left.', retry: 'The empty slots are at the end of nums1.',
      },
      {
        id: 'merge-code', title: 'Build the merge.',
        description: 'Compare the last unused value of each array and fill nums1 from right to left.',
        example: '[1, 2, 3] + [2, 5, 6] → [1, 2, 2, 3, 5, 6]', prompt: 'Drag the lines into order.',
        code: { before: 'def merge(nums1, m, nums2, n):\n    i, j, write = m - 1, n - 1, m + n - 1\n    while j >= 0:', blocks: [
          { id: 'from-first', text: '        if i >= 0 and nums1[i] > nums2[j]:\n            nums1[write] = nums1[i]\n            i -= 1' },
          { id: 'from-second', text: '        else:\n            nums1[write] = nums2[j]\n            j -= 1' },
          { id: 'move-write', text: '        write -= 1' },
        ], solutionIds: ['from-first', 'from-second', 'move-write'] },
        hint: 'Choose the larger remaining value, then move the write position left.', success: 'Exactly. Writing backward preserves the values you still need.', retry: 'Compare the two last values before moving the write pointer.',
      },
    ],
  },
  {
    id: 'binary-search', number: '06', title: 'Binary Search', pattern: 'Binary search', difficulty: 'Easy', leetcode: '#704',
    intro: 'Find a target in a sorted array by discarding half the remaining range each step.',
    takeaway: 'Compare the midpoint, then keep only the half that can contain the target.',
    questions: [
      {
        id: 'binary-half', title: 'Discard half.', description: 'The array is sorted in ascending order.',
        example: 'nums = [1, 3, 5, 7, 9]\ntarget = 9\nmid = 5', prompt: 'Which side can still contain 9?',
        options: [{ id: 'a', label: 'The left side' }, { id: 'b', label: 'The right side' }, { id: 'c', label: 'Both sides' }], correctId: 'b',
        hint: '9 is greater than the midpoint value 5.', success: 'Yes. Every value left of 5 is even smaller.', retry: 'Compare the target with the midpoint value.',
      },
      {
        id: 'binary-code', title: 'Build the search.', description: 'Keep narrowing the inclusive search range until you find the target.',
        example: 'nums = [-1, 0, 3, 5, 9, 12]\ntarget = 9 → index 4', prompt: 'Drag the lines into order.',
        code: { before: 'def search(nums, target):\n    left, right = 0, len(nums) - 1\n    while left <= right:', after: '    return -1', blocks: [
          { id: 'mid', text: '        mid = (left + right) // 2' },
          { id: 'found', text: '        if nums[mid] == target:\n            return mid' },
          { id: 'narrow', text: '        if nums[mid] < target:\n            left = mid + 1\n        else:\n            right = mid - 1' },
        ], solutionIds: ['mid', 'found', 'narrow'] },
        hint: 'Compute mid, check for a match, then choose the remaining half.', success: 'Correct. Each comparison removes half of the candidates.', retry: 'Check the midpoint before changing the range.',
      },
    ],
  },
  {
    id: 'maximum-subarray', number: '07', title: 'Maximum Subarray', pattern: 'Dynamic programming', difficulty: 'Medium', leetcode: '#53',
    intro: 'Find the contiguous subarray with the largest sum, even when numbers are negative.',
    takeaway: 'At each value, decide whether to extend the current run or start fresh.',
    questions: [
      {
        id: 'kadane-choice', title: 'Extend or restart?', description: 'The best sum ending at this position can either extend the previous run or begin here.',
        example: 'current sum = -4\nnext number = 6', prompt: 'What should the new current sum be?',
        options: [{ id: 'a', label: '2: extend -4 + 6' }, { id: 'b', label: '6: start fresh' }, { id: 'c', label: '-4: keep the old run' }], correctId: 'b',
        hint: 'Compare 6 with -4 + 6.', success: 'Exactly. A negative prefix would only make the new run worse.', retry: 'Choose the larger of the current number and the extended sum.',
      },
      {
        id: 'kadane-code', title: 'Build Kadane’s algorithm.', description: 'Update the best sum ending here, then the best sum seen overall.',
        example: 'nums = [-2, 1, -3, 4, -1, 2, 1] → 6', prompt: 'Drag the lines into order.',
        code: { before: 'def max_sub_array(nums):\n    current = best = nums[0]\n    for number in nums[1:]:', after: '    return best', blocks: [
          { id: 'current', text: '        current = max(number, current + number)' },
          { id: 'best', text: '        best = max(best, current)' },
        ], solutionIds: ['current', 'best'] },
        hint: 'Update the sum ending here before comparing it with the global best.', success: 'Yes. The answer is the best contiguous run seen anywhere.', retry: 'The global best needs the updated current sum.',
      },
    ],
  },
  {
    id: 'three-sum', number: '08', title: '3Sum', pattern: 'Sort + two pointers', difficulty: 'Medium', leetcode: '#15',
    intro: 'Find every unique triplet of numbers that adds up to zero.',
    takeaway: 'Sort first, fix one number, then search the remaining range with two pointers while skipping duplicates.',
    questions: [
      { id: 'three-sum-triplets', title: 'Find unique triplets.', description: 'The order of numbers inside a triplet does not make a new answer.',
        example: 'nums = [-1, 0, 1, 2, -1, -4]', prompt: 'Which set of triplets is correct?',
        options: [{ id: 'a', label: '[[-1, -1, 2], [-1, 0, 1]]' }, { id: 'b', label: '[[-1, 0, 1], [0, 1, 2]]' }, { id: 'c', label: '[[-4, 2, 2], [-1, -1, 2]]' }], correctId: 'a',
        hint: 'Every triplet must sum to zero, and each must use positions that exist in nums.', success: 'Yes. Those are the two distinct zero-sum triplets.', retry: 'Check the sum and available copies of each value.' },
      { id: 'three-sum-pointers', title: 'Move the right pointer.', description: 'After sorting, fix -1 and search for two values summing to 1.',
        example: 'sorted = [-4, -1, -1, 0, 1, 2]\nfixed = -1, left = 0, right = 2\nsum = 1', prompt: 'The sum is too large. Which pointer moves?',
        options: [{ id: 'a', label: 'Move left rightward' }, { id: 'b', label: 'Move right leftward' }, { id: 'c', label: 'Keep both pointers still' }], correctId: 'b',
        hint: 'A smaller value is needed. The array is sorted.', success: 'Correct. Moving right leftward lowers the sum.', retry: 'To lower a sorted pair’s sum, move the right pointer left.' },
    ],
  },
  {
    id: 'trapping-rain-water', number: '09', title: 'Trapping Rain Water', pattern: 'Two pointers', difficulty: 'Hard', leetcode: '#42',
    intro: 'Given bar heights, count how much rainwater is trapped between them.',
    takeaway: 'Water above a bar is limited by the shorter of the tallest barriers to its left and right.',
    questions: [
      {
        id: 'rain-water-one', title: 'Find the water above one bar.',
        description: 'A bar can hold water only when taller bars bound it on both sides.',
        example: 'height = [0, 3, 0, 2, 0, 4]\nindex = 2, height[2] = 0', prompt: 'How many units of water sit above index 2?',
        options: [{ id: 'a', label: '0 units' }, { id: 'b', label: '2 units' }, { id: 'c', label: '3 units' }], correctId: 'c',
        hint: 'The tallest bar on the left is 3. The tallest on the right is 4.',
        success: 'Yes. min(3, 4) − 0 = 3 units.', retry: 'Use the shorter barrier, then subtract this bar’s height.',
      },
      {
        id: 'rain-water-rule', title: 'Which barrier decides?',
        description: 'For each position, compare the tallest barrier seen on either side.',
        example: 'left max = 5\nright max = 3\ncurrent height = 1', prompt: 'How much water can this bar hold?',
        options: [{ id: 'a', label: '4 units: 5 − 1' }, { id: 'b', label: '2 units: 3 − 1' }, { id: 'c', label: '0 units' }], correctId: 'b',
        hint: 'Water spills over the shorter side first.', success: 'Correct. The right barrier limits the water level to 3.',
        retry: 'Take min(left max, right max), then subtract the bar height.',
      },
      {
        id: 'rain-water-code', title: 'Build the two-pointer scan.',
        description: 'Move the side with the shorter current bar. Its water level is decided by that side’s running maximum.',
        example: 'height = [0, 3, 0, 2, 0, 4] → 7 units', prompt: 'Drag the Python blocks into order.',
        code: { before: 'def trap(height):\n    left, right = 0, len(height) - 1\n    left_max = right_max = water = 0\n    while left < right:', blocks: [
          { id: 'left', text: '        if height[left] < height[right]:\n            left_max = max(left_max, height[left])\n            water += left_max - height[left]\n            left += 1' },
          { id: 'right', text: '        else:\n            right_max = max(right_max, height[right])\n            water += right_max - height[right]\n            right -= 1' },
          { id: 'finish', text: '    return water' },
        ], solutionIds: ['left', 'right', 'finish'] },
        hint: 'Handle the left side, then the right side, then return the total.',
        success: 'You built the O(n) scan with constant extra space.', retry: 'The if and else branches must stay together before the return.',
      },
    ],
  },
  {
    id: 'minimum-window-substring', number: '10', title: 'Minimum Window Substring', pattern: 'Sliding window', difficulty: 'Hard', leetcode: '#76',
    intro: 'Find the shortest substring containing every character of a target, including repeated characters.',
    takeaway: 'Expand right until the window is valid, then shrink left while keeping it valid.',
    questions: [
      { id: 'min-window-counts', title: 'Duplicates matter.', description: 'A window must contain target characters with the required counts.',
        example: 's = "ABAAC"\nt = "AAC"', prompt: 'Which window is the shortest valid one?',
        options: [{ id: 'a', label: '"AC"' }, { id: 'b', label: '"AAC"' }, { id: 'c', label: '"ABAAC"' }], correctId: 'b',
        hint: 'The target contains two A characters and one C.', success: 'Right. "AAC" has exactly the needed counts.', retry: 'One A is not enough for target "AAC".' },
      { id: 'min-window-shrink', title: 'Shrink while valid.', description: 'Once a window contains every required character, try removing its leftmost character.',
        example: 's = "ADOBECODEBANC"\nt = "ABC"\ncurrent valid window = "ADOBEC"', prompt: 'What should the algorithm try next?',
        options: [{ id: 'a', label: 'Move left rightward and keep the window if still valid' }, { id: 'b', label: 'Return immediately' }, { id: 'c', label: 'Move left backward' }], correctId: 'a',
        hint: 'A valid window may contain extra characters at its left edge.', success: 'Exactly. Shrinking a valid window may find a shorter answer.', retry: 'Try discarding unneeded characters from the left.' },
    ],
  },
  {
    id: 'validate-bst', number: '11', title: 'Validate Binary Search Tree', pattern: 'Tree DFS', difficulty: 'Medium', leetcode: '#98',
    intro: 'Decide whether every node in a binary tree obeys the binary-search-tree ordering rule.',
    takeaway: 'Pass an allowed lower and upper bound down the tree; comparing only parent and child is not enough.',
    questions: [
      { id: 'bst-global', title: 'The rule spans the tree.', description: 'A node in the right subtree of 5 must be greater than 5, even if its own parent is larger.',
        example: '    5\n   / \\ \n  1   7\n     / \\ \n    4   8', prompt: 'Is this a valid BST?',
        options: [{ id: 'a', label: 'Yes, 4 is less than its parent 7' }, { id: 'b', label: 'No, 4 is in the right subtree of 5' }, { id: 'c', label: 'Yes, the root is 5' }], correctId: 'b',
        hint: 'Everything to the right of 5 must be greater than 5.', success: 'Yes. The 4 violates the root’s lower bound.', retry: 'Check the root’s rule for every descendant, not only its direct children.' },
      { id: 'bst-bounds', title: 'Carry bounds downward.', description: 'DFS can pass a minimum and maximum allowed value into each subtree.',
        example: 'root = 5\nmove right to 7\nthen left to a child', prompt: 'What bounds should that child obey?',
        options: [{ id: 'a', label: '5 < child < 7' }, { id: 'b', label: 'child < 7 only' }, { id: 'c', label: '7 < child' }], correctId: 'a',
        hint: 'Right of 5 sets the lower bound; left of 7 sets the upper bound.', success: 'Correct. Both ancestor constraints apply.', retry: 'Keep the bound inherited from 5 as you descend.' },
    ],
  },
  {
    id: 'binary-tree-max-path', number: '12', title: 'Binary Tree Maximum Path Sum', pattern: 'Tree DFS', difficulty: 'Hard', leetcode: '#124',
    intro: 'Find the largest sum along any connected path in a binary tree. A path can start and end anywhere.',
    takeaway: 'At a node, update the global best with both branches, but return only one branch to the parent.',
    questions: [
      { id: 'tree-path-both', title: 'A path can turn.', description: 'The best path may pass through a node and use both its children.',
        example: '    10\n   /  \\ \n  4    7', prompt: 'What is the maximum path sum?',
        options: [{ id: 'a', label: '17: 10 → 7' }, { id: 'b', label: '21: 4 → 10 → 7' }, { id: 'c', label: '10: root only' }], correctId: 'b',
        hint: 'The path may start at one leaf and end at another.', success: 'Yes. Both branches meet at 10 for a total of 21.', retry: 'Try the connected path from 4 through 10 to 7.' },
      { id: 'tree-path-return', title: 'Return one branch.', description: 'A parent cannot extend a path that already splits into two branches.',
        example: 'node = 10\nleft gain = 4\nright gain = 7', prompt: 'What gain should this node return to its parent?',
        options: [{ id: 'a', label: '21: include both branches' }, { id: 'b', label: '17: node plus the better branch' }, { id: 'c', label: '7: the child alone' }], correctId: 'b',
        hint: 'The returned path must remain a single chain.', success: 'Right. Update the global best with 21, but return 10 + 7 = 17.', retry: 'A parent can connect to only one branch from this node.' },
    ],
  },
  {
    id: 'edit-distance', number: '13', title: 'Edit Distance', pattern: 'Dynamic programming', difficulty: 'Hard', leetcode: '#72',
    intro: 'Find the fewest insertions, deletions, or replacements needed to change one word into another.',
    takeaway: 'DP compares prefixes; when characters differ, choose the cheapest of insert, delete, and replace.',
    questions: [
      { id: 'edit-distance-small', title: 'Count the edits.', description: 'Each insertion, deletion, or replacement costs one step.',
        example: 'word1 = "cat"\nword2 = "cut"', prompt: 'What is the edit distance?',
        options: [{ id: 'a', label: '0' }, { id: 'b', label: '1: replace a with u' }, { id: 'c', label: '2: delete then insert' }], correctId: 'b',
        hint: 'Only the middle character differs.', success: 'Exactly. One replacement is enough.', retry: 'Look for a single operation that changes a to u.' },
      { id: 'edit-distance-choice', title: 'Choose the cheapest edit.', description: 'When the last characters differ, compare three neighboring DP cells.',
        example: 'insert cost before +1 = 4\ndelete cost before +1 = 3\nreplace cost before +1 = 2', prompt: 'What value belongs in this DP cell?',
        options: [{ id: 'a', label: '2' }, { id: 'b', label: '3' }, { id: 'c', label: '4' }], correctId: 'a',
        hint: 'Take the minimum of the three possible operations.', success: 'Yes. Replacement is the cheapest path here.', retry: 'Pick the smallest total cost.' },
    ],
  },
];

export function getLesson(id: string | undefined): Lesson {
  return lessons.find((lesson) => lesson.id === id) ?? lessons[0];
}
