import { Component, ElementRef, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { API_PATH } from '@constants/api-end-points';
import { Custom_Regex, Roles } from '@constants/constants';
import { NgbCalendar, NgbDate, NgbDateParserFormatter, NgbDateStruct, NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { ApiService } from '@services/api.service';
import { AuthService } from '@services/auth.service';
import { CommonService } from '@services/common.service';
import moment from 'moment';
import {lastValueFrom, Subscription } from 'rxjs';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-lead-status-listing',
  templateUrl: './lead-status-listing.component.html',
  styleUrls: ['./lead-status-listing.component.scss', '../../styles/dashboard.scss', '../../styles/predictive-search.scss']
})
export class LeadStatusListingComponent implements OnInit {
  hoveredDate: NgbDate | null = null;
  modal!: NgbModalRef;
  fromDate!: NgbDate | null;
  toDate!: NgbDate | null;
  selectedDate: string = '';
  maxDate!: NgbDateStruct;
  companyStatus: string = '';
  searchKeyword: string = '';
  leadStatusList: Array<any> = [];
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
  leadStatusForm!: FormGroup;
  EditleadSouceForm!: FormGroup;
  canAddLeadStatus: boolean = false;
  canViewLeadList: boolean = false;
  canDeleteLeadStatus: boolean = false;
  canUpdateLeadStatus: boolean = false;
  canViewLeadStatus: boolean = false;
  canUpdateStatus: boolean = false;
  leadSourceID: any;
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
  userRole: string = ''
  canListLead: boolean = false;
  editleadStatus: boolean = false;
  userDeleted: boolean = false;
  constructor(
      private commonService: CommonService,
      private apiService: ApiService,
      public formatter: NgbDateParserFormatter,
      private calendar: NgbCalendar,
      private route: ActivatedRoute,
      private modalService: NgbModal,
      private fb: FormBuilder,
      private authService: AuthService,
      private router: Router
  ) { }

  ngOnInit(): void {
      this.route.queryParams
          .subscribe(params => {
              this.searchKeyword = params['search'];
              if (this.searchKeyword) {
                  this.getLeadStatusList();
              } else {
                  this.getLeadStatusList();
              }
          }
          );
      this.canListLead = this.authService.hasPermission('lead-list');

      this.getUserDetails();
      this.maxDate = this.calendar.getToday();
      this.canAddLeadStatus = this.authService.hasPermission('lead-status-create');
      this.canViewLeadList = this.authService.hasPermission('lead-status-list');
      this.canUpdateLeadStatus = this.authService.hasPermission('lead-status-update');
      this.canDeleteLeadStatus = this.authService.hasPermission('lead-status-delete');
      this.canViewLeadStatus = this.authService.hasPermission('lead-status-view');
      this.canUpdateStatus = this.authService.hasPermission('lead-status-update-status');
      this.initEditLeadSouceForm();
      //

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

  sortBy(col: string) {
      if (!this.leadStatusList.length) {
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


      this.getLeadStatusList();


  }

  /**
* @description initialize chnage password form
* @author Shine Dezign Infonet Pvt. Ltd.
*/
  initLeadSouceForm() {
      this.leadStatusForm = this.fb.group({
          name: ['', [
              Validators.required,
              Validators.pattern(Custom_Regex.spaces),
              Validators.pattern(Custom_Regex.username),
              Validators.pattern(Custom_Regex.name),
              Validators.minLength(3),
              Validators.maxLength(100)
          ]],
          exclusive_time: ['', [  Validators.required,
            Validators.pattern(Custom_Regex.digitsOnly),
            Validators.pattern(Custom_Regex.spaces)
        ]],
      })
  }
  /**
   * @description change passsword submit
   * @returns {Promise<void>}
   * @author Shine Dezign Infonet Pvt. Ltd.
   */
  async createLeadStatusSubmit(): Promise<any> {
      this.leadStatusForm.markAllAsTouched();
      if (this.leadStatusForm.valid) {
          //
          try {
              this.commonService.showSpinner();

              let data = {
                  ...this.leadStatusForm.value,

              }
              const res$ = this.apiService.postReq(API_PATH.CREATE_LEAD_STATUS, data, 'lead', 'status-create');
              let response = await lastValueFrom(res$);
              if (response) {
                  this.commonService.showSuccess(response.message);
                  this.getLeadStatusList();
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
          //

          this.closeModal();
      }

  }

  get userBaseRoute() {
      return this.authService.getUserRole().toLowerCase();
  }
  /**
   * @description formcontrols getters
   * @author Shine Dezign Infonet Pvt. Ltd.
   * @returns { [key: string]: AbstractControl }
   */
  get f(): { [key: string]: AbstractControl } {
      return this.leadStatusForm.controls;
  }

  /**
  * @description get users list eg company list if adminisrator is logged in
  */
  async getLeadStatusList(): Promise<any> {
      try {
          let url = `?sort_by=${this.search.sortby}&dir=${this.search.order}&page_limit=${this.usersListLimit}&page=${this.userListPage}`;
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
          const res$ = this.apiService.getReq(API_PATH.LEAD_STATUS_LISTING + url, 'lead', 'status-list');
          let response = await lastValueFrom(res$);
          if (response && response.data) {
              if (response.data.data) {
                  this.hasMoreUsers = response.data.hasMorePages;
                  this.totalUsersCount = response.data.total;
                  this.leadStatusList = response.data.data;
                  this.leadStatusList.forEach(object => { object.toggle = false })
                  for (let i = 0; i < this.leadStatusList.length; i++) {
                      if (this.leadStatusList[i].status == 'Active') {
                          this.leadStatusList[i].toggle = true;
                      } else {
                          this.leadStatusList[i].toggle = false;
                      }
                  }
              } else {
                  this.leadStatusList = [];
              }

          } else {
              this.leadStatusList = [];
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
      this.getLeadStatusList();
  }

  /**
* @description on page change
* @returns {void}
* @param p 
*/
  onUserPageChange(p: number): void {
      this.userListPage = p;
      this.getLeadStatusList();
  }
  openModal(templateRef: TemplateRef<any>) {
    // this.closeTriggerModal();
    // this.emailTemplateId = id
    try {
        this.modal = this.modalService.open(templateRef, { backdrop: 'static', size: 'md' });
        this.initLeadSouceForm();
    } catch (error: any) {
        this.commonService.showError(error.message);
    }
}
  async deleteLeadStatus(user: any) {

      try {
          let url = `?id=${user.id}&name=${user.status_name}`;
          this.commonService.showSpinner();
          const res$ = this.apiService.getReq(API_PATH.DELETE_LEAD_STATUS + url, 'lead', 'status-delete');
          let response = await lastValueFrom(res$);
          if (response && response.status_code == "200") {
              this.commonService.showSuccess(response.message);
              let obj = this.leadStatusList.filter(e => e.id == user.id);
              this.totalUsersCount = this.totalUsersCount - 1
              obj[0].status = "Inactive"
              obj[0].toggle = false;
              this.getLeadStatusList();
          } else {
              this.commonService.showError(response.message);
          }
          this.commonService.hideSpinner();
      } catch (error: any) {
          this.commonService.hideSpinner();
          if(error.error.data.already_exists == 1){
            Swal.fire({
                title: error.error.message ,
                icon: 'warning',
                // showCancelButton: true,
                confirmButtonText: 'OK',
                confirmButtonColor: "#f0412e",
            }).then((result) => {
                if (result.value) {
                } else if (result.dismiss === Swal.DismissReason.cancel) {
                    Swal.close()
                }
            })
                } else{
                    if (error.error && error.error.message) {
                        this.commonService.showError(error.error.message);
                    } else {
                        this.commonService.showError(error.message);
                      
                    }
                }
        //   if (error.error && error.error.message) {
        //       this.commonService.showError(error.error.message);
        //   } else {
        //       this.commonService.showError(error.message);
        //   }
      }
  }
  closeModal() {
      this.modal.close();
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
              this.userListPage = 1;
              this.getLeadStatusList();
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
      this.getLeadStatusList();
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
      this.getLeadStatusList();
  }

  onStatusToggleChange(e: any, input: any, user: any, i: number) {
      this.commonService.showSpinner();
      let status = "1";
      this.leadStatusList[i].toggle = true;
      if (!e.target.checked) {
          status = "0";
          this.leadStatusList[i].toggle = false;
      }
      this.updateStatus(status, user, input, i);
  }

  async updateStatus(status: string, user: any, input: any, i: number) {
      try {
          const res$ = this.apiService.postReq(API_PATH.LEAD_STATUS_UPDATE, { name: user.name, id: user.id, status: status }, 'lead', 'status-update');
          const response = await lastValueFrom(res$);
          if (response && response.status_code) {
              this.commonService.showSuccess(response.message);
          } else {
              this.commonService.showError(response.message)
          }
          this.commonService.hideSpinner();
      } catch (error: any) {
          if (status === "1") {
              input.checked = false;
              this.leadStatusList[i].toggle = false
          } else {
              input.checked = true;
              this.leadStatusList[i].toggle = true
          }
          this.commonService.hideSpinner();
          if(error.error.data.already_exists == 1){
            Swal.fire({
                title: error.error.message ,
                icon: 'warning',
                // showCancelButton: true,
                confirmButtonText: 'OK',
                confirmButtonColor: "#f0412e",
            }).then((result) => {
                if (result.value) {
                } else if (result.dismiss === Swal.DismissReason.cancel) {
                    Swal.close()
                }
            })
                } else{
                    if (error.error && error.error.message) {
                        this.commonService.showError(error.error.message);
                    } else {
                        this.commonService.showError(error.message);
                      
                    }
                }
          
        //   this.commonService.showErrorMessage(error);
      }

  }
  onPageChange(p: number): void {
      this.userListPage = p;
      this.getLeadStatusList();
  }

  editLeadModal(templateRef: TemplateRef<any>,user:any, value: any) {
    if(value == 'edit'){
      this.editleadStatus = true;
      if(user.is_deleted == 1){
          this.userDeleted = true
      }else{
        this.userDeleted = false
      }
    }else{
      this.editleadStatus = false;
    }
      this.patchValue(user)
      try {
          this.modal = this.modalService.open(templateRef, { backdrop: 'static', size: 'md' });
      } catch (error: any) {
          this.commonService.showError(error.message);
      }
  }

  ViewLeadModal(templateRef: TemplateRef<any>, user: any) {
      this.patchValue(user)
      try {
          this.modal = this.modalService.open(templateRef, { backdrop: 'static', size: 'md' });
      } catch (error: any) {
          this.commonService.showError(error.message);
      }
  }

  initEditLeadSouceForm() {
      this.EditleadSouceForm = this.fb.group({
        name: ['', [
          Validators.required,
          Validators.pattern(Custom_Regex.spaces),
          Validators.pattern(Custom_Regex.username),
          Validators.pattern(Custom_Regex.name),
          Validators.minLength(3),
          Validators.maxLength(100)
      ]],
        exclusive_time: ['', [  Validators.required,
              Validators.pattern(Custom_Regex.digitsOnly),
              Validators.pattern(Custom_Regex.spaces)
          ]],
      })
  }
  async updateLeadStatus(): Promise<any> {
      this.EditleadSouceForm.markAllAsTouched();
      if (this.EditleadSouceForm.valid) {
          //
          try {
              this.commonService.showSpinner();

              let data = {
                  ...this.EditleadSouceForm.value,
                //   exclusive_time: this.EditleadSouceForm.value.exclusive_time,
                  id: this.leadSourceID

              }
              const res$ = this.apiService.postReq(API_PATH.LEAD_STATUS_EDIT, data, 'lead', 'status-update');
              let response = await lastValueFrom(res$);
              if (response) {
                  this.commonService.showSuccess(response.message);
                  this.modal.close
                  this.getLeadStatusList();
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
          //

          this.closeModal();
          // this.router.navigate([`/${this.userBaseRoute}/drip-campaign-list/add-drip-campaign`], { queryParams: { name: this.leadSouceForm.value.name } });
      }
      //    else {
      //        this.commonService.showError('Please fill required details');
      //    }

  }
  get ff(): { [key: string]: AbstractControl } {
      return this.EditleadSouceForm.controls;
  }

  patchValue(user: any) {
      this.EditleadSouceForm.get('name')?.patchValue(user.status_name);
      this.EditleadSouceForm.get('exclusive_time')?.patchValue(user.exclusive_time);
      this.leadSourceID = user.id;
  }

}
