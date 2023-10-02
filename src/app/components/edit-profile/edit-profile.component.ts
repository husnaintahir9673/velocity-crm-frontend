import { Component, ElementRef, EventEmitter,Inject, Input, OnInit, Output, ViewChild } from '@angular/core';
import { FormGroup, FormBuilder, Validators, AbstractControl } from '@angular/forms';
import { Router } from '@angular/router';
import { API_PATH } from '@constants/api-end-points';
import { Custom_Regex, SETTINGS, Roles, Mask } from '@constants/constants';
import { NgbDateParserFormatter } from '@ng-bootstrap/ng-bootstrap';
import { ApiService } from '@services/api.service';
import { AuthService } from '@services/auth.service';
import { CommonService } from '@services/common.service';
import { lastValueFrom, Subscription } from 'rxjs';
import Inputmask from 'inputmask';
import moment from 'moment';
import { GooglePlaceDirective } from 'ngx-google-places-autocomplete';
import { MapsAPILoader } from '@agm/core';
import { DOCUMENT } from '@angular/common';
import { Address } from 'ngx-google-places-autocomplete/objects/address';
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
    selector: 'app-edit-profile',
    templateUrl: './edit-profile.component.html',
    styleUrls: ['./edit-profile.component.scss']
})
export class EditProfileComponent implements OnInit {
    roles = Roles;
    editProfileForm!: FormGroup;
    companyForm!: FormGroup | any;
    userDetails: any = {};
    countriesList: Array<any> = [];
    statesList: Array<any> = [];
    userRole: string = '';
    filePath: string = '';
    loginUserDetails: any;
    selectedFile: File | any;
    fileSelected: boolean = false;
    imageSelected: boolean = false;
    mask = Mask;
    todayDate: string = '';
    timezonesList: Array<any> = [];
    dateFormatList: Array<any> = [];
    style!: { fill: string; };
    background!: { background: string; };
    colorSubs!: Subscription;
    isApiLoaded = false;
    @Input() options: Object = {};
    @ViewChild("placesRef") placesRef!: GooglePlaceDirective;
    @ViewChild("placesRef2") placesRef2!: GooglePlaceDirective;
    stateId: string = ''
    countryIndex!: number


    @ViewChild('dob', { static: false }) DOB!: ElementRef;
    @Output() closeModal: EventEmitter<any> = new EventEmitter();
    constructor(
        private fb: FormBuilder,
        private commonService: CommonService,
        private apiService: ApiService,
        private parserFormatter: NgbDateParserFormatter,
        private authService: AuthService,
        private router: Router,
        private mapsAPILoader: MapsAPILoader,
        @Inject(DOCUMENT) private document: Document,
        private elementRef: ElementRef
    ) { }

    ngOnInit(): void {
        let d = new Date();
        let day: any = d.getDate();
        if(day.toString().length < 2) {
         day = '0'+ day;
              }
         this.todayDate = `${((d.getMonth()+"1")).slice(-2)}-${day}-${d.getFullYear()}`
        // this.todayDate = `${d.getMonth() + 1}-${day}-${d.getFullYear()}`
        this.getUserDetail();// for role and name
        this.getUserDetails();
        this.initCompanyForm();
        this.initeditForm();
        this.options = {
            types: ['hospital', 'pharmacy', 'bakery', 'country', 'places'],
            componentRestrictions: { country: 'IN' }
        }
        this.mapsAPILoader.load().then(() => {
            this.isApiLoaded = true
        })
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
        if(this.placesRef?.options){
        this.placesRef.options.componentRestrictions = { country: 'SG' }
        
        this.placesRef.options.fields = ["formatted_address", "geometry", "place_id"]
        this.placesRef2.options.componentRestrictions = { country: 'SG' }
        this.placesRef2.options.fields = ["formatted_address", "geometry", "place_id"]
        }
        
    }

    /**
     * @description get user details from localstrorage
     * @author Shine Dezign Infonet Pvt. Ltd.
     * @returns {void}
     */
    getUserDetail(): void {
        try {
            let ud = this.authService.getUserDetails();
            if (ud) {
                this.userRole = ud.role;
                this.loginUserDetails = ud;
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
    getDate(date: any, dateFormat: string){
        return moment(date).format(`${dateFormat}`)
      }

    /**
     * @description init compny form
     * @author Shine Dezign Infonet Pvt. Ltd.
     * @returns {void}
     */
    initCompanyForm(): void {
        this.companyForm = this.fb.group({
            company_name: ['', [ 
                Validators.required, 
                Validators.pattern(Custom_Regex.username), 
                Validators.pattern(Custom_Regex.name),
                Validators.maxLength(100),
                Validators.minLength(3)
            ]],
            first_name: ['', [
                Validators.required, 
                Validators.pattern(Custom_Regex.lettersOnly), 
                Validators.maxLength(100),
                Validators.minLength(3)
            ]],
            last_name: ['', [Validators.required, 
                Validators.pattern(Custom_Regex.lettersOnly), 
                Validators.maxLength(100),
                Validators.minLength(3)]],
            phone_number: ['', [Validators.required, Validators.pattern(Custom_Regex.digitsOnly)]],
            notification: [false],
            address: ['', [
                Validators.required,
                Validators.pattern(Custom_Regex.address), 
                Validators.pattern(Custom_Regex.address2), 
                Validators.maxLength(200),
                Validators.minLength(3)]],
            city: ['', [
                Validators.required,Validators.pattern(Custom_Regex.spaces), 
                Validators.pattern(Custom_Regex.city), 
                Validators.maxLength(100),
                Validators.minLength(3)
            ]],
            state_id: ['',[Validators.required]],
            country_id: ['', [Validators.required]],
            fax: ['', [Validators.pattern(Custom_Regex.digitsOnly)]],
            zip_code: ['', [
                Validators.required,
                // Validators.maxLength(8)
            ]],
            // slug: ['', [Validators.required, Validators.pattern(/^[a-zA-Z]+[a-zA-Z0-9-]*$/)]],
            time_zone_id: [''],
            date_format_id: [''],
            funding_email:['', [Validators.pattern(Custom_Regex.spaces),Validators.pattern(Custom_Regex.email),]],
            notification_email:['', [Validators.pattern(Custom_Regex.spaces),Validators.pattern(Custom_Regex.email),]],
            bcc_email:['', [Validators.pattern(Custom_Regex.spaces),Validators.pattern(Custom_Regex.email),]],
            company_url: ['', [Validators.pattern(Custom_Regex.website), Validators.maxLength(100)]],
            marketing_email:['', [Validators.pattern(Custom_Regex.spaces),Validators.pattern(Custom_Regex.email),]],
            agent_logout_session:[''],
            marketplace_email:['', [Validators.pattern(Custom_Regex.spaces),Validators.pattern(Custom_Regex.email),]],
            offers_email:['', [Validators.pattern(Custom_Regex.spaces),Validators.pattern(Custom_Regex.email),]],
        })
    }

    /**
     * @description values in form
     * @author Shine Dezign Infonet Pvt. Ltd.
     * @returns {void}
     */
    patchValues(): void {
        if (this.userRole === Roles.COMPANY) {
            this.companyForm.patchValue({
                company_name: this.userDetails.company_name,
                first_name: this.userDetails.first_name,
                last_name: this.userDetails.last_name,
                phone_number: this.userDetails.phone_number,
                address: this.userDetails.address ? this.userDetails.address : '',
                fax: this.userDetails.fax,
                zip_code: this.userDetails.zip_code,
                state_id: this.userDetails.state_id,
                country_id: this.userDetails.country_id,
                city: this.userDetails.city,
                notification: this.userDetails.notification,
                // slug: this.userDetails.slug,
                time_zone_id: this.userDetails.time_zone_id,
                date_format_id: this.userDetails.date_format_id,
                funding_email: this.userDetails.funding_email,
                notification_email: this.userDetails.notification_email,
                bcc_email: this.userDetails.bcc_email,
                company_url: this.userDetails.company_url,
                marketing_email: this.userDetails.marketing_email,
                agent_logout_session: this.userDetails.agent_logout_session,
                marketplace_email: this.userDetails.marketplace_email,
                offers_email: this.userDetails.offers_email,
            })
        } else {
            this.editProfileForm.patchValue({
                first_name: this.userDetails.first_name,
                last_name: this.userDetails.last_name,
                name: this.userDetails.name,
                phone_number: this.userDetails.phone_number,
                dob: this.userDetails.dob,
                address: this.userDetails.address ? this.userDetails.address : '',
                fax: this.userDetails.fax,
                zip_code: this.userDetails.zip_code,
                state_id: this.userDetails.state_id,
                country_id: this.userDetails.country_id,
                city: this.userDetails.city,
                time_zone_id: this.userDetails.time_zone_id,
                date_format_id: this.userDetails.date_format_id,
                sip_extension: this.userDetails.sip_extension,
                sms_extension: this.userDetails.sms_extension,
                sip_password: this.userDetails.sip_password,
            })
        }

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
                i.value = ''
                this.commonService.showError("Please select image less than 10mb");
                return;
            }
            if (this.userDetails.logo == null) {
                this.fileSelected = true
            }

            const reader = new FileReader();
            reader.onload = () => {
                this.filePath = reader.result as string;
                this.userDetails.logo = this.filePath;
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
    /**
     * @description get states list
     * @param country_id 
     * @param patchValue 
     * @author Shine Dezign Infonet Pvt. Ltd.
     */
    async getStates(country_id: string, patchValue: boolean,value:any) {
        try {
            this.commonService.showSpinner();
            const res$ = this.apiService.postReq(API_PATH.STATES, { country_id: country_id }, '', '');
            let response = await lastValueFrom(res$);
            if (response && response.data) {
                this.statesList = response.data;
                if (patchValue) {
                    if (this.userRole === this.roles.COMPANY) {
                        this.companyForm.patchValue({
                            state_id: this.userDetails.state_id
                        })
                    } else if (value != '') {
                        setTimeout(() => {
                        let i = this.statesList.findIndex((e) => e.name === value);
                        if (i > -1) {
                            this.stateId = this.statesList[i].id
                            this.companyForm.get('state_id')?.patchValue(this.stateId);
    
                        } })} else {
                        this.editProfileForm.patchValue({
                            state_id: this.userDetails.state_id
                        })
                    }
                } else {
                    if (this.userRole === this.roles.COMPANY) {
                        this.companyForm.patchValue({
                            state_id: ""
                        })
                    } else if (value != '') {
                        let i = this.statesList.findIndex((e) => e.name === value);
                        if (i > -1) {
                            this.stateId = this.statesList[i].id
                            this.companyForm.get('state_id')?.patchValue(this.stateId);
    
                        } } else {
                        this.editProfileForm.patchValue({
                            state_id: ""
                        })
                    }
                
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
     * @description get user details for patching in form 
     * @author Shine Dezign Infonet Pvt. Ltd.
     */
    async getUserDetails() {
        try {
            this.commonService.showSpinner();
            const res$ = this.apiService.getReq(API_PATH.PROFILE_DATA, '', '');
            let response = await lastValueFrom(res$);
            if (response && response.data) {
                this.userDetails = response.data;
                this.getCountries();
                this.getTimeZones();
                this.getDateFormat();
                if (this.userDetails.country_id) {
                    this.getStates(this.userDetails.country_id, true,'');
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
                if (this.userRole === Roles.COMPANY) {
                    this.companyForm.patchValue({
                        country_id: this.userDetails.country_id ? this.userDetails.country_id : ""
                    })
                } else {
                    this.editProfileForm.patchValue({
                        country_id: this.userDetails.country_id ? this.userDetails.country_id : ""
                    })
                }

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
     * @description get states on country change
     * @param countryId 
     * @author Shine Dezign Infonet Pvt. Ltd.
     * @returns {void}
     */
    onCountryChange(countryId: any): void {
        if (countryId != '') {
            this.getStates(countryId, false,'');
        }

    }

    /**
     * @description initialize chnage password form
     * @author Shine Dezign Infonet Pvt. Ltd.
     * @returns {void}
     */
    initeditForm(): void {
        this.editProfileForm = this.fb.group({
            first_name: ['', [
                Validators.required, 
                Validators.pattern(Custom_Regex.spaces), 
                Validators.pattern(Custom_Regex.username), 
                Validators.pattern(Custom_Regex.name),
                Validators.maxLength(100),
                Validators.minLength(3)
            ]],
            last_name: ['', [
                Validators.required, 
                Validators.pattern(Custom_Regex.spaces), 
                Validators.pattern(Custom_Regex.username), 
                Validators.pattern(Custom_Regex.name), 
                Validators.maxLength(100),
                Validators.minLength(3)
            ]],
            phone_number: ['', [Validators.required, Validators.pattern(Custom_Regex.digitsOnly)]],
            dob: [null],
            address: ['', [
                Validators.pattern(Custom_Regex.spaces), 
                // Validators.pattern(Custom_Regex.address2),
                Validators.maxLength(200),
                // Validators.minLength(3)
            ]],
            city: ['', [
                Validators.pattern(Custom_Regex.spaces),
                // Validators.pattern(Custom_Regex.city),
                // Validators.pattern(Custom_Regex.name),
                Validators.maxLength(100),
                // Validators.minLength(3)
            ]],
            state_id: [''],
            country_id: ['', [Validators.required]],
            fax: ['', [Validators.pattern(Custom_Regex.digitsOnly)]],
            zip_code: [''],
            // zip_code: ['', [Validators.pattern(Custom_Regex.digitsOnly)]],
            time_zone_id: [''],
            date_format_id: [''],
            sip_extension: ['', [Validators.pattern(Custom_Regex.digitsOnly)]],
            sms_extension:  ['', [Validators.pattern(Custom_Regex.digitsOnly)]],
            sip_password: ['', [Validators.pattern(Custom_Regex.spaces)]],
        })
    }

    /**
     * @description update values in localstrorage
     * @author Shine Dezign Infonet Pvt. Ltd.
     * @returns {void}
     */
    updateUserSession(): void {
        try {
            let ud = this.authService.getUserDetails();
            if (ud) {
                let user = {};
                if (this.userRole === Roles.COMPANY) {
                    const object = this.dateFormatList.find(obj => obj.id === this.companyForm.value.date_format_id);
                    const object2 = this.timezonesList.find(obj => obj.id === this.companyForm.value.time_zone_id);
                    user = {
                        ...ud,
                        // name: this.companyForm.value.first_name + ' ' + this.companyForm.value.last_name,
                        name: this.companyForm.value.company_name,
                        date_format: object?.format,
                        time_zone: object2?.time_zone,
                        logoImage: this.filePath,
                        agent_logout_session: this.companyForm.value.agent_logout_session
                    }
                } else {
                    const object = this.dateFormatList.find(obj => obj.id === this.editProfileForm.value.date_format_id);
                    const object2 = this.timezonesList.find(obj => obj.id === this.editProfileForm.value.time_zone_id);
                    user = {
                        ...ud,
                        name: this.editProfileForm.value.first_name + ' ' + this.editProfileForm.value.last_name,
                        // name: this.editProfileForm.value.first_name + ' ' + this.editProfileForm.value.last_name,
                        time_zone: object2?.time_zone,
                        date_format: object?.format,
                    }
                }
                const en = this.authService.encrypt(JSON.stringify(user));
                localStorage.setItem(SETTINGS.USER_DETAILS, en);
                this.authService.setUserName(`${this.companyForm.value.company_name}`)
                // this.authService.setUserName(`${this.companyForm.value.first_name + ' ' + this.companyForm.value.last_name}`)
                localStorage.setItem(SETTINGS.USER_DETAILS, en);
            }
        } catch (error: any) {
            this.commonService.showError(error.message);
        }
    }

    /**
     * @description company edit submit
     * @author Shine Dezign Infonet Pvt. Ltd.
     * @returns {void}
     */
    editCompanySubmit(): void {
        this.companyForm.markAllAsTouched();
        // if (this.userDetails?.logo == null) {
        //     this.imageSelected = true;
        // }
        // this.companyForm.valid  && !this.imageSelected || this.fileSelected
        if (this.companyForm.valid) {
            this.submitForm();
        }
    }

    /**
     * @description submit edit profile
     * @author Shine Dezign Infonet Pvt. Ltd.
     */
    async submitForm() {
        try {
            this.commonService.showSpinner();
            let data = {};
            if (this.userRole !== Roles.COMPANY) {
                if (this.editProfileForm.value.dob && !Custom_Regex.date.test(this.editProfileForm.value.dob)) {
                    this.commonService.showError('Invalid date of birth.');
                    this.commonService.hideSpinner();
                    return;
                }
                
                data = {
                    ...this.editProfileForm.value,
                    dob: this.editProfileForm.value.dob,
                }
            } else {
                const formData = new FormData();
                formData.append('company_name', this.companyForm.get('company_name').value);
                formData.append('first_name', this.companyForm.get('first_name').value);
                formData.append('last_name', this.companyForm.get('last_name').value);
                formData.append('notification', this.companyForm.get('notification').value ? '1' : '0');
                formData.append('phone_number', this.companyForm.get('phone_number').value);
                formData.append('address', this.companyForm.get('address').value);
                formData.append('city', this.companyForm.get('city').value);
                formData.append('state_id', this.companyForm.get('state_id').value);
                formData.append('country_id', this.companyForm.get('country_id').value);
                formData.append('fax', this.companyForm.get('fax').value);
                formData.append('zip_code', this.companyForm.get('zip_code').value);
                // formData.append('slug', this.companyForm.get('slug').value);
                formData.append('time_zone_id', this.companyForm.get('time_zone_id').value);
                formData.append('date_format_id', this.companyForm.get('date_format_id').value);
                formData.append('funding_email', this.companyForm.get('funding_email').value);
                formData.append('notification_email', this.companyForm.get('notification_email').value);
                formData.append('bcc_email', this.companyForm.get('bcc_email').value);
                formData.append('company_url', this.companyForm.get('company_url').value);
                formData.append('marketing_email', this.companyForm.get('marketing_email').value);
                formData.append('agent_logout_session', this.companyForm.get('agent_logout_session').value);
                formData.append('marketplace_email', this.companyForm.get('marketplace_email').value);
                formData.append('offers_email', this.companyForm.get('offers_email').value);
                if (this.selectedFile) {
                    formData.append('logo', this.selectedFile);
                }
                data = formData;
                // data = {
                //     ...this.companyForm.value,
                //     notification: this.companyForm.value.notification ? 1 : 0
                // }
            }

            const res$ = this.apiService.postReq(API_PATH.UPDATE_PROFILE, data, 'profile', 'update');
            let response = await lastValueFrom(res$);
            if (response) {
                this.commonService.showSuccess(response.message);
                this.updateUserSession();
                this.redirect();
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
     * @description change passsword submit
     * @author Shine Dezign Infonet Pvt. Ltd.
     */
    async editProfileSubmit() {
        this.editProfileForm.markAllAsTouched();
        // if(Roles.ADMINISTRATOR != this.userRole && Roles.COMPANY != this.userRole){
        //     this.editProfileForm.get('sip_extension')?.setValidators([Validators.required]);
        //     this.editProfileForm.get('sip_extension')?.updateValueAndValidity();
        // }
        if (this.editProfileForm.valid) {   
            this.submitForm();
        }
    }

    /**
     * @description formcontrols getters
     * @author Shine Dezign Infonet Pvt. Ltd.
     */
    get f(): { [key: string]: AbstractControl } {
        return this.editProfileForm.controls;
    }

    /**
     * @description formcontrols getters
     * @author Shine Dezign Infonet Pvt. Ltd.
     */
    get comF(): { [key: string]: AbstractControl } {
        return this.companyForm.controls;
    }

    redirect() {
        switch (this.userRole) {
            case this.roles.COMPANY:
                this.router.navigate(['/company']);
                break;
            case this.roles.ADMINISTRATOR:
                this.router.navigate(['/admin']);
                break;
            default:
                this.router.navigate([`${this.UserRole}`]);
                break;
        }
    }

    get UserRole() {
        return this.authService.getUserRole().toLowerCase();
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
        this.companyForm.patchValue({
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
            this.companyForm.patchValue({
                zip_code: value
            })
        } else if (key == 'country') {
            let i = this.countriesList.findIndex((e) => e.short_code === shortvalue);
            if (i > -1) {
                this.companyForm.get('country_id')?.patchValue(this.countriesList[i].id);
                this.countryIndex = i
            }
        } else if (key == 'administrative_area_level_1') {
            this.getStates(this.countriesList[this.countryIndex].id,false, value);

        } else if (key == 'locality') {
            this.companyForm.patchValue({
                city: value
            })
        }
        // else if (key == 'administrative_area_level_2') {
        //     this.companyForm.patchValue({
        //         city: value
        //     })
        // }
        return value;
    }
     handleUserAddressChange(address: Address) {
        this.getUserAddressComponent(address.address_components, placeAddresCompoponent.ZIP_CODE)
        this.getUserAddressComponent(address.address_components, placeAddresCompoponent.COUNTRY)
        this.getUserAddressComponent(address.address_components, placeAddresCompoponent.CITY)
        this.getUserAddressComponent(address.address_components, placeAddresCompoponent.STATE)
        this.editProfileForm.patchValue({
            address: address.name
        })
        // console.log("lat",address.geometry.location.lat())
        // console.log(address.geometry.location.lng())
    }
    getUserAddressComponent(address_components: any, key: any) {
        var value = '';
        var shortvalue = '';
        var postalCodeType = address_components.filter((aComp: { types: any[]; }) =>
            aComp.types.some((typesItem: any) => typesItem === key))
        if (postalCodeType != null && postalCodeType.length > 0)
            value = postalCodeType[0].long_name,
            shortvalue = postalCodeType[0].short_name;
        if (key == 'postal_code') {
            this.editProfileForm.patchValue({
                zip_code: value
            })
        } else if (key == 'country') {
            let i = this.countriesList.findIndex((e) => e.short_code === shortvalue);
            if (i > -1) {
                this.editProfileForm.get('country_id')?.patchValue(this.countriesList[i].id);
                this.countryIndex = i
            }
        } else if (key == 'administrative_area_level_1') {
            this.getStates(this.countriesList[this.countryIndex].id,false, value);

        } else if (key == 'locality') {
            this.companyForm.patchValue({
                city: value
            })
        }
        // else if (key == 'administrative_area_level_2') {
        //     this.editProfileForm.patchValue({
        //         city: value
        //     })
        // }
        return value;
    }

}
