import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import multer from "multer";
import ffmpeg from "fluent-ffmpeg";
import ffmpegInstaller from "@ffmpeg-installer/ffmpeg";
import fs from "fs";
import { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType } from "docx";
import PDFDocument from "pdfkit";
import { GoogleGenAI } from "@google/genai";
import cors from "cors";

// Configuration de FFmpeg avec le binaire autonome
ffmpeg.setFfmpegPath(ffmpegInstaller.path);

// Configuration de Multer pour le stockage temporaire
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(process.cwd(), "uploads");
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir);
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const upload = multer({ 
  storage,
  limits: { fileSize: 100 * 1024 * 1024 } // Limite à 100MB
});

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(cors());
  app.use(express.json());

  // Dossier pour les fichiers générés
  const outputDir = path.join(process.cwd(), "outputs");
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir);
  }

  // Route API pour la santé
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  // Endpoint d'extraction audio uniquement
  app.post("/api/extract-audio", upload.single("video"), async (req, res) => {
    if (!req.file) {
      return res.status(400).json({ error: "Aucun fichier vidéo fourni." });
    }

    const videoPath = req.file.path;
    const audioPath = path.join(process.cwd(), "uploads", `${req.file.filename}.mp3`);

    try {
      await new Promise((resolve, reject) => {
        ffmpeg(videoPath)
          .toFormat("mp3")
          .on("end", resolve)
          .on("error", (err) => {
            console.error("FFmpeg Error:", err);
            reject(new Error(`Échec de l'extraction audio: ${err.message}`));
          })
          .save(audioPath);
      });

      const audioBuffer = fs.readFileSync(audioPath);
      const base64Audio = audioBuffer.toString("base64");

      // Nettoyage immédiat
      fs.unlinkSync(videoPath);
      fs.unlinkSync(audioPath);

      res.json({ success: true, audioData: base64Audio });
    } catch (error: any) {
      if (fs.existsSync(videoPath)) fs.unlinkSync(videoPath);
      if (fs.existsSync(audioPath)) fs.unlinkSync(audioPath);
      res.status(500).json({ error: error.message });
    }
  });

  // Endpoint de génération de documents à partir des données de transcription
  app.post("/api/generate-docs", async (req, res) => {
    const { data } = req.body;
    if (!data || !data.transcription || !data.translation) {
      return res.status(400).json({ error: "Données de transcription manquantes." });
    }

    const fileId = Date.now();
    try {
      // SRT
      const srtContent = data.translation.map((item: any, i: number) => {
        const nextTime = data.translation[i+1]?.timestamp || "99:59";
        return `${i + 1}\n00:${item.timestamp},000 --> 00:${nextTime},000\n${item.text}\n`;
      }).join("\n");
      fs.writeFileSync(path.join(outputDir, `${fileId}.srt`), srtContent);

      // VTT
      const vttContent = "WEBVTT\n\n" + data.translation.map((item: any, i: number) => {
        const nextTime = data.translation[i+1]?.timestamp || "99:59";
        return `00:${item.timestamp}.000 --> 00:${nextTime}.000\n${item.text}\n`;
      }).join("\n");
      fs.writeFileSync(path.join(outputDir, `${fileId}.vtt`), vttContent);

      // Word
      const doc = new Document({
        sections: [{
          children: [
            new Paragraph({ 
              text: "Transcription Bilingue", 
              heading: HeadingLevel.HEADING_1, 
              alignment: AlignmentType.CENTER,
              spacing: { after: 400 }
            }),
            new Paragraph({ 
              text: `Langue détectée : ${data.detectedLanguage}`,
              spacing: { after: 400 }
            }),
            ...data.transcription.flatMap((item: any, index: number) => {
              const translationItem = data.translation[index] || { text: "" };
              return [
                new Paragraph({
                  children: [
                    new TextRun({ text: `[${item.timestamp}] `, bold: true, font: "Arial", size: 24 }),
                    new TextRun({ text: item.text, font: "Arial", size: 24 })
                  ],
                  spacing: { before: 200 }
                }),
                new Paragraph({
                  children: [
                    new TextRun({ text: `[${item.timestamp}] `, bold: true, font: "Arial", size: 24, color: "E24C38" }),
                    new TextRun({ text: translationItem.text, font: "Arial", size: 24, color: "E24C38" })
                  ],
                  spacing: { after: 200 }
                })
              ];
            }),
          ],
        }],
      });
      const buffer = await Packer.toBuffer(doc);
      fs.writeFileSync(path.join(outputDir, `${fileId}.docx`), buffer);

      // PDF
      const pdfDoc = new PDFDocument();
      pdfDoc.pipe(fs.createWriteStream(path.join(outputDir, `${fileId}.pdf`)));
      pdfDoc.font('Helvetica-Bold').fontSize(20).text("Transcription Bilingue", { align: "center" });
      pdfDoc.moveDown().font('Helvetica').fontSize(12).text(`Langue détectée : ${data.detectedLanguage}`).moveDown();
      
      data.transcription.forEach((item: any, index: number) => {
        const translationItem = data.translation[index] || { text: "" };
        
        // Texte original (Noir)
        pdfDoc.fillColor("black")
              .font('Helvetica-Bold').fontSize(10).text(`[${item.timestamp}] `, { continued: true })
              .font('Helvetica').fontSize(12).text(item.text);
        
        // Traduction (Terracotta/Rouge chaud)
        pdfDoc.fillColor("#E24C38")
              .font('Helvetica-Bold').fontSize(10).text(`[${item.timestamp}] `, { continued: true })
              .font('Helvetica').fontSize(12).text(translationItem.text);
        
        pdfDoc.moveDown(0.5);
      });
      pdfDoc.end();

      res.json({ success: true, fileId });
    } catch (error) {
      res.status(500).json({ error: "Erreur lors de la génération des fichiers." });
    }
  });

  // Endpoint de téléchargement
  app.get("/api/download/:fileId/:type", (req, res) => {
    const { fileId, type } = req.params;
    const filePath = path.join(outputDir, `${fileId}.${type}`);
    if (fs.existsSync(filePath)) {
      res.download(filePath);
    } else {
      res.status(404).json({ error: "Fichier non trouvé." });
    }
  });

  // Catch-all pour les routes API non trouvées
  app.all("/api/*", (req, res) => {
    res.status(404).json({ error: `Route API non trouvée : ${req.method} ${req.url}` });
  });

  // Global error handler pour Express (évite les pages HTML d'erreur)
  app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    console.error("Global Express Error:", err);
    if (req.path.startsWith('/api/')) {
      res.status(500).json({ error: err.message || "Erreur interne du serveur" });
    } else {
      next(err);
    }
  });

  // Vite middleware pour le développement
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
    console.log(`Serveur démarré sur http://localhost:${PORT}`);
  });
}

startServer();
