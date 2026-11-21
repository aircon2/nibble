import type { Question } from '@/data/lessons';

export type ChatMessage = { role: 'user' | 'assistant'; text: string };

/** Gemini stays behind the local backend; the app never receives its API key. */
export async function askNibble(question: Question, selectedId: string | null, message: string, history: ChatMessage[]): Promise<string> {
  const hintEndpoint = process.env.EXPO_PUBLIC_HINT_API_URL;
  if (!hintEndpoint) throw new Error('Chat is not connected. Start the hint server to ask Nibble.');

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 12000);
  try {
    const response = await fetch(hintEndpoint.replace(/\/hint\/?$/, '/chat'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      signal: controller.signal,
      body: JSON.stringify({
        questionId: question.id,
        selectedId,
        message: message.slice(0, 500),
        history: history.slice(-6),
      }),
    });
    if (!response.ok) throw new Error('Nibble could not reply right now. Try again.');
    const data: unknown = await response.json();
    if (typeof data !== 'object' || data === null || !('reply' in data) || typeof data.reply !== 'string' || !data.reply.trim()) {
      throw new Error('Nibble sent an empty reply. Try again.');
    }
    return data.reply.trim().slice(0, 650);
  } catch (error) {
    if (controller.signal.aborted) throw new Error('Nibble took too long to reply. Try again.');
    throw error;
  } finally {
    clearTimeout(timeout);
  }
}
