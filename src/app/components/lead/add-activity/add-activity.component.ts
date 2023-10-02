import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { API_PATH } from '@constants/api-end-points';
import { Custom_Regex, Roles } from '@constants/constants';
import { ApiService } from '@services/api.service';
import { AuthService } from '@services/auth.service';
import { CommonService } from '@services/common.service';
import { lastValueFrom, Subscription } from 'rxjs';

export const DateTimeValidator = (fc: FormControl) => {
	const date = new Date(fc.value);
	const isValid = !isNaN(date.valueOf());
	return isValid ? null : {
		isValid: {
			valid: false
		}
	};
};
@Component({
	selector: 'app-add-activity',
	templateUrl: './add-activity.component.html',
	styleUrls: ['./add-activity.component.scss']
})
export class AddActivityComponent implements OnInit {
	addActivityForm!: FormGroup;
	leadID: string = '';
	assineesList: Array<any> = [];
	hasMoreAssinees: boolean = false;
	assineeListPage: number = 1;
	dateModel: Date = new Date();
	stringDateModel: string = new Date().toString();
	userRole: string = '';
	style!: { fill: string; };
	color!: string;
	background!: { background: string; };
	colorSubs!: Subscription;
	checkBox: boolean =false;
	checkBox2: boolean =false;
	constructor(
		private fb: FormBuilder,
		private route: ActivatedRoute,
		private commonService: CommonService,
		private apiService: ApiService,
		private router: Router,
		private authService: AuthService
	) { }

	ngOnInit(): void {
		let params = this.route.snapshot.params;
		if (params && params['id']) {
			this.leadID = params['id'];

		} else {
			this.commonService.showError('');
		}
		this.initActivityForm();
		this.getAssignedOptions();
		this.getUserDetails();
	}

	get userBaseRoute() {
        return this.authService.getUserRole().toLowerCase();
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

	/**
	 * @description initialize  add activity form
	 * @author Shine Dezign Infonet Pvt. Ltd.
	 */
	initActivityForm() {
		this.addActivityForm = this.fb.group({
			activity_type: ['TODO', [Validators.required, Validators.pattern(Custom_Regex.spaces)]],
			start_date: [new Date(), [Validators.required, DateTimeValidator]],
			assigned_to: ['', [Validators.required]],
			event_type: ['', [Validators.required]],
			comment: ['', [
				// Validators.pattern(Custom_Regex.spaces), 
				Validators.pattern(Custom_Regex.address), 
				Validators.pattern(Custom_Regex.address2),
				Validators.minLength(3), 
				Validators.maxLength(1000)]
			],
			subject: ['', [
				Validators.required, 
				Validators.pattern(Custom_Regex.spaces), 
				Validators.pattern(Custom_Regex.username), 
				Validators.pattern(Custom_Regex.name),
				Validators.minLength(3), 
				Validators.maxLength(100)]
			],
		});
		if(this.addActivityForm.value.activity_type == 'TODO'){
			this.checkBox = true;
		}else{
			this.checkBox = false;
		}
	}

	/**
	 * @description formcontrols getters
	 * @author Shine Dezign Infonet Pvt. Ltd.
	 * @returns { [key: string]: AbstractControl }
	 */
	get f(): { [key: string]: AbstractControl } {
		return this.addActivityForm.controls;
	}

	async addActivitySubmit(): Promise<void> {
		this.addActivityForm.markAllAsTouched();
		if (this.addActivityForm.valid) {
			try {
				let data = {
					...this.addActivityForm.value,
					// start_date: this.addActivityForm.value.start_date.toLocaleDateString('en-CA') + ' ' +this.addActivityForm.value.start_date.toLocaleTimeString(),
					comment: this.addActivityForm.value.comment.trim(),
					event_type: this.addActivityForm.value.event_type.name,
					lead_id: this.leadID

				}
				this.commonService.showSpinner();
				const res$ = this.apiService.postReq(API_PATH.ADD_ACTIVITY, data, 'lead-activity', 'add');
				let response = await lastValueFrom(res$);
				if (response) {
					this.commonService.showSuccess(response.message);
					this.router.navigate([`/${this.userBaseRoute}/lead-detail/` + this.leadID],
						{ queryParams: { activeTab: 'activities' } });
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
	async getAssignedOptions() {
		try {
			let url = `?page_limit=15&page=${this.assineeListPage}&role=${Roles.UNDERWRITER}`;
			this.commonService.showSpinner();
			const res$ = this.apiService.getReq(API_PATH.LIST_FOR_USERS + url, 'user', 'list');
			let response = await lastValueFrom(res$);
			if (response && response.data) {
				this.hasMoreAssinees = response.data.hasMorePages;
				this.assineesList = response.data;

			} else {
				this.assineesList = [];
				this.hasMoreAssinees = false;
				this.assineeListPage = 1;
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
	 * @description implement pagination
	 */
	getMoreCompanies() {
		if (this.hasMoreAssinees) {
			this.assineeListPage++;
			this.getAssignedOptions();
		}
	}
	checkBoxColor(value:any){
if(value == 'TODO'){
	this.checkBox = true;
}else{
	this.checkBox = false;
} if(value == 'EVENT'){
this.checkBox2 = true;
}else{
	this.checkBox2 = false;
}
	}

}
