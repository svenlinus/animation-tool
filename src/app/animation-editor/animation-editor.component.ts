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

  constructor() { }

  ngOnInit(): void {
  }

}
