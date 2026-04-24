import { readdir } from 'fs/promises';
import express, { Request, Response } from 'express';
import { parseProgramme } from './xmlParser';
import { ProgrammeExecutor } from './programmeExecutor';

const app = express();

app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') {
    res.sendStatus(204);
    return;
  }
  next();
});

app.use(express.json());

const executor = new ProgrammeExecutor();

app.post('/start', async (req: Request, res: Response) => {
  try {
    const { filename } = req.body;

    if (!filename) {
      return res.status(400).json({ error: 'Dateiname fehlt' });
    }

    if (executor.isExecuting()) {
      return res.status(409).json({ error: 'Programm läuft bereits' });
    }

    const programme = await parseProgramme(`programmes/${filename}`);
    await executor.loadProgramme(programme, filename);
    
    // Starte die Ausführung asynchron
    executor.start().catch(err => {
      console.error('Fehler beim Ausführen des Programms:', err);
    });

    res.json({ message: 'Programm gestartet', filename });
  } catch (error) {
    console.error('Fehler beim Starten:', error);
    res.status(500).json({ 
      error: error instanceof Error ? error.message : 'Unbekannter Fehler' 
    });
  }
});

app.post('/stop', (req: Request, res: Response) => {
  if (!executor.isExecuting()) {
    return res.status(409).json({ error: 'Kein Programm läuft' });
  }

  executor.stop();
  res.json({ message: 'Programm gestoppt' });
});

app.get('/status', (req: Request, res: Response) => {
  res.json({
    running: executor.isExecuting(),
    show: executor.getCurrentShow(),
  });
});

const PROGRAMMES_DIR = 'programmes';

app.get('/programmes', async (req: Request, res: Response) => {
  try {
    const names = await readdir(PROGRAMMES_DIR);
    const xml = names
      .filter((f) => f.toLowerCase().endsWith('.xml'))
      .sort((a, b) => a.localeCompare(b, undefined, { sensitivity: 'base' }));
    res.json({ programmes: xml.map((filename) => ({ filename })) });
  } catch (error) {
    console.error('Fehler beim Lesen von programmes/:', error);
    res.status(500).json({
      error: error instanceof Error ? error.message : 'Verzeichnis nicht lesbar',
    });
  }
});

export function startServer(port: number = 3000): void {
  app.listen(port, () => {
    console.log(`Server läuft auf Port ${port}`);
  });
}

