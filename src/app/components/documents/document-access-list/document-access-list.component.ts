import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { API_PATH } from '@constants/api-end-points';
import { ApiService } from '@services/api.service';
import { AuthService } from '@services/auth.service';
import { CommonService } from '@services/common.service';
import moment from "moment-timezone";
import { lastValueFrom } from 'rxjs';

@Component({
    selector: 'app-document-access-list',
    templateUrl: './document-access-list.component.html',
    styleUrls: ['../../../styles/dashboard.scss', './document-access-list.component.scss']
})
export class DocumentAccessListComponent implements OnInit {
    token: string = '';
    documentsList: any[] = [];
    logoImage: string = '';
    dateFormat: string = '';
    timeZone: string = '';
    constructor(
        private route: ActivatedRoute,
        private commonService: CommonService,
        private apiService: ApiService,
        private authService: AuthService,
        private router: Router
    ) { }

    ngOnInit(): void {
        let queryParams = this.route.snapshot.queryParams;
        if(queryParams && queryParams['token']) {
            this.token = queryParams['token'];
            this.verifyToken();
        } else {
            this.commonService.showError('It seems your session has been expired.');
        }
        this.getUserDetails();
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
        if(date && this.timeZone && this.dateFormat){
            return moment(date).tz(this.timeZone).format(`${this.dateFormat} hh:mm:ss A`)
        }else{
                this.timeZone = 'America/Adak',
                this.dateFormat = 'MMM DD, yyyy'
             return moment(date).tz(this.timeZone).format(`${this.dateFormat} hh:mm:ss A`);
        }
       
            
        }

    async verifyToken() {
        try {
            this.commonService.showSpinner();
            const res$ = this.apiService.postReq(API_PATH.VERIFY_DOC_LINK, { token: this.token }, '', '');
            const response = await lastValueFrom(res$);
            if(response && response.status_code == "200") {
                this.documentsList = response.data.documents;
                this.logoImage = response.data?.logo_image ? response.data?.logo_image : 'assets/images/logo.png';
            } else {
                this.commonService.showError(response.message);
            }
            this.commonService.hideSpinner();
        } catch (error) {
            this.commonService.hideSpinner();
            this.commonService.showErrorMessage(error);
        }
    }
    async downloadFile(doc: any) {
        try {
            this.commonService.showSpinner();
            const res$ = this.apiService.postReq(API_PATH.DOWNLOAD_FILE, { file: doc.actual_name }, 'lead', 'list', 'arraybuffer');
            const response = await lastValueFrom(res$);
            const arrayBufferView = new Uint8Array(response);
            const file = new Blob([arrayBufferView], { type: doc.document_type });
            let url = window.URL.createObjectURL(file);
            let a = document.createElement('a');
            document.body.appendChild(a);
            a.setAttribute('style', 'display: none');
            a.href = url;
            a.download = doc.actual_name;
            a.click();
            window.URL.revokeObjectURL(url);
            a.remove();
            this.commonService.hideSpinner();
        } catch (error) {
            this.commonService.hideSpinner();
            this.commonService.showErrorMessage(error)
        }
    }
    leadDetailsLink(id: any){
        const url = this.router.serializeUrl(this.router.createUrlTree([`/lead-overview`], { queryParams: { lead_id: id}}));
        window.open(url, '_blank')
    }

}
