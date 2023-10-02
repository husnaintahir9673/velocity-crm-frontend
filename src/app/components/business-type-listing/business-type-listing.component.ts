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
  selector: 'app-business-type-listing',
  templateUrl: './business-type-listing.component.html',
  styleUrls: ['./business-type-listing.component.scss', '../../styles/dashboard.scss', '../../styles/predictive-search.scss']
})
export class BusinessTypeListingComponent implements OnInit {
  hoveredDate: NgbDate | null = null;
  modal!: NgbModalRef;
  fromDate!: NgbDate | null;
  toDate!: NgbDate | null;
  selectedDate: string = '';
  maxDate!: NgbDateStruct;
  companyStatus: string = '';
  searchKeyword: string = '';
  businessTypeList: Array<any> = [];
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
  businessTypeForm!: FormGroup;
  EditbusinessTypeForm!: FormGroup;
  dripCampaignTriggerForm!: FormGroup
  canAddBusinessType: boolean = false;
  canViewBusinessType: boolean = false;
  canDeleteBusinessType: boolean = false;
  canUpdateBusinessType: boolean = false;
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
  editbusinessType: boolean = false;
  constructor(
      private commonService: CommonService,
      private apiService: ApiService,
      public formatter: NgbDateParserFormatter,
      private calendar: NgbCalendar,
      private route: ActivatedRoute,
      private modalService: NgbModal,
      private fb: FormBuilder,
      private authService: AuthService,
  ) { }

  ngOnInit(): void {
      this.route.queryParams
          .subscribe(params => {
              this.searchKeyword = params['search'];
              if (this.searchKeyword) {
                  this.getBusinessTypeList();
              } else {
                  this.getBusinessTypeList();
              }
          }
          );
      this.getUserDetails();
      this.maxDate = this.calendar.getToday();
      this.canAddBusinessType = this.authService.hasPermission('business-type-create');
      this.canViewBusinessType = this.authService.hasPermission('business-type-list');
      this.canUpdateBusinessType = this.authService.hasPermission('business-type-update');
      this.canDeleteBusinessType = this.authService.hasPermission('business-type-delete');
      this.canViewBusinessType = this.authService.hasPermission('business-type-view');
      this.initEditBusinesstypeForm();
      //

  }
  ngDoCheck(): void {

      this.getPaginationList();
      this.getDateColor();
  }
  // custom datepicker color

getDateColor(){
  let monthNameClr = document.getElementsByClassName('ngb-dp-month-name');
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
      if (!this.businessTypeList.length) {
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


      this.getBusinessTypeList();


  }

  /**
* @description initialize chnage password form
* @author Shine Dezign Infonet Pvt. Ltd.
*/
initBusinesstypeForm() {
      this.businessTypeForm = this.fb.group({
          name: ['', [
              Validators.required,
              Validators.pattern(Custom_Regex.spaces),
              Validators.pattern(Custom_Regex.username),
              Validators.pattern(Custom_Regex.name),
              Validators.minLength(3),
              Validators.maxLength(100)
          ]],
      })
  }
  /**
   * @description change passsword submit
   * @returns {Promise<void>}
   * @author Shine Dezign Infonet Pvt. Ltd.
   */
  async createLeadStatusSubmit(): Promise<any> {
      this.businessTypeForm.markAllAsTouched();
      if (this.businessTypeForm.valid) {
          //
          try {
              this.commonService.showSpinner();

              let data = {
                  ...this.businessTypeForm.value,

              }
              const res$ = this.apiService.postReq(API_PATH.CREATE_BUSINESS_TYPE, data, 'business', 'type-create');
              let response = await lastValueFrom(res$);
              if (response) {
                  this.commonService.showSuccess(response.message);
                  this.getBusinessTypeList();
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
      return this.businessTypeForm.controls;
  }

  /**
  * @description get users list eg company list if adminisrator is logged in
  */
  async getBusinessTypeList(): Promise<any> {
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
          const res$ = this.apiService.getReq(API_PATH.BUSINESS_TYPE_LIST + url, 'business', 'type-list');
          let response = await lastValueFrom(res$);
          if (response && response.data) {
              if (response.data.data) {
                  this.hasMoreUsers = response.data.hasMorePages;
                  this.totalUsersCount = response.data.total;
                  this.businessTypeList = response.data.data;
                  this.businessTypeList.forEach(object => { object.toggle = false })
                  for (let i = 0; i < this.businessTypeList.length; i++) {
                      if (this.businessTypeList[i].status == 'Active') {
                          this.businessTypeList[i].toggle = true;
                      } else {
                          this.businessTypeList[i].toggle = false;
                      }
                  }
              } else {
                  this.businessTypeList = [];
              }

          } else {
              this.businessTypeList = [];
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
      this.getBusinessTypeList();
  }

  /**
* @description on page change
* @returns {void}
* @param p 
*/
  onUserPageChange(p: number): void {
      this.userListPage = p;
      this.getBusinessTypeList();
  }
  openModal(templateRef: TemplateRef<any>) {
    // this.closeTriggerModal();
    // this.emailTemplateId = id
    try {
        this.modal = this.modalService.open(templateRef, { backdrop: 'static', size: 'md' });
        this.initBusinesstypeForm();
    } catch (error: any) {
        this.commonService.showError(error.message);
    }
}
  async deleteLeadStatus(user: any) {

      try {
          let url = `?id=${user.id}`;
          this.commonService.showSpinner();
          const res$ = this.apiService.getReq(API_PATH.DELETE_BUSINESS_TYPE + url, 'business', 'type-delete');
          let response = await lastValueFrom(res$);
          if (response && response.status_code == "200") {
              this.commonService.showSuccess(response.message);
              let obj = this.businessTypeList.filter(e => e.id == user.id);
              this.totalUsersCount = this.totalUsersCount - 1
              obj[0].status = "Inactive"
              obj[0].toggle = false;
              this.getBusinessTypeList();
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
              this.getBusinessTypeList();
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
      this.getBusinessTypeList();
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
      this.getBusinessTypeList();
  }

  onStatusToggleChange(e: any, input: any, user: any, i: number) {
      this.commonService.showSpinner();
      let status = "1";
      this.businessTypeList[i].toggle = true;
      if (!e.target.checked) {
          status = "0";
          this.businessTypeList[i].toggle = false;
      }
      this.updateStatus(status, user, input, i);
  }

  async updateStatus(status: string, user: any, input: any, i: number) {
      try {
          const res$ = this.apiService.postReq(API_PATH.UPDATE_STATUS_BUSINESS_TYPE, { name: user.name, id: user.id, status: status }, 'business', 'type-update');
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
              this.businessTypeList[i].toggle = false
          } else {
              input.checked = true;
              this.businessTypeList[i].toggle = true
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
      this.getBusinessTypeList();
  }

  editLeadModal(templateRef: TemplateRef<any>,user:any, value: any) {
    if(value == 'edit'){
      this.editbusinessType = true;
    }else{
      this.editbusinessType = false;
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

  initEditBusinesstypeForm() {
      this.EditbusinessTypeForm = this.fb.group({
        name: ['', [
          Validators.required,
          Validators.pattern(Custom_Regex.spaces),
          Validators.pattern(Custom_Regex.username),
          Validators.pattern(Custom_Regex.name),
          Validators.minLength(3),
          Validators.maxLength(100)
      ]],
      })
  }
  async updateLeadStatus(): Promise<any> {
      this.EditbusinessTypeForm.markAllAsTouched();
      if (this.EditbusinessTypeForm.valid) {
          //
          try {
              this.commonService.showSpinner();

              let data = {
                  ...this.EditbusinessTypeForm.value,
                //   exclusive_time: this.EditleadSouceForm.value.exclusive_time,
                  id: this.leadSourceID

              }
              const res$ = this.apiService.postReq(API_PATH.UPDATE_BUSINESS_TYPE, data, 'business', 'type-update');
              let response = await lastValueFrom(res$);
              if (response) {
                  this.commonService.showSuccess(response.message);
                  this.modal.close
                  this.getBusinessTypeList();
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
      return this.EditbusinessTypeForm.controls;
  }

  patchValue(user: any) {
      this.EditbusinessTypeForm.get('name')?.patchValue(user.name);
      this.leadSourceID = user.id;
  }

}
