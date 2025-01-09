import { AnimationProperty, TimeMapType, TimeMap, PercentFrame, CssFunction } from './animation.model';
import { Point } from "./geometry"
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormControl } from '@angular/forms';
import { map, Observable, startWith } from 'rxjs';

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
  public static numFrames: number = 20;

  public timeMaps: Array<TimeMap> = [];
  public panelDescriptions: Array<string> = [];
  public mapTypes: Array<TimeMapType> = Object.values(TimeMapType);
  public selectingType: boolean = false;
  public filteredCssFunctions!: Observable<Array<string>>;
  public chipControl = new FormControl('');
  public cssFrames: string = '';

  @ViewChild('animationContainer') animationContainerRef!: ElementRef;
  @ViewChild('description') description!: ElementRef;

  private defaultMap!: TimeMap;
  private closedFunctionsList: Array<string> = [];
  private cssFunctions: Array<string> = Object.values(CssFunction);

  constructor() {
  }

  ngOnInit(): void {
    this.filteredCssFunctions = this.chipControl.valueChanges.pipe(
      startWith(''),
      map(value => this.filterCssFunctions(value || '')),
    );
    this.loadAnimation();
  }

  private filterOptions() {
    this.chipControl.enable();
  }

  public createDefaultMap() {
    if (this.closedFunctionsList.length < this.cssFunctions.length) {
      const props = [this.cssFunctions.find(x => !this.closedFunctionsList.includes(x))];
      if (props[0]) this.closedFunctionsList.push(props[0]);
      if (props[0] && props[0].includes('X')) {
        const p2 = props[0].replace('X', 'Y');
        if (!this.closedFunctionsList.includes(p2)) {
          props.push(p2);
          this.closedFunctionsList.push(p2);
        }
      }
      this.filterOptions();
      this.defaultMap = {
        properties: props.map(prop => new AnimationProperty(<CssFunction>prop)),
        type: TimeMapType.Bezier,
        frames: [],
        bezierPoints: [new Point(0, 0), 
          new Point(0.4, 0.1),
          new Point(0.6, 0.9),
          new Point(1, 1)]
      }
    }
  }

  public removeTimeMap(i: number) {
    const props = [...this.timeMaps[i].properties];
    props.forEach(p => this.removeProperty(i, 0));
    this.timeMaps.splice(i, 1);
    this.generateCssFrames();
  }

  public addChip(value: string, timeMap: TimeMap) {
    const key: keyof typeof CssFunction = value[0].toUpperCase() + value.slice(1) as (keyof typeof CssFunction);
    this.chipControl.reset();
    const prop = new AnimationProperty(CssFunction[key]);
    this.closedFunctionsList.push(prop.func);
    timeMap.properties.push(prop);
    this.filterOptions();
    this.generateCssFrames();
  }

  public removeProperty(i:number, j: number) {
    const ci = this.closedFunctionsList.indexOf(this.timeMaps[i].properties[j].func);
    this.closedFunctionsList.splice(ci, 1);
    this.timeMaps[i].properties.splice(j, 1);
    this.filterOptions();
    this.generateCssFrames();
  }

  public setSelectingType(val: boolean) {
    this.selectingType = val;
  }

  public addTimeMap() {
    const offsetY = document.body.clientHeight - window.scrollY;
    this.createDefaultMap();
    this.timeMaps.push(this.defaultMap);
    setTimeout(() => {
      window.scrollTo(0, document.body.clientHeight - offsetY);
    }, 10);
  }

  public onFramesChanged(frames: Array<PercentFrame>, timeMap: TimeMap) {
    timeMap.frames = frames;
    console.warn(frames);
    this.generateCssFrames();
  }

  private filterCssFunctions(value: string): string[] {
    const filterValue = value.toLowerCase();
    return this.cssFunctions.filter(option => option.toLowerCase().includes(filterValue))
      .filter(option => !this.closedFunctionsList.includes(option));
  }

  public generateCssFrames() {
    this.cssFrames = '@keyframes custom-anim {\n'
    for (let i = 0; i < AnimationEditorComponent.numFrames + 1; i++) {
      const percent = Math.round(i/AnimationEditorComponent.numFrames * 1000) / 10;
      let significant = false;  // if all time maps have an insignificant frame at this position do not add a keyframe 
      let keyframeString = '';
      for (let tm of this.timeMaps) {
        if (!tm.frames[i]) continue;
        if (!tm.frames[i].insignificant) significant = true;
        const val = tm.frames[i].value!;
        for (let prop of tm.properties) {
          keyframeString += prop.createFunction(val) + ' ';
        }
      }
      if (keyframeString.length > 0 && significant) {
        this.cssFrames += `\t${percent}% { transform: ${keyframeString}} \n`;
      }
    }
    this.cssFrames += '}\n'
    this.animationContainerRef.nativeElement.innerHTML = '<style>' + this.cssFrames + '</style>';
    this.loadAnimation();
    console.warn(this.cssFrames);
  }

  public updateAnimationClass(val: string) {
    this.animationContainerRef.nativeElement.innerHTML = '<style>' + this.cssFrames + val + '</style>';
  }

  public loadAnimation() {
    const spinners = document.querySelectorAll('.spinner');
    const cont = document.querySelector('.loader');
    const opt: KeyframeAnimationOptions = {
      duration: 1500,
      easing: "ease-in-out",
      fill: 'forwards'
    };
    cont?.animate([
      {transform: 'rotate(0)', visibility: 'visible'},
      {transform: 'rotate(315deg)'},
      {transform: 'rotate(315deg)', visibility: 'hidden'}
    ], opt);
    spinners.forEach((spin, i) => {
      const options: KeyframeAnimationOptions = {
        duration: 600 + (150 * i),
        easing: "ease-in-out",
        fill: 'forwards'
      };
      spin.animate([
        {transform: 'rotate(0)'},
        {transform: `rotate(${90 * i}deg)`}
      ], options);
    });
  }
}
