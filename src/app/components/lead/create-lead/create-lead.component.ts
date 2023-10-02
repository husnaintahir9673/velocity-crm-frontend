import { ChangeDetectorRef, Component, ElementRef, Inject, Input, OnInit, ViewChild } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DOCUMENT, Location } from '@angular/common';
import { Router } from '@angular/router';
import { API_PATH } from '@constants/api-end-points';
import { Custom_Regex, Roles, Mask } from '@constants/constants';
import { NgbAccordion } from '@ng-bootstrap/ng-bootstrap';
import { ApiService } from '@services/api.service';
import { AuthService } from '@services/auth.service';
import { CommonService } from '@services/common.service';
import { lastValueFrom, Subscription } from 'rxjs';
import Swal from 'sweetalert2';
import Inputmask from 'inputmask';
import { Address } from 'ngx-google-places-autocomplete/objects/address';
import { MapsAPILoader } from '@agm/core';
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
    selector: 'app-create-lead',
    templateUrl: './create-lead.component.html',
    styleUrls: ['./create-lead.component.scss']
})
export class CreateLeadComponent implements OnInit {
    role = Roles;
    tabView: boolean = true;
    userDetails: any = {};
    leadDetailsForm!: FormGroup;
    officerInfoForm!: FormGroup;
    partnerInfoForm!: FormGroup;
    bussinessInfoForm!: FormGroup;
    bankInfoForm!: FormGroup;
    countriesList: Array<any> = [];
    statesList: Array<any> = [];
    offStatesList: Array<any> = [];
    partnerStatesList: Array<any> = [];
    todayDate!: string;
    tabActive = {
        id: 'LeadDetails',
        number: 1
    }
    opentab: any;
    currentStep = 1;
    mask = Mask;
    assineesList: Array<any> = [];
    bussinessTypeList: Array<any> = [];
    entityTypeList: Array<any> = [];
    leadSourceList: Array<any> = [];
    leadStatusList: Array<any> = [];
    campaignList: Array<any> = [];
    companyListPage: number = 1;
    companySearch: string = '';
    companiesList: Array<any> = [];
    submittersList: Array<any> = [];
    hasMoreCompanies: boolean = false;
    submittedLeadID: string = '';
    fullViewLeadID: string = '';
    bankStatesList: Array<any> = [];
    requesterAmt: string = "";
    leadFederalId: string = ''
    @ViewChild('acc', { static: false }) accordion!: NgbAccordion;
    submitterTabIndex: number = 0;
    @ViewChild('dbStarted', { static: false }) DBStarted!: ElementRef;
    @ViewChild('ownerDob', { static: false }) ownerDob!: ElementRef;
    @ViewChild('owner2Dob', { static: false }) owner2Dob!: ElementRef;
    style!: { fill: string; };
    background!: { background: string; };
    colorSubs!: Subscription;
    color!: string;
    isApiLoaded = false;
    @Input() options: Object = {};
    @ViewChild("placesRef") placesRef!: GooglePlaceDirective;
    stateId: string = ''
    countryIndex!: number;
    countryPartnerIndex!: number;
    countryOfficerIndex!: number;
    colorCheckbox: boolean = false;
    colorCheckbox2: boolean = false;
    colorCheckbox3: boolean = false;
    userRole: string = ''
    companyID:String = ''


    constructor(
        private fb: FormBuilder,
        private commonService: CommonService,
        private apiService: ApiService,
        private router: Router,
        private changeDetectorRef: ChangeDetectorRef,
        private authService: AuthService,
        private loc: Location,
        private el: ElementRef,
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
        this.initLeadDetailsForm();
        this.getUserDetails();
        this.initOfficerInfoForm();
        this.initPartnerInfoForm();
        this.initBussinessInfoForm();
        this.initBankInfoForm();
        this.getCountries();
        this.getLeadOptions();
        this.getAssignedOptions();
        if (this.userDetails.role != Roles.SUBMITTER) {
            // this.getSubmitterList();
            // this.leadDetailsForm.patchValue({
            //     submitter_id: this.userDetails.name,
            // })
        }
        this.leadDetailsForm.patchValue({
            broker_email: this.userDetails.email
        })
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
        this.leadDetailsForm.patchValue({
            lead_address: address.name
        })
    }
    handleOwner2AddressChange(address: Address) {
        this.getOwner2AddressComponent(address.address_components, placeAddresCompoponent.ZIP_CODE)
        this.getOwner2AddressComponent(address.address_components, placeAddresCompoponent.COUNTRY)
        this.getOwner2AddressComponent(address.address_components, placeAddresCompoponent.CITY)
        this.getOwner2AddressComponent(address.address_components, placeAddresCompoponent.STATE)
        this.partnerInfoForm.patchValue({
            partner_address: address.name
        })
    }
    handleOwner1AddressChange(address: Address) {
        this.getOwner1AddressComponent(address.address_components, placeAddresCompoponent.ZIP_CODE)
        this.getOwner1AddressComponent(address.address_components, placeAddresCompoponent.COUNTRY)
        this.getOwner1AddressComponent(address.address_components, placeAddresCompoponent.CITY)
        this.getOwner1AddressComponent(address.address_components, placeAddresCompoponent.STATE)
        this.officerInfoForm.patchValue({
            officer_address: address.name
        })
    }
    getOwner2AddressComponent(address_components: any, key: any) {
        var value = '';
        var shortvalue = '';
        var postalCodeType = address_components.filter((aComp: { types: any[]; }) =>
            aComp.types.some((typesItem: any) => typesItem === key))
        if (postalCodeType != null && postalCodeType.length > 0)
            value = postalCodeType[0].long_name,
                shortvalue = postalCodeType[0].short_name;
        // console.log("gbyhfg", value);
        if (key == 'postal_code') {
            this.partnerInfoForm.patchValue({
                partner_zip: value
            })
        } else if (key == 'country') {
            let i = this.countriesList.findIndex((e) => e.short_code === shortvalue);
            if (i > -1) {
                this.partnerInfoForm.get('partner_country')?.patchValue(this.countriesList[i].id);
                this.countryPartnerIndex = i
            }
        } else if (key == 'administrative_area_level_1') {
            this.getPartnerStates(this.countriesList[this.countryPartnerIndex].id, value);

        } else if (key == 'locality') {
            this.partnerInfoForm.patchValue({
                partner_city: value
            })
        }
        // else if (key == 'administrative_area_level_2') {
        //     this.partnerInfoForm.patchValue({
        //         partner_city: value
        //     })
        // }
        return value;
    }
    getAddressComponent(address_components: any, key: any) {
        var value = '';
        var shortvalue = '';
        var postalCodeType = address_components.filter((aComp: { types: any[]; }) =>
            aComp.types.some((typesItem: any) => typesItem === key))
        if (postalCodeType != null && postalCodeType.length > 0)
            value = postalCodeType[0].long_name,
                shortvalue = postalCodeType[0].short_name;
        // console.log("gbyhfg", value);
        if (key == 'postal_code') {
            this.leadDetailsForm.patchValue({
                lead_zip: value
            })

        } else if (key == 'country') {
            let i = this.countriesList.findIndex((e) => e.short_code === shortvalue);
            if (i > -1) {
                this.leadDetailsForm.get('lead_country')?.patchValue(this.countriesList[i].id);
                this.countryIndex = i

            }
        } else if (key == 'administrative_area_level_1') {
            this.getStates(this.countriesList[this.countryIndex].id, false, value);
        } else if (key == 'locality') {
            this.leadDetailsForm.patchValue({
                lead_city: value
            })
        }
        // else if (key == 'administrative_area_level_2') {
        //     this.leadDetailsForm.patchValue({
        //         lead_city: value
        //     })

        // }
        return value;
    }
    getOwner1AddressComponent(address_components: any, key: any) {
        var value = '';
        var shortvalue = '';
        var postalCodeType = address_components.filter((aComp: { types: any[]; }) =>
            aComp.types.some((typesItem: any) => typesItem === key))
        if (postalCodeType != null && postalCodeType.length > 0)
            value = postalCodeType[0].long_name,
                shortvalue = postalCodeType[0].short_name;
        // console.log("gbyhfg", value);

        if (key == 'postal_code') {
            this.officerInfoForm.patchValue({
                officer_zip: value
            })
        } else if (key == 'country') {
            let i = this.countriesList.findIndex((e) => e.short_code === shortvalue);
            // console.log("njbhj", i);

            if (i > -1) {
                this.officerInfoForm.get('officer_country')?.patchValue(this.countriesList[i].id);
                this.countryOfficerIndex = i
            }
        } else if (key == 'administrative_area_level_1') {
            this.getOfficerStates(this.countriesList[this.countryOfficerIndex].id, value);

        } else if (key == 'locality') {
            this.officerInfoForm.patchValue({
                officer_city: value
            })
        }
        //  else if (key == 'administrative_area_level_2') {
        //     this.officerInfoForm.patchValue({
        //         officer_city: value
        //     })

        // }
        return value;
    }

    initOwnerDob() {
        // console.log("gvg",this.ownerDob)
        if (this.ownerDob) {
            Inputmask('datetime', {
                inputFormat: 'mm-dd-yyyy',
                placeholder: 'mm-dd-yyyy',
                alias: 'datetime',
                min: '01-01-1920',
                max: this.todayDate,
                clearMaskOnLostFocus: false,
            }).mask(this.ownerDob.nativeElement);
        }
    }

    initOwner2Dob() {
        if (this.owner2Dob) {
            Inputmask('datetime', {
                inputFormat: 'mm-dd-yyyy',
                placeholder: 'mm-dd-yyyy',
                alias: 'datetime',
                min: '01-01-1920',
                max: this.todayDate,
                clearMaskOnLostFocus: false,
            }).mask(this.owner2Dob.nativeElement);
        }
    }

    initDbStarted() {
        if (this.DBStarted) {
            Inputmask('datetime', {
                inputFormat: 'mm-dd-yyyy',
                placeholder: 'mm-dd-yyyy',
                alias: 'datetime',
                min: '01-01-1920',
                max: this.todayDate,
                clearMaskOnLostFocus: false,
            }).mask(this.DBStarted.nativeElement);
        }

    }

    ngAfterViewInit(): void {
        this.initDbStarted();
        this.initOwner2Dob();
        this.initOwnerDob();
        if (this.placesRef?.options) {
            this.placesRef.options.componentRestrictions = { country: 'SG' }
            this.placesRef.options.fields = ["formatted_address", "geometry", "place_id"]
        }
    }

    /**
     * @description back button
     */
    goBack() {
        this.loc.back();
    }

    validateTabChange(number: number, id: string) {
        try {
            if (number > this.submitterTabIndex + 1) return;

            this.tabActive = {
                id: id,
                number: number
            }
        } catch (error: any) {
            console.log(error.message);
        }
    }

    /**
     * @description get logged in user details
     * @author Shine Dezign Infonet Pvt. Ltd.
     */
    getUserDetails() {
        let ud = this.authService.getUserDetails();
        if (ud) {
            this.userRole = ud.role;
            this.userDetails = ud;
            // 
            this.getColorOnUpdate();
            this.style = { fill: ud?.color };
            this.color = ud?.color;
            // this.stroke={stroke:ud?.color};

            this.background = { background: ud?.color };


            // 
            switch (this.userDetails.role) {
                case Roles.ADMINISTRATOR:
                    this.getCompaniesList();
                    if (this.leadDetailsForm) {
                        this.leadDetailsForm.get('company_id')?.setValidators([Validators.required]);
                        this.leadDetailsForm.updateValueAndValidity();
                        // this.leadDetailsForm.markAllAsTouched();
                    }
                    break;
                case Roles.COMPANY:
                    // this.getAssignedOptions();
                    //this.getSubmitterList();
                    // if (this.leadDetailsForm) {
                    //     this.leadDetailsForm.get('company_id')?.setValidators([]);
                    //     this.leadDetailsForm.updateValueAndValidity();
                    // }
                    break;
                case Roles.SUBMITTER:
                    // this.getAssignedOptions();
                    if (this.leadDetailsForm) {
                        this.leadDetailsForm.get('company_id')?.setValidators([]);
                        // this.leadDetailsForm.get('submitter_id')?.setValidators([]);
                        this.leadDetailsForm.updateValueAndValidity();
                    }
                    break;
                default:
                    break;
            }
        }
    }

    getColorOnUpdate() {
        this.colorSubs = this.authService.getColor().subscribe((u) => {
            this.getUserDetails();
        });
    }

    /**
     * 
     */
    async getCompaniesList() {
        try {
            let url = `?page_limit=15&page=${this.companyListPage}&role=${Roles.COMPANY}&status=Active`;
            if (this.companySearch) {
                url = url + `&search_keyword=${this.companySearch}`
            }
            this.commonService.showSpinner();
            const res$ = this.apiService.getReq(API_PATH.ADMIN_LISTS + url, 'company', 'list');
            let response = await lastValueFrom(res$);
            if (response && response.data) {
                this.hasMoreCompanies = response.data.hasMorePages;
                this.companiesList = response.data.data;
            } else {
                this.companiesList = [];
                this.hasMoreCompanies = false;
                this.companyListPage = 1;
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
    async changeFederalTax(value: any) {
        if (value) {
            // this.leadFederalId = value;      
            let data = {}
            try {
                if (this.userDetails.role == Roles.ADMINISTRATOR) {
                    if (!this.leadDetailsForm.value.company_id) {
                        this.leadDetailsForm.get('company_id')?.markAsTouched();
                        this.leadDetailsForm.patchValue({ lead_federal_tax_id: "" });
                        this.commonService.showError('Please select any company first');
                        return;
                    }
                    data = {
                        company_id: this.leadDetailsForm.value.company_id,
                        federal_tax_id: value
                        // federal_tax_id: value.replace(/-/g, "")
                    }
                } else {
                    data = {
                        federal_tax_id: value
                        // federal_tax_id: value.replace(/-/g, "")
                    }
                }

                this.commonService.showSpinner();
                const res$ = this.apiService.postReq(API_PATH.FEDERAL_TAX_ID, data, '', '');
                let response = await lastValueFrom(res$);
                if (response && response.data) {
                    if (response.data.is_duplicate == 1) {
                        Swal.fire({
                            title: 'This federal tax id already associated with another lead.',
                            icon: 'warning',
                            // showCancelButton: true,
                            confirmButtonText: 'OK',
                            confirmButtonColor: "#f0412e",
                            // cancelButtonText: 'OK'
                        }).then((result) => {
                            if (result.value) {
                                Swal.close()

                            } else if (result.dismiss === Swal.DismissReason.cancel) {
                                Swal.close()
                            }
                        })
                        // this.commonService.showError("This federal id already associated with another lead.")
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
            return;
        }




    }

    /**
     * @description search company
     * @param value 
     */
    onCompanySearch(value: { term: string, items: any[] }) {
        if (value.term) {
            this.companySearch = value.term
        } else {
            this.companySearch = '';
        }
        this.companyListPage = 1;
        this.getCompaniesList();
    }

    /**
     * @description implement pagination
     */
    getMoreCompanies() {
        if (this.hasMoreCompanies) {
            this.companyListPage++;
            this.getCompaniesList();
        }
    }

    async onCompanySelect(value: any) {
        this.companyID = value;
        this.getSubmittersList();
        this.getUnderWritersList();
        this.getLeadOptions();
    }

    /**
     * 
     */
    async getSubmittersList() {
        try {
            this.commonService.showSpinner();
            const res$ = this.apiService.postReq(API_PATH.COMPANY_USERS, { role: Roles.SUBMITTER, company_id: this.leadDetailsForm.value.company_id }, 'user', 'list');
            let response = await lastValueFrom(res$);
            if (response && response.data) {
                this.submittersList = response.data;
            } else {
                this.submittersList = [];
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
     * 
     */
    async getUnderWritersList() {
        try {
            // role: Roles.UNDERWRITER,
            this.commonService.showSpinner();
            const res$ = this.apiService.postReq(API_PATH.COMPANY_USERS, { company_id: this.leadDetailsForm.value.company_id }, 'user', 'list');
            let response = await lastValueFrom(res$);
            if (response && response.data) {
                this.assineesList = response.data;
            } else {
                this.assineesList = [];
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
     * @description initialize lead details form
     */
    initLeadDetailsForm() {
        this.leadDetailsForm = this.fb.group({
            first_name: ['', [
                Validators.required,
                Validators.pattern(Custom_Regex.spaces),
                Validators.pattern(Custom_Regex.lettersOnly),
                Validators.maxLength(100),
                Validators.minLength(3)
            ]],
            last_name: ['', [
                Validators.required,
                Validators.pattern(Custom_Regex.spaces),
                Validators.pattern(Custom_Regex.lettersOnly),
                Validators.maxLength(100),
                Validators.minLength(3)
            ]],
            company_name: ['', [
                Validators.required,
                Validators.pattern(Custom_Regex.spaces),
                Validators.pattern(Custom_Regex.username),
                Validators.pattern(Custom_Regex.name),
                Validators.maxLength(100),
                Validators.minLength(3)
            ]],
            address: ['', [
                Validators.pattern(Custom_Regex.address),
                Validators.pattern(Custom_Regex.address2),
                Validators.maxLength(200),
                Validators.minLength(3)
            ]],
            lead_doing_business_as: ['', [
                Validators.pattern(Custom_Regex.address),
                Validators.pattern(Custom_Regex.address2),
                Validators.maxLength(100),
                Validators.minLength(3)
            ]],
            email: ['', [Validators.required, Validators.pattern(Custom_Regex.email)]],
            phone_number: ['', [Validators.required]],
            lead_website: ['', [Validators.pattern(Custom_Regex.website), Validators.maxLength(100)]],
            lead_fax: ['', [Validators.pattern(Custom_Regex.digitsOnly)]],
            lead_address: ['', [Validators.maxLength(200), Validators.pattern(Custom_Regex.spaces),]],
            // Validators.pattern(Custom_Regex.address), 
            // Validators.minLength(3)
            // Validators.pattern(Custom_Regex.address2), 
            lead_other_address: ['', [
                Validators.pattern(Custom_Regex.address),
                Validators.pattern(Custom_Regex.address2),
                Validators.maxLength(200),
                Validators.minLength(3)
            ]],
            lead_country: ['', [Validators.required,]],
            lead_state: [''],
            lead_city: ['', [
                Validators.pattern(Custom_Regex.spaces),
                Validators.maxLength(100),
            ]],
            // Validators.pattern(Custom_Regex.city), 
            // Validators.pattern(Custom_Regex.name),
            // Validators.minLength(3)
            lead_zip: [''],
            // , [Validators.pattern(Custom_Regex.digitsOnly), Validators.maxLength(5)]
            lead_opt_drip_campaign: [''],
            lead_work_place: ['', [
                Validators.pattern(Custom_Regex.address),
                Validators.pattern(Custom_Regex.address2),
                Validators.maxLength(200),
                Validators.minLength(3)
            ]],
            lead_federal_tax_id: [''],
            lead_business_started: [null],
            lead_length_ownership: ['', [Validators.pattern(Custom_Regex.spaces), Validators.pattern(Custom_Regex.digitsOnly)]],
            lead_entity_type: [''],
            lead_business_type: [''],
            lead_product_sold: ['', [
                Validators.pattern(Custom_Regex.spaces),
                Validators.pattern(Custom_Regex.address),
                Validators.pattern(Custom_Regex.address2),
                Validators.maxLength(50)
            ]],
            lead_use_of_proceed: ['', [
                Validators.pattern(Custom_Regex.spaces),
                Validators.pattern(Custom_Regex.address),
                Validators.pattern(Custom_Regex.address2),
                Validators.maxLength(100),
                Validators.minLength(3)
            ]],
            lead_anual_revenue: ['', [
                Validators.pattern(Custom_Regex.spaces),
                Validators.pattern(Custom_Regex.amount),
                //  Validators.maxLength(100)
            ]],
            lead_monthly_revenue: ['', [
                Validators.pattern(Custom_Regex.spaces),
                Validators.pattern(Custom_Regex.amount),
                // Validators.maxLength(100)
            ]],
            lead_requested_amount: ['', [
                Validators.pattern(Custom_Regex.amount),
                // Validators.maxLength(50)
            ]],
            lead_source: ['', [Validators.required]],
            lead_status: ['', [Validators.required]],
            // , [Validators.required]
            lead_assigned_to: [''],
            lead_disposition: [''],
            lead_campaign: [''],
            lead_markering_notification: ['both', [Validators.required]],
            company_id: [null],
            // [Validators.required]
            // submitter_id: [null, [Validators.required]],
            broker_email: ['', [Validators.required, Validators.pattern(Custom_Regex.email)]],
        })
        if (this.leadDetailsForm.value.lead_markering_notification == 'both') {
            this.colorCheckbox3 = true;
        } else {
            this.colorCheckbox3 = false;
        }

    }

    /**
     * @description get lead detail form controls
     */
    get lf(): { [key: string]: AbstractControl } {
        return this.leadDetailsForm.controls;
    }



    /**
     * @description on next click in lead details form
     */
    async onLeadFormSubmit() {
        this.commonService.showSpinner();
        this.leadDetailsForm.markAllAsTouched();
        // console.log("hbjg", this.leadDetailsForm);

        if (this.leadDetailsForm.valid) {
            try {
                if (this.leadDetailsForm.value.lead_business_started && !Custom_Regex.date.test(this.leadDetailsForm.value.lead_business_started)) {
                    this.commonService.showError('Invalid lead business started date.');
                    this.commonService.hideSpinner();
                    return;
                }
                let data = {
                    ...this.leadDetailsForm.value,
                    // lead_federal_tax_id : this.leadFederalId,  ==='-'?'':this.lead.lead_federal_tax_id,
                    lead_federal_tax_id: this.leadDetailsForm.value.lead_federal_tax_id ? this.leadDetailsForm.value.lead_federal_tax_id.slice(0, 2) + '-' + this.leadDetailsForm.value.lead_federal_tax_id.slice(2, this.leadDetailsForm.value.lead_federal_tax_id.length) : '',

                    lead_business_started: this.leadDetailsForm.value.lead_business_started ? this.leadDetailsForm.value.lead_business_started : "",
                    lead_anual_revenue: parseFloat(this.leadDetailsForm.value.lead_anual_revenue),
                    lead_monthly_revenue: parseFloat(this.leadDetailsForm.value.lead_monthly_revenue)
                }
                if (this.submittedLeadID) {
                    data.lead_id = this.submittedLeadID
                }
                const res$ = this.apiService.postReq(API_PATH.LEAD_BASIC_DETAILS_SUBMIT, data, 'lead', 'create');
                let response = await lastValueFrom(res$);
                if (response && response.data) {
                    this.commonService.showSuccess(response.message);
                    this.submittedLeadID = response.data.lead_id;
                    this.tabActive = {
                        id: 'OfficerInfo',
                        number: 2
                    }
                    this.officerInfoForm.patchValue({ officer_first_name: this.leadDetailsForm.value.first_name });
                    this.officerInfoForm.patchValue({ officer_last_name: this.leadDetailsForm.value.last_name });
                    this.officerInfoForm.patchValue({ officer_email: this.leadDetailsForm.value.email });
                    if (this.submitterTabIndex < 1) {
                        this.submitterTabIndex = 1;
                    }
                    this.changeDetectorRef.detectChanges();
                    this.initOwnerDob();
                } else {
                    this.commonService.showError(response.message);
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
            this.commonService.hideSpinner();
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

    openfullView() {
        this.tabView = false;
        this.changeDetectorRef.detectChanges();
        this.opentab = this.tabActive.id;
        this.openAccordianTab(this.tabActive.id);
        setTimeout(() => {
            this.initOwner2Dob();
            this.initOwnerDob();
            this.initDbStarted();
        }, 0);

    }

    /**
     * @description open tab by ID
     * @param tabID 
     */
    openAccordianTab(tabID: string): void {
        this.accordion.expand(tabID);
        this.changeDetectorRef.detectChanges();
        this.initOwner2Dob();
        this.initOwnerDob();
        this.initDbStarted();
    }

    /**
     * @description close Accordian tab by id
     * @param tabID 
     */
    closeAccordianTab(tabID: string): void {
        this.accordion.collapse(tabID);
    }

    //officer info

    /**
     * @description init officer form
     */
    initOfficerInfoForm() {
        this.officerInfoForm = this.fb.group({
            officer_first_name: ['', [
                Validators.pattern(Custom_Regex.spaces),
                Validators.pattern(Custom_Regex.lettersOnly),
                Validators.maxLength(100),
                Validators.minLength(3),
            ]],
            officer_last_name: ['', [
                Validators.pattern(Custom_Regex.spaces),
                Validators.pattern(Custom_Regex.lettersOnly),
                Validators.maxLength(100),
                Validators.minLength(3),
            ]],
            officer_email: ['', [Validators.pattern(Custom_Regex.spaces), Validators.pattern(Custom_Regex.email)]],
            officer_dob: [null],
            officer_address: ['', [
                Validators.maxLength(200), Validators.pattern(Custom_Regex.spaces),
            ]],
            // Validators.pattern(Custom_Regex.address), 
            // Validators.pattern(Custom_Regex.address2), 
            // Validators.minLength(3),
            officer_other_address: ['', [
                Validators.pattern(Custom_Regex.address),
                Validators.pattern(Custom_Regex.address2),
                Validators.maxLength(200),
                Validators.minLength(3),
            ]],
            officer_country: [''],
            officer_state: [''],
            officer_city: ['', [Validators.pattern(Custom_Regex.spaces),
            Validators.maxLength(100),
            ]],
            //
            // Validators.pattern(Custom_Regex.city), 
            // Validators.minLength(3),
            officer_zip: [''],
            // , [Validators.pattern(Custom_Regex.digitsOnly)]
            officer_ssn: [''],
            officer_cell: [''],
            officer_cell_other: [''],
            officer_home: ['', [
                Validators.pattern(Custom_Regex.address),
                Validators.pattern(Custom_Regex.address2),
                Validators.maxLength(200),
                Validators.minLength(3),
            ]],
            officer_credit_score: ['', [Validators.pattern(Custom_Regex.digitsOnly),]],
            officer_ownership: ['', [
                Validators.pattern(Custom_Regex.amount)
            ]],
        })
    }

    /**
     * @description get lead detail form controls
     */
    get oif(): { [key: string]: AbstractControl } {
        return this.officerInfoForm.controls;
    }

    async onOfficerInfoSubmit() {
        this.commonService.showSpinner();
        this.officerInfoForm.markAllAsTouched();

        if (this.officerInfoForm.valid) {
            try {
                if (this.officerInfoForm.value.officer_dob && !Custom_Regex.date.test(this.officerInfoForm.value.officer_dob)) {
                    this.commonService.showError('Invalid owner date of birth.');
                    this.commonService.hideSpinner();
                    return;
                }
                let data = {
                    lead_id: this.submittedLeadID,
                    ...this.officerInfoForm.value,
                    officer_dob: this.officerInfoForm.value.officer_dob ? this.officerInfoForm.value.officer_dob : "",
                    // submitter_id: this.leadDetailsForm.value.submitter_id ? this.leadDetailsForm.value.submitter_id : ''
                };
                const res$ = this.apiService.postReq(API_PATH.LEAD_OFFICER_DETAIL_SUBMIT, data, 'lead', 'create');
                let response = await lastValueFrom(res$);
                if (response && response.data) {
                    this.commonService.showSuccess(response.message);
                    this.tabActive = {
                        id: 'PartnerInfo',
                        number: 3
                    }
                    if (this.submitterTabIndex < 2) {
                        this.submitterTabIndex = 2;
                    }
                    this.changeDetectorRef.detectChanges();
                    this.initOwner2Dob();

                } else {
                    this.commonService.showError(response.message);
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
            this.commonService.hideSpinner();
        }
    }

    /**
     * @description on saving lead details form in full view
     */
    onsaveLeadForm() {
        this.leadDetailsForm.markAllAsTouched();
        if (this.leadDetailsForm.valid) {
            if (this.leadDetailsForm.value.lead_business_started && !Custom_Regex.date.test(this.leadDetailsForm.value.lead_business_started)) {
                this.commonService.showError('Invalid lead business started date.');
                this.commonService.hideSpinner();
                return;
            }
            this.opentab = 'OfficerInfo';
            this.openAccordianTab('OfficerInfo');
            this.closeAccordianTab('LeadDetails');
            this.officerInfoForm.patchValue({ officer_first_name: this.leadDetailsForm.value.first_name });
            this.officerInfoForm.patchValue({ officer_last_name: this.leadDetailsForm.value.last_name });
            this.officerInfoForm.patchValue({ officer_email: this.leadDetailsForm.value.email });
            this.changeDetectorRef.detectChanges();
            this.initOwnerDob();
        } else {
            this.focusInvalidField();
        }
    }


    closeAlltabs() {
        this.accordion.collapseAll();
    }



    /**
     * @description on saving officer form (Full view)
     */
    onsaveOfficerForm() {
        this.officerInfoForm.markAllAsTouched();
        if (this.officerInfoForm.valid) {
            if (this.officerInfoForm.value.officer_dob && !Custom_Regex.date.test(this.officerInfoForm.value.officer_dob)) {
                this.commonService.showError('Invalid owner date of birth.');
                this.commonService.hideSpinner();
                return;
            }
            this.opentab = 'PartnerInfo';
            this.openAccordianTab('PartnerInfo');
            this.closeAccordianTab('OfficerInfo');
            this.changeDetectorRef.detectChanges();
            this.initOwner2Dob();
        } else {
            this.focusInvalidField();
        }
    }

    /**
     * @description on saving parntner form (Full view)
     */
    onsavePartnerForm() {
        this.partnerInfoForm.markAllAsTouched();
        if (this.partnerInfoForm.valid) {
            this.opentab = 'BusinessInfo';
            this.openAccordianTab('BusinessInfo');
            this.closeAccordianTab('PartnerInfo');
        } else {
            this.focusInvalidField();
        }
    }

    /**
     * @description on saving business form (Full view)
     */
    onsaveBussinessForm() {
        this.bussinessInfoForm.markAllAsTouched();
        if (this.bussinessInfoForm.valid) {
            this.opentab = 'BankInfo';
            this.openAccordianTab('BankInfo');
            this.closeAccordianTab('BusinessInfo');
        } else {
            this.focusInvalidField();
        }
    }
    /**
     * @description init officer form
     */
    initPartnerInfoForm() {
        this.partnerInfoForm = this.fb.group({
            partner_first_name: ['', [
                Validators.pattern(Custom_Regex.spaces),
                Validators.pattern(Custom_Regex.lettersOnly),
                Validators.maxLength(100),
                Validators.minLength(3)
            ]],
            partner_last_name: ['', [
                Validators.pattern(Custom_Regex.spaces),
                Validators.pattern(Custom_Regex.lettersOnly),
                Validators.maxLength(100),
                Validators.minLength(3)
            ]],
            partner_email: ['', [Validators.pattern(Custom_Regex.spaces), Validators.pattern(Custom_Regex.email),]],
            partner_dob: [null],
            partner_address: ['', [
                Validators.maxLength(200), Validators.pattern(Custom_Regex.spaces),
            ]],
            // Validators.pattern(Custom_Regex.address), 
            // Validators.pattern(Custom_Regex.address2),
            // Validators.minLength(3)
            partner_other_address: ['', [
                Validators.pattern(Custom_Regex.address),
                Validators.pattern(Custom_Regex.address2),
                Validators.maxLength(200),
                Validators.minLength(3)
            ]],
            partner_country: [''],
            partner_state: [''],
            partner_city: ['', [
                Validators.maxLength(100),
            ]],
            // Validators.pattern(Custom_Regex.spaces),
            // Validators.pattern(Custom_Regex.city), 
            // Validators.minLength(3)
            partner_zip: [''],
            // , [Validators.pattern(Custom_Regex.digitsOnly), Validators.maxLength(5)]
            partner_ssn: [''],
            partner_cell: [''],
            partner_cell_other: [''],
            partner_home: ['', [
                Validators.pattern(Custom_Regex.address),
                Validators.pattern(Custom_Regex.address2),
                Validators.maxLength(200),
                Validators.minLength(3)
            ]],
            partner_credit_score: ['', [Validators.pattern(Custom_Regex.digitsOnly)]],
            partner_ownership: ['', [Validators.pattern(Custom_Regex.amount)]],
        })
    }

    async onPartnerInfoSubmit() {
        this.commonService.showSpinner();
        this.partnerInfoForm.markAllAsTouched();

        if (this.partnerInfoForm.valid) {
            try {
                if (this.partnerInfoForm.value.partner_dob && !Custom_Regex.date.test(this.partnerInfoForm.value.partner_dob)) {
                    this.commonService.showError('Invalid owner date of birth.');
                    this.commonService.hideSpinner();
                    return;
                }
                let data = {
                    lead_id: this.submittedLeadID,
                    ...this.partnerInfoForm.value,
                    partner_dob: this.partnerInfoForm.value.partner_dob ? this.partnerInfoForm.value.partner_dob : "",
                    // submitter_id: this.leadDetailsForm.value.submitter_id ? this.leadDetailsForm.value.submitter_id : ''
                };
                // this.commonService.showSpinner();
                const res$ = this.apiService.postReq(API_PATH.LEAD_PARTNER_DETAIL_SUBMIT, data, 'lead', 'create');
                let response = await lastValueFrom(res$);
                if (response && response.data) {
                    this.commonService.showSuccess(response.message);
                    // this.tabActive = {
                    //     id: 'BusinessInfo',
                    //     number: 4
                    // }
                    // if (this.submitterTabIndex < 3) {
                    //     this.submitterTabIndex = 3;
                    // }
                    this.router.navigate([`/${this.userBaseRoute}/lead-detail/${this.submittedLeadID}`]);
                    // this.router.navigate([`/${this.userBaseRoute}/leads`]);
                } else {
                    this.commonService.showError(response.message);
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
            this.commonService.hideSpinner();
            this.focusInvalidField();
        }

    }
    /**
    * @description get lead detail form controls
    */
    get pif(): { [key: string]: AbstractControl } {
        return this.partnerInfoForm.controls;
    }

    /**
     * @description init officer form
     */
    initBussinessInfoForm() {
        this.bussinessInfoForm = this.fb.group({
            business_first_name: ['', [
                Validators.pattern(Custom_Regex.lettersOnly),
                Validators.maxLength(100),
                Validators.minLength(3)
            ]],
            business_last_name: ['', [
                Validators.pattern(Custom_Regex.lettersOnly),
                Validators.maxLength(100),
                Validators.minLength(3)
            ]],
            business_landlord: ['', [
                Validators.pattern(Custom_Regex.spaces),
                Validators.maxLength(100),
                Validators.minLength(3)
            ]],
            business_phone: [''],
            business_option: [''],
            business_monthly_rent: ['', [Validators.pattern(Custom_Regex.digitsOnly)]],
        })
    }

    async onBussinessInfoSubmit() {
        this.commonService.showSpinner();
        this.bussinessInfoForm.markAllAsTouched();

        if (this.bussinessInfoForm.valid) {
            try {
                let data = {
                    lead_id: this.submittedLeadID,
                    ...this.bussinessInfoForm.value,
                    // submitter_id: this.leadDetailsForm.value.submitter_id ? this.leadDetailsForm.value.submitter_id : ''
                    // partner_dob: this.formatter.format(this.bussinessInfoForm.value.partner_dob)
                };
                // this.commonService.showSpinner();
                const res$ = this.apiService.postReq(API_PATH.LEAD_BUSSINESS_DETAIL_SUBMIT, data, 'lead', 'create');
                let response = await lastValueFrom(res$);
                if (response && response.data) {
                    this.commonService.showSuccess(response.message);
                    this.tabActive = {
                        id: 'BankInfo',
                        number: 5
                    }
                    if (this.submitterTabIndex < 4) {
                        this.submitterTabIndex = 4;
                    }

                } else {
                    this.commonService.showError(response.message);
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
            this.commonService.hideSpinner();
            this.focusInvalidField();
        }

    }
    /**
    * @description get lead detail form controls
    */
    get bif(): { [key: string]: AbstractControl } {
        return this.bussinessInfoForm.controls;
    }
    initBankInfoForm() {
        this.bankInfoForm = this.fb.group({
            bank_account_name: ['', [Validators.pattern(Custom_Regex.spaces), Validators.maxLength(100)]],
            bank_account: ['', [Validators.pattern(Custom_Regex.digitsOnly), Validators.maxLength(20)]],
            bank_routing: ['', [Validators.pattern(Custom_Regex.spaces), Validators.maxLength(100)]],
            bank: ['', [Validators.pattern(Custom_Regex.spaces)]],
            bank_country: [''],
            bank_state: [''],
            bank_city: ['', [Validators.pattern(Custom_Regex.spaces), Validators.pattern(Custom_Regex.username), Validators.pattern(Custom_Regex.name), Validators.maxLength(100)]],
            bank_zip: ['', [Validators.pattern(Custom_Regex.spaces), Validators.maxLength(5)]],
        })
    }
    async onBankInfoSubmit() {
        this.commonService.showSpinner();
        this.bankInfoForm.markAllAsTouched();
        if (this.bankInfoForm.valid) {
            try {
                let data = {
                    lead_id: this.submittedLeadID,
                    ...this.bankInfoForm.value,
                    // submitter_id: this.leadDetailsForm.value.submitter_id ? this.leadDetailsForm.value.submitter_id : ''
                };
                // this.commonService.showSpinner();
                const res$ = this.apiService.postReq(API_PATH.LEAD_BANK_DETAIL_SUBMIT, data, 'lead', 'create');
                let response = await lastValueFrom(res$);
                if (response && response.data) {
                    this.commonService.showSuccess(response.message);
                    this.tabActive = {
                        id: 'LeadDetails',
                        number: 5
                    }
                    this.router.navigate([`/${this.userBaseRoute}/leads`]);
                    // this.redirect();
                } else {
                    this.commonService.showError(response.message);
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
            this.commonService.hideSpinner();
            this.focusInvalidField();
        }

    }
    get userBaseRoute() {
        return this.authService.getUserRole().toLowerCase();
    }
    /**
     * @description get lead detail form controls
     */
    get baif(): { [key: string]: AbstractControl } {
        return this.bankInfoForm.controls;
    }
    toggle(ID: string) {
        setTimeout(() => this.accordion.toggle(ID), 0);
    }
    async onFullViewSubmit() {
        this.commonService.showSpinner();
        this.leadDetailsForm.markAllAsTouched();
        this.officerInfoForm.markAllAsTouched();
        this.partnerInfoForm.markAllAsTouched();
        // this.bussinessInfoForm.markAllAsTouched();
        // this.bankInfoForm.markAllAsTouched();

        if (this.leadDetailsForm.invalid) {
            this.opentab = 'LeadDetails'
            this.openAccordianTab('LeadDetails');

        } else if (this.officerInfoForm.invalid) {
            this.opentab = 'OfficerInfo'
            this.openAccordianTab('OfficerInfo')

        } else if (this.partnerInfoForm.invalid) {
            this.opentab = 'PartnerInfo'
            this.openAccordianTab('PartnerInfo')
        }
        // else if (this.bussinessInfoForm.invalid) {
        //     this.opentab = 'BusinessInfo'
        //     this.openAccordianTab('BusinessInfo')

        // } else if (this.bankInfoForm.invalid) {
        //     this.opentab = 'BankInfo'
        //     this.openAccordianTab('BankInfo')
        // }

        // &&
        // this.bussinessInfoForm.valid && this.bankInfoForm.valid
        if (this.leadDetailsForm.valid && this.officerInfoForm.valid && this.partnerInfoForm.valid) {
            try {
                if (this.partnerInfoForm.value.partner_dob && !Custom_Regex.date.test(this.partnerInfoForm.value.partner_dob)) {
                    this.commonService.showError('Invalid owner date of birth.');
                    this.commonService.hideSpinner();
                    return;
                }
                if (this.officerInfoForm.value.officer_dob && !Custom_Regex.date.test(this.officerInfoForm.value.officer_dob)) {
                    this.commonService.showError('Invalid owner date of birth.');
                    this.commonService.hideSpinner();
                    return;
                }
                if (this.leadDetailsForm.value.lead_business_started && !Custom_Regex.date.test(this.leadDetailsForm.value.lead_business_started)) {
                    this.commonService.showError('Invalid lead business started date.');
                    this.commonService.hideSpinner();
                    return;
                }
                let data = {
                    ...this.leadDetailsForm.value,
                    ...this.officerInfoForm.value,
                    ...this.partnerInfoForm.value,
                    // ...this.bussinessInfoForm.value,
                    // ...this.bankInfoForm.value,
                    partner_dob: this.partnerInfoForm.value.partner_dob ? this.partnerInfoForm.value.partner_dob : "",
                    lead_business_started: this.leadDetailsForm.value.lead_business_started ? this.leadDetailsForm.value.lead_business_started : "",
                    lead_anual_revenue: parseFloat(this.leadDetailsForm.value.lead_anual_revenue),
                    lead_monthly_revenue: parseFloat(this.leadDetailsForm.value.lead_monthly_revenue),
                    officer_dob: this.officerInfoForm.value.officer_dob ? this.officerInfoForm.value.officer_dob : "",
                    // partner_dob: this.formatter.format(this.bussinessInfoForm.value.partner_dob)
                };
                this.commonService.showSpinner();
                const res$ = this.apiService.postReq(API_PATH.FULL_VIEW_LEAD, data, 'lead', 'create');
                let response = await lastValueFrom(res$);
                if (response && response.data) {
                    this.commonService.showSuccess(response.message);
                    this.tabView = true;
                    this.fullViewLeadID = response.data.lead_id
                    // this.router.navigate([`/${this.userBaseRoute}/leads`]);
                    this.router.navigate([`/${this.userBaseRoute}/lead-detail/${this.fullViewLeadID}`]);
                    // this.redirect();
                } else {
                    this.commonService.showError(response.message);
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
            this.commonService.hideSpinner();
        }
    }

    get getUserRole() {
        return this.authService.getUserRole().toLowerCase();
    }

    redirect() {
        switch (this.userDetails.role) {
            case Roles.ADMINISTRATOR:
                this.router.navigate(['/admin/leads']);
                break;
            case Roles.COMPANY:
                this.router.navigate(['/company/leads']);
                break;
            case Roles.SUBMITTER:
                this.router.navigate([`/${this.getUserRole}`]);
                break;
            default:
                break;
        }
    }

    onCountryChange(countryId: any): void {
        this.getStates(countryId, false, '');

    }
    onofficerCountryChange(countryId: any): void {
        this.getOfficerStates(countryId, '');
    }
    onpartnerCountryChange(countryId: any): void {
        this.getPartnerStates(countryId, '');
    }
    onBankCountryChange(countryId: any): void {
        this.getBankStates(countryId);
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
                    this.leadDetailsForm.get('lead_country')?.patchValue(this.countriesList[i].id);
                    this.officerInfoForm.get('officer_country')?.patchValue(this.countriesList[i].id);
                    this.partnerInfoForm.get('partner_country')?.patchValue(this.countriesList[i].id);
                    this.bankInfoForm.get('bank_country')?.patchValue(this.countriesList[i].id);
                    this.getStates(this.countriesList[i].id, true, '');
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
     * @description get states list
     * @param country_id 
     * @author Shine Dezign Infonet Pvt. Ltd.
     */
    async getStates(country_id: string, forall: boolean, value: any) {
        try {
            this.commonService.showSpinner();
            const res$ = this.apiService.postReq(API_PATH.STATES, { country_id: country_id }, '', '');
            let response = await lastValueFrom(res$);
            if (response && response.data) {
                this.statesList = response.data;
                this.leadDetailsForm.patchValue({ lead_state: "" });
                if (forall) {
                    this.offStatesList = response.data;
                    this.partnerStatesList = response.data;
                    this.bankStatesList = response.data;
                } else if (value != '') {
                    setTimeout(() => {
                        let i = this.statesList.findIndex((e: any) => e.name == value);
                        if (i > -1) {
                            this.stateId = this.statesList[i].id;
                            this.leadDetailsForm.patchValue({ lead_state: this.stateId });

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
    async getOfficerStates(country_id: string, value: any) {
        try {
            this.commonService.showSpinner();
            const res$ = this.apiService.postReq(API_PATH.STATES, { country_id: country_id }, '', '');
            let response = await lastValueFrom(res$);
            if (response && response.data) {
                this.offStatesList = response.data;
                this.officerInfoForm.patchValue({ officer_state: "" });
                if (value != '') {
                    setTimeout(() => {
                        let i = this.offStatesList.findIndex((e: any) => e.name == value);
                        if (i > -1) {
                            this.stateId = this.offStatesList[i].id;
                            this.officerInfoForm.patchValue({ officer_state: this.stateId });

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
    async getPartnerStates(country_id: string, value: any) {
        try {
            this.commonService.showSpinner();
            const res$ = this.apiService.postReq(API_PATH.STATES, { country_id: country_id }, '', '');
            let response = await lastValueFrom(res$);
            if (response && response.data) {
                this.partnerStatesList = response.data;
                this.partnerInfoForm.patchValue({ partner_state: "" });
                if (value != '') {
                    setTimeout(() => {
                        let i = this.partnerStatesList.findIndex((e: any) => e.name == value);
                        if (i > -1) {
                            this.stateId = this.partnerStatesList[i].id;
                            this.partnerInfoForm.patchValue({ partner_state: this.stateId });

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

    async getBankStates(country_id: string) {
        try {
            this.commonService.showSpinner();
            const res$ = this.apiService.postReq(API_PATH.STATES, { country_id: country_id }, '', '');
            let response = await lastValueFrom(res$);
            if (response && response.data) {
                this.bankStatesList = response.data;
                this.bankInfoForm.patchValue({ bank_state: "" });

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

    async getLeadOptions() {
        try {
            let url = '';
            if(this.userRole == Roles.ADMINISTRATOR){
                  url = `?company_id=${this.companyID}`;
            }
            this.commonService.showSpinner();
            const res$ = this.apiService.getReq(API_PATH.LEAD_OPTIONS_LIST + url, '', '');
            let response = await lastValueFrom(res$);
            if (response && response.data) {
                this.bussinessTypeList = response.data.business_type;
                this.entityTypeList = response.data.entity_type;
                this.leadSourceList = response.data.lead_source;
                this.leadSourceList.sort((a, b) => a.name.localeCompare(b.name))
                this.leadStatusList = response.data.status;
                this.leadStatusList.sort((a, b) => a.name.localeCompare(b.name))
                this.campaignList = response.data.campaign;
                setTimeout(() => {
                    let data = this.leadStatusList.filter((e) => e.name == 'New Lead');
                  this.leadDetailsForm.get('lead_status')?.patchValue(data[0].id);
                })
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

    async getAssignedOptions() {
        try {
            // + `?role=${Roles.UNDERWRITER}`
            this.commonService.showSpinner();
            const res$ = this.apiService.getReq(API_PATH.LIST_FOR_USERS, 'user', 'list');
            let response = await lastValueFrom(res$);
            if (response && response.data) {
                this.assineesList = response.data;
                if (this.userDetails.role == 'Administrator' || this.userDetails.role == 'Company') {
                    this.leadDetailsForm.patchValue({
                        lead_assigned_to: ''
                    })
                    // console.log("idf",this.leadDetailsForm.value);

                } else {
                    this.leadDetailsForm.patchValue({
                        lead_assigned_to: this.userDetails.user_id
                    })
                    // console.log("else",this.leadDetailsForm.value);
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

    async getSubmitterList() {
        try {
            this.commonService.showSpinner();
            const res$ = this.apiService.getReq(API_PATH.LIST_FOR_USERS + `?role=${Roles.SUBMITTER}`, 'user', 'list');
            let response = await lastValueFrom(res$);
            if (response && response.data) {
                this.submittersList = response.data;
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
    checkBoxColor(value: any) {
        if (value == 'text') {
            this.colorCheckbox = true;
        } else {
            this.colorCheckbox = false;
        }
        if (value == 'email') {
            this.colorCheckbox2 = true;
        } else {
            this.colorCheckbox2 = false;
        } if (value == 'both') {
            this.colorCheckbox3 = true;
        } else {
            this.colorCheckbox3 = false;
        }

    }
}
