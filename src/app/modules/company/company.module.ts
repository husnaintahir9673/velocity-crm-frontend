import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { CompanyRoutingModule } from './company-routing.module';
import { CompanyComponent } from '../../layouts/company/company.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { AddUserComponent } from './add-user/add-user.component';

import { SharedModule } from '../../shared/shared.module';
// import { CompanySuperAdminModule } from '../../shared/company-superAdmin.module';

import { UsersComponent } from './users/users.component';
import { UserViewEditComponent } from './user-view-edit/user-view-edit.component';
import { LeadsListComponent } from './leads-list/leads-list.component';
import { RolesComponent } from './roles/roles.component';
import { RoleEditComponent } from './role-edit/role-edit.component';
import { SyndicatesListComponent } from './syndicates-list/syndicates-list.component';
import { AddSyndicateComponent } from './add-syndicate/add-syndicate.component';
import { UpdatePermissionDetailsComponent } from './update-permission-details/update-permission-details.component';
import { ViewEditSyndicateComponent } from './view-edit-syndicate/view-edit-syndicate.component';


import { TeamListComponent } from '@components/team-list/team-list.component';
import { CreateTeamComponent } from '@components/create-team/create-team.component';
import { ViewEditTeamComponent } from '@components/view-edit-team/view-edit-team.component';
import { CreateDripCompaignComponent } from "@components/create-drip-compaign/create-drip-compaign.component";
import { RoleListViewComponent } from './role-list-view/role-list-view.component';
import { DndModule } from 'ngx-drag-drop';

@NgModule({
    declarations: [
        DashboardComponent,
        CompanyComponent,
        AddUserComponent,
        UsersComponent,
        UserViewEditComponent,
        LeadsListComponent,
        RolesComponent,
        RoleEditComponent,
        SyndicatesListComponent,
        AddSyndicateComponent,
        UpdatePermissionDetailsComponent,
        ViewEditSyndicateComponent,
        TeamListComponent,
        CreateTeamComponent,
        ViewEditTeamComponent,
        CreateDripCompaignComponent,
        RoleListViewComponent
    ],
    imports: [
        CommonModule,
        CompanyRoutingModule,
        SharedModule,
        DndModule
        // CompanySuperAdminModule
    ]
})
export class CompanyModule { }
