import { NgModule } from '@angular/core';
import { ExtraOptions, RouterModule, Routes } from '@angular/router';
import { ForgotPasswordComponent } from '@components/on-boarding/forgot-password/forgot-password.component';
import { LoginComponent } from '@components/on-boarding/login/login.component';
import { ResetPasswordComponent } from '@components/on-boarding/reset-password/reset-password.component';
import { PermissionGuard } from './guards/admin.guard';

import { Roles } from '@constants/constants';
import { AccessDeniedComponent } from '@components/access-denied/access-denied.component';
import { ComingSoonComponent } from '@components/coming-soon/coming-soon.component';
import { PageNotFoundComponent } from '@components/page-not-found/page-not-found.component';
import { DocumentAccessListComponent } from '@components/documents/document-access-list/document-access-list.component';
import { VerifyCustomerComponent } from '@components/verify-customer/verify-customer.component';
import { SubmissionThanksComponent } from '@components/submission-thanks/submission-thanks.component';
import { UnsubscribeComponent } from '@components/unsubscribe/unsubscribe.component';
import { LeadOverviewComponent } from '@components/lead/lead-overview/lead-overview.component';
import { VerifyUserComponent } from '@components/verify-user/verify-user.component';
const routerOptions: ExtraOptions = {
    scrollPositionRestoration: "enabled",
    anchorScrolling: "enabled",
    scrollOffset: [0, 64]
  };

const routes: Routes = [
    { path: '', redirectTo: '/login', pathMatch: 'full' },  
    { path: 'login', component: LoginComponent },
    { path: 'forgot-password', component: ForgotPasswordComponent },
    { path: 'reset-password', component: ResetPasswordComponent },
    { path: 'user-login', component: VerifyUserComponent },
    { path: 'new-password', component: ResetPasswordComponent },
    { path: 'access-denied', component: AccessDeniedComponent },
    { path: 'document-access', component: DocumentAccessListComponent },
    { path: 'coming-soon', component: ComingSoonComponent },
    { path: 'unsubscribe', component: UnsubscribeComponent },
    { path: 'lead-overview', component: LeadOverviewComponent },
    { path: 'verify-customer/:token', component: VerifyCustomerComponent },
    { path: 'lead-submitted/:id', component: SubmissionThanksComponent },
    { path: 'admin',  loadChildren: () => import('@modules/user/user.module').then(m => m.UserModule), data: { role: Roles.ADMINISTRATOR }, canLoad: [PermissionGuard]},
    { path: 'company',  loadChildren: () => import('@modules/company/company.module').then(m => m.CompanyModule), data: { role: Roles.COMPANY }, canLoad: [PermissionGuard]},
    // { path: 'submitter',  loadChildren: () => import('@modules/submitter/submitter.module').then(m => m.SubmitterModule), data: { role: Roles.SUBMITTER }, canLoad: [PermissionGuard]},
    // { path: 'under-writter',  loadChildren: () => import('@modules/under-writter/under-writter.module').then(m => m.UnderWritterModule), data: { role: Roles.UNDERWRITER }, canLoad: [PermissionGuard]},
    // { path: 'branchmanager',  loadChildren: () => import('@modules/branch-manager/branch-manager.module').then(m => m.BranchManagerModule), data: { role: Roles.BRANCHMANAGER }, canLoad: [PermissionGuard]},
    { path: ':role',  loadChildren: () => import('@modules/under-writter/under-writter.module').then(m => m.UnderWritterModule), data: { role: Roles.UNDERWRITER }},
    { path: '**', component: PageNotFoundComponent },
];

@NgModule({
    imports: [RouterModule.forRoot(routes, routerOptions)],
    exports: [RouterModule]
})
export class AppRoutingModule { }
