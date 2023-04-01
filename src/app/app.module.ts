import { SpringEditorComponent } from './animation-editor/animation-graph/spring-editor/spring-editor.component';
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { MatExpansionModule } from '@angular/material/expansion';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSliderModule } from '@angular/material/slider';
import { MatChipsModule } from '@angular/material/chips';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatCheckboxModule } from '@angular/material/checkbox';

import { AnimationEditorComponent } from './animation-editor/animation-editor.component';
import { AnimationGraphComponent } from './animation-editor/animation-graph/animation-graph.component';
import { AnimationPropertyEditorComponent } from './animation-editor/animation-property-editor/animation-property-editor.component';
import { AnimationPropertyComponent } from './animation-editor/animation-property-editor/animation-property/animation-property.component';
import { AnimationDemoComponent } from './animation-editor/animation-demo/animation-demo.component';
import { AnimationOptionsComponent } from './animation-editor/animation-options/animation-options.component';


@NgModule({
  declarations: [
    AppComponent,
    AnimationEditorComponent,
    AnimationGraphComponent,
    AnimationPropertyEditorComponent,
    AnimationPropertyComponent,
    SpringEditorComponent,
    AnimationDemoComponent,
    AnimationOptionsComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    FormsModule,
    ReactiveFormsModule,
    MatExpansionModule,
    MatButtonModule,
    MatIconModule,
    MatSelectModule,
    MatInputModule,
    MatFormFieldModule,
    MatSliderModule,
    MatChipsModule,
    MatAutocompleteModule,
    MatCheckboxModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }

