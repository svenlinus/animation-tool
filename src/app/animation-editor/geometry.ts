import { AnimationGraphComponent } from './animation-graph/animation-graph.component';
import * as p5 from "p5";

export class Bezier {
  public points: Point[];
  public mid: Point;
  public min?: Point;
  public max?: Point;
  constructor(points: Array<Point>) {
    this.points = points;
    this.mid = Point.add(this.points[0], this.points[3]).div(2);
  }
  public getValue(t: number): Point {
    const x = (Math.pow(1-t, 3) * this.points[0].x) + (3 * Math.pow(1-t, 2) * t * this.points[1].x) + (3 * (1-t) * t*t * this.points[2].x) + (t*t*t * this.points[3].x);
    const y = (Math.pow(1-t, 3) * this.points[0].y) + (3 * Math.pow(1-t, 2) * t * this.points[1].y) + (3 * (1-t) * t*t * this.points[2].y) + (t*t*t * this.points[3].y);
    return new Point(x, y);
  }
  // public getY(t: number): number {
  //   return (Math.pow(1-t, 3) * this.points[0].y) + (3 * Math.pow(1-t, 2) * t * this.points[1].y) + (3 * (1-t) * t*t * this.points[2].y) + (t*t*t * this.points[3].y);
  // }
  public mouseIn(mouse: Point): any {
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
  public isLast?: boolean;
  private separated?: boolean;
  private contextMenuPos!: Point;
  public showMenu?: boolean;
  public remove?: boolean;

  constructor(public x: number, public y: number) {     // automatically instantiates x and y as public instance vars
  }
  public set(x: number, y: number) {
    this.x = !this.isLast ? x : 1;
    this.y = y;
    return this;
  }
  public track(v: Point, w?: number, h?: number) {
    if (!w) w = 0.158;
    if (!h) h = 0.75;
    if (this.showMenu) return;
    const x = v.x < -w ? -w : (v.x > 1+w ? 1+w : v.x);
    const y = v.y < -h ? -h : (v.y > 1+h ? 1+h : v.y);
    const p = this.copy();
    this.set(x, y)
    if (this.children) {
      for (let c of this.children) {
        const off = Point.sub(c, p);
        const np = Point.add(this, off);
        c.set(np.x, np.y);
      }
    }
    if (this.reflection && this.parent && (!this.parent || !this.parent.separated)) {
      const np = Point.sub(Point.mult(this.parent, 2), this);
      this.reflection.set(np.x, np.y);
    }
  }
  public worldToScreen(zoom?: Point, offset?: Point): Point {
    if (!zoom) zoom = new Point(380, 200);
    if (!offset) offset = new Point(60, 150);
    return new Point(this.x * zoom.x + offset.x, (1-this.y) * zoom.y + offset.y);
  }
  public screenToWorld(zoom?: Point, offset?: Point): Point {
    if (!zoom) zoom = new Point(380, 200);
    if (!offset) offset = new Point(60, 150);
    return new Point((this.x - offset.x) / zoom.x, 1-((this.y - offset.y) / zoom.y));
  }
  public mouseIn(mouse: Point) {
    return Point.sub(this, mouse).magSq() < 0.0025;
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
  public mult(num: number): Point {
    this.x = this.x * num;
    this.y = this.y * num;
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
  public showContextMenu(s: p5, comp: AnimationGraphComponent, mouse?: Point) {
    if (mouse) this.contextMenuPos = mouse.add(new Point(10, 10));
    this.showMenu = true;

    let c1 = 255;
    let c2 = 255;
    if (s.mouseX >= this.contextMenuPos.x && s.mouseX <= this.contextMenuPos.x + 90 && s.mouseY >= this.contextMenuPos.y) {
      if (s.mouseY <= this.contextMenuPos.y + 30) {
        c1 = 220;
        s.cursor(s.HAND);
        comp.mouseInPoint = true;
        if (comp.mouseUp) {
          this.separated = !this.separated;
          this.children![0].track(this.children![0]);
        }
      } else if (s.mouseY <= this.contextMenuPos.y + 60) {
        comp.mouseInPoint = true;
        s.cursor(s.HAND);
        c2 = 220;
        if (comp.mouseUp) this.remove = true;;
      }
    }

    s.noStroke();
    s.fill(c1, 200);
    s.rect(this.contextMenuPos.x, this.contextMenuPos.y, 90, 30);
    s.fill(c2, 200);
    s.rect(this.contextMenuPos.x, this.contextMenuPos.y + 30, 90, 30);
    s.fill(0);
    s.textSize(15);
    s.textAlign(s.LEFT, s.TOP);
    s.push();
    s.translate(this.contextMenuPos.x, this.contextMenuPos.y);
    s.text(this.separated ? 'Connect' : 'Separate', 8, 8);
    s.text('Delete', 8, s.textAscent() + s.textDescent() + 18);
    s.pop();
  }
}

export class Interpolate {
  public static lerp(a: number, b: number, t: number): number {
    if (!b) return a;
    return a + (b - a) * t;
  }
}