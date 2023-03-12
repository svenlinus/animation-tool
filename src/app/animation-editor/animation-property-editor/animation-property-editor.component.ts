import { AnimationProperty } from './../animation.model';
import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-animation-property-editor',
  templateUrl: './animation-property-editor.component.html',
  styleUrls: ['./animation-property-editor.component.scss']
})
export class AnimationPropertyEditorComponent implements OnInit {

  @Input() public properties?: Array<AnimationProperty>;

  constructor() { }

  ngOnInit(): void {
  }

}
