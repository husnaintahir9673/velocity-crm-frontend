import { Component, ElementRef, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { API_PATH } from '@constants/api-end-points';
import { Custom_Regex } from '@constants/constants';
import { NgbCalendar, NgbDate, NgbDateParserFormatter, NgbDateStruct, NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { ApiService } from '@services/api.service';
import { AuthService } from '@services/auth.service';
import { CommonService } from '@services/common.service';
import moment from 'moment';
import { lastValueFrom } from 'rxjs';

@Component({
    selector: 'app-drip-campaign-logs-list',
    templateUrl: './drip-campaign-logs-list.component.html',
    styleUrls: ['./drip-campaign-logs-list.component.scss', '../../styles/dashboard.scss', '../../styles/predictive-search.scss']
})
export class DripCampaignLogsListComponent implements OnInit {
    hoveredDate: NgbDate | null = null;
    fromDate!: NgbDate | null;
    toDate!: NgbDate | null;
    selectedDate: string = '';
    maxDate!: NgbDateStruct;
    companyStatus: string = '';
    searchKeyword: string = '';
    dripCampaignList: Array<any> = [];
    userListPage: number = 1;
    hasMoreUsers: boolean = false;
    usersListLimit: number = 10;
    totalUsersCount: number = 0;
    userId: string = '';
    emailTemplateId: string = '';
    assignedToUsers: any[] = [];
    leadCount: number = 0;
    dateFormat: string = '';
    timeZone: string = '';
    emailListLimit: number = 1000;
    emailListPage: number = 1;
    // predictiveSearchId: string = '';
    emailTemplateList: Array<any> = []
    @ViewChild('datepicker') datepicker: any;
    canAddDripCampaign: boolean = false;
    // predictiveSearchResults: Array<any> = [];
    // @ViewChild('predictiveSearch', { static: false }) predictiveSearch!: ElementRef;
    @ViewChild('deleteuser') deleteuser!: ElementRef;
    dripCampaignForm!: FormGroup;
    @ViewChild("dripCampaignTrigger", { static: true }) dripCampaignTrigger: ElementRef | any;

    constructor(
        private commonService: CommonService,
        private apiService: ApiService,
        public formatter: NgbDateParserFormatter,
        private calendar: NgbCalendar,
        private route: ActivatedRoute,
        private modalService: NgbModal,
        private fb: FormBuilder,
        private authService: AuthService,
        private router: Router
    ) { }

    ngOnInit(): void {
        this.route.queryParams
            .subscribe(params => {
                this.searchKeyword = params['search'];
                if (this.searchKeyword) {
                    this.getUsersList();
                } else {
                    this.getUsersList();
                }
            }
            );
        this.getUserDetails();
        this.maxDate = this.calendar.getToday();
        this.canAddDripCampaign = this.authService.hasPermission('campaign-add');


    }
    getUserDetails(): void {
        try {
            let ud = this.authService.getUserDetails();
            if (ud) {
                this.dateFormat = ud.date_format;
                this.timeZone = ud.time_zone;
            }
        } catch (error: any) {
            this.commonService.showError(error.message);
        }
    }
    getDate(date: any) {
        return moment(date).tz(this.timeZone).format(`${this.dateFormat} hh:mm:ss A`)
    }


    /**
  * @description initialize chnage password form
  * @author Shine Dezign Infonet Pvt. Ltd.
  */
    initDripCampaignForm() {
        this.dripCampaignForm = this.fb.group({
            name: ['', [
                Validators.required,
                Validators.pattern(Custom_Regex.spaces),
                Validators.pattern(Custom_Regex.username),
                Validators.pattern(Custom_Regex.name),
                Validators.minLength(3),
                Validators.maxLength(100)
            ]],
        })
    }


    /**
     * @description change passsword submit
     * @returns {Promise<void>}
     * @author Shine Dezign Infonet Pvt. Ltd.
     */

    getEmailTemplateId(id: any) {
        this.emailTemplateId = id;
    }

    get userBaseRoute() {
        return this.authService.getUserRole().toLowerCase();
    }
    /**
     * @description formcontrols getters
     * @author Shine Dezign Infonet Pvt. Ltd.
     * @returns { [key: string]: AbstractControl }
     */
    get f(): { [key: string]: AbstractControl } {
        return this.dripCampaignForm.controls;
    }

    /**
    * @description get users list eg company list if adminisrator is logged in
    */
    async getUsersList(): Promise<any> {
        try {
            let url = `?page_limit=${this.usersListLimit}&page=${this.userListPage}`;
            // if (this.searchKeyword) {
            //     url = url + `&search_keyword=${this.predictiveSearchId}`
            // }
            if (this.selectedDate) {
                url = url + `&daterange_filter=${this.selectedDate}`
            }
            if (this.companyStatus) {
                url = url + `&status=${this.companyStatus}`
            }
            this.commonService.showSpinner();
            const res$ = this.apiService.getReq(API_PATH.DRIP_CAMPAINGN_LOGS_LIST + url, 'campaign', 'logs');
            let response = await lastValueFrom(res$);
            if (response && response.data) {
                if (response.data.logs) {
                    this.hasMoreUsers = response.data.hasMorePages;
                    this.totalUsersCount = response.data.total;
                    this.dripCampaignList = response.data.logs;
                } else {
                    this.dripCampaignList = [];
                }

            } else {
                this.dripCampaignList = [];
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


    /**
     * @description on limit change
     * @param value 
     * @returns {void}
     * @author Shine Dezign Infonet Pvt. Ltd.
     */
    onUsersLimitChange(value: number): void {
        this.usersListLimit = value;
        this.userListPage = 1;
        this.getUsersList();
    }

    /**
  * @description on page change
  * @returns {void}
  * @param p 
  */
    onUserPageChange(p: number): void {
        this.userListPage = p;
        this.getUsersList();
    }



    async deleteDripcampaign(id: string) {
        try {
            let url = `?id=${id}`;
            this.commonService.showSpinner();
            const res$ = this.apiService.getReq(API_PATH.DRIP_CAMPAIGN_DELETE + url, 'campaign', 'delete');
            let response = await lastValueFrom(res$);
            if (response && response.status_code == "200") {
                this.commonService.showSuccess(response.message);
                this.dripCampaignList = this.dripCampaignList.filter(e => e.id !== id);
            } else {
                this.commonService.showError(response.message);
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
    isHovered(date: NgbDate) {
        return this.fromDate && !this.toDate && this.hoveredDate && date.after(this.fromDate) && date.before(this.hoveredDate);
    }

    isInside(date: NgbDate) {
        return this.toDate && date.after(this.fromDate) && date.before(this.toDate);
    }

    isRange(date: NgbDate) {
        return date.equals(this.fromDate) || (this.toDate && date.equals(this.toDate)) || this.isInside(date) || this.isHovered(date);
    }

    validateInput(currentValue: NgbDate | null, input: string): NgbDate | null {
        const parsed = this.formatter.parse(input);
        return parsed && this.calendar.isValid(NgbDate.from(parsed)) ? NgbDate.from(parsed) : currentValue;
    }

    onDateSelection(date: NgbDate) {
        if (!this.fromDate && !this.toDate) {
            this.fromDate = date;
        } else if (this.fromDate && !this.toDate && date && (date.equals(this.fromDate) || date.after(this.fromDate))) {
            this.toDate = date;
            this.datepicker.toggle();
        } else {
            this.toDate = null;
            this.fromDate = date;
        }
        let sDate = '';
        if (this.fromDate) {
            sDate = this.formatter.format(this.fromDate);
            if (this.toDate) {
                sDate = sDate + ' / ' + this.formatter.format(this.toDate);
                this.selectedDate = sDate;
                this.userListPage = 1;
                this.getUsersList();
            }
        }
    }


    /**
     * @description on status change
     * @param status 
     * @returns 
     */
    onStatusChange(status: string) {
        if (status === this.companyStatus) {
            return;
        }
        this.companyStatus = status;
        this.getUsersList();
    }

    /**
     * @description reset company filters
     */
    resetCompanyList() {
        this.searchKeyword = '';
        this.selectedDate = '';
        this.fromDate = null;
        this.toDate = null;
        this.companyStatus = '';
        this.getUsersList();
    }
}
