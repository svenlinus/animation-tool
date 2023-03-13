import { AnimationProperty, CssUnits } from './../../animation.model';
import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-animation-property',
  templateUrl: './animation-property.component.html',
  styleUrls: ['./animation-property.component.scss']
})
export class AnimationPropertyComponent implements OnInit {
  @Input() public property?: AnimationProperty;
  
  public start: number = 1;
  public end: number = -1;
  public unit: string = "Default";
  public hasUnits : boolean = false;


  constructor() {
    if (this.property && CssUnits.unitsDict.has(this.property)) {
      this.unit = (CssUnits.unitsDict.get(this.property) || ["Default"])[0];
    }
   }

  ngOnInit(): void {
    this.hasUnits = CssUnits.unitsDict.has(this.property);
    if (this.property && CssUnits.unitsDict.has(this.property)) {
      this.unit = (CssUnits.unitsDict.get(this.property) || ["Default"])[0];
    }
  }

  updateStart(event:any) {
    this.start = (event.target.value);
  }

  updateEnd(event:any) {
    this.end = (event.target.value);
  }

  updateUnit(event:any) {
    this.unit = event.value;
  }

  getUnits(){
    return CssUnits.unitsDict.get(this.property);
  }

}
