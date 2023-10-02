import { Component, OnInit, ViewChild } from '@angular/core';
import { API_PATH } from '@constants/api-end-points';
import { Roles } from '@constants/constants';
import { NgbDateParserFormatter } from '@ng-bootstrap/ng-bootstrap';
import { ApiService } from '@services/api.service';
import { AuthService } from '@services/auth.service';
import { CommonService } from '@services/common.service';
import moment from 'moment';
import { lastValueFrom, Subscription } from 'rxjs';

@Component({
    selector: 'app-lender-list',
    templateUrl: './lender-list.component.html',
    styleUrls: ['../../styles/dashboard.scss', '../../styles/predictive-search.scss', './lender-list.component.scss']
})
export class LenderListComponent implements OnInit {
    lenderList: Array<any> = [];
    userListPage: number = 1;
    hasMoreUsers: boolean = false;
    usersListLimit: number = 10;
    totalUsersCount: number = 0;
    canViewLender: boolean = false;
    canEditLender: boolean = false;
    canCreateLender: boolean = false;
    canDeleteLender: boolean = false;
    dateFormat: string = '';
    timeZone: string = ''
    dashboardData: any = {};
    roles = Roles;
    userRole: string = '';
    canListLead: boolean = false;
    search = {
     order:'DESC',
     sortby:'created_at'
    }



    @ViewChild('datepicker') datepicker: any;
    color!: string;
    style!: { fill: string; };
    background!: { background: string; };
    colorSubs!: Subscription;

    constructor(
        private commonService: CommonService,
        private apiService: ApiService,
        public formatter: NgbDateParserFormatter,
        private authService: AuthService
    ) { }

    ngOnInit(): void {
        this.canListLead = this.authService.hasPermission('lead-list');

        this.getLendersList();
        this.getUserDetails();
        this.canCreateLender = this.authService.hasPermission('lender-create');
        this.canViewLender = this.authService.hasPermission('lender-view');
        this.canEditLender = this.authService.hasPermission('lender-update');
        this.canDeleteLender = this.authService.hasPermission('lender-delete');
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
    * @description get users list eg company list if adminisrator is logged in
    */
    async getLendersList(): Promise<any> {
        try {
            let url = `?sort_by=${this.search.sortby}&dir=${this.search.order}&page_limit=${this.usersListLimit}&page=${this.userListPage}`;
            this.commonService.showSpinner();
            const res$ = this.apiService.getReq(API_PATH.LENDER_ALL_LIST + url, 'lender', 'list');
            let response = await lastValueFrom(res$);
            if (response && response.data) {
                this.hasMoreUsers = response.data.hasMorePages;
                this.totalUsersCount = response.data.total;
                this.lenderList = response.data.data;
                this.lenderList.forEach((object) => { object.toggle = false });
                for (let i = 0; i < this.lenderList.length; i++) {
                    if (this.lenderList[i].status == 'Active') {
                        this.lenderList[i].toggle = true;
                    } else {
                        this.lenderList[i].toggle = false;
                    }
                }
            } else {
                this.lenderList = [];
                this.hasMoreUsers = false;
                this.userListPage = 1;
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
    getUserDetails(): void {
        try {
            let ud = this.authService.getUserDetails();
            if (ud) {
                this.userRole = ud.role;
                this.dateFormat = ud.date_format;
                this.timeZone = ud.time_zone;
                this.color = ud?.color
                this.getColorOnUpdate();
                this.style = { fill: ud?.color };
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

    async deleteLender(id: any): Promise<void> {
        try {
            this.commonService.showSpinner();
            const res$ = this.apiService.postReq(API_PATH.LENDER_DELETE, { lender_id: id }, 'lender', 'delete');
            let response = await lastValueFrom(res$);
            if (response && response.data) {
                this.commonService.showSuccess(response.message);
                this.lenderList = this.lenderList.filter(el => !id.includes(el.id));
                this.totalUsersCount = this.totalUsersCount - 1
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
     * @description on limit change
     * @param value 
     * @returns {void}
     * @author Shine Dezign Infonet Pvt. Ltd.
     */
    onUsersLimitChange(value: number): void {
        this.usersListLimit = value;
        this.userListPage = 1;
        this.getLendersList();
    }

    /**
  * @description on page change
  * @returns {void}
  * @param p 
  */
    onUserPageChange(p: number): void {
        this.userListPage = p;
        this.getLendersList();
    }

    onStatusToggleChange(e: any, input: any, id: string, i: number) {
        this.commonService.showSpinner();
        let status = "1";
        this.lenderList[i].toggle = true;

        if (!e.target.checked) {
            status = "0";
            this.lenderList[i].toggle = false;

        }
        this.updateStatus(status, id, input, i);
    }

    async updateStatus(status: string, lender_id: string, input: any, i: number) {
        try {
            const res$ = this.apiService.postReq(API_PATH.LENDER_UPDATE, { lender_id: lender_id, status: status }, 'lender', 'update-status');
            const response = await lastValueFrom(res$);
            if (response && response.status_code) {
                this.commonService.showSuccess(response.message);
            } else {
                this.commonService.showError(response.message)
            }
            this.commonService.hideSpinner();
        } catch (error) {
            if (status === "1") {
                input.checked = false;
                this.lenderList[i].toggle = false;

            } else {
                input.checked = true;
                this.lenderList[i].toggle = true;

            }
            this.commonService.hideSpinner();
            this.commonService.showErrorMessage(error);
        }
    }

    sortBy(col:string){
        if(!this.lenderList.length){
            return;
        }
        if(this.search.sortby === col){
            if(this.search.order === 'ASC'){
                this.search.order = 'DESC'
            }else{
                this.search.order = 'ASC'
            }
        }else{
            this.search.order = 'DESC';
            this.search.sortby = col;
        }
        this.getLendersList();
    }

}

