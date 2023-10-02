import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { API_PATH } from '@constants/api-end-points';
import { NgbCalendar, NgbDate, NgbDateParserFormatter, NgbDateStruct } from '@ng-bootstrap/ng-bootstrap';
import { ApiService } from '@services/api.service';
import { AuthService } from '@services/auth.service';
import { CommonService } from '@services/common.service';
import { ExcelService } from '@services/excel.service';
import { lastValueFrom, Subscription } from 'rxjs';

@Component({
    selector: 'app-pull-through-ratio-report',
    templateUrl: './pull-through-ratio-report.component.html',
    styleUrls: ['./pull-through-ratio-report.component.scss', '../../styles/dashboard.scss']
})
export class PullThroughRatioReportComponent implements OnInit {
    pageLimit: number = 10;
    pullThroughReportList: Array<any> = [];
    totalRecords: number = 0;
    page: number = 1;
    hoveredDate: NgbDate | null = null;
    fromDate!: NgbDate | null;
    toDate!: NgbDate | null;
    selectedDate: any = '';
    maxDate!: NgbDateStruct;
    @ViewChild('datepicker') datepicker: any;
    @ViewChild('selectAll') selectAll!: ElementRef;

    tempFilter: { [key: string]: any } = {
        "Date": { value: "" },
        "Manager": { value: null },
        "ISO": { value: null },
    }

    appliedFilter: { [key: string]: any } = {
    }
    style!: { fill: string; };
    background!: { background: string; };
    colorSubs!: Subscription;
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
        private excelService: ExcelService
    ) { }


    ngOnInit(): void {
        this.getPullThroughReports();
        this.maxDate = this.calendar.getToday();
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
        this.getPullThroughReports();
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
    async getPullThroughReports() {
        let url = `?sort_by=${this.search.sortby}&dir=${this.search.order}&page_limit=${this.pageLimit}&page=${this.page}`;
        if (this.appliedFilter['Date']?.value) {
            url = `${url}&daterange_filter=${this.appliedFilter['Date']?.value}`;
        }
        if (this.appliedFilter['Manager']?.value && this.appliedFilter['Manager'].value.id) {
            url = `${url}&manager_id=${this.appliedFilter['Manager'].value.id}`;
        }
        if (this.appliedFilter['ISO']?.value && this.appliedFilter['ISO'].value.id) {
            url = `${url}&iso_id=${this.appliedFilter['ISO'].value.id}`;
        }
        try {
            this.commonService.showSpinner();
            const res$ = this.apiService.getReq(API_PATH.PULL_THROUGH_RATIO_REPORT + url, 'pull', 'through-ratio-report');
            let response = await lastValueFrom(res$);
            if (response && response.status_code == "200") {
                if (response.data && response.data.data) {
                    this.pullThroughReportList = response.data.data;
                    this.totalRecords = response.data.total_records;
                } else {
                    this.pullThroughReportList = [];
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
                this.excelService.exportAsExcelFile(res, 'PULL_THROUGH_RATIO_REPORT');
            } else {
                this.commonService.showError("No data found");
            }
        } catch (error: any) {
            this.commonService.showError(error.message);
        }
    }
    getPullThroughRatio(approved: any, funded: any) {
        let actual_value = 0
        if (approved != '') {
            actual_value = Number(funded) / Number(approved) * 100;
        }
        if (actual_value != 0) {
            return '(' + actual_value.toFixed(2) + ')' + '%'
        } else {
            return ''
        }


    }
    getTotalvalue(name: any) {
        let total = 0;
        this.pullThroughReportList.map(result => {
            total += Number(result[name])
        });
        return total

    }
    getTotalRatiovalue(totalApproved: any, totalFunded: any) {
        let totalpersub = Number(totalApproved) / Number(totalFunded) * 100;
            if(Number.isNaN(totalpersub)){
               totalpersub = 0
            }
        let Total_value = '(' + totalpersub + ')' + '%'
        return Total_value;
    }

    async getReportDataForExport() {
        try {
            let url = `?export=${'export'}`;
            this.commonService.showSpinner();
            const res$ = this.apiService.getReq(API_PATH.PULL_THROUGH_RATIO_REPORT + url, 'pull', 'through-ratio-report');
            const response = await lastValueFrom(res$);
            this.commonService.hideSpinner();
            if (response && response.status_code == "200") {
                let leads = [];
                let pullthroughratio: any = '';
                let approved = 0;
                let funded = 0;
                for (let i = 0; i < response.data.length; i++) {
                    approved += Number(response.data[i]["Approved"]);
                    funded += Number(response.data[i]["Funded"]);
                    pullthroughratio = this.getCountPercentage(response.data[i]["Approved"], response.data[i]["Funded"]);
                    leads.push({ "#": i + 1, ...response.data[i], "Pull Through Ratio": pullthroughratio });
                }
                let lastRow = {
                    "#": "Total",
                    "Approved": approved,
                    "Funded": funded,
                    "Pull Through Ratio": this.getTotalRatiovalue(approved, funded)

                }
                leads.push(lastRow);
                return Promise.resolve(leads);
            } else {
                return Promise.resolve([]);
            }
        } catch (error) {
            return Promise.reject(error)
        }
    }
    getCountPercentage(approved: any, funded: number) {
        let actual_value = 0
        if (approved != '') {
            actual_value = Number(funded) / Number(approved) * 100;
        }
        if (actual_value != 0) {
            return '(' + actual_value + ')' + '%'
        } else {
            return ''
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
        this.getPullThroughReports();
    }

    /**
     * @description on page change
     * @returns {void}
     * @param p 
     */
    onPageChange(p: number): void {
        this.page = p;
        this.getPullThroughReports();
    }
    get userBaseRoute() {
        return this.authService.getUserRole().toLowerCase();
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

    sortBy(col:string){
        if(!this.pullThroughReportList.length){
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
        this.getPullThroughReports();
        }
    }




