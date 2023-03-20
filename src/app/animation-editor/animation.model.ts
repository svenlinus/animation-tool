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
    [AnimationProperty.ScaleX, ["None", "%"]],
    [AnimationProperty.ScaleY, ["None", "%"]],
    [AnimationProperty.Rotate, ["Deg", "Rad"]],
    [AnimationProperty.TransformX, ["px", "vh", "vw", "%"]],
    [AnimationProperty.TransformY, ["px", "vh", "vw", "%"]],
    [AnimationProperty.SkewX, ["Deg", "px", "%"]],
    [AnimationProperty.SkewY, ["Deg", "px", "%"]],
  ]);
}