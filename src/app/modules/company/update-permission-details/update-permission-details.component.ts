import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { API_PATH } from '@constants/api-end-points';
import { Custom_Regex } from '@constants/constants';
import { ApiService } from '@services/api.service';
import { AuthService } from '@services/auth.service';
import { CommonService } from '@services/common.service';
import { lastValueFrom } from 'rxjs';

@Component({
    selector: 'app-update-permission-details',
    templateUrl: './update-permission-details.component.html',
    styleUrls: ['./update-permission-details.component.scss']
})
export class UpdatePermissionDetailsComponent implements OnInit {
    permissions: any[] = [];
    form!: FormGroup;
    style!: { fill: string; };
    color!: string;
    background!: { background: string; };
    colorSubs: any;
    constructor(
        private commonService: CommonService,
        private apiService: ApiService,
        private route: ActivatedRoute,
        private fb: FormBuilder,
        private router: Router,
        private authService:AuthService
    ) { }

    ngOnInit(): void {
        this.form = this.fb.group({});
        this.getPermissionDetails();
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
     * @description fetch description details
     */
    async getPermissionDetails() {
        try {
            this.commonService.showSpinner();
            const res$ = this.apiService.getReq(API_PATH.PERMISSION_GROUP_LIST, 'permission', 'list');
            let response = await lastValueFrom(res$);
            if (response && response.data) {
                this.permissions = response.data;
                this.initForm();
            }
            this.commonService.hideSpinner();
        } catch (error: any) {
            this.commonService.hideSpinner();
            this.commonService.showErrorMessage(error);
        }
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
                let idsArr = [];
                let descArr = [];
                for (let i = 0; i < this.permissions.length; i++) {
                    idsArr.push(this.permissions[i].id);
                    descArr.push(this.form.value[this.permissions[i].name])
                }
                const res$ = this.apiService.postReq(API_PATH.UPDATE_PERMISSION_GROUP_LIST,{ group_id: idsArr, description: descArr}, 'permission', 'list');
                let response = await lastValueFrom(res$);
                if (response && response.status_code == "200") {
                    this.commonService.showSuccess(response.message);
                    this.router.navigate(['../roles'],{ relativeTo: this.route });
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

    /**
     * @description init form with data
     */
    initForm() {
        for (let i = 0; i < this.permissions.length; i++) {
            this.form.addControl(`${this.permissions[i].name}`, new FormControl(`${this.permissions[i].description}`, [Validators.required, Validators.pattern(Custom_Regex.spaces), Validators.maxLength(500), Validators.minLength(3), Validators.pattern(Custom_Regex.address), Validators.pattern(Custom_Regex.address2)]));
        }
    }

}
