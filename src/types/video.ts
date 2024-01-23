export type TimelineTuple = [number, number];
export type Timeline = TimelineTuple[];
export type Transcript = {
  text: string;
  wordTimestamps: {
    end: number;
    start: number;
    word: string;
  }[];
};
export type StreamableURL = string;
