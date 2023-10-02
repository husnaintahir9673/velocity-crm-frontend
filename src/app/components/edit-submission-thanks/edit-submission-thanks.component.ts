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
  selector: 'app-edit-submission-thanks',
  templateUrl: './edit-submission-thanks.component.html',
  styleUrls: ['./edit-submission-thanks.component.scss']
})
export class EditSubmissionThanksComponent implements OnInit {
  submissionForm!: FormGroup;
  companyID: string = '';
  background!: { background: string; };
  colorSubs!: Subscription;
  constructor(
    private fb: FormBuilder,
    private commonService: CommonService,
    private route: ActivatedRoute,
    private apiService: ApiService,
    private router: Router,
    private authService: AuthService

  ) { }

  ngOnInit(): void {
    this.initAddUserForm();
    this.getThanksMessage();
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
    return this.submissionForm.controls;
  }


  /**
   * @description initialize add compnay form
   * @author Shine Dezign Infonet Pvt. Ltd.
   * @returns {void}
   */
  initAddUserForm(): void {
    this.submissionForm = this.fb.group({
      thanks_message: ['', [
        Validators.required, 
        Validators.pattern(Custom_Regex.spaces),
        Validators.pattern(Custom_Regex.address),
        Validators.pattern(Custom_Regex.address2),
        Validators.maxLength(1000),
        Validators.minLength(3)
      ]],

    })
  }
  async getThanksMessage() {
    try {
 
        this.commonService.showSpinner();
        const res$ = this.apiService.postReq(API_PATH.GET_THANKS_MESSAGE , {},'profile', 'update');
        let response = await lastValueFrom(res$);
        if (response && response.data) {
          
          this.submissionForm.patchValue({
            thanks_message: response.data,
        })
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
async updateThanksMessage() {
  try {
  
      this.commonService.showSpinner();
      const res$ = this.apiService.postReq(API_PATH.UPDATE_THANX_MESSAGE , this.submissionForm.value,'profile', 'update');
      let response = await lastValueFrom(res$);
      if (response) {
        this.commonService.showSuccess(response.message);
        this.router.navigate([`/${this.userBaseRoute}`]);
      
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
get userBaseRoute() {
  return this.authService.getUserRole().toLowerCase();
}



}
