import { NgModule, ModuleWithProviders } from '@angular/core';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';

import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { HeaderComponent } from 'app/layouts/header/header.component';
import { EditProfileComponent } from '@components/edit-profile/edit-profile.component';
import { ChangePasswordComponent } from '@components/change-password/change-password.component';
import { AccessDeniedComponent } from '@components/access-denied/access-denied.component';
import { ComingSoonComponent } from '@components/coming-soon/coming-soon.component';
import { CreateLeadComponent } from '@components/lead/create-lead/create-lead.component';
import { LeadDetailComponent } from '@components/lead/lead-detail/lead-detail.component';
import { LeadsListComponent } from '@components/lead/leads-list/leads-list.component';
import { ExcelService } from '@services/excel.service';
//third-party
// import { NgxSpinnerModule } from "ngx-spinner";
import { NgxUiLoaderModule } from 'ngx-ui-loader';
import { ToastrModule } from 'ngx-toastr';
import { NgxPaginationModule } from 'ngx-pagination';
import { SweetAlert2Module } from '@sweetalert2/ngx-sweetalert2';
import { NgxMaskModule } from 'ngx-mask';
import { NgSelectModule } from '@ng-select/ng-select';
import { LeadUpdatesComponent } from '@components/lead/lead-updates/lead-updates.component';
import { LeadActivitiesComponent } from '@components/lead/lead-activities/lead-activities.component';
import { LeadDocumentsComponent } from '@components/lead/lead-documents/lead-documents.component';
import { LeadFcsComponent } from '@components/lead/lead-fcs/lead-fcs.component';
import { LeadEditComponent } from '@components/lead/lead-edit/lead-edit.component';
import { RenameDocComponent } from '@components/lead/rename-doc/rename-doc.component';
import { DateTimePickerComponent } from '@components/lead/date-time-picker/date-time-picker.component';
import { CalendarModule, DateAdapter, MOMENT } from 'angular-calendar';
import { LeadCalenderComponent } from '@components/lead/lead-calender/lead-calender.component';
import { adapterFactory } from 'angular-calendar/date-adapters/date-fns';
import { LeadPricingComponent } from '@components/lead/lead-pricing/lead-pricing.component';
import { LeadCreateLenderOfferComponent } from '@components/lead/lead-create-lender-offer/lead-create-lender-offer.component';
import { SendEmailComponent } from '@components/lead/send-email/send-email.component';
import { WelcomeCallComponent } from '@components/lead/welcome-call/welcome-call.component';
import { SignaturePadComponents } from '@components/signature-pad/signature-pad.component';
import { CustomerLeadUpdateComponent } from '@components/lead/customer-lead-update/customer-lead-update.component';
import { LeadNotesComponent } from '@components/lead/lead-notes/lead-notes.component';
import { DocumentsListComponent } from '@components/documents/documents-list/documents-list.component';
import { FileSizePipe } from '@pipe/file-size.pipe';
import { TextReplacement } from '@pipe/text-replacenment.pipe';
import { LeadSubmissionComponent } from '@components/lead/lead-submission/lead-submission.component';
import { CreatingContractComponent } from '@components/lead/creating-contract/creating-contract.component';
import { FundDetailsComponent } from '@components/lead/fund-details/fund-details.component';
import { DeclineLeadComponent } from '@components/lead/decline-lead/decline-lead.component';
import { WithdrawDealComponent } from '@components/lead/withdraw-deal/withdraw-deal.component';
import { ReportsComponent } from '@components/reports/reports.component';
import { LoginLogsReportsComponent } from '@components/login-logs-reports/login-logs-reports.component';
import { LeadSourceReportsComponent } from '@components/lead-source-reports/lead-source-reports.component';
import { SubmissionReportsComponent } from '@components/submission-reports/submission-reports.component';
import { UnderwriterReportsComponent } from '@components/underwriter-reports/underwriter-reports.component';
import { EmailLogsReportComponent } from '@components/email-logs-report/email-logs-report.component';
import { OfferReportComponent } from '@components/offer-report/offer-report.component';
import { CKEditorModule } from 'ng2-ckeditor';
import { LeadFcsDetailComponent } from '@components/lead/lead-fcs-detail/lead-fcs-detail.component';
import { FinalUnderwritingComponent } from '@components/lead/final-underwriting/final-underwriting.component';
import { InterviewsComponent } from '@components/lead/interviews/interviews.component';
import { AddActivityComponent } from '@components/lead/add-activity/add-activity.component';
import { LeadInterviewUrlsComponent } from '@components/lead/lead-interview-urls/lead-interview-urls.component';
import { AddEditBankInformationComponent } from '@components/lead/add-edit-bank-information/add-edit-bank-information.component';
import { AddEmailTemplateComponent } from '@components/lead/add-email-template/add-email-template.component';
import { LenderListComponent } from '@components/lender-list/lender-list.component';
import { CreateLenderComponent } from '@components/create-lender/create-lender.component';
import { ViewEditLenderComponent } from '@components/view-edit-lender/view-edit-lender.component';
import { SendGridCredentialsComponent } from '@components/send-grid-credentials/send-grid-credentials.component';
import { AngularSignaturePadModule } from '@almothafar/angular-signature-pad';
import { SendEmailAndAppComponent } from '@components/lead/send-email-and-app/send-email-and-app.component';
import { LeadSendSmsComponent } from '@components/lead/lead-send-sms/lead-send-sms.component';
import { EditSubmissionThanksComponent } from '@components/edit-submission-thanks/edit-submission-thanks.component';
// import { TeamListComponent } from '@components/team-list/team-list.component';
// import { CreateTeamComponent } from '@components/create-team/create-team.component';
// import { ViewEditTeamComponent } from '@components/view-edit-team/view-edit-team.component';
import { ProposeSubmissionComponent } from '@components/lead/propose-submission/propose-submission.component';
import { AddCommissionComponent } from '@components/lead/add-commission/add-commission.component';
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
import { PullThroughRatioReportComponent } from '@components/pull-through-ratio-report/pull-through-ratio-report.component';
import { SmsScheduleReportComponent } from '@components/sms-schedule-report/sms-schedule-report.component';
import { ProfitLossReportComponent } from '@components/profit-loss-report/profit-loss-report.component';
import { SourcePayrollReportComponent } from '@components/source-payroll-report/source-payroll-report.component';
import { LeadSubmissionReportComponent } from '@components/lead-submission-report/lead-submission-report.component';
import { AnalyticsReportComponent } from '@components/analytics-report/analytics-report.component';
import { LenderOweReportComponent } from '@components/lender-owe-report/lender-owe-report.component';
import { NgChartsModule } from 'ng2-charts';
import { LeadCreateLenderOfferListComponent } from '@components/lead/lead-create-lender-offer-list/lead-create-lender-offer-list.component';
import { ViewEditLenderCreateOfferComponent } from '@components/lead/view-edit-lender-create-offer/view-edit-lender-create-offer.component';
import { AllDetailLeadComponent } from '@components/all-detail-lead/all-detail-lead.component';
import { LeadPrefundComponent } from '@components/lead/lead-prefund/lead-prefund.component';
import { LenderOfferContentComponent } from '@components/lender-offer-content/lender-offer-content.component';
import { LoginIpModalComponent } from '@components/login-ip-modal/login-ip-modal.component';
import { RelatedDealsComponent } from '@components/lead/related-deals/related-deals.component';
import { ReportDescriptionEditComponent } from '@components/report-description-edit/report-description-edit.component';
import { AngularEditorModule } from '@kolkov/angular-editor';
import { EmailTemplateListComponent } from '@components/email-template-list/email-template-list.component';
import { PayrollListComponent } from '@components/payroll-list/payroll-list.component';
import { DripCampaignComponent } from '@components/drip-campaign/drip-campaign.component';
import { SearchPipe } from '@pipe/search.pipe';
import { ViewDripCampaignComponent } from '@components/view-drip-campaign/view-drip-campaign.component';
import { EmailStaticsComponent } from '@components/email-statics/email-statics.component';
import { DndModule } from 'ngx-drag-drop';
import { CreateListComponent } from '@components/create-list/create-list.component';
import { ListingListComponent } from '@components/listing-list/listing-list.component';
import { LeadOverviewComponent } from '@components/lead/lead-overview/lead-overview.component';
import { ViewEditListComponent } from '@components/view-edit-list/view-edit-list.component';
import { FundingRecordListComponent } from '@components/funding-record-list/funding-record-list.component';
import { CreateListNameComponent } from '@components/create-list-name/create-list-name.component';
import { AgentListComponent } from '@components/agent-list/agent-list.component';
import { CreateAgentComponent } from '@components/create-agent/create-agent.component';
import { ViewEditAgentComponent } from '@components/view-edit-agent/view-edit-agent.component';
import { SystemNotificationsListComponent } from '@components/system-notifications-list/system-notifications-list.component';
import { AddSystemNotificationsComponent } from '@components/add-system-notifications/add-system-notifications.component';
import { ViewEditSystemNotificationsComponent } from '@components/view-edit-system-notifications/view-edit-system-notifications.component';
import { GooglePlaceModule } from 'ngx-google-places-autocomplete';
import { AgmCoreModule } from '@agm/core';
import { DashboardCardsComponent } from '@components/dashboard-cards/dashboard-cards.component';
import { LeadSourceListingComponent } from '@components/lead-source-listing/lead-source-listing.component';
import { ManageDashbaordComponent } from '@components/manage-dashbaord/manage-dashbaord.component';
import { SelectEmailTemplatesComponent } from '@components/select-email-templates/select-email-templates.component';
import { LeadStatusListingComponent } from '@components/lead-status-listing/lead-status-listing.component';
import { Owner2SignaturePadComponent } from '@components/owner2-signature-pad/owner2-signature-pad.component';
import { BusinessTypeListingComponent } from '@components/business-type-listing/business-type-listing.component';
import { AddLeadSourceComponent } from '@components/add-lead-source/add-lead-source.component';
import { ViewEditLeadSourceComponent } from '@components/view-edit-lead-source/view-edit-lead-source.component';
import { MoneyThumbFcsComponent } from '@components/money-thumb-fcs/money-thumb-fcs.component';


@NgModule({
  imports: [
    DndModule,
    ReactiveFormsModule,
    NgbModule,
    CKEditorModule,
    FormsModule,
    NgxUiLoaderModule,
    ToastrModule,
    NgxPaginationModule,
    SweetAlert2Module,
    CommonModule,
    RouterModule,
    NgxMaskModule.forRoot(),
    NgSelectModule,
    CalendarModule.forRoot({
      provide: DateAdapter,
      useFactory: adapterFactory,
    }),
    AngularSignaturePadModule,
    NgChartsModule,
    AngularEditorModule,
    GooglePlaceModule,
    AgmCoreModule.forRoot({
      apiKey: 'AIzaSyAVi72zWS5TE912KQJO-hqDY-X-W7H_8R0',
      libraries: ['places']
    }),
    NgxUiLoaderModule
  ],

  declarations: [
    SearchPipe,
    TextReplacement,
    ProposeSubmissionComponent,
    FinalUnderwritingComponent,
    InterviewsComponent,
    HeaderComponent,
    EditProfileComponent,
    ChangePasswordComponent,
    AccessDeniedComponent,
    ComingSoonComponent,
    CreateLeadComponent,
    LeadDetailComponent,
    LeadsListComponent,
    LeadUpdatesComponent,
    LeadActivitiesComponent,
    LeadDocumentsComponent,
    LeadFcsComponent,
    LeadEditComponent,
    RenameDocComponent,
    DateTimePickerComponent,
    LeadCalenderComponent,
    LeadPricingComponent,
    LeadCreateLenderOfferComponent,
    SendEmailComponent,
    WelcomeCallComponent,
    LeadInterviewUrlsComponent,
    SignaturePadComponents,
    LeadNotesComponent,
    DocumentsListComponent,
    FileSizePipe,
    LeadSubmissionComponent,
    CreatingContractComponent,
    FundDetailsComponent,
    DeclineLeadComponent,
    WithdrawDealComponent,
    ReportsComponent,
    LoginLogsReportsComponent,
    LeadSourceReportsComponent,
    SubmissionReportsComponent,
    UnderwriterReportsComponent,
    EmailLogsReportComponent,
    OfferReportComponent,
    FundingReportComponent,
    LeadFcsDetailComponent,
    AddActivityComponent,
    AddEditBankInformationComponent,
    AddEmailTemplateComponent,
    EmailStaticsComponent,
    LenderListComponent,
    CreateLenderComponent,
    ViewEditLenderComponent,
    SendGridCredentialsComponent,
    SendEmailAndAppComponent,
    LeadSendSmsComponent,
    CustomerLeadUpdateComponent,
    EditSubmissionThanksComponent,
    AddCommissionComponent,
    FundedReportComponent,
    PreFundingReportComponent,
    DailyLeadProgressReportComponent,
    LenderReportComponent,
    UpdatesLogsReportComponent,
    IsoPaymentReportComponent,
    CallLogsReportComponent,
    PaymentHistoryReportComponent,
    SmsMarketingReportComponent,
    PullThroughRatioReportComponent,
    SmsScheduleReportComponent,
    ProfitLossReportComponent,
    SourcePayrollReportComponent,
    LeadSubmissionReportComponent,
    AnalyticsReportComponent,
    LenderOweReportComponent,
    LeadCreateLenderOfferListComponent,
    ViewEditLenderCreateOfferComponent,
    AllDetailLeadComponent,
    LeadPrefundComponent,
    LenderOfferContentComponent,
    LoginIpModalComponent,
    RelatedDealsComponent,
    ReportDescriptionEditComponent,
    EmailTemplateListComponent,
    PayrollListComponent,
    DripCampaignComponent,
    ViewDripCampaignComponent,
    CreateListComponent,
    ListingListComponent,
    LeadOverviewComponent,
    ViewEditListComponent,
    FundingRecordListComponent,
    CreateListNameComponent,
    AgentListComponent,
    CreateAgentComponent,
    ViewEditAgentComponent,
    SystemNotificationsListComponent,
    AddSystemNotificationsComponent,
    ViewEditSystemNotificationsComponent,
    DashboardCardsComponent,
    LeadSourceListingComponent,
    ManageDashbaordComponent,
    SelectEmailTemplatesComponent,
    LeadStatusListingComponent,
    Owner2SignaturePadComponent,
    BusinessTypeListingComponent,
    AddLeadSourceComponent,
    ViewEditLeadSourceComponent,
    MoneyThumbFcsComponent


    // TeamListComponent,
    // CreateTeamComponent,
    // ViewEditTeamComponent
  ],
  exports: [
    ReactiveFormsModule,
    NgbModule,
    FormsModule,
    NgxUiLoaderModule,
    ToastrModule,
    NgxPaginationModule,
    SweetAlert2Module,
    HeaderComponent,
    EditProfileComponent,
    ChangePasswordComponent,
    CommonModule,
    RouterModule,
    NgxMaskModule,
    NgSelectModule,
    AccessDeniedComponent,
    ComingSoonComponent,
    CreateLeadComponent,
    LeadDetailComponent,
    LeadsListComponent,
    LeadUpdatesComponent,
    LeadActivitiesComponent,
    LeadDocumentsComponent,
    LeadFcsComponent,
    LeadEditComponent,
    RenameDocComponent,
    DateTimePickerComponent,
    CalendarModule,
    LeadCalenderComponent,
    LeadPricingComponent,
    LeadCreateLenderOfferComponent,
    SendEmailComponent,
    WelcomeCallComponent,
    LeadInterviewUrlsComponent,
    AngularSignaturePadModule,
    LeadNotesComponent,
    DocumentsListComponent,
    FileSizePipe,
    LeadSubmissionComponent,
    CreatingContractComponent,
    FundDetailsComponent,
    DeclineLeadComponent,
    WithdrawDealComponent,
    ReportsComponent,
    LoginLogsReportsComponent,
    LeadSourceReportsComponent,
    SubmissionReportsComponent,
    UnderwriterReportsComponent,
    EmailLogsReportComponent,
    OfferReportComponent,
    FundingReportComponent,
    LeadFcsDetailComponent,
    FinalUnderwritingComponent,
    InterviewsComponent,
    AddActivityComponent,
    AddEditBankInformationComponent,
    AddEmailTemplateComponent,
    EmailStaticsComponent,
    LenderListComponent,
    CreateLenderComponent,
    ViewEditLenderComponent,
    SendGridCredentialsComponent,
    SendEmailAndAppComponent,
    LeadSendSmsComponent,
    CustomerLeadUpdateComponent,
    EditSubmissionThanksComponent,
    AddCommissionComponent,
    FundedReportComponent,
    PreFundingReportComponent,
    DailyLeadProgressReportComponent,
    LenderReportComponent,
    UpdatesLogsReportComponent,
    IsoPaymentReportComponent,
    CallLogsReportComponent,
    PaymentHistoryReportComponent,
    SmsMarketingReportComponent,
    PullThroughRatioReportComponent,
    SmsScheduleReportComponent,
    ProfitLossReportComponent,
    SourcePayrollReportComponent,
    LeadSubmissionReportComponent,
    AnalyticsReportComponent,
    LenderOweReportComponent,
    LeadCreateLenderOfferListComponent,
    ViewEditLenderCreateOfferComponent,
    AllDetailLeadComponent,
    LeadPrefundComponent,
    LenderOfferContentComponent,
    LoginIpModalComponent,
    RelatedDealsComponent,
    ReportDescriptionEditComponent,
    EmailTemplateListComponent,
    // TeamListComponent,
    // CreateTeamComponent,
    // ViewEditTeamComponent,
    ProposeSubmissionComponent,
    DripCampaignComponent,
    NgChartsModule,
    AngularEditorModule,
    TextReplacement,
    PayrollListComponent,
    SearchPipe,
    ViewDripCampaignComponent,
    CreateListComponent,
    ListingListComponent,
    ViewEditListComponent,
    LeadOverviewComponent,
    FundingRecordListComponent,
    CreateListNameComponent,
    SystemNotificationsListComponent,
    AddSystemNotificationsComponent,
    ViewEditSystemNotificationsComponent,
    DashboardCardsComponent,
    NgxUiLoaderModule,
    GooglePlaceModule,
    LeadSourceListingComponent,
    ManageDashbaordComponent,
    SelectEmailTemplatesComponent,
    LeadStatusListingComponent,
    Owner2SignaturePadComponent,
    BusinessTypeListingComponent,
    AddLeadSourceComponent,
    ViewEditLeadSourceComponent,
    MoneyThumbFcsComponent
  ],
  providers: [ExcelService],
})
export class SharedModule {
  static forRoot(): ModuleWithProviders<SharedModule> {
    return {
      ngModule: SharedModule,
    };
  }
}
