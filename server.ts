import dotenv from "dotenv";
dotenv.config();
import express from "express";
import multer from "multer";
import { createRequire } from "module";
const require = createRequire(import.meta.url);
const pdfParse = require("pdf-parse");
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import { adminDb } from "./server/firebase-admin";
import { askTeacher } from "./server/aiTeacher";
import aiRoutes from "./server/routes/ai";
import exerciseRoutes from "./server/routes/exercises";
import { verifyToken } from "./server/middleware/auth";
import { validate } from "./server/middleware/validate";
import { ChatSchema } from "./server/schemas/validation";
import { seedDatabase } from "./server/seed-data";
import { seedLargeDatabase } from "./server/seed-large";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Mount AI routes
  app.use("/api/ai", aiRoutes);
  app.use("/api/exercises", exerciseRoutes);

  // API routes
  app.post("/api/seed", async (req, res) => {
    try {
      await seedDatabase();
      res.json({ success: true, message: "Database seeded successfully." });
    } catch (error: any) {
      console.error("Seeding error:", error);
      res.status(500).json({ error: "Failed to seed database: " + error.message });
    }
  });

  app.post("/api/seed-vocabulary-extra", verifyToken, async (req, res) => {
    try {
      const newWords = [
        { dutch: "Fietsen", farsi: "دوچرخه‌سواری کردن", type: "Verb", level: "A1", exampleSentence: "Ik fiets naar school." },
        { dutch: "De koffie", farsi: "قهوه", type: "Noun", level: "A1", exampleSentence: "Ik drink graag koffie." },
        { dutch: "De thee", farsi: "چای", type: "Noun", level: "A1", exampleSentence: "Wil je thee drinken?" },
        { dutch: "Koud", farsi: "سرد", type: "Adjective", level: "A1", exampleSentence: "Het is koud buiten." },
        { dutch: "Warm", farsi: "گرم", type: "Adjective", level: "A1", exampleSentence: "De soep is warm." },
        { dutch: "De winkel", farsi: "فروشگاه", type: "Noun", level: "A2", exampleSentence: "Ik ga naar de winkel." },
        { dutch: "Koken", farsi: "آشپزی کردن", type: "Verb", level: "A2", exampleSentence: "Hij kookt het eten." },
        { dutch: "De vriend", farsi: "دوست", type: "Noun", level: "A2", exampleSentence: "Hij is mijn beste vriend." },
        { dutch: "Bellen", farsi: "تماس گرفتن", type: "Verb", level: "A2", exampleSentence: "Ik bel mijn moeder." },
        { dutch: "Wachten", farsi: "منتظر ماندن", type: "Verb", level: "A2", exampleSentence: "Ik wacht op de bus." }
      ];

      const batch = adminDb.batch();
      newWords.forEach((word) => {
        const ref = adminDb.collection("vocabulary").doc();
        batch.set(ref, {
          ...word,
          type: "word",
          createdAt: new Date().toISOString()
        });
      });

      await batch.commit();
      res.json({ success: true, message: `Added ${newWords.length} new vocabulary items.` });
    } catch (error: any) {
      console.error("Vocabulary seeding error:", error);
      res.status(500).json({ error: "Failed to seed vocabulary: " + error.message });
    }
  });

  app.get("/api/library", async (req, res) => {
    try {
      const vocabSnap = await adminDb.collection("vocabulary").limit(100).get();
      const grammarSnap = await adminDb.collection("grammar").limit(100).get();
      
      const vocabulary = vocabSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      const grammar = grammarSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      
      res.json({ vocabulary, grammar });
    } catch (error) {
      console.error("Library fetch error:", error);
      res.status(500).json({ error: "Failed to fetch library items. Ensure database is seeded." });
    }
  });

  app.post("/api/askAI", verifyToken, validate(ChatSchema), async (req, res) => {
    try {
      const { question, history } = req.body;
      const answer = await askTeacher(question, history || []);
      res.json({ answer });
    } catch (error: any) {
      console.error("AI Teacher error:", error);
      res.status(500).json({ error: "Failed to get response from AI Tutor: " + error.message });
    }
  });

  app.post("/api/update-grammar-phonetics", verifyToken, async (req, res) => {
    try {
      const grammarSnap = await adminDb.collection("grammar").get();
      const updates: Promise<any>[] = [];

      for (const doc of grammarSnap.docs) {
        const data = doc.data();
        if (!data.examples) continue;

        let examples = Array.isArray(data.examples) ? data.examples : [data.examples];
        
        // Check if all examples have a phonetic guide (assuming new structure is object)
        const needsUpdate = examples.some((ex: any) => typeof ex === 'string' || !ex.phonetic);
        if (!needsUpdate) continue;

        const updatedExamples = await Promise.all(examples.map(async (ex: any) => {
          const dutch = typeof ex === 'string' ? ex : ex.dutch;
          
          const prompt = `
            You are an expert Dutch language tutor for Farsi speakers.
            Provide a phonetic pronunciation guide for the Dutch sentence: "${dutch}".
            The guide should be easy for a Farsi speaker to read and understand, using Farsi characters.
            Return ONLY the phonetic guide text.
          `;
          
          const phonetic = await askTeacher(prompt, []);
          return {
            dutch,
            farsi: typeof ex === 'string' ? "" : (ex.farsi || ""),
            phonetic
          };
        }));
        
        updates.push(doc.ref.update({ examples: updatedExamples }));
      }
      
      await Promise.all(updates);
      res.json({ success: true, message: `Updated ${updates.length} grammar rules.` });
    } catch (error: any) {
      console.error("Grammar phonetic update error:", error);
      res.status(500).json({ error: "Failed to update grammar rules: " + error.message });
    }
  });

  app.post("/api/update-vocabulary-pronunciation", verifyToken, async (req, res) => {
    try {
      const vocabSnap = await adminDb.collection("vocabulary").get();
      const updates: Promise<any>[] = [];

      for (const doc of vocabSnap.docs) {
        const data = doc.data();
        // Only update if pronunciation is missing
        if (data.pronunciation) continue;

        const prompt = `
          You are an expert Dutch language tutor for Farsi speakers.
          Provide a phonetic pronunciation guide for the Dutch word: "${data.dutch}".
          The guide should be easy for a Farsi speaker to read and understand, using Farsi characters.
          Return ONLY the phonetic guide text.
        `;
        
        const pronunciation = await askTeacher(prompt, []);
        updates.push(doc.ref.update({ pronunciation }));
      }
      
      await Promise.all(updates);
      res.json({ success: true, message: `Updated ${updates.length} vocabulary items.` });
    } catch (error: any) {
      console.error("Vocabulary update error:", error);
      res.status(500).json({ error: "Failed to update vocabulary: " + error.message });
    }
  });

  app.post("/api/refine-idiom-farsi", verifyToken, async (req, res) => {
    try {
      const idiomSnap = await adminDb.collection("idioms").get();
      const updates: Promise<any>[] = [];

      for (const doc of idiomSnap.docs) {
        const data = doc.data();
        
        const prompt = `
          You are an expert Dutch language tutor for Farsi speakers.
          Refine the following Farsi translation of the Dutch idiom "${data.dutch}" to be more idiomatic and natural for Farsi speakers.
          
          Current Farsi Translation: ${data.farsi}
          Literal Meaning: ${data.literal_meaning}
          
          Return ONLY the refined, more natural Farsi translation.
        `;
        
        const refinedFarsi = await askTeacher(prompt, []);
        if (refinedFarsi && refinedFarsi !== data.farsi) {
          updates.push(doc.ref.update({ farsi: refinedFarsi }));
        }
      }
      
      await Promise.all(updates);
      res.json({ success: true, message: `Refined ${updates.length} idiom translations.` });
    } catch (error: any) {
      console.error("Idiom refinement error:", error);
      res.status(500).json({ error: "Failed to refine idioms: " + error.message });
    }
  });

  app.post("/api/generate-idiom-farsi", verifyToken, async (req, res) => {
    try {
      const idiomSnap = await adminDb.collection("idioms").get();
      const updates: Promise<any>[] = [];

      for (const doc of idiomSnap.docs) {
        const data = doc.data();
        
        // Only update if farsi is missing or empty
        if (data.farsi && data.farsi.trim() !== "") continue;

        const prompt = `
          You are an expert Dutch language tutor for Farsi speakers.
          Provide an idiomatic and natural Farsi translation for the Dutch idiom: "${data.dutch}".
          The idiom means: "${data.literal_meaning}".
          
          Return ONLY the Farsi translation.
        `;
        
        const farsi = await askTeacher(prompt, []);
        if (farsi) {
          updates.push(doc.ref.update({ farsi }));
        }
      }
      
      await Promise.all(updates);
      res.json({ success: true, message: `Generated Farsi translations for ${updates.length} idioms.` });
    } catch (error: any) {
      console.error("Idiom Farsi generation error:", error);
      res.status(500).json({ error: "Failed to generate Farsi translations: " + error.message });
    }
  });

  app.post("/api/update-idiom-examples", verifyToken, async (req, res) => {
    try {
      const idiomSnap = await adminDb.collection("idioms").get();
      const updates: Promise<any>[] = [];

      for (const doc of idiomSnap.docs) {
        const data = doc.data();
        
        // Only update if example is missing
        if (data.example) continue;

        const prompt = `
          You are an expert Dutch language tutor for Farsi speakers.
          Provide a relevant example sentence in Dutch for the idiom: "${data.dutch}".
          The idiom means: "${data.literal_meaning}".
          
          Return ONLY the Dutch example sentence.
        `;
        
        const example = await askTeacher(prompt, []);
        if (example) {
          updates.push(doc.ref.update({ example }));
        }
      }
      
      await Promise.all(updates);
      res.json({ success: true, message: `Added examples to ${updates.length} idioms.` });
    } catch (error: any) {
      console.error("Idiom example update error:", error);
      res.status(500).json({ error: "Failed to update idioms: " + error.message });
    }
  });

  app.post("/api/update-grammar-explanations", verifyToken, async (req, res) => {
    try {
      const grammarSnap = await adminDb.collection("grammar").get();
      const updates: Promise<any>[] = [];

      for (const doc of grammarSnap.docs) {
        const data = doc.data();
        
        // Only update if detailedExplanation is missing or empty
        if (data.detailedExplanation && data.detailedExplanation.trim() !== "") continue;

        const prompt = `
          You are an expert Dutch language tutor for Farsi speakers.
          Provide a detailed explanation in Farsi for the Dutch grammar rule: "${data.dutch}".
          
          Existing content: "${data.content}"
          Examples: ${JSON.stringify(data.examples)}
          Common mistakes: ${JSON.stringify(data.commonMistakes)}
          
          The explanation should be in-depth, in Farsi, and include common mistakes and corrections based on the provided examples and common mistakes.
          
          Return ONLY the detailed explanation in Farsi.
        `;
        
        const detailedExplanation = await askTeacher(prompt, []);
        if (detailedExplanation) {
          updates.push(doc.ref.update({ detailedExplanation }));
        }
      }
      
      await Promise.all(updates);
      res.json({ success: true, message: `Generated detailed explanations for ${updates.length} grammar rules.` });
    } catch (error: any) {
      console.error("Grammar explanation generation error:", error);
      res.status(500).json({ error: "Failed to generate detailed explanations: " + error.message });
    }
  });

  const upload = multer({ storage: multer.memoryStorage() });

  const FILE_CONFIGS: Record<string, { regex: RegExp, fields: string[] }> = {
    'pdf_wordlists': {
      // Pattern: English word - Dutch word [gender/type]
      regex: /([a-zA-Z\s\(\)]+)\s?-\s?([a-zA-Zëïöü\s\-]+)\s?\[([n|m|f|adj|v|u]+)\]/g,
      fields: ['en', 'nl', 'type']
    },
    'gcse_list': {
      // Pattern: "Dutch word","English word"
      regex: /"([^"]+)"\s?,\s?"([^"]+)"/g,
      fields: ['nl', 'en']
    }
  };

  app.post("/api/extract-pdf", verifyToken, upload.single("file"), async (req, res) => {
    try {
      const file = req.file;
      const { configType, category } = req.body;

      if (!file) return res.status(400).json({ error: "No file uploaded" });
      if (!configType) return res.status(400).json({ error: "Invalid configType" });

      const data = await pdfParse(file.buffer);
      const text = data.text;

      let results: any[] = [];

      if (configType === "grammar_ocr") {
        console.log("Extracting grammar rules using Gemini OCR...");
        const prompt = `You are an expert Dutch-Farsi language tutor. Extract all the Dutch grammar rules from the following text, which is parsed from a PDF. 
        The text might contain right-to-left Persian script and Dutch tables.
        Return the output as a JSON array of objects. Each object must have the following fields:
        - "rule": The name or topic of the grammar rule in Dutch.
        - "farsiExplanation": A concise explanation of the rule in Farsi.
        - "detailedExplanation": A more detailed explanation in Farsi, including examples if available.
        
        Do not include any markdown formatting like \`\`\`json in your response. Just return the raw JSON array.
        
        Text to parse:
        ${text.substring(0, 30000)} // Limit text to avoid token limits
        `;
        
        const response = await askTeacher(prompt, []);
        try {
          // Try to parse the response as JSON
          let jsonStr = response.trim();
          if (jsonStr.startsWith("```json")) {
            jsonStr = jsonStr.replace(/^```json\n/, "").replace(/\n```$/, "");
          } else if (jsonStr.startsWith("```")) {
            jsonStr = jsonStr.replace(/^```\n/, "").replace(/\n```$/, "");
          }
          results = JSON.parse(jsonStr);
        } catch (e) {
          console.error("Failed to parse Gemini OCR response as JSON:", response);
          throw new Error("Failed to parse grammar rules from PDF.");
        }
      } else {
        if (!FILE_CONFIGS[configType]) return res.status(400).json({ error: "Invalid configType" });
        const config = FILE_CONFIGS[configType];
        let match;

        while ((match = config.regex.exec(text)) !== null) {
          let entry: any = {
            category: category || 'General',
            level: 'A1', // Default level
          };

          config.fields.forEach((field, index) => {
            entry[field] = match[index + 1].trim();
          });

          // Clean up Dutch words with genders for de/het teaching
          if (entry.type && (entry.type === 'n' || entry.type === 'm' || entry.type === 'f')) {
            entry.article = (entry.type === 'n') ? 'het' : 'de';
          }

          results.push(entry);
        }

        // Translate to Farsi
        console.log(`Translating ${results.length} items to Farsi...`);
        for (let entry of results) {
          const prompt = `Provide only the Farsi translation for the Dutch word: "${entry.nl}". No extra text.`;
          entry.fa = await askTeacher(prompt, []);
        }
      }

      res.json({ success: true, data: results });
    } catch (error: any) {
      console.error("PDF Extraction error:", error);
      res.status(500).json({ error: "Failed to extract PDF: " + error.message });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
