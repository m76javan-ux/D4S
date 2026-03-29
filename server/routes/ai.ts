import express, { Response } from 'express';
import { GoogleGenAI } from '@google/genai';
import { verifyToken, AuthRequest } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { PronunciationSchema } from '../schemas/validation';

const router = express.Router();

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY!,
});

router.post('/analyze-pronunciation', verifyToken, validate(PronunciationSchema), async (req: AuthRequest, res: Response) => {
  const { recognizedText, targetText } = req.body;

  try {
    const prompt = `
You are a Dutch pronunciation coach for Farsi speakers.
Target Dutch: "${targetText}"
User said: "${recognizedText}"

Give short, encouraging feedback in Farsi.
If useful, explain Dutch sounds such as G or SCH using Persian sound comparisons.
Keep it concise.
`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    return res.json({
      feedback: response.text || 'بازخورد در دسترس نیست.',
    });
  } catch (error) {
    console.error('Pronunciation AI error:', error);
    return res.status(500).json({ error: 'AI Error. Please try again.' });
  }
});

export default router;
