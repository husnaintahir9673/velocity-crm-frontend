import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { API_PATH } from '@constants/api-end-points';
import { NgbCalendar, NgbDate, NgbDateParserFormatter, NgbDateStruct } from '@ng-bootstrap/ng-bootstrap';
import { ApiService } from '@services/api.service';
import { AuthService } from '@services/auth.service';
import { CommonService } from '@services/common.service';
import { lastValueFrom, Subscription } from 'rxjs';

@Component({
      selector: 'app-sms-marketing-report',
      templateUrl: './sms-marketing-report.component.html',
      styleUrls: ['./sms-marketing-report.component.scss', '../../styles/dashboard.scss']
})
export class SmsMarketingReportComponent implements OnInit {
      pageLimit: number = 10;
      updateLogsReportList: Array<any> = [];
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
            "Lead id": { value: "" },
            "Phone": { value: "" },
            "Status": { value: null },
      }

      appliedFilter: { [key: string]: any } = {
      }
      colorSubs!:Subscription;
      color!: string;

      constructor(
            private commonService: CommonService,
            private apiService: ApiService,
            public formatter: NgbDateParserFormatter,
            private calendar: NgbCalendar,
            private authService: AuthService,
      ) { }


      ngOnInit(): void {
            this.getUpdatesLogsReports();
            this.maxDate = this.calendar.getToday();
                this.getUserDetails();
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
            this.getUpdatesLogsReports();
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
      async getUpdatesLogsReports() {
            let url = `?page_limit=${this.pageLimit}&page=${this.page}`;
            if (this.appliedFilter['Date']?.value) {
                  url = `${url}&daterange_filter=${this.appliedFilter['Date']?.value}`;
            }
            if (this.appliedFilter['User']?.value && this.appliedFilter['User'].value.id) {
                  url = `${url}&user_id=${this.appliedFilter['User'].value.id}`;
            }
            if (this.appliedFilter['Lead id']?.value) {
                  url = `${url}&lead_id=${this.appliedFilter['Lead id'].value}`;
            }
            try {
                  this.commonService.showSpinner();
                  const res$ = this.apiService.getReq(API_PATH.UPDATE_LOG_REPORT + url, 'updates', 'log');
                  let response = await lastValueFrom(res$);
                  if (response && response.status_code == "200") {
                        if (response.data && response.data.data) {
                              this.updateLogsReportList = response.data.data;
                              this.totalRecords = response.data.total_records;
                        } else {
                              this.updateLogsReportList = [];
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
       * @description on limit change
       * @param value 
       * @returns {void}
       * @author Shine Dezign Infonet Pvt. Ltd.
       */
      onLimitChange(value: number): void {
            this.pageLimit = value;
            this.page = 1;
            this.getUpdatesLogsReports();
      }

      /**
       * @description on page change
       * @returns {void}
       * @param p 
       */
      onPageChange(p: number): void {
            this.page = p;
            this.getUpdatesLogsReports();
      }
      get userBaseRoute() {
            return this.authService.getUserRole().toLowerCase();
      }
      // custom datepicker color
ngDoCheck():void {
      this.getDateColor();
  }
  
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
              
              this.color=ud?.color;
                 

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
}




