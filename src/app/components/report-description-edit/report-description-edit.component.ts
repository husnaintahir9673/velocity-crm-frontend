import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { API_PATH } from '@constants/api-end-points';
import { Custom_Regex, SETTINGS } from '@constants/constants';
import { ApiService } from '@services/api.service';
import { AuthService } from '@services/auth.service';
import { CommonService } from '@services/common.service';
import { lastValueFrom, Subscription } from 'rxjs';


@Component({
    selector: 'app-report-description-edit',
    templateUrl: './report-description-edit.component.html',
    styleUrls: ['./report-description-edit.component.scss']
})
export class ReportDescriptionEditComponent implements OnInit {

    permissions: any[] = [];
    form!: FormGroup;
    reportDescription: any = {};
    reportDescriptionArray: Array<any> = [];
    color!:string;
    colorSubs!:Subscription;
    constructor(
        private commonService: CommonService,
        private apiService: ApiService,
        private route: ActivatedRoute,
        private fb: FormBuilder,
        private router: Router,
        private authService: AuthService
    ) { }

    ngOnInit(): void {
        this.form = this.fb.group({});
        this.getUserDetails();
        this.initForm();
    }
    /**
     * @description get form controls
     */
    get f() {
        return this.form.controls;
    }

    /**
     * @description on update permission 
     */
    async updatePermissions() {
        try {
            this.commonService.showSpinner();
            this.form.markAllAsTouched();
            if (this.form.valid) {
                const res$ = this.apiService.postReq(API_PATH.REPORT_DESCRIPTION_UPDATE, { report_description: this.form.value }, 'report', 'decription-update');
                let response = await lastValueFrom(res$);
                if (response && response.status_code == "200") {
                    this.updateUserSession();
                    this.commonService.showSuccess(response.message);
                    this.router.navigate([`/${this.userBaseRoute}/reports`]);
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
    updateUserSession(): void {
        try {
            let ud = this.authService.getUserDetails();
            if (ud) {
                let user = {};
                user = {
                    ...ud,
                    reports_decription: this.form.value
                }
                const en = this.authService.encrypt(JSON.stringify(user));
                localStorage.setItem(SETTINGS.USER_DETAILS, en);
                localStorage.setItem(SETTINGS.USER_DETAILS, en);
            }
        } catch (error: any) {
            this.commonService.showError(error.message);
        }
    }

    /**
     * @description init form with data
     */
    initForm() {
        const KEYS = Object.keys(this.reportDescription);
        for (let i = 0; i < KEYS.length; i++) {
            this.reportDescriptionArray.push({
                name: KEYS[i],
                value: this.reportDescription[KEYS[i]]
            })
        }
        for (let i = 0; i < this.reportDescriptionArray.length; i++) {
            this.form.addControl(`${this.reportDescriptionArray[i].name}`, new FormControl(`${this.reportDescriptionArray[i].value}`, [Validators.required, Validators.pattern(Custom_Regex.spaces),Validators.pattern(Custom_Regex.address), Validators.pattern(Custom_Regex.address2), Validators.maxLength(500), Validators.minLength(3)]));

        }
    }
    get userBaseRoute() {
        return this.authService.getUserRole().toLowerCase();
    }
    getUserDetails() {
        let ud = this.authService.getUserDetails();
        if (ud) {
            this.reportDescription = ud.reports_decription;
            this.getColorOnUpdate();
            // this.style={fill:ud?.color};
            this.color=ud?.color;
                // this.stroke={stroke:ud?.color};
                // this.background={background:ud?.color};
        }
    }
    getColorOnUpdate() {
        this.colorSubs = this.authService.getColor().subscribe((u) => {
          this.getUserDetails();
        });
      }

}

