export interface Device {
  ip: string;
  turn: 'on' | 'off';
  red: number;
  green: number;
  blue: number;
  white: number;
  transition?: number;
}

export interface Step {
  duration: number;
  devices: Device[];
}

export interface Programme {
  steps: Step[];
}

