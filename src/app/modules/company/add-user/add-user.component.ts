import { Component, ElementRef, Inject, Input, OnInit, ViewChild } from '@angular/core';
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
import { GooglePlaceDirective } from 'ngx-google-places-autocomplete';
import { MapsAPILoader } from '@agm/core';
import { Address } from 'ngx-google-places-autocomplete/objects/address';
import { DOCUMENT } from '@angular/common';
export let placeAddresCompoponent = {
    ZIP_CODE: 'postal_code',
    COUNTRY: 'country',
    STATE: 'administrative_area_level_1',
    // CITY: 'administrative_area_level_2',
    CITY: 'locality',
    TOWN: 'sublocality_level_1',
    AREA: 'sublocality_level_2',
    NEAREST_ROAD: 'route'
}

@Component({
    selector: 'app-add-user',
    templateUrl: './add-user.component.html',
    styleUrls: ['./add-user.component.scss']
})
export class AddUserComponent implements OnInit {

    addUserForm!: FormGroup;
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
    isApiLoaded = false;
    @Input() options: Object = {};
    @ViewChild("placesRef") placesRef!: GooglePlaceDirective;
    stateId: string = ''
    countryIndex!: number

    @ViewChild('dob',) DOB!: ElementRef;
    style!: { fill: string; };
    background!: { background: string; };
    colorSubs!: Subscription;
    customerAlreadyExists: boolean = false;
    customerExistvalue: number = 0;
    customerEmail: string = '';
    customeruserRole: string = '';
    boolCondition: boolean = false;
    color!: string;
    userType: string = ''
    constructor(
        private fb: FormBuilder,
        private apiService: ApiService,
        private commonService: CommonService,
        private router: Router,
        private el: ElementRef,
        private authService: AuthService,
        private mapsAPILoader: MapsAPILoader,
        @Inject(DOCUMENT) private document: Document,
        private elementRef: ElementRef



    ) { }

    ngOnInit(): void {
        let d = new Date();
        let day: any = d.getDate();
        if (day.toString().length < 2) {
            day = '0' + day;
        }
        this.todayDate = `${((d.getMonth() + "1")).slice(-2)}-${day}-${d.getFullYear()}`
        // this.todayDate = `${d.getMonth() + 1}-${day}-${d.getFullYear()}`
        this.initAddUserForm();
        this.getCountries();
        this.getTimeZones();
        this.getDateFormat();
        this.getRolesList();
        this.getUserDetails();
        this.options = {
            types: ['hospital', 'pharmacy', 'bakery', 'country', 'places'],
            componentRestrictions: { country: 'IN' }
        }
        this.mapsAPILoader.load().then(() => {
            this.isApiLoaded = true
        })
    }
    getUserDetails(): void {
        try {
            let ud = this.authService.getUserDetails();
            if (ud) {
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
        //
        if (this.placesRef?.options) {
            this.placesRef.options.componentRestrictions = { country: 'SG' }
            this.placesRef.options.fields = ["formatted_address", "geometry", "place_id"]
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
            const res$ = this.apiService.getReq(API_PATH.ROLES_LIST, 'user', 'list');
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
                    this.addUserForm.get('country_id')?.patchValue(this.countriesList[i].id);
                    this.getStates(this.countriesList[i].id, '');
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
        return this.addUserForm.controls;
    }

    /**
     * @description get states list
     * @param country_id 
     * @author Shine Dezign Infonet Pvt. Ltd.
     */
    async getStates(country_id: string, value: any) {
        try {
            this.commonService.showSpinner();
            const res$ = this.apiService.postReq(API_PATH.STATES, { country_id: country_id }, '', '');
            let response = await lastValueFrom(res$);
            if (response && response.data) {
                this.statesList = response.data;
                // this.addUserForm.patchValue({ state_id: "" });
                if (value == '') {
                    this.addUserForm.patchValue({ state_id: "" });
                } else {
                    setTimeout(() => {
                        let i = this.statesList.findIndex((e: any) => e.name == value);
                        if (i > -1) {
                            this.stateId = this.statesList[i].id
                            this.addUserForm.patchValue({ state_id: this.stateId });

                        }
                    })
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
     * @description initialize add compnay form
     * @author Shine Dezign Infonet Pvt. Ltd.
     * @returns {void}
     */
    initAddUserForm(): void {
        this.addUserForm = this.fb.group({
            first_name: ['', [Validators.required, Validators.pattern(Custom_Regex.spaces), Validators.pattern(Custom_Regex.lettersOnly), Validators.maxLength(100), Validators.minLength(3),]],
            last_name: ['', [Validators.required, Validators.pattern(Custom_Regex.spaces), Validators.pattern(Custom_Regex.lettersOnly), Validators.maxLength(100), Validators.minLength(3),]],
            password: ['', [Validators.required, Validators.pattern(Custom_Regex.password), Validators.maxLength(16)]],
            email: ['', [Validators.required, Validators.pattern(Custom_Regex.spaces), Validators.pattern(Custom_Regex.email),]],
            dob: [null],
            role: ['', [Validators.required]],
            phone_number: ['', [Validators.required, Validators.pattern(Custom_Regex.digitsOnly)]],
            address: ['', [
                Validators.pattern(Custom_Regex.spaces),
                // Validators.pattern(Custom_Regex.address2),
                Validators.maxLength(200),
                //   Validators.minLength(3),
            ]],
            city: ['', [
                Validators.pattern(Custom_Regex.spaces),
                // Validators.pattern(Custom_Regex.city), 
                // Validators.pattern(Custom_Regex.name),
                Validators.maxLength(100),
                // Validators.minLength(3),
            ]],
            state_id: [''],
            country_id: ['', [Validators.required]],
            status: [1, [Validators.required]],
            fax: ['', [Validators.pattern(Custom_Regex.digitsOnly)]],
            zip_code: [''],
            // zip_code: ['', [Validators.pattern(Custom_Regex.digitsOnly)]],
            time_zone_id: [''],
            date_format_id: [''],
            // Validators.required, 
            sip_extension: ['', [Validators.pattern(Custom_Regex.digitsOnly)]],
            sms_extension: ['', [Validators.pattern(Custom_Regex.digitsOnly)]],
            sip_password: ['', [Validators.pattern(Custom_Regex.spaces)]],
            auto_commission: [false],
        })
        if (this.addUserForm.value.auto_commission == true) {
            this.boolCondition = true;
        } else {
            this.boolCondition = false;
        }
    }
    async getTimeZones() {
        try {
            this.commonService.showSpinner();
            const res$ = this.apiService.getReq(API_PATH.GET_TIMEZONES, '', '');
            let response = await lastValueFrom(res$);
            if (response && response.data) {
                this.timezonesList = response.data;
                this.addUserForm.patchValue({ time_zone_id: this.timezonesList[0].id })

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
                this.addUserForm.patchValue({ date_format_id: this.dateFormatList[0].id })

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
        this.getStates(countryId, '');
    }
    openrestoreUserpopup() {
        let title = this.userType == 'Customer' ? 'Lead' : 'User'
        let text = this.userType == 'Customer' ? 'lead!' : 'user!'
        Swal.fire({
            title: title + ' already exists in trash',
            // text: 'Do you want to restore this user!',
            text: 'Do you want to restore this ' + text,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Yes, restore it!',
            confirmButtonColor: "#f0412e",
            cancelButtonText: 'Cancel'
        }).then((result) => {
            if (result.value) {
                this.userExistvalue = 1
                this.addUserSubmit();

            } else if (result.dismiss === Swal.DismissReason.cancel) {
                Swal.close();
                this.userExistvalue = 0
            }
        })

    }
    openrestoreCustomerCompanypopup() {
        let title = ''
        if (this.customeruserRole == 'Customer') {
            title = 'You have already created lead with this ' + this.customerEmail
        } else {
            title = 'You have already created a role of ' + this.customeruserRole
        }
        Swal.fire({
            title: title,
            text: 'Do you sure want to proceed!',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Yes',
            confirmButtonColor: "#f0412e",
            cancelButtonText: 'Cancel'
        }).then((result) => {
            if (result.value) {
                this.openforcefullyCreatedCompanypopup();
            } else if (result.dismiss === Swal.DismissReason.cancel) {
                Swal.close();
            }
        })

    }
    openforcefullyCreatedCompanypopup() {
        let title = ''
        if (this.customeruserRole == 'Customer') {
            title = 'Are you sure to forcefully deletes the existing lead & created a new user'
        } else {
            title = 'Are you sure to forcefully deletes the existing user & created a new user'
        }
        Swal.fire({
            title: title,
            text: 'Do you sure want to proceed!',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Yes',
            confirmButtonColor: "#f0412e",
            cancelButtonText: 'Cancel'
        }).then((result) => {
            if (result.value) {
                this.customerExistvalue = 1
                this.addUserSubmit();

            } else if (result.dismiss === Swal.DismissReason.cancel) {
                Swal.close();
                this.customerExistvalue = 0
            }
        })

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
                    dob: this.addUserForm.value.dob ? this.addUserForm.value.dob : "",
                    user_already_exist_in_trash: this.userExistvalue,
                    auto_commission: this.addUserForm.value.auto_commission === true ? 1 : 0,
                    already: this.customerExistvalue
                }
                const res$ = this.apiService.postReq(API_PATH.ADD_USER, data, 'user', 'create');
                let response = await lastValueFrom(res$);
                if (response) {
                    if (response.data.user_already_exist_in_trash == 1) {
                        this.userType = response.data.user_type
                        this.userAlreadyExists = true
                        this.openrestoreUserpopup();

                    } else if (response.data.already == 1) {
                        this.customerAlreadyExists = true;
                        this.customerEmail = response.data.email;
                        this.customeruserRole = response.data.role;
                        this.openrestoreCustomerCompanypopup();

                    } else {
                        this.commonService.showSuccess(response.message);
                        // this.router.navigate(['/company/user']);
                        this.router.navigate([`/${this.userBaseRoute}/user`]);
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
    //
    loadScript() {
        return new Promise((resolve, reject) => {
            const element = this.document.createElement('script');
            element.type = 'text/javascript';
            element.src = 'https://maps.googleapis.com/maps/api/js?key=AIzaSyAVi72zWS5TE912KQJO-hqDY-X-W7H_8R0&libraries=places&language=en';
            element.onload = resolve;
            element.onerror = reject;
            this.elementRef.nativeElement.appendChild(element);
        })
    }
    handleAddressChange(address: Address) {
        this.getAddressComponent(address.address_components, placeAddresCompoponent.ZIP_CODE)
        this.getAddressComponent(address.address_components, placeAddresCompoponent.COUNTRY)
        this.getAddressComponent(address.address_components, placeAddresCompoponent.CITY)
        this.getAddressComponent(address.address_components, placeAddresCompoponent.STATE)
        this.addUserForm.patchValue({
            address: address.name
        })
        // console.log("add",address.formatted_address)
        // console.log("lat",address.geometry.location.lat())
        // console.log(address.geometry.location.lng())
    }
    getAddressComponent(address_components: any, key: any) {
        var value = '';
        var shortvalue = '';
        var postalCodeType = address_components.filter((aComp: { types: any[]; }) =>
            aComp.types.some((typesItem: any) => typesItem === key))
        if (postalCodeType != null && postalCodeType?.length > 0)
            value = postalCodeType[0].long_name,
                shortvalue = postalCodeType[0].short_name;
        if (key == 'postal_code') {
            this.addUserForm.patchValue({
                zip_code: value
            })
        } else if (key == 'country') {
            let i = this.countriesList.findIndex((e) => e.short_code === shortvalue);
            if (i > -1) {
                this.addUserForm.get('country_id')?.patchValue(this.countriesList[i].id);
                this.countryIndex = i
            }
        } else if (key == 'administrative_area_level_1') {
            this.getStates(this.countriesList[this.countryIndex].id, value);

        } else if (key == 'locality') {
            this.addUserForm.patchValue({
                city: value
            })
        }
        //  else if (key == 'administrative_area_level_2') {
        //     this.addUserForm.patchValue({
        //         city: value
        //     })
        // }
        return value;
    }
    //
    getCheckBox(e: any) {
        let data = this.addUserForm.value.auto_commission;
        if (data == true) {
            this.boolCondition = true;
        } else {
            this.boolCondition = false;
        }
    }
    get userBaseRoute() {
        return this.authService.getUserRole().toLowerCase();
    }
}
