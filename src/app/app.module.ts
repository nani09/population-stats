import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { ScatterPlotComponent } from './scatter-plot/scatter-plot.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SuffixBnPipe } from './suffix-bn.pipe';

@NgModule({
  declarations: [AppComponent, ScatterPlotComponent, SuffixBnPipe],
  imports: [BrowserModule, AppRoutingModule, FormsModule, ReactiveFormsModule],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {}
