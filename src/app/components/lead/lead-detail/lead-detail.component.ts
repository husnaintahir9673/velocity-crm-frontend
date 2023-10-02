import { Component, ElementRef, OnDestroy, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { API_PATH } from '@constants/api-end-points';
import { Custom_Regex, Mask, Roles } from '@constants/constants';
import { NgbAccordion, NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { ApiService } from '@services/api.service';
import { AuthService } from '@services/auth.service';
import { CommonService } from '@services/common.service';
import { lastValueFrom, Subscription } from 'rxjs';
import swal from 'sweetalert2';
import * as Constants from '@constants/constants';
import Swal from 'sweetalert2';
import moment from 'moment';
import { LeadDocumentsComponent } from '../lead-documents/lead-documents.component';

@Component({
    selector: 'app-lead-detail',
    templateUrl: './lead-detail.component.html',
    styleUrls: ['./lead-detail.component.scss']
})
export class LeadDetailComponent implements OnInit, OnDestroy {
    subsc!: Subscription;
    leadID: string = '';
    activeTab: string = '';
    lead: any = {};
    role = Roles;
    userRole: string = '';
    modal!: NgbModalRef;
    sendSmsmodal!: NgbModalRef;
    notes: any[] = [];
    bussinessInfoForm!: FormGroup;
    declineForm!:FormGroup;
    expCreditScore: any = {};
    statesList: any[] = [];
    mask = Mask;
    @ViewChild('acc', { static: false }) accordion!: NgbAccordion;
    @ViewChild('accord', { static: false }) accord!: NgbAccordion;
    @ViewChild('crmaccord', { static: false }) crmaccord!: NgbAccordion;
    @ViewChild('sendSubmiision', { static: false }) sendSubmiision!: NgbAccordion;
    @ViewChild('relatedacc', { static: false }) relatedacc!: NgbAccordion;
    @ViewChild('notesacc', { static: false }) notesacc!: NgbAccordion;
    @ViewChild('lenderacc', { static: false }) lenderacc!: NgbAccordion;
    isLeadDeclined: boolean = true;
    isLeadWithdrawn: boolean = true;
    isaddCommission: boolean = true;
    canDeclineLead: boolean = false;
    canWithdrawLead: boolean = false;
    canCreateContract: boolean = false;
    canSendSubmission: boolean = false;
    canSearchDataMerch: boolean = false;
    canCreateApplication: boolean = false;
    canGetExCreditScore: boolean = false;
    canGetExBussScore: boolean = false;
    canFU: boolean = false;
    canTakeInterview: boolean = false;
    canCreateLenderOffer: boolean = false;
    canViewLeadUpdate: boolean = false;
    canActivityList: boolean = false;
    canListNotes: boolean = false;
    canViewCalendar: boolean = false;
    canPreviewFCS: boolean = false;
    canSaveFCS: boolean = false;
    canListDocuments: boolean = false;
    canTakeWelcomeCall: boolean = false;
    canViewFundDetails: boolean = false;
    canEditLead: boolean = false;
    cantakeMerchantInterview: boolean = false;
    cantakeLandlordInterview: boolean = false;
    canViewBankDetails: boolean = false;
    interviewDocuments: Array<any> = [];
    lanloardUrl: string = '';
    merchantUrl: string = '';
    canViewLead: boolean = false;
    roles = Constants.Roles;
    downloadWithIpCheckbox: boolean = false;
    canViewSendAppEmail: boolean = false;
    canViewSignedApplication: boolean = false;
    canViewNotifyToSubmissions: boolean = false;
    canViewSendSms: boolean = false;
    canViewPurposeSubmission: boolean = false;
    lendersList: Array<any> = [];
    showPaperPlane: boolean = false;
    canAddCommission: boolean = false;
    canfundRecord: boolean = false;
    canViewLenderOffers: boolean = false;
    canViewRelatedDeals: boolean = false;
    dateFormat: string = '';
    timeZone: string = '';
    page: number = 1;
    limit: number = 10;
    total: number = 0;
    hasMoreUsers: boolean = false;
    relatedDealsList: Array<any> = [];
    leadSourceList: Array<any> = [];
    leadStatusList: Array<any> = [];
    LeadStatus: string = '';
    LeadSource: string = '';
    style!: { fill: string; };
    background!: { background: string; };
    colorSubs!: Subscription;
    color!: string;
    checkBoxColor: boolean = false;
    @ViewChild('rejectOffer') rejectOffer!: ElementRef;
    lenderID:string=''
    @ViewChild(LeadDocumentsComponent) child!: LeadDocumentsComponent;


    constructor(
        private route: ActivatedRoute,
        private commonService: CommonService,
        private apiService: ApiService,
        private authService: AuthService,
        private modalService: NgbModal,
        private fb: FormBuilder,
        private router: Router
    ) { }

    ngOnInit(): void {
        this.permissionsUpdate();
        this.getUserDetails();
        let params = this.route.snapshot.params;
        if (params && params['id']) {
            this.leadID = params['id'];
            this.getLeadDetailsList();
            this.getlendersList();
            this.getLeadOptions();

        } else {
            this.commonService.showError('');
        }
        this.getRelatedDealsList();
        if (this.canListDocuments) {
            this.activeTab = 'Documents'
        } else if (this.canViewLeadUpdate) {
            this.activeTab = 'Updates'
        } else if (this.canActivityList) {
            this.activeTab = 'activities'
        } else if (this.canListDocuments) {
            this.activeTab = 'Documents'
        } else if (this.canViewCalendar) {
            this.activeTab = 'Calender'
        } else if (this.canListNotes) {
            this.activeTab = 'Notes'
        } else if (this.canSaveFCS) {
            this.activeTab = 'FCS'
        } else if (this.canPreviewFCS) {
            this.activeTab = 'Fcs Details'
        } else if (this.canSendSubmission) {
            this.activeTab = 'Send Submission'
        } else if (this.cantakeMerchantInterview || this.cantakeLandlordInterview) {
            this.activeTab = 'InterviewURLS'
        } else if (this.canViewBankDetails) {
            this.activeTab = 'Bank Information'
        }else if (this.canViewLenderOffers) {
            this.activeTab = 'Lender Offers'
        }
        this.subsc = this.route.queryParams.subscribe((val: any) => {
            if (val.activeTab) {
                this.activeTab = val.activeTab;       

            }
        });
    }

    sendEmail(email: any) {
        localStorage.setItem('sendAppEmail', email);
        this.router.navigate([`/${this.userBaseRoute}/send-email-app/` + this.leadID]);
    }
    async getlendersList() {
        try {
            const res$ = this.apiService.postReq(API_PATH.SUBMITTED_DEALS_LENDER_LIST, { lead_id: this.leadID }, 'propose', 'submission');
            let response = await lastValueFrom(res$);
            if (response && response.status_code == "200") {
                this.lendersList = response.data;
                this.lendersList.forEach(object => {
                    object.toggle = false
                });
                for (let i = 0; i < this.lendersList.length; i++) {
                    if (this.lendersList[i].status == 1 || this.lendersList[i].status == 3) {
                        this.lendersList[i].toggle = true;
                    } else {
                        this.lendersList[i].toggle = false;
                    }
                }


            } else {
                this.commonService.showError(response.message);
            }
            this.commonService.hideSpinner();
        } catch (error: any) {
            this.commonService.hideSpinner();
            this.commonService.showErrorMessage(error);
        }
    }

    /**
     * @alias FU Final underwriting
     */
    permissionsUpdate() {
        this.canViewLead = this.authService.hasPermission('lead-view');
        this.canEditLead = this.authService.hasPermission('lead-edit');
        this.cantakeMerchantInterview = this.authService.hasPermission('lead-merchant-interview');
        this.cantakeLandlordInterview = this.authService.hasPermission('lead-landlord-interview');
        this.canDeclineLead = this.authService.hasPermission('lead-decline');
        this.canActivityList = this.authService.hasPermission('lead-activity-list');
        this.canListNotes = this.authService.hasPermission('lead-note-list');
        this.canViewCalendar = this.authService.hasPermission('lead-calendar-list');
        this.canPreviewFCS = this.authService.hasPermission('fcs-preview');
        this.canSaveFCS = this.authService.hasPermission('fcs-save');
        this.canListDocuments = this.authService.hasPermission('lead-document-list');
        this.canTakeWelcomeCall = this.authService.hasPermission('lead-welcome-call');
        this.canWithdrawLead = this.authService.hasPermission('lead-withdraw');
        this.canCreateContract = this.authService.hasPermission('lead-contract');
        this.canSendSubmission = this.authService.hasPermission('lead-submission');
        this.canSearchDataMerch = this.authService.hasPermission('data-merch-search');
        this.canCreateApplication = this.authService.hasPermission('lead-create-application');
        this.canGetExCreditScore = this.authService.hasPermission('credit-score');
        this.canGetExBussScore = this.authService.hasPermission('business-score');
        this.canFU = this.authService.hasPermission('lead-final-underwriting');
        this.canTakeInterview = this.authService.hasPermission('lead-landlord-interview');
        this.canCreateLenderOffer = this.authService.hasPermission('lender-offer-create');
        this.canViewLeadUpdate = this.authService.hasPermission('lead-updates');
        this.canViewFundDetails = this.authService.hasPermission('participant-create');
        this.canViewBankDetails = this.authService.hasPermission('bank-detail-view');
        this.canViewSendAppEmail = this.authService.hasPermission('send-app-and-email');
        this.canViewSignedApplication = this.authService.hasPermission('signed-application');
        this.canViewNotifyToSubmissions = this.authService.hasPermission('notify-to-submissions');
        this.canViewSendSms = this.authService.hasPermission('send-sms');
        this.canViewPurposeSubmission = this.authService.hasPermission('propose-submission');
        this.canAddCommission = this.authService.hasPermission('add-commission');
        this.canfundRecord = this.authService.hasPermission('lead-fund-record');
        this.canViewLenderOffers = this.authService.hasPermission('lender-offer-list');
        this.canViewRelatedDeals = this.authService.hasPermission('related-deals');


    }
    async getLeadOptions() {
        try {
            let url = '';
            if(this.userRole == Roles.ADMINISTRATOR){
                url = `?lead_id=${this.leadID}`;
            }
              this.commonService.showSpinner();
            const res$ = this.apiService.getReq(API_PATH.LEAD_OPTIONS_LIST + url, '', '');
            let response = await lastValueFrom(res$);
            if (response && response.data) {
                this.leadSourceList = response.data.lead_source;
                this.leadSourceList.sort((a, b) => a.name.localeCompare(b.name))
                this.leadStatusList = response.data.status;
                this.leadStatusList.sort((a, b) => a.name.localeCompare(b.name))
            }
            this.commonService.hideSpinner();
        } catch (error: any) {
            this.commonService.hideSpinner();
            if (error.error && error.error.message) {
                this.commonService.showError(error.error.message);
            } else {
                this.commonService.showError(error.message);
            }
        }
    }
    async getRelatedDealsList() {
        try {
            let url = `?&page_limit=${this.limit}&page=${this.page}&lead_id=${this.leadID}`;
            this.commonService.showSpinner();
            let res$ = this.apiService.getReq(API_PATH.RELATED_DEALS + url, 'related', 'deals');
            let response = await lastValueFrom(res$);
            if (response && response.status_code == 200) {
                if (response.data.data) {
                    this.relatedDealsList = response.data.data;
                    this.total = response.data.total
                } else {
                    this.relatedDealsList = [];
                    this.total = 0;
                    this.page = 1;
                }
            }
            this.commonService.hideSpinner();
        } catch (error: any) {
            this.commonService.hideSpinner();
            if (error.error && error.error.message) {
                this.commonService.showError(error.error.message);
            } else {
                this.commonService.showError(error.message);
            }
        }
    }

    /**
     * @description on page change
     * @returns {void}
     * @param p 
     */
    onPageChange(p: number): void {
        this.page = p;
        this.getRelatedDealsList();
    }



    ngOnDestroy() {
        if (this.subsc) {
            this.subsc.unsubscribe();
        }
    }

    /**
  * @description get user details from localstrorage
  * @author Shine Dezign Infonet Pvt. Ltd.
  * @returns {void}
  */
    getUserDetails(): void {
        try {
            let ud = this.authService.getUserDetails();
            if (ud) {
                this.userRole = ud.role;
                this.dateFormat = ud.date_format;
                this.timeZone = ud.time_zone;
                this.getColorOnUpdate();
                this.style = { fill: ud?.color };
                this.color = ud?.color;
                // this.stroke={stroke:ud?.color};

                this.background = { background: ud?.color };


            }
        } catch (error: any) {
            this.commonService.showError(error.message);
        }
    }
    getColorOnUpdate() {
        this.colorSubs = this.authService.getColor().subscribe((u) => {
            this.getUserDetails();
        });
    }
    getDate(date: any) {
        return moment(date).tz(this.timeZone).format(`${this.dateFormat} hh:mm:ss A`)

    }

    async changeLeadStatus(id: string) {
        try {
            this.commonService.showSpinner();
            const res$ = this.apiService.postReq(API_PATH.LEAD_DETAIL_LEAD_STATUS_UPDATE, { lead_id: this.leadID, lead_status: this.LeadStatus }, 'lead', 'updates');
            const response = await lastValueFrom(res$);
            if (response && response.status_code == "200") {
                this.commonService.showSuccess(response.message);
                this.getLeadDetailsList();
            }
            this.commonService.hideSpinner();
        } catch (error: any) {
            this.commonService.hideSpinner();
            this.commonService.showErrorMessage(error);
        }
    }
    async changeLeadSource(id: string) {
        try {
            this.commonService.showSpinner();
            const res$ = this.apiService.postReq(API_PATH.LEAD_DETAIL_LEAD_SOURCE_UPDATE, { lead_id: this.leadID, lead_source: this.LeadSource }, 'lead', 'updates');
            const response = await lastValueFrom(res$);
            if (response && response.status_code == "200") {
                this.commonService.showSuccess(response.message);
                //   this.getLeadDetailsList();
            }
            this.commonService.hideSpinner();
        } catch (error: any) {
            this.commonService.hideSpinner();
            this.commonService.showErrorMessage(error);
        }
    }

    async getLeadDetailsList() {
        try {
            this.commonService.showSpinner();
            const res$ = this.apiService.getReq(API_PATH.LEAD_DETAILS + this.leadID, 'lead', 'view');
            let response = await lastValueFrom(res$);
            if (response && response.data) {
                this.lead = response.data;
                this.LeadStatus = response.data?.lead_status_id;
                this.LeadSource = response.data?.lead_source_id;
                this.merchantUrl = response.data.merchant_interview_room;
                this.lanloardUrl = response.data.landlord_interview_room;
                this.interviewDocuments = response.data.interview_documents;
                this.isLeadDeclined = this.lead.is_lead_declined ? true : false;
                if (response.data.lead_status == 'Submitted') {
                    this.getlendersList();
                }
            }
            this.commonService.hideSpinner();
        } catch (error: any) {
            this.commonService.hideSpinner();
            this.commonService.showErrorMessage(error);
        }
    }
    check(name: any, lenderID: string) {
        Swal.fire({
            title: 'Are you sure?',
            text: 'Do you want to accept the offer from lender' + ' - ' + name + '?',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Yes',
            confirmButtonColor: "#f0412e",
        }).then((result) => {
            if (result.value) {
                this.updateLenderOfferStatus(lenderID, 2, 1 ,'', 'accept');
                this.getLeadDetailsList();
            } else if (result.dismiss === Swal.DismissReason.cancel) {
                Swal.close()
            }
        })
    }

    /**
     * @description on Click of create application
     */
    async createApplication(): Promise<void> {
        try {
            const res$ = this.apiService.getReq(API_PATH.EXPORT_PDF + `${this.leadID}`, 'lead', 'view');
            const response = await lastValueFrom(res$);
            if (response && response.status_code == "200") {
                window.open(response.data, "_blank");
                //handle response here
                this.child.getDocumentListUpdate();
            }
            this.commonService.hideSpinner();
        } catch (error: any) {
            this.commonService.hideSpinner();
            this.commonService.showErrorMessage(error);
        }
    }
    /**
 * @description on Click of create application
 */
    async signedApplication(): Promise<void> {
        try {
            let withIP = '';
            this.commonService.showSpinner();
            if (this.downloadWithIpCheckbox) {
                withIP = '/with-ip';
            }
            const res$ = this.apiService.getReq(API_PATH.EXPORT_PDF + `${this.leadID}` + `${withIP}`, 'lead', 'view');
            const response = await lastValueFrom(res$);
            if (response && response.status_code == "200") {
                window.open(response.data, "_blank");
                //handle response here
                this.child.getDocumentListUpdate();

            }
            this.commonService.hideSpinner();
        } catch (error: any) {
            this.commonService.hideSpinner();
            this.commonService.showErrorMessage(error);
        }
    }
    toggle(ID: string) {
        setTimeout(() => this.accordion.toggle(ID), 0);
    }
    toggleLeadsummary(ID: string) {
        setTimeout(() => this.accord.toggle(ID), 0);

    }
    toggleRelatedDeals(ID: string) {
        setTimeout(() => this.relatedacc.toggle(ID), 0);
    }
    toggleNotes(ID: string) {
        setTimeout(() => this.notesacc.toggle(ID), 0);
    }
    toggleLender(ID: string) {
        setTimeout(() => this.lenderacc.toggle(ID), 0);
    }
    toggleCrmUtilities(ID: string) {
        setTimeout(() => this.crmaccord.toggle(ID), 0);
    }
    toggleSendsubmission(ID: string) {
        setTimeout(() => this.sendSubmiision.toggle(ID), 0);
    }
    async onNotifySubmission() {
        try {
            this.commonService.showSpinner();
            const res$ = this.apiService.postReq(API_PATH.LEAD_NOTIFY, { lead_id: this.leadID }, 'notify', 'to-submissions');
            const response = await lastValueFrom(res$);
            if (response && response.status_code == "200") {
                this.commonService.showSuccess(response.message);
                this.getLeadDetailsList();
            }
            this.commonService.hideSpinner();
        } catch (error: any) {
            this.commonService.hideSpinner();
            this.commonService.showErrorMessage(error);
        }
    }

    /**
     * @description check data merch
     */
    checkDataMerchPopup(templateRef: TemplateRef<any>) {
        swal.fire({
            title: 'Data will be verified by data merch',
            imageUrl: './assets/images/data-merch.png',
            imageHeight: 40,
            confirmButtonText: 'Ok',
            confirmButtonColor: "#f0412e",
            showCancelButton: true,
            backdrop: true,
            allowOutsideClick: false,
        }).then((result) => {
            if (result.value) {
                this.checkDataMerch(templateRef);
            }
        })

    }
    async checkDataMerch(templateRef: TemplateRef<any>) {
        try {

            this.commonService.showSpinner();
            const res$ = this.apiService.postReq(API_PATH.DATA_MERCH, { lead_id: this.leadID }, 'lead', 'view');
            const response = await lastValueFrom(res$);
            if (response && response.status_code == "200") {
                this.notes = response.data.notes;
                if (this.notes && this.notes.length) {
                    this.openModal(templateRef);
                } else {
                    this.commonService.showError('No records found.');
                }

            } else {
                this.commonService.showError(response.message)
            }
            this.commonService.hideSpinner();


        } catch (error: any) {
            this.commonService.hideSpinner();
            this.commonService.showErrorMessage(error);
        }
    }

    checkExperianCreditPopup(templateRef: TemplateRef<any>) {
        swal.fire({
            title: 'Data will be verified by experian credit report',
            imageUrl: './assets/images/Experian_logo.svg',
            imageHeight: 100,
            confirmButtonText: 'Ok',
            confirmButtonColor: "#f0412e",
            showCancelButton: true,
            backdrop: true,
            allowOutsideClick: false,
        }).then((result) => {
            if (result.value) {
                this.experianCreditScore(templateRef);
            }
        })

    }
    async experianCreditScore(templateRef: TemplateRef<any>) {
        try {

            this.commonService.showSpinner();
            const res$ = this.apiService.postReq(API_PATH.EXPERIAN_CREDIT_SCORE, { lead_id: this.leadID }, 'lead', 'view');
            const response = await lastValueFrom(res$);
            if (response && response.status_code == "200") {
                this.expCreditScore = response.data;
                if (this.expCreditScore && (this.expCreditScore.commercialScore || this.expCreditScore.fsrScore)) {
                    this.openModal(templateRef);
                } else {
                    this.commonService.showError('No score found.');
                }
            } else {
                this.commonService.showError(response.message)
            }
            this.commonService.hideSpinner();

        } catch (error) {
            this.commonService.hideSpinner();
            this.commonService.showErrorMessage(error);
        }
    }

    /**
     * @description init officer form
     */
    initExperianBussForm() {
        this.bussinessInfoForm = this.fb.group({
            scoreType: [['commercialScore', 'fsrScore'], [Validators.required]],
            leadName: [`${this.lead.first_name} ${this.lead.last_name}`, [Validators.pattern(Custom_Regex.spaces), Validators.maxLength(100), Validators.minLength(3)]],
            address: [this.lead?.lead_address, [Validators.pattern(Custom_Regex.address), Validators.pattern(Custom_Regex.address2), Validators.maxLength(200), Validators.minLength(3)]],
            address2: [this.lead?.lead_other_address, [Validators.pattern(Custom_Regex.address), Validators.pattern(Custom_Regex.address2), Validators.maxLength(200), Validators.minLength(3)]],
            state: [this.lead.encrypted_state_id, [Validators.required]],
            city: [this.lead?.lead_city, [Validators.required, Validators.pattern(Custom_Regex.spaces), Validators.pattern(Custom_Regex.city), Validators.pattern(Custom_Regex.name), Validators.minLength(3)]],
            zip: [this.lead?.lead_zip, [Validators.pattern(Custom_Regex.digitsOnly),]],
            federalTaxId: [this.lead?.lead_federal_tax_id, [Validators.pattern(Custom_Regex.spaces)]],
            phone: [this.lead?.phone_number, [Validators.required]]
        })
    }

    /**
    * @description get lead detail form controls
    */
    get bif(): { [key: string]: AbstractControl } {
        return this.bussinessInfoForm.controls;
    }


    async experianBussReport(templateRef: TemplateRef<any>) {
        this.getStates(this.lead.encrypted_country_id);
        this.initExperianBussForm();
        this.openModal(templateRef);
    }
    checkExperianBussinessPopup(templateRef: TemplateRef<any>) {
        swal.fire({
            title: 'Data will be verified by experian bussiness score',
            imageUrl: './assets/images/Experian_logo.svg',
            imageHeight: 100,
            confirmButtonText: 'Ok',
            confirmButtonColor: "#f0412e",
            showCancelButton: true,
            backdrop: true,
            allowOutsideClick: false,
        }).then((result) => {
            if (result.value) {
                this.experianBussSubmit(templateRef);
            }
        })

    }
    async experianBussSubmit(templateRef: TemplateRef<any>) {
        try {
            this.bussinessInfoForm.markAllAsTouched();
            if (this.bussinessInfoForm.valid) {
                this.commonService.showSpinner();
                let data = {
                    name: this.bussinessInfoForm.value.leadName,
                    city: this.bussinessInfoForm.value.city,
                    state_id: this.bussinessInfoForm.value.state,
                    physical_address_1: this.bussinessInfoForm.value.address,
                    physical_address_2: this.bussinessInfoForm.value.address2,
                    scoreType: this.bussinessInfoForm.value.scoreType,
                    lead_id: this.leadID
                }
                const res$ = this.apiService.postReq(API_PATH.EXPERIAN_BUSS_SCORE, data, 'lead', 'view');
                const response = await lastValueFrom(res$);
                if (response && response.status_code == "200") {
                    this.closeModal();
                    this.expCreditScore = response.data;
                    if (this.expCreditScore && (this.expCreditScore.commercialScore || this.expCreditScore.fsrScore)) {
                        this.openModal(templateRef);
                    } else {
                        this.commonService.showError('No score found.');
                    }

                } else {
                    this.commonService.showError(response.message);
                }
                this.commonService.hideSpinner();
            }

        } catch (error) {
            this.commonService.hideSpinner();
            this.commonService.showErrorMessage(error);
        }
    }


    /**
     * @description get states list
     * @param country_id 
     * @author Shine Dezign Infonet Pvt. Ltd.
     */
    async getStates(country_id: string) {
        try {
            this.commonService.showSpinner();
            const res$ = this.apiService.postReq(API_PATH.STATES, { country_id: country_id }, '', '');
            let response = await lastValueFrom(res$);
            if (response && response.data) {
                this.statesList = response.data;
            }
            this.commonService.hideSpinner();
        } catch (error: any) {
            this.commonService.hideSpinner();
            this.commonService.showErrorMessage(error);
        }
    }
    onchangeIp(event: any) {
        this.downloadWithIpCheckbox = event.target.checked
    }

    onChangeLender(lenderID: any, name: any, input: any, i: any) {
        this.lendersList[i].toggle = true;
        if (!input.checked) {
            this.lendersList[i].toggle = false
        }
        Swal.fire({
            title: 'Are you sure?',
            text: 'Do you recieved the offer from lender' + ' - ' + name + '?',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Yes',
            confirmButtonColor: "#f0412e",
            // cancelButtonText: 'OK'
        }).then((result) => {
            if (result.value) {
                this.updateLenderOfferStatus(lenderID, 1, 1, input, 'accept');
                // this.getLeadDetailsList();
            } else if (result.dismiss === Swal.DismissReason.cancel) {
                Swal.close()
                input.checked = 0;
                // this.checkBoxColor = false;
                this.lendersList[i].toggle = false
            }
        })
    }
    //modal
    openModalDecline(templateRef:any) {
        // this.closeTriggerModal();
        // this.emailTemplateId = id
        try {
            this.modal = this.modalService.open(templateRef, { backdrop: 'static', size: 'md' });
          //   this.inintColorForm();
        } catch (error: any) {
            this.commonService.showError(error.message);
        }
    }
    closeDeclineModal() {
        this.modal.close();
    }
    //
    get f(): { [key: string]: AbstractControl } {
        return this.declineForm.controls;
    }
    initDeclineForm(){
        this.declineForm = this.fb.group({
            reason_note:['',[Validators.required]]
        })
    }
    declineOfferPopup(lenderID:any) {
        Swal.fire({
            title: 'Are you sure?',
            text: 'Do you want to reject the offer?',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Yes',
            confirmButtonColor: "#f0412e",
        }).then(async (result) => {
            if (result.value) {
                this.lenderID = lenderID;
                this.initDeclineForm();
                this.openModalDecline(this.rejectOffer);
            } else if (result.dismiss === Swal.DismissReason.cancel) {
                Swal.close()
                // this.checkBoxColor = false;
            }
        })
    }
    getdeclineUpdate(){
        this.declineForm.markAllAsTouched();
        if(this.declineForm.valid){
            const lenderId = this.lenderID
            this.updateLenderOfferStatus(lenderId, 3, 2, '' ,'decline');
            this.closeModal();
        }
    
        

    }

    /**
     * 
     * @param lenderID 
     * @param status_type 1 for response from lender, 2 for order acceptence for that lender
     * @param status 
     */
    async updateLenderOfferStatus(lenderID: string, status_type: number, status: number, input: any = null, type: any) {
        try {
            this.commonService.showSpinner();
            let  data = {}
            if(type == 'accept'){
                 data = {
                    lead_id: this.leadID,
                    lender_id: lenderID,
                    status_type: status_type,
                    status: status,
                    other_confirmation: status,
                    
                }
            }else{
                data = {
                    lead_id: this.leadID,
                    lender_id: lenderID,
                    status_type: status_type,
                    status: status,
                    other_confirmation: status,
                    decline_reason: this.declineForm.value.reason_note
                    
                }
            }
            const res$ = this.apiService.postReq(API_PATH.UPDATE_LENDER_OFFER_STATUS, data, 'lead', 'submission');
            let response = await lastValueFrom(res$);
            if (response && response.status_code == "200") {
                this.commonService.showSuccess(response.message);
                if(status_type == 3){
                    this.router.navigate([`/${this.userBaseRoute}/lead-detail/` + this.leadID]);
                this.activeTab = 'Lender Offers'
                }else{
                    this.router.navigate([`/${this.userBaseRoute}/lead-detail/` + this.leadID]);
                this.activeTab = 'Documents'
                }

                this.getlendersList();
            } else {
                this.commonService.showError(response.message);
                if (input)
                    input.checked = 0;
            }
            this.commonService.hideSpinner();
        } catch (error) {
            if (input)
                input.checked = 0;
            this.commonService.hideSpinner();
            this.commonService.showErrorMessage(error);
        }
    }

    openModal(templateRef: TemplateRef<any>) {
        
        try {
            this.modal = this.modalService.open(templateRef, { backdrop: 'static', size: 'xl' });
        } catch (error: any) {
            this.commonService.showError(error.message);
        }
    }

    closeModal() {
        this.modal.close();
    }

    declineLeadModal(templateRef: TemplateRef<any>) {
        try {
            this.modal = this.modalService.open(templateRef, { backdrop: 'static' });
        } catch (error) {
            this.commonService.showErrorMessage(error);
        }
    }

    leadDeclined() {
        this.isLeadDeclined = true;
        this.lead.lead_status = 'Declined'
        this.closeModal();
        this.getLeadDetailsList();
    }
    leadDocument() {
        this.lead.lead_status = 'Docs In'
        this.getLeadDetailsList();
    }

    withdrawLead(templateRef: TemplateRef<any>) {
        try {
            this.modal = this.modalService.open(templateRef, { backdrop: 'static' });
        } catch (error: any) {
            this.commonService.showError(error.message);
        }
    }

    leadWithdrawed() {
        this.isLeadWithdrawn = true;
        this.lead.lead_status = 'Withdrawn';
        this.closeModal();
        this.getLeadDetailsList();
    }
    addCommisionLead(templateRef: TemplateRef<any>) {
        try {
            this.modal = this.modalService.open(templateRef, { backdrop: 'static', size: 'xl' });
        } catch (error: any) {
            this.commonService.showError(error.message);
        }
    }

    leadAddcommision() {
        this.isaddCommission = true;
        this.closeModal();
    }

    scrollToTabs(el: HTMLElement, value: any) {
        if(value){
            this.activeTab = value;
        }
        if (el) {
            el.scrollIntoView({ behavior: 'smooth' });
        }
    }


    get userBaseRoute() {
        return this.authService.getUserRole();
    }
    leadDetailsLink(id: any) {
        const url = this.router.serializeUrl(this.router.createUrlTree([`/${this.userBaseRoute}/lead-detail/${id}`]));
        window.open(url, '_blank')
    }
    getUpdateLeadStatus(value:any){
        this.getLeadDetailsList();
    }
}
