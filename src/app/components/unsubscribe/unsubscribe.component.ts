import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { API_PATH } from '@constants/api-end-points';
import { ApiService } from '@services/api.service';
import { CommonService } from '@services/common.service';
import { lastValueFrom } from 'rxjs';

@Component({
    selector: 'app-unsubscribe',
    templateUrl: './unsubscribe.component.html',
    styleUrls: ['./unsubscribe.component.scss']
})
export class UnsubscribeComponent implements OnInit {
    token: string = '';
    unsubscribeEvent: boolean = false;
    unsubscribeVelocity: boolean = false;
    type: string = '';
    showUnsubscribe: boolean = true;
    showAlreadySubscribed: boolean = false;
    showThankyouMessage: boolean = false;
    constructor(private commonService: CommonService,
        private route: ActivatedRoute,
        private apiService: ApiService,
        private router: Router) { }

    ngOnInit(): void {
        let queryParams = this.route.snapshot.queryParams;
        if (queryParams && queryParams['token']) {
            this.token = queryParams['token'];
            this.getUnsubscribe();
        } else {
            this.commonService.showError("Your token has been expired")
        }
    }
    async submitUnsubscribe() {
        try {
            //   if(this.type == ''){
            //     return this.commonService.showError('Please select any type')
            //   }
            //   this.type
            this.commonService.showSpinner();
            let data = {
                type: 'all',
                token: this.token
            }
            const res$ = this.apiService.postReq(API_PATH.UNSUBSCRIBE_API, data, '', '');
            let response = await lastValueFrom(res$);
            if (response && response.status_code == "200") {
                this.showUnsubscribe = false;
                this.showThankyouMessage = true;
                this.commonService.showSuccess(response.message);
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
    async getUnsubscribe() {
        try {
            this.commonService.showSpinner();
            let data = {
                token: this.token
            }
            const res$ = this.apiService.postReq(API_PATH.UNSUBSCRIBE_EXISTS, data, '', '');
            let response = await lastValueFrom(res$);
            if (response && response.status_code == "200") {
                if(response.data){
                    this.showAlreadySubscribed = response.data.flag;
                    if(this.showAlreadySubscribed){
                        this.showThankyouMessage = false;
                        this.showUnsubscribe = false;
                    }else{
                        this.showUnsubscribe = true;
                    }
                   
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
    
    unsubscribe(value: any) {
        if (value == 'all') {
            this.unsubscribeVelocity = true;
            this.unsubscribeEvent = false;
        } else if (value == 'template') {
            this.unsubscribeEvent = true;
            this.unsubscribeVelocity = false;
        }
        this.type = value


    }
    cancel() {
     window.close();
        // this.router.navigate(['/login']);

    }

}
