import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { API_PATH } from '@constants/api-end-points';
import { Roles } from '@constants/constants';
import { NgbCalendar, NgbDate, NgbDateParserFormatter, NgbDateStruct } from '@ng-bootstrap/ng-bootstrap';
import { ApiService } from '@services/api.service';
import { AuthService } from '@services/auth.service';
import { CommonService } from '@services/common.service';
import moment from 'moment';
import { debounceTime, distinctUntilChanged, filter, fromEvent, lastValueFrom, Subscription, switchMap, tap } from 'rxjs';

@Component({
    selector: 'app-syndicates-list',
    templateUrl: './syndicates-list.component.html',
    styleUrls: ['../../../styles/dashboard.scss', './syndicates-list.component.scss', '../../../styles/predictive-search.scss']
})
export class SyndicatesListComponent implements OnInit {
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
    canViewSyndicate: boolean = false;
    canEditSyndicate: boolean = false;
    canCreateSyndicate: boolean = false;
    canDeleteSyndicate: boolean = false;
    dateFormat: string = '';
    timeZone: string = '';
    predictiveSearchId: string = '';
    color: string = '';
    canListLead: boolean = false;
    @ViewChild('datepicker') datepicker: any;
    predictiveSearchResults: Array<any> = [];
    @ViewChild('predictiveSearch', { static: false }) predictiveSearch!: ElementRef;
    colorSubs!: Subscription;
    style!: { fill: string; };
    background!: { background: string; };
    dashboardData: any = {};
    roles = Roles;
    userRole: string = '';
    tempFilter: { [key: string]: any } = {
        "Search": { value: "" },
    }

    appliedFilter: { [key: string]: any } = {
    }
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
        this.canListLead = this.authService.hasPermission('lead-list');

        this.maxDate = this.calendar.getToday();
        this.route.queryParams
            .subscribe(params => {
                // this.searchKeyword = params['search'];
                this.tempFilter['Search'].value = params['search'];
                if (this.tempFilter['Search'].value) {
                    this.getUsersList();
                } else {
                    this.getUsersList();
                }
            }
            );
        this.getUserDetails();
        this.canViewSyndicate = this.authService.hasPermission('syndicate-view');
        this.canEditSyndicate = this.authService.hasPermission('syndicate-update');
        this.canCreateSyndicate = this.authService.hasPermission('syndicate-add');
        this.canDeleteSyndicate = this.authService.hasPermission('syndicate-delete');
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
    onStatusToggleChange(e: any, input: any, id: string, i: number) {
        this.commonService.showSpinner();
        let status = "1";
        this.usersList[i].toggle = true
        if (!e.target.checked) {
            this.usersList[i].toggle = false
            status = "0";
        }
        this.updateStatus(status, id, input, i);
    }

    onSearch() {
        this.userListPage = 1;
        this.appliedFilter = JSON.parse(JSON.stringify(this.tempFilter));
        this.getUsersList();
    }
    /**
    * @description get users list eg company list if adminisrator is logged in
    */
    async getUsersList(): Promise<any> {
        try {
            let url = `?sort_by=${this.search.sortby}&dir=${this.search.order}&page_limit=${this.usersListLimit}&page=${this.userListPage}`;
            if (this.appliedFilter['Search']?.value && this.predictiveSearchId) {
                url = `${url}&search_keyword=${this.predictiveSearchId}`;
            }
            if (this.appliedFilter['Search']?.value && !this.predictiveSearchId) {
                url = `${url}&search_keyword=${this.appliedFilter['Search']?.value}`;
            }
            if (this.selectedDate) {
                url = url + `&daterange_filter=${this.selectedDate}`
            }
            if (this.companyStatus) {
                url = url + `&status=${this.companyStatus}`
            }
            this.commonService.showSpinner();
            const res$ = this.apiService.getReq(API_PATH.SYNDICATES_LIST + url, 'syndicate', 'list');
            let response = await lastValueFrom(res$);
            if (response && response.data) {
                this.hasMoreUsers = response.data.hasMorePages;
                this.totalUsersCount = response.data.total;
                this.usersList = response.data.data;
                this.predictiveSearchId = '';
                this.usersList.forEach(object => {
                    object.toggle = false
                });
                for (let i = 0; i < this.usersList.length; i++) {
                    if (this.usersList[i].status === 'Active') {
                        this.usersList[i].toggle = true;
                    } else {
                        this.usersList[i].toggle = false;
                    }
                }
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
    getUserDetails(): void {
        try {
            let ud = this.authService.getUserDetails();
            if (ud) {
                this.userRole = ud.role
                this.dateFormat = ud.date_format;
                this.timeZone = ud.time_zone;
                this.getColorOnUpdate();
                this.style = { fill: ud?.color };
                this.color = ud?.color
                // this.color=ud?.color;
                // this.stroke={stroke:ud?.color};
                this.background = { background: ud?.color };

            }
        } catch (error: any) {
            this.commonService.showError(error.message);
        }
    }
    get userBaseRoute() {
        return this.authService.getUserRole().toLowerCase();
    }
    getDate(date: any) {
        return moment(date).tz(this.timeZone).format(`${this.dateFormat} hh:mm:ss A`)
    }

    getColorOnUpdate() {
        this.colorSubs = this.authService.getColor().subscribe((u) => {
            this.getUserDetails();
        });
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
                this.userListPage = 1;
                this.getUsersList();
            }
        }
    }
    async deleteSyndicate(id: any): Promise<void> {
        try {
            this.commonService.showSpinner();
            const res$ = this.apiService.postReq(API_PATH.SYNDICATE_DELETE, { syndicator_id: id }, 'syndicate', 'delete');
            let response = await lastValueFrom(res$);
            if (response && response.data) {
                this.commonService.showSuccess(response.message);
                this.usersList = this.usersList.filter(el => !id.includes(el.id));
                this.totalUsersCount = this.totalUsersCount - 1;
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
            switchMap(() => this.apiService.postReq(API_PATH.PREDICTIVE_SEARCH, { search: this.predictiveSearch.nativeElement.value, records_per_search: 500, type: 'syndicate' }, 'syndicate', 'list'))
        ).subscribe((res) => {
            if (res && res.status_code == "200") {
                this.predictiveSearchResults = res.data;

            } else {
                this.predictiveSearchResults = [];
            }
        })
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
        this.tempFilter['Search'].value = null;
        this.selectedDate = '';
        this.fromDate = null;
        this.toDate = null;
        this.companyStatus = '';
        this.appliedFilter = {}
        this.getUsersList();
    }

    

    async updateStatus(status: string, syndicator_id: string, input: any, i: number) {
        try {
            const res$ = this.apiService.postReq(API_PATH.SYNDICATE_UPDATE, { syndicator_id: syndicator_id, status: status }, 'syndicate', 'update-status');
            const response = await lastValueFrom(res$);
            if (response && response.status_code) {
                this.commonService.showSuccess(response.message);
            } else {
                this.commonService.showError(response.message)
            }
            this.commonService.hideSpinner();
        } catch (error) {
            if (status === "1") {
                this.usersList[i].toggle = false
                input.checked = false;
            } else {
                this.usersList[i].toggle = true
                input.checked = true;
            }
            this.commonService.hideSpinner();
            this.commonService.showErrorMessage(error);
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

    sortBy(col: string) {
        if (!this.usersList.length) {
            return
        }
        if (this.search.sortby === col) {
            if (this.search.order === 'ASC') {
                this.search.order = 'DESC';
            } else {
                this.search.order = 'ASC'
            }
        } else {
            this.search.order = 'DESC'
            this.search.sortby = col
        }
        this.getUsersList();
    }
}
