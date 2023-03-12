import { AfterViewInit, Component, OnInit } from '@angular/core';
import * as p5 from 'p5';
import { Point, Bezier } from '../geometry';

@Component({
  selector: 'app-animation-property',
  templateUrl: './animation-property.component.html',
  styleUrls: ['./animation-property.component.scss']
})
export class AnimationPropertyComponent implements OnInit, AfterViewInit {
  private canvas: any;
  public canvasId: string = 'canvas-container-' + Math.round(Math.random() * 1000);
  private beziers: Bezier[] = [];
  private inFocus: boolean = false;

  constructor() { }

  ngOnInit(): void {
  }

  ngAfterViewInit(): void {
    let mouseInPoint: boolean;
    let mouse: Point;
    let bgColor:string = 'rgb(25, 33, 42)'
    let dragging: number = -1;

    const sketch = (s: any) => {
      s.setup = () => {
        let canvas2 = s.createCanvas(500, 500);
        canvas2.parent(this.canvasId);

        s.background(bgColor);
        // s.rectMode(s.CENTER);
        s.textAlign(s.CENTER, s.CENTER);

        this.beziers = [new Bezier(new Point(100, s.height-150), 
          new Point(s.width*0.25, s.height*0.5),
          new Point(s.width*0.75, s.height*0.5),
          new Point(s.width-100, 150))];
        mouse = new Point(0, 0);
      };

      const drawBezierCurve = () => {
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
          if (p.x < pp.x) p.x = pp.x;
          s.line(p.x, p.y, pp.x, pp.y);
          pp = p;
        }
        s.line(pp.x, pp.y, this.beziers[j].points[3].x, this.beziers[j].points[3].y);
      }

      const drawBezierControlPoints = () => {
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

      const drawBezierBoundingBox = () => {
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
        drawBezierControlPoints();
        if (!mouseInPoint) {
          drawBezierBoundingBox();
        }
        drawBezierCurve();
      };

      s.mouseClicked = () => {
        if (!mouseInPoint && this.inFocus) {
          let i = this.mouseToBezier(mouse);
          if (i < 0) return;
          const b = this.beziers[i];
          const newPoints = [
            new Point(b.mid.x - 30, b.mid.y),
            b.mid.copy(),
            new Point(b.mid.x + 30, b.mid.y),
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

  private mouseToBezier(mouse: Point): number {
    for (let i = 0; i < this.beziers.length; i ++) {
      const p = this.beziers[i].mouseToPoint(mouse);
      if (p) return i
    }
    return -1;
  }

  public setFocus(event: boolean) {
    this.inFocus = event;
  }
}