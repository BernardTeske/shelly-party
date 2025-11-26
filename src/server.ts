import express, { Request, Response } from 'express';
import { parseProgramme } from './xmlParser';
import { ProgrammeExecutor } from './programmeExecutor';

const app = express();
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
    await executor.loadProgramme(programme);
    
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
    running: executor.isExecuting() 
  });
});

export function startServer(port: number = 3000): void {
  app.listen(port, () => {
    console.log(`Server läuft auf Port ${port}`);
  });
}

