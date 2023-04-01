import { BezierSpline, LinearSpline, PolynomialSpline, CustomGraph, Graph, Spline, SpringGraph, SpringConfig } from '../curve.model';
import { PercentFrame, TimeMapType } from '../animation.model';
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
  public curve!: Graph;
  private refresh = false;
  @Input() set type(val: TimeMapType) {
    this._type = val;
    this.refresh = true;
    switch (val) {
      case TimeMapType.Bezier:
        this.curve = new BezierSpline(this);
        break;
      case TimeMapType.Spring:
        this.curve = new SpringGraph(this);
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
  get type(): TimeMapType {
    return this._type;
  }
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
  public mouseUp: boolean = false;
  public keys: Array<boolean> = [];
  public springConfig!: SpringConfig;
  
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
        let canvas2 = s.createCanvas(500, 500);
        canvas2.parent(this.canvasId);
        document.getElementById(this.canvasId)?.addEventListener('contextmenu', e => e.preventDefault());
        s.background(this.bgColor);
        this.mouse = new Point(0, 0);
        display();
      };

      const display = () => {
        if (this.refresh) s.setup();
        s.cursor(s.ARROW);
        this.mouse.set(s.mouseX, s.mouseY);
        this.mouse = this.mouse.screenToWorld(this.zoom, this.offset);
        s.background(this.bgColor);
        s.textAlign(s.CENTER, s.CENTER);
        drawGrid();
        this.curve.draw();
        drawFrames();
        this.mouseUp = false;
      };

      s.mouseClicked = () => {
        this.mouseUp = true;
        if (!this.mouseInPoint && this.inFocus && (this.curve as Spline).add) {
          (this.curve as Spline).add();
        }
        display();
      };

      s.mouseMoved = () => {
        display();
      }

      s.mouseDragged = () => {
        display();
      }

      s.keyPressed = () => {
        this.keys[s.keyCode] = true;
      }

      s.keyReleased = () => {
        this.keys[s.keyCode] = false;
      }

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

  public sample() {
    this.frames = this.curve.sample();
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

  public updateSpringConfig(val: SpringConfig) {
    this.springConfig = val;
    (this.curve as SpringGraph).setConfig(val);
  }

  public onMouseLeave() {
    this.updatePoints();
    this.setFocus(false);
  }

  public setFocus(event: boolean) {
    this.inFocus = event;
  }
}