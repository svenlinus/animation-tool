import { AnimationProperty } from './../../animation.model';
import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-animation-property',
  templateUrl: './animation-property.component.html',
  styleUrls: ['./animation-property.component.scss']
})
export class AnimationPropertyComponent implements OnInit {
  @Input() public property?: AnimationProperty;

  constructor() { }

  ngOnInit(): void {
  }

}
