import { Point } from "./geometry"

export interface TimeMap {
  type: TimeMapType,
  properties: Array<AnimationProperty>,
  bezierPoints?: Array<Point>,
  frames: Array<PercentFrame>
}

export interface PercentFrame {
  percent: number,
  value: number
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

export class CssUnits {
  public static unitsDict : Map<AnimationProperty | undefined, Array<string>> = new Map<AnimationProperty, Array<string>>([
    [AnimationProperty.ScaleX, ["px", "vh", "vx"]],
    [AnimationProperty.ScaleY, ["px", "vh", "vx"]],
    [AnimationProperty.Rotate, ["Degrees", "Rad"]],
    [AnimationProperty.TransformX, ["px", "vh", "vx"]],
    [AnimationProperty.TransformY, ["px", "vh", "vx"]],
    [AnimationProperty.SkewX, ["px", "%"]],
    [AnimationProperty.SkewY, ["px", "%"]],
  ]);
}