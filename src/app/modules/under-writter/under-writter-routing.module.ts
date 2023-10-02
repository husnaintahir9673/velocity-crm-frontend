import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { EditProfileComponent } from '@components/edit-profile/edit-profile.component';
import { EmailLogsReportComponent } from '@components/email-logs-report/email-logs-report.component';
import { LeadSourceReportsComponent } from '@components/lead-source-reports/lead-source-reports.component';
import { AddActivityComponent } from '@components/lead/add-activity/add-activity.component';
import { AddEmailTemplateComponent } from '@components/lead/add-email-template/add-email-template.component';
import { CreateLeadComponent } from '@components/lead/create-lead/create-lead.component';
import { CreatingContractComponent } from '@components/lead/creating-contract/creating-contract.component';
import { CustomerLeadUpdateComponent } from '@components/lead/customer-lead-update/customer-lead-update.component';
import { FinalUnderwritingComponent } from '@components/lead/final-underwriting/final-underwriting.component';
import { FundDetailsComponent } from '@components/lead/fund-details/fund-details.component';
import { InterviewsComponent } from '@components/lead/interviews/interviews.component';
import { LeadCreateLenderOfferComponent } from '@components/lead/lead-create-lender-offer/lead-create-lender-offer.component';
import { LeadDetailComponent } from '@components/lead/lead-detail/lead-detail.component';
import { LeadEditComponent } from '@components/lead/lead-edit/lead-edit.component';
import { LeadSendSmsComponent } from '@components/lead/lead-send-sms/lead-send-sms.component';
import { LeadsListComponent } from '@components/lead/leads-list/leads-list.component';
import { SendEmailAndAppComponent } from '@components/lead/send-email-and-app/send-email-and-app.component';
import { SendEmailComponent } from '@components/lead/send-email/send-email.component';
import { WelcomeCallComponent } from '@components/lead/welcome-call/welcome-call.component';
import { LoginLogsReportsComponent } from '@components/login-logs-reports/login-logs-reports.component';
import { OfferReportComponent } from '@components/offer-report/offer-report.component';
import { ReportsComponent } from '@components/reports/reports.component';
import { SubmissionReportsComponent } from '@components/submission-reports/submission-reports.component';
import { UnderwriterReportsComponent } from '@components/underwriter-reports/underwriter-reports.component';
import { Roles } from '@constants/constants';
import { AuthPermission } from '@guards/auth-permission.guard';
import { RolePermission } from '@guards/role.guard';
import { UserLayoutComponent } from 'app/layouts/user-layout/user-layout.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { ProposeSubmissionComponent } from '@components/lead/propose-submission/propose-submission.component';
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
import { EmailTemplateListComponent } from '@components/email-template-list/email-template-list.component';
import { DripCampaignComponent } from '@components/drip-campaign/drip-campaign.component';
import { SendGridCredentialsComponent } from '@components/send-grid-credentials/send-grid-credentials.component';
import { DocumentsListComponent } from '@components/documents/documents-list/documents-list.component';
import { PayrollListComponent } from '@components/payroll-list/payroll-list.component';
import { CreateDripCompaignComponent } from '@components/create-drip-compaign/create-drip-compaign.component';
import { ViewDripCampaignComponent } from '@components/view-drip-campaign/view-drip-campaign.component';
import { EmailStaticsComponent } from '@components/email-statics/email-statics.component';
import { ListingListComponent } from '@components/listing-list/listing-list.component';
import { CreateListComponent } from '@components/create-list/create-list.component';
import { ViewEditListComponent } from '@components/view-edit-list/view-edit-list.component';
import { FundingRecordListComponent } from '@components/funding-record-list/funding-record-list.component';
import { CreateListNameComponent } from '@components/create-list-name/create-list-name.component';
import { SystemNotificationsListComponent } from '@components/system-notifications-list/system-notifications-list.component';
import { AddSystemNotificationsComponent } from '@components/add-system-notifications/add-system-notifications.component';
import { ViewEditSystemNotificationsComponent } from '@components/view-edit-system-notifications/view-edit-system-notifications.component';
import { LenderListComponent } from '@components/lender-list/lender-list.component';
import { CreateLenderComponent } from '@components/create-lender/create-lender.component';
import { ViewEditLenderComponent } from '@components/view-edit-lender/view-edit-lender.component';
import { LeadSourceListingComponent } from '@components/lead-source-listing/lead-source-listing.component';
import { SyndicatesListComponent } from '@modules/company/syndicates-list/syndicates-list.component';
import { AddSyndicateComponent } from '@modules/company/add-syndicate/add-syndicate.component';
import { ViewEditSyndicateComponent } from '@modules/company/view-edit-syndicate/view-edit-syndicate.component';
import { UsersComponent } from '@modules/company/users/users.component';
import { AddUserComponent } from '@modules/company/add-user/add-user.component';
import { UserViewEditComponent } from '@modules/company/user-view-edit/user-view-edit.component';
import { ManageDashbaordComponent } from '@components/manage-dashbaord/manage-dashbaord.component';
import { LeadStatusListingComponent } from '@components/lead-status-listing/lead-status-listing.component';
import { BusinessTypeListingComponent } from '@components/business-type-listing/business-type-listing.component';
import { AddLeadSourceComponent } from '@components/add-lead-source/add-lead-source.component';
import { ViewEditLeadSourceComponent } from '@components/view-edit-lead-source/view-edit-lead-source.component';
import { MoneyThumbFcsComponent } from '@components/money-thumb-fcs/money-thumb-fcs.component';

const routes: Routes = [
  {
    path: '', component: UserLayoutComponent, children: [
      { path: '', component: DashboardComponent, canActivate: [RolePermission], data: { role: Roles.UNDERWRITER } },
      { path: 'edit-profile', component: EditProfileComponent, canActivate: [RolePermission, AuthPermission], data: { role: Roles.UNDERWRITER, permission: 'profile-update' } },
      { path: 'leads', component: LeadsListComponent, canActivate: [RolePermission, AuthPermission], data: { role: Roles.UNDERWRITER, permission: 'lead-list' } },
      { path: 'lead-detail/:id', component: LeadDetailComponent, canActivate: [RolePermission, AuthPermission], data: { role: Roles.UNDERWRITER, permission: 'lead-view' } },
      { path: 'createlead', component: CreateLeadComponent, canActivate: [RolePermission, AuthPermission], data: { role: Roles.UNDERWRITER, permission: 'lead-create' } },
      { path: 'edit-lead/:id', component: LeadEditComponent, canActivate: [RolePermission, AuthPermission], data: { role: Roles.UNDERWRITER, permission: 'lead-edit' } },
      { path: 'edit-lender-offer/:leadid/:id', component: ViewEditLenderCreateOfferComponent, canActivate: [RolePermission, AuthPermission], data: { role: Roles.UNDERWRITER, permission: 'lender-offer-update' } },
      { path: 'add-activity/:id', component: AddActivityComponent, canActivate: [RolePermission, AuthPermission], data: { role: Roles.UNDERWRITER, permission: 'lead-activity-add' } },
      { path: 'creating-contract/:id', component: CreatingContractComponent, canActivate: [RolePermission, AuthPermission], data: { role: Roles.UNDERWRITER, permission: 'lead-contract' } },
      { path: 'reports', component: ReportsComponent, canActivate: [RolePermission, AuthPermission], data: { role: Roles.UNDERWRITER, permission: 'report-list' } },
      { path: 'final-underwriting/:id', component: FinalUnderwritingComponent, canActivate: [RolePermission], data: { role: Roles.UNDERWRITER } },
      { path: 'fund-details/:id', component: FundDetailsComponent, canActivate: [RolePermission, AuthPermission], data: { role: Roles.UNDERWRITER, permission: 'participant-create' } },
      { path: 'interview/:id', component: InterviewsComponent, canActivate: [RolePermission, AuthPermission], data: { role: Roles.UNDERWRITER, permission: 'lead-landlord-interview' } },
      { path: 'reports/login-logs-reports', component: LoginLogsReportsComponent, canActivate: [RolePermission, AuthPermission], data: { role: Roles.UNDERWRITER, permission: 'login-report' } },
      { path: 'reports/lead-source-reports', component: LeadSourceReportsComponent, canActivate: [RolePermission, AuthPermission], data: { role: Roles.UNDERWRITER, permission: 'by-lead-source' } },
      { path: 'reports/lender-submission-reports', component: SubmissionReportsComponent, canActivate: [RolePermission, AuthPermission], data: { role: Roles.UNDERWRITER, permission: 'lender-submission-report' } },
      { path: 'reports/underwriter-reports', component: UnderwriterReportsComponent, canActivate: [RolePermission, AuthPermission], data: { role: Roles.UNDERWRITER, permission: 'underwriter-report' } },
      { path: 'reports/funding-reports', component: FundingReportComponent, canActivate: [RolePermission, AuthPermission], data: { role: Roles.UNDERWRITER, permission: 'funding-report' } },
      { path: 'reports/funded-reports', component: FundedReportComponent, canActivate: [RolePermission, AuthPermission], data: { role: Roles.UNDERWRITER, permission: 'funded-report' } },
      { path: 'reports/prefunding-reports', component: PreFundingReportComponent, canActivate: [RolePermission, AuthPermission], data: { role: Roles.UNDERWRITER, permission: 'pre-funding-report' } },
      { path: 'reports/daily-lead-progress-reports', component: DailyLeadProgressReportComponent, canActivate: [RolePermission, AuthPermission], data: { role: Roles.UNDERWRITER, permission: 'daily-lead-progress-report' } },
      { path: 'reports/lenders-reports', component: LenderReportComponent, canActivate: [RolePermission, AuthPermission], data: { role: Roles.UNDERWRITER, permission: 'lender-report' } },
      { path: 'reports/updates-logs-reports', component: UpdatesLogsReportComponent, canActivate: [RolePermission, AuthPermission], data: { role: Roles.UNDERWRITER, permission: 'updates-log' } },
      { path: 'reports/iso-payment-reports', component: IsoPaymentReportComponent, canActivate: [RolePermission, AuthPermission], data: { role: Roles.UNDERWRITER, permission: 'iso-payment-report' } },
      { path: 'reports/lead-payment-reports', component: PaymentHistoryReportComponent, canActivate: [RolePermission, AuthPermission], data: { role: Roles.UNDERWRITER, permission: 'lead-payments' } },
      { path: 'reports/call-logs-reports', component: CallLogsReportComponent, canActivate: [RolePermission, AuthPermission], data: { role: Roles.UNDERWRITER, permission: 'call-log-report' } },
      { path: 'reports/sms-marketing-reports', component: SmsMarketingReportComponent, canActivate: [RolePermission, AuthPermission], data: { role: Roles.UNDERWRITER, permission: 'sms-marketing-report' } },
      { path: 'reports/submission-reports', component: LeadSubmissionReportComponent, canActivate: [RolePermission, AuthPermission], data: { role: Roles.UNDERWRITER, permission: 'submission-report' } },
      { path: 'reports/pull-through-ratio-reports', component: PullThroughRatioReportComponent, canActivate: [RolePermission, AuthPermission], data: { role: Roles.UNDERWRITER, permission: 'pull-through-ratio-report' } },
      { path: 'reports/source-pyroll-reports', component: SourcePayrollReportComponent, canActivate: [RolePermission, AuthPermission], data: { role: Roles.UNDERWRITER, permission: 'source-payroll' } },
      { path: 'reports/sms-schedule-reports', component: SmsScheduleReportComponent, canActivate: [RolePermission, AuthPermission], data: { role: Roles.UNDERWRITER, permission: 'sms-schedule-report' } },
      { path: 'reports/profit-loss-reports', component: ProfitLossReportComponent, canActivate: [RolePermission, AuthPermission], data: { role: Roles.UNDERWRITER, permission: 'profit-loss-report' } },
      { path: 'reports/analytics-reports', component: AnalyticsReportComponent, canActivate: [RolePermission, AuthPermission], data: { role: Roles.UNDERWRITER, permission: 'analytics-reports' } },
      { path: 'reports/lender-owe-reports', component: LenderOweReportComponent, canActivate: [RolePermission, AuthPermission], data: { role: Roles.UNDERWRITER, permission: 'lender-owe-report' } },
      { path: 'reports/email-logs-reports', component: EmailLogsReportComponent, canActivate: [RolePermission, AuthPermission], data: { role: Roles.UNDERWRITER, permission: 'email-logs' } },
      { path: 'reports/offer-reports', component: OfferReportComponent, canActivate: [RolePermission, AuthPermission], data: { role: Roles.UNDERWRITER, permission: 'offers-report' } },
      { path: 'lead-createlenderoffer/:id', component: LeadCreateLenderOfferComponent, canActivate: [RolePermission, AuthPermission], data: { role: Roles.UNDERWRITER, permission: 'lender-offer-create' } },
      { path: 'email-template-list', component: EmailTemplateListComponent, canActivate: [RolePermission, AuthPermission], data: { role: Roles.UNDERWRITER, permission: 'email-template-list' }, },
      { path: 'update-email-templates/:id', component: SendEmailComponent, canActivate: [RolePermission, AuthPermission], data: { role: Roles.UNDERWRITER, permission: 'email-template-view' }, },
      { path: 'add-email-templates', component: AddEmailTemplateComponent, canActivate: [RolePermission, AuthPermission], data: { role: Roles.UNDERWRITER, permission: 'email-template-add' }, },
      { path: 'add-email-templates', component: AddEmailTemplateComponent, canActivate: [RolePermission, AuthPermission], data: { role: Roles.UNDERWRITER, permission: 'email-template-add' } },
      { path: 'email-statics', component: EmailStaticsComponent, canActivate: [RolePermission], data: { role: Roles.UNDERWRITER } },
      { path: 'welcome-call/:id', component: WelcomeCallComponent, canActivate: [RolePermission, AuthPermission], data: { role: Roles.UNDERWRITER, permission: 'lead-welcome-call' } },
      { path: 'send-email-app/:id', component: SendEmailAndAppComponent, canActivate: [RolePermission, AuthPermission], data: { role: Roles.UNDERWRITER, permission: 'send-app-and-email' } },
      { path: 'lead-update/:id', component: CustomerLeadUpdateComponent, canActivate: [RolePermission, AuthPermission], data: { role: Roles.UNDERWRITER, permission: 'lead-edit' } },
      { path: 'send-sms/:id', component: LeadSendSmsComponent, canActivate: [RolePermission, AuthPermission], data: { role: Roles.UNDERWRITER, permission: 'send-sms' } },
      { path: 'pre-fund/:id', component: LeadPrefundComponent, canActivate: [RolePermission, AuthPermission], data: { role: Roles.UNDERWRITER, permission: 'send-sms' } },
      {
        path: 'funding-record-list/:id',
        component: FundingRecordListComponent,
        canActivate: [RolePermission, AuthPermission],
        data: { role: Roles.UNDERWRITER, permission: 'send-sms' },
    },
      { path: 'propose-submission/:id', component: ProposeSubmissionComponent, canActivate: [RolePermission, AuthPermission], data: { role: Roles.UNDERWRITER, permission: 'propose-submission' } },
      { path: 'edit-report-description', component: ReportDescriptionEditComponent, canActivate: [RolePermission, AuthPermission], data: { role: Roles.ADMINISTRATOR, permission: 'report-decription-update' } },
      { path: 'fund', loadChildren: () => import('@modules/funds/funds.module').then(m => m.FundsModule), data: {} },
      {
        path: 'drip-campaign-list',
        component: DripCampaignComponent,
        canActivate: [RolePermission, AuthPermission],
        data: {
          role: Roles.UNDERWRITER,
          permission: 'campaign-list',
        },
      },
      {
        path: 'drip-campaign-list/add-drip-campaign',
        component: CreateDripCompaignComponent,
        canActivate: [RolePermission],
        data: {
          role: Roles.UNDERWRITER,
          // permission: 'campaign-add',
        },
      },
      {
        path: 'drip-campaign-list/edit-drip-campaign/:id',
        component: ViewDripCampaignComponent,
        canActivate: [RolePermission],
        data: { role: Roles.UNDERWRITER },
      },
      {
        path: 'email-configurations',
        component: SendGridCredentialsComponent,
        canActivate: [RolePermission],
        data: {
          role: Roles.UNDERWRITER,
        },
      },
      { path: 'documents', component: DocumentsListComponent },
      {
        path: 'payroll-list',
        component: PayrollListComponent,
        canActivate: [RolePermission],
        data: {
          role: Roles.UNDERWRITER,
        },
      },
      {
        path: 'list',
        component: ListingListComponent,
        canActivate: [RolePermission],
        data: {
          role: Roles.UNDERWRITER,
        },
      },
      {
        path: 'list/create-list',
        component: CreateListComponent,
        canActivate: [RolePermission],
        data: { role: Roles.UNDERWRITER },
      },
      {
        path: 'list/create-list-name',
        component: CreateListNameComponent ,
        canActivate: [RolePermission],
        data: { role: Roles.UNDERWRITER },
      },
      {
        path: 'list/edit-list/:id',
        component: ViewEditListComponent,
        canActivate: [RolePermission],
        data: { role: Roles.UNDERWRITER },
      },
      {
        path: 'system-notification-list',
        component: SystemNotificationsListComponent,
        canActivate: [RolePermission],
        data: {
          role: Roles.UNDERWRITER
        },
      },
      {
        path: 'system-notification-list/add-system-notification',
        component: AddSystemNotificationsComponent,
        canActivate: [RolePermission],
        data: {
          role: Roles.UNDERWRITER
        },
      },
      {
        path: 'system-notification-list/edit-system-notification/:id',
        component: ViewEditSystemNotificationsComponent,
        canActivate: [RolePermission],
        data: { role: Roles.UNDERWRITER},
      },
      {
        path: 'lenders-list',
        component: LenderListComponent,
        canActivate: [RolePermission],
        data: { role: Roles.UNDERWRITER },
      },
      {
        path: 'lenders-list/add',
        component: CreateLenderComponent,
        canActivate: [RolePermission],
        data: { role: Roles.UNDERWRITER},
      },
      {
        path: 'lenders-list/:id',
        component: ViewEditLenderComponent,
        canActivate: [RolePermission],
        data: { role: Roles.UNDERWRITER },
      },
      {
        path: 'lead-source',
        component: LeadSourceListingComponent,
        canActivate: [RolePermission],
        data: {
            role: Roles.UNDERWRITER}
        },
        // permission: 'system-notification-list',
        {
          path: 'syndicates',
          component: SyndicatesListComponent,
          canActivate: [RolePermission],
          data: { role: Roles.UNDERWRITER },
        },
        {
          path: 'syndicates/add',
          component: AddSyndicateComponent,
          canActivate: [RolePermission],
          data: { role: Roles.UNDERWRITER },
        },
        {
          path: 'syndicates/:id',
          component: ViewEditSyndicateComponent,
          canActivate: [RolePermission],
          data: { role: Roles.UNDERWRITER },

      },
      {
        path: 'user',
        component: UsersComponent,
        canActivate: [RolePermission],
        data: { role: Roles.UNDERWRITER },
      },
      {
        path: 'user/add',
        component: AddUserComponent,
        canActivate: [RolePermission],
        data: { role: Roles.UNDERWRITER },
      },
      {
        path: 'user/:id',
        component: UserViewEditComponent,
        canActivate: [RolePermission],
        data: { role: Roles.UNDERWRITER },
      },
      {
        path: 'manage-dashboard',
        component: ManageDashbaordComponent,
        canActivate: [RolePermission],
        data: { role: Roles.UNDERWRITER },
      },
      {
        path: 'lead-status-listing',
        component: LeadStatusListingComponent,
        canActivate: [RolePermission],
        data: {
          role: Roles.UNDERWRITER,
        },
      },
      {
        path: 'business-type-listing',
        component: BusinessTypeListingComponent,
        canActivate: [RolePermission],
        data: {
          role: Roles.UNDERWRITER,
        },
      },
      {
        path: 'create-lead-source',
        component: AddLeadSourceComponent,
        canActivate: [RolePermission],
        data: {
            role: Roles.UNDERWRITER,
            // permission:'lead-source-list'
        },
    },
    {
        path: 'edit-lead-source/:id',
        component: ViewEditLeadSourceComponent,
        canActivate: [RolePermission],
        data: {
            role: Roles.UNDERWRITER,
            // permission:'lead-source-list'
        },
    },

    {
      path: 'money-thumb-fcs/:id',
      component: MoneyThumbFcsComponent,
      // , AuthPermission
      canActivate: [RolePermission],
      data: { role: Roles.UNDERWRITER, 
      },
      // permission: 'send-app-and-email' 
    },
 
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class UnderWritterRoutingModule { }
