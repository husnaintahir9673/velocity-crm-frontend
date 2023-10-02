import { Component, OnInit, QueryList, ViewChild, ViewChildren } from '@angular/core';
import { API_PATH } from '@constants/api-end-points';
import * as Constants from '@constants/constants';
import { NgbCalendar, NgbDate, NgbDateParserFormatter, NgbDateStruct } from '@ng-bootstrap/ng-bootstrap';
import { ApiService } from '@services/api.service';
import { AuthService } from '@services/auth.service';
import { CommonService } from '@services/common.service';
import { ChartConfiguration, ChartOptions } from 'chart.js';
import { BaseChartDirective } from 'ng2-charts';
import { lastValueFrom } from 'rxjs';

@Component({
    selector: 'app-dashboard',
    templateUrl: './dashboard.component.html',
    styleUrls: ['../../../styles/dashboard.scss', './dashboard.component.scss']
})
export class DashboardComponent implements OnInit {

    roles = Constants.Roles;
    userRole: string = '';
    dashboardData: any = {};
    advanceSearchToggle: boolean = false;
    usersList: Array<any> = [];
    userListPage: number = 1;
    hasMoreUsers: boolean = false;
    usersListLimit: number = 10;
    totalUsersCount: number = 0;
    hoveredDate: NgbDate | null = null;
    fromDate!: NgbDate | null;
    toDate!: NgbDate | null;
    selectedDate: string = '';
    maxDate!: NgbDateStruct;
    companyStatus: string = '';
    searchKeyword: string = ''
    @ViewChild('datepicker') datepicker: any;
    // userKeys: Array<any> = [];
    // userValues: Array<any> = [];
    // leadKeys: Array<any> = [];
    // leadValues: Array<any> = [];
    // tempUserFilter: { [key: string]: any } = {
    //     "Date Range": { value: null },
    // }
    // tempLeadFilter: { [key: string]: any } = {
    //     "Date Range": { value: null },
    // }
    // userDateOptions = [
    //      { id: 'last_week', name: 'Last Week' },
    //     { id: 'last_month', name: 'Last Month' },
    //     { id: 'last_six_months', name: 'Last Six Months' },
    //     { id: 'last_year', name: ' Last Year' },
    // ]
    // leadDateOptions = [
    //      { id: 'last_week', name: 'Last Week' },
    //     { id: 'last_month', name: 'Last Month' },
    //     { id: 'last_six_months', name: 'Last Six Months' },
    //     { id: 'last_year', name: ' Last Year' },
    // ]

    // appliedUserFilter: { [key: string]: any } = {
    // }
    // appliedLeadFilter: { [key: string]: any } = {
    // }
    // @ViewChildren(BaseChartDirective)
    // public chart!:QueryList<BaseChartDirective>;
    // public userChartData: ChartConfiguration<'line'>['data'] = {
    //     labels: this.userKeys,
    //     datasets: [
    //       {
    //         data: this.userValues,
    //         label: '',
    //         fill: false,
    //         tension: 0.5,
    //         borderColor: '#f0412e',
    //         backgroundColor: 'transparent',
    //         pointBackgroundColor: '#f0412e',
    //         pointHoverBackgroundColor: '#f0412e',
    //         pointHoverBorderColor: '#f0412e',
    //       }
    //     ]
    //   };
    //   public userChartOptions: ChartOptions<'line'> = {
    //     responsive: true,
    //     maintainAspectRatio: false,
    //     scales: {
    //         'y-axis-0':
    //         {
    //             ticks: {
    //                 stepSize: 1,
                    
    //             }
    //         }
    //     }
    //   };
    //   public userChartLegend = false;
    //   public leadChartLegend = true;
    
    //   public leadChartData: ChartConfiguration<'pie'>['data'] = {
    //     labels: this.leadKeys,
    //     datasets: [
    //       { data: this.leadValues, 
    //         label: '',
    //         backgroundColor: [ '#547BDB', '#7C8F2F','#1DC9AC', '#DA7625', '#B1525A', '#7CCDEF', '#5254A6', '#272A37', "#C96257", "#107C41", '#BBDEFB', "#EAE2B7", "#ef476f"],
    //         hoverBackgroundColor:  [ '#547BDB', '#7C8F2F','#1DC9AC', '#DA7625', '#B1525A', '#7CCDEF', '#5254A6', '#272A37', "#C96257", "#107C41", '#BBDEFB', "#EAE2B7", "#ef476f"],
    //         hoverBorderColor:  [ '#547BDB', '#7C8F2F','#1DC9AC', '#DA7625', '#B1525A', '#7CCDEF', '#5254A6', '#272A37', "#C96257", "#107C41", '#BBDEFB', "#EAE2B7", "#ef476f"],
    //      },
    //     ]
    //   };
    
    //   public leadChartOptions: ChartConfiguration<'pie'>['options'] = {
    //     responsive: true,
    //     maintainAspectRatio: false
    //   };
    

    constructor(
        private authService: AuthService,
        private commonService: CommonService,
        private apiService: ApiService,
        public formatter: NgbDateParserFormatter,
        private calendar: NgbCalendar,
    ) { }

    ngOnInit(): void {
        this.maxDate = this.calendar.getToday();
        this.getDashboardData();
        this.getUserDetails();
        // this.getGraphsData();
    }

    /**
     * @description get data from api for stats
     * @author Shine Dezign Infonet Pvt. Ltd.
     * @returns {Promise<void>}
     */
    async getDashboardData(): Promise<any> {
        try {
            this.commonService.showSpinner();
            const res$ = this.apiService.getReq(API_PATH.DASHBOARD,'', '');
            let response = await lastValueFrom(res$);
            if (response && response.data) {
                this.dashboardData = response.data;
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
    // async getGraphsData(): Promise<any> {
    //     try {
    //         let url = '?';
    //         if (this.appliedUserFilter['Date Range']?.value && this.appliedUserFilter['Date Range'].value.id) {
    //             url = `${url}&user_daterange_filter=${this.appliedUserFilter['Date Range']?.value.id}`;
    //         }
    //         if (this.appliedLeadFilter['Date Range']?.value && this.appliedLeadFilter['Date Range'].value.id) {
    //             url = `${url}&lead_daterange_filter=${this.appliedLeadFilter['Date Range']?.value.id}`;
    //         }
    //         this.commonService.showSpinner();
    //         const res$ = this.apiService.getReq(API_PATH.GRAPH_DASHBOARD + url,'','');
    //         let response = await lastValueFrom(res$);
    //          if(response && response.data) {
    //          this.userKeys = response.data.user_keys ;
    //          this.userValues = response.data.user_values;
    //          this.userChartData.labels = response.data.user_keys;
    //          this.userChartData.datasets[0].data = response.data.user_values;
    //          this.leadKeys = response.data.lead_keys ;
    //          this.leadValues = response.data.lead_values; 
    //          this.leadChartData.labels = response.data.lead_keys;
    //          this.leadChartData.datasets[0].data = response.data.lead_values;
    //             this.chart.forEach((e)=> {
    //                     e?.chart?.update();
    //             })
    //          }
    //         this.commonService.hideSpinner();
    //     } catch (error: any) {
    //         this.commonService.hideSpinner();
    //         if (error.error && error.error.message) {
    //             this.commonService.showError(error.error.message);
    //         } else {
    //             this.commonService.showError(error.message);
    //         }
    //     }
    // }
    // removeUserFilter(key: string) {
    //     this.tempUserFilter[key].value = null;
    //     this.onUserSearch();
    // }
    // removeLeadFilter(key: string) {
    //     this.tempLeadFilter[key].value = null;
    //     this.onLeadSearch();
    // }
    // onUserSearch() {
    //     this.appliedUserFilter = JSON.parse(JSON.stringify(this.tempUserFilter));
    //     this.getGraphsData();
    // }
    // onLeadSearch() {
    //     this.appliedLeadFilter = JSON.parse(JSON.stringify(this.tempLeadFilter));
    //     this.getGraphsData();
    // }


    /**
     * @description get user details from localstrorage
     * @author Shine Dezign Infonet Pvt. Ltd.
     * @returns {void}
     */
    getUserDetails(): void {
        try {
            let ud = this.authService.getUserDetails();
            if (ud) {
                this.userRole = ud.role;
            }
        } catch (error: any) {
            this.commonService.showError(error.message);
        }
    }


    isHovered(date: NgbDate) {
        return this.fromDate && !this.toDate && this.hoveredDate && date.after(this.fromDate) && date.before(this.hoveredDate);
    }

}
