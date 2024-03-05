declare function sin(n: number): number;
declare function cos(n: number): number;
declare function background(n: number): void;
declare function fill(c: string): void;
declare var mouseX: number;
declare var mouseY: number;
declare var TWO_PI: number;
declare var CLOSE: any;
declare function vertex(x: number, y: number): void;
declare function beginShape(): void;
declare function endShape(close?: any): void;

interface Canvas {
    parent: (id: string) => void;
}
declare function createCanvas(w: number, h: number): Canvas;