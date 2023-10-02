import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { API_PATH } from '@constants/api-end-points';
import { Custom_Regex } from '@constants/constants';
import { ApiService } from '@services/api.service';
import { AuthService } from '@services/auth.service';
import { CommonService } from '@services/common.service';
import { lastValueFrom, Subscription } from 'rxjs';

@Component({
	selector: 'app-creating-contract',
	templateUrl: './creating-contract.component.html',
	styleUrls: ['./creating-contract.component.scss']
})
export class CreatingContractComponent implements OnInit {
	contractForm!: FormGroup;
	leadID: string = '';
	userRole: string = '';
	lead: any = {};
	style!: { fill: string; };
	color!: string;
	background!: { background: string; };
	colorSubs!: Subscription;
	bool: boolean = false;
	bool1: boolean = false;
	constructor(
		private fb: FormBuilder,
		private apiService: ApiService,
		private commonService: CommonService,
		private route: ActivatedRoute,
		private router: Router,
		private authService: AuthService,
	) { }

	ngOnInit(): void {
		this.initcontractForm();
		let params = this.route.snapshot.params;
		if (params && params['id']) {
			this.leadID = params['id'];
		} else {
			this.commonService.showError('');
		}
		this.getUserDetails();
	}
	/**
   * @description initialize lead details form
   */
	initcontractForm() {
		this.contractForm = this.fb.group({
			specified_percentage: ['', [Validators.required, Validators.pattern(Custom_Regex.amount)]],
			origination: ['', [
				Validators.required,
				Validators.pattern(Custom_Regex.spaces),
				Validators.pattern(Custom_Regex.address),
				Validators.pattern(Custom_Regex.address2),
				Validators.minLength(3),
				Validators.maxLength(100)
			]],
			initial_amount_type: ['', [
				Validators.required,
				Validators.pattern(Custom_Regex.spaces),
				Validators.pattern(Custom_Regex.username),
				// Validators.minLength(3),
				// Validators.maxLength(100)
			]],
			payment_amount: ['', [Validators.required, Validators.pattern(Custom_Regex.amount)]],
			bank: ['', [
				Validators.required,
				Validators.pattern(Custom_Regex.spaces),
				Validators.pattern(Custom_Regex.username),
				Validators.pattern(Custom_Regex.name),
				Validators.minLength(3),
				Validators.maxLength(100)
			]],
			account_number: ['', [Validators.required, Validators.pattern(Custom_Regex.city)]],
			account_name: ['', [
				Validators.required,
				Validators.pattern(Custom_Regex.spaces),
				Validators.pattern(Custom_Regex.username),
				Validators.pattern(Custom_Regex.name),
				Validators.minLength(3),
				Validators.maxLength(100)]],
			routing_number: ['', [Validators.required, Validators.pattern(Custom_Regex.digitsOnly)]],
			funding_amount: ['', [Validators.required, Validators.pattern(Custom_Regex.amount)]],
			rtr: ['', [Validators.required, Validators.pattern(Custom_Regex.digitsOnly)]],
			overide_package_validation: [false, [Validators.requiredTrue]],
			display_suggested_offer: [false, [Validators.requiredTrue]],
		})

	}

	/**
	 * @description get lead detail form controls
	 */
	get f(): { [key: string]: AbstractControl } {
		return this.contractForm.controls;
	}
	async onSubmitContactForm() {
		this.contractForm.markAllAsTouched();
		if (this.contractForm.valid) {
			let data = {
				...this.contractForm.value,
				lead_id: this.leadID,
			}
			try {
				this.commonService.showSpinner();
				const res$ = this.apiService.postReq(API_PATH.CREATE_CONTRACT, data, 'lead', 'contract');
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
	specifiedPercentage(value: any) {
		if (value > 100) {
			this.commonService.showError("Specified percentage should be less than 100");
			this.contractForm.patchValue({ specified_percentage: '' })
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
	getLeadBasicDetails(leadData: any) {
		this.lead = leadData;

	}

	override() {
		if (this.contractForm.value.overide_package_validation === true) {
			this.bool = true;
		} else {
			this.bool = false;
		}

	}
	display_suggested() {
		if (this.contractForm.value.display_suggested_offer === true) {
			this.bool1 = true;

		} else {
			this.bool1 = false;
		}
	}

}

