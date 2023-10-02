import { Component, Input, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { API_PATH } from '@constants/api-end-points';
import { NgbDateParserFormatter } from '@ng-bootstrap/ng-bootstrap';
import { ApiService } from '@services/api.service';
import { AuthService } from '@services/auth.service';
import { CommonService } from '@services/common.service';
import moment from 'moment';
import { lastValueFrom, Subscription } from 'rxjs';

@Component({
    selector: 'app-related-deals',
    templateUrl: './related-deals.component.html',
    styleUrls: ['./related-deals.component.scss']
})
export class RelatedDealsComponent implements OnInit {
    leadID: string = '';
    relatedDealsList: Array<any> = [];
    page: number = 1;
    limit: number = 10;
    total: number = 0;
    dateFormat: string = '';
    timeZone: string = '';
    hasMoreUsers: boolean = false;
    @Input() leadDetails: any = {};
    style!: { fill: string; };
    background!: { background: string; };
    colorSubs!: Subscription;
    color!: string;

    constructor(
        private route: ActivatedRoute,
        private commonService: CommonService,
        private apiService: ApiService,
        public formatter: NgbDateParserFormatter,
        private authService: AuthService,
        private router: Router
    ) { }

    ngOnInit(): void {
        let params = this.route.snapshot.params;
        if (params && params['id']) {
            this.leadID = params['id'];
            this.getRelatedDealsList();
        } else {
            this.commonService.showError('');
        }
        this.getUserDetails();
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
    ngDoCheck(): void {

        this.getPaginationList();
    }
    getPaginationList() {
    // change index 0 -> 1
        let data = document.getElementsByClassName('ngx-pagination')[1]?.getElementsByTagName('li');
        for (let i = 0; i < data?.length; i++) {
            if (data[i].className == 'current' || data[i].className == 'current ng-star-inserted' || data[i].className == 'ng-star-inserted current') {
                data[i].style.background = this.color;
            } else {
                data[i].style.background = 'none';

            }
        }



    }

  
    get userBaseRoute() {
        return this.authService.getUserRole().toLowerCase();
    }

    /**
     * @description on page change
     * @returns {void}
     * @param p 
     */
    onPageChange(p: number): void {
        this.page = p;
        this.getRelatedDealsList();
    }
    async getRelatedDealsList() {
        try {
            let url = `?&page_limit=${this.limit}&page=${this.page}&lead_id=${this.leadID}`;
            this.commonService.showSpinner();
            let res$ = this.apiService.getReq(API_PATH.RELATED_DEALS + url, 'related', 'deals');
            let response = await lastValueFrom(res$);
            if (response && response.status_code == 200) {
                if (response.data && response.data.data) {
                    this.hasMoreUsers = response.data.hasMorePages;
                    this.relatedDealsList = response.data.data;
                    this.total = response.data.total
                } else {
                    this.relatedDealsList = [];
                    this.hasMoreUsers = false;
                    this.total = 0;
                    this.page = 1;
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
 
    getColorOnUpdate() {
        this.colorSubs = this.authService.getColor().subscribe((u) => {
            this.getUserDetails();
        });
    }
    getDate(date: any) {
        return moment(date).tz(this.timeZone).format(`${this.dateFormat} hh:mm:ss A`)
    }
    leadDetailsLink(id: any) {
        const url = this.router.serializeUrl(this.router.createUrlTree([`/${this.userBaseRoute}/lead-detail/${id}`]));
        window.open(url, '_blank')
    }


}


