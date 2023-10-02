import { Component, Input, OnInit } from '@angular/core';
import { AuthService } from '@services/auth.service';
import { CommonService } from '@services/common.service';
import moment from 'moment';

@Component({
    selector: 'app-lead-interview-urls',
    templateUrl: './lead-interview-urls.component.html',
    styleUrls: ['./lead-interview-urls.component.scss']
})
export class LeadInterviewUrlsComponent implements OnInit {
    @Input() lanloardsurl: string = '';
    @Input() merchanturl: string = '';
    @Input() interviewDocuments: Array<any> = [];
    dateFormat: string = '';
    timeZone: string = '';

    cantakeMerchantInterview: boolean = false;
    cantakeLandlordInterview: boolean = false;

    constructor(
        private commonService: CommonService,
        private authService: AuthService,
    ) { }

    ngOnInit(): void {
        this.getUserDetails();
        this.cantakeMerchantInterview = this.authService.hasPermission('lead-merchant-interview');
        this.cantakeLandlordInterview = this.authService.hasPermission('lead-landlord-interview');
    }
    getUserDetails() {
        let ud = this.authService.getUserDetails();
          if (ud) {
            this.dateFormat =  ud.date_format;
            this.timeZone = ud.time_zone;
      }
    }
    getDate(date: any){
        return moment(date).tz(this.timeZone).format(`${this.dateFormat} hh:mm:ss A`)
    }


    copyTest(value: string) {
        this.commonService.copyText(value, 'URL copied successfully')
    }

}
