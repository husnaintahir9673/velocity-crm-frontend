import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { API_PATH } from '@constants/api-end-points';
import * as Constants from '@constants/constants';
import { NgbCalendar, NgbDate, NgbDateParserFormatter, NgbDateStruct } from '@ng-bootstrap/ng-bootstrap';
import { ApiService } from '@services/api.service';
import { AuthService } from '@services/auth.service';
import { CommonService } from '@services/common.service';
import moment from 'moment';
import { lastValueFrom } from 'rxjs';
import swal from 'sweetalert2';

@Component({
    selector: 'app-leadas-list',
    templateUrl: './leads-list.component.html',
    styleUrls: ['../../../styles/dashboard.scss']
})
export class LeadsListComponent implements OnInit {
    roles = Constants.Roles;
    userRole: string = '';
    dashboardData: any = {};
    advanceSearchToggle: boolean = false;
    recordsPerPage: number = 10;
    leadsList: Array<any> = [];
    totalRecords: number = 0;
    page: number = 1;
    searchKeyword: string = '';
    //daterangepicker
    hoveredDate: NgbDate | null = null;
    fromDate!: NgbDate | null;
    toDate!: NgbDate | null;
    selectedDate: any = '';
    maxDate!: NgbDateStruct;
    campaignList: Array<any> = [];
    leadStatusList: Array<any> = [];
    leadSourceList: Array<any> = [];
    managersList: Array<any> = [];
    usersList: Array<any> = [];
    searchByLeadTag: string = '';
    searchByStatus: any | null = null;
    searchByState: any = '';
    searchByName: any = '';
    searchByPhone: any = '';
    searchByEmail: any = '';
    searchByExclusivelead: any | null = null;
    searchById: any = '';
    searchByCompanyName: any = '';
    searchByDisposition: any | null = null;
    searchByManager: any | null = null;
    searchByUser: any | null = null;
    searchByLeadSource: any | null = null;
    searchByCampaign: any | null = null;
    searchAll: any;
    showName: boolean = false;
    showDate: boolean = false;
    showStatus: boolean = false;
    showCampaign: boolean = false;
    showCompanyName: boolean = false;
    showDisposition: boolean = false;
    showEmail: boolean = false;
    showExclusivelead: boolean = false;
    showId: boolean = false;
    showLeadSource: boolean = false;
    showUser: boolean = false;
    showManager: boolean = false;
    showPhone: boolean = false;
    showsearch: boolean = false;
    selectedDateRange: string = '';
    checkedTickets = [];
    dateFormat: string = '';
    timeZone: string = '';
    leadIdArray: Array<any> = [];
    color!:string
    @ViewChild('datepicker') datepicker: any;
    @ViewChild('selectAll') selectAll!: ElementRef;

    constructor(
        private authService: AuthService,
        private commonService: CommonService,
        private apiService: ApiService,
        public formatter: NgbDateParserFormatter,
        private calendar: NgbCalendar,
        private route: ActivatedRoute
    ) { }

    ngOnInit(): void {
        this.getPaginationList();
        this.route.queryParams
            .subscribe(params => {
                this.searchAll = params['search'];
                if (this.searchAll) {
                    this.getLeadsList();
                } else {
                    this.getLeadsList();
                }


            }
            );
        // let searchvalue = this.route.snapshot.queryParams;
        // if(searchvalue){
        //     this.searchAll = searchvalue['search']
        //     this.getLeadsList()

        // } else {
        //     this.getLeadsList();
        // }
        this.maxDate = this.calendar.getToday();
        this.getLeadOptions();
        this.getUserDetails();
        this.getManagersList();
        this.getUsersList();

    }

    resetFilter() {
        this.searchByLeadTag = '';
        this.searchByStatus = null;
        this.searchByState = '';
        this.searchByName = '';
        this.searchByPhone = '';
        this.searchByEmail = '';
        this.searchByExclusivelead = null;
        this.searchById = '';
        this.searchByCompanyName = '';
        this.searchByDisposition = null;
        this.searchByManager = null;
        this.searchByUser = null;
        this.searchByLeadSource = null;
        this.searchByCampaign = null;
        this.selectedDate = '';
        this.fromDate = null;
        this.toDate = null;
        this.searchAll = ''
        this.getLeadsList();
    }

    async getManagersList() {
        try {
            this.commonService.showSpinner();
            const res$ = this.apiService.getReq(API_PATH.LIST_FOR_USERS + `?role=${Constants.Roles.BRANCHMANAGER}`, 'user', 'list');
            let response = await lastValueFrom(res$);
            if (response && response.data) {
                this.managersList = response.data;

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

    async getUsersList() {
        try {
            this.commonService.showSpinner();
            const res$ = this.apiService.getReq(API_PATH.LIST_FOR_USERS + `?role=${Constants.Roles.UNDERWRITER}`, 'user', 'list');
            let response = await lastValueFrom(res$);
            if (response && response.data) {
                this.usersList = response.data;
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
     * @description on click of delete actoion
     */
    deleteMultipleLeads() {
        if (this.leadIdArray.length) {
            swal.fire({
                title: 'Are you sure to delete?',
                text: 'You will not be able to revert this!',
                icon: 'warning',
                showCancelButton: true,
                confirmButtonText: 'Yes, Delete',
                confirmButtonColor: "#f0412e",
                cancelButtonText: 'Cancel',
                backdrop: true,
                allowOutsideClick: false,
            }).then((result) => {
                if (result.value) {
                    this.deleteLead(this.leadIdArray);
                }
            })
        } else {
            this.commonService.showError("Please select atleast one lead.")
        }
    }

    /**
     * @description delete single lead
     */
    async deleteSingleLead(id: string) {
        this.deleteLead([id]);
    }

    async deleteLead(ids: Array<string>): Promise<void> {
        try {
            if (!ids.length) {
                return;
            }
            this.commonService.showSpinner();
            const res$ = this.apiService.postReq(API_PATH.DELETE_LEADS, { delete_id: ids }, 'lead', 'delete');
            let response = await lastValueFrom(res$);
            if (response && response.data) {
                this.commonService.showSuccess(response.message);
                this.leadsList = this.leadsList.filter(el => !ids.includes(el.id));
                this.leadIdArray = [];
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

    onChange(id: any, target: EventTarget | null) {
        const input = target as HTMLInputElement;
        if (input.checked) {
            if (!this.leadIdArray.includes(id)) {
                this.leadIdArray.push(id);
            }
        } else {
            let i = this.leadIdArray.findIndex(x => x === id);
            if (i > -1) {
                this.leadIdArray.splice(i, 1);
            }
        }
    }

    onCheckingAll(target: any) {
        this.leadIdArray = [];
        for (let i = 0; i < this.leadsList.length; i++) {
            this.leadsList[i].selected = target.checked;
            if (target.checked) {
                this.leadIdArray.push(this.leadsList[i].id);
            }
        }
    }

    /**
     * @description lead options
     */
    async getLeadOptions() {
        try {
            this.commonService.showSpinner();
            const res$ = this.apiService.getReq(API_PATH.LEAD_OPTIONS_LIST, '', '');
            let response = await lastValueFrom(res$);
            if (response && response.data) {
                this.leadSourceList = response.data.lead_source;
                this.leadStatusList = response.data.status
                this.campaignList = response.data.campaign
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
                this.page = 1;
                this.getLeadsList();
            }
        }
    }

    onStatusChange() {
        this.page = 1;
        this.getLeadsList();
    }

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
                this.dateFormat = ud.date_format;
                this.timeZone = ud.time_zone;
                this.color = ud?.color;
            }
        } catch (error: any) {
            this.commonService.showError(error.message);
        }
    }
    getDate(date: any){
        return moment(date).tz(this.timeZone).format(`${this.dateFormat} hh:mm:ss A`)
    }

    /**
     * @description get leads listing
     */
    async getLeadsList() {
        this.showName = false;
        this.showDate = false;
        this.showStatus = false;
        this.showCampaign = false;
        this.showCompanyName = false;
        this.showDisposition = false;
        this.showEmail = false;
        this.showExclusivelead = false;
        this.showId = false;
        this.showLeadSource = false;
        this.showUser = false;
        this.showManager = false;
        this.showPhone = false;
        this.showsearch = false;
        let url = `?records_per_page=${this.recordsPerPage}&page=${this.page}`;

        if (this.selectedDate) {
            this.showDate = true
            url = `${url}&daterange_filter=${this.selectedDate}`;
        }
        if (this.searchByName) {
            this.showName = true
            url = `${url}&name=${this.searchByName}`;
        }
        if (this.searchByStatus) {
            let statusId = this.searchByStatus.id
            this.showStatus = true
            url = `${url}&status=${statusId}`;
        }
        if (this.searchByCampaign) {
            this.showCampaign = true
            url = `${url}&campaign=${this.searchByCampaign.id}`;
        }
        if (this.searchByCompanyName) {
            this.showCompanyName = true
            url = `${url}&company_name=${this.searchByCompanyName}`;
        }
        if (this.searchByDisposition) {
            this.showDisposition = true
            url = `${url}&disposition=${this.searchByDisposition}`;
        }
        if (this.searchByEmail) {
            this.showEmail = true
            url = `${url}&email=${this.searchByEmail}`;
        }
        if (this.searchByExclusivelead) {
            this.showExclusivelead = true;
            url = `${url}&exclusive_lead=${this.searchByExclusivelead}`;
        }
        if (this.searchById) {
            this.showId = true;
            url = `${url}&lead_id=${this.searchById}`;
        }
        if (this.searchByLeadSource) {
            this.showLeadSource = true;
            url = `${url}&source=${this.searchByLeadSource.id}`;
        }
        if (this.searchByUser) {
            this.showUser = true;
            url = `${url}&user_id =${this.searchByUser.id}`;
        }
        if (this.searchByManager) {
            this.showManager = true;
            url = `${url}&search_by_manager=${this.searchByManager.id}`;
        }
        if (this.searchByPhone) {
            this.showPhone = true;
            url = `${url}&phone=${this.searchByPhone}`;
        }
        if (this.searchAll) {
            this.showsearch = true;
            url = `${url}&search=${this.searchAll}`;
        }

        try {
            this.commonService.showSpinner();
            const res$ = this.apiService.getReq(API_PATH.LEAD_LIST + url, 'lead', 'list');
            let response = await lastValueFrom(res$);
            if (response && response.status_code == "200") {
                if (response.data && response.data.data) {
                    this.leadsList = response.data.data.map((e: any) => ({ ...e, selected: false }));
                    this.selectAll.nativeElement.checked = false;
                    this.totalRecords = response.data.total_records;
                } else {
                    this.leadsList = [];
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
        this.recordsPerPage = value;
        this.page = 1;
        this.getLeadsList();
    }

    /**
     * @description on page change
     * @returns {void}
     * @param p 
     */
    onPageChange(p: number): void {
        this.page = p;
        this.getLeadsList();
    }

    getPaginationList() {
        setTimeout(() => {
            let data = document.getElementsByClassName('ngx-pagination')[0]?.getElementsByTagName('li');
                for (let i = 0; i < data?.length; i++) {
                    if (data[i].className == 'current' || data[i].className == 'current ng-star-inserted' || data[i].className == 'ng-star-inserted current') {
                        data[i].style.background = this.color;
                    } else {
                        data[i].style.background = 'none';

                }
            }
        }, 0)



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
