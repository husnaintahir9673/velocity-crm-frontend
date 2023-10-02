import { AfterViewInit, ChangeDetectorRef, Component, ElementRef, Inject, Input, OnInit, ViewChild } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DOCUMENT, Location } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { API_PATH } from '@constants/api-end-points';
import { Custom_Regex, Roles, Mask } from '@constants/constants';
import { NgbAccordion, NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
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
    selector: 'app-lead-edit',
    templateUrl: './lead-edit.component.html',
    styleUrls: ['../create-lead/create-lead.component.scss', './lead-edit.component.scss']
})
export class LeadEditComponent implements OnInit, AfterViewInit {
    modal!: NgbModalRef;
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
    todayDate: string = '';
    leadFederalId: string = ''
    leadFederaSubmit: boolean = false;
    @ViewChild('acc', { static: false }) accordion!: NgbAccordion;
    @ViewChild('dbStarted', { static: false }) DBStarted!: ElementRef;
    @ViewChild('ownerDob', { static: false }) ownerDob!: ElementRef;
    @ViewChild('owner2Dob', { static: false }) owner2Dob!: ElementRef;
    check: boolean = false;
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

    constructor(
        private fb: FormBuilder,
        private commonService: CommonService,
        private apiService: ApiService,
        private router: Router,
        private changeDetectorRef: ChangeDetectorRef,
        private authService: AuthService,
        private loc: Location,
        private route: ActivatedRoute,
        private el: ElementRef,
        private modalService: NgbModal,
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
        this.initOfficerInfoForm();
        this.initPartnerInfoForm();
        this.initBussinessInfoForm();
        this.initBankInfoForm();
        this.getUserDetails();
        let params = this.route.snapshot.params;
        if (params && params['id']) {
            this.leadID = params['id'];
            this.getLeadDetails();
            if (this.userDetails.role != Roles.ADMINISTRATOR) {
                this.getAssignedOptions();
            }
            //    this.getSubmitterList();


        } else {
            this.commonService.showError('');
        }
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
        console.log("gbyhfg", value);
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
            this.getPartnerStates(this.countriesList[this.countryPartnerIndex].id, false, value, 'loader');

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
            this.getStates(this.countriesList[this.countryIndex].id, false, false, value, 'loader');
        } else if (key == 'locality') {
            this.leadDetailsForm.patchValue({
                lead_city: value
            })
        }
        //  else if (key == 'administrative_area_level_2') {
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
            this.getOfficerStates(this.countriesList[this.countryOfficerIndex].id, false, value, 'loader');

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


    async getOfficerData() {
        await this.getOfficerDetails();
        if (this.leadOfficer.officer_country) {
            await this.getOfficerStates(this.leadOfficer.officer_country, false, '', 'noloader');
        }
        this.patchOfficerInfo();
    }

    async getPartnerData() {
        await this.getPartnerDetails();
        if (this.leadPartner.partner_country) {
            await this.getPartnerStates(this.leadPartner.partner_country, false, '', 'noloader');
        }
        this.patchPartnerInfo();
    }

    async getBusinessData() {
        await this.getBusinessDetails();
        this.patchBusinessInfo();
    }

    async getBankData() {
        await this.getBankDetails();
        if (!this.leadBank.bank_country) {
            let i = this.countriesList.findIndex((e) => e.name === "United States");
            if (i > -1) {
                this.leadBank.bank_country = this.countriesList[i].id;
            }
        }
        await this.getBankStates(this.leadBank.bank_country, false);
        this.patchBankInfo();

    }

    async changeFederalTax(value: any) {
        if (value) {
            if (value.length < 10) {
                this.check = false;
            }
            // this.leadFederalId = value; 
            let data = {}
            if (value.length == 10 && this.check == false) {


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
                            // federal_tax_id: value.replace(/-/g, "")
                        }
                    } else {
                        data = {
                            lead_id: this.leadID,
                            federal_tax_id: value
                            // federal_tax_id: value.replace(/-/g, "")
                        }
                    }

                    this.commonService.showSpinner();
                    const res$ = this.apiService.postReq(API_PATH.FEDERAL_TAX_ID, data, '', '');
                    let response = await lastValueFrom(res$);
                    if (response && response.data) {
                        this.check = true;
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
                await this.getStates(this.lead.country_id, false, false, '', 'noloader');
                // get officer details, states and then patch values
                await this.getCountries();
                await this.getLeadOptions();
                this.patchBasicDetails();
                this.getOfficerData();
                this.getPartnerData();
                // this.getBusinessData();
                // this.getBankData();
                // this.getSubmittersList();
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
        let lead_source = '';
        for (let i = 0; i < this.leadSourceList.length; i++) {
            let i = this.leadSourceList.findIndex((e) => e.id === this.lead.lead_source);
            if (i > -1) {
                lead_source = this.lead.lead_source;
            } else {
                lead_source = ''
            }

        }
        let lead_status = '';
        for (let i = 0; i < this.leadStatusList.length; i++) {
            let i = this.leadStatusList.findIndex((e) => e.id === this.lead.lead_status);
            if (i > -1) {
                lead_status = this.lead.lead_status;
            } else {
                lead_status = ''
            }

        }


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
            // lead_federal_tax_id: this.lead.lead_federal_tax_id ==='-'?'':this.lead.lead_federal_tax_id,
            lead_federal_tax_id: this.lead.lead_federal_tax_id == '-' ? '' : this.lead.lead_federal_tax_id,
            lead_business_started: this.lead.lead_business_started,
            lead_length_ownership: this.lead.lead_length_ownership,
            lead_entity_type: this.lead.lead_entity_type,
            lead_business_type: this.lead.lead_business_type,
            lead_product_sold: this.lead.lead_product_sold,
            lead_use_of_proceed: this.lead.lead_use_of_proceed,
            lead_anual_revenue: this.lead.lead_anual_revenue,
            lead_monthly_revenue: this.lead.lead_monthly_revenue,
            lead_requested_amount: this.lead.lead_requested_amount,
            lead_source: lead_source,
            lead_status: lead_status,
            lead_assigned_to: this.lead.lead_assigned_to,
            lead_disposition: this.lead.lead_disposition,
            lead_campaign: this.lead.lead_campaign,
            lead_markering_notification: this.lead.lead_markering_notification,
            company_id: this.lead.company_id,
            // submitter_id: this.lead.submitter_name,
            broker_email: this.lead.broker_email,
        });
        if (this.lead.lead_markering_notification == 'text') {
            this.colorCheckbox = true;
        } else {
            this.colorCheckbox = false;
        }
        if (this.lead.lead_markering_notification == 'email') {
            this.colorCheckbox2 = true;
        } else {
            this.colorCheckbox2 = false;
        } if (this.lead.lead_markering_notification == 'both') {
            this.colorCheckbox3 = true;
        } else {
            this.colorCheckbox3 = false;
        }
        // this.leadFederalId=this.leadDetailsForm.get('lead_federal_tax_id')?.value;

        if (this.userDetails.role == Roles.ADMINISTRATOR) {
            this.getUnderWritersList();
        }
        // this.commonService.hideSpinner();


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
            this.userRole = ud.role;
            this.userDetails = ud;
            this.getColorOnUpdate();
            this.style = { fill: ud?.color };
            this.color = ud?.color;
            // this.stroke={stroke:ud?.color};

            this.background = { background: ud?.color };

            switch (this.userDetails.role) {
                case Roles.ADMINISTRATOR:
                    // this.getAssignedOptions();
                    this.getCompaniesList();
                    if (this.leadDetailsForm) {
                        this.leadDetailsForm.get('company_id')?.setValidators([Validators.required]);
                        this.leadDetailsForm.updateValueAndValidity();
                        // this.leadDetailsForm.markAllAsTouched();
                    }
                    break;
                case Roles.COMPANY:
                    // this.getAssignedOptions();
                    this.getSubmitterList();
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
        // this.getSubmittersList();
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
            // role: Roles.UNDERWRITER,
            // this.commonService.showSpinner();
            const res$ = this.apiService.postReq(API_PATH.COMPANY_USERS, { company_id: this.leadDetailsForm.value.company_id }, 'user', 'list');
            let response = await lastValueFrom(res$);
            if (response && response.data) {
                this.assineesList = response.data;
                // this.leadDetailsForm.patchValue({
                //     lead_assigned_to:  this.lead.lead_assigned_to
                // })
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
            last_name: ['', [Validators.required, Validators.pattern(Custom_Regex.spaces), Validators.pattern(Custom_Regex.lettersOnly), Validators.maxLength(100), Validators.minLength(3)]],
            company_name: ['', [Validators.required, Validators.pattern(Custom_Regex.spaces), Validators.pattern(Custom_Regex.name), Validators.pattern(Custom_Regex.username), Validators.minLength(3), Validators.maxLength(100)]],
            lead_doing_business_as: ['', [Validators.minLength(3), Validators.pattern(Custom_Regex.address), Validators.pattern(Custom_Regex.address2), Validators.maxLength(200)]],
            email: ['', [Validators.required, Validators.pattern(Custom_Regex.email)]],
            phone_number: ['', [Validators.required]],
            lead_website: ['', [Validators.pattern(Custom_Regex.website)]],
            lead_fax: ['', [Validators.pattern(Custom_Regex.digitsOnly)]],
            lead_address: ['', [Validators.maxLength(200), Validators.pattern(Custom_Regex.spaces),]],
            lead_other_address: ['', [Validators.minLength(3), Validators.pattern(Custom_Regex.address), Validators.pattern(Custom_Regex.address2), Validators.maxLength(200)]],
            lead_country: ['', [Validators.required,]],
            lead_state: [''],
            lead_city: ['', [Validators.pattern(Custom_Regex.spaces), Validators.maxLength(100)]],
            // ,Validators.minLength(3),Validators.pattern(Custom_Regex.spaces), Validators.pattern(Custom_Regex.city), Validators.pattern(Custom_Regex.name),
            lead_zip: [''],
            // , [Validators.pattern(Custom_Regex.digitsOnly)]
            lead_opt_drip_campaign: [''],
            lead_work_place: ['', [Validators.minLength(3), Validators.pattern(Custom_Regex.address), Validators.pattern(Custom_Regex.address2), Validators.maxLength(200)]],
            lead_federal_tax_id: [''],
            lead_business_started: [null],
            lead_length_ownership: ['', [Validators.pattern(Custom_Regex.spaces), Validators.pattern(Custom_Regex.digitsOnly)]],
            lead_entity_type: [''],
            lead_business_type: [''],
            lead_product_sold: ['', [Validators.minLength(3), Validators.pattern(Custom_Regex.spaces), Validators.pattern(Custom_Regex.address), Validators.pattern(Custom_Regex.address2), Validators.maxLength(50)]],
            lead_use_of_proceed: ['', [Validators.minLength(3), Validators.pattern(Custom_Regex.spaces), Validators.pattern(Custom_Regex.address), Validators.pattern(Custom_Regex.address2), Validators.maxLength(100)]],
            lead_anual_revenue: ['', [Validators.pattern(Custom_Regex.spaces), Validators.pattern(Custom_Regex.amount)]],
            lead_monthly_revenue: ['', [Validators.pattern(Custom_Regex.spaces), Validators.pattern(Custom_Regex.amount),]],
            lead_requested_amount: ['', [Validators.pattern(Custom_Regex.amount), Validators.maxLength(50)]],
            lead_source: ['', [Validators.required]],
            lead_status: ['', [Validators.required]],
            // , [Validators.required]
            lead_assigned_to: [''],
            lead_disposition: [''],
            lead_campaign: [''],
            lead_markering_notification: ['', [Validators.required]],
            company_id: [null],
            // submitter_id: [null, [Validators.required]],
            broker_email: ['', [Validators.required, Validators.pattern(Custom_Regex.email),]],
        })
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
        this.leadDetailsForm.markAllAsTouched();
        if (this.leadDetailsForm.valid) {
            try {
                if (this.leadDetailsForm.value.lead_business_started && !Custom_Regex.date.test(this.leadDetailsForm.value.lead_business_started)) {
                    this.commonService.showError('Invalid lead business started date.');
                    this.commonService.hideSpinner();
                    return;
                }
                console.log("mjih", this.leadDetailsForm.value.lead_federal_tax_id.includes("-"));

                let data = {
                    lead_id: this.leadID,
                    ...this.leadDetailsForm.value,

                    // lead_federal_tax_id:this.leadDetailsForm.value.lead_federal_tax_id === this.leadDetailsForm.value.lead_federal_tax_id? this.leadDetailsForm.value.lead_federal_tax_id: this.leadDetailsForm.value.lead_federal_tax_id.slice(0,2)+'-'+this.leadDetailsForm.value.lead_federal_tax_id.slice(2,this.leadDetailsForm.value.lead_federal_tax_id.length),
                    lead_federal_tax_id: this.leadDetailsForm.value.lead_federal_tax_id.includes("-") == true || this.leadDetailsForm.value.lead_federal_tax_id == '' ? this.leadDetailsForm.value.lead_federal_tax_id : this.leadDetailsForm.value.lead_federal_tax_id.slice(0, 2) + '-' + this.leadDetailsForm.value.lead_federal_tax_id.slice(2, this.leadDetailsForm.value.lead_federal_tax_id.length),
                    //  this.leadDetailsForm.value.lead_federal_tax_id? this.leadDetailsForm.value.lead_federal_tax_id.slice(0,2)+'-'+this.leadDetailsForm.value.lead_federal_tax_id.slice(2,this.leadDetailsForm.value.lead_federal_tax_id.length) : '',

                    lead_business_started: this.leadDetailsForm.value.lead_business_started ? this.leadDetailsForm.value.lead_business_started : "",
                    lead_anual_revenue: parseFloat(this.leadDetailsForm.value.lead_anual_revenue),
                    lead_monthly_revenue: parseFloat(this.leadDetailsForm.value.lead_monthly_revenue)
                }
                // if (Roles.SUBMITTER === this.userDetails.role) {
                //     data.submitter_id = this.lead.submitter_id;
                // }
                // this.commonService.showSpinner();
                const res$ = this.apiService.postReq(API_PATH.LEAD_BASIC_DETAILS_SUBMIT, data, 'lead', 'edit');
                let response = await lastValueFrom(res$);
                if (response && response.data) {
                    this.commonService.showSuccess(response.message);
                    this.tabActive = {
                        id: 'OfficerInfo',
                        number: 2
                    }
                    if (this.officerInfoForm.value.officer_first_name == '' || this.officerInfoForm.value.officer_last_name == '') {
                        this.officerInfoForm.patchValue({ officer_first_name: this.leadDetailsForm.value.first_name });
                        this.officerInfoForm.patchValue({ officer_last_name: this.leadDetailsForm.value.last_name });
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

    // openfullView() {
    //     this.tabView = false;
    //     this.changeDetectorRef.detectChanges();
    //     this.opentab = this.tabActive.id;
    //     // ***8 this.openAccordianTab(this.tabActive.id);
    //     this.accordion.expandAll();
    //     setTimeout(() => {
    //         this.initOwner2Dob();
    //         this.initOwnerDob();
    //         this.initDbStarted();
    //     }, 0);
    // }
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

    onNavChange() {
        this.changeDetectorRef.detectChanges();

        setTimeout(() => {
            this.initOwner2Dob();
            this.initOwnerDob();
            this.initDbStarted();
        }, 0);
    }
    closeAlltabs() {
        this.accordion.collapseAll();
    }

    //officer info

    /**
     * @description init officer form
     */
    initOfficerInfoForm() {
        this.officerInfoForm = this.fb.group({
            officer_first_name: ['', [Validators.pattern(Custom_Regex.spaces), Validators.pattern(Custom_Regex.lettersOnly), Validators.minLength(3), Validators.maxLength(100)]],
            officer_last_name: ['', [Validators.pattern(Custom_Regex.spaces), Validators.pattern(Custom_Regex.lettersOnly), Validators.minLength(3), Validators.maxLength(100)]],
            officer_email: ['', [Validators.pattern(Custom_Regex.email),]],
            officer_dob: [null],
            officer_address: ['', [Validators.maxLength(200), Validators.pattern(Custom_Regex.spaces),]],
            // Validators.minLength(3),Validators.pattern(Custom_Regex.address),Validators.pattern(Custom_Regex.address2), 
            officer_other_address: ['', [Validators.minLength(3), Validators.pattern(Custom_Regex.address), Validators.pattern(Custom_Regex.address2), Validators.maxLength(200)]],
            officer_country: [''],
            officer_state: [''],
            officer_city: ['', [Validators.pattern(Custom_Regex.spaces), Validators.maxLength(100)]],
            // Validators.minLength(3),, Validators.pattern(Custom_Regex.name), Validators.pattern(Custom_Regex.city), 
            officer_zip: [''],
            // , [Validators.pattern(Custom_Regex.digitsOnly)]
            officer_ssn: [''],
            officer_cell: [''],
            officer_cell_other: [''],
            officer_home: ['', [Validators.minLength(3), Validators.pattern(Custom_Regex.address), Validators.pattern(Custom_Regex.address2), Validators.maxLength(200)]],
            officer_credit_score: ['', [Validators.pattern(Custom_Regex.digitsOnly),]],
            officer_ownership: ['', [Validators.pattern(Custom_Regex.amount)]],
        })
    }

    /**
     * @description get lead detail form controls
     */
    get oif(): { [key: string]: AbstractControl } {
        return this.officerInfoForm.controls;
    }

    async onOfficerInfoSubmit() {
        this.officerInfoForm.markAllAsTouched();

        if (this.officerInfoForm.valid) {
            try {
                if (this.officerInfoForm.value.officer_dob && !Custom_Regex.date.test(this.officerInfoForm.value.officer_dob)) {
                    this.commonService.showError('Invalid owner date of birth.');
                    this.commonService.hideSpinner();
                    return;
                }
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
            if (this.leadDetailsForm.value.lead_business_started && !Custom_Regex.date.test(this.leadDetailsForm.value.lead_business_started)) {
                this.commonService.showError('Invalid lead business started date.');
                this.commonService.hideSpinner();
                return;
            }
            this.opentab = 'OfficerInfo';
            this.openAccordianTab('OfficerInfo');
            this.closeAccordianTab('LeadDetails');
            if (this.officerInfoForm.value.officer_first_name == '' || this.officerInfoForm.value.officer_last_name == '') {
                this.officerInfoForm.patchValue({ officer_first_name: this.leadDetailsForm.value.first_name });
                this.officerInfoForm.patchValue({ officer_last_name: this.leadDetailsForm.value.last_name });
            }
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
                Validators.minLength(3), Validators.pattern(Custom_Regex.spaces), Validators.pattern(Custom_Regex.lettersOnly), Validators.maxLength(100)]],
            partner_last_name: ['', [
                Validators.minLength(3), Validators.pattern(Custom_Regex.spaces), Validators.pattern(Custom_Regex.lettersOnly), Validators.maxLength(100)]],
            partner_email: ['', [Validators.pattern(Custom_Regex.spaces), Validators.pattern(Custom_Regex.email),]],
            partner_dob: [null],
            partner_address: ['', [
                Validators.maxLength(200), Validators.pattern(Custom_Regex.spaces)]],
            //    Validators.minLength(3),Validators.pattern(Custom_Regex.address),Validators.pattern(Custom_Regex.address2), 
            partner_other_address: ['', [Validators.minLength(3),
            Validators.pattern(Custom_Regex.address), Validators.pattern(Custom_Regex.address2), Validators.maxLength(200)]],
            partner_country: [''],
            partner_state: [''],
            partner_city: ['', [
                Validators.pattern(Custom_Regex.spaces), Validators.maxLength(100)]],
            // Validators.minLength(3),, Validators.pattern(Custom_Regex.city),
            partner_zip: [''],
            // , [Validators.pattern(Custom_Regex.digitsOnly), Validators.maxLength(5)]
            partner_ssn: [''],
            partner_cell: [''],
            partner_cell_other: [''],
            partner_home: ['', [
                Validators.minLength(3),
                Validators.pattern(Custom_Regex.address),
                Validators.pattern(Custom_Regex.address2),
                Validators.pattern(Custom_Regex.spaces), Validators.maxLength(200)]],
            partner_credit_score: ['', [Validators.pattern(Custom_Regex.digitsOnly),]],
            partner_ownership: ['', [Validators.pattern(Custom_Regex.amount)]],
        })
    }

    async onPartnerInfoSubmit() {
        this.partnerInfoForm.markAllAsTouched();

        if (this.partnerInfoForm.valid) {
            try {
                if (this.partnerInfoForm.value.partner_dob && !Custom_Regex.date.test(this.partnerInfoForm.value.partner_dob)) {
                    this.commonService.showError('Invalid owner date of birth.');
                    this.commonService.hideSpinner();
                    return;
                }
                let data = {
                    lead_id: this.leadID,
                    ...this.partnerInfoForm.value,
                    partner_dob: this.partnerInfoForm.value.partner_dob ? this.partnerInfoForm.value.partner_dob : "",
                    // submitter_id: this.leadDetailsForm.value.submitter_id ? this.leadDetailsForm.value.submitter_id : ''
                };
                // this.commonService.showSpinner();
                const res$ = this.apiService.postReq(API_PATH.LEAD_PARTNER_DETAIL_SUBMIT, data, 'lead', 'edit');
                let response = await lastValueFrom(res$);
                if (response && response.data) {
                    this.commonService.showSuccess(response.message);
                    // this.tabActive = {
                    //     id: 'BusinessInfo',
                    //     number: 4
                    // }
                    // this.redirect();
                    this.router.navigate([`/${this.userBaseRoute}/lead-detail/${this.leadID}`]);
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
            bank_zip: ['', [Validators.pattern(Custom_Regex.spaces), Validators.maxLength(5)]],
        })
    }
    async onBankInfoSubmit() {
        this.bankInfoForm.markAllAsTouched();
        if (this.bankInfoForm.valid) {

            try {
                let data = {
                    lead_id: this.leadID,
                    ...this.bankInfoForm.value,
                    // submitter_id: this.leadDetailsForm.value.submitter_id ? this.leadDetailsForm.value.submitter_id : ''
                };
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
            if (this.leadDetailsForm.valid && this.officerInfoForm.valid && this.partnerInfoForm.valid) {
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
                    // ...this.bussinessInfoForm.value,
                    // ...this.bankInfoForm.value,
                    partner_dob: this.partnerInfoForm.value.partner_dob ? this.partnerInfoForm.value.partner_dob : "",
                    lead_business_started: this.leadDetailsForm.value.lead_business_started ? this.leadDetailsForm.value.lead_business_started : "",
                    lead_anual_revenue: parseFloat(this.leadDetailsForm.value.lead_anual_revenue),
                    lead_monthly_revenue: parseFloat(this.leadDetailsForm.value.lead_monthly_revenue),
                    officer_dob: this.officerInfoForm.value.officer_dob ? this.officerInfoForm.value.officer_dob : "",
                };
                // if (Roles.SUBMITTER === this.userDetails.role) {
                //     data.submitter_id = this.lead.submitter_id;
                // }
                this.commonService.showSpinner();
                const res$ = this.apiService.postReq(API_PATH.FULL_VIEW_LEAD, data, 'lead', 'edit');
                let response = await lastValueFrom(res$);
                if (response && response.data) {
                    this.commonService.showSuccess(response.message);
                    // this.redirect();
                    this.router.navigate([`/${this.userBaseRoute}/lead-detail/${this.leadID}`]);
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
        switch (this.userDetails.role) {
            case Roles.ADMINISTRATOR:
                this.router.navigate(['/admin/leads']);
                break;
            case Roles.COMPANY:
                this.router.navigate(['/company/leads']);
                break;
            case Roles.SUBMITTER:
                this.router.navigate([`/${this.userBaseRoute}`]);
                break;
            default:
                this.router.navigate([`/${this.userBaseRoute}`]);
                break;
        }
    }

    get userBaseRoute() {
        return this.authService.getUserRole().toLowerCase();
    }

    onCountryChange(countryId: any): void {
        this.getStates(countryId, false, true, '', 'loader');
    }

    onofficerCountryChange(countryId: any): void {
        this.getOfficerStates(countryId, true, '', 'loader');
    }

    onpartnerCountryChange(countryId: any): void {
        this.getPartnerStates(countryId, true, '', 'loader');
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
    async getStates(country_id: string, forall: boolean, patchValue: boolean, value: any, loaderValue: any) {
        try {
            if (loaderValue == 'loader') {
                this.commonService.showSpinner();
            }
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
    async getOfficerStates(country_id: string, patchValue: boolean, value: any, loaderValue: any) {
        try {
            if (loaderValue == 'loader') {
                this.commonService.showSpinner();
            }
            // this.commonService.showSpinner();
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
    async getPartnerStates(country_id: string, patchValue: boolean, value: any, loaderValue: any) {
        try {
            if (loaderValue == 'loader') {
                this.commonService.showSpinner();
            }
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
            if (this.userRole == Roles.ADMINISTRATOR) {
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
            // + `?role=${Roles.UNDERWRITER}`
            // this.commonService.showSpinner();
            const res$ = this.apiService.getReq(API_PATH.LIST_FOR_USERS, 'user', 'list');
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

    closeModal() {
        this.modal.close();
    }

    async onLeadFormSave() {
        this.leadDetailsForm.markAllAsTouched();
        if (this.leadDetailsForm.valid) {
            try {
                if (this.leadDetailsForm.value.lead_business_started && !Custom_Regex.date.test(this.leadDetailsForm.value.lead_business_started)) {
                    this.commonService.showError('Invalid lead business started date.');
                    this.commonService.hideSpinner();
                    return;
                }
                let data = {
                    lead_id: this.leadID,
                    ...this.leadDetailsForm.value,
                    // lead_federal_tax_id:  this.leadDetailsForm.value.lead_federal_tax_id,
                    lead_federal_tax_id: this.leadDetailsForm.value.lead_federal_tax_id.includes("-") == true || this.leadDetailsForm.value.lead_federal_tax_id == '' ? this.leadDetailsForm.value.lead_federal_tax_id : this.leadDetailsForm.value.lead_federal_tax_id.slice(0, 2) + '-' + this.leadDetailsForm.value.lead_federal_tax_id.slice(2, this.leadDetailsForm.value.lead_federal_tax_id.length),
                    // lead_federal_tax_id:this.leadDetailsForm.value.lead_federal_tax_id.includes('-') === true? this.leadDetailsForm.value.lead_federal_tax_id: this.leadDetailsForm.value.lead_federal_tax_id.slice(0,2)+'-'+this.leadDetailsForm.value.lead_federal_tax_id.slice(2,this.leadDetailsForm.value.lead_federal_tax_id.length),


                    lead_business_started: this.leadDetailsForm.value.lead_business_started ? this.leadDetailsForm.value.lead_business_started : "",
                    lead_anual_revenue: parseFloat(this.leadDetailsForm.value.lead_anual_revenue),
                    lead_monthly_revenue: parseFloat(this.leadDetailsForm.value.lead_monthly_revenue)
                }
                // if (Roles.SUBMITTER === this.userDetails.role) {
                //     data.submitter_id = this.lead.submitter_id;
                // }
                this.commonService.showSpinner();
                const res$ = this.apiService.postReq(API_PATH.LEAD_BASIC_DETAILS_SUBMIT, data, 'lead', 'edit');
                let response = await lastValueFrom(res$);
                if (response && response.data) {
                    this.commonService.hideSpinner();
                    this.commonService.showSuccess(response.message);
                    this.router.navigate([`/${this.userBaseRoute}/lead-detail/${this.leadID}`]);

                    // this.tabActive = {
                    //     id: 'OfficerInfo',
                    //     number: 2
                    // }
                    if (this.officerInfoForm.value.officer_first_name == '' || this.officerInfoForm.value.officer_last_name == '') {
                        this.officerInfoForm.patchValue({ officer_first_name: this.leadDetailsForm.value.first_name });
                        this.officerInfoForm.patchValue({ officer_last_name: this.leadDetailsForm.value.last_name });
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
