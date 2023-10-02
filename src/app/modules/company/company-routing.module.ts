import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CompanyComponent } from '../../layouts/company/company.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { HasPermission } from '@guards/permission.guard';
import { Roles } from '@constants/constants';
import { AddUserComponent } from './add-user/add-user.component';
import { UsersComponent } from './users/users.component';
import { UserViewEditComponent } from './user-view-edit/user-view-edit.component';
import { EditProfileComponent } from '@components/edit-profile/edit-profile.component';
import { RolesComponent } from './roles/roles.component';
import { RoleEditComponent } from './role-edit/role-edit.component';
import { CreateLeadComponent } from '@components/lead/create-lead/create-lead.component';
import { AuthPermission } from '@guards/auth-permission.guard';
import { LeadsListComponent } from '@components/lead/leads-list/leads-list.component';
import { LeadDetailComponent } from '@components/lead/lead-detail/lead-detail.component';
import { DocumentsListComponent } from '@components/documents/documents-list/documents-list.component';
import { SyndicatesListComponent } from './syndicates-list/syndicates-list.component';
import { AddSyndicateComponent } from './add-syndicate/add-syndicate.component';
import { ReportsComponent } from '@components/reports/reports.component';
import { LoginLogsReportsComponent } from '@components/login-logs-reports/login-logs-reports.component';
import { SubmissionReportsComponent } from '@components/submission-reports/submission-reports.component';
import { LeadSourceReportsComponent } from '@components/lead-source-reports/lead-source-reports.component';
import { UnderwriterReportsComponent } from '@components/underwriter-reports/underwriter-reports.component';
import { EmailLogsReportComponent } from '@components/email-logs-report/email-logs-report.component';
import { OfferReportComponent } from '@components/offer-report/offer-report.component';
import { SendEmailComponent } from '@components/lead/send-email/send-email.component';
import { AddActivityComponent } from '@components/lead/add-activity/add-activity.component';
import { CreatingContractComponent } from '@components/lead/creating-contract/creating-contract.component';
import { FinalUnderwritingComponent } from '@components/lead/final-underwriting/final-underwriting.component';
import { WelcomeCallComponent } from '@components/lead/welcome-call/welcome-call.component';
import { LeadEditComponent } from '@components/lead/lead-edit/lead-edit.component';
import { FundDetailsComponent } from '@components/lead/fund-details/fund-details.component';
import { UpdatePermissionDetailsComponent } from './update-permission-details/update-permission-details.component';
import { ViewEditSyndicateComponent } from './view-edit-syndicate/view-edit-syndicate.component';
import { AddEmailTemplateComponent } from '@components/lead/add-email-template/add-email-template.component';
import { LenderListComponent } from '@components/lender-list/lender-list.component';
import { CreateLenderComponent } from '@components/create-lender/create-lender.component';
import { ViewEditLenderComponent } from '@components/view-edit-lender/view-edit-lender.component';
import { SendGridCredentialsComponent } from '@components/send-grid-credentials/send-grid-credentials.component';
import { SendEmailAndAppComponent } from '@components/lead/send-email-and-app/send-email-and-app.component';
import { EditSubmissionThanksComponent } from '@components/edit-submission-thanks/edit-submission-thanks.component';
import { TeamListComponent } from '@components/team-list/team-list.component';
import { LeadSendSmsComponent } from '@components/lead/lead-send-sms/lead-send-sms.component';
import { CreateTeamComponent } from '@components/create-team/create-team.component';
import { ViewEditTeamComponent } from '@components/view-edit-team/view-edit-team.component';
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
import { LeadCreateLenderOfferComponent } from '@components/lead/lead-create-lender-offer/lead-create-lender-offer.component';
import { LeadPrefundComponent } from '@components/lead/lead-prefund/lead-prefund.component';
import { LenderOfferContentComponent } from '@components/lender-offer-content/lender-offer-content.component';
import { ReportDescriptionEditComponent } from '@components/report-description-edit/report-description-edit.component';
import { EmailTemplateListComponent } from '@components/email-template-list/email-template-list.component';
import { PayrollListComponent } from '@components/payroll-list/payroll-list.component';
import { DripCampaignComponent } from '@components/drip-campaign/drip-campaign.component';
import { CreateDripCompaignComponent } from '@components/create-drip-compaign/create-drip-compaign.component';
import { ViewDripCampaignComponent } from '@components/view-drip-campaign/view-drip-campaign.component';
import { EmailStaticsComponent } from '@components/email-statics/email-statics.component';
import { RoleListViewComponent } from './role-list-view/role-list-view.component';
import { ListingListComponent } from '@components/listing-list/listing-list.component';
import { CreateListComponent } from '@components/create-list/create-list.component';
import { ViewEditListComponent } from '@components/view-edit-list/view-edit-list.component';
import { FundingRecordListComponent } from '@components/funding-record-list/funding-record-list.component';
import { CreateListNameComponent } from '@components/create-list-name/create-list-name.component';
import { AgentListComponent } from '@components/agent-list/agent-list.component';
import { CreateAgentComponent } from '@components/create-agent/create-agent.component';
import { ViewEditAgentComponent } from '@components/view-edit-agent/view-edit-agent.component';
import { SystemNotificationsListComponent } from '@components/system-notifications-list/system-notifications-list.component';
import { AddSystemNotificationsComponent } from '@components/add-system-notifications/add-system-notifications.component';
import { ViewEditSystemNotificationsComponent } from '@components/view-edit-system-notifications/view-edit-system-notifications.component';
import { LeadSourceListingComponent } from '@components/lead-source-listing/lead-source-listing.component';
import { ManageDashbaordComponent } from '@components/manage-dashbaord/manage-dashbaord.component';
import { LeadStatusListingComponent } from '@components/lead-status-listing/lead-status-listing.component';
import { BusinessTypeListingComponent } from '@components/business-type-listing/business-type-listing.component';
import { AddLeadSourceComponent } from '@components/add-lead-source/add-lead-source.component';
import { ViewEditLeadSourceComponent } from '@components/view-edit-lead-source/view-edit-lead-source.component';
import { MoneyThumbFcsComponent } from '@components/money-thumb-fcs/money-thumb-fcs.component';


const routes: Routes = [
  {
    path: '',
    component: CompanyComponent,
    children: [
      {
        path: '',
        component: DashboardComponent,
        canActivate: [HasPermission],
        data: { role: Roles.COMPANY },
      },
      {
        path: 'leads',
        component: LeadsListComponent,
        canActivate: [HasPermission],
        data: { role: Roles.COMPANY },
      },
      {
        path: 'roles',
        component: RolesComponent,
        canActivate: [HasPermission],
        data: { role: Roles.COMPANY },
      },
      { path: 'documents', component: DocumentsListComponent },
      // {
      //   path: 'role/:id',
      //   component: RoleEditComponent,
      //   canActivate: [HasPermission],
      //   data: { role: Roles.COMPANY },
      // },
      {
        path: 'role/:id',
        component: RoleListViewComponent,
        canActivate: [HasPermission],
        data: { role: Roles.COMPANY },
      },
      {
        path: 'add-activity/:id',
        component: AddActivityComponent,
        canActivate: [HasPermission, AuthPermission],
        data: { role: Roles.COMPANY, permission: 'lead-activity-add' },
      },
      {
        path: 'edit-profile',
        component: EditProfileComponent,
        canActivate: [HasPermission, AuthPermission],
        data: { role: Roles.COMPANY, permission: 'profile-update' },
      },
      {
        path: 'edit-lead/:id',
        component: LeadEditComponent,
        canActivate: [HasPermission, AuthPermission],
        data: { role: Roles.COMPANY, permission: 'lead-edit' },
      },
      {
        path: 'edit-lender-offer/:leadid/:id',
        component: ViewEditLenderCreateOfferComponent,
        canActivate: [HasPermission, AuthPermission],
        data: { role: Roles.COMPANY, permission: 'lender-offer-update' },
      },
      {
        path: 'user',
        component: UsersComponent,
        canActivate: [HasPermission],
        data: { role: Roles.COMPANY },
      },
      {
        path: 'syndicates',
        component: SyndicatesListComponent,
        canActivate: [HasPermission],
        data: { role: Roles.COMPANY },
      },
      {
        path: 'syndicates/add',
        component: AddSyndicateComponent,
        canActivate: [HasPermission],
        data: { role: Roles.COMPANY },
      },
      {
        path: 'syndicates/:id',
        component: ViewEditSyndicateComponent,
        canActivate: [HasPermission],
        data: { role: Roles.COMPANY },
      },
      {
        path: 'user/add',
        component: AddUserComponent,
        canActivate: [HasPermission],
        data: { role: Roles.COMPANY },
      },
      {
        path: 'user/:id',
        component: UserViewEditComponent,
        canActivate: [HasPermission],
        data: { role: Roles.COMPANY },
      },
      {
        path: 'createlead',
        component: CreateLeadComponent,
        canActivate: [HasPermission, AuthPermission],
        data: { role: Roles.COMPANY, permission: 'lead-create' },
      },
      {
        path: 'lead-detail/:id',
        component: LeadDetailComponent,
        canActivate: [HasPermission],
        data: { role: Roles.COMPANY, permission: 'lead-view' },
      },
      {
        path: 'reports',
        component: ReportsComponent,
        canActivate: [HasPermission],
        data: { role: Roles.COMPANY },
      },
      {
        path: 'fund-details/:id',
        component: FundDetailsComponent,
        canActivate: [HasPermission, AuthPermission],
        data: { role: Roles.COMPANY, permission: 'participant-create' },
      },
      {
        path: 'update-email-templates/:id',
        component: SendEmailComponent,
        canActivate: [HasPermission, AuthPermission],
        data: { role: Roles.COMPANY, permission: 'email-template-view' },
      },
      {
        path: 'email-template-list',
        component: EmailTemplateListComponent,
        canActivate: [HasPermission, AuthPermission],
        data: { role: Roles.COMPANY, permission: 'email-template-list' },
      },
      {
        path: 'add-email-templates',
        component: AddEmailTemplateComponent,
        canActivate: [HasPermission, AuthPermission],
        data: { role: Roles.COMPANY, permission: 'email-template-add' },
      },
      {
        path: 'email-statics',
        component: EmailStaticsComponent,
        canActivate: [HasPermission, AuthPermission],
        data: { role: Roles.COMPANY, permission: 'email-statistics' },
      },
      {
        path: 'reports/login-logs-reports',
        component: LoginLogsReportsComponent,
        canActivate: [HasPermission],
        data: { role: Roles.COMPANY },
      },
      {
        path: 'reports/lead-source-reports',
        component: LeadSourceReportsComponent,
        canActivate: [HasPermission],
        data: { role: Roles.COMPANY },
      },
      {
        path: 'reports/lender-submission-reports',
        component: SubmissionReportsComponent,
        canActivate: [HasPermission],
        data: { role: Roles.COMPANY },
      },
      {
        path: 'reports/underwriter-reports',
        component: UnderwriterReportsComponent,
        canActivate: [HasPermission],
        data: { role: Roles.COMPANY },
      },
      {
        path: 'reports/funding-reports',
        component: FundingReportComponent,
        canActivate: [HasPermission, AuthPermission],
        data: { role: Roles.COMPANY, permission: 'funding-report' },
      },
      {
        path: 'reports/funded-reports',
        component: FundedReportComponent,
        canActivate: [HasPermission, AuthPermission],
        data: { role: Roles.COMPANY, permission: 'funded-report' },
      },
      {
        path: 'reports/prefunding-reports',
        component: PreFundingReportComponent,
        canActivate: [HasPermission, AuthPermission],
        data: { role: Roles.COMPANY, permission: 'pre-funding-report' },
      },
      {
        path: 'reports/daily-lead-progress-reports',
        component: DailyLeadProgressReportComponent,
        canActivate: [HasPermission, AuthPermission],
        data: { role: Roles.COMPANY, permission: 'daily-lead-progress-report' },
      },
      {
        path: 'reports/lenders-reports',
        component: LenderReportComponent,
        canActivate: [HasPermission, AuthPermission],
        data: { role: Roles.COMPANY, permission: 'lender-report' },
      },
      {
        path: 'reports/updates-logs-reports',
        component: UpdatesLogsReportComponent,
        canActivate: [HasPermission, AuthPermission],
        data: { role: Roles.COMPANY, permission: 'updates-log' },
      },
      {
        path: 'reports/iso-payment-reports',
        component: IsoPaymentReportComponent,
        canActivate: [HasPermission, AuthPermission],
        data: { role: Roles.COMPANY, permission: 'iso-payment-report' },
      },
      {
        path: 'reports/lead-payment-reports',
        component: PaymentHistoryReportComponent,
        canActivate: [HasPermission, AuthPermission],
        data: { role: Roles.COMPANY, permission: 'lead-payments' },
      },
      {
        path: 'reports/call-logs-reports',
        component: CallLogsReportComponent,
        canActivate: [HasPermission, AuthPermission],
        data: { role: Roles.COMPANY, permission: 'call-log-report' },
      },
      {
        path: 'reports/sms-marketing-reports',
        component: SmsMarketingReportComponent,
        canActivate: [HasPermission, AuthPermission],
        data: { role: Roles.COMPANY, permission: 'sms-marketing-report' },
      },
      {
        path: 'reports/submission-reports',
        component: LeadSubmissionReportComponent,
        canActivate: [HasPermission, AuthPermission],
        data: { role: Roles.COMPANY, permission: 'submission-report' },
      },
      {
        path: 'reports/pull-through-ratio-reports',
        component: PullThroughRatioReportComponent,
        canActivate: [HasPermission, AuthPermission],
        data: { role: Roles.COMPANY, permission: 'pull-through-ratio-report' },
      },
      {
        path: 'reports/source-pyroll-reports',
        component: SourcePayrollReportComponent,
        canActivate: [HasPermission, AuthPermission],
        data: { role: Roles.COMPANY, permission: 'source-payroll' },
      },
      {
        path: 'reports/sms-schedule-reports',
        component: SmsScheduleReportComponent,
        canActivate: [HasPermission, AuthPermission],
        data: { role: Roles.COMPANY, permission: 'sms-schedule-report' },
      },
      {
        path: 'reports/profit-loss-reports',
        component: ProfitLossReportComponent,
        canActivate: [HasPermission, AuthPermission],
        data: { role: Roles.COMPANY, permission: 'profit-loss-report' },
      },
      {
        path: 'reports/analytics-reports',
        component: AnalyticsReportComponent,
        canActivate: [HasPermission, AuthPermission],
        data: { role: Roles.COMPANY, permission: 'analytics-reports' },
      },
      {
        path: 'reports/lender-owe-reports',
        component: LenderOweReportComponent,
        canActivate: [HasPermission, AuthPermission],
        data: { role: Roles.COMPANY, permission: 'lender-owe-report' },
      },
      {
        path: 'reports/email-logs-reports',
        component: EmailLogsReportComponent,
        canActivate: [HasPermission],
        data: { role: Roles.COMPANY },
      },
      {
        path: 'reports/offer-reports',
        component: OfferReportComponent,
        canActivate: [HasPermission],
        data: { role: Roles.COMPANY },
      },
      {
        path: 'welcome-call/:id',
        component: WelcomeCallComponent,
        canActivate: [HasPermission, AuthPermission],
        data: { role: Roles.COMPANY, permission: 'lead-welcome-call' },
      },
      {
        path: 'send-email-app/:id',
        component: SendEmailAndAppComponent,
        canActivate: [HasPermission, AuthPermission],
        data: { role: Roles.COMPANY, permission: 'send-app-and-email' },
      },
      {
        path: 'final-underwriting/:id',
        component: FinalUnderwritingComponent,
        canActivate: [HasPermission, AuthPermission],
        data: { role: Roles.COMPANY, permission: 'lead-final-underwriting' },
      },
      {
        path: 'creating-contract/:id',
        component: CreatingContractComponent,
        canActivate: [HasPermission, AuthPermission],
        data: { role: Roles.COMPANY, permission: 'lead-contract' },
      },
      {
        path: 'update-permission-details',
        component: UpdatePermissionDetailsComponent,
        canActivate: [HasPermission, AuthPermission],
        data: { role: Roles.COMPANY, permission: 'lead-contract' },
      },
      {
        path: 'lenders-list',
        component: LenderListComponent,
        canActivate: [HasPermission, AuthPermission],
        data: { role: Roles.COMPANY, permission: 'lender-list' },
      },
      {
        path: 'lenders-list/add',
        component: CreateLenderComponent,
        canActivate: [HasPermission, AuthPermission],
        data: { role: Roles.COMPANY, permission: 'lender-create' },
      },
      {
        path: 'lenders-list/:id',
        component: ViewEditLenderComponent,
        canActivate: [HasPermission],
        data: { role: Roles.COMPANY },
      },
      {
        path: 'email-configurations',
        component: SendGridCredentialsComponent,
        canActivate: [HasPermission],
        data: { role: Roles.COMPANY, permission: 'email-configuration-view' },
      },
      {
        path: 'edit-submission-thanks',
        component: EditSubmissionThanksComponent,
        canActivate: [HasPermission],
        data: { role: Roles.COMPANY },
      },
      {
        path: 'lead-createlenderoffer/:id',
        component: LeadCreateLenderOfferComponent,
        canActivate: [HasPermission, AuthPermission],
        data: { role: Roles.COMPANY, permission: 'lender-offer-create' },
      },
      {
        path: 'team-list',
        component: TeamListComponent,
        canActivate: [HasPermission, AuthPermission],
        data: { role: Roles.COMPANY, permission: 'team-list' },
      },
      {
        path: 'team-list/add',
        component: CreateTeamComponent,
        canActivate: [HasPermission],
        data: { role: Roles.COMPANY },
      },
      {
        path: 'team-list/:id',
        component: ViewEditTeamComponent,
        canActivate: [HasPermission],
        data: { role: Roles.COMPANY },
      },
      {
        path: 'send-sms/:id',
        component: LeadSendSmsComponent,
        canActivate: [HasPermission, AuthPermission],
        data: { role: Roles.COMPANY, permission: 'send-sms' },
      },
      {
        path: 'pre-fund/:id',
        component: LeadPrefundComponent,
        canActivate: [HasPermission, AuthPermission],
        data: { role: Roles.COMPANY, permission: 'send-sms' },
      },
      {
        path: 'funding-record-list/:id',
        component: FundingRecordListComponent,
        canActivate: [HasPermission, AuthPermission],
        data: { role: Roles.COMPANY, permission: 'send-sms' },
      },
      {
        path: 'lender-offer-form',
        component: LenderOfferContentComponent,
        canActivate: [HasPermission, AuthPermission],
        data: { role: Roles.COMPANY, permission: 'lender-offer-form-field' },
      },
      {
        path: 'propose-submission/:id',
        component: ProposeSubmissionComponent,
        canActivate: [HasPermission, AuthPermission],
        data: { role: Roles.COMPANY, permission: 'propose-submission' },
      },
      {
        path: 'edit-report-description',
        component: ReportDescriptionEditComponent,
        canActivate: [HasPermission, AuthPermission],
        data: { role: Roles.COMPANY, permission: 'report-decription-update' },
      },
      {
        path: 'fund',
        loadChildren: () =>
          import('@modules/funds/funds.module').then((m) => m.FundsModule),
        data: {},
      },
      {
        path: 'payroll-list',
        component: PayrollListComponent,
        canActivate: [HasPermission, AuthPermission],
        data: {
          role: Roles.COMPANY,
          permission: 'report-decription-update',
        },
      },
      {
        path: 'drip-campaign-list',
        component: DripCampaignComponent,
        canActivate: [HasPermission, AuthPermission],
        data: {
          role: Roles.COMPANY,
          permission: 'campaign-list',
        },
      },
      {
        path: 'drip-campaign-list/edit-drip-campaign/:id',
        // ViewEditDripCampaignComponent
        component: ViewDripCampaignComponent,
        canActivate: [HasPermission, AuthPermission],
        data: { role: Roles.COMPANY, permission: 'campaign-update' },
      },
      {
        path: 'drip-campaign-list/add-drip-campaign',
        component: CreateDripCompaignComponent,
        canActivate: [HasPermission, AuthPermission],
        data: {
          role: Roles.COMPANY,
          permission: 'campaign-add',
        },
      },
      {
        path: 'list',
        component: ListingListComponent,
        canActivate: [HasPermission, AuthPermission],
        data: {
          role: Roles.COMPANY,
          permission: 'list-lists',
        },
      },
      {
        path: 'list/create-list',
        component: CreateListComponent,
        canActivate: [HasPermission, AuthPermission],
        data: { role: Roles.COMPANY, permission: 'list-add' },
      },
      {
        path: 'list/create-list-name',
        component: CreateListNameComponent,
        canActivate: [HasPermission, AuthPermission],
        data: { role: Roles.COMPANY, permission: 'list-add' },
      },
      {
        path: 'list/edit-list/:id',
        // ViewEditDripCampaignComponent
        component: ViewEditListComponent,
        canActivate: [HasPermission, AuthPermission],
        data: { role: Roles.COMPANY, permission: 'list-update' },
      },
      // {
      //   path:'agent',
      //   component:AgentListComponent,
      //   canActivate:[HasPermission,AuthPermission],
      //   data:{role: Roles.COMPANY,permission:'agent-list'},
      // },{
      //   path:'agent/create-agent',
      //   component: CreateAgentComponent,
      //   canActivate: [HasPermission, AuthPermission],
      //   data:{role: Roles.COMPANY , permission:'agent-add'},
      // },{
      //   path:'agent/edit-list/:id',
      //   component: ViewEditAgentComponent,
      //   canActivate:[HasPermission,AuthPermission],
      //   data:{role: Roles.COMPANY , permission:'agent-update'}
      // }
      {
        path: 'agent',
        component: AgentListComponent,
        canActivate: [HasPermission],
        data: { role: Roles.COMPANY },
      }, {
        path: 'agent/create-agent',
        component: CreateAgentComponent,
        canActivate: [HasPermission],
        data: { role: Roles.COMPANY },
      }, {
        path: 'agent/edit-list/:id',
        component: ViewEditAgentComponent,
        canActivate: [HasPermission],
        data: { role: Roles.COMPANY }
      },
      {
        path: 'system-notification-list',
        component: SystemNotificationsListComponent,
        canActivate: [HasPermission, AuthPermission],
        data: {
          role: Roles.COMPANY,
          permission: 'system-notification-list',
        },
      },
      {
        path: 'system-notification-list/add-system-notification',
        component: AddSystemNotificationsComponent,
        canActivate: [HasPermission, AuthPermission],
        data: {
          role: Roles.COMPANY,
          permission: 'system-notification-add',
        },
      },
      {
        path: 'system-notification-list/edit-system-notification/:id',
        component: ViewEditSystemNotificationsComponent,
        canActivate: [HasPermission, AuthPermission],
        data: { role: Roles.COMPANY, permission: 'system-notification-update' },
      },
      {
        path: 'lead-source',
        component: LeadSourceListingComponent,
        canActivate: [HasPermission, AuthPermission],
        data: {
          role: Roles.COMPANY,
          permission: 'lead-source-list',
        },
      },
      {
        path: 'manage-dashboard',
        component: ManageDashbaordComponent,
        canActivate: [HasPermission, AuthPermission],
        data: {
          role: Roles.COMPANY,
          permission: 'manage-cards',
        },
      },
      {
        path: 'lead-status-listing',
        component: LeadStatusListingComponent,
        canActivate: [HasPermission, AuthPermission],
        data: {
          role: Roles.COMPANY,
          permission: 'lead-status-list',
        },
      },
      {
        path: 'business-type-listing',
        component: BusinessTypeListingComponent,
        canActivate: [HasPermission, AuthPermission],
        data: {
          role: Roles.COMPANY,
          permission: 'business-type-list',
        },
      },
        {
          path: 'create-lead-source',
          component: AddLeadSourceComponent,
          // canActivate: [HasPermission, AuthPermission],
          data: {
              role: Roles.COMPANY,
              // permission:'lead-source-list'
          },
      },
      {
          path: 'edit-lead-source/:id',
          component: ViewEditLeadSourceComponent,
          // canActivate: [HasPermission, AuthPermission],
          data: {
              role: Roles.COMPANY,
              // permission:'lead-source-list'
          },
      },
      {
        path: 'money-thumb-fcs/:id',
        component: MoneyThumbFcsComponent,
        // , AuthPermission
        canActivate: [HasPermission],
        data: { role: Roles.COMPANY, 
        },
        // permission: 'send-app-and-email' 
      },
     
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class CompanyRoutingModule { }
