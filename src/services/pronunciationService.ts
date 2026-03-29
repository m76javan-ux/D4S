import { auth } from '../firebase';

export async function analyzePronunciation(recognizedText: string, targetText: string) {
  const user = auth.currentUser;
  if (!user) return 'Please log in first.';

  try {
    const token = await user.getIdToken();

    const res = await fetch('/api/ai/analyze-pronunciation', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ recognizedText, targetText }),
    });

    const data = await res.json();
    return data.feedback || data.error || 'Could not analyze pronunciation.';
  } catch (error) {
    console.error("Pronunciation analysis error:", error);
    return "Could not analyze pronunciation. Please try again.";
  }
}
