import { Component, OnInit } from '@angular/core';
import * as p5 from 'p5';

@Component({
  selector: 'app-animation-property',
  templateUrl: './animation-property.component.html',
  styleUrls: ['./animation-property.component.scss']
})
export class AnimationPropertyComponent implements OnInit {
  private canvas: any;
  private sw: number = 1;
  public canvasId: string = 'canvas-container-' + Math.random() * 1000;

  constructor() { }

  ngOnInit(): void {
    let v1: Vec2, v2: Vec2, v3: Vec2, v4: Vec2;
    let mouse: Vec2;
    const sketch = (s: any) => {
      s.setup = () => {
        let canvas2 = s.createCanvas(500, 500);
        // creating a reference to the div here positions it so you can put things above and below
        // where the sketch is displayed
        canvas2.parent(this.canvasId);

        s.background(25, 33, 42);
        s.strokeWeight(this.sw);

        v1 = new Vec2(100, s.height-150);
        v2 = new Vec2(s.width*0.25, s.height*0.25);
        v3 = new Vec2(s.width*0.75, s.height*0.75);
        v4 = new Vec2(s.width-100, 150);
        mouse = new Vec2(0, 0);
      };

      s.draw = () => {
        s.cursor(s.ARROW);
        mouse.set(s.mouseX, s.mouseY);
        if (v2.mouseIn(mouse) || v2.drag) {
          s.cursor('grab');
          if (s.mouseIsPressed) {
            v2.drag = true;
            v2.track(mouse, s.width, s.height);
          } else {
            v2.drag = false;
          }
        }
        if (v3.mouseIn(mouse) || v3.drag) {
          s.cursor('grab');
          if (s.mouseIsPressed) {
            v3.drag = true;
            v3.track(mouse, s.width, s.height);
          } else {
            v3.drag = false;
          }
        }
        s.background(25, 33, 42);
        s.noFill();
        s.stroke('#2f75ff');
        let pp = v1;
        const res = 40;
        for (let t = 0; t <= res; t ++) {
          const p = Vec2.cubicBezier(v1, v2, v3, v4, t/res);
          s.line(p.x, p.y, pp.x, pp.y);
          pp = p;
        }
        s.stroke(255, 200);
        s.circle(v1.x, v1.y, 10);
        s.circle(v2.x, v2.y, 10);
        s.circle(v3.x, v3.y, 10);
        s.circle(v4.x, v4.y, 10);
      };

      s.mouseReleased = () => {
        
      };


    };
    this.canvas = new p5(sketch);
  }
}

class Vec2 {
  public drag: boolean = false;
  constructor(public x: number, public y: number) {
  }
  public set(x: number, y: number) {
    this.x = x;
    this.y = y;
  }
  public track(v: Vec2, w: number, h: number) {
    const x = v.x < 0 ? 0 : (v.x > w ? w : v.x);
    const y = v.y < 0 ? 0 : (v.y > h ? h : v.y);
    this.set(x, y)
  }
  public mouseIn(mouse: Vec2) {
    return Vec2.sub(this, mouse).magSq() < 100;
  }
  public static sub(a: Vec2, b: Vec2) {
    return new Vec2(a.x-b.x, a.y-b.y)
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