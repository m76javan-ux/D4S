import { z } from 'zod';

// Schema for Pronunciation Analysis
export const PronunciationSchema = z.object({
  targetText: z.string().min(1).max(500),
  recognizedText: z.string().min(1).max(500),
});

// Schema for Updating SRS/Progress
export const SRSUpdateSchema = z.object({
  sourceId: z.string().min(1),
  sourceType: z.enum(['vocabulary', 'grammar', 'idiom']),
  score: z.number().min(0).max(1), // 0 to 1 accuracy
  timeTaken: z.number().optional(),
});

// Schema for the AI Teacher Chat
export const ChatSchema = z.object({
  question: z.string().min(1).max(1000),
  history: z.array(z.object({
    role: z.enum(['user', 'model']),
    text: z.string()
  })).optional(),
});
