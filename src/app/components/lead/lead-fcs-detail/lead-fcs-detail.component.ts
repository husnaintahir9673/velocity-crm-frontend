import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { API_PATH } from '@constants/api-end-points';
import { ApiService } from '@services/api.service';
import { AuthService } from '@services/auth.service';
import { CommonService } from '@services/common.service';
import moment from 'moment';
import { lastValueFrom, Subscription } from 'rxjs';

@Component({
    selector: 'app-lead-fcs-detail',
    templateUrl: './lead-fcs-detail.component.html',
    styleUrls: ['./lead-fcs-detail.component.scss']
})
export class LeadFcsDetailComponent implements OnInit {
    fcsDetailList: any;
    leadId: string = '';
    style!: { fill: string; };
    background!: { background: string; };
    colorSubs!: Subscription;
    dateFormat: string = '';
    timeZone: string = '';
    withHoldValue = 0;
    constructor(private commonService: CommonService,
        private apiService: ApiService,
        private route: ActivatedRoute,
        private authService:AuthService) { }

    ngOnInit(): void {
        let params = this.route.snapshot.params;
        if (params && params['id']) {
            this.leadId = params['id'];
            this.getfcsDetail();
            this.getUserDetails();
        }
    }
   
    getColorOnUpdate() {
        this.colorSubs = this.authService.getColor().subscribe((u) => {
          this.getUserDetails();
        });
      }

    async getfcsDetail() {
        try {
            this.commonService.showSpinner();
            const res$ = this.apiService.postReq(API_PATH.FCS_LEAD_DETAILS, { lead_id: this.leadId }, 'fcs', ' preview');
            const response = await lastValueFrom(res$);
            if (response && response.data) {
                this.fcsDetailList = response.data;
                 this.withHoldValue =this.fcsDetailList?.withholding_percentage.toFixed(2)
            } else {
                this.commonService.showError(response.message);
            }
            this.commonService.hideSpinner();
        } catch (error: any) {
            this.commonService.hideSpinner();
            if(error?.error.message != 'FCS not saved yet.'){
                this.commonService.showErrorMessage(error);
            }
            
        }
    }

    getAdjustment(monthly: number, monthlytruerevenue: any){
        let adjustmentvalue = 0;
        if(monthly && monthlytruerevenue){
            adjustmentvalue = Number(monthly) - Number(monthlytruerevenue);
            return adjustmentvalue
        }else{
            return ''
        }  
    }
    getUserDetails(): void {
        try {
            let ud = this.authService.getUserDetails();
            if (ud) {
                this.getColorOnUpdate();
                this.dateFormat = ud.date_format;
                this.timeZone = ud.time_zone;
                            this.style={fill:ud?.color};
                            // this.color=ud?.color;
                                // this.stroke={stroke:ud?.color};
                                this.background={background:ud?.color};
            
            }
        } catch (error: any) {
            this.commonService.showError(error.message);
        }
    }
    getDate(date: any) {
        // .tz(this.timeZone)
        if(date){
            return moment(date).format(`${this.dateFormat}`)
        } else{
             return ''
        }
     
    }

}
