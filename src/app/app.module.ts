import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { MatExpansionModule } from '@angular/material/expansion';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import {MatFormFieldModule} from '@angular/material/form-field';

import { AnimationEditorComponent } from './animation-editor/animation-editor.component';
import { AnimationGraphComponent } from './animation-editor/animation-graph/animation-graph.component';
import { DemoComponent } from './demo/demo.component';
import { AnimationPropertyEditorComponent } from './animation-editor/animation-property-editor/animation-property-editor.component';
import { AnimationPropertyComponent } from './animation-editor/animation-property-editor/animation-property/animation-property.component';


@NgModule({
  declarations: [
    AppComponent,
    AnimationEditorComponent,
    AnimationGraphComponent,
    DemoComponent,
    AnimationPropertyEditorComponent,
    AnimationPropertyComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    MatExpansionModule,
    MatButtonModule,
    MatIconModule,
    MatSelectModule,
    MatInputModule,
    MatFormFieldModule,
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }

