import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { API_PATH } from '@constants/api-end-points';
import { NgbCalendar, NgbDate, NgbDateParserFormatter, NgbDateStruct } from '@ng-bootstrap/ng-bootstrap';
import { ApiService } from '@services/api.service';
import { AuthService } from '@services/auth.service';
import { CommonService } from '@services/common.service';
import { ExcelService } from '@services/excel.service';
import moment from 'moment';
import { lastValueFrom, Subscription } from 'rxjs';

@Component({
    selector: 'app-lead-submission-report',
    templateUrl: './lead-submission-report.component.html',
    styleUrls: ['./lead-submission-report.component.scss', '../../styles/dashboard.scss']
})
export class LeadSubmissionReportComponent implements OnInit {
    pageLimit: number = 10;
    submissionReportList: Array<any> = [];
    totalRecords: number = 0;
    page: number = 1;
    hoveredDate: NgbDate | null = null;
    fromDate!: NgbDate | null;
    toDate!: NgbDate | null;
    selectedDate: any = '';
    showSubmission: boolean = false;
    maxDate!: NgbDateStruct;
    showTR1: any = -1;
    totalSubmission: number = 0;
    totalvalue: any = '';
    dateFormat: string = '';
    timeZone: string = ''
    totalSubmissionReportList: Array<any> = []
    @ViewChild('datepicker') datepicker: any;
    @ViewChild('selectAll') selectAll!: ElementRef;

    tempFilter: { [key: string]: any } = {
        "Date": { value: "" },
        "Filter": { value: null },
        "Manager": { value: null },
        "Sale": { value: null },
        "ISO": { value: null },
    }

    appliedFilter: { [key: string]: any } = {
    }
    style!: { fill: string; };
    background!: { background: string; };
    colorSubs!:Subscription;
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
        this.getFundingReports();
        this.getUserDetails();
        this.maxDate = this.calendar.getToday();

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
        this.getFundingReports();
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
    async getFundingReports() {
        let url = `?sort_by=${this.search.sortby}&dir=${this.search.order}&page_limit=${this.pageLimit}&page=${this.page}`;
        if (this.appliedFilter['Date']?.value) {
            url = `${url}&daterange_filter=${this.appliedFilter['Date']?.value}`;
        }
        if (this.appliedFilter['Bussiness name']?.value) {
            url = `${url}&business_name=${this.appliedFilter['Bussiness name']?.value}`;
        }
        if (this.appliedFilter['Funding amount']?.value) {
            url = `${url}&funding_amount=${this.appliedFilter['Funding amount']?.value}`;
        }
        if (this.appliedFilter['Payback amount']?.value) {
            url = `${url}&payback_amount=${this.appliedFilter['Payback amount']?.value}`;
        }
        if (this.appliedFilter['Lender']?.value && this.appliedFilter['Lender'].value.id) {
            url = `${url}&lender_id=${this.appliedFilter['Lender'].value.id}`;
        }
        if (this.appliedFilter['User']?.value && this.appliedFilter['User'].value.id) {
            url = `${url}&user_id=${this.appliedFilter['User'].value.id}`;
        }
        if (this.appliedFilter['Sale']?.value && this.appliedFilter['Sale'].value.name) {
            url = `${url}&sale=${this.appliedFilter['Sale']?.value.name}`;
        }
        if (this.appliedFilter['Agent Status']?.value && this.appliedFilter['Agent Status'].value.name) {
            url = `${url}&agent Status=${this.appliedFilter['Agent Status'].value.name}`;
        }
        if (this.appliedFilter['Manager']?.value && this.appliedFilter['Manager'].value.id) {
            url = `${url}&manager_id=${this.appliedFilter['Manager'].value.id}`;
        }
        try {
            this.commonService.showSpinner();
            const res$ = this.apiService.getReq(API_PATH.SUBMISSION_REPORT + url, 'submission', 'report');
            let response = await lastValueFrom(res$);
            if (response && response.status_code == "200") {
                if (response.data && response.data.data) {
                    this.submissionReportList = response.data.data;
                    this.totalRecords = response.data.total_records;
                } else {
                    this.submissionReportList = [];
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
    toggleLeadSubmission(rowIndex: any, element: any, id: any,val:boolean) {
        this.showSubmission = val;
         if (this.showSubmission) {
             this.getTotalSubmissionsReports(id);
         }
        this.showTR1 = rowIndex
        if(!val){
            this.showTR1 =-1
        }
        // if (element.textContent == '+') {
        //     element.textContent = '-';
        // } else {
        //     element.textContent = '+';
        // }
    }
    async getTotalSubmissionsReports(agentId: any) {
        let url = `?&agent_id==${agentId}`;
        try {
            this.commonService.showSpinner();
            const res$ = this.apiService.getReq(API_PATH.FETCH_SUBMISSION_REPORT + url, 'submission', 'report');
            let response = await lastValueFrom(res$);
            if (response && response.status_code == "200") {
                if (response.data && response.data.data) {
                    this.totalSubmissionReportList = response.data.data;
                    this.totalRecords = response.data.total_records;
                } else {
                    this.totalSubmissionReportList = [];
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
    getTotalvalue(name: any) {
        let total = 0;
        this.submissionReportList.map(result => {
            total += Number(result[name])
        });
        let totalpersub = 0
        if(total){
            totalpersub = (total / this.totalSubmission) * 100;
        }
       let Total_value = total + '(' + totalpersub.toFixed(2) + ')' + '%'
        this.totalvalue = Total_value
        return Total_value;
    }
    getPercentage(totalsubmission: any, value: any) {
        let actual_value = 0;
        if(value != ''){
        actual_value = ((Number(value)) / (Number(totalsubmission))) * 100;
        }
     
         let totalsub = 0;
        this.submissionReportList.map(result => {
            totalsub += Number(result.total_submission)
        });
        this.totalSubmission = totalsub;
        if (actual_value != 0) {
            return '(' + actual_value + '%' + ')'
        } else {
            return ''
        }


    }
    async exportReportasExcel() {
        try {
            const res = await this.getReportDataForExport();
            if (res.length) {
                this.excelService.exportAsExcelFile(res, 'SUBMISSION_REPORT');
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
            const res$ = this.apiService.getReq(API_PATH.SUBMISSION_REPORT + url, 'submission', 'report');
            const response = await lastValueFrom(res$);
            this.commonService.hideSpinner();
            if (response && response.status_code == "200") {
                let leads = [];
                let totalSubmission = 0;
                let docsIn = 0;
                let submitted = 0;
                let approved = 0;
                let contractOut = 0;
                let contractIn =  0;
                let funded = 0;
                let declined = 0;
                for (let i = 0; i < response.data.length; i++) {
                    totalSubmission += response.data[i]["Total submission"]; 
                    docsIn += Number(response.data[i]["Doc In"]); 
                    response.data[i]["Doc In"] = this.getCountPercentage(response.data[i]["Doc In"],response.data[i]["Total submission"]);
                    submitted += Number(response.data[i]["Submitted"]);
                    response.data[i]["Submitted"] = this.getCountPercentage(response.data[i]["Submitted"],response.data[i]["Total submission"]);
                    approved += Number(response.data[i]["Approved"]); 
                    response.data[i]["Approved"] =  this.getCountPercentage(response.data[i]["Approved"],response.data[i]["Total submission"]);
                    contractOut += Number(response.data[i]["Contract Out"]); 
                    response.data[i]["Contract Out"] =  this.getCountPercentage(response.data[i]["Contract Out"],response.data[i]["Total submission"]);
                    contractIn += Number(response.data[i]["Contract In"]); 
                    response.data[i]["Contract In"] =  this.getCountPercentage(response.data[i]["Contract In"],response.data[i]["Total submission"]);
                    funded += Number(response.data[i]["Funded"]);
                    response.data[i]["Funded"] = this.getCountPercentage(response.data[i]["Funded"],response.data[i]["Total submission"]);
                    declined += Number(response.data[i]["Declined"]); 
                    response.data[i]["Declined"] = this.getCountPercentage(response.data[i]["Declined"],response.data[i]["Total submission"]);
                    leads.push({ "#": i+1, ...response.data[i] });
                }
                let lastRow = {
                    "#": "Total",
                    "Doc In": this.getCountPercentage(docsIn, totalSubmission),
                    "Submitted": this.getCountPercentage(submitted, totalSubmission),
                    "Approved": this.getCountPercentage(approved, totalSubmission),
                    "Contract Out": this.getCountPercentage(contractOut, totalSubmission),
                    "Contract In": this.getCountPercentage(contractIn, totalSubmission),
                    "Funded": this.getCountPercentage(funded, totalSubmission),
                    "Declined": this.getCountPercentage(declined, totalSubmission),
                    "Total submission": totalSubmission,
                    "Agent name": ''
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

    getCountPercentage(value: number, total: number) {
        if(value) {
            let percentage = (Number(value) / Number(total)) * 100;
            return value + '(' + percentage + ')' + '%'
        } else {
            return '';
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
        this.getFundingReports();
    }

    /**
     * @description on page change
     * @returns {void}
     * @param p 
     */
    onPageChange(p: number): void {
        this.page = p;
        this.getFundingReports();
    }
    get userBaseRoute() {
        return this.authService.getUserRole().toLowerCase();
    }
    getUserDetails(): void {
        try {
            let ud = this.authService.getUserDetails();
            if (ud) {
              this.dateFormat = ud.date_format;
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
    getDate(date: any) {
        return moment(date).tz(this.timeZone).format(`${this.dateFormat} hh:mm:ss A`)
    }
    getColorOnUpdate() {
        this.colorSubs = this.authService.getColor().subscribe((u) => {
          this.getUserDetails();
        });
      }
      sortBy(col:string){
        if(!this.submissionReportList.length){
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
        // this.getFundingReports();
        }
    }

