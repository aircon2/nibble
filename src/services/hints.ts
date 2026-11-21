import type { Question } from '@/data/lesson';

/** The optional endpoint keeps the Gemini key on a server, never in the app. */
export async function getHint(question: Question, selectedId: string | null): Promise<string> {
  const endpoint = process.env.EXPO_PUBLIC_HINT_API_URL;
  if (!endpoint) return question.hint;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 5000);
  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      signal: controller.signal,
      body: JSON.stringify({
        questionId: question.id,
        title: question.title,
        list: question.list,
        target: question.target,
        options: question.options,
        selectedId,
      }),
    });
    if (!response.ok) throw new Error('Hint endpoint unavailable');
    const data: unknown = await response.json();
    if (typeof data === 'object' && data !== null && 'hint' in data && typeof data.hint === 'string') {
      return data.hint.slice(0, 220);
    }
  } catch {
    // Keep the lesson usable offline and during a live demo.
  } finally {
    clearTimeout(timeout);
  }
  return question.hint;
}
