import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { FormGroup, FormBuilder, Validators, AbstractControl } from '@angular/forms';
import { API_PATH } from '@constants/api-end-points';
import { Custom_Regex } from '@constants/constants';
import { ApiService } from '@services/api.service';
import { AuthService } from '@services/auth.service';
import { CommonService } from '@services/common.service';
import { lastValueFrom, Subscription } from 'rxjs';

@Component({
    selector: 'app-change-password',
    templateUrl: './change-password.component.html',
    styleUrls: ['./change-password.component.scss']
})
export class ChangePasswordComponent implements OnInit {
    changePasswordForm!: FormGroup;
    passwordType: boolean = true;
    newpasswordType: boolean = true
    confirmpasswordType: boolean = true;

    @Output() closeModal: EventEmitter<any> = new EventEmitter();
    style!: { fill: string; };
    background!: { background: string; };
    colorSubs!: Subscription;
    constructor(
        private fb: FormBuilder,
        private commonService: CommonService,
        private apiService: ApiService,
        private authService:AuthService
    ) { }

    ngOnInit(): void {
        this.initChangePasswordForm();
        this.getUserDetails();
    }
    getUserDetails(): void {
        try {
            let ud = this.authService.getUserDetails();
            if (ud) {
                this.getColorOnUpdate();
                this.style={fill:ud?.color};
                // this.color=ud?.color;
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

    /**
     * @description initialize chnage password form
     * @author Shine Dezign Infonet Pvt. Ltd.
     */
    initChangePasswordForm() {
        this.changePasswordForm = this.fb.group({
            old_password: ['', [Validators.required, Validators.pattern(Custom_Regex.spaces)]],
            password: ['', [Validators.required, Validators.pattern(Custom_Regex.password), Validators.maxLength(16)]],
            password_confirmation: ['', [Validators.required]]
        }, { validators: this.commonService.checkPasswords })
    }

    /**
     * @description change passsword submit
     * @returns {Promise<void>}
     * @author Shine Dezign Infonet Pvt. Ltd.
     */
    async changePasswordSubmit(): Promise<void> {
        this.changePasswordForm.markAllAsTouched();
        if (this.changePasswordForm.valid) {
            try {
                this.commonService.showSpinner();
                const res$ = this.apiService.postReq(API_PATH.CHANGE_PASSWORD, this.changePasswordForm.value, 'password', 'update');
                let response = await lastValueFrom(res$);
                if (response) {
                    this.commonService.showSuccess(response.message);
                    this.closeModal.emit();
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

    /**
     * @description formcontrols getters
     * @author Shine Dezign Infonet Pvt. Ltd.
     * @returns { [key: string]: AbstractControl }
     */
    get f(): { [key: string]: AbstractControl } {
        return this.changePasswordForm.controls;
    }

}
