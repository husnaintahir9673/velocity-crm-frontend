import { Component, OnInit, ViewChild } from '@angular/core';
import { API_PATH } from '@constants/api-end-points';
import { NgbCalendar, NgbDate, NgbDateParserFormatter, NgbDateStruct } from '@ng-bootstrap/ng-bootstrap';
import { ApiService } from '@services/api.service';
import { AuthService } from '@services/auth.service';
import { CommonService } from '@services/common.service';
import moment from 'moment';
import { lastValueFrom } from 'rxjs';

@Component({
  selector: 'app-email-statics',
  templateUrl: './email-statics.component.html',
  styleUrls: ['../../styles/dashboard.scss','./email-statics.component.scss',]
})
export class EmailStaticsComponent implements OnInit {

  pageLimit: number = 10;
  page: number = 1;
  fromDate!: NgbDate | null;
  toDate!: NgbDate | null;
  maxDate!: NgbDateStruct;
  hoveredDate: NgbDate | null = null;
  selectedDate: any = '';
  emailLogsReportList: Array<any> = [];
  totalRecords: number = 0;
  timeZone: string = ''
  dateFormat: string = "";
  totalEmails:any;
  totalDelivered:any;
  totalUndeliverable:any;
  totalUnsbscribe:any;
  totalClickRates:any;
  totalOpenRates:any;
  total_undeliverd:number=0;
  @ViewChild('datepicker') datepicker: any;

  emailOptions = [
    { id: 0, name: 'Bounced Emails' },
    { id: 1, name: 'Blocked Emails' },
    { id: 2, name: 'Spam Emails' },
    { id: 3, name: 'Invalid Emails' }
  ]
  
  tempFilter: { [key: string]: any } = {
    "Date": { value: "" },
    "Email": { value: null },
    "Email Type": { value: this.emailOptions[0] },
  }

  appliedFilter: { [key: string]: any } = {
  
  }
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
    private authService: AuthService
  ) { }

  ngOnInit(): void {
    this.getEmailLogReports();
    this.getUserDetails();
    this.maxDate = this.calendar.getToday();

  }
  ngDoCheck():void {
        
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

  /**
   * @description on Search click
   */

  onSearch() {
    this.page = 1;
    this.appliedFilter = JSON.parse(JSON.stringify(this.tempFilter));
    this.getEmailLogReports();
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

  /**
  * @description get leads listing
  */
  async getEmailLogReports() {
    let url = `?sort_by=${this.search.sortby}&dir=${this.search.order}&page_limit=${this.pageLimit}&page=${this.page}`;
    if (this.appliedFilter['Date']?.value) {
      url = `${url}&daterange_filter=${this.appliedFilter['Date']?.value}`;
    }

    if (this.appliedFilter['Email']?.value) {
      url = `${url}&email=${this.appliedFilter['Email'].value}`;
    }
    if (this.appliedFilter['Email Type']?.value && this.appliedFilter['Email Type'].value.name) {
      url = `${url}&email_type=${this.appliedFilter['Email Type'].value.name}`;
    }
    try {
      this.commonService.showSpinner();
      const res$ = this.apiService.getReq(API_PATH.EMAIL_REPORT_LOGS + url, 'email', 'statistics', );
      let response = await lastValueFrom(res$);
      // console.log('res',response)
      if (response && response.status_code == "200") {
          if (response.data && response.data.logs) {
              this.totalEmails = response.data.total_records;

              this.totalDelivered = response.data.total_delivered;
              this.totalUndeliverable = response.data.total_undelivered;
              this.emailLogsReportList = response.data.logs;
              // this.totalRecords = response.data.total_records;
              this.totalOpenRates = response.data.total_read
              this.totalClickRates = response.data.total_click_rates
              this.total_undeliverd =  Number(this.totalDelivered) - Number(this.totalOpenRates)
             
              
              
          } else {
              this.emailLogsReportList = [];
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

  removeFilter(key: string) {
    if (key === 'Date') {
        this.selectedDate = '';
        this.toDate = null;
        this.fromDate = null;
    }
    this.tempFilter[key].value = null;
    this.onSearch();
  }

  getUserDetails(): void {
    try {
        let ud = this.authService.getUserDetails();
        if (ud) {
            this.dateFormat =  ud.date_format;
            this.timeZone = ud.time_zone;
            this.color = ud?.color;
           
        }
    } catch (error: any) {
        this.commonService.showError(error.message);
    }
}

  getDate(date: any){
    return moment(date).tz(this.timeZone).format(`${this.dateFormat} hh:mm:ss A`)
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
    this.getEmailLogReports();
  }

  /**
   * @description on page change
   * @returns {void}
   * @param p 
   */
  onPageChange(p: number): void {
    this.page = p;
    this.getEmailLogReports();
  }
  sortBy(col:string){
    if(!this.emailLogsReportList.length){
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
    this.getEmailLogReports();
    }

}
