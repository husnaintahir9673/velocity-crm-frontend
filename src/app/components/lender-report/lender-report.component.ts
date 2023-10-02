import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { API_PATH } from '@constants/api-end-points';
import {
  NgbCalendar,
  NgbDate,
  NgbDateParserFormatter,
  NgbDateStruct,
} from '@ng-bootstrap/ng-bootstrap';
import { ApiService } from '@services/api.service';
import { AuthService } from '@services/auth.service';
import { CommonService } from '@services/common.service';
import { ExcelService } from '@services/excel.service';
import { lastValueFrom, Subscription } from 'rxjs';

@Component({
  selector: 'app-lender-report',
  templateUrl: './lender-report.component.html',
  styleUrls: ['./lender-report.component.scss', '../../styles/dashboard.scss'],
})
export class LenderReportComponent implements OnInit {
  pageLimit: number = 10;
  lenderReportList: Array<any> = [];
  totalRecords: number = 0;
  page: number = 1;
  userListPage: number = 1;
  hoveredDate: NgbDate | null = null;
  fromDate!: NgbDate | null;
  toDate!: NgbDate | null;
  selectedDate: any = '';
  maxDate!: NgbDateStruct;
  lendersList: Array<any> = [];
  userList: Array<any> = [];
  hasMoreUsers: boolean = false;
  @ViewChild('datepicker') datepicker: any;
  @ViewChild('selectAll') selectAll!: ElementRef;

  tempFilter: { [key: string]: any } = {
    Date: { value: '' },
    Lender: { value: null },
  };

  appliedFilter: { [key: string]: any } = {};
  colorSubs!:Subscription;
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
    private excelService: ExcelService
  ) {}

  ngOnInit(): void {
    this.getLenderReports();
    this.maxDate = this.calendar.getToday();
    this.getlendersList();
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
    this.getLenderReports();
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

  async getlendersList() {
    try {
      const res$ = this.apiService.getReq(
        API_PATH.ALL_LENDERS_LIST,
        'lender',
        'list'
      );
      let response = await lastValueFrom(res$);
      if (response && response.status_code == '200') {
        this.lendersList = response.data.lender_list;
      } else {
        this.commonService.showError(response.message);
      }
      this.commonService.hideSpinner();
    } catch (error: any) {
      this.commonService.hideSpinner();
      this.commonService.showErrorMessage(error);
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
  async getLenderReports() {
    let url = `?sort_by=${this.search.sortby}&dir=${this.search.order}&page_limit=${this.pageLimit}&page=${this.page}`;
    if (this.appliedFilter['Date']?.value) {
      url = `${url}&daterange_filter=${this.appliedFilter['Date']?.value}`;
    }
    if (
      this.appliedFilter['Lender']?.value &&
      this.appliedFilter['Lender'].value.id
    ) {
      url = `${url}&lender_id=${this.appliedFilter['Lender'].value.id}`;
    }
    try {
      this.commonService.showSpinner();
      const res$ = this.apiService.getReq(
        API_PATH.LENDER_REPORT + url,
        'lender',
        'report'
      );
      let response = await lastValueFrom(res$);
      if (response && response.status_code == '200') {
        if (response.data && response.data.data) {
          this.lenderReportList = response.data.data;
          this.totalRecords = response.data.total_records;
        } else {
          this.lenderReportList = [];
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
        this.excelService.exportAsExcelFile(res, 'Lender_Report');
      } else {
        this.commonService.showError('No data found');
      }
    } catch (error: any) {
      this.commonService.showError(error.message);
    }
  }

  async getReportDataForExport() {
    try {
      let url = `?export=${'export'}`;
      this.commonService.showSpinner();
      const res$ = this.apiService.getReq(
        API_PATH.LENDER_REPORT + url,
        'funding',
        'report'
      );
      const response = await lastValueFrom(res$);
      this.commonService.hideSpinner();
      if (response && response.status_code == '200') {
        let leads = [];
        let total_funds = 0;
        let total_funding = 0;
        let commission = 0;
        let commission_on_fee = 0;
        let total_commission = 0;
        let broker_commission = 0;
        let broker_commission_on_fee = 0;
        let total_broker_commission = 0;
        for (let i = 0; i < response.data.length; i++) {
          total_funds += response.data[i]['Total funds'];
          total_funding += response.data[i]['Total funding'];
          commission += response.data[i]['Commission'];
          commission_on_fee += response.data[i]['Commission on fee'];
          total_commission += response.data[i]['Total commission'];
          broker_commission += response.data[i]['Broker commission'];
          broker_commission_on_fee +=
            response.data[i]['Broker commission on fee'];
          total_broker_commission +=
            response.data[i]['Total broker commission'];
          leads.push({ '#': i + 1, ...response.data[i] });
        }
        let lastRow = {
          '#': 'Total',
          'Total funds': total_funds,
          'Total funding': total_funding,
          Commission: commission.toFixed(2),
          'Commission on fee': commission_on_fee,
          'Total commission': total_commission.toFixed(2),
          'Broker commission': broker_commission,
          'Broker commission on fee': broker_commission_on_fee,
          'Total broker commission': total_broker_commission,
        };
        leads.push(lastRow);
        return Promise.resolve(leads);
      } else {
        return Promise.resolve([]);
      }
    } catch (error) {
      return Promise.reject(error);
    }
  }
  getTotalvalue(name: any) {
    let total = 0;
    this.lenderReportList.map((result) => {
      total += Number(result[name]);
    });
    return Number(total.toFixed(2)).toLocaleString('en-GB');
    // if(total != 0){
    //     return total;
    // }else{
    //     return ''
    // }
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
    this.getLenderReports();
  }

  /**
   * @description on page change
   * @returns {void}
   * @param p
   */
  onPageChange(p: number): void {
    this.page = p;
    this.getLenderReports();
  }
  get userBaseRoute() {
    return this.authService.getUserRole().toLowerCase();
  }

  sortBy(col:string){
    if(!this.lenderReportList.length){
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
    this.getLenderReports();
    }
}
