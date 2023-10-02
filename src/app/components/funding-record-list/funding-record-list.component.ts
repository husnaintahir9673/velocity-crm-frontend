import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { API_PATH } from '@constants/api-end-points';
import { ApiService } from '@services/api.service';
import { AuthService } from '@services/auth.service';
import { CommonService } from '@services/common.service';
import moment from 'moment';
import { lastValueFrom, Subscription } from 'rxjs';

@Component({
    selector: 'app-funding-record-list',
    templateUrl: './funding-record-list.component.html',
    styleUrls: ['./funding-record-list.component.scss']
})
export class FundingRecordListComponent implements OnInit {
    lead: any = {};
    leadID: string = '';
    updatesList: Array<any> = [];
    updatepage: number = 1;
    limit: number = 10;
    total: number = 0;
    dateFormat: string = '';
    timeZone: string = '';
    companyType: string = ''
    style!: { fill: string; };
    background!: { background: string; };
    colorSubs!: Subscription;
    color!: string;
    constructor(private commonService: CommonService,
        private route: ActivatedRoute,
        private authService: AuthService,
        private apiService: ApiService) { }

    ngOnInit(): void {
        let params = this.route.snapshot.params;
        if (params && params['id']) {
            this.leadID = params['id'];
            this.getLeadUpdates();
        } else {
            this.commonService.showError('');
        }
        this.getUserDetails();

    }
    ngDoCheck(): void {

        this.getPaginationList();
    }
    getPaginationList() {

        let data = document.getElementsByClassName('ngx-pagination')[0]?.getElementsByTagName('li');
        for (let i = 0; i < data?.length; i++) {
            if (data[i].className == 'current' || data[i].className == 'current ng-star-inserted' || data[i].className == 'ng-star-inserted current') {
                data[i].style.background = this.color;
            } else {
                data[i].style.background = 'none';

            }
        }

    }

    /**
     * @description get lead updatessss
     */

    async getLeadUpdates() {
        try {
            let url = `?page_limit=${this.limit}&page=${this.updatepage}&id=${this.leadID}`;
            this.commonService.showSpinner();
            let res$ = this.apiService.getReq(API_PATH.GET_FUNDING_RECORDS + url, 'lead', 'list');
            let response = await lastValueFrom(res$);
            if (response && response.status_code == 200) {
                if (response.data.data) {
                    this.updatesList = response.data.data;
                    this.total = response.data.total
                } else {
                    this.updatesList = [];
                    this.total = 0;
                    this.updatepage = 1;
                }

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
    getUserDetails(): void {
        try {
            let ud = this.authService.getUserDetails();
            if (ud) {
                this.dateFormat = ud.date_format;
                this.timeZone = ud.time_zone;
                this.companyType = ud.company_type
                this.getColorOnUpdate();
                this.style = { fill: ud?.color };
                this.color = ud?.color;
                this.background = { background: ud?.color };
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
    getDate(date: any) {
        return moment(date).tz(this.timeZone).format(`${this.dateFormat} hh:mm:ss A`)
    }

    GetDate(date: any) {
        return moment(date).format(`${this.dateFormat}`)

    }
    getLeadBasicDetails(leadData: any) {
        this.lead = leadData;

    }
    /**
       * @description on page change
       * @returns {void}
       * @param p 
       */
    onPageChange(p: number): void {
        this.updatepage = p;
        this.getLeadUpdates();
    }
    get userBaseRoute() {
        return this.authService.getUserRole().toLowerCase();
    }
    getamount(lender_commission: any, upfront_commission: any) {
        let value = 0;
        if (upfront_commission) {
            value = Number(upfront_commission) * (Number(lender_commission) / 100);
            return '$' + value.toFixed(2)
        } else {
            return '';
        }



    }
    async deletePrefund(id: any): Promise<void> {
        try {
            let url = `?&id=${id}`;
            this.commonService.showSpinner();
            const res$ = this.apiService.getReq(API_PATH.DELETE_PREFUND_LIST + url, 'lender', 'offer-delete');
            let response = await lastValueFrom(res$);
            if (response && response.data) {
                this.commonService.showSuccess(response.message);
                this.updatesList = this.updatesList.filter(el => !id.includes(el.id));
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
