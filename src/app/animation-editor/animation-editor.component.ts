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

  @ViewChild('animationContainer') animationContainerRef!: ElementRef;

  private cssFrames: string = '';
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
  }

  public addChip(value: string, timeMap: TimeMap) {
    const key: keyof typeof CssFunction = value[0].toUpperCase() + value.slice(1) as (keyof typeof CssFunction);
    this.chipControl.reset();
    const prop = new AnimationProperty(CssFunction[key]);
    this.closedFunctionsList.push(prop.func);
    timeMap.properties.push(prop);
    this.filterOptions();
  }

  public removeProperty(i:number, j: number) {
    const ci = this.closedFunctionsList.indexOf(this.timeMaps[i].properties[j].func);
    this.closedFunctionsList.splice(ci, 1);
    this.timeMaps[i].properties.splice(j, 1);
    this.filterOptions();
  }

  public setSelectingType(val: boolean) {
    this.selectingType = val;
  }

  public addTimeMap() {
    this.createDefaultMap();
    this.timeMaps.push(this.defaultMap);
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

  private generateCssFrames() {
    this.cssFrames = '@keyframes anim {\n'
    for (let i = 0; i < AnimationEditorComponent.numFrames + 1; i++) {
      const percent = Math.round(i/AnimationEditorComponent.numFrames * 1000) / 10;
      this.cssFrames += `${percent}% { transform: `
      for (let tm of this.timeMaps) {
        if (tm.frames[i] == null) continue;
        const val = tm.frames[i].value;
        for (let prop of tm.properties) {
          this.cssFrames += prop.createFunction(val) + ' ';
        }
      }
      this.cssFrames += '}\n'
    }
    this.cssFrames += '}'
    this.animationContainerRef.nativeElement.innerHTML = '<style>' + this.cssFrames + '</style>';

    console.warn(this.cssFrames);
    this.playAnimation();
  }

  public playAnimation() {

  }
}
