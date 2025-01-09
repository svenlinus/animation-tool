import { Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';

@Component({
  selector: 'app-animation-demo',
  templateUrl: './animation-demo.component.html',
  styleUrls: ['./animation-demo.component.scss']
})
export class AnimationDemoComponent implements OnInit {
  @ViewChild('demoBox') demoBoxRef!: ElementRef;

  constructor() { }

  ngOnInit(): void {
  }

  public playAnimation() {
    this.demoBoxRef.nativeElement.style = '';
    this.demoBoxRef.nativeElement.classList.remove('demo-box');
    void this.demoBoxRef.nativeElement.offsetWidth;
    setTimeout(() => {
      this.demoBoxRef.nativeElement.classList.add('demo-box');
    }, 100);
  }

}
