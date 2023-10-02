import { Component, ElementRef, EventEmitter, OnInit, Output } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { API_PATH } from '@constants/api-end-points';
import { Custom_Regex } from '@constants/constants';
import { ApiService } from '@services/api.service';
import { AuthService } from '@services/auth.service';
import { CommonService } from '@services/common.service';
import moment from 'moment';
import { lastValueFrom, Subscription } from 'rxjs';

@Component({
    selector: 'app-lead-submission',
    templateUrl: './lead-submission.component.html',
    styleUrls: ['./lead-submission.component.scss'],
})
export class LeadSubmissionComponent implements OnInit {
    basicForm!: FormGroup;
    lenderForm!: FormGroup;
    isBasicForm: boolean = false;
    leadID: string = '';
    docsList: Array<any> = [];
    companyName: string = '';
    lead: any = {};
    userRole: string = '';
    lendersList: any[] = [];
    style!: { fill: string; };
    background!: { background: string; };
    colorSubs!: Subscription;
    color!: string;
    colorCheckbox: boolean = false;
    colorCheckbox2: boolean = false;
    colorCheckbox3: boolean = false;
    documentcheckbox: boolean = false;
    submissionNotesList: Array<any> = [];
    submissionpage: number = 1;
    submissiontotal: number = 0;
    limit: number = 100;
    dateFormat: string = '';
    timeZone: string = '';
    statesList: Array<any> = [];
    @Output() onLeadStatusChanges = new EventEmitter <any> ()
    constructor(
        private fb: FormBuilder,
        private el: ElementRef,
        private commonService: CommonService,
        private apiService: ApiService,
        private route: ActivatedRoute,
        private router: Router,
        private authService: AuthService,
    ) { }

    ngOnInit(): void {
        let params = this.route.snapshot.params;
        if (params && params['id']) {
            this.leadID = params['id'];
            this.getLeadDetails();
        } else {
            this.commonService.showError('');
        }
        this.initBasicForm();
        this.initLenderForm();
        this.getUserDetails();
        this.getDocsAndCompany();
        this.getlendersList();
        this.getSubmissionNotes();
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

    async getLeadDetails() {
        try {
            this.commonService.showSpinner();
            const res$ = this.apiService.getReq(API_PATH.LEAD_DETAILS + this.leadID, 'lead', 'list');
            let response = await lastValueFrom(res$);
            if (response && response.data) {
                this.lead = response.data;
                if (this.lead.is_freeze != 0) {
                    this.lenderForm?.controls['documents'].disable();
                    this.lenderForm?.controls['lenders'].disable();
        
                } else {
                    this.lenderForm?.controls['documents'].enable();
                    this.lenderForm?.controls['lenders'].enable();
        
                }
                // this.lenderForm.patchValue({state_id: this.lead.state_name})
                this.getStates(this.lead.encrypted_country_id);
                if (this.lead.is_lead_submitted) {
                    this.commonService.showError("Lead is already submitted.");
                    this.router.navigate([`/${this.userBaseRoute}/lead-detail/${this.leadID}`]);
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
    async getStates(country_id: string) {
        try {
            const res$ = this.apiService.postReq(API_PATH.STATES, { country_id: country_id }, '', '');
            let response = await lastValueFrom(res$);
            if (response && response.data) {
                this.statesList = response.data;
                setTimeout(() => {
                    this.lenderForm.patchValue({state_id: this.lead.encrypted_state_id})
                })
                
            }
        } catch (error: any) {
            // this.uploading = false;
            this.commonService.hideSpinnerWithId('uploading');
            this.commonService.showErrorMessage(error);
        }
    }
    /**
     * @description initilize lender form
     */
    initLenderForm() {
        this.lenderForm = this.fb.group({
            submission_through: ["SUBMISSION"],
            custom_note: ['', [
                // Validators.pattern(Custom_Regex.spaces), 
                Validators.pattern(Custom_Regex.address),
                Validators.pattern(Custom_Regex.address2),
                Validators.maxLength(1000),
                Validators.minLength(3)
            ]],
            lender_type: ['email'],
            state_id: [''],
            lenders: ['', [Validators.required]],
            documents: [null, [Validators.required]]
        })

        if (this.lenderForm.value.lender_type == 'email') {
            this.colorCheckbox = true;
        } else {
            this.colorCheckbox = false;
        }

    }

    /**
     * @description initilize basic form
     */
    initBasicForm() {
        this.basicForm = this.fb.group({
            credit_score: [null, [Validators.pattern(Custom_Regex.amount)]],
            negative_days: [null, [Validators.pattern(Custom_Regex.amount)]],
            advance: [null, [Validators.pattern(Custom_Regex.amount)]],
            nsfs: [null, [Validators.pattern(Custom_Regex.spaces), Validators.pattern(Custom_Regex.digitsOnly)]],
            time_in_business: [null, [Validators.pattern(Custom_Regex.amount)]],
            amount: [null, [Validators.pattern(Custom_Regex.amount)]],
            deposits: [null, [Validators.pattern(Custom_Regex.amount)]],
            position: [null, [Validators.pattern(Custom_Regex.amount)]],
            term_months: [null, [Validators.pattern(Custom_Regex.amount)]],
            daily_weekly: [""],
            sole_prop: [""],
            consolidation: [""],
            non_profit: [""],
        })
    }
    async getlendersList() {
        try {
            const res$ = this.apiService.postReq(API_PATH.LENDERS_LIST, { lead_id: this.leadID }, 'propose', 'submission');
            let response = await lastValueFrom(res$);
            if (response && response.status_code == "200") {
                this.lendersList = response.data.lenders;
                let array1 = [];
                let arr = [];
                arr = this.lendersList.filter((e: any) => e.is_selected == 1);
                for (let i = 0; i < arr.length; i++) {
                    array1.push(arr[i].id)
                }
                this.lenderForm.patchValue({
                    lenders: array1,
                    custom_note: response.data.note
                })

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
     * @description submit lead submiision  
     */
    async finalSubmission() {
        try {
            this.lenderForm.markAllAsTouched();
            if (this.lenderForm.valid) {
                if (!this.docsList.length) {
                    this.commonService.showError("Please add documents first");
                    return;
                }
                let data = {
                    ...this.basicForm.value,
                    ...this.lenderForm.value,
                    // documents: this.docsList.map(e => (e.document_id)),
                    lead_id: this.leadID
                }
                this.commonService.showSpinner();
                const res$ = this.apiService.postReq(API_PATH.LEAD_SUBMISSION, data, 'lead', 'edit');
                const response = await lastValueFrom(res$);
                if (response && response.status_code == "200") {
                    this.commonService.showSuccess(response.message);
                    this.onLeadStatusChanges.emit('response');
                    this.router.navigate([`/${this.userBaseRoute}/lead-detail/` + this.leadID],
                        // { queryParams: { activeTab: 'Updates' } });
                        { queryParams: { activeTab: 'Send Submission' } });
                    this.getSubmissionNotes();
                    this.initLenderForm()

                } else {
                    this.commonService.showError(response.message);
                }
                this.commonService.hideSpinner();
            }
        } catch (error: any) {
            this.commonService.hideSpinner();
            if (error.error && error.error.message) {
                this.commonService.showError(error.error.message);
            } else {
                this.commonService.showError(error.message);
            }
        }
    }

    get userBaseRoute() {
        return this.authService.getUserRole()
    }

    /**
     * @description get basic form controls
     */
    get f(): { [key: string]: AbstractControl } {
        return this.basicForm.controls;
    }
    /**
 * @description get basic form controls
 */
    get l(): { [key: string]: AbstractControl } {
        return this.lenderForm.controls;
    }

    /**
     * @description basic form submission
     */
    async basicFormSubmit() {
        try {
            this.basicForm.markAllAsTouched();
            if (this.basicForm.valid) {
                this.isBasicForm = false;
                this.getDocsAndCompany();
                this.getlendersList();
            } else {
                this.focusInvalidField();
            }
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
     * @description focus first invalid field
     */
    focusInvalidField() {
        const firstInvalidControl: HTMLElement = this.el.nativeElement.querySelector(
            ".form-group .ng-invalid"
        );
        if (firstInvalidControl)
            firstInvalidControl.focus();
    }

    /**
     * @description get docs list and company detail
     */
    async getDocsAndCompany() {
        try {
            let data = {
                lead_id: this.leadID,
                specific_time: '90days',
                records_per_page: -1
            }
            this.commonService.showSpinner();
            const res$ = this.apiService.postReq(API_PATH.LEAD_DOCUMENTS, data, 'lead', 'edit');
            const response = await lastValueFrom(res$);
            if (response && response.status_code == "200") {
                this.docsList = response.data.documents;
                this.companyName = response.data.company_detail.full_name;
            } else {
                this.commonService.showError(response.message);
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
    async getshowAllDocuments(e: any) {
        if (e.target.checked) {
            this.documentcheckbox = true;
            try {
                let data = {
                    lead_id: this.leadID,
                    records_per_page: -1
                }
                this.commonService.showSpinner();
                const res$ = this.apiService.postReq(API_PATH.LEAD_DOCUMENTS, data, 'lead', 'edit');
                const response = await lastValueFrom(res$);
                if (response && response.status_code == "200") {
                    this.docsList = response.data.documents;
                    this.companyName = response.data.company_detail.full_name;
                } else {
                    this.commonService.showError(response.message);
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
        } else {
            this.documentcheckbox = false;
            this.getDocsAndCompany();
        }

    }

    checkBoxColor(value: any) {
        if (value == 'email') {
            this.colorCheckbox = true;
        } else {
            this.colorCheckbox = false;
        }
        if (value == 'ondeck') {
            this.colorCheckbox2 = true;
        } else {
            this.colorCheckbox2 = false;
        } if (value == 'kapitus') {
            this.colorCheckbox3 = true;
        } else {
            this.colorCheckbox3 = false;
        }
    }
    getChangeDocName(value: any) {
        let v1 = value.split('-');
        let v2 = v1[0].split('_');
        for (var i = 0; i < v2.length; i++) {
            v2[i] = v2[i].charAt(0).toUpperCase() + v2[i].slice(1);
        }
        const str2 = v2.join(" ");
        return str2
    }
    /**
 * @description get lead updatessss
 */
    async getSubmissionNotes() {
        try {
            let url = `?page_limit=${this.limit}&page=${this.submissionpage}&lead_id=${this.leadID}`;
            this.commonService.showSpinner();
            let res$ = this.apiService.getReq(API_PATH.SEND_SUBMISSION_NOTES + url, 'lead', 'list');
            let response = await lastValueFrom(res$);
            if (response && response.status_code == 200) {
                if (response.data.data) {
                    this.submissionNotesList = response.data.data;
                    this.submissiontotal = response.data.total
                } else {
                    this.submissionNotesList = [];
                    this.submissiontotal = 0;
                    this.submissionpage = 1;
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
}
