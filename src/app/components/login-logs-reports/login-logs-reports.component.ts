import { Component, ElementRef, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { API_PATH } from '@constants/api-end-points';
import * as Constants from '@constants/constants';
import {NgbCalendar, NgbDate, NgbDateParserFormatter, NgbDateStruct, NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { ApiService } from '@services/api.service';
import { AuthService } from '@services/auth.service';
import { CommonService } from '@services/common.service';import { ExcelService } from '@services/excel.service';
import moment from 'moment-timezone';
import { lastValueFrom, Subscription, } from 'rxjs';


@Component({
    selector: 'app-login-logs-reports',
    templateUrl: './login-logs-reports.component.html',
    styleUrls: ['./login-logs-reports.component.scss', '../../styles/dashboard.scss']
})
export class LoginLogsReportsComponent implements OnInit {
    routeSubscription!: Subscription;
    roles = Constants.Roles;
    userRole: string = '';
    pageLimit: number = 10;
    loginLogsReportList: Array<any> = [];
    totalRecords: number = 0;
    page: number = 1;
    hoveredDate: NgbDate | null = null;
    fromDate!: NgbDate | null;
    toDate!: NgbDate | null;
    selectedDate: any = '';
    maxDate!: NgbDateStruct;
    leadSourceList: Array<any> = [];
    usersList: Array<any> = [];
    modal!: NgbModalRef;
    loginIpList: any = {};
    showDates: boolean = false;
    @ViewChild('datepicker') datepicker: any;
    @ViewChild('selectAll') selectAll!: ElementRef;
    dateFormat: string = '';
    loginLogsId : string = '';
    opentab: string = '';
    timeZone: string = '';
    tempFilter: { [key: string]: any } = {
        "Date": { value: "" },
        "User": { value: null },
    }
    name = 'Angular';
    jun = moment();// creating obj.

    appliedFilter: { [key: string]: any } = {
    }
    colorSubs!: Subscription;
    style!: { fill: string; };
    background!: { background: string; };
    color!: string;
    search = {
        order: 'DESC',
        sortby: 'created_at'
    }

    constructor(
        private commonService: CommonService,
        private apiService: ApiService,
        public formatter: NgbDateParserFormatter,
        private calendar: NgbCalendar,
        private authService: AuthService,
        private router: Router,
        private modalService: NgbModal,
        private excelService: ExcelService,
    ) { }
  
  

    ngOnInit(): void {
        // this.canViewLead = this.authService.hasPermission('lead-view');
        this.getLeadSourceReports();
        this.maxDate = this.calendar.getToday();
        this.getUsersList();
        this.getUserDetails();
        // console.log(moment("2014-06-01T12:00:00Z").tz('America/Los_Angeles').format('ha z'));

    }
    ngDoCheck():void {
        
        this.getPaginationList();
        this.getDateColor();
    }
    // custom datepicker color
    getDateColor(){
    let monthNameClr = document.getElementsByClassName('ngb-dp-month-name');
    // let data3 = document.getElementsByClassName('btn btn-link ngb-dp-arrow-btn');
    let arrowColor = document.getElementsByClassName('ngb-dp-navigation-chevron');
    for (let i = 0; i < monthNameClr.length; i++) {
        monthNameClr[i].setAttribute('style',`color:${this.color}`)
        arrowColor[i].setAttribute('style',`border-color:${this.color}`)
        }
        let weekNameClr = document.getElementsByClassName('ngb-dp-weekday small');
        for (let i = 0; i < weekNameClr.length; i++) {
            weekNameClr[i].setAttribute('style',`color:${this.color}`)
            }
        


    const tds = document.getElementsByClassName('custom-day') as HTMLCollectionOf<HTMLElement>;
    for (let index = 0; index < tds.length; index++) {
      tds[index].style.setProperty('--custom',`${this.color}`);

       }
      }

    ngOnDestroy() {
        if (this.routeSubscription) {
            this.routeSubscription.unsubscribe();
        }
    }

    getUserDetails(): void {
        try {
            let ud = this.authService.getUserDetails();
            if (ud) {
                this.userRole = ud.role;
                this.dateFormat =  ud.date_format;
                this.timeZone = ud.time_zone;
                this.getColorOnUpdate();
                this.style={fill:ud?.color};
                 this.color=ud?.color;
                    // this.stroke={stroke:ud?.color};
                    this.background={background:ud?.color};

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

    getDate(date: any){
    return moment(date).tz(this.timeZone).format(`${this.dateFormat} hh:mm:ss A`)
        
    }

    removeFilter(key: string) {
        if (key === 'Date') {
            this.selectedDate = '';
            this.toDate = null;
            this.fromDate = null;
        }
        this.tempFilter[key].value = null;
        this.onSearch();
    }

    /**
     * @description on Search click
     */
    onSearch() {
        this.page = 1;
        this.appliedFilter = JSON.parse(JSON.stringify(this.tempFilter));
        this.getLeadSourceReports();
    }

    /**
     * @description on Status Change
     */
    onStatusChange() {
        this.onSearch();
    }

    /**
     * @description reset filter
     */
    resetFilter() {
        this.selectedDate = '';
        this.fromDate = null;
        this.toDate = null;
        for (const p in this.tempFilter) {
            this.tempFilter[p].value = null;
        }
        this.onSearch();
    }

    async getUsersList() {
        try {
         let url =`?giveAuth=${"1"}`;
            this.commonService.showSpinner();
            const res$ = this.apiService.getReq(API_PATH.USER_LIST + url, 'user', 'list');
            let response = await lastValueFrom(res$);
            if (response && response.data) {
                this.usersList = response.data;
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
                this.tempFilter['Date'].value = this.selectedDate;
            }
        }
    }
    
    openModal(templateRef: TemplateRef<any>,id: any) {
        try {
            this.modal = this.modalService.open(templateRef, { backdrop: 'static', size: 'lg' });
            this.loginLogsId = id
        } catch (error: any) {
            this.commonService.showError(error.message);
        }
    }

    closeModal() {
        this.modal.close();
    }



    /**
     * @description get leads listing
     */
    async getLeadSourceReports() {
        let url = `?sort_by=${this.search.sortby}&dir=${this.search.order}&page_limit=${this.pageLimit}&page=${this.page}`;
        if (this.appliedFilter['Date']?.value) {
            url = `${url}&daterange_filter=${this.appliedFilter['Date']?.value}`;
        }

        if (this.appliedFilter['User']?.value && this.appliedFilter['User'].value.id) {
            url = `${url}&user_id=${this.appliedFilter['User'].value.id}`;
        }
        try {
            this.commonService.showSpinner();
            const res$ = this.apiService.getReq(API_PATH.LOGIN_LOGS + url, 'login', 'report');
            let response = await lastValueFrom(res$);
            if (response && response.status_code == "200") {
                if (response.data && response.data.data) {
                    this.loginLogsReportList = response.data.data;
                    this.totalRecords = response.data.count;
                } else {
                    this.loginLogsReportList = [];
                    this.page=1;
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
    async exportReportasExcel() {
        try {
            const res = await this.getReportDataForExport();
            if (res.length) {
                this.excelService.exportAsExcelFile(res, 'Login_Logs_Report');
            } else {
                this.commonService.showError("No data found");
            }
        } catch (error: any) {
            this.commonService.showError(error.message);
        }
    }

    async getReportDataForExport() {
        try {
            let url = `?export=${'export'}`;
            this.commonService.showSpinner();
            const res$ = this.apiService.getReq(API_PATH.LOGIN_LOGS + url, 'login', 'report');
            const response = await lastValueFrom(res$);
            this.commonService.hideSpinner();
            if (response && response.status_code == "200") {
                let leads = [];
                for (let i = 0; i < response.data.length; i++) {
                    leads.push({ "#": i+1, ...response.data[i] });
                }
                
                return Promise.resolve(leads);
            } else {
                return Promise.resolve([]);
            }
        } catch (error) {
            return Promise.reject(error)
        }
    }

    
    /**
     * @description on limit change
     * @param value 
     * @returns {void}
     * @author Shine Dezign Infonet Pvt. Ltd.
     */
    onLimitChange(value: number): void {
        this.pageLimit = value;
        this.page = 1;
        this.getLeadSourceReports();
    }

    /**
     * @description on page change
     * @returns {void}
     * @param p 
     */
    onPageChange(p: number): void {
        this.page = p;
        this.getLeadSourceReports();
    }
    get userBaseRoute() {
        return this.authService.getUserRole().toLowerCase();
    }
    getPaginationList() {
       
            let data = document.getElementsByClassName('ngx-pagination')[0]?.getElementsByTagName('li');
                for (let i = 0; i < data?.length; i++) {
                    if (data[i].className == 'current' || data[i].className == 'current ng-star-inserted'|| data[i].className == 'ng-star-inserted current') {
                        data[i].style.background = this.color;
                    } else {
                        data[i].style.background = 'none';

                }
            }
    }
    sortBy(col:string){
        if(!this.loginLogsReportList.length){
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
        this.getLeadSourceReports();
        }
}
