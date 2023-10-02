import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { API_PATH } from '@constants/api-end-points';
import { NgbCalendar, NgbDate, NgbDateParserFormatter, NgbDateStruct } from '@ng-bootstrap/ng-bootstrap';
import { ApiService } from '@services/api.service';
import { AuthService } from '@services/auth.service';
import { CommonService } from '@services/common.service';
import { ExcelService } from '@services/excel.service';
import { lastValueFrom } from 'rxjs';

@Component({
    selector: 'app-call-logs-report',
    templateUrl: './call-logs-report.component.html',
    styleUrls: ['./call-logs-report.component.scss', '../../styles/dashboard.scss']
})
export class CallLogsReportComponent implements OnInit {
    pageLimit: number = 10;
    callLogsReportList: Array<any> = [];
    totalRecords: number = 0;
    page: number = 1;
    userListPage: number = 1;
    hoveredDate: NgbDate | null = null;
    fromDate!: NgbDate | null;
    toDate!: NgbDate | null;
    selectedDate: any = '';
    maxDate!: NgbDateStruct;
    userList: Array<any> = [];
    hasMoreUsers: boolean = false;
    @ViewChild('datepicker') datepicker: any;
    @ViewChild('selectAll') selectAll!: ElementRef;

    tempFilter: { [key: string]: any } = {
        "Date": { value: "" },
        "Extension": { value: "" },
        "Phone": { value: "" },
        "User": { value: null },
    }

    appliedFilter: { [key: string]: any } = {
    }
    style!: { fill: string; };
    color!: string;
    background!: { background: string; };
    colorSubs: any;

    constructor(
        private commonService: CommonService,
        private apiService: ApiService,
        public formatter: NgbDateParserFormatter,
        private calendar: NgbCalendar,
        private authService: AuthService,
        private excelService: ExcelService
    ) { }


    ngOnInit(): void {
        this.getCallLogsReports();
        this.maxDate = this.calendar.getToday();
        this.getUserListOptions();
   this.getUserDetails();
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
    getUserDetails(): void {
        try {
            let ud = this.authService.getUserDetails();
            if (ud) {
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
        this.getCallLogsReports();
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
        this.toDate = null;
        this.fromDate = null;
        for (const p in this.tempFilter) {
            this.tempFilter[p].value = null;
        }
        this.onSearch();
    }
    async getUserListOptions() {
        try {
            let url = `?page_limit=30&page=${this.userListPage}`;
            this.commonService.showSpinner();
            const res$ = this.apiService.getReq(API_PATH.LIST_FOR_USERS + url, 'user', 'list');
            let response = await lastValueFrom(res$);
            if (response && response.data) {
                this.hasMoreUsers = response.data.hasMorePages;
                this.userList = [...this.userList, ...response.data];

            } else {
                this.userList = [];
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
                //   this.onSearch();
            }
        }
    }

    /**
     * @description get leads listing
     */
    async getCallLogsReports() {
        let url = `?page_limit=${this.pageLimit}&page=${this.page}`;
        if (this.appliedFilter['Date']?.value) {
            url = `${url}&daterange_filter=${this.appliedFilter['Date']?.value}`;
        }
        if (this.appliedFilter['Extension']?.value) {
            url = `${url}&extension=${this.appliedFilter['Extension']?.value}`;
        }
        if (this.appliedFilter['Phone']?.value) {
            url = `${url}&phone=${this.appliedFilter['Phone']?.value}`;
        }
        if (this.appliedFilter['User']?.value && this.appliedFilter['User'].value.id) {
            url = `${url}&user_id=${this.appliedFilter['User'].value.id}`;
        }
        try {
            this.commonService.showSpinner();
            const res$ = this.apiService.getReq(API_PATH.FUNDING_REPORT + url, 'funding', 'report');
            let response = await lastValueFrom(res$);
            if (response && response.status_code == "200") {
                if (response.data && response.data.data) {
                    this.callLogsReportList = response.data.data;
                    this.totalRecords = response.data.total_records;
                } else {
                    this.callLogsReportList = [];
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
                this.excelService.exportAsExcelFile(res, 'CallLogs_Report');
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
            const res$ = this.apiService.getReq(API_PATH.FUNDING_REPORT + url, 'funding', 'report');
            const response = await lastValueFrom(res$);
            this.commonService.hideSpinner();
            if (response && response.status_code == "200") {
                return Promise.resolve(response.data);
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
        this.getCallLogsReports();
    }

    /**
     * @description on page change
     * @returns {void}
     * @param p 
     */
    onPageChange(p: number): void {
        this.page = p;
        this.getCallLogsReports();
    }
    get userBaseRoute() {
        return this.authService.getUserRole().toLowerCase();
    }
}



