import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { AbstractControl, FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { API_PATH } from '@constants/api-end-points';
import { Custom_Regex, Roles } from '@constants/constants';
import { NgbCalendar, NgbDateParserFormatter, NgbDateStruct } from '@ng-bootstrap/ng-bootstrap';
import { ApiService } from '@services/api.service';
import { AuthService } from '@services/auth.service';
import { CommonService } from '@services/common.service';
import { lastValueFrom, Subscription } from 'rxjs';

@Component({
    selector: 'app-lead-prefund',
    templateUrl: './lead-prefund.component.html',
    styleUrls: ['./lead-prefund.component.scss']
})
export class LeadPrefundComponent implements OnInit {
    preFundForm: FormGroup | any;
    lenderList: Array<any> = [];
    leadID: string = '';
    maxDate!: NgbDateStruct;
    preFundtype: Array<any> = [];
    preFundAdvancetype: Array<any> = [];
    preFundUnittype: Array<any> = [];
    agentList: Array<any> = [];
    userRole: string = '';
    lead: any = {};
    prefundingData: any = {};
    agentArray: Array<any> = [];
    todayDate: string = '';
    leadSourceList: Array<any> = [];
    labelRemit: string = 'Weekly'
    labelTerm: string = 'Weeks'
    @ViewChild('dob',) DOB!: ElementRef;
    editMode: boolean = false;
    viewMode: boolean = false;
    companyType: string = '';
    agentListLimit: number = 1000;
    agentListPage: number = 1
    style!: { fill: string; };
    background!: { background: string; };
    colorSubs!: Subscription;
    checkBoxColor: boolean = false;
    checkBoxColor2: boolean = false;
    checkBoxColor_agent: boolean = false;
    checkBoxColor_agent2: boolean = false;
    color!: string;
    constructor(
        private fb: FormBuilder,
        private apiService: ApiService,
        private commonService: CommonService,
        private route: ActivatedRoute,
        private router: Router,
        private authService: AuthService,
        private calendar: NgbCalendar,
        private formatter: NgbDateParserFormatter,
        // private parserFormatter: NgbDateParserFormatter,
    ) { }

    ngOnInit(): void {
        this.maxDate = this.calendar.getToday();
        this.getDropdownOptions();
        let d = new Date();
        let day: any = d.getDate();
        if (day.toString().length < 2) {
            day = '0' + day;
        }
        this.todayDate = `${((d.getMonth() + "1")).slice(-2)}-${day}-${d.getFullYear()}`
        // this.todayDate = `${d.getMonth() + 1}-${day}-${d.getFullYear()}`
        this.initPreFundForm();
        let params = this.route.snapshot.params;
        if (params && params['id']) {
            this.leadID = params['id'];
        } else {
            this.commonService.showError('');
        }
        let query = this.route.snapshot.queryParams;

        if (query['mode'] && query['mode'] === 'edit') {

            this.editMode = true;

        }
        if (query['mode'] && query['mode'] === 'view') {
            this.viewMode = true;
        }
        // this.getAgentList();
        this.getAgentDropdownList();
        this.getUserDetails();
        this.getLeadOptions();
        this.getPreFunding();
        this.getLenderOptions();
        if (this.preFundAdvancetype.length) {
        }


    }


    ngAfterViewInit(): void {
        if (this.DOB) {
            Inputmask('datetime', {
                inputFormat: 'mm-dd-yyyy',
                placeholder: 'mm-dd-yyyy',
                alias: 'datetime',
                min: '01-01-1920',
                max: this.todayDate,
                clearMaskOnLostFocus: false,
            }).mask(this.DOB.nativeElement);
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
                this.companyType = ud.company_type
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

    get userBaseRoute() {
        return this.authService.getUserRole().toLowerCase();
    }




    getAdvancedType() {
        if (this.preFundAdvancetype.length) {
            let data = this.preFundForm.get('advance_type')?.value
            for (let x of this.preFundAdvancetype) {
                if (data === x.id) {
                    const ACH = x.name;
                    this.labelRemit = ACH.replace('ACH', '');
                    if (ACH == 'Daily ACH') {
                        this.labelTerm = 'Days'
                    } else if (ACH == 'Weekly ACH') {
                        this.labelTerm = 'Weeks'
                    } else if (ACH == 'Bi-Weekly ACH') {
                        this.labelTerm = 'Bi-Weeks'

                    } else if (ACH == 'Monthly ACH') {
                        this.labelTerm = 'Months'
                    } else if (ACH == 'Variable ACH') {
                        this.labelTerm = 'Variable'
                    } else {
                        this.labelTerm = x.name;
                    }


                }
            }
        }
    }

    initPreFundForm(): void {
        this.preFundForm = this.fb.group({
            company_name: ['', [
                Validators.pattern(Custom_Regex.spaces),
                Validators.maxLength(100),
                Validators.minLength(3),
                Validators.pattern(Custom_Regex.username),
                Validators.pattern(Custom_Regex.name),
            ]],
            funding_date: ['', [Validators.required]],
            funding_amount: ['', [Validators.required, Validators.pattern(Custom_Regex.amount)]],
            type_of_fund: [''],
            factor_rate: ['', [Validators.required, Validators.pattern(Custom_Regex.amount)]],
            buy_rate: ['', [Validators.required, Validators.pattern(Custom_Regex.amount)]],
            payback_amount: ['', [Validators.required, Validators.pattern(Custom_Regex.amount)]],
            lender_id: ['', [Validators.required]],
            upfront_broker_commission: ['', [Validators.required, Validators.pattern(Custom_Regex.amount)]],
            total_earnings: ['', [Validators.required, Validators.pattern(Custom_Regex.amount)]],
            advance_type: ['', [Validators.required]],
            weekly_remit: ['', [Validators.required, Validators.pattern(Custom_Regex.amount)]],
            unit_type: ['', [Validators.required]],
            term_in_weeks: ['', [Validators.required, Validators.pattern(Custom_Regex.amount)]],
            closer_agent_id: [''],
            total_points: ['', [Validators.required, Validators.pattern(Custom_Regex.amount)]],
            retail_points: ['', [Validators.required, Validators.pattern(Custom_Regex.amount)]],
            upfront_fee: ['', [Validators.pattern(Custom_Regex.amount)]],
            lead_source: [''],
            upfront_broker_commission_on: ['funding', [Validators.required]],
            agent_commision: ['percentage'],
            agent_form: this.fb.array([]),

        });
        // this.addAgentForm(true);

    }
    specifiedPercentage(value: any) {
        if (value == 'lender_commission') {
            for (let i = 0; i < this.agentFArray.length; i++) {
                if (this.agentFArray.controls[i].value.lender_commission > 100) {
                    this.commonService.showError("Specified percentage should be less than 100");
                    this.agentFArray.at(i).patchValue({ "lender_commission": '' })
                }
            }
        } else {
            for (let i = 0; i < this.agentFArray.length; i++) {
                if (this.agentFArray.controls[i].value.upfront_commission > 100) {
                    this.commonService.showError("Specified percentage should be less than 100");
                    this.agentFArray.at(i).patchValue({ "upfront_commission": '' })
                }
            }
        }

    }

    get p(): { [key: string]: AbstractControl } {
        return this.preFundForm.controls;
    }

    get agentFArray() {
        return this.preFundForm.get('agent_form') as FormArray;
    }


    agentForm(value: any, status: any) {
        return this.fb.group({
            agent_id: [value.agent_id ? value.agent_id : ''],
            lender_commission: [value.lender_commission ? value.lender_commission : ''],
            upfront_commission: [value.upfront_commission ? value.upfront_commission : '']
            // agent_id: [value.agent_id ? value.agent_id : ''],
            // lender_commission: [value.lender_commission ? value.lender_commission : '', [Validators.pattern(Custom_Regex.amount)]],
            // upfront_commission: [value.upfront_commission ? value.upfront_commission : '', [Validators.pattern(Custom_Regex.amount)]],
        })
    }
    addAgentForm(value: any) {
        this.agentFArray.push(this.agentForm({}, value));
    }

    removeAgentForm(i: number) {
        this.agentFArray.removeAt(i);
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

    async getPreFunding() {
        try {
            let url = `?&lead_id=${this.leadID}`
            this.commonService.showSpinner();
            const res$ = this.apiService.getReq(API_PATH.GET_PRE_FUNDING + url, 'lead', 'fund-record');
            let response = await lastValueFrom(res$);
            if (response && response.data) {
                this.prefundingData = response.data;
                // this.agentList.push(this.prefundingData?.assigned_user);
                this.patchValues();
                this.agentArray = response.data.agents;
                for (let i = 0; i < response.data.agents?.length; i++) {
                    this.agentFArray.push(
                        this.agentForm(response.data.agents[i], false)
                    );
                }
                if (!this.agentArray.length && !this.agentFArray.length) {
                    this.addAgentForm(true);
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
    patchValues(): void {
        this.preFundForm.patchValue({
            company_name: this.prefundingData?.company_name,
            // funding_date: this.prefundingData?.funding_date,
            funding_date: this.formatter.parse(this.prefundingData?.funding_date),
            // funding_date: this.formatter.parse(this.prefundingData?.funding_date.split("-").reverse().join("-")),
            funding_amount: Number(this.prefundingData?.funding_amount).toFixed(2),
            type_of_fund: this.prefundingData?.type_of_fund,
            factor_rate: this.prefundingData?.factor_rate,
            buy_rate: this.prefundingData?.buy_rate,
            payback_amount: Number(this.prefundingData?.payback_amount).toFixed(2),
            lender_id: this.prefundingData?.lender_id,
            upfront_broker_commission: Number(this.prefundingData?.upfront_broker_commission).toFixed(2),
            total_earnings: this.prefundingData?.total_earnings,
            advance_type: this.prefundingData?.advance_type,
            weekly_remit: this.prefundingData?.weekly_remit,
            unit_type: this.prefundingData?.unit_type,
            term_in_weeks: this.prefundingData?.term_in_weeks,
            closer_agent_id: this.prefundingData?.closer_agent_id,
            total_points: Number(this.prefundingData?.total_points).toFixed(2),
            retail_points: Number(this.prefundingData?.retail_points).toFixed(2),
            upfront_fee: this.prefundingData?.upfront_fee,
            lead_source: this.prefundingData?.lead_source,
            upfront_broker_commission_on: this.prefundingData?.upfront_broker_commission_on,
            agent_commision: this.prefundingData?.agent_commision,
        })
        if (this.prefundingData?.type_of_fund == '') {
            let data = this.preFundtype.filter((e) => e.name == 'NEW');
            this.preFundForm.patchValue({ type_of_fund: data[0].id });
        }
        if (this.prefundingData?.upfront_broker_commission_on == '') {
            this.preFundForm.patchValue({ upfront_broker_commission_on: 'funding' });
        }
        if (this.prefundingData?.agent_commision == '') {
            this.preFundForm.patchValue({ agent_commision: 'percentage' });
        }
        if (this.preFundForm.value.agent_commision == 'percentage') {
            this.checkBoxColor_agent = true;
        } else {
            this.checkBoxColor_agent = false;
        } if (this.preFundForm.value.agent_commision == 'fixed') {
            this.checkBoxColor_agent2 = true;
        } else {
            this.checkBoxColor_agent2 = false;
        }

        if (this.preFundForm.value.upfront_broker_commission_on == 'payback') {
            this.checkBoxColor2 = true

        } else {
            this.checkBoxColor2 = false;
        }
        if (this.preFundForm.value.upfront_broker_commission_on == 'funding') {
            this.checkBoxColor = true;
        } else {
            this.checkBoxColor = false;

        }
        // console.log( this.prefundingData?.upfront_broker_commission_on,'ghffhgfhgfhg');

        if (this.preFundAdvancetype.length) {
            let data = this.preFundForm.get('advance_type')?.value
            for (let x of this.preFundAdvancetype) {
                if (data === x.id) {
                    const ACH = x.name;
                    this.labelRemit = ACH.replace('ACH', '');
                    if (ACH == 'Daily ACH') {
                        this.labelTerm = 'Days'
                    } else if (ACH == 'Weekly ACH') {
                        this.labelTerm = 'Weeks'
                    } else if (ACH == 'Bi-Weekly ACH') {
                        this.labelTerm = 'Bi-Weeks'

                    } else if (ACH == 'Monthly ACH') {
                        this.labelTerm = 'Months'
                    } else if (ACH == 'Variable ACH') {
                        this.labelTerm = 'Variable'
                    } else {
                        this.labelTerm = x.name;
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
    async submitPreFund() {
        this.preFundForm.markAllAsTouched();
        if (this.lead?.company_type == 'broker') {
            for (let i = 0; i < this.agentFArray.length; i++) {
                this.preFundForm.get('agent_form')['controls'][i].controls.agent_id.setValidators(Validators.required);
                this.preFundForm.get('agent_form')['controls'][i].controls.agent_id.updateValueAndValidity();
                this.preFundForm.get('agent_form')['controls'][i].controls.agent_id.markAsTouched();
                this.preFundForm.get('agent_form')['controls'][i].controls.lender_commission.setValidators([Validators.pattern(Custom_Regex.amount)]);
                this.preFundForm.get('agent_form')['controls'][i].controls.lender_commission.updateValueAndValidity();
                this.preFundForm.get('agent_form')['controls'][i].controls.lender_commission.markAsTouched();
                this.preFundForm.get('agent_form')['controls'][i].controls.upfront_commission.setValidators([Validators.pattern(Custom_Regex.amount)]);
                this.preFundForm.get('agent_form')['controls'][i].controls.upfront_commission.updateValueAndValidity();
                this.preFundForm.get('agent_form')['controls'][i].controls.upfront_commission.markAsTouched();
            }
            this.preFundForm.get('agent_commision')?.setValidators([Validators.required])
            this.preFundForm.get('agent_commision')?.updateValueAndValidity();
            this.preFundForm.get('agent_commision')?.markAsTouched();

        }
        if (this.preFundForm.valid) {
            // if (this.preFundForm.value.funding_date && !Custom_Regex.date.test(this.preFundForm.value.funding_date)) {  
            //         this.commonService.showError('Invalid funding date.');
            //         this.commonService.hideSpinner();
            //         return;

            // }
            // let date: NgbDate = this.preFundForm.value.funding_date;
            // let newDate = new Date(date.year, date.month - 1, date.day);
            let exactdata = {};
            if (this.prefundingData?.funding_date == '') {
                let fundeddate = this.preFundForm.value.funding_date;
                // let date = (fundeddate.day <= 9 ? '0'+ fundeddate.day : fundeddate.day) + '-' +(fundeddate.month <= 9 ? '0'+ fundeddate.month : fundeddate.month) + '-' + fundeddate.year;
                let date = (fundeddate.month <= 9 ? '0' + fundeddate.month : fundeddate.month) + '-' + (fundeddate.day <= 9 ? '0' + fundeddate.day : fundeddate.day) + '-' + fundeddate.year;
                let data = {
                    ...this.preFundForm.value,
                    lead_id: this.leadID,
                    // funding_date: this.preFundForm.value.funding_date ? this.preFundForm.value.funding_date: "",
                    funding_date: date,
                    agent: [],
                    status: "create"

                }
                if (this.lead?.company_type == 'broker') {
                    for (let i = 0; i < this.preFundForm.value.agent_form.length; i++) {
                        let ins = {
                            agent_id: this.preFundForm.value.agent_form[i].agent_id,
                            lender_commission: this.preFundForm.value.agent_form[i].lender_commission,
                            upfront_commission: this.preFundForm.value.agent_form[i].upfront_commission
                        }
                        data.agent.push(ins);
                    }
                }
                exactdata = data
            } else {


                let fundeddate = this.preFundForm.value.funding_date;
                console.log(this.formatter.format(this.preFundForm.value.funding_date));
                // let date =  (fundeddate.day <= 9 ? '0'+ fundeddate.day : fundeddate.day) + '-' +(fundeddate.month <= 9 ? '0'+ fundeddate.month : fundeddate.month) + '-' + fundeddate.year;
                let date = (fundeddate.month <= 9 ? '0' + fundeddate.month : fundeddate.month) + '-' + (fundeddate.day <= 9 ? '0' + fundeddate.day : fundeddate.day) + '-' + fundeddate.year;

                let data = {
                    ...this.preFundForm.value,
                    lead_id: this.leadID,
                    // funding_date: this.preFundForm.value.funding_date ? this.preFundForm.value.funding_date : "",
                    funding_date: date,
                    agent: [],
                }
                if (this.lead?.company_type == 'broker') {
                    for (let i = 0; i < this.preFundForm.value.agent_form.length; i++) {
                        let ins = {
                            agent_id: this.preFundForm.value.agent_form[i].agent_id,
                            lender_commission: this.preFundForm.value.agent_form[i].lender_commission,
                            upfront_commission: this.preFundForm.value.agent_form[i].upfront_commission
                        }
                        data.agent.push(ins);
                    }
                }
                exactdata = data
            }
            try {
                this.commonService.showSpinner();
                const res$ = this.apiService.postReq(API_PATH.LEAD_PRE_FUND, exactdata, 'lead', 'pre-funding');
                let response = await lastValueFrom(res$);
                if (response.api_response == 'success') {
                    this.commonService.showSuccess(response.message)
                    this.router.navigate([`/${this.userBaseRoute}/funding-record-list/` + this.leadID]);
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
    getLeadBasicDetails(leadData: any) {
        this.lead = leadData;

    }

    async getLeadOptions() {
        try {
            let url = '';
            if (this.userRole == Roles.ADMINISTRATOR) {
                url = `?lead_id=${this.leadID}`;
            }
            this.commonService.showSpinner();
            const res$ = this.apiService.getReq(API_PATH.LEAD_OPTIONS_LIST + url, '', '');
            let response = await lastValueFrom(res$);
            if (response && response.data) {
                this.leadSourceList = response.data.lead_source;
                this.leadSourceList.sort((a, b) => a.name.localeCompare(b.name))
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
    fundingAmount(value: any) {
        // let total_value = 0;
        // total_value = (this.preFundForm.value.funding_amount) * (this.preFundForm.value.factor_rate);
        // 	this.preFundForm.patchValue({ payback_amount: total_value});
    }
    changeFactorRate(value: any) {
        if (Number(this.preFundForm.value.factor_rate) > 100) {
            this.commonService.showError("Please enter value less than or equal to 100")
            this.preFundForm.patchValue({ factor_rate: '' })
        } else if (Number(this.preFundForm.value.factor_rate) < Number(this.preFundForm.value.buy_rate)) {
            this.commonService.showError("Factor rate can't be less than buy rate")
            this.preFundForm.patchValue({ factor_rate: '' })
        } else {
            let total_upfront_broker_commission = 0;
            total_upfront_broker_commission = (Number(this.preFundForm.value.factor_rate) - Number(this.preFundForm.value.buy_rate)) * Number(this.preFundForm.value.funding_amount);
            this.preFundForm.patchValue({ upfront_broker_commission: total_upfront_broker_commission.toFixed(2) })

            let total_payback_amount = 0;
            total_payback_amount = Number(this.preFundForm.value.funding_amount) * Number(this.preFundForm.value.factor_rate);
            this.preFundForm.patchValue({ payback_amount: total_payback_amount.toFixed(2) });
            let total_points = 0;
            total_points = (Number(this.preFundForm.value.factor_rate) - Number(this.preFundForm.value.buy_rate)) * 100;
            this.preFundForm.patchValue({ total_points: total_points.toFixed(2) })
            this.preFundForm.patchValue({ retail_points: total_points.toFixed(2) })

        }
    }
    buyrate(value: any) {
        if (Number(this.preFundForm.value.buy_rate) > 100) {
            this.commonService.showError("Please enter value less than or equal to 100")
            this.preFundForm.patchValue({ buy_rate: '' })
        } else if (Number(this.preFundForm.value.buy_rate) > Number(this.preFundForm.value.factor_rate)) {
            this.commonService.showError("Buy rate can't be greater than factor rate")
            this.preFundForm.patchValue({ buy_rate: '' })
        } else {
            let total_upfront_broker_commission = 0;
            total_upfront_broker_commission = (Number(this.preFundForm.value.factor_rate) - Number(this.preFundForm.value.buy_rate)) * Number(this.preFundForm.value.funding_amount);
            this.preFundForm.patchValue({ upfront_broker_commission: total_upfront_broker_commission.toFixed(2) })
            let total_points = 0;
            total_points = (Number(this.preFundForm.value.factor_rate) - Number(this.preFundForm.value.buy_rate)) * 100;
            this.preFundForm.patchValue({ total_points: total_points.toFixed(2) })
            this.preFundForm.patchValue({ retail_points: total_points.toFixed(2) })

        }

    }
    async getAgentDropdownList(): Promise<any> {
        try {
            let url = `?page_limit=${this.agentListLimit}&page=${this.agentListPage}&lead_id=${this.leadID}`;

            this.commonService.showSpinner();
            const res$ = this.apiService.getReq(API_PATH.GET_AGENT_LIST + url, 'lead', 'fund-record');
            let response = await lastValueFrom(res$);
            if (response && response.data) {
                this.agentList = response.data.data;
            } else {
                this.agentList = [];
                this.agentListPage = 1;
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
    onChange(e: any) {
        // let data =   this.preFundForm.get('upfront_broker_commission_on').value;
        let data = e.target.value;
        if (data == 'funding') {
            this.checkBoxColor = true;
        } else {

            this.checkBoxColor = false;
        }
        if (data == 'payback') {
            this.checkBoxColor2 = true
        } else {
            this.checkBoxColor2 = false

        }


    }
    onChangeAgent(e: any) {
        let data = e.target.value;

        if (data == 'percentage') {
            this.checkBoxColor_agent = true;
        } else {
            this.checkBoxColor_agent = false;
        } if (data == 'fixed') {
            this.checkBoxColor_agent2 = true;
        } else {
            this.checkBoxColor_agent2 = false;
        }
    }
    calculatetotalEarings() {
        let total_earning = 0;
        total_earning = (Number(this.preFundForm.value.upfront_fee) + Number(this.preFundForm.value.upfront_broker_commission));
        this.preFundForm.patchValue({ total_earnings: total_earning.toFixed(2) })
    }
    disabledAgent(id: any) {
        const agents: string[] = this.preFundForm.value.agent_form.map((e: any) => e.agent_id);
        const i = agents.findIndex(e => e === id);
        if (i > -1) {
            return true;
        }
        return false;
    }


}

