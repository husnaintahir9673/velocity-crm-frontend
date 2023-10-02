import { Component, Input, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { API_PATH } from '@constants/api-end-points';
import { NgbDateParserFormatter } from '@ng-bootstrap/ng-bootstrap';
import { ApiService } from '@services/api.service';
import { AuthService } from '@services/auth.service';
import { CommonService } from '@services/common.service';
import moment from 'moment';
import { lastValueFrom, Subscription } from 'rxjs';

@Component({
    selector: 'app-lead-create-lender-offer-list',
    templateUrl: './lead-create-lender-offer-list.component.html',
    // , '../../../styles/dashboard.scss'
    styleUrls: ['./lead-create-lender-offer-list.component.scss']
})
export class LeadCreateLenderOfferListComponent implements OnInit {
    leadID: string = '';
    lenderList: Array<any> = [];
    page: number = 1;
    limit: number = 10;
    total: number = 0;
    canCreateLenderOffer: boolean = false;
    canDeleteLenderOffer: boolean = false;
    canViewLenderOffer: boolean = false;
    canEditLenderOffer: boolean = false;
    @Input() leadDetails: any = {};
    style!: { fill: string; };
    background!: { background: string; };
    colorSubs!:Subscription;
    color!: string;
    declinedOfferList: Array<any> = [];
    declinedpage: number = 1;
    declinedlimit: number = 100;
    declinedtotal: number = 0;
    dateFormat: string = '';
    timeZone: string = '';

    constructor(
        private route: ActivatedRoute,
        private commonService: CommonService,
        private apiService: ApiService,
        public formatter: NgbDateParserFormatter,
        private authService: AuthService
    ) { }

    ngOnInit(): void {
        let params = this.route.snapshot.params;
        if (params && params['id']) {
            this.leadID = params['id'];
            this.getLenderOfferList();
            this.getDeclinedOfferList();
        } else {
            this.commonService.showError('');
        }
         this.canCreateLenderOffer = this.authService.hasPermission('lender-offer-create');
         this.canViewLenderOffer = this.authService.hasPermission('lender-offer-view');
         this.canEditLenderOffer = this.authService.hasPermission('lender-offer-update');
         this.canDeleteLenderOffer = this.authService.hasPermission('lender-offer-delete');
         this.getUserDetails();

    }
    ngDoCheck():void {
        
        this.getPaginationList();
    }
    getPaginationList() {
      // change index 0 -> 1
            let data =  document.getElementsByClassName('ngx-pagination')[1]?.getElementsByTagName('li');
                for (let i = 0; i < data?.length; i++) {
                    if (data[i].className == 'current' || data[i].className == 'current ng-star-inserted' || data[i].className == 'ng-star-inserted current') {
                        data[i].style.background = this.color;
                    } else {
                        data[i].style.background = 'none';

                }
            }
    



    }
    getUserDetails() {
        let ud = this.authService.getUserDetails();
        if (ud) {
          
            this.getColorOnUpdate();
            this.style={fill:ud?.color};
            this.color=ud?.color;
            this.dateFormat = ud.date_format;
            this.timeZone = ud.time_zone;
              
                this.background={background:ud?.color};
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

    /**
     * @description get lead updatessss
     */
    async getLenderOfferList() {
        try {
            let url = `?&page=${this.page}&lead_id=${this.leadID}`;
            this.commonService.showSpinner();
            let res$ = this.apiService.getReq(API_PATH.LENDER_OFFER_LISTING + url, 'lender', 'offer-list');
            let response = await lastValueFrom(res$);
            if (response && response.status_code == 200) {
                if (response.data && response.data.data) {
                    this.lenderList = response.data.data;
                    this.total = response.data.total
                } else {
                    this.lenderList = [];
                    this.total = 0;
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
      /**
     * @description get lead updatessss
     */
       async getDeclinedOfferList() {
        try {
            let url = `?&page=${this.declinedpage}&lead_id=${this.leadID}`;
            this.commonService.showSpinner();
            let res$ = this.apiService.getReq(API_PATH.LENDER_OFFER_DECINED + url, 'lender', 'offer-list');
            let response = await lastValueFrom(res$);
            if (response && response.status_code == 200) {
                if (response.data && response.data.data) {
                    this.declinedOfferList = response.data.data;
                    this.declinedtotal = response.data.total
                } else {
                    this.declinedOfferList = [];
                    this.declinedtotal = 0;
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
    async deleteLenderOffer(id: any): Promise<void> {
        try {
            this.commonService.showSpinner();
            const res$ = this.apiService.postReq(API_PATH.LENDER_OFFER_DELETE, { lender_offer_id: id }, 'lender', 'offer-delete');
            let response = await lastValueFrom(res$);
            if (response && response.data) {
                this.commonService.showSuccess(response.message);
                this.lenderList = this.lenderList.filter(el => !id.includes(el.lender_offer_id));
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
        this.getLenderOfferList();
    }

}

