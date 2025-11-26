import { Programme, Step } from './types';
import { controlDevices } from './deviceController';

export class ProgrammeExecutor {
  private programme: Programme | null = null;
  private isRunning: boolean = false;
  private shouldStop: boolean = false;

  async loadProgramme(programme: Programme): Promise<void> {
    this.programme = programme;
  }

  async start(): Promise<void> {
    if (!this.programme) {
      throw new Error('Kein Programm geladen');
    }

    if (this.isRunning) {
      console.log('Programm läuft bereits');
      return;
    }

    this.isRunning = true;
    this.shouldStop = false;

    // Endlos-Wiederholung
    while (!this.shouldStop) {
      await this.executeProgramme();
    }

    this.isRunning = false;
  }

  stop(): void {
    this.shouldStop = true;
  }

  isExecuting(): boolean {
    return this.isRunning;
  }

  private async executeProgramme(): Promise<void> {
    if (!this.programme) {
      return;
    }

    for (let i = 0; i < this.programme.steps.length; i++) {
      if (this.shouldStop) {
        break;
      }

      const step = this.programme.steps[i];
      console.log(`Step ${i + 1}/${this.programme.steps.length}`);

      // Alle Geräte in diesem Step parallel ansteuern
      await controlDevices(step.devices);

      // Warten auf Duration (außer beim letzten Step, wenn wir wiederholen)
      if (i < this.programme.steps.length - 1 || !this.shouldStop) {
        await this.sleep(step.duration * 1000);
      }
    }
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

