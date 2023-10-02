import { Component, OnInit } from '@angular/core';
import { API_PATH } from '@constants/api-end-points';
import { ApiService } from '@services/api.service';
import { AuthService } from '@services/auth.service';
import { CommonService } from '@services/common.service';
import { lastValueFrom } from 'rxjs';

@Component({
    selector: 'app-dashboard',
    templateUrl: './dashboard.component.html',
    styleUrls: ['../../../styles/dashboard.scss','./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
    canListLead: boolean = false;
    dashboardData: any = {};
    constructor(
        private commonService: CommonService,
        private apiService: ApiService,
        private authService: AuthService
    ) { }

    ngOnInit(): void {
        this.canListLead = this.authService.hasPermission('lead-list');
        this.getDashboardData();
    }

    /**
     * @description get data from api for stats
     * @author Shine Dezign Infonet Pvt. Ltd.
     * @returns {Promise<void>}
     */
     async getDashboardData(): Promise<any> {
        try {
            this.commonService.showSpinner();
            const res$ = this.apiService.getReq(API_PATH.DASHBOARD,'','');
            let response = await lastValueFrom(res$);
            if (response && response.data) {
                this.dashboardData = response.data;
                
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
