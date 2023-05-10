import { AnimationEditorComponent } from './../animation-editor.component';
import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-animation-options',
  templateUrl: './animation-options.component.html',
  styleUrls: ['./animation-options.component.scss']
})
export class AnimationOptionsComponent implements OnInit {
  private _frames?: string;
  @Input() set frames(val: string) {
    const txt = this.formatOutput(val);
    const out = document.getElementById('keyframe-output');
    if (out) out.innerHTML = txt;
  }

  public duration: number = 100;
  public direction: string = 'normal';
  public numFrames: number = AnimationEditorComponent.numFrames;
  public reversed: boolean = false;

  constructor() {
  }

  ngOnInit(): void {
  }

  private formatOutput(cssFrames: string): string {
    const tokens = cssFrames.split(' ');
    const green = '#e8ffcb',
          blue = '#9ccdff',
          purple = '#9c9eff';
    let output = '';
    for (let i = 0; i < tokens.length; i ++) {
      const token = tokens[i];
      switch (token) {
        case '@keyframes':
          output += `<span style="color: ${green}">@keyframes </span>`;
          break;
        case 'anim':
          output += `<span style="color: ${purple}">anim </span>`;
          break;
        case 'transform:':
          output += `<span style="color: ${blue}">transform: </span>`;
          break;
        case '}':
          output += '} <br>';
          break;
        default:
          if (token == '{\n') 
            output += '{<br>';
          else if (token.includes('%')) {
            output += `&ensp;<span style="color: ${purple}">${(token == '0%' ? ' ' : '') + token} </span>`;
          } else 
            output += token + ' ';
          break;
      }
    }
    return output;
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
