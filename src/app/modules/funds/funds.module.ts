import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { FundsRoutingModule } from './funds-routing.module';
import { FundRecordsComponent } from './fund-records/fund-records.component';
import { SharedModule } from 'app/shared/shared.module';


@NgModule({
  declarations: [
    FundRecordsComponent
  ],
  imports: [
    CommonModule,
    FundsRoutingModule,
    SharedModule
  ]
})
export class FundsModule { }
