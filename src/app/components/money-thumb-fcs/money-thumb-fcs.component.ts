import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { API_PATH } from '@constants/api-end-points';
import { ApiService } from '@services/api.service';
import { AuthService } from '@services/auth.service';
import { CommonService } from '@services/common.service';
import moment from 'moment';
import { lastValueFrom, Subscription } from 'rxjs';

@Component({
    selector: 'app-money-thumb-fcs',
    templateUrl: './money-thumb-fcs.component.html',
    styleUrls: ['./money-thumb-fcs.component.scss']
})
export class MoneyThumbFcsComponent implements OnInit {

    lead: any = {};
    leadID: string = '';
    updatesList: Array<any> = [];
    updatepage: number = 1;
    limit: number = 10;
    total: number = 0;
    dateFormat: string = '';
    timeZone: string = '';
    style!: { fill: string; };
    background!: { background: string; };
    colorSubs!: Subscription;
    color!: string;
    documentID:any;
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
            // let url = `?page_limit=${this.limit}&page=${this.updatepage}&id=${this.leadID}`;
            let data = {
                page_limit:this.limit,
                page:this.updatepage,
                lead_id:this.leadID
            }
            this.commonService.showSpinner();
            let res$ = this.apiService.postReq(API_PATH.MONEY_THUMB_DOCUMENT_LIST , data, 'lead', 'view');
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
    async getPushedDocs( docId:any) {
        try {
            let data = {
               document_id:docId,
                lead_id:this.leadID
            }
            this.commonService.showSpinner();
            let res$ = this.apiService.postReq(API_PATH.MONEY_THUMB_PUSH_DOCS , data, 'lead', 'view');
            let response = await lastValueFrom(res$);
            if (response && response.status_code == 200) {
                this.commonService.showSuccess(response.message);
                    this.getLeadUpdates();

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
    async getReflectFcsScore( docId:any) {
        try {
            let data = {
               document_id:docId,
                lead_id:this.leadID
            }
            this.commonService.showSpinner();
            let res$ = this.apiService.postReq(API_PATH.MONEY_THUMB_SCORE_CARD , data, 'lead', 'view');
            let response = await lastValueFrom(res$);
            if (response && response.status_code == 200) {
                this.commonService.showSuccess(response.message);
                    this.getLeadUpdates();

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
    getMonthName(monthDate:any){
        let monthName = new Date(monthDate).toLocaleString('en-us',{month:'long'})
        return monthName;
    }
    getUserDetails(): void {
        try {
            let ud = this.authService.getUserDetails();
            if (ud) {
                this.dateFormat = ud.date_format;
                this.timeZone = ud.time_zone;
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

