import { AnimationProperty } from '../../animation.model';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

@Component({
  selector: 'app-animation-property',
  templateUrl: './animation-property.component.html',
  styleUrls: ['./animation-property.component.scss']
})
export class AnimationPropertyComponent implements OnInit {
  @Input() public property!: AnimationProperty;
  @Output() public change = new EventEmitter<any>();
  public hasLimits: boolean = false;
  public limitMin!: number;
  public limitMax!: number;
  
  constructor() {
  }

  ngOnInit(): void {
    this.limitMin = this.property.limit?.min || -60;
    this.limitMax = this.property.limit?.max || 60;
  }

  updateStart(event: any) {
    this.property.start = Number(event.target.value);
    this.change.emit();
  }

  updateEnd(event: any) {
    this.property.end = Number(event.target.value);
    this.change.emit();
  }

  updateUnit(event: any) {
    this.property.unit = event.value;
    this.change.emit();
  }

  updateLimitMin(event: any) {
    this.limitMin = Number(event.target.value);
    this.property.limit = {min: this.limitMin, max: this.limitMax};
    this.change.emit();
  }

  updateLimitMax(event: any) {
    this.limitMax = Number(event.target.value);
    this.property.limit = {min: this.limitMin, max: this.limitMax};
    this.change.emit();
  }

  toggleLimits() {
    this.hasLimits = !this.hasLimits
    if (this.hasLimits) {
      this.property.limit = {min: this.limitMin, max: this.limitMax};
    } else {
      this.property.limit = undefined;
    }
    this.change.emit();
  }

}
