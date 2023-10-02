import { Component, ElementRef, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { API_PATH } from '@constants/api-end-points';
import { Custom_Regex, Mask } from '@constants/constants';
import { NgbDateParserFormatter } from '@ng-bootstrap/ng-bootstrap';
import { ApiService } from '@services/api.service';
import { AuthService } from '@services/auth.service';
import { CommonService } from '@services/common.service';
import { lastValueFrom, Subscription } from 'rxjs';

@Component({
    selector: 'app-create-lender',
    templateUrl: './create-lender.component.html',
    styleUrls: ['./create-lender.component.scss']
})
export class CreateLenderComponent implements OnInit {
    addLenderForm!: FormGroup;
    statesList: Array<any> = [];
    countriesList: Array<any> = [];
    rolesList: Array<any> = [];
    bussinessTypeList: Array<any> = [];
    mask = Mask;
    loading = false;
    background!: { background: string; };
    colorSubs!: Subscription;

    constructor(
        private fb: FormBuilder,
        private apiService: ApiService,
        private commonService: CommonService,
        private router: Router,
        private el: ElementRef,
        private formatter: NgbDateParserFormatter,
        private authService:AuthService
    ) { }

    ngOnInit(): void {
        this.initaddLenderForm();
        this.getCountries();
        this.getLeadOptions();
        this.getUserDetails();

    }
    getUserDetails(): void {
        try {
            let ud = this.authService.getUserDetails();
            if (ud) {
              
                this.getColorOnUpdate();
            //     this.style={fill:ud?.color};
            //  this.color=ud?.color;
                this.background={background:ud?.color};
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

    /**
     * @description get form controls
     * @author Shine Dezign Infonet Pvt. Ltd.
     */
    get f(): { [key: string]: AbstractControl } {
        return this.addLenderForm.controls;
    }

    // onClear() {
    //     this.searchedAgent = '';
    //     this.agentpage = 1;
    //     this.getagentList();
    //   }
    /**
     * @description initialize add compnay form
     * @author Shine Dezign Infonet Pvt. Ltd.
     * @returns {void}
     */
    initaddLenderForm(): void {
        this.addLenderForm = this.fb.group({
            name: ['', [Validators.required, 
                Validators.pattern(Custom_Regex.spaces), 
                Validators.pattern(Custom_Regex.username),
                Validators.pattern(Custom_Regex.name),
                Validators.maxLength(100), 
                Validators.minLength(3)
            ]],
            // Validators.pattern(Custom_Regex.lettersOnly), 
            type: [''],
            email: ['', [Validators.required, Validators.pattern(Custom_Regex.email)]],
            optional_email:  ['', [Validators.pattern(Custom_Regex.EMAIL_REGEX_COMMA_SEPRATED)]],
            phone: ['', [Validators.pattern(Custom_Regex.digitsOnly)]],
            contact_person: ['', [Validators.required, Validators.pattern(Custom_Regex.spaces)]],
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
            account_name: ['', [ 
                Validators.pattern(Custom_Regex.spaces), 
                Validators.pattern(Custom_Regex.lettersOnly), 
                Validators.maxLength(100),
                Validators.minLength(3)
            ]],
            account: ['', [Validators.pattern(Custom_Regex.city), Validators.maxLength(20)]],
            routing: ['', [Validators.pattern(Custom_Regex.digitsOnly)]],
            bank_name: ['', [Validators.pattern(Custom_Regex.spaces), Validators.pattern(Custom_Regex.lettersOnly), 
                Validators.maxLength(100), 
                Validators.minLength(3)
            ]],


        })
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
        console.log("jbjb", this.addLenderForm)
        if (this.addLenderForm.valid) {
            try {
                this.commonService.showSpinner();
                let data = {
                    ...this.addLenderForm.value,
                    white_label: Number(this.addLenderForm.value.white_label),
                    consolidation: Number(this.addLenderForm.value.consolidation),
                    sole_prop:  Number(this.addLenderForm.value.sole_prop),
                    home_business:  Number(this.addLenderForm.value.home_business),
                    non_profit:  Number(this.addLenderForm.value.non_profit),
                    daily_weekly:  Number(this.addLenderForm.value.daily_weekly),
                    coj_request:  Number(this.addLenderForm.value.coj_request),
                }


                const res$ = this.apiService.postReq(API_PATH.LENDER_CREATE, data, 'user', 'create');
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
        this.getStates(countryId);

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
                this.addLenderForm.patchValue({ state_id: "" });
                // if (forall) {
                //     this.offStatesList = response.data;
                //     this.partnerStatesList = response.data;
                //     this.bankStatesList = response.data;
                // }
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
                        // this.officerInfoForm.get('officer_country')?.patchValue(this.countriesList[i].id);
                        // this.partnerInfoForm.get('partner_country')?.patchValue(this.countriesList[i].id);
                        // this.bankInfoForm.get('bank_country')?.patchValue(this.countriesList[i].id);
                        this.getStates(this.countriesList[i].id);
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

