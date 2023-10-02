import {
    Component,
    ElementRef,
    OnInit,
    TemplateRef,
    ViewChild,
} from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { API_PATH } from '@constants/api-end-points';
import { Roles } from '@constants/constants';
import { AngularEditorConfig } from '@kolkov/angular-editor';
import {
    NgbCalendar,
    NgbDate,
    NgbDateParserFormatter,
    NgbDateStruct,
    NgbModal,
    NgbModalRef,
} from '@ng-bootstrap/ng-bootstrap';
import { ApiService } from '@services/api.service';
import { AuthService } from '@services/auth.service';
import { CommonService } from '@services/common.service';
import moment from 'moment';
import {
    debounceTime,
    distinctUntilChanged,
    filter,
    fromEvent,
    lastValueFrom,
    map,
    Subscription,
    switchMap,
    tap,
} from 'rxjs';

@Component({
    selector: 'app-email-template-list',
    templateUrl: './email-template-list.component.html',
    styleUrls: [
        './email-template-list.component.scss',
        '../../styles/dashboard.scss',
        '../../styles/predictive-search.scss',
    ],
})
export class EmailTemplateListComponent implements OnInit {
    teamList: Array<any> = [];
    userListPage: number = 1;
    hasMoreUsers: boolean = false;
    usersListLimit: number = 10;
    totalUsersCount: number = 0;
    userId: string = '';
    passwordType: boolean = true;
    confirmpasswordType: boolean = true;
    @ViewChild('datepicker') datepicker: any;
    predictiveSearchResults: Array<any> = [];
    @ViewChild('predictiveSearch', { static: false })
    predictiveSearch!: ElementRef;
    dateFormat: string = '';
    timeZone: string = '';
    canAddTemplate: boolean = false;
    canDeleteTemplate: boolean = false;
    fromDate!: NgbDate | null;
    toDate!: NgbDate | null;
    selectedDate: string = '';
    maxDate!: NgbDateStruct;
    searchKeyword: string = '';
    hoveredDate: NgbDate | null = null;
    companyStatus: string = '';
    canViewTemplate: boolean = false;
    modal!: NgbModalRef;
    previewForm!: FormGroup;
    predictiveSearchId: string = '';
    canDuplicateTemplate: boolean = false;
    previewConfig: AngularEditorConfig = {
        height: '400px',
        editable: false,
        sanitize: false,
        showToolbar: false,
        uploadUrl: 'company/image-upload',
        upload: (file) => {
            const formData = new FormData();
            formData.append("image", file);
            return this.apiService.postReq(API_PATH.UPLOAD_EMAIL_TEMPLATE_IMAGE, formData, 'documents', 'upload').pipe(
                map((x: any) => {
                    x.body = { imageUrl: x.data.imageUrl };
                    return x;
                })
            );
        },
        uploadWithCredentials: false,
        toolbarHiddenButtons: [[], [
            // 'insertImage', 
            'insertVideo']],
    };
    colorSub!: Subscription;
    background!: { background: string; };
    style!: { fill: string; };
    color!: string;
    dashboardData: any = {};
    roles = Roles;
    userRole: string = '';
    canListLead: boolean = false;
    templateType: Array<any> = [];
    tempFilter: { [key: string]: any } = {
        "Template Type": { value: null },

    }
    appliedFilter: { [key: string]: any } = {
    }
    search = {
       order:'DESC',
       sortby:'created_at'
    }

    constructor(
        private commonService: CommonService,
        private apiService: ApiService,
        public formatter: NgbDateParserFormatter,
        private authService: AuthService,
        private calendar: NgbCalendar,
        private modalService: NgbModal,
        public fb: FormBuilder
    ) { }

    ngOnInit(): void {
        this.getLeadOptions()
        this.getUserDetails();
        this.getEmailTemplateList();
        this.canListLead = this.authService.hasPermission('lead-list');


        this.canAddTemplate = this.authService.hasPermission('email-template-add');
        this.canDeleteTemplate = this.authService.hasPermission(
            'email-template-delete'
        );
        this.canViewTemplate = this.authService.hasPermission(
            'email-template-view'
        );
        this.canDuplicateTemplate = this.authService.hasPermission(
            'email-template-duplicate'

        );
        this.maxDate = this.calendar.getToday();
    }
    ngDoCheck(): void {

        this.getPaginationList();
        this.getDateColor();
    }
       // custom datepicker color
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
    onSearch() {
        this.userListPage = 1;
        this.appliedFilter = JSON.parse(JSON.stringify(this.tempFilter));
        this.getEmailTemplateList();
    }
    getTemplateList() {
        this.onSearch();
    }
    // ngAfterViewChecked(){
    //     let data = document.getElementsByClassName('ngx-pagination')[0]?.getElementsByTagName('li');
    //     for (let i = 0; i < data?.length; i++) {
    //         console.log("hvtyg",data[i].className );

    //         if (data[i].className == 'current' || data[i].className == 'current ng-star-inserted' || data[i].className == 'ng-star-inserted current') {
    //             data[i].style.background = this.color;
    //         } else {
    //             data[i].style.background = 'none';

    //     }
    // }
    //   }
    async getLeadOptions() {
        try {
            this.commonService.showSpinner();
            const res$ = this.apiService.getReq(API_PATH.LEAD_OPTIONS_LIST, '', '');
            let response = await lastValueFrom(res$);
            if (response && response.data) {
                this.templateType = response.data.template_type;
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
        let data = document.getElementsByClassName('ngx-pagination')[0]?.getElementsByTagName('li');
        for (let i = 0; i < data?.length; i++) {
            if (data[i].className == 'current' || data[i].className == 'current ng-star-inserted' || data[i].className == 'ng-star-inserted current') {
                data[i].style.background = this.color;
            } else {
                data[i].style.background = 'none';

            }
        }
        fromEvent(this.predictiveSearch.nativeElement, 'keyup')
            .pipe(
                tap(() => {
                    if (!this.predictiveSearch.nativeElement.value) {
                        this.predictiveSearchResults = [];
                    }
                }),
                filter(
                    () =>
                        this.predictiveSearch.nativeElement.value &&
                        this.predictiveSearch.nativeElement.value.length > 0
                ),
                debounceTime(200),
                distinctUntilChanged(),
                switchMap(() =>
                    this.apiService.postReq(
                        API_PATH.PREDICTIVE_SEARCH,
                        {
                            search: this.predictiveSearch.nativeElement.value,
                            records_per_search: 500,
                            type: 'email-template',
                        },
                        'emailtemplate',
                        'list'
                    )
                )
            )
            .subscribe((res) => {
                if (res && res.status_code == '200') {
                    this.predictiveSearchResults = res.data;
                } else {
                    this.predictiveSearchResults = [];
                }
            });
    }
    initPreviewForm() {
        this.previewForm = this.fb.group({
            preview_template: [''],
        });
    }
    openModal(templateRef: TemplateRef<any>, templateId: any) {
        try {
            this.modal = this.modalService.open(templateRef, {
                backdrop: 'static',
                size: 'lg',
            });
            this.initPreviewForm();
            this.previewTemplate(templateId);
        } catch (error: any) {
            this.commonService.showError(error.message);
        }
    }
    async previewTemplate(templateId: any) {
        try {
            this.commonService.showSpinner();
            const res$ = this.apiService.postReq(
                API_PATH.GET_EMAIL_TEMPLATE_HTML,
                { template_id: templateId },
                'send',
                'app-and-email'
            );
            let response = await lastValueFrom(res$);
            if (response) {
                //  this.commonService.showSuccess(response.message);
                if (response && response.data) {
                    this.previewForm.patchValue({
                        preview_template: response.data.template,
                    });
                    //  this.commonService.showSuccess(response.message);
                    // this.router.navigate([`/${this.userBaseRoute}/lead-detail/` + this.leadID]);
                }
            }
            this.commonService.hideSpinner();
        } catch (error: any) {
            this.commonService.hideSpinner();
            if (error.error && error.error.message) {
                this.commonService.showError(error.error.message);
            } else {
                this.commonService.hideSpinner();
                this.commonService.showError(error.message);
            }
        }
    }
    closeModal() {
        this.modal.close();
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




    getDate(date: any) {
        return moment(date)
            .tz(this.timeZone)
            .format(`${this.dateFormat} hh:mm:ss A`);
    }
    getColorOnUpdate() {
        this.colorSub = this.authService.getColor().subscribe((u) => {
            this.getUserDetails();
        });
    }
    /**
     * @description get users list eg company list if adminisrator is logged in
     */
    async getEmailTemplateList(): Promise<any> {
        try {
            let url = `?sort_by=${this.search.sortby}&dir=${this.search.order}&page_limit=${this.usersListLimit}&page=${this.userListPage}`;
            if (this.searchKeyword && this.predictiveSearchId) {
                url = url + `&search_keyword=${this.predictiveSearchId}`
            }
            if (this.searchKeyword && !this.predictiveSearchId) {
                url = url + `&search_keyword=${this.searchKeyword}`
            }
            if (this.selectedDate) {
                url = url + `&daterange_filter=${this.selectedDate}`;
            }
            if (this.companyStatus) {
                url = url + `&status=${this.companyStatus}`;
            }
            if ((this.appliedFilter['Template Type']?.value?.id)) {
                url = `${url}&template_type=${this.appliedFilter['Template Type']?.value?.id}`;
            }
            // if(this.templateTypeValue){
            //     url = url + `&template_type=${this.templateTypeValue}`;
            // }
            this.commonService.showSpinner();
            const res$ = this.apiService.getReq(
                API_PATH.EMAIL_TEMPLATE_LIST + url,
                '',
                ''
            );
            let response = await lastValueFrom(res$);
            if (response && response.data.data) {
                this.predictiveSearchId = '';
                this.hasMoreUsers = response.data.hasMorePages;
                this.totalUsersCount = response.data.total;
                this.teamList = response.data.data;
                this.teamList.forEach(object => { object.toggle = false });
                for (let i = 0; i < this.teamList.length; i++) {
                    if (this.teamList[i].status === 'Active') {
                        this.teamList[i].toggle = true;
                    } else {
                        this.teamList[i].toggle = false;

                    }
                }

            } else {
                this.teamList = [];
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
                this.userListPage = 1;
                this.getEmailTemplateList();
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
        this.getEmailTemplateList();
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
        for (const p in this.tempFilter) {
            this.tempFilter[p].value = null;
        }
        this.getEmailTemplateList();
    }
    async deleteEmail(id: any) {
        try {
            let data = {
                template_id: id,
            };
            this.commonService.showSpinner();
            const res$ = await this.apiService.postReq(
                API_PATH.EMAIL_TEMPLATES_DELETE,
                data,
                'email-template',
                'delete'
            );
            const response = await lastValueFrom(res$);
            if (response && response.status_code == '200') {
                this.commonService.showSuccess(response.message);
                this.teamList = this.teamList.filter((el) => !id.includes(el.id));
            }
            this.commonService.hideSpinner();
        } catch (error: any) {
            this.commonService.hideSpinner();
            this.commonService.showError(error.error.message);
        }
    }
    get userBaseRoute() {
        return this.authService.getUserRole().toLowerCase();
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
        this.getEmailTemplateList();
    }

    /**
     * @description on page change
     * @returns {void}
     * @param p
     */
    onUserPageChange(p: number): void {
        this.userListPage = p;
        this.getEmailTemplateList();
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
                API_PATH.TEAM_DELETE,
                { team_id: user.id },
                'team',
                'delete'
            );
            let response = await lastValueFrom(res$);
            if (response && response.data) {
                this.teamList = this.teamList.filter((e) => e.id != user.id);
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
    onStatusToggleChange(e: any, input: any, id: string, i: number) {
        this.commonService.showSpinner();
        let status = '1';
        this.teamList[i].toggle = true;

        if (!e.target.checked) {
            status = '0';
            this.teamList[i].toggle = false;

        }
        this.updateStatus(status, id, input, i);
    }

    async updateStatus(status: string, id: string, input: any, i: number) {
        try {
            const res$ = this.apiService.postReq(
                API_PATH.EMAIL_TEMPLATE_STATUS_UPDATE,
                { id: id, status: status },
                'user',
                'edit'
            );
            const response = await lastValueFrom(res$);
            if (response && response.status_code) {
                this.commonService.showSuccess(response.message);
            } else {
                this.commonService.showError(response.message);
            }
            this.commonService.hideSpinner();
        } catch (error) {
            if (status === '1') {
                input.checked = false;
                this.teamList[i].toggle = false;

            } else {
                input.checked = true;
                this.teamList[i].toggle = true;

            }
            this.commonService.hideSpinner();
            this.commonService.showErrorMessage(error);
        }
    }
    
    sortBy(col:string){
     if(!this.teamList.length){
        return;
     }
     if(this.search.sortby === col){
        if(this.search.order === 'ASC'){
            this.search.order = 'DESC'
        }else{
            this.search.order = 'ASC'
        }
    }else{
        this.search.order = 'DESC';
        this.search.sortby = col;
     }
     this.getEmailTemplateList();
    }
}
