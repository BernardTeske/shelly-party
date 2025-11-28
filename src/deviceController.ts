import axios from 'axios';
import { Device } from './types';

export async function controlDevice(device: Device): Promise<void> {
  // Wenn transition vorhanden ist, zuerst den transition-Endpunkt aufrufen
  if (device.transition !== undefined) {
    const transitionUrl = `http://${device.ip}/settings/light/0?transition=${device.transition}`;

    try {
      await axios.get(transitionUrl, { timeout: 5000 });
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error(`Fehler beim Setzen der Transition für Gerät ${device.ip}: ${error.message}`);
      } else {
        console.error(`Unbekannter Fehler beim Setzen der Transition für Gerät ${device.ip}`);
      }
      // Fehler wird geloggt, aber nicht geworfen - Show läuft weiter
    }
  }

  // Dann die Farbänderung durchführen
  const url = `http://${device.ip}/color/0`;
  const params = {
    turn: device.turn,
    red: device.red.toString(),
    green: device.green.toString(),
    blue: device.blue.toString(),
    white: device.white.toString(),
  };

  try {
    await axios.get(url, { params, timeout: 5000 });
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error(`Fehler beim Steuern von Gerät ${device.ip}: ${error.message}`);
    } else {
      console.error(`Unbekannter Fehler beim Steuern von Gerät ${device.ip}`);
    }
    // Fehler wird geloggt, aber nicht geworfen - Show läuft weiter
  }
}

export async function controlDevices(devices: Device[]): Promise<void> {
  // Warte auf alle Responses, bevor wir fortfahren
  await Promise.allSettled(devices.map(device => controlDevice(device)));
}

