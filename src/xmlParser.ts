import * as fs from 'fs';
import * as path from 'path';
import { parseString } from 'xml2js';
import { Programme, Step, Device } from './types';

export async function parseProgramme(filePath: string): Promise<Programme> {
  const fullPath = path.resolve(filePath);
  
  if (!fs.existsSync(fullPath)) {
    throw new Error(`Datei nicht gefunden: ${fullPath}`);
  }

  const xmlContent = fs.readFileSync(fullPath, 'utf-8');

  return new Promise((resolve, reject) => {
    parseString(xmlContent, (err, result) => {
      if (err) {
        reject(new Error(`XML-Parse-Fehler: ${err.message}`));
        return;
      }

      try {
        const programme = result.programme;
        if (!programme || !programme.step) {
          reject(new Error('Ungültige XML-Struktur: Keine Steps gefunden'));
          return;
        }

        const steps: Step[] = programme.step.map((stepData: any) => {
          const duration = parseInt(stepData.$.duration, 10);
          if (isNaN(duration)) {
            throw new Error(`Ungültige Duration: ${stepData.$.duration}`);
          }

          const devices: Device[] = [];
          if (stepData.device) {
            devices.push(...stepData.device.map((deviceData: any) => {
              const attrs = deviceData.$;
              return {
                ip: attrs.ip,
                turn: attrs.turn as 'on' | 'off',
                red: parseInt(attrs.red, 10),
                green: parseInt(attrs.green, 10),
                blue: parseInt(attrs.blue, 10),
                white: parseInt(attrs.white, 10),
              };
            }));
          }

          return {
            duration,
            devices,
          };
        });

        resolve({ steps });
      } catch (error) {
        reject(error instanceof Error ? error : new Error('Unbekannter Fehler beim Parsen'));
      }
    });
  });
}

