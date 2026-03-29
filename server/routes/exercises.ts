import express from 'express';
import { verifyToken } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { z } from 'zod';
import { adminDb } from '../firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';

const router = express.Router();

const VerifyExerciseSchema = z.object({
  exerciseId: z.string(),
  isCorrect: z.boolean(),
  userOrder: z.array(z.string()).optional(),
  mistakeType: z.string().optional(),
});

router.post('/verify', verifyToken, validate(VerifyExerciseSchema), async (req, res) => {
  try {
    const { exerciseId, isCorrect, userOrder, mistakeType } = req.body;
    // @ts-ignore
    const uid = req.user.uid;

    const attemptRef = adminDb.collection('users').doc(uid).collection('exercise_attempts').doc();
    
    await attemptRef.set({
      exerciseId,
      isCorrect,
      userOrder: userOrder || [],
      mistakeType: mistakeType || 'NONE',
      timestamp: FieldValue.serverTimestamp(),
    });

    res.json({ success: true, attemptId: attemptRef.id });
  } catch (error) {
    console.error('Error verifying exercise:', error);
    res.status(500).json({ error: 'Failed to verify exercise' });
  }
});

export default router;
