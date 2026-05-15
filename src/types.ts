export type DrawingTool = 'brush' | 'line' | 'curve' | 'circle' | 'ellipse' | 'leaf' | 'moon' | 'star' | 'rect';

export interface MandalaSettings {
  count: number; // number of sectors
  brushColor: string;
  brushSize: number;
  tool: DrawingTool;
}

export interface Point {
  x: number;
  y: number;
}
