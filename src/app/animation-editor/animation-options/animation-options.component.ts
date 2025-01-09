import { AnimationEditorComponent } from './../animation-editor.component';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

@Component({
  selector: 'app-animation-options',
  templateUrl: './animation-options.component.html',
  styleUrls: ['./animation-options.component.scss']
})
export class AnimationOptionsComponent implements OnInit {
  private _frames?: string;
  @Input() set frames(val: string) {
    this._frames = val;
    const txt = this.formatOutput(val);
    const out = document.getElementById('keyframe-output');
    if (out) out.innerHTML = txt;
  }
  @Output() private classChange = new EventEmitter<string>();

  public duration: number = 1000;
  public direction: string = 'normal';
  public numFrames: number = AnimationEditorComponent.numFrames + 1;
  public reversed: boolean = false;

  constructor() {
  }

  ngOnInit(): void {
  }

  public copyFrames() {
    navigator.clipboard.writeText(this._frames || '');
  }

  private createClassString(): string {
    return `.demo-box {\t
      animation: custom-anim linear;\t
      animation-duration: ${this.duration}ms;\t
      animation-direction: ${this.direction};\n}`
  }

  public copyClass() {
    navigator.clipboard.writeText(this.createClassString());
  }

  private formatOutput(cssFrames: string): string {
    const tokens = cssFrames.split(/\t| /);
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
        case 'custom-anim':
          output += `<span style="color: ${purple}">custom-anim </span>`;
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
    this.numFrames = num < 4 ? 4 : (num > 128 ? 128 : num);
    AnimationEditorComponent.numFrames = this.numFrames - 1;
    this.classChange.emit(this.createClassString());
  }

  public updateDuration(event: any) {
    this.duration = Number(event.target.value);
    this.classChange.emit(this.createClassString());
  }

  public updateReversed() {
    this.direction = this.reversed ? 'reverse' : 'normal';
    this.classChange.emit(this.createClassString());
  }
}
