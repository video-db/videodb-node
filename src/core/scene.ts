export class Scene {
  response: string;
  start: number;
  end: number;

  constructor(response: string, start: number, end: number) {
    this.response = response;
    this.start = start;
    this.end = end;
  }
}