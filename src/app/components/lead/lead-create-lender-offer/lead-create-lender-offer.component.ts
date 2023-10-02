import { Component, OnInit, Inject, LOCALE_ID } from '@angular/core';
import { AbstractControl, FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { API_PATH } from '@constants/api-end-points';
import { Custom_Regex } from '@constants/constants';
import { NgbCalendar, NgbDate, NgbDateParserFormatter, NgbDateStruct } from '@ng-bootstrap/ng-bootstrap';
import { ApiService } from '@services/api.service';
import { AuthService } from '@services/auth.service';
import { CommonService } from '@services/common.service';
import { lastValueFrom, Subscription } from 'rxjs';
import { formatCurrency } from '@angular/common';

@Component({
	selector: 'app-lead-create-lender-offer',
	templateUrl: './lead-create-lender-offer.component.html',
	styleUrls: ['./lead-create-lender-offer.component.scss']
})
export class LeadCreateLenderOfferComponent implements OnInit {
	activeTab: string = 'Create';
	createForm!: FormGroup;
	preFundForm!: FormGroup;
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
	agentArray: Array<any> = []
	termLables: string = 'Days';
	style!: { fill: string; };
	background!: { background: string; };
	colorSubs!: Subscription;
	checkColorValue: boolean = false;
	color!: string;
	constructor(
		private fb: FormBuilder,
		private apiService: ApiService,
		private commonService: CommonService,
		private route: ActivatedRoute,
		private router: Router,
		private authService: AuthService,
		private calendar: NgbCalendar,
		private parserFormatter: NgbDateParserFormatter,
		@Inject(LOCALE_ID) public locale: string,
	) { }

	ngOnInit(): void {
		this.maxDate = this.calendar.getToday();
		this.initCreateForm();
		this.initPreFundForm();
		this.getDropdownOptions();
		let params = this.route.snapshot.params;
		if (params && params['id']) {
			this.leadID = params['id'];
		} else {
			this.commonService.showError('');
		}
		this.getAgentList();
		this.getUserDetails();
		this.getLenderOptions();
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


	initCreateForm(): void {
		this.createForm = this.fb.group({
			lender_id: ['', [Validators.required, Validators.pattern(Custom_Regex.spaces)]],
			funding_amount: ['', [Validators.required, Validators.pattern(Custom_Regex.amount)]],
			sell_rate: ['', [Validators.required, Validators.pattern(Custom_Regex.amount)]],
			rtr: [0, [Validators.required, Validators.pattern(Custom_Regex.amount)]],
			payment_type: [''],
			payment: [0, [Validators.required, Validators.pattern(Custom_Regex.amount)]],
			term_in_days: ['', [Validators.required, Validators.pattern(Custom_Regex.amount)]],
			buy_rate: ['', [Validators.required, Validators.pattern(Custom_Regex.amount)]],
			position: [''],
			funded_rejected: [''],
			apply_to_function: [false]
		})
	}

	getpaymentData() {

		if (this.preFundAdvancetype.length) {
			// console.log("jhh");

			let data = this.createForm.get('payment_type')?.value;
			// console.log("sahv", this.createForm.value.payment_type);

			for (let x of this.preFundAdvancetype) {
				// console.log("sahv", x.id)
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
			this.checkColorValue = true
			this.createForm.get('apply_to_function')?.setValue(true);
		} else {
			this.createForm.get('apply_to_function')?.setValue(false);
			this.checkColorValue = false
		}



	}
	getCheckedFund() {
		let data = this.createForm.get('apply_to_function')?.value;
		this.checkColorValue = data;


		if (data === true) {
			this.createForm.get('funded_rejected')?.setValue('funded');
		} else {
			this.createForm.get('funded_rejected')?.setValue('');
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
			total_value = Number(this.createForm.value.funding_amount) * Number(value);
			this.createForm.patchValue({ rtr: total_value.toFixed(2) })
			let payment_value: any = 0;
			if (this.createForm.value.term_in_days != '') {
				payment_value = Number(this.createForm.value.rtr) / Number(this.createForm.value.term_in_days);
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
		total_value = (this.createForm.value.funding_amount) * (this.createForm.value.sell_rate);
		let data = formatCurrency(total_value, this.locale, '');
		this.createForm.patchValue({ rtr: total_value.toFixed(2) });

		let payment_value: any = 0;
		if (this.createForm.value.term_in_days != '') {
			payment_value = (Number(this.createForm.value.rtr)) / (Number(this.createForm.value.term_in_days));
			payment_value = payment_value.toFixed(2);
			if (payment_value.split('.').length > 1) {
				payment_value.split('.')[1] = '00';
				payment_value = (+(payment_value) + 0.0000001).toString();
			}
			this.createForm.patchValue({ payment: payment_value })
			// this.createForm.patchValue({ payment: payment_value.toFixed(2) })
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
	// 	let payment_value = 0;
	// 	payment_value = Number(this.createForm.value.rtr) / Number(value)
	// 	this.createForm.patchValue({ payment: payment_value.toFixed(2) })

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
	initPreFundForm(): void {
		this.preFundForm = this.fb.group({
			company_name: ['', [Validators.pattern(Custom_Regex.spaces)]],
			funding_date: ['', [Validators.required]],
			funding_amount: ['', [Validators.required, Validators.pattern(Custom_Regex.amount)]],
			type_of_fund: [''],
			factor_rate: ['', [Validators.required, Validators.pattern(Custom_Regex.amount)]],
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
			upfront_broker_commission_on: [false, [Validators.required]],
			agent_commision: [false, [Validators.required]],
			agent_form: this.fb.array([]),

		});
		// this.addAgentForm(true);
	}

	get p(): { [key: string]: AbstractControl } {
		return this.preFundForm.controls;
	}

	get agentFArray() {
		return this.preFundForm.get('agent_form') as FormArray;
	}


	agentForm(value: any, status: any) {
		return this.fb.group({
			agent_id: [value.agent_id ? value.agent_id : '', [Validators.required]],
			lender_commission: [value.lender_commission ? value.lender_commission : '', [Validators.pattern(Custom_Regex.amount)]],
			upfront_commission: [value.upfront_commission ? value.upfront_commission : '', [Validators.pattern(Custom_Regex.amount)]],
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
			const res$ = this.apiService.getReq(API_PATH.GET_PRE_FUNDING + url, 'lead', 'pre-funding');
			let response = await lastValueFrom(res$);
			if (response && response.data) {
				this.prefundingData = response.data;
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
			funding_date: this.parserFormatter.parse(this.prefundingData?.funding_date),
			funding_amount: this.prefundingData?.funding_amount,
			type_of_fund: this.prefundingData?.type_of_fund,
			factor_rate: this.prefundingData?.factor_rate,
			payback_amount: this.prefundingData?.payback_amount,
			lender_id: this.prefundingData?.lender_id,
			upfront_broker_commission: this.prefundingData?.upfront_broker_commission,
			total_earnings: this.prefundingData?.total_earnings,
			advance_type: this.prefundingData?.advance_type,
			weekly_remit: this.prefundingData?.weekly_remit,
			unit_type: this.prefundingData?.unit_type,
			term_in_weeks: this.prefundingData?.term_in_weeks,
			closer_agent_id: this.prefundingData?.closer_agent_id,
			total_points: this.prefundingData?.total_points,
			retail_points: this.prefundingData?.retail_points,
			upfront_fee: this.prefundingData?.upfront_fee,
			upfront_broker_commission_on: this.prefundingData?.upfront_broker_commission_on,
			agent_commision: this.prefundingData?.agent_commision,


		})


	}

	async getAgentList() {
		try {
			this.commonService.showSpinner();
			const res$ = this.apiService.getReq(API_PATH.AGENT_LIST, '', '');
			let response = await lastValueFrom(res$);
			if (response && response.data) {
				this.agentList = response.data;

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
	prefundForm() {
		this.createForm.markAllAsTouched();
		if (this.createForm.valid) {
			this.activeTab = 'Pre'
		}
	}
	async addCreateLenderOffer() {
		this.createForm.markAllAsTouched();
		if (this.createForm.valid) {
			let data = {
				...this.createForm.value,
				lead_id: this.leadID
			}
			try {
				this.commonService.showSpinner();
				const res$ = this.apiService.postReq(API_PATH.CREATE_LENDER_OFFER, data, 'lender', 'offer-create');
				let response = await lastValueFrom(res$);
				if (response.api_response == 'success') {
					this.commonService.showSuccess(response.message);
					this.router.navigate([`/${this.userBaseRoute}/lead-detail/` + this.leadID],
						{ queryParams: { activeTab: 'Lender Offers' } });
					// this.getPreFunding();
					// this.activeTab = 'Pre'
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
	async submitPreFund() {
		this.preFundForm.markAllAsTouched();
		if (this.preFundForm.valid) {
			let date: NgbDate = this.preFundForm.value.funding_date;
			let newDate = new Date(date.year, date.month - 1, date.day);
			let data = {
				...this.preFundForm.value,
				lead_id: this.leadID,
				funding_date: newDate.toLocaleDateString('en-CA'),
				agent: [],
			}
			for (let i = 0; i < this.preFundForm.value.agent_form.length; i++) {
				let ins = {
					agent_id: this.preFundForm.value.agent_form[i].agent_id,
					lender_commission: this.preFundForm.value.agent_form[i].lender_commission,
					upfront_commission: this.preFundForm.value.agent_form[i].upfront_commission
				}
				data.agent.push(ins);
			}
			try {
				this.commonService.showSpinner();
				const res$ = this.apiService.postReq(API_PATH.LEAD_PRE_FUND, data, 'lead', 'pre-funding');
				let response = await lastValueFrom(res$);
				if (response.api_response == 'success') {
					this.commonService.showSuccess(response.message)
					this.router.navigate([`/${this.userBaseRoute}/lead-detail/` + this.leadID]);
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
