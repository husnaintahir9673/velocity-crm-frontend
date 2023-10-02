
import { Component, ElementRef, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { API_PATH } from '@constants/api-end-points';
import { Roles } from '@constants/constants';
import { NgbCalendar, NgbDate, NgbDateParserFormatter, NgbDateStruct, NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { ApiService } from '@services/api.service';
import { AuthService } from '@services/auth.service';
import { CommonService } from '@services/common.service';
import moment from 'moment';
import { debounceTime, distinctUntilChanged, filter, fromEvent, lastValueFrom, Subscription, switchMap, tap } from 'rxjs';

@Component({
    selector: 'app-agent-list',
    templateUrl: './agent-list.component.html',
    //  styleUrls: ['./agent-list.component.scss']
    styleUrls: ['../../styles/dashboard.scss', './agent-list.component.scss', '../../styles/predictive-search.scss'],

})
export class AgentListComponent implements OnInit {

    hoveredDate: NgbDate | null = null;
    modal!: NgbModalRef;
    deleteModal!: NgbModalRef;
    fromDate!: NgbDate | null;
    toDate!: NgbDate | null;
    selectedDate: string = '';
    maxDate!: NgbDateStruct;
    companyStatus: string = '';
    searchKeyword: string = '';
    agentList: Array<any> = [];
    agentListPage: number = 1;
    hasMoreUsers: boolean = false;
    agentListLimit: number = 10;
    totalUsersCount: number = 0;
    userId: string = '';
    passwordType: boolean = true;
    deleteuserId: string = '';
    deleteAgentId: string = '';
    confirmpasswordType: boolean = true;
    dateFormat: string = '';
    timeZone: string = '';
    predictiveSearchId: string = '';
    @ViewChild('datepicker') datepicker: any;
    predictiveSearchResults: Array<any> = [];
    @ViewChild('predictiveSearch', { static: false }) predictiveSearch!: ElementRef;
    @ViewChild('deleteAgent') deleteAgent!: ElementRef;
    canAddAgent: boolean = false;
    canViewAgent: boolean = false;
    canEditAgent: boolean = false;
    canDeleteAgent: boolean = false;
    changePasswordForm!: FormGroup;
    deleteForm!: FormGroup;
    deleteuserRole: string = ''
    style!: { fill: string; };
    background!: { background: string; };
    colorSubs!: Subscription;
    color!: string;
    roles = Roles;
    userRole: string = '';
    canListLead: boolean = false;
    search = {
        order:'DESC',
        sortby:'created_at'
    }


    // @Output() closeModal: EventEmitter<any> = new EventEmitter();

    constructor(
        private commonService: CommonService,
        private apiService: ApiService,
        public formatter: NgbDateParserFormatter,
        private calendar: NgbCalendar,
        private route: ActivatedRoute,
        private modalService: NgbModal,
        private fb: FormBuilder,
        private authService: AuthService
    ) { }

    ngOnInit(): void {
        this.getUserDetails();
        this.canListLead = this.authService.hasPermission('lead-list');

        this.maxDate = this.calendar.getToday();
        this.getAgentList();
        this.canAddAgent = this.authService.hasPermission('agent-add');
        this.canViewAgent = this.authService.hasPermission('agent-view');
        this.canEditAgent = this.authService.hasPermission('agent-update');
        this.canDeleteAgent = this.authService.hasPermission('agent-delete');
    }
    ngDoCheck(): void {

        this.getPaginationList();
        this.getDateColor();
    }
    //datepicker custom color
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
                this.userRole = ud.role;
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

    getColorOnUpdate() {
        this.colorSubs = this.authService.getColor().subscribe((u) => {
            this.getUserDetails();
        });
    }
    /**
 * @description initialize chnage password form
 * @author Shine Dezign Infonet Pvt. Ltd.
 */
    // initChangePasswordForm() {
    //     this.changePasswordForm = this.fb.group({
    //         // old_password: ['', [Validators.required, Validators.pattern(Custom_Regex.spaces)]],
    //         password: ['', [Validators.required, Validators.pattern(Custom_Regex.password)]],
    //         password_confirmation: ['', [Validators.required]]
    //     }, { validators: this.commonService.checkPasswords })
    // }

    /**
     * @description change passsword submit
     * @returns {Promise<void>}
     * @author Shine Dezign Infonet Pvt. Ltd.
     */

    initDeleteForm() {
        this.deleteForm = this.fb.group({
            selected_checkbox: ['', [Validators.required]],
            selected_user: ['']
        })
    }
    get d(): { [key: string]: AbstractControl } {
        return this.deleteForm.controls;
    }

    /**
     * @description formcontrols getters
     * @author Shine Dezign Infonet Pvt. Ltd.
     * @returns { [key: string]: AbstractControl }
     */
    get f(): { [key: string]: AbstractControl } {
        return this.changePasswordForm.controls;
    }

    /**
    * @description get users list eg company list if adminisrator is logged in
    */
    async getAgentList(): Promise<any> {
        try {
            let url = `?sort_by=${this.search.sortby}&dir=${this.search.order}&page_limit=${this.agentListLimit}&page=${this.agentListPage}`;
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
            // 'agent', 'list'
            const res$ = this.apiService.getReq(API_PATH.GET_AGENT_LIST + url, 'user', 'list');
            let response = await lastValueFrom(res$);
            if (response && response.data) {
                this.hasMoreUsers = response.data.hasMorePages;
                this.totalUsersCount = response.data.total;
                this.agentList = response.data.data;
                this.agentList.forEach(object => { object.toggle = false });

                for (let i = 0; i < this.agentList.length; i++) {
                    if (this.agentList[i].status === 'Active') {
                        this.agentList[i].toggle = true;

                    } else {
                        this.agentList[i].toggle = false;

                    }
                }
            } else {
                this.agentList = [];
                this.hasMoreUsers = false;
                this.agentListPage = 1;
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
        this.agentListLimit = value;
        this.agentListPage = 1;
        this.getAgentList();
    }

    /**
  * @description on page change
  * @returns {void}
  * @param p 
  */
    onUserPageChange(p: number): void {
        this.agentListPage = p;
        this.getAgentList();
    }



    openDeleteModal(templateRef: TemplateRef<any>, user: any) {
        this.deleteuserId = user.id;
        // this.deleteuserRole = user.role;
        // this.getAssignedToagentList();
        // this.getLeadCount(user.id)
        try {
            this.deleteModal = this.modalService.open(templateRef, { backdrop: 'static', size: 'md' });
        } catch (error: any) {
            this.commonService.showError(error.message);
        }
    }
    closeDeleteModal() {
        this.deleteModal.close();
    }

    /**
     * @description delete user after confirmation
     * @param user 
     * @author Shine Dezign Infonet Pvt. Ltd.
     * @returns { Promise<void> }
     */
    async GetdeleteAgent(id: any): Promise<void> {

        let reqData: any = {
            agent_id: id
        }
        try {
            this.commonService.showSpinner();
            const res$ = this.apiService.postReq(API_PATH.AGENT_DELETE, reqData, 'user', 'delete');
            let response = await lastValueFrom(res$);
            if (response && response.data) {
                this.agentList = this.agentList.filter((e) => e.id != id);
                this.totalUsersCount = this.totalUsersCount - 1;
                this.commonService.showSuccess(response.message);
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
            switchMap(() => this.apiService.postReq(API_PATH.PREDICTIVE_SEARCH, { search: this.predictiveSearch.nativeElement.value, records_per_search: 500, type: 'agent' }, 'user', 'list'))
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
                this.agentListPage = 1;
                this.getAgentList();
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
        this.getAgentList();
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
        this.getAgentList();
    }


    onStatusToggleChange(e: any, input: any, id: string, i: number) {
        this.commonService.showSpinner();
        let status = "1";
        this.agentList[i].toggle = true

        if (!e.target.checked) {
            this.agentList[i].toggle = false

            status = "0";
        }
        this.updateStatus(status, id, input, i);
    }

    async updateStatus(status: string, agent_id: string, input: any, i: number) {
        try {
            const res$ = this.apiService.postReq(API_PATH.AGENT_UPDATE_STATUS, { agent_id: agent_id, status: status }, 'user', 'edit');
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
                this.agentList[i].toggle = false

            } else {
                input.checked = true;
                this.agentList[i].toggle = true;

            }
            this.commonService.hideSpinner();
            this.commonService.showErrorMessage(error);
        }
    }
    get userBaseRoute() {
        return this.authService.getUserRole().toLowerCase();
    }

    sortBy(col:string){
     if(!this.agentList.length){
        return;
     }
     if(this.search.sortby === col){
        if(this.search.order === 'ASC'){
            this.search.order = 'DESC';
        }else{
            this.search.order = 'ASC'
        }
     }else{
        this.search.order = 'DESC';
        this.search.sortby = col;
     }
     this.getAgentList();
    }

}
