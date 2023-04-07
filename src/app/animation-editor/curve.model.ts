import { PercentFrame } from './animation.model';

export interface Graph {
  setup(): any;
  draw(): any;
  sample(): PercentFrame[];
}

export interface Spline extends Graph {
  add(): any;
}

export interface Dict {
  [key: string]: any
}

export interface SpringConfig extends Dict {
  stiffness: number;
  dampener: number;
  maxVelocity: number;
  initVelocity: number;
}

export interface SpringPoint {
  p: number;
  v: number;
  a: number;
}