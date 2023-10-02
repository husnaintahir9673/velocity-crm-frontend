import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { SubmitterRoutingModule } from './submitter-routing.module';
import { SubmitterComponent } from '../../layouts/submitter/submitter.component';
import { DashboardComponent } from './dashboard/dashboard.component';

import { SharedModule } from '../../shared/shared.module';

@NgModule({
    declarations: [
        DashboardComponent,
        SubmitterComponent
    ],
    imports: [
        CommonModule,
        SubmitterRoutingModule,
        SharedModule
    ]
})
export class SubmitterModule { }
