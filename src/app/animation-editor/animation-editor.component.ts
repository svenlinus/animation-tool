import { AnimationProperty, TimeMapType, TimeMap, PercentFrame } from './animation.model';
import { Point } from "./geometry"
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-animation-editor',
  templateUrl: './animation-editor.component.html',
  styleUrls: ['./animation-editor.component.scss'],
  styles: [`
    ::ng-deep .panel-header > .mat-expansion-indicator:after {
      color: white;
    }
  `],
})
export class AnimationEditorComponent implements OnInit {
  public timeMaps: Array<TimeMap> = [];
  public panelDescriptions: Array<string> = [];
  public mapTypes: Array<TimeMapType> = Object.values(TimeMapType);
  public selectingType: boolean = false;
  private defaultMap?: TimeMap;
  private openAnimationProperties: Array<AnimationProperty> = Object.values(AnimationProperty);

  constructor() {
  }

  ngOnInit(): void {
  }

  createDefaultMap() {
    if (this.openAnimationProperties.length > 0) {
      const props = [this.openAnimationProperties[0]]
      if (this.openAnimationProperties[0].includes('X')) {
        props.push(this.openAnimationProperties[1]);
        this.openAnimationProperties.shift();
      }
      this.openAnimationProperties.shift();
      this.defaultMap = {
        properties: props,
        type: TimeMapType.Bezier,
        bezierPoints: [new Point(0, 0), 
          new Point(0.2, 0.5),
          new Point(0.8, 0.5),
          new Point(1, 1)]
      }
    }
  }

  public createPanelDescription(i: number) {
    let description = 'Animating';
    for (let j = 0; j < this.timeMaps[i].properties.length; j++) {
      const p = this.timeMaps[i].properties[j];
      if (j > 0) description += '&nbsp;and';
      description += `&nbsp;<strong>${p}</strong>`;
    }
    this.panelDescriptions[i] = description;
  }

  public setSelectingType(val: boolean) {
    this.selectingType = val;
  }

  public addTimeMap() {
    this.createDefaultMap();
    if (this.defaultMap) this.timeMaps.push(this.defaultMap);
    this.createPanelDescription(this.panelDescriptions.length);
  }

  public onFramesChanged(frames: Array<PercentFrame>) {
    // console.warn(frames);
  }
}
