import { Component, OnInit, QueryList, ViewChildren } from '@angular/core';
import { API_PATH } from '@constants/api-end-points';
import * as Constants from '@constants/constants';
import { ApiService } from '@services/api.service';
import { AuthService } from '@services/auth.service';
import { CommonService } from '@services/common.service';
import { ChartConfiguration, ChartOptions } from 'chart.js';
import { BaseChartDirective } from 'ng2-charts';
import { lastValueFrom, Subscription } from 'rxjs';

@Component({
    selector: 'app-reports',
    templateUrl: './reports.component.html',
    styleUrls: ['./reports.component.scss', '../../styles/dashboard.scss',]
})
export class ReportsComponent implements OnInit {
    roles = Constants.Roles;
    userRole: string = '';
    canViewLoginLogs: boolean = false;
    canViewUnderwriter: boolean = false;
    canViewLeadSource: boolean = false;
    canViewEmailLogs: boolean = false;
    canViewLenderSubmission: boolean = false;
    canViewOfferReport: boolean = false;
    canViewFundingReport: boolean = false;
    canViewFundedReport: boolean = false;
    canViewPreFundingReport: boolean = false;
    canViewDailyLeadProgressReport: boolean = false;
    canViewLenderReport: boolean = false;
    canViewUpdatesLogsReport: boolean = false;
    canViewIsoPaymentReport: boolean = false;
    canViewPaymentHistoryReport: boolean = false;
    canViewCallLogsReport: boolean = false;
    canViewSmsMarketingReport: boolean = false;
    canViewLeadSubmissionReport: boolean = false;
    canViewPullThroughRatioReport: boolean = false;
    canViewSourcePayrollReport: boolean = false;
    canViewSmsScheduleReport: boolean = false;
    canViewProfitLossReport: boolean = false;
    canViewAnalyticsReport: boolean = false;
    canViewLenderOweReport: boolean = false;
    canUpdateReportDescription: boolean = false
    reportDescription: any = {};
    userKeys: Array<any> = [];
    userValues: Array<any> = [];
    companyKeys: Array<any> = [];
    companyValues: Array<any> = [];
    leadKeys: Array<any> = [];
    leadValues: Array<any> = [];
    canViewCompanyCount: boolean = false;
    canViewUserCount: boolean = false;
    canViewLeadCount: boolean = false;

    tempUserFilter: { [key: string]: any } = {
        "Date Range": { value: null },
    }
    tempCompanyFilter: { [key: string]: any } = {
        "Date Range": { value: null },
    }
    tempLeadFilter: { [key: string]: any } = {
        "Date Range": { value: null },
    }
    userDateOptions = [
        { id: 'last_week', name: 'Last Week' },
        { id: 'last_month', name: 'Last Month' },
        { id: 'last_six_months', name: 'Last Six Months' },
        { id: 'last_year', name: ' Last Year' },
    ]
    companyDateOptions = [
        { id: 'last_week', name: 'Last Week' },
        { id: 'last_month', name: 'Last Month' },
        { id: 'last_six_months', name: 'Last Six Months' },
        { id: 'last_year', name: ' Last Year' },
    ]

    leadDateOptions = [
        { id: 'last_week', name: 'Last Week' },
        { id: 'last_month', name: 'Last Month' },
        { id: 'last_six_months', name: 'Last Six Months' },
        { id: 'last_year', name: ' Last Year' },
    ]

    appliedUserFilter: { [key: string]: any } = {
    }
    appliedCompanyFilter: { [key: string]: any } = {
    }
    appliedLeadFilter: { [key: string]: any } = {
    }
    @ViewChildren(BaseChartDirective)
    public chart!: QueryList<BaseChartDirective>;
    public userChartData: ChartConfiguration<'line'>['data'] = {
        labels: this.userKeys,
        datasets: []
    };
    public userChartOptions: ChartOptions<'line'> = {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
            'y-axis-0':
            {
                ticks: {
                    stepSize: 1,
                },
            }
        }

    };
    public userChartLegend = true;
    public pieChartOptions: ChartOptions<'pie'> = {
        responsive: true,
    };
    public pieChartLabels = [];
    style!: { fill: string; };
    background!: { background: string; };
    colorSubs!: Subscription;
    dashboardData: any = {};
    color!: string;


;
    public pieChartDatasets = [{
        data: this.companyValues,
    }];
    public pieChartLegend = false;
    public pieChartPlugins = [];
    public leadChartLegend = true;

    public leadChartData: ChartConfiguration<'pie'>['data'] = {
        labels: this.leadKeys,
        datasets: [
            {
                data: this.leadValues,
                label: '',
             backgroundColor: [ '#547BDB', '#7C8F2F','#1DC9AC', '#DA7625', '#B1525A', '#7CCDEF', '#5254A6', '#272A37', "#C96257", "#107C41", '#BBDEFB', "#EAE2B7", "#ef476f"],
            hoverBackgroundColor:  [ '#547BDB', '#7C8F2F','#1DC9AC', '#DA7625', '#B1525A', '#7CCDEF', '#5254A6', '#272A37', "#C96257", "#107C41", '#BBDEFB', "#EAE2B7", "#ef476f"],
            hoverBorderColor:  [ '#547BDB', '#7C8F2F','#1DC9AC', '#DA7625', '#B1525A', '#7CCDEF', '#5254A6', '#272A37', "#C96257", "#107C41", '#BBDEFB', "#EAE2B7", "#ef476f"],
            },
        ]
    };

    public leadChartOptions: ChartConfiguration<'pie'>['options'] = {
        responsive: true,
        maintainAspectRatio: false
    };
    companyUserdataSets: Array<any> = [];
    canListLead: boolean = false;


    constructor(private authService: AuthService,
        private apiService: ApiService,
        private commonService: CommonService) { }
    ngOnInit(): void {
        this.canListLead = this.authService.hasPermission('lead-list');

        this.getGraphsData();
        this.getUserDetails();
        this.canViewLoginLogs = this.authService.hasPermission('login-report');
        this.canViewUnderwriter = this.authService.hasPermission('underwriter-report');
        this.canViewLeadSource = this.authService.hasPermission('by-lead-source');
        this.canViewEmailLogs = this.authService.hasPermission('email-logs');
        this.canViewLenderSubmission = this.authService.hasPermission('lender-submission-report');
        this.canViewOfferReport = this.authService.hasPermission('offers-report');
        this.canViewFundingReport = this.authService.hasPermission('funding-report');
        this.canViewFundedReport = this.authService.hasPermission('funded-report');
        this.canViewPreFundingReport = this.authService.hasPermission('pre-funding-report');
        this.canViewDailyLeadProgressReport = this.authService.hasPermission('daily-lead-progress-report');
        this.canViewLenderReport = this.authService.hasPermission('lender-report');
        this.canViewUpdatesLogsReport = this.authService.hasPermission('updates-log');
        this.canViewIsoPaymentReport = this.authService.hasPermission('iso-payment-report');
        this.canViewPaymentHistoryReport = this.authService.hasPermission('lead-payments');
        this.canViewCallLogsReport = this.authService.hasPermission('call-log-report');
        this.canViewSmsMarketingReport = this.authService.hasPermission('sms-marketing-report');
        this.canViewLeadSubmissionReport = this.authService.hasPermission('submission-report');
        this.canViewPullThroughRatioReport = this.authService.hasPermission('pull-through-ratio-report');
        this.canViewSourcePayrollReport = this.authService.hasPermission('source-payroll');
        this.canViewSmsScheduleReport = this.authService.hasPermission('sms-schedule-report');
        this.canViewProfitLossReport = this.authService.hasPermission('profit-loss-report');
        this.canViewAnalyticsReport = this.authService.hasPermission('analytics-reports');
        this.canViewLenderOweReport = this.authService.hasPermission('lender-owe-report');
        this.canUpdateReportDescription = this.authService.hasPermission('report-decription-update');
        this.canViewUserCount = this.authService.hasPermission('users-count');
        this.canViewLeadCount = this.authService.hasPermission('leads-count');
        this.canViewCompanyCount = this.authService.hasPermission('company-count');
    }
    get userBaseRoute() {
        return this.authService.getUserRole().toLowerCase();
    }
    async getGraphsData(): Promise<any> {
        try {
            let url = '?';
            if(this.canViewCompanyCount && this.canViewUserCount){
                if (this.appliedUserFilter['Date Range']?.value && this.appliedUserFilter['Date Range'].value.id) {
                    url = `${url}&user_daterange_filter=${this.appliedUserFilter['Date Range']?.value.id}&company_daterange_filter=${this.appliedUserFilter['Date Range']?.value.id}`;
                }
            }
            if(!this.canViewCompanyCount && this.canViewUserCount){
                if (this.appliedUserFilter['Date Range']?.value && this.appliedUserFilter['Date Range'].value.id) {
                    url = `${url}&user_daterange_filter=${this.appliedUserFilter['Date Range']?.value.id}`;
                }
            }
          
            // if (this.appliedCompanyFilter['Date Range']?.value && this.appliedCompanyFilter['Date Range'].value.id) {
            //     url = `${url}&company_daterange_filter=${this.appliedCompanyFilter['Date Range']?.value.id}`;
            // }
            if (this.appliedLeadFilter['Date Range']?.value && this.appliedLeadFilter['Date Range'].value.id) {
                url = `${url}&lead_daterange_filter=${this.appliedLeadFilter['Date Range']?.value.id}`;
            }

            this.commonService.showSpinner();
            const res$ = this.apiService.getReq(API_PATH.GRAPH_DASHBOARD + url, '', '');
            let response = await lastValueFrom(res$);
            if (response && response.data) {
                this.userKeys = response.data.user_keys;
                this.userValues = response.data.user_values;
                this.userChartData.labels = response.data.user_keys;
                if(this.canViewCompanyCount && this.canViewUserCount){
                    this.userChartData.datasets =  [
                        {
                            data: response.data.company_values,
                            label: 'Companies',
                            fill: false,
                            tension: 0.7,
                            borderColor: '#000',
                            backgroundColor: 'transparent',
                            pointBackgroundColor: '#f0412e',
                            pointHoverBackgroundColor: '#f0412e',
                            pointHoverBorderColor: '#f0412e',
                        },
                        {
                            data: this.userValues,
                            label: 'Users',
                            fill: false,
                            tension: 0.5,
                            borderColor: '#f0412e',
                            backgroundColor: 'transparent',
                            pointBackgroundColor: '#f0412e',
                            pointHoverBackgroundColor: '#f0412e',
                            pointHoverBorderColor: '#f0412e',
                        },
                    ]   
                } if(this.canViewUserCount && !this.canViewCompanyCount){
                    this.userChartData.datasets =  [
                        {
                            data: response.data.user_values,
                            label: 'Users',
                            fill: false,
                            tension: 0.5,
                            borderColor: '#f0412e',
                            backgroundColor: 'transparent',
                            pointBackgroundColor: '#f0412e',
                            pointHoverBackgroundColor: '#f0412e',
                            pointHoverBorderColor: '#f0412e',
                        },
                    ]   
                }
                // this.userChartData.datasets[1].data = response.data.user_values;
                // this.userChartData.datasets[0].data = response.data.company_values;
                this.pieChartLabels = response.data.company_keys;
                this.pieChartDatasets[0].data = response.data.company_values;
                this.companyKeys = response.data.company_keys;
                this.companyValues = response.data.company_values;
                this.leadKeys = response.data.lead_keys;
                this.leadValues = response.data.lead_values;
                this.leadChartData.labels = response.data.lead_keys;
                this.leadChartData.datasets[0].data = response.data.lead_values;
                this.chart.forEach((e) => {
                    e?.chart?.update();
                })
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
    removeUserFilter(key: string) {
        this.tempUserFilter[key].value = null;
        this.onUserSearch();
    }
    removeCompanyFilter(key: string) {
        this.tempCompanyFilter[key].value = null;
        this.onCompanySearch();
    }
    removeLeadFilter(key: string) {
        this.tempLeadFilter[key].value = null;
        this.onLeadSearch();
    }
    onUserSearch() {
        this.appliedUserFilter = JSON.parse(JSON.stringify(this.tempUserFilter));
        this.getGraphsData();
    }
    onCompanySearch() {
        this.appliedCompanyFilter = JSON.parse(JSON.stringify(this.tempCompanyFilter));
        this.getGraphsData();
    }
    onLeadSearch() {
        this.appliedLeadFilter = JSON.parse(JSON.stringify(this.tempLeadFilter));
        this.getGraphsData();
    }

    getUserDetails() {
        let ud = this.authService.getUserDetails();
        if (ud) {
            this.userRole = ud.role
            this.reportDescription = ud.reports_decription;
            this.getColorOnUpdate();
            this.style={fill:ud?.color};
             this.color=ud?.color;
                // this.stroke={stroke:ud?.color};
                this.background={background:ud?.color};

        }
    }
    getColorOnUpdate() {
        this.colorSubs = this.authService.getColor().subscribe((u) => {
          this.getUserDetails();
        });
      }

}
