import { PercentFrame, TimeMapType } from './../animation.model';
import { AfterViewInit, Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import * as p5 from 'p5';
import { Point, Bezier } from '../geometry';

@Component({
  selector: 'app-animation-graph',
  templateUrl: './animation-graph.component.html',
  styleUrls: ['./animation-graph.component.scss']
})
export class AnimationGraphComponent implements OnInit, AfterViewInit {
  @Input() public points?: Array<Point>;
  @Input() public type?: TimeMapType;
  @Output() public pointsChange = new EventEmitter<Array<Point>>();
  @Output() public framesChange = new EventEmitter<Array<PercentFrame>>();

  public canvasId: string = 'canvas-container-' + Math.round(Math.random() * 1000);
  
  private canvas: any;
  private beziers: Bezier[] = [];
  private frames: Array<PercentFrame> = []
  private inFocus: boolean = false;

  constructor() { }

  ngOnInit(): void {
  }

  ngAfterViewInit(): void {
    let mouseInPoint: boolean;
    let mouse: Point;
    let bgColor:string = 'rgb(25, 33, 42)'
    let dragging: number = -1;

    /*************** p5 Code (I usually collapse this if I'm not working on it) ***************/ 
    const sketch = (s: any) => {
      // const offset = new Point();
      const zoom = new Point(380, 200);
      const offset = new Point(60, 150);

      s.setup = () => {
        if (this.type == TimeMapType.Bezier) {
          setUpBezierCureve();
        }
        s.background(bgColor);
        s.textAlign(s.CENTER, s.CENTER);
        mouse = new Point(0, 0);
      };

      s.draw = () => {
        s.cursor(s.ARROW);
        mouse.set(s.mouseX, s.mouseY);
        mouse = mouse.screenToWorld(zoom, offset);
        s.background(bgColor);
        drawGrid();
        if (this.type == TimeMapType.Bezier) {
          drawBezierControlPoints();
          if (!mouseInPoint) drawBezierBoundingBox();
          drawBezierCurve();
        }
        drawFrames();
      };

      s.mouseClicked = () => {
        if (!mouseInPoint && this.inFocus) {
          if (this.type == TimeMapType.Bezier) {
            addBezier();
          }
        }
      };

      const addBezier = () => {
        let i = this.mouseToBezier(mouse);
        if (i < 0) return;
        const b = this.beziers[i];
        const newPoints = [
          new Point(b.mid.x - 0.08, b.mid.y),
          b.mid.copy(),
          new Point(b.mid.x + 0.08, b.mid.y),
        ];
        newPoints[1].setChildren(newPoints[0], newPoints[2]);
        newPoints[0].mirror(newPoints[2]);
        newPoints[2].mirror(newPoints[0]);
        this.beziers.splice(i, 0, new Bezier( [b.points[0], b.points[1], newPoints[0], newPoints[1]] ));
        b.points.splice(0, 2, newPoints[1], newPoints[2]);
      }

      const setUpBezierCureve = () => {
        let canvas2 = s.createCanvas(500, 500);
        canvas2.parent(this.canvasId);

        this.beziers = [new Bezier(this.points || [])];
        this.beziers[0].points[3].isLast = true;
      }

      const drawBezierCurve = () => {
        let isAFunction = true;
        s.strokeWeight(2);
        s.noFill();
        let pp = this.beziers[0].points[0].worldToScreen(zoom, offset);
        let j = 0;
        for (let i = 0; i < 1; i += 0.025) {
          s.stroke('#2f75ff');
          const u = Math.round(i * this.beziers.length * 1000) / 1000;
          j = Math.floor(u);
          const t = Math.round((u - j) * 1000) / 1000;
          const p = this.beziers[j].getValue(t).worldToScreen(zoom, offset);
          if (p.x < pp.x) {
            isAFunction = false;
            s.stroke('#E55054');
          }
          s.line(p.x, p.y, pp.x, pp.y);
          pp = p;
        }
        const lp = this.beziers[j].points[3].worldToScreen(zoom, offset);
        s.line(pp.x, pp.y, lp.x, lp.y);
      }

      const drawBezierControlPoints = () => {
        s.strokeWeight(1);
        s.stroke(255, 100);
        s.noFill();
        mouseInPoint = false;
        for (let j = 0; j < this.beziers.length; j ++) {
          const bez = this.beziers[j];
          for (let i = 0; i < bez.points.length; i ++) {    // loop through all points in all beziers
            const point = bez.points[i];
            const ppoint = i > 0 ? bez.points[i-1] : null;
            if ((point.mouseIn(mouse) || point.drag) && j+i > 0) {      // handle mouse drag for all points except for first
              if (dragging >= 0 && dragging != i) continue;
              mouseInPoint = true;
              s.cursor('grab');
              if (s.mouseIsPressed) {
                dragging = i;
                point.drag = true;
                point.track(mouse, 0.158, 0.75);
              } else {
                dragging = -1;
                point.drag = false;
              }
            }
            if (!s.mouseIsPressed && point.isLast) {                            // limit last point to 0 and 1
              point.y = Math.round(point.y);
            }
            const p1 = point.worldToScreen(zoom, offset);
            if ((i == 1 || i == bez.points.length-1) && ppoint) {
              const p2 = ppoint.worldToScreen(zoom, offset);
              s.line(p1.x, p1.y, p2.x, p2.y);
            }
            s.circle(p1.x, p1.y, 10);
          }
        }
      }

      const drawFrames = () => {
        for (let frame of this.frames) {
          const pos = new Point(frame.percent, frame.value).worldToScreen(zoom, offset);
          s.stroke(255, 150);
          s.strokeWeight(2);
          s.point(pos.x, pos.y);
        }
      }

      const drawGrid = () => {
        s.strokeWeight(1);
        s.stroke(255, 20);
        const padding = 150;  
        s.line(0, padding, s.width, padding);
        s.line(0, s.height - padding, s.width, s.height - padding);
        // s.line(0, s.height / 2, s.width, s.height / 2);
        // s.line(0, s.height - 80, s.width, s.height - 80);
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
          const p1 = b.min?.worldToScreen(zoom, offset);
          const p2 = b.max?.worldToScreen(zoom, offset);
          s.stroke(255, 20);
          if (p1 && p2)
            s.rect(p1.x, p1.y, p2.x-p1.x, p2.y-p1.y);
        }
      }
    };
    /*************** p5 Code ***************/ 

    this.canvas = new p5(sketch);
  }

  private mouseToBezier(mouse: Point): number {
    for (let i = 0; i < this.beziers.length; i ++) {
      if(this.beziers[i].mouseIn(mouse)) return i;
    }
    return -1;
  }


  public sample() {                        // Attempts to get 40 frames evenly spaced along the x-axis
    this.frames = [];
    let px = this.beziers[0].getValue(0).x;
    let j = 0;
    for (let i = 0; i < 1; i += 0.0005) {   // Loop through 2000 bezier values
      const u = i * this.beziers.length;
      j = Math.floor(u);
      const t = u - j;
      let val = this.beziers[j].getValue(t);
      if (val.x - 0.025 < px) continue      // Only add a frame if the current value.x is at least 0.025 away from the previous value.x
      px = val.x;
      this.frames.push({percent: val.x, value: val.y});
    }
    this.frames.push({percent: 1, value: this.beziers[j].getValue(1).y});
    this.framesChange.emit(this.frames);
  }

  private updatePoints() {
    if (this.type == TimeMapType.Bezier) {
      this.points = [];
      for (let b of this.beziers) {
        this.points = this.points.concat(b.points);
      }
      this.pointsChange.emit(this.points);
    }
  }

  public onMouseLeave() {
    this.updatePoints();
    this.setFocus(false);
  }

  public setFocus(event: boolean) {
    this.inFocus = event;
  }
}