import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';

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
    void this.demoBoxRef.nativeElement.offsetWidth;
    setTimeout(() => {
      this.demoBoxRef.nativeElement.style = 'animation: anim 1s linear;';
    }, 100);
  }

}
