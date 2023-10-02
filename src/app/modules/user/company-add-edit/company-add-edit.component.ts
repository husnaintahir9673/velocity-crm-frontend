import { MapsAPILoader } from '@agm/core';
import { DOCUMENT } from '@angular/common';
import { Component, ElementRef, Inject, Input, OnInit, ViewChild } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { API_PATH } from '@constants/api-end-points';
import { Custom_Regex, Mask } from '@constants/constants';
import { ApiService } from '@services/api.service';
import { AuthService } from '@services/auth.service';
import { CommonService } from '@services/common.service';
import moment from 'moment';
import { GooglePlaceDirective } from 'ngx-google-places-autocomplete';
import { Address } from 'ngx-google-places-autocomplete/objects/address';
import { lastValueFrom, Subscription } from 'rxjs';

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
    selector: 'app-company-add-edit',
    templateUrl: './company-add-edit.component.html',
    styleUrls: ['./company-add-edit.component.scss']
})
export class CompanyAddEditComponent implements OnInit {
    editMode: boolean = false;
    companyID: string = '';
    editCompanyForm!: FormGroup | any;
    countriesList: Array<any> = [];
    statesList: Array<any> = [];
    companyDetails: any = {};
    filePath: string = '';
    selectedFile: File | any;
    fileSelected: boolean = false;
    imageSelected: boolean = false;
    mask = Mask;
    logoImage: string = '';
    timezonesList: Array<any> = [];
    dateFormatList: Array<any> = [];
    style!: { fill: string; };
    background!: { background: string; };
    colorSubs!: Subscription;
    formattedaddress = " ";
    isApiLoaded = false;
    @Input() options: Object = {};
    @ViewChild("placesRef") placesRef!: GooglePlaceDirective;
    stateId: string = ''
    countryIndex!: number
    constructor(
        private apiService: ApiService,
        private commonService: CommonService,
        private route: ActivatedRoute,
        private authService: AuthService,
        private fb: FormBuilder,
        private router: Router,
        private mapsAPILoader: MapsAPILoader,
        @Inject(DOCUMENT) private document: Document,
        private elementRef: ElementRef
    ) { }

    ngOnInit(): void {
        this.getUserDetail();
        let params = this.route.snapshot.params;
        let query = this.route.snapshot.queryParams;
        this.initAddComanyForm();
        // this.getCountries();
        if (params['id']) {
            this.companyID = params['id'];
            this.getCompanyDetails();
        }
        if (query['mode'] && query['mode'] === 'edit') {
            this.editMode = true;
        }
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
        this.getAddressComponent(address.address_components, placeAddresCompoponent.ZIP_CODE)
        this.getAddressComponent(address.address_components, placeAddresCompoponent.COUNTRY)
        this.getAddressComponent(address.address_components, placeAddresCompoponent.CITY)
        this.getAddressComponent(address.address_components, placeAddresCompoponent.STATE)
        this.editCompanyForm.patchValue({
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
        if (postalCodeType != null && postalCodeType.length > 0)
            value = postalCodeType[0].long_name,
                shortvalue = postalCodeType[0].short_name;
        console.log("vhgvh", value);
        if (key == 'postal_code') {
            this.editCompanyForm.patchValue({
                zip_code: value
            })
        } else if (key == 'country') {
            let i = this.countriesList.findIndex((e) => e.short_code === shortvalue);
            if (i > -1) {
                this.editCompanyForm.get('country_id')?.patchValue(this.countriesList[i].id);
                this.countryIndex = i
            }
        } else if (key == 'administrative_area_level_1') {
            this.getStates(this.countriesList[this.countryIndex].id, true, value);

        } else if (key == 'locality') {
            this.editCompanyForm.patchValue({
                city: value
            })
        }
        // else if(key == 'administrative_area_level_2'){
        //     this.editCompanyForm.patchValue({
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
     * @description get form controls
     * @author Shine Dezign Infonet Pvt. Ltd.
     */
    get f(): { [key: string]: AbstractControl } {
        return this.editCompanyForm.controls;
    }

    /**
     * @description get states on country change
     * @param countryId 
     * @author Shine Dezign Infonet Pvt. Ltd.
     * @returns {void}
     */
    onCountryChange(countryId: any): void {
        this.getStates(countryId, false, '');
    }
    imagePreview(e: any, i: any) {
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
                i.value = '';
                this.commonService.showError("Please select image less than 10mb");
                return;
            }
            if (this.companyDetails.logo == null) {
                this.fileSelected = true
            }

            const reader = new FileReader();
            reader.onload = () => {
                this.filePath = reader.result as string;
                this.logoImage = this.filePath
                // this.companyDetails.logo = this.filePath;
            }
            reader.readAsDataURL(this.selectedFile);
            // i.value = ''
        } else {
            i.value = '';
            this.filePath = '';
            this.selectedFile = '';
            this.commonService.showError("Supported Image Types: png, jpeg, webp, gif, svg")
        }

    }
    cancel() {
        this.editMode = !this.editMode;
        this.patchValues();
    }

    /**
     * @description get states list
     * @param country_id 
     * @author Shine Dezign Infonet Pvt. Ltd.
     */
    async getStates(country_id: string, patchValue: boolean, value: any) {
        try {
            this.commonService.showSpinner();
            const res$ = this.apiService.postReq(API_PATH.STATES, { country_id: country_id }, '', '');
            let response = await lastValueFrom(res$);
            if (response && response.data) {
                this.statesList = response.data;
                if (patchValue) {
                    this.editCompanyForm.patchValue({ state_id: this.companyDetails.state_id });
                } else if (value != '') {
                    setTimeout(() => {
                        let i = this.statesList.findIndex((e) => e.name === value);
                        if (i > -1) {
                            this.stateId = this.statesList[i].id
                            this.editCompanyForm.get('state_id')?.patchValue(this.stateId);

                        }
                    })
                } else {
                    this.editCompanyForm.patchValue({ state_id: "" });
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
                if (this.companyDetails.country_id) {
                    this.editCompanyForm.patchValue({ country_id: this.companyDetails.country_id });
                    this.getStates(this.companyDetails.country_id, true, '');
                } else {
                    let i = this.countriesList.findIndex((e) => e.name === "United States");
                    if (i > -1) {
                        this.editCompanyForm.get('country_id')?.patchValue(this.countriesList[i].id);
                        this.companyDetails.country_id = this.countriesList[i].id;
                        this.getStates(this.countriesList[i].id, false, '');
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
     * 
     */
    async getCompanyDetails() {
        try {
            this.commonService.showSpinner();
            const res$ = this.apiService.getReq(API_PATH.VIEW_USER + `?user_id=${this.companyID}`, 'company', 'list');
            let response = await lastValueFrom(res$);
            if (response) {
                this.companyDetails = response.data;
                this.getCountries();
                this.getTimeZones();
                this.getDateFormat();
                // this.editCompanyForm.patchValue({ country_id: this.companyDetails.country_id });
                // this.getStates(this.companyDetails.country_id, true);
                // this.patchValues();
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
        this.editCompanyForm = this.fb.group({
            company_name: ['', [Validators.required, Validators.pattern(Custom_Regex.spaces), Validators.pattern(Custom_Regex.name), Validators.pattern(Custom_Regex.username), Validators.maxLength(100), Validators.minLength(3)]],
            first_name: ['', [Validators.required, Validators.pattern(Custom_Regex.spaces), Validators.pattern(Custom_Regex.lettersOnly), Validators.maxLength(100), Validators.minLength(3)]],
            last_name: ['', [Validators.required, Validators.pattern(Custom_Regex.spaces), Validators.pattern(Custom_Regex.lettersOnly), Validators.maxLength(100), Validators.minLength(3)]],
            phone_number: ['', [Validators.required, Validators.pattern(Custom_Regex.digitsOnly)]],
            address: ['', [Validators.required, Validators.maxLength(200)]],
            // ,Validators.minLength(3)
            // , Validators.pattern(Custom_Regex.address), Validators.pattern(Custom_Regex.address2),
            city: ['', [Validators.required, Validators.pattern(Custom_Regex.spaces), Validators.maxLength(100), Validators.minLength(3)]],
            // , Validators.pattern(Custom_Regex.city), 
            state_id: ['', [Validators.required]],
            country_id: ['', [Validators.required]],
            status: [1, [Validators.required]],
            company_type: ['', Validators.required],
            fax: ['', [Validators.pattern(Custom_Regex.digitsOnly)]],
            zip_code: ['', [Validators.required]],
            // , Validators.pattern(Custom_Regex.digitsOnly)
            // slug: ['', [Validators.required, Validators.maxLength(100), Validators.pattern(/^[a-zA-Z]+[a-zA-Z0-9-]*$/)]],
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

    patchValues() {
        this.editCompanyForm.patchValue({
            company_name: this.companyDetails.company_name,
            first_name: this.companyDetails.first_name,
            last_name: this.companyDetails.last_name,
            phone_number: this.companyDetails.phone_number,
            address: this.companyDetails.address,
            city: this.companyDetails.city,
            state_id: this.companyDetails.state_id,
            country_id: this.companyDetails.country_id,
            status: this.companyDetails.status === 'Active' ? 1 : 0,
            company_type: this.companyDetails.company_type,
            fax: this.companyDetails.fax,
            zip_code: this.companyDetails.zip_code,
            // slug: this.companyDetails.slug,
            time_zone_id: this.companyDetails.time_zone_id,
            date_format_id: this.companyDetails.date_format_id,
            funding_email: this.companyDetails.funding_email,
            notification_email: this.companyDetails.notification_email,
            bcc_email: this.companyDetails.bcc_email,
            company_url: this.companyDetails.company_url,
            marketing_email: this.companyDetails.marketing_email,
            agent_logout_session: this.companyDetails.agent_logout_session,
            marketplace_email: this.companyDetails.marketplace_email,
            offers_email: this.companyDetails.offers_email,

        })
        this.logoImage = this.companyDetails.logo;
    }

    async editCompanySubmit() {
        this.editCompanyForm.markAllAsTouched();
        // if (this.logoImage == null) {
        //     this.imageSelected = true;
        // }
        // if (this.editCompanyForm.valid && !this.imageSelected || this.fileSelected) {
        if (this.editCompanyForm.valid) {
            try {
                this.commonService.showSpinner();
                // let data = {
                //     ...this.editCompanyForm.value,
                //     id: this.companyID
                // }
                const formData = new FormData();
                formData.append('company_name', this.editCompanyForm.get('company_name').value);
                formData.append('first_name', this.editCompanyForm.get('first_name').value);
                formData.append('last_name', this.editCompanyForm.get('last_name').value);
                // formData.append('slug', this.editCompanyForm.get('slug').value);
                formData.append('phone_number', this.editCompanyForm.get('phone_number').value);
                formData.append('address', this.editCompanyForm.get('address').value);
                formData.append('city', this.editCompanyForm.get('city').value);
                formData.append('state_id', this.editCompanyForm.get('state_id').value);
                formData.append('country_id', this.editCompanyForm.get('country_id').value);
                formData.append('status', this.editCompanyForm.get('status').value);
                formData.append('company_type', this.editCompanyForm.get('company_type').value);
                formData.append('fax', this.editCompanyForm.get('fax').value);
                formData.append('zip_code', this.editCompanyForm.get('zip_code').value);
                formData.append('time_zone_id', this.editCompanyForm.get('time_zone_id').value);
                formData.append('date_format_id', this.editCompanyForm.get('date_format_id').value);
                formData.append('funding_email', this.editCompanyForm.get('funding_email').value);
                formData.append('notification_email', this.editCompanyForm.get('notification_email').value);
                formData.append('bcc_email', this.editCompanyForm.get('bcc_email').value);
                formData.append('company_url', this.editCompanyForm.get('company_url').value);
                formData.append('marketing_email', this.editCompanyForm.get('marketing_email').value);
                formData.append('role', 'Company');
                formData.append('agent_logout_session', this.editCompanyForm.get('agent_logout_session').value);
                formData.append('marketplace_email', this.editCompanyForm.get('marketplace_email').value);
                formData.append('offers_email', this.editCompanyForm.get('offers_email').value);
                // if(this.editCompanyForm.get('company_type').value == 'funded'){
                //     formData.append('role', 'Company');
                // }else{
                //     formData.append('role', 'BrokerCompany');
                // }
                formData.append('id', this.companyID);
                if (this.selectedFile) {
                    formData.append('logo', this.selectedFile);
                }
                const res$ = this.apiService.postReq(API_PATH.UPDATE_USER, formData, 'company', 'edit');
                let response = await lastValueFrom(res$);
                if (response) {
                    this.commonService.showSuccess(response.message);
                    this.router.navigate(['/admin/company']);
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

    getDate(date: any, dateFormat: string) {
        return moment(date).format(`${dateFormat}`)
    }

    get currentDate() {
        return new Date();
    }

}
