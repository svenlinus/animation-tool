import { Spline } from '../curve.model';
import { AnimationEditorComponent } from '../animation-editor.component';
import { AnimationGraphComponent } from '../animation-graph/animation-graph.component';
import { PercentFrame } from '../animation.model';
import { Bezier, Point } from '../geometry';

export class BezierSpline implements Spline {

  constructor(private component: AnimationGraphComponent) {
  }

  public sample(): PercentFrame[] {
    const comp = this.component;
    // Attempts to get 40 frames evenly spaced along the x-axis
    const frames = [];
    let px = comp.beziers[0].getValue(0).x;
    frames.push({percent: 0, value: 0});
    let j = 0;
    for (let i = 0; i < 1; i += 0.0005) {   // Loop through 2000 bezier values
      const u = i * comp.beziers.length;
      j = Math.floor(u);
      const t = u - j;
      const minDist = 1 / AnimationEditorComponent.numFrames;
      let val = comp.beziers[j].getValue(t);
      if (val.x - minDist < px) continue      // Only add a frame if the current value.x is at least 0.025 away from the previous value.x
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
          if (s.mouseIsPressed && s.mouseButton == s.LEFT && !comp.keys[16] && comp.inFocus) {
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
      s.cursor(s.HAND);
      const b = comp.beziers[i];
      const p1 = b.min?.worldToScreen();
      const p2 = b.max?.worldToScreen();
      s.noFill();
      s.stroke(255, 40);
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