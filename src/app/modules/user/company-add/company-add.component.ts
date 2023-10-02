import { MapsAPILoader } from '@agm/core';
import { DOCUMENT } from '@angular/common';
import { Component, ElementRef, Inject, Input, OnInit, ViewChild } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { API_PATH } from '@constants/api-end-points';
import { Custom_Regex, Mask } from '@constants/constants';
import { ApiService } from '@services/api.service';
import { AuthService } from '@services/auth.service';
import { CommonService } from '@services/common.service';
import moment from 'moment';
import { GooglePlaceDirective } from 'ngx-google-places-autocomplete';
import { Address } from 'ngx-google-places-autocomplete/objects/address';
import { lastValueFrom, Subscription } from 'rxjs';
import Swal from 'sweetalert2';
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
    selector: 'app-company-add',
    templateUrl: './company-add.component.html',
    styleUrls: ['./company-add.component.scss']
})
export class CompanyAddComponent implements OnInit {

    addCompanyForm!: FormGroup | any;
    countriesList: Array<any> = [];
    statesList: Array<any> = [];
    filePath: string = '';
    selectedFile: File | any;
    fileSelected: boolean = false;
    imageSelected: boolean = false;
    documents: Array<any> = [];
    mask = Mask;
    timezonesList: Array<any> = [];
    dateFormatList: Array<any> = [];
    userAlreadyExists: boolean = false;
    customerAlreadyExists: boolean = false;
    userExistvalue: number = 0;
    customerExistvalue: number = 0;
    customerEmail: string = '';
    customeruserRole: string = '';
    colorSubs!: Subscription;
    style!: { fill: string; };
    background!: { background: string; };
    isApiLoaded = false;
    @Input() options: Object = {};
    @ViewChild("placesRef") placesRef!: GooglePlaceDirective;
    stateId: string = ''
    countryIndex!: number

    constructor(
        private fb: FormBuilder,
        private apiService: ApiService,
        private commonService: CommonService,
        private authService: AuthService,
        private router: Router,
        private el: ElementRef,
        private mapsAPILoader: MapsAPILoader,
        @Inject(DOCUMENT) private document: Document,
        private elementRef: ElementRef

    ) { }

    ngOnInit(): void {
        this.initAddComanyForm();
        this.getCountries();
        this.getTimeZones();
        this.getDateFormat();
        this.getUserDetail();
        this.options = {
            types: ['hospital', 'pharmacy', 'bakery', 'country', 'places'],
            componentRestrictions: { country: 'IN' }
        }
        this.mapsAPILoader.load().then(() => {
            this.isApiLoaded = true
        })
    }
    ngAfterViewInit() {
        if(this.placesRef?.options){
        this.placesRef.options.componentRestrictions = { country: 'SG' }
        this.placesRef.options.fields = ["formatted_address", "geometry", "place_id"]
        }
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
        this.getAddressComponent(address.address_components, placeAddresCompoponent.COUNTRY)
        this.getAddressComponent(address.address_components, placeAddresCompoponent.STATE)
        this.getAddressComponent(address.address_components, placeAddresCompoponent.ZIP_CODE)
        this.getAddressComponent(address.address_components, placeAddresCompoponent.CITY)
        this.addCompanyForm.patchValue({
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
            console.log("huj", value)
        if (key == 'postal_code') {
            this.addCompanyForm.patchValue({
                zip_code: value
            })
        } else if (key == 'country') {
            let i = this.countriesList.findIndex((e) => e.short_code === shortvalue);
            if (i > -1) {
                this.addCompanyForm.get('country_id')?.patchValue(this.countriesList[i].id);
                this.countryIndex = i
            }
        } else if (key == 'administrative_area_level_1') {
            this.getStates(this.countriesList[this.countryIndex].id, value);

        } else if (key == 'locality') {
            this.addCompanyForm.patchValue({
                        city: value
               })
        }
        //  else if (key == 'administrative_area_level_2') {
        //     this.addCompanyForm.patchValue({
        //         city: value
        //     })
        // }
        return value;
    }


    getUserDetail(): void {
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
            this.getUserDetail();
        });
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
                    this.addCompanyForm.get('country_id')?.patchValue(this.countriesList[i].id);
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
        return this.addCompanyForm.controls;
    }


    imagePreview(e: any, input: any) {
        let mimeTypees = ['image/png', 'image/jpeg', 'image/gif', 'image/webp', 'image/svg+xml'];
        let file = e.target.files[0];
        if (mimeTypees.includes(file.type)) {
            this.selectedFile = e.target.files[0];
            this.fileSelected = true;
            if (this.selectedFile.size < 10000000) {
                const reader = new FileReader();
                reader.onload = () => {
                    this.filePath = reader.result as string;

                }
                reader.readAsDataURL(this.selectedFile);
            } else {
                this.filePath = '';
                this.selectedFile = '';
                input.value = '';
                this.commonService.showError("Please select image less than 10mb");
                return;
            }
            const reader = new FileReader();
            reader.onload = () => {
                this.filePath = reader.result as string;
            }
            reader.readAsDataURL(this.selectedFile);
        } else {
            input.value = '';
            this.filePath = '';
            this.selectedFile = '';
            this.commonService.showError("Supported Image Types: png, jpeg, webp, gif, svg")
        }


    }
    async getDateFormat() {
        try {
            this.commonService.showSpinner();
            const res$ = this.apiService.getReq(API_PATH.GET_DATE_FORMAT, '', '');
            let response = await lastValueFrom(res$);
            if (response && response.data) {
                this.dateFormatList = response.data;
                this.addCompanyForm.patchValue({ date_format_id: this.dateFormatList[0].id })

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
    async getStates(country_id: string, value: any) {
        try {
            this.commonService.showSpinner();
            const res$ = this.apiService.postReq(API_PATH.STATES, { country_id: country_id }, '', '');
            let response = await lastValueFrom(res$);
            if (response && response.data) {
                this.statesList = response.data;
                if (value == '') {
                    this.addCompanyForm.patchValue({ state_id: "" });
                } else if(value != '') {
                 setTimeout(() => {
                        let i = this.statesList.findIndex((e: any) => e.name == value);
                        if (i > -1) {
                            this.stateId = this.statesList[i].id;
                            this.addCompanyForm.patchValue({state_id: this.statesList[i].id});  
                          
    
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
    initAddComanyForm(): void {
        this.addCompanyForm = this.fb.group({
            company_name: ['', [
                Validators.required,
                Validators.pattern(Custom_Regex.spaces),
                Validators.pattern(Custom_Regex.username),
                Validators.pattern(Custom_Regex.name),
                Validators.maxLength(100),
                Validators.minLength(3)
            ]],
            first_name: ['', [Validators.required, Validators.pattern(Custom_Regex.spaces), Validators.pattern(Custom_Regex.lettersOnly), Validators.maxLength(100), Validators.minLength(3)]],
            last_name: ['', [Validators.required, Validators.pattern(Custom_Regex.spaces), Validators.pattern(Custom_Regex.lettersOnly), Validators.maxLength(100), Validators.minLength(3)]],
            // password: ['', [Validators.required, Validators.pattern(Custom_Regex.password)]],
            email: ['', [Validators.required, Validators.pattern(Custom_Regex.spaces), Validators.pattern(Custom_Regex.email),]],
            // dob: ['', [Validators.required]],
            phone_number: ['', [Validators.required, Validators.pattern(Custom_Regex.digitsOnly)]],
            address: ['', [Validators.required, Validators.maxLength(200)]],
            // , Validators.minLength(3)
            // , Validators.pattern(Custom_Regex.address), Validators.pattern(Custom_Regex.address2)
            city: ['', [Validators.required, Validators.pattern(Custom_Regex.spaces), Validators.maxLength(100), Validators.minLength(3)]],
            // , Validators.pattern(Custom_Regex.city)
            state_id: ['', [Validators.required]],
            country_id: ['', [Validators.required]],
            status: [1, [Validators.required]],
            company_type: ['', [Validators.required]],
            fax: ['', [Validators.pattern(Custom_Regex.digitsOnly)]],
            zip_code: ['', [Validators.required]],
            // , Validators.pattern(Custom_Regex.digitsOnly)
            // slug: ['', [Validators.required, Validators.maxLength(100),Validators.pattern(/^[a-zA-Z]+[a-zA-Z0-9-]*$/)]],
            time_zone_id: [''],
            date_format_id: [''],
            funding_email: ['', [Validators.pattern(Custom_Regex.spaces), Validators.pattern(Custom_Regex.email),]],
            notification_email: ['', [Validators.pattern(Custom_Regex.spaces), Validators.pattern(Custom_Regex.email),]],
            bcc_email: ['', [Validators.pattern(Custom_Regex.spaces), Validators.pattern(Custom_Regex.email),]],
            company_url: ['', [Validators.pattern(Custom_Regex.website), Validators.maxLength(100)]],
            marketing_email: ['', [Validators.pattern(Custom_Regex.spaces), Validators.pattern(Custom_Regex.email),]],
            agent_logout_session: [''],
            marketplace_email: ['', [Validators.pattern(Custom_Regex.spaces), Validators.pattern(Custom_Regex.email),]],
            offers_email: ['', [Validators.pattern(Custom_Regex.spaces), Validators.pattern(Custom_Regex.email),]],
        })
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
    openrestoreCompanypopup() {
        Swal.fire({
            title: 'Company already exists in trash',
            text: 'Do you want to restore this company!',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Yes, restore it!',
            confirmButtonColor: "#f0412e",
            cancelButtonText: 'Cancel'
        }).then((result) => {
            if (result.value) {
                this.userExistvalue = 1
                this.addCompanySubmit();

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
        Swal.fire({
            title: 'Are you sure to forcefully deletes the existing user & created a new company',
            text: 'Do you sure want to proceed!',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Yes',
            confirmButtonColor: "#f0412e",
            cancelButtonText: 'Cancel'
        }).then((result) => {
            if (result.value) {
                this.customerExistvalue = 1
                this.addCompanySubmit();

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

    /**
     * @description on add company submit
     * @author Shine Dezign Infonet Pvt. Ltd.
     * @returns { Promise<void> }
     */
    async addCompanySubmit(): Promise<void> {
        this.addCompanyForm.markAllAsTouched();
        // if (!this.selectedFile) {
        //     this.imageSelected = true;
        // }
        // if (this.addCompanyForm.valid && !this.imageSelected || this.fileSelected) {
        if (this.addCompanyForm.valid) {
            try {
                this.commonService.showSpinner();
                const formData = new FormData();
                formData.append('company_name', this.addCompanyForm.get('company_name').value);
                formData.append('first_name', this.addCompanyForm.get('first_name').value);
                formData.append('last_name', this.addCompanyForm.get('last_name').value);
                formData.append('email', this.addCompanyForm.get('email').value);
                formData.append('phone_number', this.addCompanyForm.get('phone_number').value);
                formData.append('address', this.addCompanyForm.get('address').value);
                formData.append('city', this.addCompanyForm.get('city').value);
                formData.append('state_id', this.addCompanyForm.get('state_id').value);
                formData.append('country_id', this.addCompanyForm.get('country_id').value);
                formData.append('status', this.addCompanyForm.get('status').value);
                formData.append('company_type', this.addCompanyForm.get('company_type').value);
                formData.append('fax', this.addCompanyForm.get('fax').value);
                formData.append('zip_code', this.addCompanyForm.get('zip_code').value);
                // formData.append('slug', this.addCompanyForm.get('slug').value);
                formData.append('time_zone_id', this.addCompanyForm.get('time_zone_id').value);
                formData.append('date_format_id', this.addCompanyForm.get('date_format_id').value);
                formData.append('funding_email', this.addCompanyForm.get('funding_email').value);
                formData.append('notification_email', this.addCompanyForm.get('notification_email').value);
                formData.append('bcc_email', this.addCompanyForm.get('bcc_email').value);
                formData.append('company_url', this.addCompanyForm.get('company_url').value);
                formData.append('marketing_email', this.addCompanyForm.get('marketing_email').value);
                formData.append('agent_logout_session', this.addCompanyForm.get('agent_logout_session').value);
                formData.append('marketplace_email', this.addCompanyForm.get('marketplace_email').value);
                formData.append('offers_email', this.addCompanyForm.get('offers_email').value);
                formData.append('role', 'Company');
                // if(this.addCompanyForm.get('company_type').value == 'funded'){
                //     formData.append('role', 'Company');
                // }else{
                //     formData.append('role', 'BrokerCompany');
                // }
                formData.append('user_already_exist_in_trash', `${this.userExistvalue}`);
                formData.append('already', `${this.customerExistvalue}`);
                if (this.selectedFile) {
                    formData.append('logo', this.selectedFile);
                }
                const res$ = this.apiService.postReq(API_PATH.ADD_USER, formData, 'company', 'create');
                let response = await lastValueFrom(res$);
                if (response) {
                    if (response.data.user_already_exist_in_trash == 1) {
                        this.userAlreadyExists = true
                        this.openrestoreCompanypopup();

                    } else if (response.data.already == 1) {
                        this.customerAlreadyExists = true;
                        this.customerEmail = response.data.email;
                        this.customeruserRole = response.data.role;
                        this.openrestoreCustomerCompanypopup();

                    } else {
                        this.commonService.showSuccess(response.message);
                        // this.router.navigate(['/admin/company']);
                        this.router.navigate(['/admin/select-email-template'] , { queryParams: { company_id: response.data.user_id, show: 'showfalse'} });
                        

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
    async getTimeZones() {
        try {
            this.commonService.showSpinner();
            const res$ = this.apiService.getReq(API_PATH.GET_TIMEZONES, '', '');
            let response = await lastValueFrom(res$);
            if (response && response.data) {
                this.timezonesList = response.data;
                this.addCompanyForm.patchValue({ time_zone_id: this.timezonesList[0].id })

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
    getDate(date: any, dateFormat: string) {
        return moment(date).format(`${dateFormat}`)
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
