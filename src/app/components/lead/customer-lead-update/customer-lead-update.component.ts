import { ChangeDetectorRef, Component, ElementRef, Inject, Input, OnInit, ViewChild } from '@angular/core';
import { AbstractControl, FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DOCUMENT, Location } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { API_PATH } from '@constants/api-end-points';
import { Custom_Regex, Roles, Mask, SETTINGS } from '@constants/constants';
import { NgbAccordion, NgbCalendar, NgbDateParserFormatter, NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { ApiService } from '@services/api.service';
import { AuthService } from '@services/auth.service';
import { CommonService } from '@services/common.service';
import { lastValueFrom } from 'rxjs';
import Swal from 'sweetalert2';
import moment from 'moment';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import * as Constants from '@constants/constants';
import { MapsAPILoader } from '@agm/core';
import { GooglePlaceDirective } from 'ngx-google-places-autocomplete';
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
    selector: 'app-customer-lead-update',
    templateUrl: './customer-lead-update.component.html',
    styleUrls: ['../create-lead/create-lead.component.scss', '../../../styles/dashboard.scss', './customer-lead-update.component.scss']
})
export class CustomerLeadUpdateComponent implements OnInit {
    modal!: NgbModalRef;
    modal2!: NgbModalRef;
    leadID: string = '';
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
    docTypes: any[] = [];
    filesForm: FormGroup | any;
    selectedFiles: any[] = [];
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
    lead: any = {};
    leadOfficer: any = {};
    leadPartner: any = {};
    leadBusiness: any = {};
    leadBank: any = {};
    bankStatesList: Array<any> = [];
    customerSign: string = '';
    customer2Sign: string = '';
    uploadedDocsList: any[] = [];
    pendingDocs: any[] = [];
    uploading: boolean = false;
    dateFormat: string = '';
    timeZone: string = '';
    todayDate: string = '';
    leadFederalId: string = ''
    @ViewChild('acc', { static: false }) accordion!: NgbAccordion;
    @ViewChild('dbStarted', { static: false }) DBStarted!: ElementRef;
    @ViewChild('ownerDob', { static: false }) ownerDob!: ElementRef;
    @ViewChild('owner2Dob', { static: false }) owner2Dob!: ElementRef;
    isApiLoaded = false;
    @Input() options: Object = {};
    @ViewChild("placesRef") placesRef!: GooglePlaceDirective;
    stateId: string = ''
    countryIndex!: number;
    countryPartnerIndex!: number;
    countryOfficerIndex!: number;
    actualdocTypes: Array<any> = [];
    showLastTab: boolean = false;
    color: string = '#fa5440'
    userRole: string = '';

    constructor(
        private fb: FormBuilder,
        private commonService: CommonService,
        private apiService: ApiService,
        private calender: NgbCalendar,
        private formatter: NgbDateParserFormatter,
        private router: Router,
        private changeDetectorRef: ChangeDetectorRef,
        private authService: AuthService,
        private loc: Location,
        private route: ActivatedRoute,
        private el: ElementRef,
        private modalService: NgbModal,
        private ngxLoader: NgxUiLoaderService,
        private mapsAPILoader: MapsAPILoader,
        @Inject(DOCUMENT) private document: Document,
        private elementRef: ElementRef

    ) { }

    ngOnInit(): void {
        this.initLeadDetailsForm();
        this.initOfficerInfoForm();
        this.initPartnerInfoForm();
        this.initBussinessInfoForm();
        this.initBankInfoForm();
        this.getUserDetails();
        let d = new Date();
        let day: any = d.getDate();
        if (day.toString().length < 2) {
            day = '0' + day;
        }
        this.todayDate = `${((d.getMonth() + "1")).slice(-2)}-${day}-${d.getFullYear()}`
        // this.todayDate = `${d.getMonth() + 1}-${day}-${d.getFullYear()}`
        let params = this.route.snapshot.params;
        if (params && params['id']) {
            this.leadID = params['id'];
            this.getLeadDetails();
            // this.todayDate = this.calender.getToday();
            //    this.getSubmitterList();


        } else {
            this.commonService.showError('');
        }
        this.initForm();
        this.onDocumentsBtnClick();
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
            this.getPartnerStates(this.countriesList[this.countryPartnerIndex].id, false, value);

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
            this.getStates(this.countriesList[this.countryIndex].id, false, false, value);
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
        if (key == 'postal_code') {
            this.officerInfoForm.patchValue({
                officer_zip: value
            })
        } else if (key == 'country') {
            let i = this.countriesList.findIndex((e) => e.short_code === shortvalue);
            if (i > -1) {
                this.officerInfoForm.get('officer_country')?.patchValue(this.countriesList[i].id);
                this.countryOfficerIndex = i
            }
        } else if (key == 'administrative_area_level_1') {
            this.getOfficerStates(this.countriesList[this.countryOfficerIndex].id, false, value);

        } else if (key == 'locality') {
            this.officerInfoForm.patchValue({
                officer_city: value
            })
        }
        // else if (key == 'administrative_area_level_2') {
        //     this.officerInfoForm.patchValue({
        //         officer_city: value
        //     })

        // }
        return value;
    }

    initOwnerDob() {
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
    }
    onlineApplicationForm() {
        this.tabView = true;
        this.changeDetectorRef.detectChanges();
        setTimeout(() => {
            this.initOwner2Dob();
            this.initOwnerDob();
            this.initDbStarted();
        }, 0);
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

    // ngAfterViewInit() {
    //     // this.accordion.expandAll();
    // }

    async getOfficerData() {
        await this.getOfficerDetails();
        if (this.leadOfficer.officer_country) {
            await this.getOfficerStates(this.leadOfficer.officer_country, false, '');
        }
        this.patchOfficerInfo();
    }

    async getPartnerData() {
        await this.getPartnerDetails();
        if (this.leadPartner.partner_country) {
            await this.getPartnerStates(this.leadPartner.partner_country, false, '');
        }
        this.patchPartnerInfo();
    }

    async getBusinessData() {
        await this.getBusinessDetails();
        this.patchBusinessInfo();
    }

    async getBankData() {
        await this.getBankDetails();
        if (this.leadBank.bank_country) {
            await this.getBankStates(this.leadBank.bank_country, false);
        }
        this.patchBankInfo();

    }
    async changeFederalTax(value: any) {
        if (value) {
            this.leadFederalId = value;
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
                        lead_id: this.leadID,
                        company_id: this.leadDetailsForm.value.company_id,
                        federal_tax_id: value
                    }
                } else {
                    data = {
                        lead_id: this.leadID,
                        federal_tax_id: value
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
                            // cancelButtonText: 'Cancel'
                        }).then((result) => {
                            if (result.value) {
                                Swal.close()
                                // this.onLeadFormSubmit();

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

    async getLeadDetails() {
        try {
            this.commonService.showSpinner();
            const res$ = this.apiService.getReq(API_PATH.LEAD_EDIT_DETAIL + this.leadID, 'lead', 'view');
            let response = await lastValueFrom(res$);
            if (response && response.data) {
                this.lead = response.data;
                await this.getStates(this.lead.country_id, false, false, '');
                // get officer details, states and then patch values
                await this.getCountries();
                await this.getLeadOptions();
                this.patchBasicDetails();
                this.getOfficerData();
                this.getPartnerData();
                this.getBusinessData();
                this.getBankData();
                this.getSubmittersList();
                // this.getAssignedOptions();
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

    async getOfficerDetails() {
        try {
            const res$ = this.apiService.getReq(API_PATH.LEAD_OFFICER + this.leadID, 'lead', 'edit');
            let response = await lastValueFrom(res$);
            if (response && response.status_code == "200") {
                this.leadOfficer = response.data;
                return Promise.resolve();
            }
            return Promise.reject();
        } catch (error: any) {
            return Promise.reject(error);
        }
    }

    async getPartnerDetails() {
        try {
            const res$ = this.apiService.getReq(API_PATH.LEAD_PARTNER + this.leadID, 'lead', 'edit');
            let response = await lastValueFrom(res$);
            if (response && response.status_code == "200") {
                this.leadPartner = response.data;
                return Promise.resolve();
            }
            return Promise.reject();
        } catch (error: any) {
            return Promise.reject(error);
        }
    }


    async getBusinessDetails() {
        try {
            const res$ = this.apiService.getReq(API_PATH.LEAD_BUSINESS + this.leadID, 'lead', 'edit');
            let response = await lastValueFrom(res$);
            if (response && response.status_code == "200") {
                this.leadBusiness = response.data;
                return Promise.resolve();
            }
            return Promise.reject();
        } catch (error: any) {
            return Promise.reject(error);
        }
    }

    async getBankDetails() {
        try {
            const res$ = this.apiService.getReq(API_PATH.LEAD_BANK + this.leadID, 'lead', 'edit');
            let response = await lastValueFrom(res$);
            if (response && response.status_code == "200") {
                this.leadBank = response.data;
                return Promise.resolve();
            }
            return Promise.reject();
        } catch (error: any) {
            return Promise.reject(error);
        }
    }

    patchBasicDetails() {
        // this.commonService.showSpinner();
        this.leadDetailsForm.patchValue({
            first_name: this.lead.first_name,
            last_name: this.lead.last_name,
            company_name: this.lead.company_name,
            lead_doing_business_as: this.lead.lead_doing_business_as,
            email: this.lead.email,
            phone_number: this.lead.phone_number,
            lead_website: this.lead.lead_website,
            lead_fax: this.lead.lead_fax,
            lead_address: this.lead.lead_address,
            lead_other_address: this.lead.lead_other_address,
            lead_country: this.lead.country_id,
            lead_state: this.lead.state_id,
            lead_city: this.lead.lead_city,
            lead_zip: this.lead.lead_zip,
            lead_opt_drip_campaign: this.lead.lead_opt_drip_campaign,
            lead_work_place: this.lead.lead_work_place,
            lead_federal_tax_id: this.lead.lead_federal_tax_id,
            lead_business_started: this.lead.lead_business_started,
            lead_length_ownership: this.lead.lead_length_ownership,
            lead_entity_type: this.lead.lead_entity_type,
            lead_business_type: this.lead.lead_business_type,
            lead_product_sold: this.lead.lead_product_sold,
            lead_use_of_proceed: this.lead.lead_use_of_proceed,
            lead_anual_revenue: this.lead.lead_anual_revenue,
            funding_amount: this.lead.funding_amount,
            use_of_funds: this.lead.use_of_funds,
            average_monthly_sales: this.lead.average_monthly_sales,
            open_advances: this.lead.open_advances,
            lender: this.lead.lender,
            need_funding: this.lead.need_funding,
            lead_monthly_revenue: this.lead.lead_monthly_revenue,
            lead_requested_amount: this.lead.lead_requested_amount,
            lead_source: this.lead.lead_source,
            lead_status: this.lead.lead_status,
            lead_assigned_to: this.lead.lead_assigned_to,
            lead_disposition: this.lead.lead_disposition,
            lead_campaign: this.lead.lead_campaign,
            lead_markering_notification: this.lead.lead_markering_notification,
            company_id: this.lead.company_id,
            // submitter_id: this.lead.submitter_name,
            broker_email: this.lead.broker_email,
        });
        this.convertImageToBase64(this.lead.customer_sign);
        this.convertOwner2ImageToBase64(this.lead.other_customer_sign);
    }

    convertImageToBase64(imgUrl: any) {
        const image = new Image();
        image.crossOrigin = 'anonymous';
        image.onload = () => {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            canvas.height = image.naturalHeight;
            canvas.width = image.naturalWidth;
            ctx?.drawImage(image, 0, 0);
            const dataUrl = canvas.toDataURL();
            this.customerSign = dataUrl;
        }
        image.src = imgUrl;
    }
    convertOwner2ImageToBase64(imgUrl: any) {
        const image = new Image();
        image.crossOrigin = 'anonymous';
        image.onload = () => {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            canvas.height = image.naturalHeight;
            canvas.width = image.naturalWidth;
            ctx?.drawImage(image, 0, 0);
            const dataUrl = canvas.toDataURL();
            this.customer2Sign = dataUrl;
        }
        image.src = imgUrl;
    }


    patchOfficerInfo() {
        this.officerInfoForm.patchValue({
            officer_first_name: this.leadOfficer.officer_first_name,
            officer_last_name: this.leadOfficer.officer_last_name,
            officer_email: this.leadOfficer.officer_email,
            officer_dob: this.leadOfficer.officer_dob,
            officer_address: this.leadOfficer.officer_address,
            officer_other_address: this.leadOfficer.officer_other_address,
            officer_country: this.leadOfficer.officer_country,
            officer_state: this.leadOfficer.officer_state,
            officer_city: this.leadOfficer.officer_city,
            officer_zip: this.leadOfficer.officer_zip,
            officer_ssn: this.leadOfficer.officer_ssn,
            officer_cell: this.leadOfficer.officer_cell,
            officer_cell_other: this.leadOfficer.officer_cell_other,
            officer_home: this.leadOfficer.officer_home,
            officer_credit_score: this.leadOfficer.officer_credit_score,
            officer_ownership: this.leadOfficer.officer_ownership
        })

    }

    patchPartnerInfo() {
        this.partnerInfoForm.patchValue({
            partner_first_name: this.leadPartner.partner_first_name,
            partner_last_name: this.leadPartner.partner_last_name,
            partner_email: this.leadPartner.partner_email,
            partner_dob: this.leadPartner.partner_dob,
            partner_address: this.leadPartner.partner_address,
            partner_other_address: this.leadPartner.partner_other_address,
            partner_country: this.leadPartner.partner_country,
            partner_state: this.leadPartner.partner_state,
            partner_city: this.leadPartner.partner_city,
            partner_zip: this.leadPartner.partner_zip,
            partner_ssn: this.leadPartner.partner_ssn,
            partner_cell: this.leadPartner.partner_cell,
            partner_cell_other: this.leadPartner.partner_cell,
            partner_home: this.leadPartner.partner_home,
            partner_credit_score: this.leadPartner.partner_credit_score,
            partner_ownership: this.leadPartner.partner_ownership,
        })
    }

    patchBusinessInfo() {
        this.bussinessInfoForm.patchValue({
            business_first_name: this.leadBusiness.business_first_name,
            business_last_name: this.leadBusiness.business_last_name,
            business_landlord: this.leadBusiness.business_landlord,
            business_phone: this.leadBusiness.business_phone,
            business_option: this.leadBusiness.business_option === "lease" ? "2" : "1",
            business_monthly_rent: this.leadBusiness.business_monthly_rent,
        })
    }

    patchBankInfo() {
        this.bankInfoForm.patchValue({
            bank_account_name: this.leadBank.bank_account_name,
            bank_account: this.leadBank.bank_account,
            bank_routing: this.leadBank.bank_routing,
            bank: this.leadBank.bank,
            bank_country: this.leadBank.bank_country,
            bank_state: this.leadBank.bank_state,
            bank_city: this.leadBank.bank_city,
            bank_zip: this.leadBank.bank_zip,
        })

    }

    /**
     * 
     */
    patchValues() {
    }


    /**
     * @description back button
     */
    goBack() {
        this.loc.back();
    }

    /**
     * @description get logged in user details
     * @author Shine Dezign Infonet Pvt. Ltd.
     */
    getUserDetails() {
        let ud = this.authService.getUserDetails();

        if (ud) {
            this.userDetails = ud;
            this.userRole = ud.role;
            this.dateFormat = ud.date_format;
            this.timeZone = ud.time_zone;
            this.color = ud.color;
            switch (this.userDetails.role) {
                case Roles.ADMINISTRATOR:
                    this.getAssignedOptions();
                    this.getCompaniesList();
                    if (this.leadDetailsForm) {
                        this.leadDetailsForm.get('company_id')?.setValidators([Validators.required]);
                        this.leadDetailsForm.updateValueAndValidity();
                        this.leadDetailsForm.markAllAsTouched();
                    }
                    break;
                case Roles.COMPANY:
                    this.getAssignedOptions();
                    this.getSubmitterList();
                    // if (this.leadDetailsForm) {
                    //     this.leadDetailsForm.get('company_id')?.setValidators([]);
                    //     this.leadDetailsForm.updateValueAndValidity();
                    // }
                    break;
                case Roles.SUBMITTER:
                    this.getAssignedOptions();
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

    getDate(date: any) {
        return moment(date).tz(this.timeZone).format(`${this.dateFormat} hh:mm:ss A`)

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
            // this.commonService.showSpinner();
            const res$ = this.apiService.getReq(API_PATH.LIST_FOR_USERS + `?role=${Roles.COMPANY}`, 'user', 'list');
            let response = await lastValueFrom(res$);
            if (response && response.data) {
                // this.hasMoreCompanies = response.data.hasMorePages;
                this.companiesList = response.data;
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
        this.getSubmittersList();
        this.getUnderWritersList();
    }

    /**
     * 
     */
    async getSubmittersList() {
        try {
            // this.commonService.showSpinner();
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
            // this.commonService.showSpinner();
            const res$ = this.apiService.postReq(API_PATH.COMPANY_USERS, { role: Roles.UNDERWRITER, company_id: this.leadDetailsForm.value.company_id }, 'user', 'list');
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
                Validators.pattern(Custom_Regex.lettersOnly),
                Validators.minLength(3),
                Validators.maxLength(100)
            ]],
            last_name: ['', [
                Validators.required,
                Validators.pattern(Custom_Regex.lettersOnly),
                Validators.minLength(3),
                Validators.maxLength(100)
            ]],
            company_name: ['', [
                Validators.required,
                Validators.pattern(Custom_Regex.username),
                Validators.pattern(Custom_Regex.name),
                Validators.minLength(3),
                Validators.maxLength(100)
            ]],
            lead_doing_business_as: ['', [
                Validators.pattern(Custom_Regex.spaces),
                Validators.pattern(Custom_Regex.name),
                Validators.pattern(Custom_Regex.username),
                Validators.maxLength(100),
                Validators.minLength(3),
            ]],
            email: ['', [Validators.required, Validators.pattern(Custom_Regex.email)]],
            phone_number: ['', [Validators.required]],
            lead_website: ['', [Validators.pattern(Custom_Regex.website)]],
            lead_fax: ['', [Validators.pattern(Custom_Regex.digitsOnly)]],
            lead_address: ['', [
                Validators.pattern(Custom_Regex.spaces),
                Validators.maxLength(200)]],
            // Validators.pattern(Custom_Regex.address), 
            // Validators.pattern(Custom_Regex.address2), 
            // Validators.minLength(3),
            lead_other_address: ['', [
                Validators.pattern(Custom_Regex.spaces),
                Validators.minLength(3),
                Validators.pattern(Custom_Regex.address),
                Validators.pattern(Custom_Regex.address2),
                Validators.maxLength(200)]],
            lead_country: ['', [Validators.required,]],
            lead_state: [''],
            lead_city: ['', [
                Validators.maxLength(100),
                Validators.pattern(Custom_Regex.spaces)]],
            // Validators.minLength(3),
            // Validators.pattern(Custom_Regex.city),
            // Validators.pattern(Custom_Regex.name),
            lead_zip: [''],
            // , [Validators.pattern(Custom_Regex.digitsOnly)]
            lead_opt_drip_campaign: [''],
            lead_work_place: ['', [
                Validators.pattern(Custom_Regex.spaces),
                Validators.minLength(3),
                Validators.pattern(Custom_Regex.address),
                Validators.pattern(Custom_Regex.address2),
                Validators.maxLength(200)
            ]],
            lead_federal_tax_id: ['', [Validators.pattern(Custom_Regex.spaces)]],
            lead_business_started: [null],
            lead_length_ownership: ['', [
                Validators.pattern(Custom_Regex.spaces),
                Validators.pattern(Custom_Regex.digitsOnly),
            ]],
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
                Validators.pattern(Custom_Regex.amount)
            ]],
            funding_amount: ['', [
                Validators.pattern(Custom_Regex.spaces),
                Validators.pattern(Custom_Regex.amount)
            ]],
            use_of_funds: ['', [
                Validators.pattern(Custom_Regex.spaces)
            ]],
            average_monthly_sales: ['', [
                Validators.pattern(Custom_Regex.spaces),
                Validators.pattern(Custom_Regex.amount)
            ]],
            open_advances: [0],
            lender: ['', [
                Validators.pattern(Custom_Regex.spaces)]],
            need_funding: ['', [
                Validators.pattern(Custom_Regex.spaces)]],
            lead_monthly_revenue: ['', [
                Validators.pattern(Custom_Regex.spaces),
                Validators.pattern(Custom_Regex.amount)
            ]],
            lead_requested_amount: ['', [Validators.pattern(Custom_Regex.amount)]],
            lead_source: [''],
            lead_status: ['', [Validators.required,]],
            lead_assigned_to: [''],
            lead_disposition: [''],
            lead_campaign: [''],
            lead_markering_notification: ['', [Validators.required]],
            company_id: [null],
            // submitter_id: [null, [Validators.required]],
            broker_email: ['', [Validators.required, Validators.pattern(Custom_Regex.email)]],
        })
    }

    /**
     * @description get lead detail form controls
     */
    get lf(): { [key: string]: AbstractControl } {
        return this.leadDetailsForm.controls;
    }

    openAdvanceChange() {
        if (this.leadDetailsForm.value.open_advances == 1) {
            this.leadDetailsForm.get('lender')?.clearValidators();
            this.leadDetailsForm.get('lender')?.updateValueAndValidity();
        } else {
            this.leadDetailsForm.get('lender')?.clearValidators()
            this.leadDetailsForm.get('lender')?.updateValueAndValidity();
        }

    }

    /**
     * @description on next click in lead details form
     */
    async onLeadFormSubmit() {
        this.leadDetailsForm.markAllAsTouched();
        if (this.leadDetailsForm.value.open_advances == 1) {
            this.leadDetailsForm.get('lender')?.setValidators([Validators.required])
            this.leadDetailsForm.get('lender')?.updateValueAndValidity();
            this.leadDetailsForm.get('lender')?.markAsTouched();
        } else {
            this.leadDetailsForm.get('lender')?.clearValidators();
            this.leadDetailsForm.get('lender')?.updateValueAndValidity();
        }
        if (this.leadDetailsForm.valid) {
            try {
                if (this.leadDetailsForm.value.lead_business_started && !Custom_Regex.date.test(this.leadDetailsForm.value.lead_business_started)) {
                    this.commonService.showError('Invalid lead business started date.');
                    this.commonService.hideSpinner();
                    return;
                }
                this.commonService.showSpinner();
                let data = {
                    lead_id: this.leadID,
                    ...this.leadDetailsForm.value,
                    // lead_federal_tax_id: this.leadFederalId,
                    lead_federal_tax_id: this.leadDetailsForm.value.lead_federal_tax_id.includes("-") == true || this.leadDetailsForm.value.lead_federal_tax_id == '' ? this.leadDetailsForm.value.lead_federal_tax_id : this.leadDetailsForm.value.lead_federal_tax_id.slice(0, 2) + '-' + this.leadDetailsForm.value.lead_federal_tax_id.slice(2, this.leadDetailsForm.value.lead_federal_tax_id.length),
                    // lead_federal_tax_id:this.leadDetailsForm.value.lead_federal_tax_id? this.leadDetailsForm.value.lead_federal_tax_id.slice(0,2)+'-'+this.leadDetailsForm.value.lead_federal_tax_id.slice(2,this.leadDetailsForm.value.lead_federal_tax_id.length) : '',
                    lead_business_started: this.leadDetailsForm.value.lead_business_started ? this.leadDetailsForm.value.lead_business_started : "",
                    lead_anual_revenue: parseFloat(this.leadDetailsForm.value.lead_anual_revenue),
                    funding_amount: parseFloat(this.leadDetailsForm.value.funding_amount),
                    average_monthly_sales: parseFloat(this.leadDetailsForm.value.average_monthly_sales),
                    lead_monthly_revenue: parseFloat(this.leadDetailsForm.value.lead_monthly_revenue)
                }
                const res$ = this.apiService.postReq(API_PATH.LEAD_BASIC_DETAILS_SUBMIT, data, 'lead', 'edit');
                let response = await lastValueFrom(res$);
                if (response && response.data) {
                    this.commonService.showSuccess(response.message);
                    this.tabActive = {
                        id: 'OfficerInfo',
                        number: 2
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
        }
    }

    openfullView() {
        this.tabView = false;
        this.changeDetectorRef.detectChanges();
        this.opentab = this.tabActive.id;
        // this.openAccordianTab(this.tabActive.id);
        this.accordion.expandAll();
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
        setTimeout(() => {
            this.initOwner2Dob();
            this.initOwnerDob();
            this.initDbStarted();
        }, 0);
    }
    onNavChange() {
        this.changeDetectorRef.detectChanges();
        setTimeout(() => {
            this.initOwner2Dob();
            this.initOwnerDob();
            this.initDbStarted();
        }, 0);
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
                Validators.minLength(3),
                Validators.maxLength(100)
            ]],
            officer_email: ['', [Validators.pattern(Custom_Regex.email)]],
            officer_dob: [null],
            officer_address: ['', [
                Validators.pattern(Custom_Regex.spaces),
                Validators.maxLength(200)
            ]],
            // Validators.pattern(Custom_Regex.address), 
            // Validators.pattern(Custom_Regex.address2), 
            // Validators.maxLength(200),
            // Validators.minLength(3),
            officer_other_address: ['', [
                Validators.pattern(Custom_Regex.address),
                Validators.pattern(Custom_Regex.address2),
                Validators.maxLength(200),
                Validators.minLength(3),
            ]],
            officer_country: [''],
            officer_state: [''],
            officer_city: ['', [
                Validators.pattern(Custom_Regex.spaces),
                Validators.maxLength(100),
            ]],
            // Validators.minLength(3),
            // Validators.pattern(Custom_Regex.city),
            // Validators.pattern(Custom_Regex.name)
            officer_zip: [''],
            // , [Validators.pattern(Custom_Regex.digitsOnly)]
            officer_ssn: [''],
            officer_cell: [''],
            officer_cell_other: [''],
            officer_home: ['', [
                Validators.pattern(Custom_Regex.spaces),
                Validators.maxLength(100),
                Validators.minLength(3),
                Validators.pattern(Custom_Regex.address),
                Validators.pattern(Custom_Regex.address2)
            ]],
            officer_credit_score: ['', [
                Validators.pattern(Custom_Regex.spaces),
                Validators.pattern(Custom_Regex.digitsOnly)]],
            officer_ownership: ['', [
                Validators.pattern(Custom_Regex.amount),
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
        this.tabView = true;
        this.officerInfoForm.markAllAsTouched();
        this.commonService.showSpinner();

        if (this.officerInfoForm.valid) {
            if (this.officerInfoForm.value.officer_dob && !Custom_Regex.date.test(this.officerInfoForm.value.officer_dob)) {
                this.commonService.showError('Invalid owner date of birth.');
                this.commonService.hideSpinner();
                return;
            }
            try {
                let data = {
                    lead_id: this.leadID,
                    ...this.officerInfoForm.value,
                    officer_dob: this.officerInfoForm.value.officer_dob ? this.officerInfoForm.value.officer_dob : "",
                    // submitter_id: this.leadDetailsForm.value.submitter_id ? this.leadDetailsForm.value.submitter_id : ''
                };
                // this.commonService.showSpinner();
                const res$ = this.apiService.postReq(API_PATH.LEAD_OFFICER_DETAIL_SUBMIT, data, 'lead', 'edit');
                let response = await lastValueFrom(res$);
                if (response && response.data) {
                    this.commonService.showSuccess(response.message);
                    this.showLastTab = true
                    this.tabActive = {
                        id: 'PartnerInfo',
                        number: 3
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
            this.focusInvalidField()
        }

    }

    /**
     * @description on saving lead details form in full view
     */
    onsaveLeadForm() {
        this.leadDetailsForm.markAllAsTouched();
        if (this.leadDetailsForm.valid) {
            this.opentab = 'OfficerInfo';
            this.openAccordianTab('OfficerInfo');
            this.closeAccordianTab('LeadDetails');
            this.changeDetectorRef.detectChanges();
            this.initOwnerDob();
        } else {
            this.focusInvalidField();
        }
    }

    /**
     * @description on saving officer form (Full view)
     */
    onsaveOfficerForm() {
        this.officerInfoForm.markAllAsTouched();
        if (this.officerInfoForm.valid) {
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
                Validators.pattern(Custom_Regex.lettersOnly),
                Validators.minLength(3), Validators.maxLength(100)]],
            partner_last_name: ['', [Validators.pattern(Custom_Regex.lettersOnly), Validators.minLength(3), Validators.maxLength(100)]],
            partner_email: ['', [Validators.pattern(Custom_Regex.email)]],
            partner_dob: [null],
            partner_address: ['', [Validators.pattern(Custom_Regex.spaces), Validators.maxLength(200)]],
            partner_other_address: ['', [Validators.pattern(Custom_Regex.address), Validators.minLength(3),
            Validators.pattern(Custom_Regex.address2), Validators.maxLength(200)]],
            partner_country: [''],
            partner_state: [''],
            partner_city: ['', [Validators.pattern(Custom_Regex.spaces),
            Validators.maxLength(100)]],
            //  Validators.pattern(Custom_Regex.city),
            //  Validators.pattern(Custom_Regex.name),
            //  Validators.minLength(3),
            partner_zip: [''],
            // , [Validators.pattern(Custom_Regex.digitsOnly)]
            partner_ssn: [''],
            partner_cell: [''],
            partner_cell_other: [''],
            partner_home: ['', [
                Validators.pattern(Custom_Regex.spaces),
                Validators.maxLength(100),
                Validators.pattern(Custom_Regex.address),
                Validators.pattern(Custom_Regex.address2),
                Validators.minLength(3),
            ]],
            partner_credit_score: ['', [Validators.pattern(Custom_Regex.digitsOnly)]],
            partner_ownership: ['', [Validators.pattern(Custom_Regex.amount)]],
        })
    }
    async signedApplication(): Promise<void> {
        try {
            this.commonService.showSpinner();
            const res$ = this.apiService.getReq(API_PATH.EXPORT_PDF + `${this.leadID}`, 'lead', 'view');
            const response = await lastValueFrom(res$);
            if (response && response.status_code == "200") {
                // window.open(response.data, "_blank");
            }
            this.commonService.hideSpinner();
        } catch (error: any) {
            this.commonService.hideSpinner();
            this.commonService.showErrorMessage(error);
        }
    }
    async onPartnerInfoSubmit() {
        //add to upload document
        if (this.formFileArray.length) {
            this.uploadDocuments();
            this.commonService.hideSpinnerWithId('uploading');

        }
        this.partnerInfoForm.markAllAsTouched();
        if (this.partnerInfoForm.valid) {
            try {
                if (!this.customerSign) {
                    this.commonService.showError('Please add ownwer signature before submission');
                    return;
                }
                this.commonService.showSpinner();

                // if (!this.customer2Sign) {
                //     this.commonService.showError('Please add ownwer 2 signature before submission');
                //     return;
                // }
                if (this.partnerInfoForm.value.partner_dob && !Custom_Regex.date.test(this.partnerInfoForm.value.partner_dob)) {
                    this.commonService.showError('Invalid owner date of birth.');
                    this.commonService.hideSpinner();
                    return;
                }
                let data = {
                    lead_id: this.leadID,
                    ...this.partnerInfoForm.value,
                    partner_dob: this.partnerInfoForm.value.partner_dob ? this.partnerInfoForm.value.partner_dob : "",
                    // submitter_id: this.leadDetailsForm.value.submitter_id ? this.leadDetailsForm.value.submitter_id : '',
                    access_token: this.userDetails.access_token,
                    updated_by: 'merchant'

                };
                if (this.userDetails.role === Roles.CUSTOMER) {
                    data.sign = this.customerSign,
                        data.sign2 = this.customer2Sign
                }
                // this.commonService.showSpinner();
                const res$ = this.apiService.postReq(API_PATH.LEAD_PARTNER_DETAIL_SUBMIT, data, 'lead', 'edit');
                let response = await lastValueFrom(res$);
                if (response && response.data) {
                    this.commonService.showSuccess(response.message);
                    this.signedApplication();
                    this.tabActive = {
                        id: 'LeadDetails',
                        number: 5
                    }
                    this.redirect();
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
            this.focusInvalidField()
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
            business_first_name: ['', [Validators.pattern(Custom_Regex.lettersOnly), Validators.maxLength(100)]],
            business_last_name: ['', [Validators.pattern(Custom_Regex.lettersOnly), Validators.maxLength(100)]],
            business_landlord: ['', [Validators.pattern(Custom_Regex.spaces), Validators.maxLength(100)]],
            business_phone: [''],
            business_option: [''],
            business_monthly_rent: ['', [Validators.pattern(Custom_Regex.digitsOnly)]],
        })
    }

    async onBussinessInfoSubmit() {

        this.bussinessInfoForm.markAllAsTouched();

        if (this.bussinessInfoForm.valid) {
            try {
                let data = {
                    lead_id: this.leadID,
                    ...this.bussinessInfoForm.value,
                    // submitter_id: this.leadDetailsForm.value.submitter_id ? this.leadDetailsForm.value.submitter_id : ''
                    // partner_dob: this.formatter.format(this.bussinessInfoForm.value.partner_dob)
                };
                // this.commonService.showSpinner();
                const res$ = this.apiService.postReq(API_PATH.LEAD_BUSSINESS_DETAIL_SUBMIT, data, 'lead', 'edit');
                let response = await lastValueFrom(res$);
                if (response && response.data) {
                    this.commonService.showSuccess(response.message);
                    this.tabActive = {
                        id: 'BankInfo',
                        number: 5
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
            this.focusInvalidField()
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
            bank_city: ['', [Validators.pattern(Custom_Regex.spaces)]],
            bank_zip: ['', [Validators.pattern(Custom_Regex.spaces), Validators.maxLength(8)]],
        })
    }
    async onBankInfoSubmit() {
        this.bankInfoForm.markAllAsTouched();
        if (this.bankInfoForm.valid) {
            if (!this.customerSign) {
                this.commonService.showError('Please add ownwer signature before submission');
                return;
            }
            try {
                let data = {
                    lead_id: this.leadID,
                    ...this.bankInfoForm.value,
                    // submitter_id: this.leadDetailsForm.value.submitter_id ? this.leadDetailsForm.value.submitter_id : '',
                    access_token: this.userDetails.access_token
                };
                if (this.userDetails.role === Roles.CUSTOMER) {
                    data.sign = this.customerSign
                }
                // this.commonService.showSpinner();
                const res$ = this.apiService.postReq(API_PATH.LEAD_BANK_DETAIL_SUBMIT, data, 'lead', 'edit');
                let response = await lastValueFrom(res$);
                if (response && response.data) {
                    this.commonService.showSuccess(response.message);
                    this.tabActive = {
                        id: 'LeadDetails',
                        number: 5
                    }
                    this.redirect();
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
            this.focusInvalidField()
        }

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

    async updateLead() {
        try {
            this.leadDetailsForm.markAllAsTouched();
            this.officerInfoForm.markAllAsTouched();
            this.partnerInfoForm.markAllAsTouched();
            // this.bussinessInfoForm.markAllAsTouched();
            // this.bankInfoForm.markAllAsTouched();
            if (this.leadDetailsForm.invalid) {
                this.opentab = 'LeadDetails'
                this.accordion.collapseAll();
                this.openAccordianTab('LeadDetails');
            } else if (this.officerInfoForm.invalid) {
                this.opentab = 'OfficerInfo';
                this.accordion.collapseAll();
                this.openAccordianTab('OfficerInfo');
            } else if (this.partnerInfoForm.invalid) {
                this.opentab = 'PartnerInfo';
                this.accordion.collapseAll();
                this.openAccordianTab('PartnerInfo');
            }
            // else if (this.bussinessInfoForm.invalid) {
            //     this.opentab = 'BusinessInfo';
            //     this.accordion.collapseAll();
            //     this.openAccordianTab('BusinessInfo');
            // } else if (this.bankInfoForm.invalid) {
            //     this.opentab = 'BankInfo';
            //     this.accordion.collapseAll();
            //     this.openAccordianTab('BankInfo');
            // }
            // &&
            //     this.bussinessInfoForm.valid && this.bankInfoForm.valid
            if (this.leadDetailsForm.value.open_advances == 1) {
                this.leadDetailsForm.get('lender')?.setValidators([Validators.required])
                this.leadDetailsForm.get('lender')?.updateValueAndValidity();
                this.leadDetailsForm.get('lender')?.markAsTouched();
                this.commonService.hideSpinner();
            } else {
                this.leadDetailsForm.get('lender')?.clearValidators();
                this.leadDetailsForm.get('lender')?.updateValueAndValidity();
            }

            if (this.leadDetailsForm.valid && this.officerInfoForm.valid && this.partnerInfoForm.valid) {
                if (!this.customerSign) {
                    this.commonService.showError('Please add ownwer signature before submission');
                    return;
                }
                // if (!this.customer2Sign) {
                //     this.commonService.showError('Please add ownwer 2 signature before submission');
                //     return;
                // }
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
                    lead_id: this.leadID,
                    ...this.leadDetailsForm.value,
                    ...this.officerInfoForm.value,
                    ...this.partnerInfoForm.value,
                    ...this.bussinessInfoForm.value,
                    ...this.bankInfoForm.value,
                    partner_dob: this.partnerInfoForm.value.partner_dob ? this.partnerInfoForm.value.partner_dob : "",
                    lead_business_started: this.leadDetailsForm.value.lead_business_started ? this.leadDetailsForm.value.lead_business_started : "",
                    lead_anual_revenue: parseFloat(this.leadDetailsForm.value.lead_anual_revenue),
                    funding_amount: parseFloat(this.leadDetailsForm.value.funding_amount),
                    average_monthly_sales: parseFloat(this.leadDetailsForm.value.average_monthly_sales),
                    lead_monthly_revenue: parseFloat(this.leadDetailsForm.value.lead_monthly_revenue),
                    officer_dob: this.officerInfoForm.value.officer_dob ? this.officerInfoForm.value.officer_dob : "",
                };

                if (this.userDetails.role === Roles.CUSTOMER) {
                    data.sign = this.customerSign,
                        data.sign2 = this.customer2Sign
                }
                this.commonService.showSpinner();
                const res$ = this.apiService.postReq(API_PATH.FULL_VIEW_LEAD, data, 'lead', 'edit');
                let response = await lastValueFrom(res$);
                if (response && response.data) {
                    this.commonService.showSuccess(response.message);
                    this.redirect();
                } else {
                    this.commonService.showError(response.message);
                }
                this.commonService.hideSpinner();
            } else {
                this.focusInvalidField()
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


    redirect() {
        this.router.navigate(['/lead-submitted/' + this.leadDetailsForm.value.company_id]);
    }

    get userBaseRoute() {
        return this.authService.getUserRole().toLowerCase();
    }

    onCountryChange(countryId: any): void {
        this.getStates(countryId, false, true, '');
    }

    onofficerCountryChange(countryId: any): void {
        this.getOfficerStates(countryId, true, '');
    }

    onpartnerCountryChange(countryId: any): void {
        this.getPartnerStates(countryId, true, '');
    }
    onBankCountryChange(countryId: any): void {
        this.getBankStates(countryId, true);
    }
    async getBankStates(country_id: string, patchValue: boolean) {
        try {
            this.commonService.showSpinner();
            const res$ = this.apiService.postReq(API_PATH.STATES, { country_id: country_id }, '', '');
            let response = await lastValueFrom(res$);
            if (response && response.data) {
                this.bankStatesList = response.data;
                if (!patchValue) {
                    this.bankInfoForm.patchValue({ bank_state: "" });
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
            // this.commonService.showSpinner();
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
                    this.getBankStates(this.countriesList[i].id, true);
                }
            }
            this.commonService.hideSpinner();
            return Promise.resolve();
        } catch (error: any) {
            this.commonService.hideSpinner();
            if (error.error && error.error.message) {
                this.commonService.showError(error.error.message);
            } else {
                this.commonService.showError(error.message);
            }
            return Promise.reject();
        }
    }

    /**
     * @description get states list
     * @param country_id 
     * @author Shine Dezign Infonet Pvt. Ltd.
     */
    async getStates(country_id: string, forall: boolean, patchValue: boolean, value: any) {
        try {
            this.commonService.showSpinner();
            const res$ = this.apiService.postReq(API_PATH.STATES, { country_id: country_id }, '', '');
            let response = await lastValueFrom(res$);
            if (response && response.data) {
                this.statesList = response.data;
                if (!patchValue) {
                    this.leadDetailsForm.patchValue({ lead_state: "" });
                }
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
            return Promise.resolve()
        } catch (error: any) {

            this.commonService.hideSpinner();
            if (error.error && error.error.message) {
                this.commonService.showError(error.error.message);
            } else {
                this.commonService.showError(error.message);
            }
        }
    }
    async getOfficerStates(country_id: string, patchValue: boolean, value: any) {
        try {
            this.commonService.showSpinner();
            const res$ = this.apiService.postReq(API_PATH.STATES, { country_id: country_id }, '', '');
            let response = await lastValueFrom(res$);
            if (response && response.data) {
                this.offStatesList = response.data;
                if (!patchValue) {
                    this.officerInfoForm.patchValue({ officer_state: "" });
                } else if (value != '') {
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
    async getPartnerStates(country_id: string, patchValue: boolean, value: any) {
        try {
            this.commonService.showSpinner();
            const res$ = this.apiService.postReq(API_PATH.STATES, { country_id: country_id }, '', '');
            let response = await lastValueFrom(res$);
            if (response && response.data) {
                this.partnerStatesList = response.data;
                if (!patchValue) {
                    this.partnerInfoForm.patchValue({ partner_state: "" });
                } else if (value != '') {
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

    async getLeadOptions() {
        try {
            let url = '';
            if (this.userRole == Roles.CUSTOMER) {
                url = `?lead_id=${this.leadID}`;
            }
            // this.commonService.showSpinner();
            const res$ = this.apiService.getReq(API_PATH.LEAD_OPTIONS_LIST + url, '', '');
            let response = await lastValueFrom(res$);
            if (response && response.data) {
                this.bussinessTypeList = response.data.business_type;
                this.entityTypeList = response.data.entity_type;
                this.leadSourceList = response.data.lead_source;
                this.leadSourceList.sort((a, b) => a.name.localeCompare(b.name))
                this.leadStatusList = response.data.status;
                this.leadStatusList.sort((a, b) => a.name.localeCompare(b.name))
                this.campaignList = response.data.campaign
            }
            this.commonService.hideSpinner();
            return Promise.resolve();
        } catch (error: any) {
            this.commonService.hideSpinner();
            if (error.error && error.error.message) {
                this.commonService.showError(error.error.message);
            } else {
                this.commonService.showError(error.message);
            }
            return Promise.reject();
        }
    }

    async getAssignedOptions() {
        try {
            // this.commonService.showSpinner();
            const res$ = this.apiService.getReq(API_PATH.LIST_FOR_USERS + `?role=${Roles.UNDERWRITER}`, 'user', 'list');
            let response = await lastValueFrom(res$);
            if (response && response.data) {
                this.assineesList = response.data;
            }
            this.commonService.hideSpinner();
            return Promise.resolve();
        } catch (error: any) {
            this.commonService.hideSpinner();
            if (error.error && error.error.message) {
                this.commonService.showError(error.error.message);
            } else {
                this.commonService.showError(error.message);
            }
            return Promise.reject();
        }
    }

    async getSubmitterList() {
        try {
            // this.commonService.showSpinner();
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

    openModel(content: any) {
        try {
            this.modal = this.modalService.open(content, { backdrop: 'static' });
        } catch (error: any) {
            this.commonService.showError(error.message);
        }
    }

    closesecondOwnerModal() {
        this.modal2.close();
    }
    opensecondOwnerModel(content: any) {
        try {
            this.modal2 = this.modalService.open(content, { backdrop: 'static' });
        } catch (error: any) {
            this.commonService.showError(error.message);
        }
    }

    closeModal() {
        this.modal.close();
    }



    /**
     * @description get documents list
     */
    async getLeadDocuments() {
        try {
            this.commonService.showSpinner();
            let reqData: any = {
                lead_id: this.leadID,
                page: 1,
                records_per_page: 1000,
                uploaded_document_type: 'merchant'
            }

            const res$ = this.apiService.postReq(API_PATH.LEAD_DOCUMENTS, reqData, 'lead', 'document-list');
            let response = await lastValueFrom(res$);
            if (response && response.status_code == "200") {
                this.uploadedDocsList = response.data.documents;
                // for (let i = 0; i < this.uploadedDocsList.length; i++) {
                //     if (this.uploadedDocsList[i].document_type != 'other') {
                //         this.docTypes = this.docTypes.filter(e => e.value != this.uploadedDocsList[i].document_type)
                //     }
                // }
            } else {
                this.uploadedDocsList = [];
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

    async getDocumentTypes() {
        try {
            const res$ = this.apiService.getReq(API_PATH.DOCUMENT_TYPES, 'lead', 'document-list');
            const response = await lastValueFrom(res$);
            if (response && response.status_code == "200") {
                this.docTypes = response.data;
                // this.actualdocTypes = response.data
            }
        } catch (error) {
            this.commonService.showErrorMessage(error);
        }
    }

    async getPendingDocs() {
        try {
            this.commonService.showSpinner();
            const res$ = this.apiService.postReq(API_PATH.CUSTOMER_LEAD_DOCUMENT_TYPE, { lead_id: this.leadID }, 'lead', 'document-list');
            const response = await lastValueFrom(res$);
            if (response && response.status_code == "200") {
                this.pendingDocs = response.data;
                // this.createFormArray();
            } else {
                this.commonService.showError(response.message);
            }
            this.commonService.hideSpinner();
        } catch (error) {
            this.commonService.hideSpinner();
            this.commonService.showErrorMessage(error);
        }
    }

    createFormArray() {
        this.formFileArray.clear();
        for (let i = 0; i < this.pendingDocs.length; i++) {
            if (!this.pendingDocs[i].submitted) {
                this.addFileToFormArray(this.pendingDocs[i]);
            }
        }
    }

    addFileToFormArray(data: any) {
        this.formFileArray.push(this.fb.group({
            fileName: [''],
            doc_type: [data.value, [Validators.required]],
            doc_type_s: [data.text],
            doc_name: ['', [
                Validators.required,
                Validators.pattern(Custom_Regex.spaces),
                Validators.pattern(Custom_Regex.username),
                Validators.pattern(Custom_Regex.name),
                Validators.maxLength(100),
                Validators.minLength(3)
            ]],
            // doc_name: [''],
            // document_date: [null],
            file: ['', [Validators.required]],
            uploading: [false]
        }))
    }

    onDocumentsBtnClick() {
        if (!this.docTypes.length && !this.tabView) {
            this.getLeadDocuments();
            this.getPendingDocs();
        }
    }
    documentTabView() {
        if (!this.customerSign) {
            this.commonService.showError('Please add owner signature before uploading documents');
            return;
        }
        if (this.customerSign) {
            this.tabView = false;
        }
        this.onDocumentsBtnClick();
    }

    /**
     * 
     * @param files 
     */
    onFileChange(files: File[], input: any) {
        this.selectedFiles = [];
        for (let i = 0; i < files.length; i++) {
            if (files[i].size / 1024 / 1024 > 10) {
                this.commonService.showError('Maximum file size allowed is 10MB');
            } else if (!SETTINGS.ALLOWED_FILES.includes(files[i].type)) {
                this.commonService.showError('Invalid file type. Allowed file type are - gif|jpeg|png|txt|doc|docx|xlsx|xls|pdf|wav|mp3');
            } else {
                // this.selectedFiles.push(files[i]);
                this.addFileToForm(files[i])
                // this.formFileArray.at(index).patchValue({
                //     file: files[0],
                //     fileName: files[0].name
                // })
            }
        }
        input.value = '';
    }

    removeFileFromArray(i: number) {
        this.formFileArray.removeAt(i);
    }

    addFileToForm(file: File) {
        this.formFileArray.push(this.fb.group({
            fileName: [file.name],
            doc_type: ['', [Validators.required]],
            // doc_name: ['', [
            //     Validators.required, 
            //     Validators.pattern(Custom_Regex.spaces),
            //     Validators.pattern(Custom_Regex.username), 
            //     Validators.pattern(Custom_Regex.name),
            //     Validators.maxLength(100), 
            //     Validators.minLength(3)
            // ]],
            doc_name: [''],
            document_date: [null],
            doc_note: [''],
            file: [file]
        }))
    }

    get formFileArray() {
        return this.filesForm.get('files') as FormArray;
    }

    initForm() {
        this.filesForm = this.fb.group({
            files: this.fb.array([])
        })
    }


    /**
     * @description upload documents
     */
    async uploadDoc(i: number) {
        this.formFileArray.at(i).patchValue({
            uploading: true
        })
        this.commonService.showSpinnerWithId('uploading' + i);
        if (this.formFileArray.at(i).valid) {
            try {
                this.uploading = true;
                // this.ngxLoader.startLoader('loader1');

                const formData: FormData = new FormData();
                formData.append('document[]', this.formFileArray.value[i].file, this.formFileArray.value[i].fileName);
                formData.append('name[]', this.formFileArray.value[i].doc_name);
                formData.append('document_type[]', this.formFileArray.value[i].doc_type);
                formData.append('lead_id', this.leadID);
                const res$ = this.apiService.postReq(API_PATH.UPLOAD_LEAD_DOC, formData, 'lead', 'document-upload');
                const response = await lastValueFrom(res$);
                if (response && response.status_code == "200") {
                    this.commonService.showSuccess(response.message);
                    this.commonService.hideSpinnerWithId('uploading' + i);
                    this.getLeadDocuments();
                    // let index = this.pendingDocs.findIndex(e => e.value === this.formFileArray.value[i].doc_type);
                    // if (index > -1) {
                    //     if(this.formFileArray.value[i].doc_type != 'other'){
                    //         this.pendingDocs[index].submitted = true;
                    //         this.createFormArray();
                    //     }

                    // }
                    // let index = this.pendingDocs.findIndex(e => e.value === this.formFileArray.value[i].doc_type);
                    // if (index > -1) {
                    //     if(this.formFileArray.value[i].doc_type == 'bank_statements'){
                    //         this.pendingDocs[index].submitted = true;
                    //         this.createFormArray();
                    //     }

                    // }
                } else {
                    this.commonService.showError(response.message);
                    this.commonService.hideSpinnerWithId('uploading' + i);
                    this.formFileArray.at(i).patchValue({
                        uploading: false

                    })
                    // this.ngxLoader.stopLoader('loader1');
                }

            } catch (error) {
                this.commonService.hideSpinnerWithId('uploading' + i);
                this.commonService.showErrorMessage(error);
                this.formFileArray.at(i).patchValue({
                    uploading: false

                })
                // this.ngxLoader.stopLoader('loader1');
            }
        } else {
            this.commonService.showError("Please select document and enter document title.");
            this.commonService.hideSpinnerWithId('uploading' + i);
            this.formFileArray.at(i).patchValue({
                uploading: false
            })
        }
    }

    async uploadDocuments() {
        try {
            this.uploading = true;
            // let arr = [];
            if (this.formFileArray.length) {
                for (let i = 0; i < this.formFileArray.length; i++) {
                    // arr.push(this.filesForm.get('files')['controls'][i].controls.doc_type.value);
                    if (this.filesForm.get('files')['controls'][i].controls.document_date.value && !Constants.Custom_Regex.date.test(this.filesForm.get('files')['controls'][i].controls.document_date.value)) {
                        this.commonService.showError('Invalid document date.');
                        this.uploading = false;
                        this.commonService.hideSpinner();
                        return;
                    }
                    if (this.filesForm.get('files')['controls'][i].controls.doc_type.value == '3month_bank_statement') {
                        this.filesForm.get('files')['controls'][i].controls.document_date.setValidators(Validators.required);
                        this.filesForm.get('files')['controls'][i].controls.document_date.updateValueAndValidity();
                        this.filesForm.get('files')['controls'][i].controls.document_date.markAsTouched();
                        this.filesForm.get('files')['controls'][i].controls.doc_note.setValidators(Validators.pattern(Constants.Custom_Regex.spaces));
                        this.filesForm.get('files')['controls'][i].controls.doc_note.updateValueAndValidity();
                        this.filesForm.get('files')['controls'][i].controls.doc_note.markAsTouched();
                    } else {
                        this.filesForm.get('files')['controls'][i].controls.document_date.clearValidators();
                        this.filesForm.get('files')['controls'][i].controls.document_date.updateValueAndValidity();
                        this.filesForm.get('files')['controls'][i].controls.doc_note.clearValidators();
                        this.filesForm.get('files')['controls'][i].controls.doc_note.updateValueAndValidity();
                    }

                }
                for (let i = 0; i < this.formFileArray.length; i++) {
                    if (this.filesForm.get('files')['controls'][i].controls.doc_type.value != '3month_bank_statement') {
                        this.filesForm.get('files')['controls'][i].controls.doc_name.setValidators([Validators.required, Validators.pattern(Constants.Custom_Regex.spaces),
                        Validators.minLength(3),
                        Validators.maxLength(100),
                        Validators.pattern(Constants.Custom_Regex.username),
                        Validators.pattern(Constants.Custom_Regex.name)
                        ]);
                        this.filesForm.get('files')['controls'][i].controls.doc_name.updateValueAndValidity();
                        this.filesForm.get('files')['controls'][i].controls.doc_name.markAsTouched();
                    } else {
                        this.filesForm.get('files')['controls'][i].controls.doc_name.clearValidators();
                        this.filesForm.get('files')['controls'][i].controls.doc_name.updateValueAndValidity();
                    }

                }
                // for (let i = 0; i < arr.length; i++) {
                //     if (arr[i] != 'other') {
                //         if (arr.indexOf(arr[i]) !== arr.lastIndexOf(arr[i])) {
                //             this.commonService.showError('Duplicate document types are not allowed');
                //             this.uploading = false;
                //             this.commonService.hideSpinner();
                //             return;
                //         }
                //     }

                // }
                if (this.formFileArray.valid) {
                    const formData: FormData = new FormData();
                    for (let i = 0; i < this.formFileArray.value.length; i++) {
                        formData.append('uploaded_document_type[]', 'merchant');
                        formData.append('document[]', this.formFileArray.value[i].file, this.formFileArray.value[i].fileName);
                        if (this.filesForm.get('files')['controls'][i].controls.doc_type.value == '3month_bank_statement') {
                            formData.append('name[]', this.formFileArray.value[i].document_date);
                            formData.append('note[]', this.formFileArray.value[i].doc_note);
                        } else {
                            formData.append('name[]', this.formFileArray.value[i].doc_name);
                        }
                        formData.append('document_type[]', this.formFileArray.value[i].doc_type);
                    }
                    formData.append('lead_id', this.leadID);
                    this.uploading = true;
                    this.commonService.showSpinnerWithId('uploading');
                    const res$ = this.apiService.postReq(API_PATH.UPLOAD_LEAD_DOC, formData, 'lead', 'document-upload');
                    const response = await lastValueFrom(res$);
                    if (response && response.status_code == "200") {
                        this.commonService.showSuccess(response.message);
                        // for (let i = 0; i < this.formFileArray.value.length; i++) {
                        //     if (this.formFileArray.value[i].doc_type != 'other') {
                        //         this.docTypes = this.docTypes.filter(e => e.value != this.formFileArray.value[i].doc_type);
                        //     }
                        // }
                        this.uploading = false;
                        this.commonService.hideSpinnerWithId('uploading');
                        // for (let i = 0; i < this.formFileArray.value.length; i++) {
                        //     let index = this.pendingDocs.findIndex(e => e.value === this.formFileArray.value[i].doc_type);
                        //     if (index > -1) {
                        //         if(this.formFileArray.value[i].doc_type != 'other'){
                        //             this.pendingDocs[index].submitted = true;
                        //         }

                        //     }
                        // }
                        // for (let i = 0; i < this.formFileArray.value.length; i++) {
                        //     let index = this.pendingDocs.findIndex(e => e.value === this.formFileArray.value[i].doc_type);
                        //     if (index > -1) {
                        //         if(this.formFileArray.value[i].doc_type == 'bank_statements'){
                        //             this.pendingDocs[index].submitted = true;
                        //         }

                        //     }
                        // }
                        this.formFileArray.clear();
                        this.getLeadDocuments();
                        this.getPendingDocs();

                    } else {
                        this.uploading = false;
                        this.commonService.showError(response.message);
                        this.commonService.hideSpinnerWithId('uploading');
                    }
                } else {
                    this.formFileArray.markAllAsTouched();
                    this.uploading = false;
                }
            } else {
                this.commonService.showError('No file selected.')
                this.uploading = false;
            }
        } catch (error: any) {
            this.uploading = false;
            this.commonService.hideSpinnerWithId('uploading');
            this.commonService.hideSpinner();
            if (error.error && error.error.message) {
                this.commonService.showError(error.error.message);
            } else {
                this.commonService.showError(error.message);
            }
        }
    }


    /**
     * @description remove uploaded docs
     * @param i 
     */
    removeFile(i: number) {
        try {
            this.formFileArray.at(i).patchValue({ file: '' });
        } catch (error) {
            this.commonService.showErrorMessage(error);
        }
    }
    docsType(value: any, i: any) {
        if (this.filesForm.get('files')['controls'][i].controls.doc_type.value == '3month_bank_statement') {
            this.initDocumentDob();
            if (this.filesForm.get('files')['controls'][i].controls.document_date.value && !Constants.Custom_Regex.date.test(this.filesForm.get('files')['controls'][i].controls.document_date.value)) {
                this.commonService.showError('Invalid document date.');
                this.commonService.hideSpinner();
                return;
            }
            for (let i = 0; i < this.formFileArray.length; i++) {
                this.filesForm.get('files')['controls'][i].controls.document_date.setValidators(Validators.required);
                this.filesForm.get('files')['controls'][i].controls.document_date.updateValueAndValidity();
                this.filesForm.get('files')['controls'][i].controls.doc_note.setValidators(Validators.pattern(Constants.Custom_Regex.spaces));
                this.filesForm.get('files')['controls'][i].controls.doc_note.updateValueAndValidity();
            }
        } else {
            this.filesForm.get('files')['controls'][i].controls.doc_name.setValidators([
                Validators.required,
                Validators.pattern(Constants.Custom_Regex.spaces),
                Validators.minLength(3),
                Validators.maxLength(100),
                Validators.pattern(Constants.Custom_Regex.username),
                Validators.pattern(Constants.Custom_Regex.name)
            ]);
            this.filesForm.get('files')['controls'][i].controls.doc_name.updateValueAndValidity();
        }
    }
    documentDate() {
        this.initDocumentDob();
    }
    initDocumentDob() {
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
    leadDetailsLink(url1: any) {
        const url = url1;
        window.open(url, '_blank')
    }
    ngDoCheck(): void {
        let data1 = document.getElementsByClassName('ngx-progress-bar ngx-progress-bar-ltr')[0] as HTMLInputElement
        // data1.style.color=`${this.color}!important`;
        data1.setAttribute('style', `color:${this.color}!important`)
        let data2 = document.getElementsByClassName('ngx-foreground-spinner center-center')[0] as HTMLInputElement
        data2.setAttribute('style', `color:${this.color}!important`)

    }
}
