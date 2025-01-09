import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { SpringConfig } from '../../curve.model';

@Component({
  selector: 'app-physics-editor',
  templateUrl: './physics-editor.component.html',
  styleUrls: ['./physics-editor.component.scss']
})
export class PhysicsEditorComponent implements OnInit {
  
  private _config!: any;

  public configValues!: number[];
  public configKeys!: string[];

  @Input() set config(val: any) {
    this._config = val;
    if (val) {
      this.configValues = Object.values(this._config).slice(0, -1) as number[];
      this.configKeys = Object.keys(this._config).map(k => this.translation[k]);
    }
  }
  get config(): any {
    return this._config;
  }
  @Output() public change = new EventEmitter<any>();

  public translation: any = {
    'initVelocity': 'NaN',
    'stiffness': 'Stiffness',
    'dampener': 'Dampener',
    'gravity': 'Gravity',
    'drag': 'Drag',
    'elasticity': 'Elasticity',
    'bounces': 'Bounces',
  }

  constructor() { }

  ngOnInit(): void {
    if (this.config) {
      this.configValues = Object.values(this.config).slice(0, -1) as number[];
      this.configKeys = Object.keys(this.config).map(k => this.translation[k]);
    }
  }

  updateConfig(event: any, index: number) {
    const key: string = Object.keys(this._config)[index];
    this.config[key] = event.value;
    console.log(this.config);
    this.change.emit(this.config);
  }

  formatLabel(value: number): string {
    return `${Math.round(value*100)}`;
  }

}
