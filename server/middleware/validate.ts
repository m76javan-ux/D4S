import { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodError } from 'zod';

export const validate = (schema: ZodSchema) => 
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      await schema.parseAsync(req.body);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({
          error: 'فرمت دادهها اشتباه است (Invalid data format)',
          details: (error as any).errors.map((e: any) => ({ path: e.path, message: e.message }))
        });
      }
      res.status(500).json({ error: 'Internal Server Error' });
    }
  };
