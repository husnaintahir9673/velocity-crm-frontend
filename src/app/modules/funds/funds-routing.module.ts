import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { FundRecordsComponent } from './fund-records/fund-records.component';

const routes: Routes = [
    { path: '', component: FundRecordsComponent },
    { path: 'fund-records/:id', component: FundRecordsComponent }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class FundsRoutingModule { }
