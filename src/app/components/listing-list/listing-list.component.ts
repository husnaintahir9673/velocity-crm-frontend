import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { API_PATH } from '@constants/api-end-points';
import { Roles } from '@constants/constants';
import { NgbCalendar, NgbDate, NgbDateParserFormatter, NgbDateStruct} from '@ng-bootstrap/ng-bootstrap';
import { ApiService } from '@services/api.service';
import { AuthService } from '@services/auth.service';
import { CommonService } from '@services/common.service';
import moment from 'moment';
import { lastValueFrom, Subscription } from 'rxjs';

@Component({
    selector: 'app-listing-list',
    templateUrl: './listing-list.component.html',
    styleUrls: ['./listing-list.component.scss', '../../styles/dashboard.scss', '../../styles/predictive-search.scss']
})
export class ListingListComponent implements OnInit {
    hoveredDate: NgbDate | null = null;
    fromDate!: NgbDate | null;
    toDate!: NgbDate | null;
    selectedDate: string = '';
    maxDate!: NgbDateStruct;
    companyStatus: string = '';
    searchKeyword: string = '';
    searchKeywordDeleted: string = '';
    deleteStatus: string = '';
    CampaignList: Array<any> = [];
    // CampaignList: Array<any> = [];
    userListPage: number = 1;
    hasMoreUsers: boolean = false;
    usersListLimit: number = 10;
    totalUsersCount: number = 0;
    userId: string = '';
    emailTemplateId: string = '';
    assignedToUsers: any[] = [];
    leadCount: number = 0;
    dateFormat: string = '';
    timeZone: string = '';
    emailListLimit: number = 1000;
    emailListPage: number = 1;
    predictiveSearchId: string = '';
    emailTemplateList: Array<any> = []
    @ViewChild('datepicker') datepicker: any;
    predictiveSearchResults: Array<any> = [];
    @ViewChild('predictiveSearch', { static: false }) predictiveSearch!: ElementRef;
    @ViewChild('deleteuser') deleteuser!: ElementRef;
    canAddList: boolean = false;
    canViewList: boolean = true;
    canDeleteList: boolean = false;
    canEditList: boolean = false;
    activeTab: string = 'AllLists';
    DeletedList: Array<any> = [];
    deleteListLimit: number = 10;
    deleteListPage: number = 1;
    hasMoreDeletedUsers: boolean = false;
    totalDeleteCount: number = 0;
    @ViewChild("dripCampaignTrigger", { static: true }) dripCampaignTrigger: ElementRef | any;
    search = {
        order: 'DESC',
        sortby: 'created_at'
    }
    colorSubs!: Subscription;
    style!: { fill: string; };
    background!: { background: string; };
    color!: string;
    dashboardData: any = {};
    roles = Roles;
    userRole: string = '';
    canListLead: boolean = false;




    constructor(
        private commonService: CommonService,
        private apiService: ApiService,
        public formatter: NgbDateParserFormatter,
        private calendar: NgbCalendar,
        private authService: AuthService,
    ) { }

    ngOnInit(): void {
        // this.route.queryParams
        //     .subscribe(params => {
        //         this.searchKeyword = params['search'];
        //         if (this.searchKeyword) {
        //             this.getAllLists();
        //         } else {
        //             this.getAllLists();
        //         }
        //     }
        //     );
        this.getAllLists();
        this.getDeletedLists();
        this.getUserDetails();
        this.maxDate = this.calendar.getToday();
        this.canAddList = this.authService.hasPermission('list-add');
        this.canViewList = this.authService.hasPermission('list-view');
        this.canEditList = this.authService.hasPermission('list-update');
        this.canDeleteList = this.authService.hasPermission('list-delete');


    }
    ngDoCheck(): void {

        this.getPaginationList();
        this.getDateColor();
    }
    // custom datepicker color

    getDateColor() {
        let monthNameClr = document.getElementsByClassName('ngb-dp-month-name');
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
        return moment(date).tz(this.timeZone).format(`${this.dateFormat} hh:mm:ss A`)
    }

    //
    getColorOnUpdate() {
        this.colorSubs = this.authService.getColor().subscribe((u) => {
            this.getUserDetails();
        });
    }
    //
    allList() {
        this.activeTab = 'AllLists';
        this.getAllLists();
    }
    deletedList() {
        this.activeTab = 'RecentlyDelted';
        this.getDeletedLists();
    }

    sortBy(col: string) {
        if (!this.CampaignList.length) {
            return
        }
        if (this.search.sortby === col) {
            if (this.search.order === 'ASC') {
                this.search.order = 'DESC';
            } else {
                this.search.order = 'ASC';
            }
        } else {
            this.search.sortby = col;
            this.search.order = 'DESC';
        }

        if (this.activeTab == 'AllLists') {
            this.getAllLists();
        }
        if (this.activeTab == 'RecentlyDelted') {
            this.getDeletedLists();
        }



    }
    getEmailTemplateId(id: any) {
        this.emailTemplateId = id;
    }

    get userBaseRoute() {
        return this.authService.getUserRole().toLowerCase();
    }
    async getAllLists(): Promise<any> {
        try {
            let url = `?sort_by=${this.search.sortby}&dir=${this.search.order}&page_limit=${this.usersListLimit}&page=${this.userListPage}`;
            // if (this.searchKeyword) {
            //     url = url + `&search_keyword=${this.predictiveSearchId}`
            // }
            if (this.searchKeyword) {
                url = url + `&search_keyword=${this.searchKeyword}`
            }
            if (this.selectedDate) {
                url = url + `&daterange_filter=${this.selectedDate}`
            }
            if (this.companyStatus) {
                url = url + `&status=${this.companyStatus}`
            }
            this.commonService.showSpinner();
            const res$ = this.apiService.getReq(API_PATH.LIST_CAMPAIGN + url, 'list', 'lists');
            let response = await lastValueFrom(res$);
            if (response && response.data) {
                if (response.data.data) {
                    this.hasMoreUsers = response.data.hasMorePages;
                    this.totalUsersCount = response.data.total;
                    this.CampaignList = response.data.data;
                    this.CampaignList.forEach(object => { object.toggle = false });
                    for (let i = 0; i < this.CampaignList.length; i++) {
                        if (this.CampaignList[i].status == 'Active') {
                            this.CampaignList[i].toggle = true;
                        } else {
                            this.CampaignList[i].toggle = false;
                        }
                    }
                } else {
                    this.CampaignList = [];
                }

            } else {
                this.CampaignList = [];
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

    async getDeletedLists(): Promise<any> {
        try {
            let url = `?sort_by=${this.search.sortby}&dir=${this.search.order}&page_limit=${this.deleteListLimit}&page=${this.deleteListPage}`;
            // if (this.searchKeyword) {
            //     url = url + `&search_keyword=${this.predictiveSearchId}`
            // }
            // if(this.activeTab == 'AllLists'){
            //     url = url + `&type=${'all'}`
            // }
            // if(this.activeTab == 'RecentlyDelted'){
            //     url = url + `&type=${'deleted'}`
            // }
            if (this.searchKeywordDeleted) {
                url = url + `&search_keyword=${this.searchKeywordDeleted}`
            }
            if (this.selectedDate) {
                url = url + `&daterange_filter=${this.selectedDate}`
            }
            if (this.deleteStatus) {
                url = url + `&status=${this.deleteStatus}`
            }
            this.commonService.showSpinner();
            const res$ = this.apiService.getReq(API_PATH.DELETED_LIST + url, 'list', 'lists');
            let response = await lastValueFrom(res$);
            if (response && response.data) {
                if (response.data.data) {
                    this.hasMoreDeletedUsers = response.data.hasMorePages;
                    this.totalDeleteCount = response.data.total;
                    this.DeletedList = response.data.data;
                } else {
                    this.DeletedList = [];
                }

            } else {
                this.DeletedList = [];
                this.hasMoreDeletedUsers = false;
                this.deleteListPage = 1;
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
        this.getAllLists();
    }

    /**
  * @description on page change
  * @returns {void}
  * @param p 
  */
    onUserPageChange(p: number): void {
        this.userListPage = p;
        this.getAllLists();
    }

    async deleteDripcampaign(user: any) {
        try {
            let url = `?id=${user.id}&name=${user.name}`;
            this.commonService.showSpinner();
            const res$ = this.apiService.getReq(API_PATH.LIST_DELETE + url, 'list', 'delete');
            let response = await lastValueFrom(res$);
            if (response && response.status_code == "200") {
                this.commonService.showSuccess(response.message);
                this.CampaignList = this.CampaignList.filter(e => e.id != user.id);
                this.getDeletedLists();
                this.getAllLists();
            } else {
                this.commonService.showError(response.message);
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
    async getLeadCount(id: any) {
        try {
            this.commonService.showSpinner();
            const res$ = this.apiService.postReq(API_PATH.LEAD_COUNT, { user_id: id }, 'lead', 'view');
            let response = await lastValueFrom(res$);
            if (response && response.data) {
                this.leadCount = response.data.count

            } else {
                this.commonService.showError(response.message);
            }
            this.commonService.hideSpinner();
        } catch (error) {
            this.commonService.hideSpinner();
            this.commonService.showErrorMessage(error);
        }
    }
    // ngAfterViewInit() {
    //     fromEvent(this.predictiveSearch.nativeElement, 'keyup').pipe(
    //         tap(() => {
    //             if (!this.predictiveSearch.nativeElement.value) {
    //                 this.predictiveSearchResults = [];
    //             }
    //         }),
    //         filter(() => this.predictiveSearch.nativeElement.value && this.predictiveSearch.nativeElement.value.length > 0),
    //         debounceTime(200),
    //         distinctUntilChanged(),
    //         switchMap(() => this.apiService.postReq(API_PATH.PREDICTIVE_SEARCH, { search: this.predictiveSearch.nativeElement.value, records_per_search: 500, type: 'user' }, 'user', 'list'))
    //     ).subscribe((res) => {
    //         if (res && res.status_code == "200") {
    //             this.predictiveSearchResults = res.data;

    //         } else {
    //             this.predictiveSearchResults = [];
    //         }
    //     })
    // }

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
                if (this.activeTab == 'AllLists') {
                    this.userListPage = 1;
                    this.getAllLists();
                }
                if (this.activeTab == 'RecentlyDelted') {
                    this.deleteListPage = 1;
                    this.getDeletedLists();
                }

            }
        }
    }
    // onDeletedDateSelection(date: NgbDate) {
    //     if (!this.fromDate && !this.toDate) {
    //         this.fromDate = date;
    //     } else if (this.fromDate && !this.toDate && date && (date.equals(this.fromDate) || date.after(this.fromDate))) {
    //         this.toDate = date;
    //         this.datepicker.toggle();
    //     } else {
    //         this.toDate = null;
    //         this.fromDate = date;
    //     }
    //     let sDate = '';
    //     if (this.fromDate) {
    //         sDate = this.formatter.format(this.fromDate);
    //         if (this.toDate) {
    //             sDate = sDate + ' / ' + this.formatter.format(this.toDate);
    //             this.selectedDeletedDate = sDate;
    //             this.deleteListPage = 1;
    //             this.getDeletedLists();
    //         }
    //     }
    // }



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
        this.getAllLists();
    }
    ondeleteStatusChange(status: string) {
        if (status === this.deleteStatus) {
            return;
        }
        this.deleteStatus = status;
        this.getDeletedLists();
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
        this.getAllLists();
    }
    resetDeleteList() {
        this.searchKeywordDeleted = '';
        this.selectedDate = '';
        this.fromDate = null;
        this.toDate = null;
        this.deleteStatus = '';
        this.getDeletedLists();
    }

    onStatusToggleChange(e: any, input: any, user: any, i: number) {
        this.commonService.showSpinner();
        let status = "1";
        this.CampaignList[i].toggle = true;
        if (!e.target.checked) {
            status = "0";
            this.CampaignList[i].toggle = false;
        }
        this.updateStatus(status, user, input, i);
    }

    async updateStatus(status: string, user: any, input: any, i: number) {
        try {
            const res$ = this.apiService.postReq(API_PATH.LIST_CAMPAIGN_UPDATE_STATUS, { name: user.name, id: user.id, status: status }, 'campaign', 'update');
            const response = await lastValueFrom(res$);
            if (response && response.status_code) {
                this.commonService.showSuccess(response.message);
            } else {
                this.commonService.showError(response.message)
            }
            this.commonService.hideSpinner();
        } catch (error) {
            if (status === "1") {
                input.checked = false;
                this.CampaignList[i].toggle = true;

            } else {
                input.checked = true;
                this.CampaignList[i].toggle = false;

            }
            this.commonService.hideSpinner();
            this.commonService.showErrorMessage(error);
        }

    }
    onPageChange(p: number): void {
        this.userListPage = p;
        this.getAllLists();
    }

    onDeletedPageChange(p: number): void {
        this.deleteListPage = p;
        this.getDeletedLists();
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
}
