import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { API_PATH } from '@constants/api-end-points';
import { Custom_Regex, Mask } from '@constants/constants';
import { ApiService } from '@services/api.service';
import { CommonService } from '@services/common.service';
import moment from 'moment';
import * as Constants from '@constants/constants';
import { lastValueFrom, Subscription } from 'rxjs';
import { AuthService } from '@services/auth.service';

@Component({
  selector: 'app-view-edit-agent',
  templateUrl: './view-edit-agent.component.html',
  styleUrls: ['./view-edit-agent.component.scss']
})
export class ViewEditAgentComponent implements OnInit {
  roles = Constants.Roles;
  editMode: boolean = false;
  addUserForm!: FormGroup;
  countriesList: Array<any> = [];
  statesList: Array<any> = [];
  rolesList: Array<any> = [];
  todayDate: string = '';
  AgentID: string = '';
  userDetails: any = {};
  mask = Mask;
  timezonesList: Array<any> = [];
  dateFormatList: Array<any> = [];
  @ViewChild('dob',) DOB!: ElementRef;
  existingEmail: string = '';
  passwordEmailType: boolean = true;
  showPasswordRequired: boolean = false;
  userRole: string = '';
    colorSubs!:Subscription;
    background!: { background: string; };
    style!: { fill: string; };

  constructor(
      private fb: FormBuilder,
      private apiService: ApiService,
      private commonService: CommonService,
      private router: Router,
      private route: ActivatedRoute,
      private authService: AuthService
  ) { }

  ngOnInit(): void {
      let d = new Date();
      let day: any = d.getDate();
      if (day.toString().length < 2) {
          day = '0' + day;
      }
      this.todayDate = `${((d.getMonth()+"1")).slice(-2)}-${day}-${d.getFullYear()}`
    //   this.todayDate = `${d.getMonth() + 1}-${day}-${d.getFullYear()}`
      this.initAddUserForm();
      let params = this.route.snapshot.params;
      let query = this.route.snapshot.queryParams;
      this.LoginUserDetails();
      if (params['id']) {
          this.AgentID = params['id'];
          this.getUserDetails();
      }
      if (query['mode'] && query['mode'] === 'edit') {
          this.editMode = true;
      }
  }



  ngAfterViewInit(): void {
      if (this.DOB) {
          Inputmask('datetime', {
              inputFormat: 'mm-dd-yyyy',
              placeholder: 'mm-dd-yyyy',
              alias: 'datetime',
              min: '01-01-1920',
              max: this.todayDate,
              clearMaskOnLostFocus: false,
          }).mask(this.DOB.nativeElement);
      }
  }
  getDate(date: any, dateFormat: string) {
      return moment(date).format(`${dateFormat}`)
  }

  /**
   * @description get Roles list
   * @author Shine Dezign Infonet Pvt. Ltd.
   * @returns { Promise<any> }
   */
  async getRolesList(): Promise<any> {
      try {
          this.commonService.showSpinner();
          const res$ = this.apiService.getReq(API_PATH.ROLES_LIST, 'role', 'list');
          let response = await lastValueFrom(res$);
          if (response && response.data) {
              this.rolesList = response.data;
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
   * @description get countries list
   * @author Shine Dezign Infonet Pvt. Ltd.
   */
  async getCountries() {
      try {
          this.commonService.showSpinner();
          const res$ = this.apiService.getReq(API_PATH.COUNTRIES_LIST, '', '');
          let response = await lastValueFrom(res$);
          if (response && response.data) {
              this.countriesList = response.data;
              if (this.userDetails.country_id) {
                  this.addUserForm.patchValue({ country_id: this.userDetails.country_id });
                  this.getStates(this.userDetails.country_id, true);
              } else {
                  let i = this.countriesList.findIndex((e) => e.name === "United States");
                  if (i > -1) {
                      this.addUserForm.get('country_id')?.patchValue(this.countriesList[i].id);
                      this.userDetails.country_id = this.countriesList[i].id;
                      this.getStates(this.countriesList[i].id, false);
                  }
              }
              this.patchValues();
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
   * @description get form controls
   * @author Shine Dezign Infonet Pvt. Ltd.
   */
  get f(): { [key: string]: AbstractControl } {
      return this.addUserForm.controls;
  }
  async getTimeZones() {
      try {
          this.commonService.showSpinner();
          const res$ = this.apiService.getReq(API_PATH.GET_TIMEZONES, '', '');
          let response = await lastValueFrom(res$);
          if (response && response.data) {
              this.timezonesList = response.data;

          }
      } catch (error: any) {
          this.commonService.hideSpinner();
          if (error.error && error.error.message) {
              this.commonService.showError(error.error.message);
          } else {
              this.commonService.showError(error.message);
          }
      }
  }
  async getDateFormat() {
      try {
          this.commonService.showSpinner();
          const res$ = this.apiService.getReq(API_PATH.GET_DATE_FORMAT, '', '');
          let response = await lastValueFrom(res$);
          if (response && response.data) {
              this.dateFormatList = response.data;

          }
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
   * @description get states list
   * @param country_id 
   * @author Shine Dezign Infonet Pvt. Ltd.
   */
  async getStates(country_id: string, patchValue: boolean) {
      try {
          this.commonService.showSpinner();
          const res$ = this.apiService.postReq(API_PATH.STATES, { country_id: country_id }, '', '');
          let response = await lastValueFrom(res$);
          if (response && response.data) {
              this.statesList = response.data;
              if (patchValue) {
                  this.addUserForm.patchValue({ state_id: this.userDetails.state_id });
              } else {
                  this.addUserForm.patchValue({ state_id: "" });
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
  changeEmail(value: any) {
      if (this.addUserForm.value.email != this.existingEmail) {
          this.showPasswordRequired = true;
          this.addUserForm.get('password')?.setValidators([Validators.required, Validators.pattern(Custom_Regex.password)]);
          this.addUserForm.get('password')?.updateValueAndValidity();
      }

  }
  /**
   * @description initialize add compnay form
   * @author Shine Dezign Infonet Pvt. Ltd.
   * @returns {void}
   */
  initAddUserForm(): void {
      this.addUserForm = this.fb.group({
          first_name: ['', [Validators.required, Validators.pattern(Custom_Regex.spaces), Validators.pattern(Custom_Regex.lettersOnly), Validators.maxLength(100), Validators.minLength(3)]],
          last_name: ['', [Validators.required, Validators.pattern(Custom_Regex.spaces), Validators.pattern(Custom_Regex.lettersOnly), Validators.maxLength(100), Validators.minLength(3)]],
          email: ['', [Validators.required, Validators.pattern(Custom_Regex.email)]],
          phone_number: ['', [ Validators.pattern(Custom_Regex.digitsOnly)]],
          status: [1, [Validators.required]],
          // dob: [null],
          // , [Validators.required, Validators.pattern(Custom_Regex.password)]
          // password: [''],
          // address: ['', [Validators.pattern(Custom_Regex.address), Validators.pattern(Custom_Regex.address2), Validators.maxLength(200), Validators.minLength(3)]],
          // city: ['', [Validators.pattern(Custom_Regex.spaces), Validators.pattern(Custom_Regex.city), Validators.maxLength(100), Validators.minLength(3)]],
          // state_id: [''],
          // country_id: ['', [Validators.required]],
          // fax: ['', [Validators.pattern(Custom_Regex.digitsOnly)]],
          // zip_code: ['', [Validators.pattern(Custom_Regex.digitsOnly)]],
          // time_zone_id: [''],
          // date_format_id: [''],
          // auto_commission: [0],
          // sip_extension: ['', [Validators.required, Validators.pattern(Custom_Regex.digitsOnly)]],
          // sip_password: ['', [Validators.pattern(Custom_Regex.spaces)]],
          // role: ['', [Validators.required]],
      })
  }

  /**
   * @description get states on country change
   * @param countryId 
   * @author Shine Dezign Infonet Pvt. Ltd.
   * @returns {void}
   */
  onCountryChange(countryId: any): void {
      this.getStates(countryId, false);
  }

  /**
   * @description on add company submit
   * @author Shine Dezign Infonet Pvt. Ltd.
   * @returns { Promise<void> }
   */
  async addUserSubmit(): Promise<void> {
      this.addUserForm.markAllAsTouched();
      if (this.addUserForm.valid) {
          try {
              this.commonService.showSpinner();
              if (this.addUserForm.value.dob && !Custom_Regex.date.test(this.addUserForm.value.dob)) {
                  this.commonService.showError('Invalid date of birth.');
                  this.commonService.hideSpinner();
                  return;
              }
              let data = {
                  ...this.addUserForm.value,
                  // dob: this.parserFormatter.format(this.addUserForm.value.dob)
              }
              const res$ = this.apiService.postReq(API_PATH.ADD_USER, data, 'user', 'create');
              let response = await lastValueFrom(res$);
              if (response) {
                  this.commonService.showSuccess(response.message);
                  this.router.navigate(['/company']);
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
 LoginUserDetails() {
      let ud = this.authService.getUserDetails();
      if (ud) {
          this.userRole = ud.role;
          this.getColorOnUpdate();
          this.style={fill:ud?.color};
          // this.color=ud?.color;
              // this.stroke={stroke:ud?.color};
              this.background={background:ud?.color};

      }
  }

  getColorOnUpdate() {
    this.colorSubs = this.authService.getColor().subscribe((u) => {
      this.getUserDetails();
    });
  }
  async getUserDetails() {
      try {
          this.commonService.showSpinner()
          const res$ = this.apiService.getReq(API_PATH.AGENT_VIEW + `?agent_id=${this.AgentID}`, 'user', 'list');
          let response = await lastValueFrom(res$);
          this.getRolesList();
          if (response) {
              this.userDetails = response.data;
            //   console.log('this->data',this.userDetails);
              
              this.existingEmail = this.userDetails.email
              this.getCountries();
              this.getTimeZones();
              this.getDateFormat();

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
  patchValues() {
      this.addUserForm.patchValue({
          first_name: this.userDetails.first_name,
          last_name: this.userDetails.last_name,
          phone_number: this.userDetails.phone_number,
          email: this.userDetails.email,
          address: this.userDetails.address,
          // password: this.userDetails.password,
          city: this.userDetails.city,
          state_id: this.userDetails.state_id,
          country_id: this.userDetails.country_id ? this.userDetails.country_id : '',
          status: this.userDetails.status === 1 ? 1 : 0,
          fax: this.userDetails.fax,
          zip_code: this.userDetails.zip_code,
          dob: this.userDetails.dob,
          time_zone_id: this.userDetails.time_zone_id,
          date_format_id: this.userDetails.date_format_id,
          auto_commission: this.userDetails.auto_commission,
          sip_extension: this.userDetails.sip_extension,
          sip_password: this.userDetails.sip_password,
          role: this.userDetails.role
      });
  }

  async editAgentSubmit() {
      if (this.addUserForm.value.email != this.existingEmail) {
          this.showPasswordRequired = true;
          this.addUserForm.get('password')?.setValidators([Validators.required, Validators.pattern(Custom_Regex.password)]);
          this.addUserForm.get('password')?.updateValueAndValidity();
          this.addUserForm.markAllAsTouched();
      }
      this.addUserForm.markAllAsTouched();
      if (this.addUserForm.valid) {
          try {
              this.commonService.showSpinner();
              // if (this.addUserForm.value.dob && !Custom_Regex.date.test(this.addUserForm.value.dob)) {
              //     this.commonService.showError('Invalid date of birth.');
              //     this.commonService.hideSpinner();
              //     return;
              // }
              let data = {
                  ...this.addUserForm.value,
                  agent_id: this.AgentID,
                  // dob: this.addUserForm.value.dob ? this.addUserForm.value.dob : "",
                  // auto_commission: this.addUserForm.value.auto_commission === true ? 1 : 0,
              }
              const res$ = this.apiService.postReq(API_PATH.AGENT_UPDATE, data, 'user', 'edit');
              let response = await lastValueFrom(res$);
              if (response) {
                  this.commonService.showSuccess(response.message);
                  this.router.navigate(['/company/agent']);
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
  get currentDate() {
      return new Date();
  }
}
