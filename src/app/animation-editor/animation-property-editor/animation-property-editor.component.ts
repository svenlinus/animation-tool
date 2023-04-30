import { AnimationProperty } from '../animation.model';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

@Component({
  selector: 'app-animation-property-editor',
  templateUrl: './animation-property-editor.component.html',
  styleUrls: ['./animation-property-editor.component.scss']
})
export class AnimationPropertyEditorComponent implements OnInit {

  @Input() public properties?: Array<AnimationProperty>;
  @Output() public propertyChange = new EventEmitter<any>();

  constructor() { }

  ngOnInit(): void {
  }

  updateProperty() {
    this.propertyChange.emit();
  }
}
