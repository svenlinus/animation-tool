import { AnimationGraphComponent } from "../animation-graph/animation-graph.component";
import { PercentFrame } from "../animation.model";
import { Graph } from "../curve.model";

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
}