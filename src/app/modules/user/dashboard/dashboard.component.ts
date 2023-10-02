import { Component, OnInit} from '@angular/core';
import { API_PATH } from '@constants/api-end-points';
import * as Constants from '@constants/constants';
import { ApiService } from '@services/api.service';
import { AuthService } from '@services/auth.service';
import { CommonService } from '@services/common.service';
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
    // userKeys: Array<any> = [];
    // userValues: Array<any> = [];
    // companyKeys: Array<any> = [];
    // companyValues: Array<any> = [];
    // leadKeys: Array<any> = [];
    // leadValues: Array<any> = [];
    // canViewCompanyCount: boolean = false;
    // canViewUserCount: boolean = false;
    // canViewLeadCount: boolean = false;

    // tempUserFilter: { [key: string]: any } = {
    //     "Date Range": { value: null },
    // }
    // tempCompanyFilter: { [key: string]: any } = {
    //     "Date Range": { value: null },
    // }
    // tempLeadFilter: { [key: string]: any } = {
    //     "Date Range": { value: null },
    // }
    // userDateOptions = [
    //     { id: 'last_week', name: 'Last Week' },
    //     { id: 'last_month', name: 'Last Month' },
    //     { id: 'last_six_months', name: 'Last Six Months' },
    //     { id: 'last_year', name: ' Last Year' },
    // ]
    // companyDateOptions = [
    //     { id: 'last_week', name: 'Last Week' },
    //     { id: 'last_month', name: 'Last Month' },
    //     { id: 'last_six_months', name: 'Last Six Months' },
    //     { id: 'last_year', name: ' Last Year' },
    // ]

    // leadDateOptions = [
    //     { id: 'last_week', name: 'Last Week' },
    //     { id: 'last_month', name: 'Last Month' },
    //     { id: 'last_six_months', name: 'Last Six Months' },
    //     { id: 'last_year', name: ' Last Year' },
    // ]

    // appliedUserFilter: { [key: string]: any } = {
    // }
    // appliedCompanyFilter: { [key: string]: any } = {
    // }
    // appliedLeadFilter: { [key: string]: any } = {
    // }
    // @ViewChildren(BaseChartDirective)
    // public chart!: QueryList<BaseChartDirective>;
    // public userChartData: ChartConfiguration<'line'>['data'] = {
    //     labels: this.userKeys,
    //     datasets: [
    //         {
    //             data: this.companyValues,
    //             label: 'Companies',
    //             fill: false,
    //             tension: 0.7,
    //             borderColor: '#000',
    //             backgroundColor: 'transparent',
    //             pointBackgroundColor: '#f0412e',
    //             pointHoverBackgroundColor: '#f0412e',
    //             pointHoverBorderColor: '#f0412e',
    //         },
    //         {
    //             data: this.userValues,
    //             label: 'Users',
    //             fill: false,
    //             tension: 0.5,
    //             borderColor: '#f0412e',
    //             backgroundColor: 'transparent',
    //             pointBackgroundColor: '#f0412e',
    //             pointHoverBackgroundColor: '#f0412e',
    //             pointHoverBorderColor: '#f0412e',
    //         },
    //     ]
    // };
    // public userChartOptions: ChartOptions<'line'> = {
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

    // };
    // public userChartLegend = true;
    // public pieChartOptions: ChartOptions<'pie'> = {
    //     responsive: true,
    // };
    // public pieChartLabels = [];;
    // public pieChartDatasets = [{
    //     data: this.companyValues,
    // }];
    // public pieChartLegend = false;
    // public pieChartPlugins = [];
    // public leadChartLegend = true;

    // public leadChartData: ChartConfiguration<'pie'>['data'] = {
    //     labels: this.leadKeys,
    //     datasets: [
    //         {
    //             data: this.leadValues,
    //             label: '',
    //          backgroundColor: [ '#547BDB', '#7C8F2F','#1DC9AC', '#DA7625', '#B1525A', '#7CCDEF', '#5254A6', '#272A37', "#C96257", "#107C41", '#BBDEFB', "#EAE2B7", "#ef476f"],
    //         hoverBackgroundColor:  [ '#547BDB', '#7C8F2F','#1DC9AC', '#DA7625', '#B1525A', '#7CCDEF', '#5254A6', '#272A37', "#C96257", "#107C41", '#BBDEFB', "#EAE2B7", "#ef476f"],
    //         hoverBorderColor:  [ '#547BDB', '#7C8F2F','#1DC9AC', '#DA7625', '#B1525A', '#7CCDEF', '#5254A6', '#272A37', "#C96257", "#107C41", '#BBDEFB', "#EAE2B7", "#ef476f"],
    //         },
    //     ]
    // };

    // public leadChartOptions: ChartConfiguration<'pie'>['options'] = {
    //     responsive: true,
    //     maintainAspectRatio: false
    // };

    constructor(
        private authService: AuthService,
        private commonService: CommonService,
        private apiService: ApiService,
    ) { }

    ngOnInit(): void {
        // this.getGraphsData();
        this.getDashboardData();
        this.getUserDetails();
    }
    /**
     * @description get data from api for stats
     * @author Shine Dezign Infonet Pvt. Ltd.
     * @returns {Promise<void>}
     */
    async getDashboardData(): Promise<any> {
        try {
            this.commonService.showSpinner();
            const res$ = this.apiService.getReq(API_PATH.DASHBOARD, '', '');
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
    //             url = `${url}&user_daterange_filter=${this.appliedUserFilter['Date Range']?.value.id}&company_daterange_filter=${this.appliedUserFilter['Date Range']?.value.id}`;
    //         }
    //         // if (this.appliedCompanyFilter['Date Range']?.value && this.appliedCompanyFilter['Date Range'].value.id) {
    //         //     url = `${url}&company_daterange_filter=${this.appliedCompanyFilter['Date Range']?.value.id}`;
    //         // }
    //         if (this.appliedLeadFilter['Date Range']?.value && this.appliedLeadFilter['Date Range'].value.id) {
    //             url = `${url}&lead_daterange_filter=${this.appliedLeadFilter['Date Range']?.value.id}`;
    //         }

    //         this.commonService.showSpinner();
    //         const res$ = this.apiService.getReq(API_PATH.GRAPH_DASHBOARD + url, '', '');
    //         let response = await lastValueFrom(res$);
    //         if (response && response.data) {
    //             this.userKeys = response.data.user_keys;
    //             this.userValues = response.data.user_values;
    //             this.userChartData.labels = response.data.user_keys;
    //             this.userChartData.datasets[1].data = response.data.user_values;
    //             this.userChartData.datasets[0].data = response.data.company_values;
    //             this.pieChartLabels = response.data.company_keys;
    //             this.pieChartDatasets[0].data = response.data.company_values;
    //             this.companyKeys = response.data.company_keys;
    //             this.companyValues = response.data.company_values;
    //             this.leadKeys = response.data.lead_keys;
    //             this.leadValues = response.data.lead_values;
    //             this.leadChartData.labels = response.data.lead_keys;
    //             this.leadChartData.datasets[0].data = response.data.lead_values;
    //             this.chart.forEach((e) => {
    //                 e?.chart?.update();
    //             })
    //         }
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
    // removeCompanyFilter(key: string) {
    //     this.tempCompanyFilter[key].value = null;
    //     this.onCompanySearch();
    // }
    // removeLeadFilter(key: string) {
    //     this.tempLeadFilter[key].value = null;
    //     this.onLeadSearch();
    // }
    // onUserSearch() {
    //     this.appliedUserFilter = JSON.parse(JSON.stringify(this.tempUserFilter));
    //     this.getGraphsData();
    // }
    // onCompanySearch() {
    //     this.appliedCompanyFilter = JSON.parse(JSON.stringify(this.tempCompanyFilter));
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

}
