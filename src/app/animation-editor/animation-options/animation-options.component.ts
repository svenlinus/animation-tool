import { AnimationEditorComponent } from './../animation-editor.component';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-animation-options',
  templateUrl: './animation-options.component.html',
  styleUrls: ['./animation-options.component.scss']
})
export class AnimationOptionsComponent implements OnInit {
  public duration: number = 100;
  public direction: string = 'normal';
  public numFrames: number = AnimationEditorComponent.numFrames;
  public reversed: boolean = false;

  constructor() {
  }

  ngOnInit(): void {
  }

  public updateNumFrames(event: any) {
    const num = Number(event.target.value || 0);
    this.numFrames = num < 8 ? 8 : (num > 40 ? 40 : num);
  }

  public updateDuration(event: any) {
    this.duration = Number(event.target.value);
  }

  public updateReversed() {
    this.direction = this.reversed ? 'reverse' : 'normal';
  }
}
