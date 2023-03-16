import { AnimationProperty, TimeMapType, TimeMap, PercentFrame } from './animation.model';
import { Point } from "./geometry"
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';

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
  public numFrames: number = 40;

  // private animationContainerRef?: ElementRef;
  @ViewChild('animationContainer') animationContainerRef!: ElementRef;
  @ViewChild('demoBox') demoBoxRef!: ElementRef;

  private percentFrames: Array<PercentFrame> = [];
  private cssFrames: string = '';
  private defaultMap!: TimeMap;
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
        frames: [],
        bezierPoints: [new Point(0, 0), 
          new Point(0.4, 0.1),
          new Point(0.6, 0.9),
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
    this.timeMaps.push(this.defaultMap);
    this.createPanelDescription(this.panelDescriptions.length);
  }

  public onFramesChanged(frames: Array<PercentFrame>, timeMap: TimeMap) {
    timeMap.frames = frames;
    console.warn(frames);
    this.generateCssFrames();
  }

  private generateCssFrames() {
    this.cssFrames = '@keyframes anim {\n'
    for (let i = 0; i < this.timeMaps[0].frames.length; i++) {
      for (let tm of this.timeMaps) {
        const val = Math.round(tm.frames[i].value * 10000) / 10000 * 0.5;
        this.cssFrames += `${(i+1)/this.numFrames * 100}% { transform: scale(${1 + val}, ${1 - val}) }\n`
        // for (let p of tm.properties) {
        //   const prefix = p != AnimationProperty.Color ? 'transform: ' : '';
        //   this.cssFrames += `${prefix} scale`;
        // }
      }
    }

    this.cssFrames += '}'
    this.animationContainerRef.nativeElement.innerHTML = '<style>' + this.cssFrames + '</style>';
    // console.warn(this.animationContainerRef.nativeElement);

    console.warn(this.cssFrames);
    this.playAnimation();
  }


  public playAnimation() {
    this.demoBoxRef.nativeElement.style = '';
    void this.demoBoxRef.nativeElement.offsetWidth;
    setTimeout(() => {
      this.demoBoxRef.nativeElement.style = 'animation: anim 1s linear;';
    }, 100);
  }
}
