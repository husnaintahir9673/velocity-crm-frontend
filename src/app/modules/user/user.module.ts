import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { UserRoutingModule } from './user-routing.module';

import { UserLayoutComponent } from 'app/layouts/user-layout/user-layout.component';

import { DashboardComponent } from './dashboard/dashboard.component';
import { CompanyAddEditComponent } from './company-add-edit/company-add-edit.component';
import { CompanyAddComponent } from './company-add/company-add.component';

import { SharedModule } from '../../shared/shared.module';
// import { CompanySuperAdminModule } from '../../shared/company-superAdmin.module';

import { CompaniesComponent } from './companies/companies.component';
import { UsersListComponent } from './users-list/users-list.component';
import { LeadsListComponent } from './leads-list/leads-list.component';
import { CrmRolesComponent } from './crm-roles/crm-roles.component';
import { CrmRoleListViewComponent } from './crm-role-list-view/crm-role-list-view.component';
import { CrmUpdatePermissionDescriptionComponent } from './crm-update-permission-description/crm-update-permission-description.component';
import { FormsModule } from '@angular/forms';


@NgModule({
    declarations: [
        UserLayoutComponent,
        DashboardComponent,
        CompanyAddEditComponent,
        CompanyAddComponent,
        CompaniesComponent,
        UsersListComponent,
        LeadsListComponent,
        CrmRolesComponent,
        CrmRoleListViewComponent,
        CrmUpdatePermissionDescriptionComponent
    ],
    imports: [
        CommonModule,
        UserRoutingModule,
        SharedModule,
        FormsModule
        // CompanySuperAdminModule
    ]
})
export class UserModule { }
