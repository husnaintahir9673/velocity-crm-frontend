import { ChangeDetectorRef, Component, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { API_PATH } from '@constants/api-end-points';
import { NgbAccordion } from '@ng-bootstrap/ng-bootstrap';
import { ApiService } from '@services/api.service';
import { AuthService } from '@services/auth.service';
import { CommonService } from '@services/common.service';
import moment from 'moment';
import { lastValueFrom } from 'rxjs';

@Component({
    selector: 'app-login-ip-modal',
    templateUrl: './login-ip-modal.component.html',
    styleUrls: ['./login-ip-modal.component.scss']
})
export class LoginIpModalComponent implements OnInit {
    loginIpList: Array<any> = [];
    @Input() loginLogsId: string = '';
    dateFormat: string = '';
    timeZone: string = '';
    opentab: any = '';
    @Output() closeModal = new EventEmitter<any>();
    @ViewChild('acc', { static: false  }) accordion!: NgbAccordion;
    constructor(
        private commonService: CommonService,
        private apiService: ApiService,
        private authService: AuthService,
        private changeDetectorRef: ChangeDetectorRef,) { }

    ngOnInit(): void {
        this.getLoginIp();
        this.getUserDetails();
    }
    closeModel() {
        this.closeModal.emit();
    }
    getUserDetails(): void {
        try {
            let ud = this.authService.getUserDetails();
            if (ud) {
                this.dateFormat =  ud.date_format;
                this.timeZone = ud.time_zone;
            }
        } catch (error: any) {
            this.commonService.showError(error.message);
        }
    }
    getDate(date: any){
        return moment(date).tz(this.timeZone).format(`${this.dateFormat} hh:mm:ss A`)
    }
    getLoginIpDate(date: any){
        return moment(date).format(`${this.dateFormat}`)
    }
    async getLoginIp() {
        let url = `?user_id=${this.loginLogsId}`;

        try {
            this.commonService.showSpinner();
            const res$ = this.apiService.getReq(API_PATH.LOGIN_IPS_REPORT + url, 'login', 'report');
            let response = await lastValueFrom(res$);
            if (response && response.status_code == "200") {
                if (response.data && response.data.data) {
                    this.loginIpList = response.data.data;
                } else {
                    this.loginIpList = [];
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
    // toggle(ID: string) {
    //     setTimeout(() => this.accordion.toggle(ID), 0);
    // }
    
    closeAlltabs() {
        this.accordion.collapseAll();
    }
    openAccordianTab(tabID: any): void {
        if(this.opentab === tabID) {
            this.opentab = [];
        } else {
            this.opentab = tabID;
        }
      this.accordion.toggle(tabID);
    }



}
