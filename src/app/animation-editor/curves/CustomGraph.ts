import { AnimationEditorComponent } from "../animation-editor.component";
import { AnimationGraphComponent } from "../animation-graph/animation-graph.component";
import { PercentFrame } from "../animation.model";
import { Graph, PhysicsPoint } from "../curve.model";
import { Point } from "../geometry";

export class CustomGraph implements Graph {
  private valueAt: Function = (x: number) => {
    function sin(x: number) {return 0.7 * Math.sin(4 * Math.PI * x);} 
    return sin(x);
  };

  private points: PhysicsPoint[] = [];

  constructor(private component: AnimationGraphComponent) {
  }
  public sample(): PercentFrame[] {
    const N = AnimationEditorComponent.numFrames + 1;
    const frames = new Array(N);
    for (let i = 0; i < N; i++) {
      const percent = i / (frames.length - 1);
      frames[i] = {percent, value: this.valueAt(percent)};
    }
    console.log(frames);
    console.log(this.valueAt);
    return frames;
  }
  public setup() {
    this.generatePoints();
  }
  public draw() {
    const comp = this.component;
    const s = comp.p5;
    this.drawCurve(s);
  }
  private drawCurve(s: any) {
    s.strokeWeight(2);
    s.noFill();
    s.stroke('#2f75ff');
    s.beginShape();
    for(let i = 0; i < this.points.length; i ++) {
      const p = new Point(i/(this.points.length-1), this.points[i].p).worldToScreen();
      s.vertex(p.x, p.y);
    }
    s.endShape();
  }
  private generatePoints() {
    const N = 100;
    this.points = new Array(N);
    for (let i = 0; i < N; i++) {
      const y = this.valueAt(i / N);
      this.points[i] = {
        p: y,
        v: y,
        a: y
      };
    }
  }

  public setFunction(val: Function) {
    if (val && val instanceof Function) {
      this.valueAt = val;
      this.generatePoints();
    }
  }
}