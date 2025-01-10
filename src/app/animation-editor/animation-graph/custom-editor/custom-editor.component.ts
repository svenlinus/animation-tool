import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { CodeModel } from '@ngstack/code-editor';

@Component({
  selector: 'app-custom-editor',
  templateUrl: './custom-editor.component.html',
  styleUrls: ['./custom-editor.component.scss']
})
export class CustomEditorComponent implements OnInit {
  @Output() public change = new EventEmitter<Function>();
  
  theme = 'vs-dark';

  model: CodeModel = {
    language: 'javascript',
    uri: 'custom.js',
    value: '// Write the function defining the above graph which \n// the keyframes are sampled from. \n// The domain of the function is [0, 1], meaning \n// that `x` will be a number be between 0 and 1 \n// ex. f(x) = 0.7sin(4pi * x) \nfunction f(x) {\n  function sin(x) {\n    return 0.7 * Math.sin(4 * Math.PI * x);\n  }\n  return sin(x);\n}'
  };

  options = {
    tabSize: 2,
    contextmenu: true,
    stickyScroll: {
      enabled: false
    },
    minimap: {
      enabled: false
    }
  };

  onCodeChanged(code: string) {
    try {
      const func = new Function(code + `; return f;`);
      const f: Function = func();
      if (f) this.change.emit(f);
    } catch (error) {
      console.error('Custom graph error:', error);
    }
  }

  constructor() { }

  ngOnInit(): void {
  }

}
