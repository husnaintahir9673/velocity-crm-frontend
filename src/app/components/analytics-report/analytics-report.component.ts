import { JsonPipe } from '@angular/common';
import { Component, OnInit, ViewChild } from '@angular/core';
import { API_PATH } from '@constants/api-end-points';
import { NgbCalendar, NgbDate, NgbDateParserFormatter, NgbDateStruct } from '@ng-bootstrap/ng-bootstrap';
import { ApiService } from '@services/api.service';
import { AuthService } from '@services/auth.service';
import { CommonService } from '@services/common.service';
import { ChartDataset, ChartOptions } from 'chart.js';
import { lastValueFrom, Subscription } from 'rxjs';
@Component({
    selector: 'app-analytics-report',
    templateUrl: './analytics-report.component.html',
    styleUrls: ['./analytics-report.component.scss', '../../styles/dashboard.scss']
})
export class AnalyticsReportComponent implements OnInit {
    maxDate!: NgbDateStruct;
    hoveredDate: NgbDate | null = null;
    fromDate!: NgbDate | null;
    toDate!: NgbDate | null;
    selectedDate: any = '';
    page: number = 1;
    stateNameList: Array<any> = [];
    stateCount: Array<any> = [];
    bussinessTypeList: Array<any> = [];
    bussinessNameList: Array<any> = [];
    bussinessCount: Array<any> = [];
    leadStatusList: Array<any> = [];
    countriesList: Array<any> = [];
    statesList: Array<any> = [];
    tempFilter: { [key: string]: any } = {
        "Date": { value: "" },
        "Bussiness Type": { value: null },
        "States": { value: null },
        "Status": { value: null },
        "Country": { value: null },
    }
    selectedBussinessType: Array<any> = [];
    selectedStates: Array<any> = [];
    appliedFilter: { [key: string]: any } = {
    }
    @ViewChild('datepicker') datepicker: any;
    stateChartData: ChartDataset[] = [
        { data: this.stateCount, label: 'Lead By States' },
    ];
    stateChartLabels = this.stateNameList;
    stateChartOptions = {
        responsive: true,
    };
    stateChartColors = [
        {
            borderColor: 'black',
            backgroundColor: 'rgba(255,255,0,0.28)',
        },
    ];
    stateChartLegend = true;
    stateChartPlugins = [];
    stateChartType = 'pie';
    bussinessChartData: ChartDataset[] = [
        { data: this.bussinessCount, label: 'Lead By Bussiness Type' },
    ];
    bussinessChartLabels = this.bussinessNameList;
    bussinessChartOptions = {
        responsive: true,
    };
    bussinessChartColors = [
        {
            borderColor: 'black',
            backgroundColor: 'rgba(255,255,0,0.28)',
        },
    ];
    bussinessChartLegend = true;
    bussinessChartPlugins = [];
    bussinessChartType = 'pie';
    loading = false;
    countryId: string = "";
    style!: { fill: string; };
    background!: { background: string; };
    colorSubs!: Subscription;
    color!: string;


    constructor(private calendar: NgbCalendar,
        private authService: AuthService,
        public formatter: NgbDateParserFormatter,
        private apiService: ApiService,
        private commonService: CommonService) { }

    ngOnInit(): void {
        this.maxDate = this.calendar.getToday();
        this.getLeadOptions();
        this.getCountries();
        this.getUserDetails();
        this.getAnalyticsReports();
       
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

    async getLeadOptions() {
        try {
            this.commonService.showSpinner();
            const res$ = this.apiService.getReq(API_PATH.LEAD_OPTIONS_LIST, '', '');
            let response = await lastValueFrom(res$);
            if (response && response.data) {
                this.leadStatusList = response.data.status;
                this.bussinessTypeList = response.data.business_type;
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
        this.toDate = null;
        this.fromDate = null;
        let i = this.countriesList.findIndex((e) => e.name === "United States");
        if (i > -1) {
            this.tempFilter['Country'].value = this.countriesList[i].id;
            this.getStates(this.countriesList[i].id);
        }
        for (const p in this.tempFilter) {
            this.tempFilter[p].value = null;
        }
        this.onSearch();
    }
    async getAnalyticsReports() {
        let url = '?';
        if (this.appliedFilter['Date']?.value) {
            url = `${url}&daterange_filter=${this.appliedFilter['Date']?.value}`;
        }
        this.selectedBussinessType = [];
        for (let i = 0; i < this.appliedFilter['Bussiness Type']?.value?.length; i++) {
            let index = this.bussinessTypeList.findIndex((e) => e.name === this.appliedFilter['Bussiness Type']?.value[i]);
            if (index > -1) { 
                this.selectedBussinessType.push(this.bussinessTypeList[index].id);
            }
           }
      if (this.appliedFilter['Bussiness Type']?.value) {
          let bussiness = JSON.stringify(this.selectedBussinessType);
            url = `${url}&leadBusinessType=${bussiness}`;
        }
        this.selectedStates = [];
        for (let i = 0; i < this.appliedFilter['States']?.value?.length; i++) {
            let index = this.statesList.findIndex((e) => e.name === this.appliedFilter['States']?.value[i]);
            if (index > -1) {
                this.selectedStates.push(this.statesList[index].id);
            }
           }
        if (this.appliedFilter['States']?.value) {
          let states = JSON.stringify(this.selectedStates);
          url = `${url}&states=${states}`;
        }
        // if (this.appliedFilter['Country']?.value) {
        //     url = `${url}&country_id=${this.countryId}`;
        // }
        if (this.appliedFilter['Status']?.value && this.appliedFilter['Status'].value.name) {
            url = `${url}&status=${this.appliedFilter['Status'].value.name}`;
        }
        try {
            this.commonService.showSpinner();
            const res$ = this.apiService.getReq(API_PATH.ANALYTICS_REPORTS + url, 'analytics', 'reports');
            let response = await lastValueFrom(res$);
            if (response && response.status_code == "200") {
                if (response.data && response.data) {
                    this.stateNameList = response.data.state_name;
                    this.stateCount = response.data.state_count;
                    this.bussinessNameList = response.data.business_type_name;
                    this.bussinessCount = response.data.business_type_count;
                    this.stateChartLabels = this.stateNameList;
                    this.stateChartData[0].data = this.stateCount;
                    this.bussinessChartLabels = this.bussinessNameList;
                    this.bussinessChartData[0].data = this.bussinessCount;

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
    onCountryChange(countryName: any): void {
        let i = this.countriesList.findIndex((e) => e.name === countryName);
        if (i > -1) {
            this.countryId = this.countriesList[i].id
             this.getStates(this.countriesList[i].id);
        }
     
    //     // let country = JSON.parse(countryId.target.value);
    //     this.countryId = country.id
    //    this.getStates(country.id);

    }
      /**
     * @description get states list
     * @param country_id 
     * @author Shine Dezign Infonet Pvt. Ltd.
     */
       async getStates(country_id: string) {
        try {
            this.commonService.showSpinner();
            const res$ = this.apiService.postReq(API_PATH.STATES, { country_id: country_id }, '', '');
            let response = await lastValueFrom(res$);
            if (response && response.data) {
                this.statesList = response.data;
                   this.tempFilter['States'].value = '';
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
   * @description get countries list
   * @author Shine Dezign Infonet Pvt. Ltd.
   */
        async getCountries() {
            try {
                this.commonService.showSpinner();
                const res$ = this.apiService.getReq(API_PATH.COUNTRIES_LIST, '', '');
                let response = await lastValueFrom(res$);
                if (response && response.data) {
                    this.countriesList = response.data;
                    let i = this.countriesList.findIndex((e) => e.name === "United States");
                    if (i > -1) {
                        this.tempFilter['Country'].value = this.countriesList[i].name;
                        this.countryId = this.countriesList[i].id;
                        this.getStates(this.countriesList[i].id);
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
        get userBaseRoute() {
            return this.authService.getUserRole().toLowerCase();
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
                    //this.onSearch();
                }
            }
        }
        removeFilter(key: string) {
            if (key === 'Date') {
                this.selectedDate = '';
                this.toDate = null;
                this.fromDate = null;
            }else if(key === 'State'){
                this.selectedStates = []
            }else if(key === 'Bussiness Type'){
                this.selectedBussinessType = []
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
            this.getAnalyticsReports();
        }
    
        /**
         * @description on Status Change
         */
        onStatusChange() {
            this.onSearch();
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

}


