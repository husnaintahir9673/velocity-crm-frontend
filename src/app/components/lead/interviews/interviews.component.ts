import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { API_PATH } from '@constants/api-end-points';
import { Custom_Regex, Roles } from '@constants/constants';
import { ApiService } from '@services/api.service';
import { AuthService } from '@services/auth.service';
import { CommonService } from '@services/common.service';
import { lastValueFrom, Subscription } from 'rxjs';

@Component({
	selector: 'app-interviews',
	templateUrl: './interviews.component.html',
	styleUrls: ['./interviews.component.scss']
}
)
export class InterviewsComponent implements OnInit {
	activeTab: string = 'Lanloards';
	landLordForm!: FormGroup;
	merchantForm!: FormGroup;
	leadID: string = '';
	userRole: string = '';
	role = Roles;
	cantakeMerchantInterview: boolean = false;
	cantakeLandlordInterview: boolean = false;
	lead: any = {};
	style!: { fill: string; };
	color!: string;
	background!: { background: string; };
	colorSubs!: Subscription;
	boolCondition:boolean = false;
	boolCondition1:boolean = false;
	boolCondition2:boolean = false;
	constructor(
		private fb: FormBuilder,
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
		} else {
			this.commonService.showError('');
		}
		this.initLandlordForm();
		this.initMerchantForm();
		this.getUserDetails();
		this.cantakeMerchantInterview = this.authService.hasPermission('lead-merchant-interview');
		this.cantakeLandlordInterview = this.authService.hasPermission('lead-landlord-interview');
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
				this.style={fill:ud?.color};
			 this.color=ud?.color;
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

	lanlordInterviewsTab() {
		if (this.cantakeLandlordInterview) {
			this.activeTab = 'Lanloards'
		} else {
			// this.router.navigate([`/${this.userBaseRoute}/lead-detail/${this.leadID}`])
			this.commonService.showError('You do not have required authorization')
		}
	}
	merchantInterviewsTab() {
		// this.landLordForm.markAllAsTouched();
		// && this.landLordForm.valid
		if (this.cantakeMerchantInterview) {
			this.activeTab = 'Merchants'
		} 
		// else if (this.landLordForm.invalid) {
		// 	this.landLordForm.markAllAsTouched();
		// }
		else {
			// this.router.navigate([`/${this.userBaseRoute}/lead-detail/${this.leadID}`])
			this.commonService.showError('You do not have required authorization')
		}
	}

	initLandlordForm() {
		this.landLordForm = this.fb.group({
			landlord_name: ['', [
				Validators.pattern(Custom_Regex.lettersOnly), 
				Validators.required,
                Validators.pattern(Custom_Regex.spaces), 
                Validators.maxLength(100),
				Validators.minLength(3)
			]],
			renting_property: ['',[
				Validators.pattern(Custom_Regex.address), 
				Validators.pattern(Custom_Regex.address2),
				Validators.pattern(Custom_Regex.spaces), 
                Validators.maxLength(100),
			]],
			lease_detail: ['', [
				Validators.pattern(Custom_Regex.address), 
				Validators.pattern(Custom_Regex.address2),
				Validators.pattern(Custom_Regex.spaces), 
                Validators.maxLength(100),
			]],
			plan_on_renewing: ['', [
				Validators.pattern(Custom_Regex.address), 
				Validators.pattern(Custom_Regex.address2),
				Validators.pattern(Custom_Regex.spaces), 
                Validators.maxLength(100),
			]],
			monthly_rent: ['', [
                Validators.pattern(Custom_Regex.spaces), 
                Validators.maxLength(100),
				Validators.minLength(3)
			]],
			how_rent_paid: ['', [
				Validators.pattern(Custom_Regex.address),
				Validators.pattern(Custom_Regex.address2), 
				Validators.pattern(Custom_Regex.spaces), 
                Validators.maxLength(100),
			]],
			upto_date_payments: ['', [
				Validators.pattern(Custom_Regex.address),
				Validators.pattern(Custom_Regex.address2), 
				Validators.pattern(Custom_Regex.spaces), 
                Validators.maxLength(100),
			]],
			any_late_payment: ['', [
				Validators.pattern(Custom_Regex.address),
				Validators.pattern(Custom_Regex.address2), 
				Validators.pattern(Custom_Regex.spaces), 
                Validators.maxLength(100),
			]],
			overall_tenant: ['', [
				Validators.pattern(Custom_Regex.address),
				Validators.pattern(Custom_Regex.address2), 
				Validators.pattern(Custom_Regex.spaces), 
                Validators.maxLength(100),
			]],
			mark_complete: [false, [Validators.pattern(Custom_Regex.spaces)]],
			note: ['', [
				Validators.pattern(Custom_Regex.address),
				Validators.pattern(Custom_Regex.address2), 
				// Validators.pattern(Custom_Regex.spaces), 
                Validators.maxLength(1000),
				Validators.minLength(10)
			]],
		})
	}

	initMerchantForm() {
		this.merchantForm = this.fb.group({
			called_by_name: ['', [
				Validators.required, 
				Validators.pattern(Custom_Regex.lettersOnly),
				Validators.pattern(Custom_Regex.spaces), 
				Validators.maxLength(100),
				Validators.minLength(3)
			]],
			accept_call_recording: [true],
			business_name: ['', [
				Validators.pattern(Custom_Regex.username),
				Validators.pattern(Custom_Regex.spaces),
				Validators.pattern(Custom_Regex.name), 
				Validators.maxLength(100),
				Validators.minLength(3)
			]],
			business_email: ['',[
				Validators.pattern(Custom_Regex.email),
				Validators.pattern(Custom_Regex.spaces), 
			]],
			percent_of_ownership: ['',[
				Validators.pattern(Custom_Regex.spaces),
				Validators.pattern(Custom_Regex.amount),
			]],
			other_business: [false],
			other_business_details: ['',[
				Validators.pattern(Custom_Regex.address),
				Validators.pattern(Custom_Regex.address2),
				Validators.pattern(Custom_Regex.spaces), 
				Validators.maxLength(100),
				Validators.minLength(3)
			]],
			business_physical_address: ['',[
				Validators.pattern(Custom_Regex.address),
				Validators.pattern(Custom_Regex.address2),
				Validators.pattern(Custom_Regex.spaces), 
				Validators.maxLength(200),
				Validators.minLength(3)
			]],
			any_other_location: ['', [
					Validators.pattern(Custom_Regex.address),
					Validators.pattern(Custom_Regex.address2),
					Validators.pattern(Custom_Regex.spaces), 
					Validators.maxLength(200),
					Validators.minLength(3)
			]],
			about_your_business: ['',[
				Validators.pattern(Custom_Regex.address),
				Validators.pattern(Custom_Regex.address2),
				Validators.pattern(Custom_Regex.spaces), 
				Validators.maxLength(200),
				Validators.minLength(3)
		]],
			your_experience: ['',[
				Validators.pattern(Custom_Regex.address),
				Validators.pattern(Custom_Regex.address2),
				Validators.pattern(Custom_Regex.spaces), 
				Validators.maxLength(100),
				Validators.minLength(3)
		]],
			business_been_active: ['',[
				Validators.pattern(Custom_Regex.address),
				Validators.pattern(Custom_Regex.address2),
				Validators.pattern(Custom_Regex.spaces), 
				Validators.maxLength(100),
				Validators.minLength(3)
		]]
		})
		if(this.merchantForm.value.accept_call_recording === true){
			this.boolCondition1 = true;
		}else{
			this.boolCondition1 = false;
		}
		if(this.merchantForm.value.other_business === true){
			this.boolCondition2 = true;
		}else{
			this.boolCondition2 = false;
		}
	}


	/**
	 * @description get lead detail form controls
	 */
	get f(): { [key: string]: AbstractControl } {
		return this.landLordForm.controls;
	}
	get m(): { [key: string]: AbstractControl } {
		return this.merchantForm.controls;
	}

	async landlordInterviewSubmit() {
		try {
			this.commonService.showSpinner();
			this.landLordForm.markAllAsTouched();
			if (this.landLordForm.valid) {
				let data = {
					...this.landLordForm.value,
					lead_id: this.leadID,
					note: this.landLordForm.value.note.trim()
				}
				const res$ = this.apiService.postReq(API_PATH.LANDLORD_INTERVIEW, data, 'lead', 'view');
				const response = await lastValueFrom(res$);
				if (response && response.status_code == "200") {
					// this.activeTab = 'Merchants'
					this.router.navigate([`/${this.userBaseRoute}/lead-detail/${this.leadID}`])
					this.commonService.showSuccess(response.message);
				} else {
					this.commonService.showError(response.message);
				}
				this.commonService.hideSpinner();
			} else {
				this.commonService.hideSpinner();
			}

		} catch (error) {
			this.commonService.hideSpinner();
			this.commonService.showErrorMessage(error);
		}
	}

	async merchantInterviewSubmit() {
		this.merchantForm.markAllAsTouched();
		try {
			this.commonService.showSpinner();
			if (this.merchantForm.valid) {
				let data = {
					...this.merchantForm.value,
					lead_id: this.leadID,
					accept_call_recording: this.merchantForm.value.accept_call_recording ? 1 : 0,
					other_business: this.merchantForm.value.other_business ? 1 : 0,
				}
				const res$ = this.apiService.postReq(API_PATH.MERCHANT_INTERVIEW, data, 'lead', 'view');
				const response = await lastValueFrom(res$);
				if (response && response.status_code == "200") {
					this.router.navigate([`/${this.userBaseRoute}/lead-detail/${this.leadID}`])
					this.commonService.showSuccess(response.message);
				} else {
					this.commonService.showError(response.message);
				}
			} else {
				this.commonService.showError('Caller name is required');
				this.commonService.hideSpinner();
			}
		} catch (error) {
			this.commonService.hideSpinner();
			this.commonService.showErrorMessage(error);
		}
	}

	get userBaseRoute() {
		return this.authService.getUserRole().toLowerCase();
	}
	getLeadBasicDetails(leadData: any) {
		this.lead = leadData;

	}
	getCheckBox(e:any){
		let data = document.getElementById('flexChec') as HTMLInputElement
		if(data.checked === true){
			this.boolCondition = true;
		}else{
			this.boolCondition = false;

		}
		}
		toggleValue(e:any){
			let data = this.merchantForm.value.accept_call_recording
			if(data){
				this.boolCondition1 = true;
			}else{
				this.boolCondition1 = false;
			}
		
			let data2 = this.merchantForm.value.other_business;
			if(data2){
				this.boolCondition2 = true;
			}else{
				this.boolCondition2 = false;
			}
		}

}
