import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { API_PATH } from '@constants/api-end-points';
import { Custom_Regex, Mask, Roles } from '@constants/constants';
import { ApiService } from '@services/api.service';
import { AuthService } from '@services/auth.service';
import { CommonService } from '@services/common.service';
import { lastValueFrom, Subscription } from 'rxjs';

@Component({
    selector: 'app-welcome-call',
    templateUrl: './welcome-call.component.html',
    styleUrls: ['./welcome-call.component.scss']
})
export class WelcomeCallComponent implements OnInit {
    welcomecallForm!: FormGroup;
    leadID: string =  '';
    userRole: string = '';
    mask = Mask;
    lead: any = {};
    style!: { fill: string; };
    background!: { background: string; };
    colorSubs!: Subscription;
    color!: string;
    boolCondition: boolean = false;

    constructor(
        private fb: FormBuilder,
        private apiService: ApiService,
        private commonService: CommonService,
        private route: ActivatedRoute,
        private router: Router,
        private authService: AuthService,
        ) { }

    ngOnInit(): void {
        this.initWelcomeForm();
        let params = this.route.snapshot.params;
		if (params && params['id']) {
			this.leadID = params['id'];
		} else {
			this.commonService.showError('');
		}
        this.getUserDetails();
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
                    // this.stroke={stroke:ud?.color};
                 
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
    get userBaseRoute() {
        return this.authService.getUserRole().toLowerCase();
    }

    initWelcomeForm(): void {
        this.welcomecallForm = this.fb.group({
            any_question: [''],
            name: ['', [Validators.required ,Validators.pattern(Custom_Regex.spaces), Validators.minLength(3), Validators.maxLength(100), Validators.pattern(Custom_Regex.lettersOnly)]],
            cell_phone: ['', [Validators.required , Validators.pattern(Custom_Regex.digitsOnly)]],
            mark_complete: [false],
        });
		if(this.welcomecallForm.value.mark_complete === true){
			this.boolCondition = true;
		}else{
			this.boolCondition = false;

		}
    }

    get f(): { [key: string]: AbstractControl } {
        return this.welcomecallForm.controls;
    }

    async submitWelcomeForm() {
        this.welcomecallForm.markAllAsTouched();
        if (this.welcomecallForm.valid) {
            let data = {
				...this.welcomecallForm.value,
                any_question: this.welcomecallForm.value.any_question.trim(),
				lead_id: this.leadID
			}
			try {
				this.commonService.showSpinner();
				const res$ = this.apiService.postReq(API_PATH.LEAD_WELCOME_CALL, data, 'lead', 'welcome-call');
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
    getCheckBox(e:any){
		let data = this.welcomecallForm.value.mark_complete;
		if(data === true){
			this.boolCondition = true;
		}else{
			this.boolCondition = false;

		}
		}

}
