import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { API_PATH } from '@constants/api-end-points';
import { ApiService } from '@services/api.service';
import { AuthService } from '@services/auth.service';
import { CommonService } from '@services/common.service';
import { lastValueFrom } from 'rxjs';

@Component({
    selector: 'app-fund-records',
    templateUrl: './fund-records.component.html',
    styleUrls: ['../../../styles/dashboard.scss', './fund-records.component.scss']
})
export class FundRecordsComponent implements OnInit {
    leadID: string = '';
    commissionDetails: any = {};
    totalPaybackAmount: number = 0;
    lead: any = {};
    constructor(
        private route: ActivatedRoute,
        private commonService: CommonService,
        private apiService: ApiService,
        private authService: AuthService
    ) { }

    ngOnInit(): void {
        let params = this.route.snapshot.params;
        if (params && params['id']) {
            this.leadID = params['id'];
            this.getCommissionDetails();

        } else {
            this.commonService.showError('');
        }
    }

    async getCommissionDetails() {

        try {
            this.commonService.showSpinner();
            const res$ = this.apiService.postReq(API_PATH.COMMISSION_DETAILS, { lead_id: this.leadID, }, 'lead', 'fund-record');
            let response = await lastValueFrom(res$);
            if (response && response.data) {
                this.commissionDetails = response.data;
                let total = 0;
                this.commissionDetails?.lender.map((result: { payment: any; }) => {
                    total += Number(result.payment)
                });
                this.totalPaybackAmount = total;
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
    getLeadBasicDetails(leadData: any) {
        this.lead = leadData;
        
    }
    get userBaseRoute() {
        return this.authService.getUserRole().toLowerCase();
    }
}