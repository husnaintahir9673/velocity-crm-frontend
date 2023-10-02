import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { UnderWritterRoutingModule } from './under-writter-routing.module';
import { SharedModule } from '../../shared/shared.module';

import { DashboardComponent } from './dashboard/dashboard.component';
// import { FinalUnderwritingComponent } from '@components/lead/final-underwriting/final-underwriting.component';
// import { InterviewsComponent } from '@components/lead/interviews/interviews.component';


@NgModule({
    declarations: [
        // InterviewsComponent,
        DashboardComponent,
        // FinalUnderwritingComponent
    ],
    imports: [
        CommonModule,
        UnderWritterRoutingModule,
        SharedModule
    ]
})
export class UnderWritterModule { }
