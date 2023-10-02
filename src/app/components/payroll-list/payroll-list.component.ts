import { Component, OnInit, ElementRef, ViewChild } from '@angular/core';
import { lastValueFrom, Subscription } from 'rxjs';
import { ActivatedRoute } from '@angular/router';
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
import moment from 'moment';
import { Roles } from '@constants/constants';
import Swal from 'sweetalert2';

@Component({
    selector: 'app-payroll-list',
    templateUrl: './payroll-list.component.html',
    styleUrls: [
        '../../styles/dashboard.scss',
        '../../styles/predictive-search.scss',
        './payroll-list.component.scss',
    ],
})
export class PayrollListComponent implements OnInit {
    pageLimit: number = 10;
    fundedReportList: Array<any> = [];
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
    payrollOptions = [
        { id: 0, name: 'New Payroll' },
        { id: 1, name: 'Existing Payroll' },
    ];
    companyPaidStatusOptions = [
        { id: 0, name: 'paid' },
        { id: 1, name: 'unpaid' },
    ];
    agentPaidStatusOptions = [
        { id: 0, name: 'Paid' },
        { id: 1, name: 'Unpaid' },
        { id: 2, name: 'Lender Commission Paid' },
        { id: 3, name: 'Upfront Commission Paid' },
    ];
    confirmedOptions = [
        { id: 0, name: 'Yes' },
        { id: 1, name: 'No' },
    ];
    defaultOptions = [
        { id: 0, name: 'Yes' },
        { id: 1, name: 'No' },
    ];
    @ViewChild('datepicker') datepicker: any;
    @ViewChild('selectAll') selectAll!: ElementRef;

    tempFilter: { [key: string]: any } = {
        "Date": { value: '' },
        "Bussiness name": { value: '' },
        "Funding amount": { value: '' },
        "Payback amount": { value: '' },
        "Lender": { value: null },
        "New Payroll": { value: this.payrollOptions[0] },
        "Payroll": { value: null },
        "Agent User": { value: null },
        "Company Paid Status": { value: null },
        "Agent Paid Status": { value: null },
        "Is Confirmed": { value: null },
        "Is Default": { value: null },

    };
    appliedFilter: { [key: string]: any } = {
    }
    companyStatus: string = '';
    searchKeyword: string = '';
    usersList: Array<any> = [];
    usersListLimit: number = 10;
    totalUsersCount: number = 0;
    dateFormat: string = '';
    timeZone: string = '';
    canViewPayroll: boolean = false;
    predictiveSearchResults: Array<any> = [];
    @ViewChild('predictiveSearch', { static: false })
    predictiveSearch!: ElementRef;
    colorSubs!: Subscription;
    style!: { fill: string; };
    background!: { background: string; };
    color!: string;
    dashboardData: any = {};
    userRole: string = '';
    roles = Roles;
    canListLead: boolean = false;
    search = {
        order: 'DESC',
        sortby: 'created_at'
    }



    constructor(
        private commonService: CommonService,
        private apiService: ApiService,
        public formatter: NgbDateParserFormatter,
        private calendar: NgbCalendar,
        private route: ActivatedRoute,
        private authService: AuthService
    ) { }

    ngOnInit(): void {
        this.getUsersList();
        this.getUserDetails();
        this.getlendersList()
        this.canViewPayroll = this.authService.hasPermission('payroll-view');
        this.maxDate = this.calendar.getToday();
    }
    ngDoCheck(): void {

        this.getPaginationList();
        this.getDateColor();
    }
    // custom datepicker color
    getDateColor() {
        let monthNameClr = document.getElementsByClassName('ngb-dp-month-name');
        // let data3 = document.getElementsByClassName('btn btn-link ngb-dp-arrow-btn');
        let arrowColor = document.getElementsByClassName('ngb-dp-navigation-chevron');
        for (let i = 0; i < monthNameClr.length; i++) {
            monthNameClr[i].setAttribute('style', `color:${this.color}`)
            arrowColor[i].setAttribute('style', `border-color:${this.color}`)
        }
        let weekNameClr = document.getElementsByClassName('ngb-dp-weekday small');
        for (let i = 0; i < weekNameClr.length; i++) {
            weekNameClr[i].setAttribute('style', `color:${this.color}`)
        }



        const tds = document.getElementsByClassName('custom-day') as HTMLCollectionOf<HTMLElement>;
        for (let index = 0; index < tds.length; index++) {
            tds[index].style.setProperty('--custom', `${this.color}`);

        }
    }
    async getlendersList() {
        try {
            const res$ = this.apiService.getReq(
                API_PATH.PAYROLL_LIST_LENDER,
                '',
                ''
            );
            let response = await lastValueFrom(res$);
            this.commonService.showSpinner();

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
    getUserDetails(): void {
        try {
            let ud = this.authService.getUserDetails();
            if (ud) {
                this.userRole = ud.role
                this.dateFormat = ud.date_format;
                this.timeZone = ud.time_zone;
                this.getColorOnUpdate();
                this.style = { fill: ud?.color };
                this.color = ud?.color;
                // this.stroke={stroke:ud?.color};
                this.background = { background: ud?.color };

            }
        } catch (error: any) {
            this.commonService.showError(error.message);
        }
    }
    getDate(date: any) {
        return moment(date)
            .tz(this.timeZone)
            .format(`${this.dateFormat} hh:mm:ss A`);
    }
    getColorOnUpdate() {
        this.colorSubs = this.authService.getColor().subscribe((u) => {
            this.getUserDetails();
        });
    }
    /**
     * @description get users list eg company list if adminisrator is logged in
     */
    async getUsersList(): Promise<any> {
        try {
            this.commonService.showSpinner();

            let url = `?sort_by=${this.search.sortby}&dir=${this.search.order}&page_limit=${this.usersListLimit}&page=${this.userListPage}`;
            if (this.appliedFilter['Date']?.value) {
                url = `${url}&daterange_filter=${this.appliedFilter['Date']?.value}`;
            }
            if (this.appliedFilter['Bussiness name']?.value) {
                url = `${url}&business_name=${this.appliedFilter['Bussiness name']?.value}`;
            }
            // if (this.appliedFilter['Funding amount']?.value) {
            //     url = `${url}&funding_amount=${this.appliedFilter['Funding amount']?.value}`;
            // }
            // if (this.appliedFilter['Payback amount']?.value) {
            //     url = `${url}&payback_amount=${this.appliedFilter['Payback amount']?.value}`;
            // }
            if (this.appliedFilter['Lender']?.value && this.appliedFilter['Lender'].value.id) {
                url = `${url}&lender_id=${this.appliedFilter['Lender'].value.id}`;
            }
            if (this.appliedFilter['New Payroll']?.value && this.appliedFilter['New Payroll'].value.name) {
                url = `${url}&new_payroll=${this.appliedFilter['New Payroll'].value.name}`;
            }
            if (this.appliedFilter['Payroll']?.value && this.appliedFilter['Payroll'].value.name) {
                url = `${url}&payroll=${this.appliedFilter['Payroll']?.value.name}`;
            }
            if (this.appliedFilter['Agent User']?.value && this.appliedFilter['Agent User'].value.id) {
                url = `${url}&agent_user=${this.appliedFilter['Agent User'].value.id}`;
            }
            if (this.appliedFilter['Company Paid Status']?.value && this.appliedFilter['Company Paid Status'].value.name) {
                url = `${url}&company_paid_status=${this.appliedFilter['Company Paid Status'].value.name}`;
            }
            if (this.appliedFilter['Agent Paid Status']?.value && this.appliedFilter['Agent Paid Status'].value.name) {
                url = `${url}&agent_paid_status=${this.appliedFilter['Agent Paid Status'].value.name}`;
            }
            // if (this.appliedFilter['Is Confirmed']?.value && this.appliedFilter['Is Confirmed'].value.name) {
            //     url = `${url}&is_confirmed=${this.appliedFilter['Is Confirmed'].value.name}`;
            // }
            // if (this.appliedFilter['Is Default']?.value && this.appliedFilter['Is Default'].value.name) {
            //     url = `${url}&is_default=${this.appliedFilter['Is Default'].value.name}`;
            // }
            const res$ = this.apiService.getReq(
                API_PATH.PAYROLL_LIST + url,
                'payroll',
                'list'
            );
            let response = await lastValueFrom(res$);
            if (response && response.data) {
                this.hasMoreUsers = response.data.hasMorePages;
                this.totalUsersCount = response.data.total;
                this.usersList = response.data.data;
            } else {
                this.usersList = [];
                this.hasMoreUsers = false;
                this.userListPage = 1;
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

    /**
     * @description on Search click
     */
    onSearch() {
        this.page = 1;
        this.appliedFilter = JSON.parse(JSON.stringify(this.tempFilter));
        this.getUsersList();
    }

    /**
     * @description on limit change
     * @param value
     * @returns {void}
     * @author Shine Dezign Infonet Pvt. Ltd.
     */
    onUsersLimitChange(value: number): void {
        this.usersListLimit = value;
        this.userListPage = 1;
        this.getUsersList();
    }

    /**
     * @description on page change
     * @returns {void}
     * @param p
     */
    onUserPageChange(p: number): void {
        this.userListPage = p;
        this.getUsersList();
    }

    /**
     * @description delete user after confirmation
     * @param user
     * @author Shine Dezign Infonet Pvt. Ltd.
     * @returns { Promise<void> }
     */
    async deleteUser(user: any): Promise<void> {
        try {
            this.commonService.showSpinner();
            const res$ = this.apiService.postReq(
                API_PATH.DELETE_USER,
                { user_id: user.id },
                'user',
                'delete'
            );
            let response = await lastValueFrom(res$);
            if (response && response.data) {
                this.usersList = this.usersList.filter((e) => e.id != user.id);
                this.totalUsersCount = this.totalUsersCount - 1;
                this.commonService.showSuccess(response.message);
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
                this.userListPage = 1;

            }
        }
    }

    /**
     * @description on status change
     * @param status
     * @returns
     */
    onStatusChange(status: string) {
        if (status === this.companyStatus) {
            return;
        }
        this.companyStatus = status;
        this.getUsersList();
    }

    /**
     * @description reset company filters
     */
    resetCompanyList() {
        this.searchKeyword = '';
        this.selectedDate = '';
        this.fromDate = null;
        this.toDate = null;
        this.companyStatus = '';
        this.getUsersList();
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
    opencompanyPaidpopup(id: any) {
        Swal.fire({
            title: 'Are you sure?',
            text: 'Mark company status as Paid?',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Yes',
            confirmButtonColor: "#f0412e",
            cancelButtonText: 'Cancel'
        }).then((result) => {
            if (result.value) {
                this.companyPaidStatus(id);
            } else if (result.dismiss === Swal.DismissReason.cancel) {
                Swal.close();
            }
        })

    }
    async companyPaidStatus(id: any): Promise<void> {
        let url = `?id=${id}`;
        try {
            this.commonService.showSpinner();
            const res$ = this.apiService.getReq(API_PATH.UPDATE_COMPANY_STATUS + url, 'lead', 'pre-funding');
            let response = await lastValueFrom(res$);
            if (response && response.data) {
                this.commonService.showSuccess(response.message);
                this.getUsersList();
                //
            }
            this.commonService.hideSpinner();
        } catch (error: any) {
            this.commonService.hideSpinner();
            if (error.error && error.error.message) {
                this.commonService.showError(error.error.message);
            } else {
                this.commonService.showError(error.message);
            }
            // }
        }

    }
    getamount(lender_commission: any, upfront_commission: any) {
        let value = 0;
        if (upfront_commission) {
            value = Number(upfront_commission) * (Number(lender_commission) / 100);
            return '$' + value.toFixed(2)
        } else {
            return '';
        }



    }
    // getAgentPaidDate(date: any){
    //     console.log("bh", date);

    //     let v1 = date.split('-');
    //     console.log("vhg", v1);

    //     let v2 = v1[2].split(" ");
    //     if(v2[0] <= 15){
    //         let v3 = + v1[0] + '-' + v1[1] + '-' + '25';
    //         console.log("bjhbh", v3);
    //         // return "25TH"

    //      return moment(v3).tz(this.timeZone).format(`${this.dateFormat} hh:mm:ss A`);
    //     }else  if(v2[0] >= 16){
    //         return "10TH"
    //     } else{
    //         return " "
    //     }

    // }

    getAgentPaidDate(date: any) {
        let v1 = moment(date).tz(this.timeZone).format(`${this.dateFormat} hh:mm:ss A`);
        if (this.dateFormat == 'MMM DD, YYYY' || this.dateFormat == 'MMM DD, yyyy') {
            let v2 = v1.split(" ");
            let v3 = v2[1].split(',');

            if (Number(v3[0]) == 24 || Number(v3[0]) == 25 || Number(v3[0]) == 26) {
                let date25 = v2[0] + ' ' + '25,' + ' ' + v2[2] + ' ' + v2[3] + ' ' + v2[4];
                return date25
            } else if (Number(v3[0]) == 9 || Number(v3[0]) == 10 || Number(v3[0]) == 11) {
                let date25 = v2[0] + ' ' + '10,' + ' ' + v2[2] + ' ' + v2[3] + ' ' + v2[4];
                return date25
            } else {
                return ''
            }
        } if (this.dateFormat == 'DD/MM/YYYY' || this.dateFormat == 'DD/MM/YYYY') {
            let v2 = v1.split("/");

            if (Number(v2[0]) == 24 || Number(v2[0]) == 25 || Number(v2[0]) == 26) {
                let date25 = '25' + '/' + v2[1] + '/' + v2[2];
                return date25
            } else if (Number(v2[0]) == 9 || Number(v2[0]) == 10 || Number(v2[0]) == 11) {
                let date25 = '10' + '/' + v2[1] + '/' + v2[2];
                return date25
            } else {
                return ''
            }
        } if (this.dateFormat == 'DD.MM.YYYY' || this.dateFormat == 'DD.MM.yyyy') {
            let v2 = v1.split(".");

            if (Number(v2[0]) == 24 || Number(v2[0]) == 25 || Number(v2[0]) == 26) {
                let date25 = '25' + '.' + v2[1] + '.' + v2[2];
                return date25
            } else if (Number(v2[0]) == 9 || Number(v2[0]) == 10 || Number(v2[0]) == 11) {
                let date25 = '10' + '.' + v2[1] + '.' + v2[2];
                return date25
            } else {
                return ''
            }
        } if (this.dateFormat == 'YYYY/MM/DD' || this.dateFormat == 'yyyy/MM/DD') {
            let v2 = v1.split("/");
            let v3 = v2[2].split(" ");

            if (Number(v3[0]) == 24 || Number(v3[0]) == 25 || Number(v3[0]) == 26) {
                let date25 = v2[0] + '/' + v2[1] + '/' + '25' + ' ' + v3[1] + v3[2];
                return date25
            } else if (Number(v3[0]) == 9 || Number(v3[0]) == 10 || Number(v3[0]) == 11) {
                let date25 = v2[0] + '/' + v2[1] + '/' + '10' + ' ' + v3[1] + v3[2];
                return date25
            } else {
                return ''
            }
        } if (this.dateFormat == 'MM/DD/YYYY' || this.dateFormat == 'MM/DD/YYYY') {
            let v2 = v1.split("/");

            if (Number(v2[1]) == 24 || Number(v2[1]) == 25 || Number(v2[1]) == 26) {
                let date25 = v2[0] + '/' + '25' + '/' + v2[2];
                return date25
            } else if (Number(v2[1]) == 9 || Number(v2[1]) == 10 || Number(v2[1]) == 11) {
                let date25 = v2[0] + '/' + '10' + '/' + v2[2];
                return date25
            } else {
                return ''
            }
        } else {
            return ''
        }



        // let v1 = date.split('-');
        // console.log("vhg", v1);

        // let v2 = v1[2].split(" ");
        // if(v2[0] <= 15){
        //     let v3 = + v1[0] + '-' + v1[1] + '-' + '25';
        //     console.log("bjhbh", v3);
        // return "25TH"


        // }
        // else  if(v2[0] >= 16){
        //     return "10TH"
        // } else{
        //     return " "
        // }


    }
    sortBy(col: string) {
        if (!this.usersList.length) {
            return;
        }
        if (this.search.sortby === col) {
            if (this.search.order === 'ASC') {
                this.search.order = 'DESC'
            } else {
                this.search.order = 'ASC'
            }
        } else {
            this.search.order = 'DESC';
            this.search.sortby = col;
        }
        this.getUsersList();

    }
}

