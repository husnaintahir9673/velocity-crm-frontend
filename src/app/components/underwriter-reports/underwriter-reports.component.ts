import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { API_PATH } from '@constants/api-end-points';
import * as Constants from '@constants/constants';
import { Roles } from '@constants/constants';
import {
  NgbCalendar,
  NgbDate,
  NgbDateParserFormatter,
  NgbDateStruct,
} from '@ng-bootstrap/ng-bootstrap';
import { ApiService } from '@services/api.service';
import { AuthService } from '@services/auth.service';
import { CommonService } from '@services/common.service';
import moment from 'moment';
import { lastValueFrom, Subscription } from 'rxjs';

@Component({
  selector: 'app-underwriter-reports',
  templateUrl: './underwriter-reports.component.html',
  styleUrls: [
    './underwriter-reports.component.scss',
    '../../styles/dashboard.scss',
    '../../styles/predictive-search.scss',
  ],
})
export class UnderwriterReportsComponent implements OnInit {
  routeSubscription!: Subscription;
  roles = Constants.Roles;
  userRole: string = '';
  pageLimit: number = 10;
  underwriterReportList: Array<any> = [];
  totalRecords: number = 0;
  page: number = 1;
  hoveredDate: NgbDate | null = null;
  fromDate!: NgbDate | null;
  toDate!: NgbDate | null;
  selectedDate: any = '';
  showTR1: any = -1;
  showTR2: any = -1;
  showLeadSubmission: boolean = false;
  showLeadRjected: boolean = false;
  maxDate!: NgbDateStruct;
  dateFormat: string = '';
  timeZone: string = '';
  underwritersList: Array<any> = [];
  @ViewChild('datepicker') datepicker: any;
  @ViewChild('selectAll') selectAll!: ElementRef;

  tempFilter: { [key: string]: any } = {
    Date: { value: '' },
    Underwriter: { value: null },
  };

  appliedFilter: { [key: string]: any } = {};
  colorSubs!: Subscription;
  background!: { background: string; };
  style!: { fill: string; };
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
  ) {}

  ngOnInit(): void {
    this.getUnderwriterReports();
    this.maxDate = this.calendar.getToday();
    this.getUserDetails();
    if (this.userRole != Roles.UNDERWRITER) {
      this.getUnderwriterOptions();
    }
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
  getColorOnUpdate() {
    this.colorSubs = this.authService.getColor().subscribe((u) => {
      this.getUserDetails();
    });
  }
  getDate(date: any) {
    return moment(date)
      .tz(this.timeZone)
      .format(`${this.dateFormat} hh:mm:ss A`);
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
  toggleLeadSubmission(rowIndex: any, element: any, val: boolean) {
    this.showLeadSubmission = val;
    this.showTR1 = rowIndex;
    if (!val) {
      this.showTR1 = -1;
    }
    // if (element.textContent == '+') {
    //     element.textContent = '-';
    // } else {
    //     element.textContent = '+';
    // }
    // if (this.showLeadSubmission) {
    //     this.showLeadRjected = false
    // }
  }
  toggleLeadRjected(rowIndex: any, element: any, val: boolean) {
    this.showTR2 = rowIndex;
    this.showLeadRjected = val;
    if (!val) {
      this.showTR2 = -1;
    }
    // if (element.textContent == '+') {
    //   element.textContent = '-';
    // } else {
    //   element.textContent = '+';
    // }

    // if (this.showLeadRjected) {
    //   this.showLeadSubmission = false;
    // }
  }

  /**
   * @description on Search click
   */
  onSearch() {
    this.page = 1;
    this.appliedFilter = JSON.parse(JSON.stringify(this.tempFilter));
    this.getUnderwriterReports();
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

  async getUnderwriterOptions() {
    try {
      this.commonService.showSpinner();
      const res$ = this.apiService.getReq(API_PATH.UNDERWRITER_OPTIONS, '', '');
      let response = await lastValueFrom(res$);
      if (response && response.data) {
        this.underwritersList = response.data;
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
    return (
      this.fromDate &&
      !this.toDate &&
      this.hoveredDate &&
      date.after(this.fromDate) &&
      date.before(this.hoveredDate)
    );
  }

  isInside(date: NgbDate) {
    return this.toDate && date.after(this.fromDate) && date.before(this.toDate);
  }

  isRange(date: NgbDate) {
    return (
      date.equals(this.fromDate) ||
      (this.toDate && date.equals(this.toDate)) ||
      this.isInside(date) ||
      this.isHovered(date)
    );
  }

  validateInput(currentValue: NgbDate | null, input: string): NgbDate | null {
    const parsed = this.formatter.parse(input);
    return parsed && this.calendar.isValid(NgbDate.from(parsed))
      ? NgbDate.from(parsed)
      : currentValue;
  }

  onDateSelection(date: NgbDate) {
    if (!this.fromDate && !this.toDate) {
      this.fromDate = date;
    } else if (
      this.fromDate &&
      !this.toDate &&
      date &&
      (date.equals(this.fromDate) || date.after(this.fromDate))
    ) {
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
  async getUnderwriterReports() {
    let url = `?sort_by=${this.search.sortby}&dir=${this.search.order}&page_limit=${this.pageLimit}&page=${this.page}`;
    if (this.appliedFilter['Date']?.value) {
      url = `${url}&daterange_filter=${this.appliedFilter['Date']?.value}`;
    }

    if (
      this.appliedFilter['Underwriter']?.value &&
      this.appliedFilter['Underwriter'].value.id
    ) {
      url = `${url}&underwriter=${this.appliedFilter['Underwriter'].value.name}`;
    }

    try {
      this.commonService.showSpinner();
      const res$ = this.apiService.getReq(
        API_PATH.UNDERWRITER_REPORT + url,
        'underwriter',
        'report'
      );
      let response = await lastValueFrom(res$);
      if (response && response.status_code == '200') {
        if (response.data && response.data.data) {
          this.underwriterReportList = response.data.data;
          this.totalRecords = response.data.total_records;
        } else {
          this.underwriterReportList = [];
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
    this.getUnderwriterReports();
  }

  /**
   * @description on page change
   * @returns {void}
   * @param p
   */
  onPageChange(p: number): void {
    this.page = p;
    this.getUnderwriterReports();
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
  if(!this.underwriterReportList.length){
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
  this.getUnderwriterReports();
  }
}
