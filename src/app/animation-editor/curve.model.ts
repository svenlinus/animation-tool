import { AnimationGraphComponent } from './animation-graph/animation-graph.component';
import { Bezier, Point } from './geometry';

export interface Graph {
  setup(): any;
  draw(): any;
}

export interface Spline extends Graph {
  add(): any;
}


export class BezierSpline implements Spline {

  constructor(private component: AnimationGraphComponent) {
  }

  public setup() {
    const comp = this.component;
    comp.beziers = [new Bezier(comp.points || [])];
    comp.beziers[0].points[3].isLast = true;
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
    s.strokeWeight(1);
    comp.mouseInPoint = false;
    for (let j = 0; j < comp.beziers.length; j ++) {
      const bez = comp.beziers[j];
      for (let i = 0; i < bez.points.length; i ++) {    // loop through all points in all beziers
        const point = bez.points[i];
        const ppoint = i > 0 ? bez.points[i-1] : null;

        if (point.remove) {
          point.remove = false;
          this.remove(j);
        }

        if ((point.mouseIn(comp.mouse) || point.drag) && j+i > 0) {      // handle mouse drag for all points except for first
          if (comp.dragging >= 0 && comp.dragging != i) continue;
          comp.mouseInPoint = true;
          s.cursor('grab');
          if (s.mouseIsPressed && s.mouseButton == s.LEFT) {
            comp.dragging = i;
            point.drag = true;
            point.track(comp.mouse, 0.158, 0.75);
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
    console.warn(i);
    const comp = this.component;
    const b1 = comp.beziers[i - 1];
    const b2 = comp.beziers[i];
    b2.points[0] = b1.points[0];
    b2.points[1] = b1.points[1];
    comp.beziers.splice(i-1, 1);
  }
}

interface SpringConfig {
  initVelocity: number;
  stiffness: number;
  dampener: number;
  maxVelocity: number;
}

export class SpringGraph implements Graph {
  private initVelocity: number = 0.1;
  private stiffness: number = 0.1;
  private dampener: number = 0.1;
  private maxVelocity: number = 1;

  constructor(private component: AnimationGraphComponent) {
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
  public getConfig(): SpringConfig {
    return {initVelocity: this.initVelocity,
       stiffness: this.stiffness, 
       dampener: this.dampener, 
       maxVelocity: this.maxVelocity};
  }
  public setConfig(config: SpringConfig) {
    this.initVelocity = config.initVelocity;
    this.stiffness = config.stiffness;
    this.dampener = config.dampener;
    this.maxVelocity = config.maxVelocity;
  }
}

export class LinearSpline implements Spline {
  constructor(private component: AnimationGraphComponent) {
  }
  remove() {
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
  remove() {
    throw new Error('Method not implemented.');
  }
  setup() {
    const comp = this.component;
    
  }
  draw() {
    const comp = this.component;
    const s = comp.p5;
  }
  add() {
    const comp = this.component;
  }
}

export class CustomGraph implements Graph {
  constructor(private component: AnimationGraphComponent) {
  }
  setup() {
    const comp = this.component;
  }
  draw() {
    const comp = this.component;
    const s = comp.p5;
  }
  add() {
    const comp = this.component;
  }
}