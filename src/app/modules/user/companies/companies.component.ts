import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { API_PATH } from '@constants/api-end-points';
import { Roles } from '@constants/constants';
import { NgbCalendar, NgbDate, NgbDateParserFormatter, NgbDateStruct } from '@ng-bootstrap/ng-bootstrap';
import { ApiService } from '@services/api.service';
import { AuthService } from '@services/auth.service';
import { CommonService } from '@services/common.service';
import moment from 'moment';
import { debounceTime, distinctUntilChanged, filter, fromEvent, lastValueFrom, Subscription, switchMap, tap } from 'rxjs';

@Component({
    selector: 'app-companies',
    templateUrl: './companies.component.html',
    styleUrls: ['../../../styles/dashboard.scss', '../../../styles/predictive-search.scss', './companies.component.scss']
})
export class CompaniesComponent implements OnInit {

    hoveredDate: NgbDate | null = null;
    fromDate!: NgbDate | null;
    toDate!: NgbDate | null;
    selectedDate: string = '';
    maxDate!: NgbDateStruct;
    companyStatus: string = '';
    searchKeyword: string = '';
    usersList: Array<any> = [];
    userListPage: number = 1;
    hasMoreUsers: boolean = false;
    usersListLimit: number = 10;
    totalUsersCount: number = 0;
    dateFormat: string = '';
    timeZone: string = '';
    @ViewChild('datepicker') datepicker: any;
    predictiveSearchResults: Array<any> = [];
    @ViewChild('predictiveSearch', { static: false }) predictiveSearch!: ElementRef;
    predictiveSearchId: string = '';
    style!: { fill: string; };
    background!: { background: string; };
    colorSubs!: Subscription;
    color!: string;
    dashboardData: any = {};
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
        private authService: AuthService,
        private router: Router
    ) { }

    ngOnInit(): void {
        this.route.queryParams
            .subscribe(params => {
                this.searchKeyword = params['search'];
                this.predictiveSearchId = params['searchId'];
                if (this.searchKeyword) {
                    this.getUsersList();
                } else {
                    this.getUsersList();
                }
            }
            );
        this.getUserDetails();
        //     let searchvalue = this.route.snapshot.queryParams;
        //     if(searchvalue){
        //         this.searchKeyword = searchvalue['search']
        //   }
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
    getUserDetails(): void {
        try {
            let ud = this.authService.getUserDetails();
            if (ud) {
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
    getColorOnUpdate() {
        this.colorSubs = this.authService.getColor().subscribe((u) => {
            this.getUserDetails();
        });
    }
    getDate(date: any) {
        return moment(date).tz(this.timeZone).format(`${this.dateFormat} hh:mm:ss A`)
    }

    insertSpaces(string: string) {
        let string1 = string.replace(/([a-z])([A-Z])/g, '$1 $2');
        return string1;
    }
    /**
    * @description get users list eg company list if adminisrator is logged in
    */
    async getUsersList(): Promise<any> {
        try {
            let url = `?sort_by=${this.search.sortby}&dir=${this.search.order}&page_limit=${this.usersListLimit}&page=${this.userListPage}&role=${Roles.COMPANY}`;
            if (this.searchKeyword && this.predictiveSearchId) {
                url = url + `&search_keyword=${this.predictiveSearchId}`
            }
            if (this.searchKeyword && !this.predictiveSearchId) {
                url = url + `&search_keyword=${this.searchKeyword}`
            }
            if (this.selectedDate) {
                url = url + `&daterange_filter=${this.selectedDate}`
            }
            if (this.companyStatus) {
                url = url + `&status=${this.companyStatus}`
            }
            this.commonService.showSpinner();
            const res$ = this.apiService.getReq(API_PATH.ADMIN_LISTS + url, 'company', 'list');
            let response = await lastValueFrom(res$);
            if (response && response.data) {
                this.predictiveSearchId = '';
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
    async resendemail(email: any) {
        console.log("email", email);
        try {
            this.commonService.showSpinner();
            const res$ = this.apiService.postReq(API_PATH.FORGOT_PASSWORD, { email: email }, '', '');
            let response = await lastValueFrom(res$);
            if (response && response.data) {
                this.commonService.showSuccess(response.message);
                // this.router.navigate(['/admin/company']);
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
    async deleteCompany(user: any): Promise<void> {
        try {
            this.commonService.showSpinner();
            const res$ = this.apiService.postReq(API_PATH.DELETE_USER, { user_id: user.id, company_delete: 1, is_permanent: 1 }, 'company', 'delete');
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

    ngAfterViewInit() {
        fromEvent(this.predictiveSearch.nativeElement, 'keyup').pipe(
            tap(() => {
                if (!this.predictiveSearch.nativeElement.value) {
                    this.predictiveSearchResults = [];
                }
            }),
            filter(() => this.predictiveSearch.nativeElement.value && this.predictiveSearch.nativeElement.value.length > 0),
            debounceTime(200),
            distinctUntilChanged(),
            switchMap(() => this.apiService.postReq(API_PATH.PREDICTIVE_SEARCH, { search: this.predictiveSearch.nativeElement.value, records_per_search: 500, type: 'company' }, 'company', 'list'))
        ).subscribe((res) => {
            if (res && res.status_code == "200") {
                this.predictiveSearchResults = res.data;

            } else {
                this.predictiveSearchResults = [];
            }
        })
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
                this.getUsersList();
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
        this.predictiveSearchId = '';
        this.getUsersList();
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
