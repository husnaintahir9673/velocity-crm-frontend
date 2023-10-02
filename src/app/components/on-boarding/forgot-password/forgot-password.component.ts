import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Custom_Regex } from '@constants/constants';
import { API_PATH } from '@constants/api-end-points';
import { ApiService } from '@services/api.service';
import { lastValueFrom } from 'rxjs';
import { CommonService } from '@services/common.service';
import { Router } from '@angular/router';

@Component({
    selector: 'app-forgot-password',
    templateUrl: './forgot-password.component.html',
    styleUrls: ['./forgot-password.component.scss']
})
export class ForgotPasswordComponent implements OnInit {
    forgotPasswordForm!: FormGroup;

    constructor(
        private fb: FormBuilder,
        private apiService: ApiService,
        private commonService: CommonService,
        private router: Router
    ) { }

    ngOnInit(): void {
        this.initForgotPassForm();
    }

    /**
     * @description initialize form
     * @author Shine Dezign Infonet Pvt. Ltd.
     * @returns {void}
     */
    initForgotPassForm(): void {
        this.forgotPasswordForm = this.fb.group({
            email: ['', [Validators.required, Validators.pattern(Custom_Regex.email)]]
        })
    }

    /**
     * @description get form controls
     * @author Shine Dezign Infonet Pvt. Ltd.
     * @returns { [key: string]: AbstractControl }
     */
    get f(): { [key: string]: AbstractControl } {
        return this.forgotPasswordForm.controls;
    }

    /**
     * @description submit form
     * @author Shine Dezign Infonet Pvt. Ltd.
     * @returns {Promise<void>}
     */
    async onSubmit(): Promise<void> {
        this.forgotPasswordForm.markAllAsTouched();
        if (this.forgotPasswordForm.valid) {
            try {
                this.commonService.showSpinner();
                const res$ = this.apiService.postReq(API_PATH.FORGOT_PASSWORD, { email: this.forgotPasswordForm.value.email.trim() },'','');
                let response = await lastValueFrom(res$);
                if (response && response.data) {
                    this.commonService.showSuccess(response.message);
                    this.router.navigate(['/login']);
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

}
