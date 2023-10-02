import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { API_PATH } from '@constants/api-end-points';
import { ApiService } from '@services/api.service';
import { CommonService } from '@services/common.service';
import { lastValueFrom } from 'rxjs';

@Component({
    selector: 'app-submission-thanks',
    templateUrl: './submission-thanks.component.html',
    styleUrls: ['./submission-thanks.component.scss']
})
export class SubmissionThanksComponent implements OnInit {
    thanksMessage: string = '';
    companyID: string = ''

    constructor(
        private commonService: CommonService,
        private apiService: ApiService,
        private route: ActivatedRoute
        ) { }

    ngOnInit(): void {
        
        let params = this.route.snapshot.params;
        if (params && params['id']) {
            this.companyID = params['id'];
            this.getThanksMessage();
        } else {
            this.commonService.showError('');
        }
    }
    async getThanksMessage() {
        try {
            let data = {
                company_id: this.companyID
            }
            this.commonService.showSpinner();
            const res$ = this.apiService.postReq(API_PATH.GET_THANKS_MESSAGE, data, 'lead', 'edit');
            let response = await lastValueFrom(res$);
            if (response && response.data) {
                this.thanksMessage = response.data;
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
