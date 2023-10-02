import {
    Component, OnInit, Inject,
    LOCALE_ID
} from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { API_PATH } from '@constants/api-end-points';
import { Custom_Regex } from '@constants/constants';
import { NgbCalendar, NgbDateStruct } from '@ng-bootstrap/ng-bootstrap';
import { ApiService } from '@services/api.service';
import { AuthService } from '@services/auth.service';
import { CommonService } from '@services/common.service';
import { lastValueFrom, Subscription } from 'rxjs';
import { formatCurrency } from '@angular/common';


@Component({
    selector: 'app-view-edit-lender-create-offer',
    templateUrl: './view-edit-lender-create-offer.component.html',
    styleUrls: ['./view-edit-lender-create-offer.component.scss']
})
export class ViewEditLenderCreateOfferComponent implements OnInit {
    activeTab: string = 'Create';
    createForm!: FormGroup;
    preFundForm!: FormGroup;
    lenderList: Array<any> = [];
    leadID: string = '';
    maxDate!: NgbDateStruct;
    editMode: boolean = false;
    preFundtype: Array<any> = [];
    preFundAdvancetype: Array<any> = [];
    preFundUnittype: Array<any> = [];
    agentList: Array<any> = [];
    userRole: string = '';
    lenderOfferID: string = '';
    lenderOffer: any = {};
    canEditLenderOffer: boolean = false;
    lead: any = {}
    termLables: string = 'Days';
    style!: { fill: string; };
    background!: { background: string; };
    colorSubs!: Subscription;
    color!: string;
    conditionCheck: boolean = false;
    constructor(
        private fb: FormBuilder,
        private apiService: ApiService,
        private commonService: CommonService,
        private route: ActivatedRoute,
        private router: Router,
        private authService: AuthService,
        private calendar: NgbCalendar,
        @Inject(LOCALE_ID) public locale: string,

    ) { }

    ngOnInit(): void {
        this.maxDate = this.calendar.getToday();
        this.initCreateForm();
        this.getDropdownOptions();
        let params = this.route.snapshot.params;
        let query = this.route.snapshot.queryParams;
        if (params['id'] || params['leadid']) {
            this.lenderOfferID = params['id'];
            this.leadID = params['leadid'];
            this.getLenderOfferData();

        }
        if (query['mode'] && query['mode'] === 'edit') {
            this.editMode = true;
        }
        this.getUserDetails();
        this.getLenderOptions();
        this.canEditLenderOffer = this.authService.hasPermission('lender-offer-update');
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
    get userBaseRoute() {
        return this.authService.getUserRole().toLowerCase();
    }

    getpaymentData() {
        let data = this.createForm.get('payment_type')?.value;
        if (this.preFundAdvancetype.length) {
            for (let x of this.preFundAdvancetype) {
                if (data === x.id) {

                    let data = x.name;
                    // console.log("gy", this.termLables);
                    if (data == 'Daily ') {
                        this.termLables = 'Days'
                    } else if (data == 'Weekly ') {
                        this.termLables = 'Weeks'
                    } else if (data == 'Bi-Weekly ') {
                        this.termLables = 'Bi-weeks'
                    } else if (data == 'Monthly ') {
                        this.termLables = 'Months'
                    }

                }
            }
        }

    }

    getFundValue() {
        let fund = this.createForm.get('funded_rejected')?.value;
        if (fund == 'funded') {
            this.createForm.get('apply_to_function')?.setValue(true);
            this.conditionCheck = true;
        } else {
            this.createForm.get('apply_to_function')?.setValue(false);
            this.conditionCheck = false;


        }



    }
    getCheckedFund() {
        let data = this.createForm.get('apply_to_function')?.value;

        if (data === true) {
            this.createForm.get('funded_rejected')?.setValue('funded');
            this.conditionCheck = true;

        } else {
            this.conditionCheck = false;

            this.createForm.get('funded_rejected')?.setValue('');
        }

    }


    initCreateForm(): void {
        this.createForm = this.fb.group({
            lender_id: ['', [Validators.required, Validators.pattern(Custom_Regex.spaces)]],
            funding_amount: ['', [Validators.required, Validators.pattern(Custom_Regex.amount)]],
            sell_rate: ['', [Validators.required, Validators.pattern(Custom_Regex.amount)]],
            rtr: [0, [Validators.required, Validators.pattern(Custom_Regex.amount)]],
            // rtr: [0, [Validators.required, Validators.pattern(/^[+-]?[0-9]{1,3}(?:,?[0-9]{3})*\.[0-9]{2}$/)]],
            payment_type: [''],
            payment: ['', [Validators.required, Validators.pattern(Custom_Regex.amount)]],
            term_in_days: ['', [Validators.required, Validators.pattern(Custom_Regex.amount)]],
            buy_rate: ['', [Validators.required, Validators.pattern(Custom_Regex.amount)]],
            position: [''],
            funded_rejected: [''],
            apply_to_function: [false]
        })
        if (this.createForm.value.apply_to_function === true) {
            this.conditionCheck = true;
        } else {
            this.conditionCheck = false;
        }
    }


    get f(): { [key: string]: AbstractControl } {
        return this.createForm.controls;
    }
    sellrate(value: any) {
        if (Number(this.createForm.value.sell_rate) > 100) {
            this.commonService.showError("Please enter value less than or equal to 100")
            this.createForm.patchValue({ sell_rate: '' })
        } else if (Number(this.createForm.value.sell_rate) < Number(this.createForm.value.buy_rate)) {
            this.commonService.showError("Sell rate can't be less than buy rate")
            this.createForm.patchValue({ sell_rate: '' })
        } else {
            let total_value = 0;
            total_value = Number(this.createForm.value.funding_amount) * Number(this.createForm.value.sell_rate);
            this.createForm.patchValue({ rtr: total_value.toFixed(2) })
            let payment_value: any = 0;
            if (this.createForm.value.term_in_days != '') {
                payment_value = Number(this.createForm.value.rtr) / Number(this.createForm.value.term_in_days)
                payment_value = payment_value.toFixed(2);
                if (payment_value.split('.').length > 1) {
                    payment_value.split('.')[1] = '00';
                    payment_value = (+(payment_value) + 0.0000001).toString();
                }
                this.createForm.patchValue({ payment: payment_value })
                // this.createForm.patchValue({ payment: payment_value.toFixed(2) })
            }


        }

    }
    fundingAmount(value: any) {
        let total_value = 0;
        total_value = Number(this.createForm.value.funding_amount) * Number(this.createForm.value.sell_rate);
        let data = formatCurrency(total_value, this.locale, '');

        this.createForm.patchValue({ rtr: total_value.toFixed(2) });
        let payment_value: any = 0;
        if (this.createForm.value.term_in_days != '') {
            payment_value = Number(this.createForm.value.rtr) / Number(this.createForm.value.term_in_days)
            payment_value = payment_value.toFixed(2);
            if (payment_value.split('.').length > 1) {
                payment_value.split('.')[1] = '00';
                payment_value = (+(payment_value) + 0.0000001).toString();
            }
            this.createForm.patchValue({ payment: payment_value })
            // this.createForm.patchValue({ payment: payment_value.toFixed(2) });
        }

    }
    buyrate(value: any) {
        if (Number(this.createForm.value.buy_rate) > 100) {
            this.commonService.showError("Please enter value less than or equal to 100")
            this.createForm.patchValue({ buy_rate: '' })
        } else if (Number(this.createForm.value.buy_rate) > Number(this.createForm.value.sell_rate)) {
            this.commonService.showError("Buy rate can't be greater than sell rate")
            this.createForm.patchValue({ buy_rate: '' })
        }

    }
    // getPayment(value: any) {
    //     let payment_value = 0;
    //     payment_value = Number(this.createForm.value.rtr) / Number(value)
    //     this.createForm.patchValue({ payment: payment_value.toFixed(2) })

    // }
    getPayment(value: any) {
        let payment_value: any = 0;
        payment_value = Number(this.createForm.value.rtr) / Number(value);
        payment_value = payment_value.toFixed(2);
        if (payment_value.split('.').length > 1) {
            payment_value.split('.')[1] = '00';
            payment_value = (+(payment_value) + 0.0000001).toString();
        }
        this.createForm.patchValue({ payment: payment_value })
    }

    patchValues(): void {
        let data = formatCurrency(this.lenderOffer?.funding_amount, this.locale, '');

        this.createForm.patchValue({
            lender_id: this.lenderOffer?.lender_id,
            // funding_amount:data,
            funding_amount: this.lenderOffer?.funding_amount,
            sell_rate: this.lenderOffer?.sell_rate,
            rtr: this.lenderOffer?.rtr,
            payment_type: this.lenderOffer?.payment_type,
            payment: this.lenderOffer?.payment,
            term_in_days: this.lenderOffer?.terms,
            buy_rate: this.lenderOffer?.buy_rate,
            position: this.lenderOffer?.position,
            funded_rejected: this.lenderOffer?.funding_rejected,
            apply_to_function: this.lenderOffer?.apply_to_function

        })
        if (this.lenderOffer?.apply_to_function === true) {
            this.conditionCheck = true;
        } else {
            this.conditionCheck = false;
        }

        let data1 = this.createForm.get('payment_type')?.value;
        if (this.preFundAdvancetype.length) {
            for (let x of this.preFundAdvancetype) {
                if (data1 === x.id) {
                    // this.termLables = x.name;
                    let data = x.name;
                    // console.log("gy", this.termLables);
                    if (data == 'Daily ') {
                        this.termLables = 'Days'
                    } else if (data == 'Weekly ') {
                        this.termLables = 'Weeks'
                    } else if (data == 'Bi-Weekly ') {
                        this.termLables = 'Bi-weeks'
                    } else if (data == 'Monthly ') {
                        this.termLables = 'Months'
                    }
                }
            }
        }


    }
    async getDropdownOptions() {
        try {
            this.commonService.showSpinner();
            const res$ = this.apiService.postReq(API_PATH.GET_PRE_FUND_DROPDOWNS, { group_name: ['pre_fund_type', 'pre_fund_advance_type', 'pre_fund_unit_type'] }, '', '');
            let response = await lastValueFrom(res$);
            if (response && response.data) {
                this.preFundtype = response.data.pre_fund_type;
                this.preFundAdvancetype = response.data.pre_fund_advance_type;
                let array = [];
                for (let i = 0; i < this.preFundAdvancetype.length; i++) {
                    if (i < 4) {
                        let text = this.preFundAdvancetype[i].name.toString().replace("ACH", "");
                        this.preFundAdvancetype[i].name = text;
                        array.push(this.preFundAdvancetype[i]);
                    }
                }
                this.preFundAdvancetype = array;
                this.preFundUnittype = response.data.pre_fund_unit_type;

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
    async getLenderOfferData() {
        let url = `?&lender_offer_id=${this.lenderOfferID}`;
        try {
            this.commonService.showSpinner();
            const res$ = this.apiService.getReq(API_PATH.VIEW_CREATE_LENDER_OFFER + url, 'lender', 'offer-list');
            let response = await lastValueFrom(res$);
            if (response && response.status_code == "200") {
                if (response.data) {
                    this.lenderOffer = response.data;
                    this.patchValues();
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


    async getLenderOptions() {
        try {
            this.commonService.showSpinner();
            const res$ = this.apiService.postReq(API_PATH.LENDER_LIST, { lead_id: this.leadID }, '', '');
            let response = await lastValueFrom(res$);
            if (response && response.data) {
                this.lenderList = response.data;
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
    async addCreateLenderOffer() {
        this.createForm.markAllAsTouched();
        if (this.createForm.valid) {
            let data = {
                ...this.createForm.value,
                lender_offer_id: this.lenderOfferID,
                lead_id: this.leadID,
                update: "update"
            }
            try {
                this.commonService.showSpinner();
                const res$ = this.apiService.postReq(API_PATH.CREATE_LENDER_OFFER, data, 'lender', 'offer-create');
                let response = await lastValueFrom(res$);
                if (response.api_response == 'success') {
                    this.commonService.showSuccess(response.message);
                    this.router.navigate([`/${this.userBaseRoute}/lead-detail/` + this.leadID],
                        { queryParams: { activeTab: 'Lender Offers' } });
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
    cancel() {
        this.editMode = !this.editMode;
        this.patchValues();
    }
    getLeadBasicDetails(leadData: any) {
        this.lead = leadData;

    }
    getTermDays() {
        const formData = this.createForm.value;
        if (formData.rtr != '' && formData.payment != '') {
            let days = Number(formData.rtr) / Number(formData.payment)
            this.createForm.patchValue({ term_in_days: Math.round(days) })
        }
        let Payment = formData.payment.toFixed(2);
        if (Payment.split('.').length > 1) {
            Payment.split('.')[1] = '00';
            Payment = (+(Payment) + 0.0000001).toString();
        }
        this.createForm.patchValue({ payment: Payment })
    }

}
