import { Component, ElementRef, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { API_PATH } from '@constants/api-end-points';
import { Custom_Regex, Mask } from '@constants/constants';
import { ApiService } from '@services/api.service';
import { AuthService } from '@services/auth.service';
import { CommonService } from '@services/common.service';
import { lastValueFrom } from 'rxjs';

@Component({
    selector: 'app-view-edit-lender',
    templateUrl: './view-edit-lender.component.html',
    styleUrls: ['./view-edit-lender.component.scss']
})
export class ViewEditLenderComponent implements OnInit {

    addLenderForm!: FormGroup;
    statesList: Array<any> = [];
    countriesList: Array<any> = [];
    rolesList: Array<any> = [];
    bussinessTypeList: Array<any> = [];
    mask = Mask;
    loading = false;
    editMode: boolean = false;
    lenderID: string = '';
    lenderDetails: any = {};
    statevalues: Array<any> = [];
    bussinessvalues: Array<any> = [];
    style!: { fill: string; };
    background!: { background: string; };
    colorSubs: any;

    constructor(
        private fb: FormBuilder,
        private apiService: ApiService,
        private commonService: CommonService,
        private router: Router,
        private el: ElementRef,
        private route: ActivatedRoute,
        private authService: AuthService
    ) { }

    ngOnInit(): void {
        this.initaddLenderForm();
        this.getCountries();
        this.getLeadOptions();
        this.getUserDetails();
        let params = this.route.snapshot.params;
        let query = this.route.snapshot.queryParams;
        if (params['id']) {
            this.lenderID = params['id'];
            this.getLenderDetails();

        }
        if (query['mode'] && query['mode'] === 'edit') {
            this.editMode = true;
        }
        if (!this.editMode) {
            this.addLenderForm.controls['state_id'].disable();
            this.addLenderForm.controls['business_type_id'].disable();
        }

    }
    // 
    getUserDetails(): void {
        try {
            let ud = this.authService.getUserDetails();
            if (ud) {

                this.getColorOnUpdate();
                this.style = { fill: ud?.color };
                //  this.color=ud?.color;
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
    edit() {
        this.editMode = !this.editMode;
        this.addLenderForm.controls['state_id'].enable();
        this.addLenderForm.controls['business_type_id'].enable();
    }

    /**
     * @description get form controls
     * @author Shine Dezign Infonet Pvt. Ltd.
     */
    get f(): { [key: string]: AbstractControl } {
        return this.addLenderForm.controls;
    }

    initaddLenderForm(): void {
        this.addLenderForm = this.fb.group({
            name: ['', [
                Validators.required,
                Validators.pattern(Custom_Regex.spaces),
                Validators.pattern(Custom_Regex.username),
                Validators.pattern(Custom_Regex.name),
                Validators.maxLength(100),
                Validators.minLength(3)
            ]],
            // Validators.pattern(Custom_Regex.lettersOnly), 
            type: [''],
            email: ['', [Validators.required, Validators.pattern(Custom_Regex.email),]],
            optional_email: ['', [Validators.pattern(Custom_Regex.EMAIL_REGEX_COMMA_SEPRATED)]],
            phone: ['', [Validators.pattern(Custom_Regex.digitsOnly)]],
            contact_person: ['', [Validators.required, Validators.pattern(Custom_Regex.spaces), Validators.maxLength(100)]],
            min_credit_score: ['', [Validators.pattern(Custom_Regex.amount)]],
            max_negative_days: ['', [Validators.pattern(Custom_Regex.amount)]],
            max_advance: ['', [Validators.pattern(Custom_Regex.amount)]],
            nsfs: ['', [Validators.pattern(Custom_Regex.digitsOnly)]],
            min_business_time: ['', [Validators.pattern(Custom_Regex.digitsOnly)]],
            min_amount: ['', [Validators.pattern(Custom_Regex.amount)]],
            min_deposites: ['', [Validators.pattern(Custom_Regex.amount)]],
            max_position: ['', [Validators.pattern(Custom_Regex.digitsOnly)]],
            max_term: ['', [Validators.pattern(Custom_Regex.digitsOnly)]],
            white_label: [''],
            consolidation: [''],
            sole_prop: [''],
            home_business: [''],
            non_profit: [''],
            daily_weekly: [''],
            coj_request: [''],
            country_id: [''],
            state_id: [''],
            // business_type_id: [null,[Validators.required]],
            business_type_id: [[]],
            status: ['1'],
            account_name: ['', [Validators.pattern(Custom_Regex.spaces), Validators.pattern(Custom_Regex.lettersOnly), Validators.maxLength(100),
            Validators.minLength(3)
            ]],
            account: ['', [Validators.pattern(Custom_Regex.spaces), Validators.pattern(Custom_Regex.city), Validators.maxLength(20)]],
            routing: ['', [Validators.pattern(Custom_Regex.spaces), Validators.pattern(Custom_Regex.digitsOnly)]],
            bank_name: ['', [Validators.pattern(Custom_Regex.spaces), Validators.pattern(Custom_Regex.lettersOnly), Validators.maxLength(100),
            Validators.minLength(3)
            ]],


        })
    }
    /**
     * @description initialize add compnay form
     * @author Shine Dezign Infonet Pvt. Ltd.
     * @returns {void}
     */
    cancel() {
        this.editMode = !this.editMode;
        this.addLenderForm.controls['state_id'].disable();
        this.addLenderForm.controls['business_type_id'].disable();

        this.patchValues();
    }
    patchValues() {

        if (!this.editMode) {
            this.statevalues = [];
            for (let i = 0; i < this.lenderDetails.lenderRestrictedStates.length; i++) {
                this.statevalues.push(this.lenderDetails.lenderRestrictedStates[i].name);
                this.statevalues.join(', ');
            }
            this.bussinessvalues = [];
            for (let i = 0; i < this.lenderDetails.lenderBusinessTypes.length; i++) {
                this.bussinessvalues.push(this.lenderDetails.lenderBusinessTypes[i].name);
                this.bussinessvalues.join(', ');
            }
        }
        let state_ids = [];

        for (let state of this.lenderDetails.lenderRestrictedStates) {
            state_ids.push(state.state_id);
        }

        let bussiness_type_ids = [];

        for (let business of this.lenderDetails.lenderBusinessTypes) {
            bussiness_type_ids.push(business.business_type_id);
        }
        this.addLenderForm.patchValue({
            name: this.lenderDetails.name,
            type: this.lenderDetails.type === 'Velocity' ? 1 : 0,
            email: this.lenderDetails.email,
            optional_email: this.lenderDetails.optional_email,
            phone: this.lenderDetails.phone,
            contact_person: this.lenderDetails.contact_person,
            min_credit_score: this.lenderDetails.min_credit_score,
            max_negative_days: this.lenderDetails.max_negative_days,
            max_advance: this.lenderDetails.max_advance,
            nsfs: this.lenderDetails.nsfs,
            min_business_time: this.lenderDetails.min_business_time,
            min_amount: this.lenderDetails.min_amount,
            min_deposites: this.lenderDetails.min_deposites,
            max_position: this.lenderDetails.max_position,
            max_term: this.lenderDetails.max_term,
            white_label: this.lenderDetails.white_label,
            // this.lenderDetails.white_label === 'Yes' ? 1 : 0,
            consolidation: this.lenderDetails.consolidation,
            sole_prop: this.lenderDetails.sole_prop,
            home_business: this.lenderDetails.home_business,
            non_profit: this.lenderDetails.non_profit,
            daily_weekly: this.lenderDetails.daily_weekly,
            // this.lenderDetails.daily_weekly == 'Daily' ? 0 : this.lenderDetails.daily_weekly == 'Weekly' ? 1 : 2,
            coj_request: this.lenderDetails.coj_request,
            country_id: this.lenderDetails.country_id ? this.lenderDetails.country_id : '',
            state_id: state_ids,
            business_type_id: bussiness_type_ids,
            status: this.lenderDetails.status,
            account_name: this.lenderDetails.account_name,
            account: this.lenderDetails.account,
            routing: this.lenderDetails.routing,
            bank_name: this.lenderDetails.bank_name,
        })
    }
    async getLenderDetails(): Promise<void> {
        try {
            this.commonService.showSpinner();
            let data = {
                id: this.lenderID
            }
            const res$ = this.apiService.postReq(API_PATH.LENDER_VIEW, data, 'lender', 'view');
            let response = await lastValueFrom(res$);
            if (response && response.data) {
                this.lenderDetails = response.data;
                if (this.lenderDetails.country_id) {
                    await this.getStates(this.lenderDetails.country_id, false);
                }
                this.patchValues();

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


    async getLeadOptions() {
        try {
            this.commonService.showSpinner();
            const res$ = this.apiService.getReq(API_PATH.LEAD_OPTIONS_LIST, '', '');
            let response = await lastValueFrom(res$);
            if (response && response.data) {
                this.bussinessTypeList = response.data.business_type;
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
     * @description on add company submit
     * @author Shine Dezign Infonet Pvt. Ltd.
     * @returns { Promise<void> }
     */
    async addUserSubmit(): Promise<void> {
        this.addLenderForm.markAllAsTouched();
        if (this.addLenderForm.valid) {
            try {
                let data = {
                    ...this.addLenderForm.value,
                    white_label: Number(this.addLenderForm.value.white_label),
                    consolidation: Number(this.addLenderForm.value.consolidation),
                    sole_prop: Number(this.addLenderForm.value.sole_prop),
                    home_business: Number(this.addLenderForm.value.home_business),
                    non_profit: Number(this.addLenderForm.value.non_profit),
                    daily_weekly: Number(this.addLenderForm.value.daily_weekly),
                    coj_request: Number(this.addLenderForm.value.coj_request),
                    lender_id: this.lenderID
                }
                this.commonService.showSpinner();

                const res$ = this.apiService.postReq(API_PATH.LENDER_EDIT, data, 'lender', 'update');
                let response = await lastValueFrom(res$);
                if (response) {
                    this.commonService.showSuccess(response.message);
                    this.router.navigate([`/${this.userBaseRoute}/lenders-list`]);
                    // this.router.navigate(['/company/lenders-list']);
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
            this.focusInvalidField();
        }
    }
    get userBaseRoute() {
        return this.authService.getUserRole().toLowerCase();
    }
    onCountryChange(countryId: any): void {
        this.getStates(countryId, true);

    }
    /**
   * @description get states list
   * @param country_id 
   * @author Shine Dezign Infonet Pvt. Ltd.
   */
    async getStates(country_id: string, patchValue: boolean) {
        try {
            this.commonService.showSpinner();
            const res$ = this.apiService.postReq(API_PATH.STATES, { country_id: country_id }, '', '');
            let response = await lastValueFrom(res$);
            if (response && response.data) {
                this.statesList = response.data;
                if (!patchValue) {
                    this.addLenderForm.patchValue({ state_id: "" });
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
* @description get countries list
* @author Shine Dezign Infonet Pvt. Ltd.
*/
    async getCountries() {
        try {
            this.commonService.showSpinner();
            const res$ = this.apiService.getReq(API_PATH.COUNTRIES_LIST, '', '');
            let response = await lastValueFrom(res$);
            if (response && response.data) {
                this.countriesList = response.data;
                let i = this.countriesList.findIndex((e) => e.name === "United States");
                if (i > -1) {
                    this.addLenderForm.get('country_id')?.patchValue(this.countriesList[i].id);
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
     * @description focus first invalid field
     */
    focusInvalidField() {
        const firstInvalidControl: HTMLElement = this.el.nativeElement.querySelector(
            ".form-group .ng-invalid"
        );
        if (firstInvalidControl)
            firstInvalidControl.focus();
    }


}

