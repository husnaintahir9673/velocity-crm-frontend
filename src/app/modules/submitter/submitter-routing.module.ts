import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { SubmitterComponent } from '../../layouts/submitter/submitter.component';
import { DashboardComponent } from './dashboard/dashboard.component';

import { RolePermission } from '@guards/role.guard';

import { Roles } from '@constants/constants';
import { CreateLeadComponent } from '@components/lead/create-lead/create-lead.component';
import { EditProfileComponent } from '@components/edit-profile/edit-profile.component';
import { AuthPermission } from '@guards/auth-permission.guard';
import { LeadDetailComponent } from '@components/lead/lead-detail/lead-detail.component';
import { LeadEditComponent } from '@components/lead/lead-edit/lead-edit.component';
import { AddActivityComponent } from '@components/lead/add-activity/add-activity.component';
import { LeadCreateLenderOfferComponent } from '@components/lead/lead-create-lender-offer/lead-create-lender-offer.component';
import { WelcomeCallComponent } from '@components/lead/welcome-call/welcome-call.component';
import { FinalUnderwritingComponent } from '@components/lead/final-underwriting/final-underwriting.component';
import { CreatingContractComponent } from '@components/lead/creating-contract/creating-contract.component';
import { FundDetailsComponent } from '@components/lead/fund-details/fund-details.component';
import { ReportsComponent } from '@components/reports/reports.component';
import { LoginLogsReportsComponent } from '@components/login-logs-reports/login-logs-reports.component';
import { LeadSourceReportsComponent } from '@components/lead-source-reports/lead-source-reports.component';
import { SubmissionReportsComponent } from '@components/submission-reports/submission-reports.component';
import { UnderwriterReportsComponent } from '@components/underwriter-reports/underwriter-reports.component';
import { EmailLogsReportComponent } from '@components/email-logs-report/email-logs-report.component';
import { OfferReportComponent } from '@components/offer-report/offer-report.component';
import { InterviewsComponent } from '@components/lead/interviews/interviews.component';
import { SendEmailComponent } from '@components/lead/send-email/send-email.component';
import { AddEmailTemplateComponent } from '@components/lead/add-email-template/add-email-template.component';
import { SendEmailAndAppComponent } from '@components/lead/send-email-and-app/send-email-and-app.component';
import { LeadSendSmsComponent } from '@components/lead/lead-send-sms/lead-send-sms.component';
import { FundingReportComponent } from '@components/funding-report/funding-report.component';
import { FundedReportComponent } from '@components/funded-report/funded-report.component';
import { PreFundingReportComponent } from '@components/pre-funding-report/pre-funding-report.component';
import { DailyLeadProgressReportComponent } from '@components/daily-lead-progress-report/daily-lead-progress-report.component';
import { LenderReportComponent } from '@components/lender-report/lender-report.component';
import { UpdatesLogsReportComponent } from '@components/updates-logs-report/updates-logs-report.component';
import { IsoPaymentReportComponent } from '@components/iso-payment-report/iso-payment-report.component';
import { CallLogsReportComponent } from '@components/call-logs-report/call-logs-report.component';
import { PaymentHistoryReportComponent } from '@components/payment-history-report/payment-history-report.component';
import { SmsMarketingReportComponent } from '@components/sms-marketing-report/sms-marketing-report.component';
import { LeadSubmissionReportComponent } from '@components/lead-submission-report/lead-submission-report.component';
import { PullThroughRatioReportComponent } from '@components/pull-through-ratio-report/pull-through-ratio-report.component';
import { SourcePayrollReportComponent } from '@components/source-payroll-report/source-payroll-report.component';
import { SmsScheduleReportComponent } from '@components/sms-schedule-report/sms-schedule-report.component';
import { ProfitLossReportComponent } from '@components/profit-loss-report/profit-loss-report.component';
import { AnalyticsReportComponent } from '@components/analytics-report/analytics-report.component';
import { LenderOweReportComponent } from '@components/lender-owe-report/lender-owe-report.component';
import { ViewEditLenderCreateOfferComponent } from '@components/lead/view-edit-lender-create-offer/view-edit-lender-create-offer.component';
import { LeadPrefundComponent } from '@components/lead/lead-prefund/lead-prefund.component';
import { ReportDescriptionEditComponent } from '@components/report-description-edit/report-description-edit.component';

const routes: Routes = [
    {
        path: '', component: SubmitterComponent, children: [
            { path: '', component: DashboardComponent, canActivate: [RolePermission], data: { role: Roles.SUBMITTER } },
            { path: 'edit-profile', component: EditProfileComponent, canActivate: [RolePermission, AuthPermission], data: { role: Roles.SUBMITTER, permission: 'profile-update' } },
            { path: 'lead-detail/:id', component: LeadDetailComponent, canActivate: [RolePermission], data: { role: Roles.SUBMITTER, permission: 'lead-view' } },
            { path: 'createlead', component: CreateLeadComponent, canActivate: [RolePermission, AuthPermission], data: { role: Roles.SUBMITTER, permission: 'lead-create' } },
            { path: 'edit-lead/:id', component: LeadEditComponent, canActivate: [RolePermission, AuthPermission], data: { role: Roles.SUBMITTER, permission: 'lead-edit' } },
            { path: 'edit-lender-offer/:leadid/:id', component: ViewEditLenderCreateOfferComponent, canActivate: [RolePermission, AuthPermission], data: { role: Roles.SUBMITTER, permission: 'lender-offer-update' } },
            { path: 'add-activity/:id', component: AddActivityComponent, canActivate: [RolePermission, AuthPermission], data: { role: Roles.SUBMITTER, permission: 'lead-activity-add' } },
            // { path: 'lead-createlenderoffer', component: LeadCreateLenderOfferComponent, canActivate: [RolePermission], data: { role: Roles.SUBMITTER } },
            { path: 'welcome-call/:id', component: WelcomeCallComponent, canActivate: [RolePermission], data: { role: Roles.SUBMITTER } },
            { path: 'final-underwriting/:id', component: FinalUnderwritingComponent, canActivate: [RolePermission, AuthPermission], data: { role: Roles.SUBMITTER, permission: 'lead-final-underwriting' } },
            { path: 'interview/:id', component: InterviewsComponent, canActivate: [RolePermission, AuthPermission], data: { role: Roles.SUBMITTER, permission: 'lead-landlord-interview' } },
            { path: 'creating-contract/:id', component: CreatingContractComponent, canActivate: [RolePermission, AuthPermission], data: { role: Roles.SUBMITTER, permission: 'lead-contract' } },
            { path: 'fund-details/:id', component: FundDetailsComponent, canActivate: [RolePermission, AuthPermission], data: { role: Roles.SUBMITTER, permission: 'participant-create' } },
            { path: 'reports', component: ReportsComponent, canActivate: [RolePermission, AuthPermission], data: { role: Roles.SUBMITTER, permission: 'report-list' } },
            { path: 'reports/login-logs-reports', component: LoginLogsReportsComponent, canActivate: [RolePermission, AuthPermission], data: { role: Roles.SUBMITTER, permission: 'login-report' } },
            { path: 'reports/lead-source-reports', component: LeadSourceReportsComponent, canActivate: [RolePermission, AuthPermission], data: { role: Roles.SUBMITTER, permission: 'by-lead-source' } },
            { path: 'reports/lender-submission-reports', component: SubmissionReportsComponent, canActivate: [RolePermission, AuthPermission], data: { role: Roles.SUBMITTER, permission: 'lender-submission-report' } },
            { path: 'reports/underwriter-reports', component: UnderwriterReportsComponent, canActivate: [RolePermission, AuthPermission], data: { role: Roles.SUBMITTER, permission: 'underwriter-report' } },
            { path: 'reports/funding-reports', component: FundingReportComponent, canActivate: [RolePermission, AuthPermission], data: { role: Roles.SUBMITTER , permission: 'funding-report'} },
            { path: 'reports/funded-reports', component: FundedReportComponent, canActivate: [RolePermission, AuthPermission], data: { role: Roles.SUBMITTER ,permission: 'funded-report'} },
            { path: 'reports/prefunding-reports', component: PreFundingReportComponent, canActivate: [RolePermission, AuthPermission], data: { role: Roles.SUBMITTER ,permission: 'pre-funding-report'} },
            { path: 'reports/daily-lead-progress-reports', component: DailyLeadProgressReportComponent, canActivate: [RolePermission, AuthPermission], data: { role: Roles.SUBMITTER ,permission: 'daily-lead-progress-report'} },
            { path: 'reports/lenders-reports', component: LenderReportComponent, canActivate: [RolePermission, AuthPermission], data: { role: Roles.SUBMITTER ,permission: 'lender-report'} },
            { path: 'reports/updates-logs-reports', component: UpdatesLogsReportComponent, canActivate: [RolePermission, AuthPermission], data: { role: Roles.SUBMITTER ,permission: 'updates-log'} },
            { path: 'reports/iso-payment-reports', component: IsoPaymentReportComponent, canActivate: [RolePermission, AuthPermission], data: { role: Roles.SUBMITTER ,permission: 'iso-payment-report'} },
            { path: 'reports/lead-payment-reports', component: PaymentHistoryReportComponent, canActivate: [RolePermission, AuthPermission], data: { role: Roles.SUBMITTER, permission: 'lead-payments' } },
            { path: 'reports/call-logs-reports', component: CallLogsReportComponent, canActivate: [RolePermission, AuthPermission], data: { role: Roles.SUBMITTER, permission: 'call-log-report' } },
            { path: 'reports/sms-marketing-reports', component: SmsMarketingReportComponent, canActivate: [RolePermission, AuthPermission], data: { role: Roles.SUBMITTER, permission: 'sms-marketing-report' } },
            { path: 'reports/submission-reports', component: LeadSubmissionReportComponent, canActivate: [RolePermission, AuthPermission], data: { role: Roles.SUBMITTER, permission: 'submission-report' } },
            { path: 'reports/pull-through-ratio-reports', component: PullThroughRatioReportComponent, canActivate: [RolePermission, AuthPermission], data: { role: Roles.SUBMITTER, permission: 'pull-through-ratio-report' } },
            { path: 'reports/source-pyroll-reports', component: SourcePayrollReportComponent, canActivate: [RolePermission, AuthPermission], data: { role: Roles.SUBMITTER, permission: 'source-payroll' } },
            { path: 'reports/sms-schedule-reports', component: SmsScheduleReportComponent, canActivate: [RolePermission, AuthPermission], data: { role: Roles.SUBMITTER, permission: 'sms-schedule-report' } },
            { path: 'reports/profit-loss-reports', component: ProfitLossReportComponent, canActivate: [RolePermission, AuthPermission], data: { role: Roles.SUBMITTER, permission: 'profit-loss-report' } },
            { path: 'reports/analytics-reports', component: AnalyticsReportComponent, canActivate: [RolePermission, AuthPermission], data: { role: Roles.SUBMITTER, permission: 'analytics-reports' } },
            { path: 'reports/lender-owe-reports', component: LenderOweReportComponent, canActivate: [RolePermission, AuthPermission], data: { role: Roles.SUBMITTER, permission: 'lender-owe-report' } },
            { path: 'reports/email-logs-reports', component: EmailLogsReportComponent, canActivate: [RolePermission, AuthPermission], data: { role: Roles.SUBMITTER, permission: 'email-logs' } },
            { path: 'reports/offer-reports', component: OfferReportComponent, canActivate: [RolePermission, AuthPermission], data: { role: Roles.SUBMITTER, permission: 'offers-report' } },
            { path: 'lead-createlenderoffer/:id', component: LeadCreateLenderOfferComponent, canActivate: [RolePermission, AuthPermission], data: { role: Roles.SUBMITTER, permission: 'lender-offer-create' } },
            { path: 'update-email-templates', component: SendEmailComponent, canActivate: [RolePermission, AuthPermission], data: { role: Roles.SUBMITTER, permission: 'email-template-view' } },
            { path: 'add-email-templates', component: AddEmailTemplateComponent, canActivate: [RolePermission, AuthPermission], data: { role: Roles.SUBMITTER, permission: 'email-template-add' } },
            { path: 'welcome-call/:id', component: WelcomeCallComponent, canActivate: [RolePermission, AuthPermission], data: { role: Roles.SUBMITTER, permission: 'lead-welcome-call' } },
            { path: 'send-email-app/:id', component: SendEmailAndAppComponent, canActivate: [RolePermission, AuthPermission], data: { role: Roles.SUBMITTER, permission: 'send-app-and-email' } },
            { path: 'pre-fund/:id', component: LeadPrefundComponent, canActivate: [RolePermission, AuthPermission], data: { role: Roles.SUBMITTER , permission: 'send-sms' } },
            { path: 'send-sms/:id', component: LeadSendSmsComponent, canActivate: [RolePermission, AuthPermission], data: { role: Roles.SUBMITTER, permission: 'send-sms' } },
            { path: 'edit-report-description', component: ReportDescriptionEditComponent, canActivate: [RolePermission, AuthPermission], data: { role: Roles.SUBMITTER, permission: 'report-decription-update' } },
            { path: 'fund', loadChildren: () => import('@modules/funds/funds.module').then(m => m.FundsModule), data: {} },
        ]
    }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class SubmitterRoutingModule { }
