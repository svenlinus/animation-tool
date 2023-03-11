import { Component, OnInit } from '@angular/core';
import * as p5 from 'p5';

@Component({
  selector: 'app-animation-property',
  templateUrl: './animation-property.component.html',
  styleUrls: ['./animation-property.component.scss']
})
export class AnimationPropertyComponent implements OnInit {
  private canvas: any;
  public canvasId: string = 'canvas-container-' + Math.random() * 1000;
  private beziers: Bezier[] = [];

  constructor() { }

  ngOnInit(): void {
    let mouseInPoint: boolean;
    let mouse: Vec2;
    let bgColor:string = 'rgb(25, 33, 42)'
    let dragging: number = -1;

    const sketch = (s: any) => {
      s.setup = () => {
        let canvas2 = s.createCanvas(500, 500);
        canvas2.parent(this.canvasId);

        s.background(bgColor);
        // s.rectMode(s.CENTER);
        s.textAlign(s.CENTER, s.CENTER);

        this.beziers = [new Bezier(new Vec2(100, s.height-150), 
          new Vec2(s.width*0.25, s.height*0.5),
          new Vec2(s.width*0.75, s.height*0.5),
          new Vec2(s.width-100, 150))];
        mouse = new Vec2(0, 0);
      };

      const drawCurve = () => {
        s.strokeWeight(2);
        s.noFill();
        s.stroke('#2f75ff');
        let pp = this.beziers[0].points[0];
        let j = 0;
        for (let i = 0; i < 1; i += 0.025) {
          const u = Math.round(i * this.beziers.length * 1000) / 1000;
          j = Math.floor(u);
          const t = Math.round((u - j) * 1000) / 1000;
          const p = this.beziers[j].getValue(t);
          s.line(p.x, p.y, pp.x, pp.y);
          pp = p;
        }
        s.line(pp.x, pp.y, this.beziers[j].points[3].x, this.beziers[j].points[3].y);
      }

      const drawControlPoints = () => {
        s.strokeWeight(1);
        s.stroke(255, 100);
        s.noFill();
        mouseInPoint = false;
        for (let j = 0; j < this.beziers.length; j ++) {
          const bez = this.beziers[j];
          for (let i = 0; i < bez.points.length; i ++) {
            const point = bez.points[i];
            const ppoint = i > 0 ? bez.points[i-1] : null;
            const fpoint = i < bez.points.length-1 ? bez.points[i+1] : null;
            if (point.mouseIn(mouse) || point.drag) {
              if (dragging >= 0 && dragging != i) continue;
              mouseInPoint = true;
              s.cursor('grab');
              if (s.mouseIsPressed) {
                dragging = i;
                point.drag = true;
                point.track(mouse, s.width, s.height);
              } else {
                dragging = -1;
                point.drag = false;
              }
            }
            if (i == 1 || i == bez.points.length-1) {
              s.line(point.x, point.y, ppoint?.x, ppoint?.y)
            } else {
              
            }
            s.circle(point.x, point.y, 10);
          }
        }
      }

      const drawGrid = () => {
        s.strokeWeight(1);
        s.stroke(255, 20);
        s.line(0, 150, s.width, 150);
        s.line(0, s.height-150, s.width, s.height-150);
        s.stroke(bgColor);
        s.fill(255, 100);
        s.textSize(15);
        s.text('1', 20, 150);
        s.text('0', 20, s.height-150);
      }

      const drawBoundingBox = () => {
        let i = this.mouseToBezier(mouse);
        if (i >= 0) {
          const b = this.beziers[i];
          s.stroke(255, 20);
          if (b.min && b.max)
            s.rect(b.min.x, b.min.y, b.max.x-b.min.x, b.max.y-b.min.y);
        }
      }

      s.draw = () => {
        s.cursor(s.ARROW);
        mouse.set(s.mouseX, s.mouseY);
        s.background(bgColor);
        drawGrid();
        drawControlPoints();
        if (!mouseInPoint) {
          drawBoundingBox();
        }
        drawCurve();
      };

      s.mouseReleased = () => {
        if (!mouseInPoint) {
          let i = this.mouseToBezier(mouse);
          if (i < 0) return;
          const b = this.beziers[i];
          const newPoints = [
            new Vec2(b.mid.x - 30, b.mid.y),
            b.mid.copy(),
            new Vec2(b.mid.x + 30, b.mid.y),
          ];
          newPoints[1].setChildren(newPoints[0], newPoints[2]);
          newPoints[0].mirror(newPoints[2]);
          newPoints[2].mirror(newPoints[0]);
          this.beziers.splice(i, 0, new Bezier(b.points[0], b.points[1], newPoints[0], newPoints[1]));
          b.points.splice(0, 2, newPoints[1], newPoints[2]);
        }
      };

    };
    this.canvas = new p5(sketch);
  }

  private mouseToBezier(mouse: Vec2): number {
    for (let i = 0; i < this.beziers.length; i ++) {
      const p = this.beziers[i].mouseToPoint(mouse);
      if (p) return i
    }
    return -1;
  }
}

class Bezier {
  public points: Vec2[];
  public mid: Vec2;
  public min?: Vec2;
  public max?: Vec2;
  constructor(a: Vec2, b: Vec2, c: Vec2, d: Vec2) {
    this.points = [a, b, c, d];
    this.mid = Vec2.add(this.points[0], this.points[3]).div(2);
  }
  public getValue(t: number): Vec2 {
    const x = (Math.pow(1-t, 3) * this.points[0].x) + (3 * Math.pow(1-t, 2) * t * this.points[1].x) + (3 * (1-t) * t*t * this.points[2].x) + (t*t*t * this.points[3].x);
    const y = (Math.pow(1-t, 3) * this.points[0].y) + (3 * Math.pow(1-t, 2) * t * this.points[1].y) + (3 * (1-t) * t*t * this.points[2].y) + (t*t*t * this.points[3].y);
    return new Vec2(x, y);
  }
  public mouseToPoint(mouse: Vec2): any {
    this.max = Vec2.max(this.points);
    this.min = Vec2.min(this.points);
    this.mid = Vec2.add(this.max, this.min).div(2);
    return mouse.x > this.min.x && mouse.x < this.max.x && mouse.y > this.min.y && mouse.y < this.max.y;
  }
}

class Vec2 {  // point
  public drag?: boolean;
  public children?: Vec2[];
  public reflection?: Vec2;
  public parent?: Vec2;

  constructor(public x: number, public y: number) {
  }
  public set(x: number, y: number) {
    this.x = x;
    this.y = y;
  }
  public track(v: Vec2, w: number, h: number) {
    const x = v.x < 0 ? 0 : (v.x > w ? w : v.x);
    const y = v.y < 0 ? 0 : (v.y > h ? h : v.y);
    const p = this.copy();
    this.set(x, y)
    if (this.children) {
      for (let c of this.children) {
        const off = Vec2.sub(c, p);
        const np = Vec2.add(this, off);
        c.set(np.x, np.y);
      }
    }
    if (this.reflection && this.parent) {
      const np = Vec2.sub(Vec2.mult(this.parent, 2), this);
      this.reflection.set(np.x, np.y);
    }
  }
  public mouseIn(mouse: Vec2) {
    return Vec2.sub(this, mouse).magSq() < 100;
  }
  public static sub(a: Vec2, b: Vec2) {
    return new Vec2(a.x-b.x, a.y-b.y)
  }
  public static mult(a: Vec2, num: number) {
    return new Vec2(a.x*num, a.y*num);
  }
  public static add(a: Vec2, b: Vec2) {
    return new Vec2(a.x+b.x, a.y+b.y)
  }
  public add(v: Vec2): Vec2 {
    this.set(this.x + v.x, this.y + v.y);
    return this;
  }
  public div(num: number): Vec2 {
    this.x = this.x / num;
    this.y = this.y / num;
    return this;
  }
  public copy(): Vec2 {
    return new Vec2(this.x, this.y);
  }
  public static max(points: Vec2[]): Vec2 {
    let rx = points[0].x;
    let ry = points[0].y;
    for (let p of points) {
      if (p.x > rx) rx = p.x;
      if (p.y > ry) ry = p.y;
    }
    return new Vec2(rx, ry);
  }
  public static min(points: Vec2[]): Vec2 {
    let rx = points[0].x;
    let ry = points[0].y;
    for (let p of points) {
      if (p.x < rx) rx = p.x;
      if (p.y < ry) ry = p.y;
    }
    return new Vec2(rx, ry);
  }
  public setChildren(v1: Vec2, v2: Vec2) {
    this.children = [v1, v2];
    v1.parent = this;
    v2.parent = this;
  }
  public mirror(v: Vec2) {
    this.reflection = v;
  }
  public magSq() {
    return this.x*this.x + this.y*this.y;
  }
  public static lerp(a: Vec2, b: Vec2, t: number) {
    return new Vec2(a.x + (b.x - a.x) * t, a.y + (b.y - a.y) * t);
  }
  // (1-t)^3 a + 3(1-t)^2 tb + 3(1-t) t^2c + t^3 d
  public static cubicBezier(a: Vec2, b: Vec2, c: Vec2, d: Vec2, t: number) {
    const x = (Math.pow(1-t, 3) * a.x) + (3 * Math.pow(1-t, 2) * t * b.x) + (3 * (1-t) * t*t * c.x) + (t*t*t * d.x);
    const y = (Math.pow(1-t, 3) * a.y) + (3 * Math.pow(1-t, 2) * t * b.y) + (3 * (1-t) * t*t * c.y) + (t*t*t * d.y);
    return new Vec2(x, y);
  }
}