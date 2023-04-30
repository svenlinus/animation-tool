import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { SpringConfig } from '../../curve.model';

@Component({
  selector: 'app-spring-editor',
  templateUrl: './spring-editor.component.html',
  styleUrls: ['./spring-editor.component.scss']
})
export class SpringEditorComponent implements OnInit {
  
  private _config!: SpringConfig;

  public configValues!: number[];
  public configKeys!: string[];

  @Input() set config(val: SpringConfig) {
    this._config = val;
    this.configValues = Object.values(this._config);
    this.configKeys = Object.keys(this._config).map(k => this.translation[k]);
  }
  get config(): SpringConfig {
    return this._config;
  }
  @Output() public change = new EventEmitter<SpringConfig>();

  public translation: any = {
    'initVelocity': 'NaN',
    'stiffness': 'Stiffness',
    'dampener': 'Dampener'
  }

  constructor() { }

  ngOnInit(): void {
    this.configValues = Object.values(this.config);
    this.configKeys = Object.keys(this.config).map(k => this.translation[k]);
  }

  updateConfig(event: any, index: number) {
    const key: string = Object.keys(this._config)[index];
    this.config[key] = event.value;
    this.change.emit(this.config);
  }

  formatLabel(value: number): string {
    return `${Math.round(value*100)}`;
  }

}
