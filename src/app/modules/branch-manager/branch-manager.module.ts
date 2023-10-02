import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { SharedModule } from '../../shared/shared.module';

import { BranchManagerRoutingModule } from './branch-manager-routing.module';
import { DashboardComponent } from './dashboard/dashboard.component';


@NgModule({
    declarations: [
        DashboardComponent
    ],
    imports: [
        CommonModule,
        BranchManagerRoutingModule,
        SharedModule
    ]
})
export class BranchManagerModule { }
