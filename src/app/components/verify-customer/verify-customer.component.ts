import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { API_PATH } from '@constants/api-end-points';
import { SETTINGS } from '@constants/constants';
import { ApiService } from '@services/api.service';
import { AuthService } from '@services/auth.service';
import { CommonService } from '@services/common.service';
import { lastValueFrom } from 'rxjs';

@Component({
    selector: 'app-verify-customer',
    templateUrl: './verify-customer.component.html',
    styleUrls: ['./verify-customer.component.scss']
})
export class VerifyCustomerComponent implements OnInit {
    token: string = '';
    color: string = '#fa5440';
    exactColor: string = '#fa5440';

    constructor(
        private route: ActivatedRoute,
        private commonService: CommonService,
        private apiService: ApiService,
        private router: Router,
        private authService: AuthService
    ) { }

    ngOnInit(): void {
        this.commonService.showSpinner();
        let params = this.route.snapshot.params;
        let queryParams = this.route.snapshot.queryParams;
        if (queryParams && queryParams['c']) {
            this.exactColor = queryParams['c'];
            console.log("jhbyug", this.exactColor, queryParams['c'])
        }
        if (params && params['token']) {
            this.token = params['token'];
            this.verifyToken();
        } else {
            this.commonService.showError('');
            this.router.navigate(['/login'])
        }
    }

    async verifyToken() {
        try {
            const res$ = this.apiService.postReq(API_PATH.VERIFY_CUSTOMER, { token: this.token, color: this.exactColor }, '', '');
            let response = await lastValueFrom(res$);
            if (response && response.status_code == "200") {
                this.saveUserDetails(response);
                // this.router.navigate(['']);
            } else {
                this.commonService.showError(response.message);
                this.commonService.hideSpinner();
                this.router.navigate(['/login'])
            }
        } catch (error) {
            this.commonService.hideSpinner();
            this.commonService.showErrorMessage(error);
            this.router.navigate(['/login'])
        }
    }

    /**
     * @description save user details after login
     * @param response
     * @author Shine Dezign Infonet Pvt. Ltd. 
     * @returns {void}
     */
    saveUserDetails(response: any): void {
        const userData = {
            role: response.data.role,
            name: response.data.name,
            permissions: response.data.permissions,
            date_format: response.data.date_format,
            time_zone: response.data.time_zone,
            logoImage: response.data.logo_image,
            access_token: this.token,
            color: response.data.primary_color
        }
        const en = this.authService.encrypt(JSON.stringify(userData));
        localStorage.setItem(SETTINGS.USER_DETAILS, en);
        localStorage.setItem(SETTINGS.TOKEN_KEY, response.data.token);
        this.router.navigate([`/customer/lead-update/${response.data.lead_id}`])
    }
    // loader color
    ngDoCheck(): void {
        let data1 = document.getElementsByClassName('ngx-progress-bar ngx-progress-bar-ltr')[0] as HTMLInputElement
        // data1.style.color=`${this.color}!important`;
        data1.setAttribute('style', `color:${this.color}!important`)
        let data2 = document.getElementsByClassName('ngx-foreground-spinner center-center')[0] as HTMLInputElement
        data2.setAttribute('style', `color:${this.color}!important`)

    }
}
