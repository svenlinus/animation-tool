import { Point } from "./geometry"

export interface TimeMap {
  type: TimeMapType,
  properties: Array<AnimationProperty>,
  bezierPoints?: Array<Point>,
  frames: Array<PercentFrame>
}

export interface PercentFrame {
  percent: number,
  value: number,
  insignificant?: boolean
}

export interface Limit {
  min: number,
  max: number
}

export enum TimeMapType {
  Bezier = 'Bezier',
  Spring = 'Spring',
  Gravity = 'Gravity',
  Custom = 'Custom',
  Linear = 'Linear',
  Polynomial = 'Polynomial',
}

export enum CssFunction {     // to be continued
  TranslateX = 'translateX',
  TranslateY = 'translateY',
  ScaleX = 'scaleX',
  ScaleY = 'scaleY',
  Rotate = 'rotate',
  SkewX = 'skewX',
  SkewY = 'skewY',
  Color = 'color',
}

export interface PropertyConfig {
  units: Array<string>;
  start: number;
  end: number;
}

export class AnimationProperty {
  public func: string;
  public config: PropertyConfig;
  public unit: string;
  public start: number;
  public end: number;
  public limit?: Limit;

  constructor(func: CssFunction) {
    this.func = this.formatCssFunction(func);
    this.config = AnimationProperty.config.get(func.replace('X', '').replace('Y', ''))!;
    this.unit = this.config.units[0];
    this.start = this.config.start;
    this.end = this.config.end;
  }
  private formatCssFunction(func: string): string {
    return func[0].toLowerCase() + func.slice(1, func.length);
  }
  public createFunction(value: number): string {
    const unit = this.unit == 'none' ? '' : this.unit;
    let input = this.map(value, this.start, this.end);
    if (this.limit != null) {
      input = this.constrain(input, this.limit.min, this.limit.max);
    }
    return `${this.func}(${input + unit})`;    // ex. translateX(100px);
  }
  private map(val: number, a: number, b: number): number {
    return a + (val * (b-a));
  }
  private constrain(val: number, a: number, b: number): number {
    return val < a ? a : (val > b ? b : val);
  }
  static config : Map<string, PropertyConfig> = new Map<string, PropertyConfig>([
    ['scale', {
      units: ['none', '%'],
      start: 1,
      end: 2
    }],
    ['translate', {
      units: ['px', 'vw', 'vh', '%', 'vmin', 'vmax', 'em', 'rem', 'cm'],
      start: 0,
      end: 300
    }],
    ['rotate', {
      units: ['deg', 'rad', 'turn'],
      start: 0,
      end: 360
    }],
    ['skew', {
      units: ['deg', 'rad'],
      start: 0,
      end: 45
    }],
    ['color', {
      units: ['hex', 'rgb', 'hsb'],
      start: 0,
      end: 255
    }],
  ]);
}