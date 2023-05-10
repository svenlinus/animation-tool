import { AnimationEditorComponent } from '../animation-editor.component';
import { AnimationGraphComponent } from '../animation-graph/animation-graph.component';
import { PercentFrame } from '../animation.model';
import { Interpolate, Point } from '../geometry';
import { Graph, SpringConfig, SpringPoint } from '../curve.model';

export class SpringGraph implements Graph {
  public initVelocity: number = 0.1;
  public stiffness: number = 0.1;
  public dampener: number = 0.1;
  public endPoint: number = 1;
  public points: Array<SpringPoint> = [];
  private pos: number = 0;
  private vel!: number;
  private acc!: number;
  private cp: Array<Point> = [new Point(0, this.initVelocity), new Point(1, this.endPoint)];   // control points

  constructor(private component: AnimationGraphComponent) {
  }
  public sample(): PercentFrame[] {
    const result: Array<PercentFrame> = new Array(AnimationEditorComponent.numFrames);
    for (let i = 0; i < result.length; i ++) {
      const percent = i / result.length;
      result[i] = {percent, value: this.valueAt(percent).p};
    }
    result.push({percent: 1, value: this.endPoint});
    return result;
  }
  public setup() {
    this.generatePoints();
    this.component.springConfig = this.getConfig();
  }
  public draw() {
    const comp = this.component;
    const s = comp.p5;
    this.drawCurve(s);
    this.drawControlPoint(s);
  }
  private drawControlPoint(s: any) {
    const comp = this.component;
    s.strokeWeight(1);
    for (let i = 0; i < this.cp.length; i ++) {
      const point = this.cp[i];

      if (point.mouseIn(comp.mouse) || point.drag) {
        comp.mouseInPoint = true;
        s.cursor('grab');
        if (s.mouseIsPressed) {
          point.drag = true;
          point.track(comp.mouse);
          point.x = i;
        } else {
          point.drag = false;
        }
      }

      if (!s.mouseIsPressed && i == 1) {                            // limit last point to 0 and 1
        point.y = Math.round(point.y);
      }

      s.stroke(255, 100);
      s.noFill();
      const p1 = point.worldToScreen();
      if (i == 0) {
        const p2 = new Point(0, 0).worldToScreen();
        s.line(p1.x, p1.y, p2.x, p2.y);
      }
      s.circle(p1.x, p1.y, 10);
    }

    if (this.endPoint != this.cp[1].y || this.initVelocity != this.cp[0].y) {
      this.endPoint = this.cp[1].y;
      this.initVelocity = this.cp[0].y;
      this.setup();
    }
  }
  private drawCurve(s: any) {
    s.strokeWeight(2);
    s.noFill();
    s.stroke('#2f75ff');
    s.beginShape();
    let p = new Point(0, this.points[0].p).worldToScreen();
    s.vertex(p.x, p.y)
    for(let i = 0; i < this.points.length; i ++) {
      p = new Point(i/this.points.length, this.points[i].p).worldToScreen();
      s.curveVertex(p.x, p.y);
    }
    s.vertex(p.x, p.y)
    s.endShape();
  }
  private generatePoints() {
    this.vel = this.initVelocity;
    this.pos = 0;
    this.points = [];
    let iter = 0;
    const exitPoint = 0.002;
    while (iter < 1000) {
      this.points.push({p: this.pos, v: this.vel, a: this.acc});
      this.springEquation();
      iter ++;
      if (Math.abs(this.vel) <= exitPoint && Math.abs(this.endPoint-this.pos) <= exitPoint && iter > 20) {
        break;
      }
    }
  }
  private springEquation() {
    this.acc = (this.stiffness * (this.endPoint-this.pos)) - (this.dampener * this.vel);
    this.vel += this.acc;
    this.pos += this.vel;
  }
  public setConfig(config: SpringConfig) {
    this.stiffness = config.stiffness;
    this.dampener = config.dampener;
    this.initVelocity = config.initVelocity;
    this.generatePoints();
  }
  public getConfig(): SpringConfig {
    return {
      stiffness: this.stiffness,
      dampener: this.dampener,
      initVelocity: this.initVelocity
    }
  }
  private valueAt(x: number): SpringPoint {
    const i = Math.floor(x * (this.points.length - 0.99));
    const p1 = this.points[i];
    const p2 = this.points[i + 1];
    const t = (x * this.points.length - i);
    return {
      p: Interpolate.lerp(p1.p, p2?.p, t),
      v: Interpolate.lerp(p1.v, p2?.v, t),
      a: Interpolate.lerp(p1.a, p2?.a, t)
    }
  }
}
