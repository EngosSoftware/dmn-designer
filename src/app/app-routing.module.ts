import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { DecisionTableComponent } from './decision-table/decision-table.component';

const routes: Routes = [
  { path: '', component: DecisionTableComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
