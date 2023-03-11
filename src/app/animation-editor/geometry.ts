export class Bezier {
  public points: Point[];
  public mid: Point;
  public min?: Point;
  public max?: Point;
  constructor(a: Point, b: Point, c: Point, d: Point) {
    this.points = [a, b, c, d];
    this.mid = Point.add(this.points[0], this.points[3]).div(2);
  }
  public getValue(t: number): Point {
    const x = (Math.pow(1-t, 3) * this.points[0].x) + (3 * Math.pow(1-t, 2) * t * this.points[1].x) + (3 * (1-t) * t*t * this.points[2].x) + (t*t*t * this.points[3].x);
    const y = (Math.pow(1-t, 3) * this.points[0].y) + (3 * Math.pow(1-t, 2) * t * this.points[1].y) + (3 * (1-t) * t*t * this.points[2].y) + (t*t*t * this.points[3].y);
    return new Point(x, y);
  }
  public mouseToPoint(mouse: Point): any {
    this.max = Point.max(this.points);
    this.min = Point.min(this.points);
    this.mid = Point.add(this.max, this.min).div(2);
    return mouse.x > this.min.x && mouse.x < this.max.x && mouse.y > this.min.y && mouse.y < this.max.y;
  }
}

export class Point {
  public drag?: boolean;
  public children?: Point[];
  public reflection?: Point;
  public parent?: Point;

  constructor(public x: number, public y: number) {
  }
  public set(x: number, y: number) {
    this.x = x;
    this.y = y;
  }
  public track(v: Point, w: number, h: number) {
    const x = v.x < 0 ? 0 : (v.x > w ? w : v.x);
    const y = v.y < 0 ? 0 : (v.y > h ? h : v.y);
    const p = this.copy();
    this.set(x, y)
    if (this.children) {
      for (let c of this.children) {
        const off = Point.sub(c, p);
        const np = Point.add(this, off);
        c.set(np.x, np.y);
      }
    }
    if (this.reflection && this.parent) {
      const np = Point.sub(Point.mult(this.parent, 2), this);
      this.reflection.set(np.x, np.y);
    }
  }
  public mouseIn(mouse: Point) {
    return Point.sub(this, mouse).magSq() < 100;
  }
  public static sub(a: Point, b: Point) {
    return new Point(a.x-b.x, a.y-b.y)
  }
  public static mult(a: Point, num: number) {
    return new Point(a.x*num, a.y*num);
  }
  public static add(a: Point, b: Point) {
    return new Point(a.x+b.x, a.y+b.y)
  }
  public add(v: Point): Point {
    this.set(this.x + v.x, this.y + v.y);
    return this;
  }
  public div(num: number): Point {
    this.x = this.x / num;
    this.y = this.y / num;
    return this;
  }
  public copy(): Point {
    return new Point(this.x, this.y);
  }
  public static max(points: Point[]): Point {
    let rx = points[0].x;
    let ry = points[0].y;
    for (let p of points) {
      if (p.x > rx) rx = p.x;
      if (p.y > ry) ry = p.y;
    }
    return new Point(rx, ry);
  }
  public static min(points: Point[]): Point {
    let rx = points[0].x;
    let ry = points[0].y;
    for (let p of points) {
      if (p.x < rx) rx = p.x;
      if (p.y < ry) ry = p.y;
    }
    return new Point(rx, ry);
  }
  public setChildren(v1: Point, v2: Point) {
    this.children = [v1, v2];
    v1.parent = this;
    v2.parent = this;
  }
  public mirror(v: Point) {
    this.reflection = v;
  }
  public magSq() {
    return this.x*this.x + this.y*this.y;
  }
  public static lerp(a: Point, b: Point, t: number) {
    return new Point(a.x + (b.x - a.x) * t, a.y + (b.y - a.y) * t);
  }
  // (1-t)^3 a + 3(1-t)^2 tb + 3(1-t) t^2c + t^3 d
  public static cubicBezier(a: Point, b: Point, c: Point, d: Point, t: number) {
    const x = (Math.pow(1-t, 3) * a.x) + (3 * Math.pow(1-t, 2) * t * b.x) + (3 * (1-t) * t*t * c.x) + (t*t*t * d.x);
    const y = (Math.pow(1-t, 3) * a.y) + (3 * Math.pow(1-t, 2) * t * b.y) + (3 * (1-t) * t*t * c.y) + (t*t*t * d.y);
    return new Point(x, y);
  }
}