import { BezierSpline, LinearSpline, Spline, SpringLine, PolynomialSpline, CustomGraph } from './../curve.model';
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
  private _type!: TimeMapType;
  private curve!: Spline;
  private refresh = false;
  @Input() set type(val: TimeMapType) {
    this._type = val;
    this.refresh = true;
    switch (val) {
      case TimeMapType.Bezier:
        this.curve = new BezierSpline(this);
        break;
      case TimeMapType.Spring:
        this.curve = new SpringLine(this);
        break;
      case TimeMapType.Linear:
        this.curve = new LinearSpline(this);
        break;
      case TimeMapType.Polynomial:
        this.curve = new PolynomialSpline(this);
        break;
      default:
        this.curve = new CustomGraph(this);
        break;
    }
  };
  @Output() public pointsChange = new EventEmitter<Array<Point>>();
  @Output() public framesChange = new EventEmitter<Array<PercentFrame>>();

  public canvasId: string = 'canvas-container-' + Math.round(Math.random() * 1000);
  public beziers: Bezier[] = [];
  public mouseInPoint!: boolean;
  public mouse!: Point;
  public bgColor: string = 'rgb(25, 33, 42)'
  public dragging: number = -1;
  public zoom = new Point(380, 200);
  public offset = new Point(60, 150);
  public p5!: p5;
  
  private canvas: any;
  private frames: Array<PercentFrame> = []
  private inFocus: boolean = false;

  constructor() {
  }

  ngOnInit(): void {
  }

  ngAfterViewInit(): void {

    /*************** p5 Code (I usually collapse this if I'm not working on it) ***************/ 
    const sketch = (s: p5) => {
      this.p5 = s;

      s.setup = () => {
        this.refresh = false;
        this.curve.setup();
        s.background(this.bgColor);
        s.textAlign(s.CENTER, s.CENTER);
        this.mouse = new Point(0, 0);
      };

      s.draw = () => {
        if (this.refresh) s.setup();
        s.cursor(s.ARROW);
        this.mouse.set(s.mouseX, s.mouseY);
        this.mouse = this.mouse.screenToWorld(this.zoom, this.offset);
        s.background(this.bgColor);
        drawGrid();
        this.curve.draw();
        drawFrames();
      };

      s.mouseClicked = () => {
        if (!this.mouseInPoint && this.inFocus) {
          this.curve.add();
        }
      };

      const drawFrames = () => {
        for (let frame of this.frames) {
          const pos = new Point(frame.percent, frame.value).worldToScreen(this.zoom, this.offset);
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
        s.stroke(this.bgColor);
        s.fill(255, 100);
        s.textSize(15);
        s.text('1', 20, 150);
        s.text('0', 20, s.height-150);
      }
    };
    /*************** p5 Code ***************/ 

    this.canvas = new p5(sketch);
  }

  public mouseToBezier(): number {
    for (let i = 0; i < this.beziers.length; i ++) {
      if(this.beziers[i].mouseIn(this.mouse)) return i;
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