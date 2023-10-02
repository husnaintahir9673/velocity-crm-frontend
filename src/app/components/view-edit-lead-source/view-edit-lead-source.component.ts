import { Component, ElementRef, Inject, Input, OnInit, ViewChild } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { API_PATH } from '@constants/api-end-points';
import { Custom_Regex, Mask } from '@constants/constants';
import { ApiService } from '@services/api.service';
import { CommonService } from '@services/common.service';
import { lastValueFrom, Subscription } from 'rxjs';
import Inputmask from 'inputmask';
import moment from 'moment';
import { AuthService } from '@services/auth.service';
import { Address } from 'ngx-google-places-autocomplete/objects/address';
import { MapsAPILoader } from '@agm/core';
import { DOCUMENT } from '@angular/common';
import { GooglePlaceDirective } from 'ngx-google-places-autocomplete';
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
    selector: 'app-view-edit-lead-source',
    templateUrl: './view-edit-lead-source.component.html',
    styleUrls: ['./view-edit-lead-source.component.scss']
})
export class ViewEditLeadSourceComponent implements OnInit {
    leadSouceForm!: FormGroup;
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
    @ViewChild('dob',) DOB!: ElementRef;
    colorSubs!: Subscription;
    style!: { fill: string; };
    background!: { background: string; };
    isApiLoaded = false;
    @ViewChild("placesRef") placesRef!: GooglePlaceDirective;
    @Input() options: Object = {};
    countryIndex!: number;
    stateId: string = '';
    editMode: boolean = false;
    leadSourceId: string = '';
    leadSourceDetails: any = {}

    constructor(
        private fb: FormBuilder,
        private apiService: ApiService,
        private commonService: CommonService,
        private router: Router,
        private el: ElementRef,
        private authService: AuthService,
        private mapsAPILoader: MapsAPILoader,
        @Inject(DOCUMENT) private document: Document,
        private elementRef: ElementRef,
        private route: ActivatedRoute
    ) { }

    ngOnInit(): void {
        let d = new Date();
        let day: any = d.getDate();
        if (day.toString().length < 2) {
            day = '0' + day;
        }
        this.todayDate = `${((d.getMonth() + "1")).slice(-2)}-${day}-${d.getFullYear()}`
        let params = this.route.snapshot.params;
        let query = this.route.snapshot.queryParams;
        if (params['id'] || params['leadid']) {
            this.leadSourceId = params['id'];
         this.getLeadSourceDetails();

        }
        if (query['mode'] && query['mode'] === 'edit') {
            this.editMode = true;
        }
        // this.todayDate = `${d.getMonth() + 1}-${day}-${d.getFullYear()}`
        this.initleadSouceForm();
        this.getCountries();
        this.getTimeZones();
        // this.getRolesList();
        this.getUserDetails();
        this.options = {
            types: ['hospital', 'pharmacy', 'bakery', 'country', 'places'],
            componentRestrictions: { country: 'IN' }
        }
        this.mapsAPILoader.load().then(() => {
            this.isApiLoaded = true
        })
    }

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
        this.leadSouceForm.patchValue({
            address: address.name
        })
    }
    getAddressComponent(address_components: any, key: any) {
        var value = '';
        var shortvalue = '';
        var postalCodeType = address_components.filter((aComp: { types: any[]; }) =>
            aComp.types.some((typesItem: any) => typesItem === key))
        if (postalCodeType != null && postalCodeType.length > 0)
            value = postalCodeType[0].long_name,
                shortvalue = postalCodeType[0].short_name;
        if (key == 'postal_code') {
            this.leadSouceForm.patchValue({
                zip_code: value
            })

        } else if (key == 'country') {
            let i = this.countriesList.findIndex((e) => e.short_code === shortvalue);
            if (i > -1) {
                this.leadSouceForm.get('country_id')?.patchValue(this.countriesList[i].id);
                this.countryIndex = i

            }
        } else if (key == 'administrative_area_level_1') {
            this.getStates(this.countriesList[this.countryIndex].id, value);
        } else if (key == 'locality') {
            this.leadSouceForm.patchValue({
                city: value
            })
        }
        return value;
    }
    getUserDetails(): void {
        try {
            let ud = this.authService.getUserDetails();
            if (ud) {
                this.getColorOnUpdate();
                this.style = { fill: ud?.color };
                // this.color=ud?.color;
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
                let i = this.countriesList.findIndex((e) => e.name === "United States");
                if (i > -1) {
                    this.leadSouceForm.get('country_id')?.patchValue(this.countriesList[i].id);
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
        return this.leadSouceForm.controls;
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
                this.leadSouceForm.patchValue({ state_id: "" });
                if (value != '') {
                    setTimeout(() => {
                        let i = this.statesList.findIndex((e: any) => e.name == value);
                        if (i > -1) {
                            this.stateId = this.statesList[i].id;
                            this.leadSouceForm.patchValue({ state_id: this.stateId });

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
    initleadSouceForm(): void {
        this.leadSouceForm = this.fb.group({
            name: ['', [Validators.required, Validators.pattern(Custom_Regex.spaces)]],
            first_name: ['', [Validators.pattern(Custom_Regex.spaces), Validators.pattern(Custom_Regex.lettersOnly), Validators.maxLength(100), Validators.minLength(3),]],
            last_name: ['', [Validators.pattern(Custom_Regex.spaces), Validators.pattern(Custom_Regex.lettersOnly), Validators.maxLength(100), Validators.minLength(3),]],
            time_zone_id: [''],
            email: ['', [Validators.pattern(Custom_Regex.spaces), Validators.pattern(Custom_Regex.email),]],
            username: ['', [Validators.pattern(Custom_Regex.spaces), Validators.pattern(Custom_Regex.lettersOnly), Validators.maxLength(100), Validators.minLength(3),]],
            password: ['', [Validators.pattern(Custom_Regex.password), Validators.maxLength(16)]],
            phone_number: ['', [Validators.pattern(Custom_Regex.digitsOnly)]],
            role: [''],
            secondary_email: ['', [Validators.pattern(Custom_Regex.email)]],
            company_name: ['', [Validators.pattern(Custom_Regex.spaces), Validators.pattern(Custom_Regex.lettersOnly), Validators.maxLength(100), Validators.minLength(3),]],
            status: [1],
            account_name: ['', [
                Validators.pattern(Custom_Regex.spaces),
                Validators.pattern(Custom_Regex.city),
                Validators.minLength(3),
                Validators.maxLength(100)
            ]],
            account: ['', [
                Validators.pattern(Custom_Regex.spaces),
                Validators.pattern(Custom_Regex.city),
                Validators.maxLength(20),
                Validators.minLength(3),
            ]],
            routing: ['', [
                Validators.pattern(Custom_Regex.spaces),
                Validators.pattern(Custom_Regex.address),
                Validators.pattern(Custom_Regex.address2),
                Validators.maxLength(100)
            ]],
            bank: ['', [
                Validators.pattern(Custom_Regex.spaces),
                Validators.pattern(Custom_Regex.city),
                Validators.minLength(3),
                Validators.maxLength(100)
            ]],
            address: ['', [Validators.pattern(Custom_Regex.spaces)]],
            street: ['', [Validators.pattern(Custom_Regex.spaces)]],
            zip_code: [''],
            city: ['', [
                Validators.pattern(Custom_Regex.spaces)
            ]],
            country_id: [''],
            state_id: [''],
        })
    }
    async getTimeZones() {
        try {
            this.commonService.showSpinner();
            const res$ = this.apiService.getReq(API_PATH.GET_TIMEZONES, '', '');
            let response = await lastValueFrom(res$);
            if (response && response.data) {
                this.timezonesList = response.data;
                this.leadSouceForm.patchValue({ time_zone_id: this.timezonesList[0].id })

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
    get userBaseRoute() {
        return this.authService.getUserRole().toLowerCase();
    }
    async addLeadSourceSubmit(): Promise<any> {
        this.leadSouceForm.markAllAsTouched();
        if (this.leadSouceForm.valid) {
            //
            try {
                this.commonService.showSpinner();

                let data = {
                    ...this.leadSouceForm.value,

                }
                const res$ = this.apiService.postReq(API_PATH.CREATE_LEAD_SOURCE, data, 'lead', 'source-create');
                let response = await lastValueFrom(res$);
                if (response) {
                    this.commonService.showSuccess(response.message);
                    this.router.navigate([`/${this.userBaseRoute}/lead-source`]);
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
    cancel() {
        this.editMode = !this.editMode;
        this.patchValues();
    }
    edit() {
        this.editMode = !this.editMode;
    }
    async getLeadSourceDetails(): Promise<void> {
        try {
            let url = `?id=${this.leadSourceId}`;
            this.commonService.showSpinner();
            // let data = {
            //     id: this.leadSourceId
            // }
            const res$ = this.apiService.getReq(API_PATH.LEAD_SOURCE_VIEW + url, 'lead', 'source-update');
            let response = await lastValueFrom(res$);
            if (response && response.data) {
                this.leadSourceDetails = response.data;
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
    patchValues() {
        this.leadSouceForm.patchValue({
            name: this.leadSourceDetails.name,

    })
}
async UpdateLeadSourceSubmit(): Promise<any> {
    this.leadSouceForm.markAllAsTouched();
    if (this.leadSouceForm.valid) {
        //
        try {
            this.commonService.showSpinner();

            let data = {
                ...this.leadSouceForm.value,
                id: this.leadSourceId

            }
            const res$ = this.apiService.postReq(API_PATH.UPDATE_LEAD_SOURCE, data, 'lead', 'source-update');
            let response = await lastValueFrom(res$);
            if (response) {
                this.commonService.showSuccess(response.message);
                this.router.navigate([`/${this.userBaseRoute}/lead-source`]);
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

}

