import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AnalyticsReportComponent } from '@components/analytics-report/analytics-report.component';
import { CallLogsReportComponent } from '@components/call-logs-report/call-logs-report.component';
import { DailyLeadProgressReportComponent } from '@components/daily-lead-progress-report/daily-lead-progress-report.component';
import { EditProfileComponent } from '@components/edit-profile/edit-profile.component';
import { EmailLogsReportComponent } from '@components/email-logs-report/email-logs-report.component';
import { FundedReportComponent } from '@components/funded-report/funded-report.component';
import { FundingReportComponent } from '@components/funding-report/funding-report.component';
import { IsoPaymentReportComponent } from '@components/iso-payment-report/iso-payment-report.component';
import { LeadSourceReportsComponent } from '@components/lead-source-reports/lead-source-reports.component';
import { LeadSubmissionReportComponent } from '@components/lead-submission-report/lead-submission-report.component';
import { AddActivityComponent } from '@components/lead/add-activity/add-activity.component';
import { AddEmailTemplateComponent } from '@components/lead/add-email-template/add-email-template.component';
import { CreateLeadComponent } from '@components/lead/create-lead/create-lead.component';
import { CreatingContractComponent } from '@components/lead/creating-contract/creating-contract.component';
import { FinalUnderwritingComponent } from '@components/lead/final-underwriting/final-underwriting.component';
import { FundDetailsComponent } from '@components/lead/fund-details/fund-details.component';
import { InterviewsComponent } from '@components/lead/interviews/interviews.component';
import { LeadCreateLenderOfferComponent } from '@components/lead/lead-create-lender-offer/lead-create-lender-offer.component';
import { LeadDetailComponent } from '@components/lead/lead-detail/lead-detail.component';
import { LeadEditComponent } from '@components/lead/lead-edit/lead-edit.component';
import { LeadPrefundComponent } from '@components/lead/lead-prefund/lead-prefund.component';
import { LeadSendSmsComponent } from '@components/lead/lead-send-sms/lead-send-sms.component';
import { LeadsListComponent } from '@components/lead/leads-list/leads-list.component';
import { SendEmailAndAppComponent } from '@components/lead/send-email-and-app/send-email-and-app.component';
import { SendEmailComponent } from '@components/lead/send-email/send-email.component';
import { ViewEditLenderCreateOfferComponent } from '@components/lead/view-edit-lender-create-offer/view-edit-lender-create-offer.component';
import { WelcomeCallComponent } from '@components/lead/welcome-call/welcome-call.component';
import { LenderOweReportComponent } from '@components/lender-owe-report/lender-owe-report.component';
import { LenderReportComponent } from '@components/lender-report/lender-report.component';
import { LoginLogsReportsComponent } from '@components/login-logs-reports/login-logs-reports.component';
import { OfferReportComponent } from '@components/offer-report/offer-report.component';
import { PaymentHistoryReportComponent } from '@components/payment-history-report/payment-history-report.component';
import { PreFundingReportComponent } from '@components/pre-funding-report/pre-funding-report.component';
import { ProfitLossReportComponent } from '@components/profit-loss-report/profit-loss-report.component';
import { PullThroughRatioReportComponent } from '@components/pull-through-ratio-report/pull-through-ratio-report.component';
import { ReportDescriptionEditComponent } from '@components/report-description-edit/report-description-edit.component';
import { ReportsComponent } from '@components/reports/reports.component';
import { SmsMarketingReportComponent } from '@components/sms-marketing-report/sms-marketing-report.component';
import { SmsScheduleReportComponent } from '@components/sms-schedule-report/sms-schedule-report.component';
import { SourcePayrollReportComponent } from '@components/source-payroll-report/source-payroll-report.component';
import { SubmissionReportsComponent } from '@components/submission-reports/submission-reports.component';
import { UnderwriterReportsComponent } from '@components/underwriter-reports/underwriter-reports.component';
import { UpdatesLogsReportComponent } from '@components/updates-logs-report/updates-logs-report.component';
import { Roles } from '@constants/constants';
import { AuthPermission } from '@guards/auth-permission.guard';
import { HasPermission } from '@guards/permission.guard';
import { UserLayoutComponent } from 'app/layouts/user-layout/user-layout.component';
import { DashboardComponent } from './dashboard/dashboard.component';

const routes: Routes = [
    {
        path: '', component: UserLayoutComponent, children: [
            { path: '', component: DashboardComponent, canActivate: [HasPermission], data: { role: Roles.BRANCHMANAGER } },
            { path: 'edit-profile', component: EditProfileComponent, canActivate: [HasPermission, AuthPermission], data: { role: Roles.BRANCHMANAGER, permission: 'profile-update' } },
            { path: 'add-activity/:id', component: AddActivityComponent, canActivate: [HasPermission, AuthPermission], data: { role: Roles.BRANCHMANAGER, permission: 'lead-activity-add' } },
            { path: 'leads', component: LeadsListComponent, canActivate: [HasPermission, AuthPermission], data: { role: Roles.BRANCHMANAGER, permission: 'lead-list' } },
            { path: 'lead-detail/:id', component: LeadDetailComponent, canActivate: [HasPermission], data: { role: Roles.BRANCHMANAGER, permission: 'lead-view' } },
            { path: 'createlead', component: CreateLeadComponent, canActivate: [HasPermission, AuthPermission], data: { role: Roles.BRANCHMANAGER, permission: 'lead-create' } },
            { path: 'edit-lead/:id', component: LeadEditComponent, canActivate: [HasPermission, AuthPermission], data: { role: Roles.BRANCHMANAGER, permission: 'lead-edit' } },
            { path: 'edit-lender-offer/:leadid/:id', component: ViewEditLenderCreateOfferComponent, canActivate: [HasPermission, AuthPermission], data: { role: Roles.BRANCHMANAGER, permission: 'lender-offer-update' } },
            { path: 'reports', component: ReportsComponent, canActivate: [HasPermission, AuthPermission], data: { role: Roles.BRANCHMANAGER, permission: 'report-list' } },
            { path: 'reports/login-logs-reports', component: LoginLogsReportsComponent, canActivate: [HasPermission, AuthPermission], data: { role: Roles.BRANCHMANAGER, permission: 'login-report' } },
            { path: 'reports/lead-source-reports', component: LeadSourceReportsComponent, canActivate: [HasPermission, AuthPermission], data: { role: Roles.BRANCHMANAGER, permission: 'by-lead-source' } },
            { path: 'fund-details/:id', component: FundDetailsComponent, canActivate: [HasPermission, AuthPermission], data: { role: Roles.BRANCHMANAGER, permission: 'participant-create' } },
            { path: 'reports/lender-submission-reports', component: SubmissionReportsComponent, canActivate: [HasPermission, AuthPermission], data: { role: Roles.BRANCHMANAGER, permission: 'lender-submission-report' } },
            { path: 'reports/underwriter-reports', component: UnderwriterReportsComponent, canActivate: [HasPermission, AuthPermission], data: { role: Roles.BRANCHMANAGER, permission: 'underwriter-report' } },
            { path: 'reports/funding-reports', component: FundingReportComponent, canActivate: [HasPermission, AuthPermission], data: { role: Roles.BRANCHMANAGER, permission: 'funding-report' } },
            { path: 'reports/funded-reports', component: FundedReportComponent, canActivate: [HasPermission, AuthPermission], data: { role: Roles.BRANCHMANAGER, permission: 'funded-report' } },
            { path: 'reports/prefunding-reports', component: PreFundingReportComponent, canActivate: [HasPermission, AuthPermission], data: { role: Roles.BRANCHMANAGER, permission: 'pre-funding-report' } },
            { path: 'reports/daily-lead-progress-reports', component: DailyLeadProgressReportComponent, canActivate: [HasPermission, AuthPermission], data: { role: Roles.BRANCHMANAGER, permission: 'daily-lead-progress-report' } },
            { path: 'reports/lenders-reports', component: LenderReportComponent, canActivate: [HasPermission, AuthPermission], data: { role: Roles.BRANCHMANAGER, permission: 'lender-report' } },
            { path: 'reports/updates-logs-reports', component: UpdatesLogsReportComponent, canActivate: [HasPermission, AuthPermission], data: { role: Roles.BRANCHMANAGER, permission: 'updates-log' } },
            { path: 'reports/iso-payment-reports', component: IsoPaymentReportComponent, canActivate: [HasPermission, AuthPermission], data: { role: Roles.BRANCHMANAGER, permission: 'iso-payment-report' } },
            { path: 'reports/lead-payment-reports', component: PaymentHistoryReportComponent, canActivate: [HasPermission, AuthPermission], data: { role: Roles.BRANCHMANAGER, permission: 'lead-payments' } },
            { path: 'reports/call-logs-reports', component: CallLogsReportComponent, canActivate: [HasPermission, AuthPermission], data: { role: Roles.BRANCHMANAGER, permission: 'call-log-report' } },
            { path: 'reports/sms-marketing-reports', component: SmsMarketingReportComponent, canActivate: [HasPermission, AuthPermission], data: { role: Roles.BRANCHMANAGER, permission: 'sms-marketing-report' } },
            { path: 'reports/submission-reports', component: LeadSubmissionReportComponent, canActivate: [HasPermission, AuthPermission], data: { role: Roles.BRANCHMANAGER, permission: 'submission-report' } },
            { path: 'reports/pull-through-ratio-reports', component: PullThroughRatioReportComponent, canActivate: [HasPermission, AuthPermission], data: { role: Roles.BRANCHMANAGER, permission: 'pull-through-ratio-report' } },
            { path: 'reports/source-pyroll-reports', component: SourcePayrollReportComponent, canActivate: [HasPermission, AuthPermission], data: { role: Roles.BRANCHMANAGER, permission: 'source-payroll' } },
            { path: 'reports/sms-schedule-reports', component: SmsScheduleReportComponent, canActivate: [HasPermission, AuthPermission], data: { role: Roles.BRANCHMANAGER, permission: 'sms-schedule-report' } },
            { path: 'reports/profit-loss-reports', component: ProfitLossReportComponent, canActivate: [HasPermission, AuthPermission], data: { role: Roles.BRANCHMANAGER, permission: 'profit-loss-report' } },
            { path: 'reports/analytics-reports', component: AnalyticsReportComponent, canActivate: [HasPermission, AuthPermission], data: { role: Roles.BRANCHMANAGER, permission: 'analytics-reports' } },
            { path: 'reports/lender-owe-reports', component: LenderOweReportComponent, canActivate: [HasPermission, AuthPermission], data: { role: Roles.BRANCHMANAGER, permission: 'lender-owe-report' } },
            { path: 'reports/email-logs-reports', component: EmailLogsReportComponent, canActivate: [HasPermission, AuthPermission], data: { role: Roles.BRANCHMANAGER, permission: 'email-logs' } },
            { path: 'reports/offer-reports', component: OfferReportComponent, canActivate: [HasPermission, AuthPermission], data: { role: Roles.BRANCHMANAGER, permission: 'offers-report' } },
            { path: 'creating-contract/:id', component: CreatingContractComponent, canActivate: [HasPermission, AuthPermission], data: { role: Roles.BRANCHMANAGER, permission: 'lead-contract' } },
            { path: 'final-underwriting/:id', component: FinalUnderwritingComponent, canActivate: [HasPermission], data: { role: Roles.BRANCHMANAGER } },
            { path: 'interview/:id', component: InterviewsComponent, canActivate: [HasPermission, AuthPermission], data: { role: Roles.BRANCHMANAGER, permission: 'lead-landlord-interview' } },
            { path: 'lead-createlenderoffer/:id', component: LeadCreateLenderOfferComponent, canActivate: [HasPermission, AuthPermission], data: { role: Roles.BRANCHMANAGER, permission: 'lender-offer-create' } },
            { path: 'welcome-call/:id', component: WelcomeCallComponent, canActivate: [HasPermission, AuthPermission], data: { role: Roles.BRANCHMANAGER, permission: 'lead-welcome-call' } },
            { path: 'update-email-templates', component: SendEmailComponent, canActivate: [HasPermission, AuthPermission], data: { role: Roles.BRANCHMANAGER, permission: 'email-template-view' } },
            { path: 'add-email-templates', component: AddEmailTemplateComponent, canActivate: [HasPermission, AuthPermission], data: { role: Roles.BRANCHMANAGER, permission: 'email-template-add' } },
            { path: 'send-email-app/:id', component: SendEmailAndAppComponent, canActivate: [HasPermission, AuthPermission], data: { role: Roles.BRANCHMANAGER, permission: 'send-app-and-email' } },
            { path: 'pre-fund/:id', component: LeadPrefundComponent, canActivate: [HasPermission, AuthPermission], data: { role: Roles.BRANCHMANAGER, permission: 'send-sms' } },
            { path: 'send-sms/:id', component: LeadSendSmsComponent, canActivate: [HasPermission, AuthPermission], data: { role: Roles.BRANCHMANAGER, permission: 'send-sms' } },
            { path: 'edit-report-description', component: ReportDescriptionEditComponent, canActivate: [HasPermission, AuthPermission], data: { role: Roles.BRANCHMANAGER, permission: 'report-decription-update' } },
            { path: 'fund', loadChildren: () => import('@modules/funds/funds.module').then(m => m.FundsModule), data: {} },
        ]
    }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class BranchManagerRoutingModule { }
