import { AnimationGraphComponent } from './animation-graph/animation-graph.component';
import { Bezier, Point } from './geometry';

export interface Spline {
  setup(): any;
  draw(): any;
  add(): any;
}

export class BezierSpline implements Spline {

  constructor(private component: AnimationGraphComponent) {
  }

  public setup() {
    const comp = this.component;
    const s = comp.p5;
    let canvas2 = s.createCanvas(500, 500);
    canvas2.parent(comp.canvasId);

    comp.beziers = [new Bezier(comp.points || [])];
    comp.beziers[0].points[3].isLast = true;
  }

  public draw() {
    this.drawControlPoints();
    if (!this.component.mouseInPoint) this.drawBezierBoundingBox();
    this.drawCurve();
  }

  private drawCurve() {
    const comp = this.component;
    const s = comp.p5;
    s.strokeWeight(2);
    s.noFill();
    let pp = comp.beziers[0].points[0].worldToScreen(comp.zoom, comp.offset);
    let j = 0;
    for (let i = 0; i < 1; i += 0.025) {
      s.stroke('#2f75ff');
      const u = Math.round(i * comp.beziers.length * 1000) / 1000;
      j = Math.floor(u);
      const t = Math.round((u - j) * 1000) / 1000;
      const p = comp.beziers[j].getValue(t).worldToScreen(comp.zoom, comp.offset);
      if (p.x < pp.x) {
        s.stroke('#E55054');
      }
      s.line(p.x, p.y, pp.x, pp.y);
      pp = p;
    }
    const lp = comp.beziers[j].points[3].worldToScreen(comp.zoom, comp.offset);
    s.line(pp.x, pp.y, lp.x, lp.y);
  }

  private drawControlPoints() {
    const comp = this.component;
    const s = comp.p5;
    s.strokeWeight(1);
    s.stroke(255, 100);
    s.noFill();
    comp.mouseInPoint = false;
    for (let j = 0; j < comp.beziers.length; j ++) {
      const bez = comp.beziers[j];
      for (let i = 0; i < bez.points.length; i ++) {    // loop through all points in all beziers
        const point = bez.points[i];
        const ppoint = i > 0 ? bez.points[i-1] : null;
        if ((point.mouseIn(comp.mouse) || point.drag) && j+i > 0) {      // handle mouse drag for all points except for first
          if (comp.dragging >= 0 && comp.dragging != i) continue;
          comp.mouseInPoint = true;
          s.cursor('grab');
          if (s.mouseIsPressed) {
            comp.dragging = i;
            point.drag = true;
            point.track(comp.mouse, 0.158, 0.75);
          } else {
            comp.dragging = -1;
            point.drag = false;
          }
        }
        if (!s.mouseIsPressed && point.isLast) {                            // limit last point to 0 and 1
          point.y = Math.round(point.y);
        }
        const p1 = point.worldToScreen(comp.zoom, comp.offset);
        if ((i == 1 || i == bez.points.length-1) && ppoint) {
          const p2 = ppoint.worldToScreen(comp.zoom, comp.offset);
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
      const p1 = b.min?.worldToScreen(comp.zoom, comp.offset);
      const p2 = b.max?.worldToScreen(comp.zoom, comp.offset);
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
}

export class SpringLine implements Spline {
  constructor(private component: AnimationGraphComponent) {
  }
  public setup() {
  }
  public draw() {
  }
  public add() {
    throw new Error('Method not implemented.');
  }
}

export class LinearSpline implements Spline {
  constructor(private component: AnimationGraphComponent) {
  }
  public setup() {
    
  }
  public draw() {
    throw new Error('Method not implemented.');
  }
  public add() {
    throw new Error('Method not implemented.');
  }
}

export class PolynomialSpline implements Spline {
  constructor(private component: AnimationGraphComponent) {
  }
  setup() {
    
  }
  draw() {
    throw new Error('Method not implemented.');
  }
  add() {
    throw new Error('Method not implemented.');
  }
}

export class CustomGraph implements Spline {
  constructor(private component: AnimationGraphComponent) {
  }
  setup() {
    
  }
  draw() {
    throw new Error('Method not implemented.');
  }
  add() {
    throw new Error('Method not implemented.');
  }
}