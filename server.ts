import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Serve the /music directory statically so assets are reliably served from root/music
  const musicPath = path.join(process.cwd(), 'music');
  app.use('/music', express.static(musicPath));

  // Dynamic API layout for BGM files in /music/bgm
  app.get("/api/bgm-list", (req, res) => {
    try {
      const bgmDir = path.join(process.cwd(), 'music', 'bgm');
      if (!fs.existsSync(bgmDir)) {
        res.json([]);
        return;
      }
      const files = fs.readdirSync(bgmDir);
      // Filter audio files
      const audioFiles = files.filter(f => {
        const ext = path.extname(f).toLowerCase();
        return ext === '.mp3' || ext === '.wav' || ext === '.ogg' || ext === '.m4a' || ext === '.flac';
      });

      // Map file details
      const bgmItems = audioFiles.map(filename => {
        // Human-friendly name from filename (removes path and extension)
        let displayName = filename;
        const lastDot = filename.lastIndexOf('.');
        if (lastDot !== -1) {
          displayName = filename.substring(0, lastDot);
        }
        
        // Clean prefixes for visual elegance in UI
        let cleanName = displayName
          .replace(/^shorts_by_pazuzustudio-/, '')
          .replace(/^shorts_by_/, '')
          .replace(/[-_]+/g, ' ')
          .trim();

        // Capitalize words
        cleanName = cleanName
          .split(' ')
          .map(w => w.charAt(0).toUpperCase() + w.slice(1))
          .join(' ');

        return {
          filename,
          name: cleanName || displayName,
          url: `/music/bgm/${filename}`
        };
      });

      res.json(bgmItems);
    } catch (err: any) {
      console.error("Error reading BGM folder:", err);
      res.status(500).json({ error: err.message });
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
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
