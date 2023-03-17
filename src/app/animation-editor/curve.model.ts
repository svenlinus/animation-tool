import { AnimationGraphComponent } from './animation-graph/animation-graph.component';
import { PercentFrame } from './animation.model';
import { Bezier, Point } from './geometry';

export interface Graph {
  setup(): any;
  draw(): any;
  sample(): PercentFrame[];
}

export interface Spline extends Graph {
  add(): any;
}

export class BezierSpline implements Spline {

  constructor(private component: AnimationGraphComponent) {
  }

  public sample(): PercentFrame[] {
    const comp = this.component;
    // Attempts to get 40 frames evenly spaced along the x-axis
    const frames = [];
    let px = comp.beziers[0].getValue(0).x;
    let j = 0;
    for (let i = 0; i < 1; i += 0.0005) {   // Loop through 2000 bezier values
      const u = i * comp.beziers.length;
      j = Math.floor(u);
      const t = u - j;
      let val = comp.beziers[j].getValue(t);
      if (val.x - 0.025 < px) continue      // Only add a frame if the current value.x is at least 0.025 away from the previous value.x
      px = val.x;
      frames.push({percent: val.x, value: val.y});
    }
    frames.push({percent: 1, value: comp.beziers[j].getValue(1).y});
    return frames;
  }

  public setup() {
    const comp = this.component;
    let j = -1;
    comp.beziers = [];
    for (let i = 0; i < (comp.points ? comp.points.length : 0); i += 4) {
      comp.beziers.push(new Bezier(comp.points!.slice(i, i+4)));
      j ++;
    }
    if (j >= 0) comp.beziers[j].points[3].isLast = true;
  }

  public draw() {
    if (!this.component.mouseInPoint) this.drawBezierBoundingBox();
    this.drawCurve();
    this.drawControlPoints();
  }

  private drawCurve() {
    const comp = this.component;
    const s = comp.p5;
    s.strokeWeight(2);
    s.noFill();
    let pp = comp.beziers[0].points[0].worldToScreen();
    let j = 0;
    for (let i = 0; i < 1; i += 0.02) {
      s.stroke('#2f75ff');
      const u = Math.round(i * comp.beziers.length * 1000) / 1000;
      j = Math.floor(u);
      const t = Math.round((u - j) * 1000) / 1000;
      const p = comp.beziers[j].getValue(t).worldToScreen();
      if (p.x < pp.x) {
        s.stroke('#E55054');
      }
      s.line(p.x, p.y, pp.x, pp.y);
      pp = p;
    }
    const lp = comp.beziers[j].points[3].worldToScreen();
    s.line(pp.x, pp.y, lp.x, lp.y);
  }

  private drawControlPoints() {
    const comp = this.component;
    const s = comp.p5;
    let redraw = false;
    s.strokeWeight(1);
    comp.mouseInPoint = false;

    for (let j = 0; j < comp.beziers.length; j ++) {
      const bez = comp.beziers[j];
      for (let i = 0; i < bez.points.length; i ++) {    // loop through all points in all beziers
        const point = bez.points[i];
        const ppoint = i > 0 ? bez.points[i-1] : null;

        if (point.remove) {
          point.remove = false;
          redraw = true;
          this.remove(j);
        }

        if ((point.mouseIn(comp.mouse) || point.drag) && j+i > 0) {      // handle mouse drag for all points except for first
          const id = j * bez.points.length + i;
          if (comp.dragging >= 0 && comp.dragging != id) continue;
          comp.mouseInPoint = true;
          s.cursor('grab');
          if (s.mouseIsPressed && s.mouseButton == s.LEFT && !comp.keys[16]) {
            comp.dragging = id;
            point.drag = true;
            point.track(comp.mouse);
          } else {
            comp.dragging = -1;
            point.drag = false;
          }
          if (comp.mouseUp && (s.mouseButton == 'RIGHT' || comp.keys[16]) && point.children && point.children.length > 0) {
            comp.mouseUp = false;
            point.showMenu = true;
            point.showContextMenu(s, comp, comp.mouse.worldToScreen());
          }
        }

        if (!s.mouseIsPressed && point.isLast) {                            // limit last point to 0 and 1
          point.y = Math.round(point.y);
        }
        if (point.showMenu) {
          point.showContextMenu(s, comp);
          if (comp.mouseUp) point.showMenu = false;
        }

        s.stroke(255, 100);
        s.noFill();
        const p1 = point.worldToScreen();
        if ((i == 1 || i == bez.points.length-1) && ppoint) {
          const p2 = ppoint.worldToScreen();
          s.line(p1.x, p1.y, p2.x, p2.y);
        }
        s.circle(p1.x, p1.y, 10);
      }
    }

    if (redraw) {
      s.background(comp.bgColor);
      this.drawControlPoints();
      this.drawCurve();
    }
  }

  private drawBezierBoundingBox() {
    const comp = this.component;
    const s = comp.p5;
    let i = comp.mouseToBezier();
    if (i >= 0) {
      const b = comp.beziers[i];
      const p1 = b.min?.worldToScreen();
      const p2 = b.max?.worldToScreen();
      s.noFill();
      s.stroke(255, 20);
      if (p1 && p2)
        s.rect(p1.x, p1.y, p2.x-p1.x, p2.y-p1.y);
    }
  }

  public add() {
    const comp = this.component;
    let i = comp.mouseToBezier();
    if (i < 0) return;
    const b = comp.beziers[i];
    const newPoints = [
      new Point(b.mid.x - 0.08, b.mid.y),
      b.mid.copy(),
      new Point(b.mid.x + 0.08, b.mid.y),
    ];
    newPoints[1].setChildren(newPoints[0], newPoints[2]);
    newPoints[0].mirror(newPoints[2]);
    newPoints[2].mirror(newPoints[0]);
    comp.beziers.splice(i, 0, new Bezier( [b.points[0], b.points[1], newPoints[0], newPoints[1]] ));
    b.points.splice(0, 2, newPoints[1], newPoints[2]);
  }

  public remove(i: number) {
    const comp = this.component;
    const b1 = comp.beziers[i - 1];
    const b2 = comp.beziers[i];
    b2.points[0] = b1.points[0];
    b2.points[1] = b1.points[1];
    comp.beziers.splice(i-1, 1);
  }
}

export interface Dict {
  [key: string]: any
}

export interface SpringConfig extends Dict {
  stiffness: number;
  dampener: number;
  maxVelocity: number;
  initVelocity: number;
}

export class SpringGraph implements Graph {
  public initVelocity: number = 0.1;
  public stiffness: number = 0.1;
  public dampener: number = 0.1;
  public maxVelocity: number = 1;
  public endPoint: number = 1;
  public points: Array<{p: number, v: number, a: number}> = [];
  private pos: number = 0;
  private vel!: number;
  private acc!: number;
  private cp: Array<Point> = [new Point(0, this.initVelocity), new Point(1, this.endPoint)];

  constructor(private component: AnimationGraphComponent) {
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
    const sample = 2;
    while (iter < 1000) {
      if (iter % sample == 0) this.points.push({p: this.pos, v: this.vel, a: this.acc});
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
    this.vel = this.vel > this.maxVelocity ? this.maxVelocity : (this.vel < -this.maxVelocity ? -this.maxVelocity : this.vel);
    this.pos += this.vel;
  }
  public setConfig(config: SpringConfig) {
    this.stiffness = config.stiffness;
    this.dampener = config.dampener;
    this.maxVelocity = config.maxVelocity;
    this.initVelocity = config.initVelocity;
    this.generatePoints();
  }
  public getConfig(): SpringConfig {
    return {
      stiffness: this.stiffness,
      dampener: this.dampener,
      maxVelocity: this.maxVelocity,
      initVelocity: this.initVelocity
    }
  }
  public sample(): PercentFrame[] {
    const comp = this.component;
    const result = this.points.map((p, i) => {return {percent: i / this.points.length, value: p.p}});
    result.push({percent: 1, value: this.endPoint});
    return result;
  }
}

export class LinearSpline implements Spline {
  constructor(private component: AnimationGraphComponent) {
  }
  sample(): PercentFrame[] {
    throw new Error('Method not implemented.');
  }
  public setup() {
    const comp = this.component;
  }
  public draw() {
    const comp = this.component;
    const s = comp.p5;
  }
  public add() {
    const comp = this.component;
    const s = comp.p5;
  }
}

export class PolynomialSpline implements Spline {
  constructor(private component: AnimationGraphComponent) {
  }
  public sample(): PercentFrame[] {
    throw new Error('Method not implemented.');
  }
  public setup() {
    const comp = this.component;
    
  }
  public draw() {
    const comp = this.component;
    const s = comp.p5;
  }
  public add() {
    const comp = this.component;
  }
}

export class CustomGraph implements Graph {
  constructor(private component: AnimationGraphComponent) {
  }
  public sample(): PercentFrame[] {
    throw new Error('Method not implemented.');
  }
  public setup() {
    const comp = this.component;
  }
  public draw() {
    const comp = this.component;
    const s = comp.p5;
  }
  public add() {
    const comp = this.component;
  }
}