import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { API_PATH } from '@constants/api-end-points';
import { Custom_Regex, Mask } from '@constants/constants';
import { ApiService } from '@services/api.service';
import { CommonService } from '@services/common.service';
import { lastValueFrom, Subscription } from 'rxjs';
import Swal from 'sweetalert2';
import Inputmask from 'inputmask';
import moment from 'moment';
import { AuthService } from '@services/auth.service';
@Component({
  selector: 'app-create-agent',
  templateUrl: './create-agent.component.html',
  styleUrls: ['./create-agent.component.scss']
})
export class CreateAgentComponent implements OnInit {

  addAgentForm!: FormGroup;
    countriesList: Array<any> = [];
    statesList: Array<any> = [];
    rolesList: Array<any> = [];
    todayDate: string = '';
    passwordType: boolean = true;
    mask = Mask;
    userAlreadyExists: boolean = false;
    userExistvalue: number = 0;
    timezonesList: Array<any> = [];
    dateFormatList: Array<any> = [];
    role:string ='Agent'

    @ViewChild('dob', ) DOB!: ElementRef;
    colorSubs!: Subscription;
    style!: { fill: string; };
    background!: { background: string; };

    constructor(
        private fb: FormBuilder,
        private apiService: ApiService,
        private commonService: CommonService,
        private router: Router,
        private el: ElementRef,
        private authService :AuthService
    ) { }

    ngOnInit(): void {
        let d = new Date();
        let day: any = d.getDate();
        if(day.toString().length < 2) {
         day = '0'+ day;
              }
         this.todayDate = `${((d.getMonth()+"1")).slice(-2)}-${day}-${d.getFullYear()}`
        // this.todayDate = `${d.getMonth() + 1}-${day}-${d.getFullYear()}`
        this.initAddAgentForm();
        this.getCountries();
        this.getTimeZones();
        this.getDateFormat();
        this.getRolesList();
        this.getUserDetails();
    }
    getUserDetails(): void {
        try {
            let ud = this.authService.getUserDetails();
            if (ud) {
                this.getColorOnUpdate();
                this.style={fill:ud?.color};
                // this.color=ud?.color;
                    // this.stroke={stroke:ud?.color};
                    this.background={background:ud?.color};

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
    getDate(date: any, dateFormat: string){
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
                let i = this.countriesList.findIndex((e) => e.name === "United States");
                if (i > -1) {
                    this.addAgentForm.get('country_id')?.patchValue(this.countriesList[i].id);
                    this.getStates(this.countriesList[i].id);
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
     * @description get form controls
     * @author Shine Dezign Infonet Pvt. Ltd.
     */
    get f(): { [key: string]: AbstractControl } {
        return this.addAgentForm.controls;
    }

    /**
     * @description get states list
     * @param country_id 
     * @author Shine Dezign Infonet Pvt. Ltd.
     */
    async getStates(country_id: string) {
        try {
            this.commonService.showSpinner();
            const res$ = this.apiService.postReq(API_PATH.STATES, { country_id: country_id }, '', '');
            let response = await lastValueFrom(res$);
            if (response && response.data) {
                this.statesList = response.data;
                this.addAgentForm.patchValue({ state_id: "" });
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
     * @description initialize add compnay form
     * @author Shine Dezign Infonet Pvt. Ltd.
     * @returns {void}
     */
    initAddAgentForm(): void {
        this.addAgentForm = this.fb.group({
            first_name: ['', [Validators.required, Validators.pattern(Custom_Regex.spaces), Validators.pattern(Custom_Regex.lettersOnly), Validators.maxLength(100), Validators.minLength(3),]],
            last_name: ['', [Validators.required, Validators.pattern(Custom_Regex.spaces), Validators.pattern(Custom_Regex.lettersOnly), Validators.maxLength(100), Validators.minLength(3),]],
            email: ['', [Validators.required, Validators.pattern(Custom_Regex.spaces),Validators.pattern(Custom_Regex.email),]],
            phone_number: ['', [ Validators.pattern(Custom_Regex.digitsOnly)]],
            status: [1, [Validators.required]],
            // password: ['', [Validators.required, Validators.pattern(Custom_Regex.password), Validators.maxLength(16)]],
            // dob: [null],
            // role: ['', [Validators.required]],
            // address: ['', [Validators.pattern(Custom_Regex.address), Validators.pattern(Custom_Regex.address2), Validators.maxLength(200), Validators.minLength(3),]],
            // city: ['', [
            //     Validators.pattern(Custom_Regex.spaces), 
            //     Validators.pattern(Custom_Regex.city), 
            //     Validators.pattern(Custom_Regex.name),
            //     Validators.maxLength(100),
            //     Validators.minLength(3),
            // ]],
            // state_id: [''],
            // country_id: ['', [Validators.required]],
            // fax: ['', [Validators.pattern(Custom_Regex.digitsOnly)]],
            // zip_code: ['', [Validators.pattern(Custom_Regex.digitsOnly)]],
            // time_zone_id: [''],
            // date_format_id: [''],
            // sip_extension: ['', [Validators.required, Validators.pattern(Custom_Regex.digitsOnly)]],
            // sip_password: ['', [Validators.pattern(Custom_Regex.spaces)]],
            // auto_commission: [false],
        })
    }
    async getTimeZones() {
        try {
            this.commonService.showSpinner();
            const res$ = this.apiService.getReq(API_PATH.GET_TIMEZONES, '', '');
            let response = await lastValueFrom(res$);
            if (response && response.data) {
                this.timezonesList = response.data;
                this.addAgentForm.patchValue({time_zone_id: this.timezonesList[0].id})

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
                this.addAgentForm.patchValue({date_format_id: this.dateFormatList[0].id})

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
     * @description get states on country change
     * @param countryId 
     * @author Shine Dezign Infonet Pvt. Ltd.
     * @returns {void}
     */
    onCountryChange(countryId: any): void {
        this.getStates(countryId);
    }
    openrestoreUserpopup() {
        Swal.fire({
            title: 'User already exists in trash',
            text: 'Do you want to restore this user!',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Yes, restore it!',
            confirmButtonColor: "#f0412e",
            cancelButtonText: 'Cancel'
        }).then((result) => {
            if (result.value) {
              this.userExistvalue = 1
                // this.addUserSubmit();
                this.addAgentSubmit();

            } else if (result.dismiss === Swal.DismissReason.cancel) {
                Swal.close();
                this.userExistvalue = 0
            }
        })

    }

    /**
     * @description on add company submit
     * @author Shine Dezign Infonet Pvt. Ltd.
     * @returns { Promise<void> }
     */
    async addAgentSubmit(): Promise<void> {
        this.addAgentForm.markAllAsTouched();
        if (this.addAgentForm.valid) {
            try {
                this.commonService.showSpinner();
                if (this.addAgentForm.value.dob && !Custom_Regex.date.test(this.addAgentForm.value.dob)) {
                    this.commonService.showError('Invalid date of birth.');
                    this.commonService.hideSpinner();
                    return;
                }
                let data = {
                    ...this.addAgentForm.value,
                    role:this.role,
                    // dob: this.addAgentForm.value.dob ? this.addAgentForm.value.dob: "",
                    // user_already_exist_in_trash: this.userExistvalue,
                    // auto_commission: this.addAgentForm.value.auto_commission === true ? 1 : 0,
                }
                const res$ = this.apiService.postReq(API_PATH.CREATE_AGENT, data, 'user', 'create');
                let response = await lastValueFrom(res$);
                if (response) {
                    if (response.data.user_already_exist_in_trash == 1) {
                        this.userAlreadyExists = true
                        this.openrestoreUserpopup();

                    } else {
                        this.commonService.showSuccess(response.message);
                        this.router.navigate(['/company/agent']);
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

        } else {
            this.focusInvalidField();
        }
    }

    /**
     * @description focus first invalid field
     */
    focusInvalidField() {
        const firstInvalidControl: HTMLElement = this.el.nativeElement.querySelector(
            ".form-group .ng-invalid"
        );
        if (firstInvalidControl)
            firstInvalidControl.focus();
    }
    get currentDate() {
        return new Date();
    }
}
