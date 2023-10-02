import { Component, ElementRef, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { API_PATH } from '@constants/api-end-points';
import { Custom_Regex, Roles } from '@constants/constants';
import { NgbCalendar, NgbDate, NgbDateParserFormatter, NgbDateStruct, NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { ApiService } from '@services/api.service';
import { AuthService } from '@services/auth.service';
import { CommonService } from '@services/common.service';
import moment from 'moment';
import { debounceTime, distinctUntilChanged, filter, fromEvent, lastValueFrom, Subscription, switchMap, tap } from 'rxjs';
import Swal from 'sweetalert2';

@Component({
    selector: 'app-users',
    templateUrl: './users.component.html',
    styleUrls: ['../../../styles/dashboard.scss', './users.component.scss', '../../../styles/predictive-search.scss']
})
export class UsersComponent implements OnInit {
    hoveredDate: NgbDate | null = null;
    modal!: NgbModalRef;
    deleteModal!: NgbModalRef;
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
    userId: string = '';
    passwordType: boolean = true;
    deleteuserId: string = '';
    confirmpasswordType: boolean = true;
    assignedToUsers: any[] = [];
    leadCount: number = 0;
    dateFormat: string = '';
    timeZone: string = '';
    predictiveSearchId: string = '';
    @ViewChild('datepicker') datepicker: any;
    predictiveSearchResults: Array<any> = [];
    @ViewChild('predictiveSearch', { static: false }) predictiveSearch!: ElementRef;
    @ViewChild('deleteuser') deleteuser!: ElementRef;

    changePasswordForm!: FormGroup;
    deleteForm!: FormGroup;
    deleteuserRole: string = ''
    colorSubs!: Subscription;
    style!: { fill: string; };
    background!: { background: string; };
    color!: string;
    // @Output() closeModal: EventEmitter<any> = new EventEmitter();
    //Dashborad
    dashboardData: any ={};
    roles = Roles;
    userRole: string = '';
    canaddUser: boolean = false;
    canViewUser: boolean = false;
    canEditUser: boolean = false;
    canUpdatePasswordUser: boolean = false;
    canDeleteUser: boolean = false;
    tempFilter: { [key: string]: any } = {
        "Search": { value: "" },
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
        private calendar: NgbCalendar,
        private route: ActivatedRoute,
        private modalService: NgbModal,
        private fb: FormBuilder,
        private authService: AuthService
    ) { }

    ngOnInit(): void {
        this.route.queryParams
            .subscribe(params => {
                this.tempFilter['Search'].value = params['search'];
                if (this.tempFilter['Search'].value) {
                    this.onSearch();
                } else {
                    this.onSearch();
                }
            }
            );
            this.getUserDetails();
        // let searchvalue = this.route.snapshot.queryParams;
        // if (searchvalue) {
        //     this.searchKeyword = searchvalue['search']
        // }
        this.maxDate = this.calendar.getToday();
        this.canaddUser = this.authService.hasPermission('user-create');
        this.canViewUser = this.authService.hasPermission('user-edit');
        this.canEditUser = this.authService.hasPermission('user-edit');
        this.canUpdatePasswordUser = this.authService.hasPermission('user-update-password');
        this.canDeleteUser = this.authService.hasPermission('user-delete');
       
    }
    ngDoCheck():void {
        
        this.getPaginationList();
        this.getDateColor();
    }
    // datepicker custom color
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
    //
    getUserDetails(): void {
        try {
            let ud = this.authService.getUserDetails();
            if (ud) {
                this.userRole = ud.role;
                this.dateFormat = ud.date_format;
                this.timeZone = ud.time_zone;
                this.getColorOnUpdate();
                this.style={fill:ud?.color};
                this.color=ud?.color;
                    // this.stroke={stroke:ud?.color};
                    this.background={background:ud?.color};

            }
        } catch (error: any) {
            this.commonService.showError(error.message);
        }
    }
    getDate(date: any){
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
    initChangePasswordForm() {
        this.changePasswordForm = this.fb.group({
            // old_password: ['', [Validators.required, Validators.pattern(Custom_Regex.spaces)]],
            password: ['', [Validators.required, Validators.pattern(Custom_Regex.password)]],
            password_confirmation: ['', [Validators.required]]
        }, { validators: this.commonService.checkPasswords })
    }

    /**
     * @description change passsword submit
     * @returns {Promise<void>}
     * @author Shine Dezign Infonet Pvt. Ltd.
     */
    async changePasswordSubmit(): Promise<void> {
        this.changePasswordForm.markAllAsTouched();
        if (this.changePasswordForm.valid) {
            let data = {
                ...this.changePasswordForm.value,
                user_id: this.userId
            }
            try {
                this.commonService.showSpinner();
                const res$ = this.apiService.postReq(API_PATH.USER_CHANGE_PASSWORD, data, 'user', 'update-password');
                let response = await lastValueFrom(res$);
                if (response) {
                    this.commonService.showSuccess(response.message);
                    this.closeModal();
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

    }

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
            // if (this.searchKeyword) {
            //     url = url + `&search_keyword=${this.predictiveSearchId}`
            // }
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
            const res$ = this.apiService.getReq(API_PATH.USERS_LIST + url, 'user', 'list');
            let response = await lastValueFrom(res$);
            if (response && response.data) {
                this.hasMoreUsers = response.data.hasMorePages;
                this.totalUsersCount = response.data.total;
                this.usersList = response.data.data;
                this.predictiveSearchId = '';
                this.usersList.forEach(object=>{object.toogle = false});  
                for(let i=0;i<this.usersList.length;i++){
                    if(this.usersList[i].status === 'Active'){
                      this.usersList[i].toggle = true;

                    }else{
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

    openModal(templateRef: TemplateRef<any>, id: any) {
        this.userId = id;
        try {
            this.modal = this.modalService.open(templateRef, { backdrop: 'static', size: 'md' });
            this.initChangePasswordForm();
        } catch (error: any) {
            this.commonService.showError(error.message);
        }
    }

    openDeleteModal(templateRef: TemplateRef<any>, user: any) {
        this.deleteuserId = user.id;
        this.deleteuserRole = user.role;
        this.getAssignedToUsersList();
        this.getLeadCount(user.id)
        try {
            this.deleteModal = this.modalService.open(templateRef, { backdrop: 'static', size: 'md' });
            this.initDeleteForm();
        } catch (error: any) {
            this.commonService.showError(error.message);
        }
    }
    closeDeleteModal() {
        this.deleteModal.close();
    }
    closeModal() {
        this.modal.close();
    }
    deleteassociateUser(id: any) {
        this.deleteForm.markAllAsTouched();
         if (!this.deleteForm.valid) return
        if (this.deleteForm.value.selected_checkbox == 'no' && this.deleteForm.value.selected_user == '') {
            this.deleteForm.get('selected_user')?.patchValue('');
            this.deleteForm.get('selected_user')?.setValidators([Validators.required]);
            this.deleteForm.updateValueAndValidity();
            return;
        }
        if (this.deleteForm.valid){
            Swal.fire({
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
                    this.deleteUser(id);
                } else if (result.dismiss === Swal.DismissReason.cancel) {
                    Swal.close()
                }
            })
        }
      
        
    }
    /**
     * @description delete user after confirmation
     * @param user 
     * @author Shine Dezign Infonet Pvt. Ltd.
     * @returns { Promise<void> }
     */
    async deleteUser(id: any): Promise<void> {

        let reqData: any = {
            is_permanent: 1,
            company_delete: 0,
            user_id: id
        }

        if (this.deleteForm.value.selected_checkbox === 'no') {
            reqData.is_permanent = 0,
                reqData.assigned_user_to = this.deleteForm.value.selected_user
        }
        try {
            this.commonService.showSpinner();
            const res$ = this.apiService.postReq(API_PATH.DELETE_USER, reqData, 'user', 'delete');
            let response = await lastValueFrom(res$);
            if (response && response.data) {
                this.usersList = this.usersList.filter((e) => e.id != id);
                this.totalUsersCount = this.totalUsersCount - 1;
                this.commonService.showSuccess(response.message);
                this.closeDeleteModal();
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
    async getLeadCount(id: any) {
        try {
            this.commonService.showSpinner();
            const res$ = this.apiService.postReq(API_PATH.LEAD_COUNT,{user_id: id}, 'lead', 'view');
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
            switchMap(() => this.apiService.postReq(API_PATH.PREDICTIVE_SEARCH, { search: this.predictiveSearch.nativeElement.value, records_per_search: 500, type: 'user' }, 'user', 'list'))
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
                this.userListPage = 1;
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
        this.tempFilter['Search'].value = null;
        this.selectedDate = '';
        this.fromDate = null;
        this.toDate = null;
        this.companyStatus = '';
        this.appliedFilter = {
        }
      
        this.getUsersList();
    }

    async getAssignedToUsersList() {     
        try {
            let url = `?role=${this.deleteuserRole}&user_id=${this.deleteuserId}`;
            this.commonService.showSpinner();
            const res$ = this.apiService.getReq(API_PATH.USER_PRIORITY_LIST + url, 'user', 'delete');
            let response = await lastValueFrom(res$);
            if (response && response.status_code == "200") {
                this.assignedToUsers = response.data;
            } else {
                this.commonService.showError(response.message);
            }
            this.commonService.hideSpinner();
        } catch (error) {
            this.commonService.hideSpinner();
            this.commonService.showErrorMessage(error);
        }
    }
    
    onStatusToggleChange(e: any, input: any, id: string,i:number) {
        this.commonService.showSpinner();
        let status = "1";
        this.usersList[i].toggle = true
        if (!e.target.checked) {
            status = "0";
            this.usersList[i].toggle = false;
        }
        this.updateStatus(status, id, input,i);
    }

    async updateStatus(status: string, user_id: string, input: any,i:number) {
        try {
            const res$ = this.apiService.postReq(API_PATH.USER_UPDATE_STATUS, { user_id: user_id, status: status }, 'user', 'edit');
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
                this.usersList[i].toggle = true;
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

    sortBy(col:string){
        if(!this.usersList.length){
           return
        }
        if(this.search.sortby === col){
           if(this.search.order === 'ASC'){
               this.search.order = 'DESC'
           }else{
               this.search.order = 'ASC'
           }
        }else{
           this.search.sortby = col;
           this.search.order = 'DESC';
        }
        this.getUsersList();
        
   }
}
