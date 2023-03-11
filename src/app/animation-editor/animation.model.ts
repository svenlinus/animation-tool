import { Point } from "./geometry"

export interface TimeMap {
  type: TimeMapType,
  properties: Array<AnimationProperty>,
  points?: Array<Point>
}

export enum TimeMapType {
  Bezier = 'Bezier',
  Spring = 'Spring',
  Linear = 'Linear',
  Polynomial = 'Polynomial',
  Custom = 'Custom',
}

export enum AnimationProperty {     // to be continued
  ScaleX = 'ScaleX',
  ScaleY = 'ScaleY',
  TransformX = 'TransformX',
  TransformY = 'TransformY',
  Rotate = 'Rotate',
  SkewX = 'SkewX',
  SkewY = 'SkewY',
  Color = 'Color',
}