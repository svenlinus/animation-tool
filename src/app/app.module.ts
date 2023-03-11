import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { MatExpansionModule } from '@angular/material/expansion';
import { AnimationEditorComponent } from './animation-editor/animation-editor.component';
import { AnimationPropertyComponent } from './animation-editor/animation-property/animation-property.component';

@NgModule({
  declarations: [
    AppComponent,
    AnimationEditorComponent,
    AnimationPropertyComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    MatExpansionModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
