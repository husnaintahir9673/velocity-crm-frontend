import { Component, ElementRef, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { API_PATH } from '@constants/api-end-points';
import { Custom_Regex, Mask } from '@constants/constants';
import { NgbAccordion, NgbCalendar, NgbDateStruct, NgbModal, NgbModalRef, NgbPanelChangeEvent } from '@ng-bootstrap/ng-bootstrap';
import { ApiService } from '@services/api.service';
import { AuthService } from '@services/auth.service';
import { CommonService } from '@services/common.service';
import { lastValueFrom, Subscription } from 'rxjs';
import * as Constants from '@constants/constants';
import Swal from 'sweetalert2';
import { NgxUiLoaderService } from 'ngx-ui-loader';

@Component({
    selector: 'app-send-grid-credentials',
    templateUrl: './send-grid-credentials.component.html',
    styleUrls: ['./send-grid-credentials.component.scss']
})
export class SendGridCredentialsComponent implements OnInit {
    addUserForm!: FormGroup;
    addTwilioForm!: FormGroup;
    twilioValidation: boolean = false;
    ExpConfigValidation: boolean = false;
    MoneythumbValidation: boolean = false;
    DecissionLgcValidation: boolean = false;
    DataMerchValidation: boolean = false;
    EmailConfgValidation: boolean = false;
    helloSgnValidation: boolean = false;
    addHelloSignForm!: FormGroup;
    addExperianForm!: FormGroup;
    addMoneyThumbForm!: FormGroup;
    addDataMerchForm!: FormGroup;
    addDecisionLogicForm!: FormGroup
    countriesList: Array<any> = [];
    statesList: Array<any> = [];
    rolesList: Array<any> = [];
    mask = Mask;
    maxDate!: NgbDateStruct;
    filesForm!: FormGroup;
    selectedFiles: any[] = [];
    // uploadingEmailConfigurations: boolean = false;
    // uploadingTwilioConfigurations: boolean = false;
    // uploadingExperianConfigurations: boolean = false;
    // uploadingHelloSignConfigurations: boolean = false;
    // uploadingMoneyThumbConfigurations: boolean = false;
    // uploadingDecisionConfigurations: boolean = false;
    emailConfigurationsDetails: any = {};
    twilioConfigurationsDetails: any = {};
    experianConfigurationsDetails: any = {};
    hellosignConfigurationsDetails: any = {};
    moneythumbConfigurationsDetails: any = {};
    decisionConfigurationsDetails: any = {};
    dataMerchConfigurationsDetails: any = {};
    canUpdateEmailConfigurations: boolean = false;
    userDetails: any = {};
    passwordType: boolean = true;
    passwordAuthType: boolean = true;
    passwordEmailType: boolean = true;
    moneyThumbpasswordType: boolean = true;
    dataMerchpasswordType: boolean = true;
    modal!: NgbModalRef;
    @ViewChild('acc', { static: false }) accordion!: NgbAccordion;
    @ViewChild('uccacc', { static: false }) uccaccordion!: NgbAccordion;
    @ViewChild('expscoreacc', { static: false }) expscoreaccordion!: NgbAccordion;
    @ViewChild('expacc', { static: false }) expaccordion!: NgbAccordion;
    @ViewChild('dataacc', { static: false }) dataaccordion!: NgbAccordion;
    @ViewChild('hellosignacc', { static: false }) hellosignaccordion!: NgbAccordion;
    @ViewChild('dataMerchacc', { static: false }) dataMerchacc!: NgbAccordion;
    colorSubs!: Subscription;
    background!: { background: string; };
    style!: { fill: string; };
    loaderColour!: string;
    color!: string;

    constructor(
        private fb: FormBuilder,
        private apiService: ApiService,
        private commonService: CommonService,
        private router: Router,
        private el: ElementRef,
        private calendar: NgbCalendar,
        private authService: AuthService,
        private modalService: NgbModal,
        private ngxLoader: NgxUiLoaderService

    ) { }

    ngOnInit(): void {
        this.initAddUserForm();
        this.initAddTwilioForm();
        this.initAddHelloSignForm();
        this.initAddExperianForm();
        this.initMoneyThumbForm();
        this.initDecisionLogicForm();
        this.initDataMerchForm();
        this.addUserForm.patchValue({ type: 'SendGrid' })
        this.maxDate = this.calendar.getToday();
        this.getUserDetails();
        this.canUpdateEmailConfigurations = this.authService.hasPermission('email-configuration-update');
        if (this.addUserForm.value.type == 'SMTP') {
            this.addUserForm.get('host')?.setValidators([
                Validators.required,
                Validators.pattern(Custom_Regex.spaces),
                Validators.pattern(Custom_Regex.username),
                Validators.pattern(Custom_Regex.name),
                Validators.maxLength(100),
                Validators.minLength(3)
            ]);
            this.addUserForm.get('username')?.setValidators([
                Validators.required,
                Validators.pattern(Custom_Regex.spaces),
                Validators.pattern(Custom_Regex.username),
                Validators.pattern(Custom_Regex.name),
                Validators.maxLength(100),
                Validators.minLength(3)
            ]);
            this.addUserForm.get('password')?.setValidators([
                Validators.required,
                Validators.pattern(Custom_Regex.spaces),
            ]);
            this.addUserForm.get('security_layer')?.setValidators([
                Validators.required,
            ]);
            this.addUserForm.get('smtp_status')?.setValidators([
                Validators.required,
            ]);
            this.addUserForm.updateValueAndValidity();
        } else {
            this.addUserForm.get('from_name')?.setValidators([
                Validators.required,
                Validators.pattern(Custom_Regex.spaces),
                Validators.pattern(Custom_Regex.username),
                Validators.pattern(Custom_Regex.name),
                Validators.maxLength(100),
                Validators.minLength(3)
            ]);
            this.addUserForm.get('from')?.setValidators([Validators.required, Validators.pattern(Custom_Regex.email)]);
            this.addUserForm.get('api_key')?.setValidators([
                Validators.required, Validators.pattern(Custom_Regex.spaces)
            ]);
            this.addUserForm.get('reply_from')?.setValidators([
                Validators.required, Validators.pattern(Custom_Regex.email)
            ]);
            this.addUserForm.get('sendgrid_status')?.setValidators([
                Validators.required,
            ]);
            this.addUserForm.updateValueAndValidity();
        }


    }

    toggle(ID: string) {
        setTimeout(() => this.accordion.toggle(ID), 0);
        if (this.accordion.activeIds[0] != 'EmailConfiguration') {
            this.getEmailConfigurations();
        }
    }
    toggleUcc(ID: string) {
        setTimeout(() => this.uccaccordion.toggle(ID), 0);
        if (this.uccaccordion.activeIds[0] != 'TwilioConfiguration') {
            this.getTwilioConfigurations();
        }
    }
    toggleExpScore(ID: string) {
        setTimeout(() => this.expscoreaccordion.toggle(ID), 0);
        if (this.expscoreaccordion.activeIds[0] != 'MoneyThumbConfiguration') {
            this.getMoneyThumbConfigurations();
        }

    }
    toggleExp(ID: string) {
        setTimeout(() => this.expaccordion.toggle(ID), 0);
        if (this.expaccordion.activeIds[0] != 'ExpConfiguration') {
            this.getExperianConfigurations();
        }

    }
    toggledataMerch(ID: string) {
        setTimeout(() => this.dataaccordion.toggle(ID), 0);
        if (this.dataaccordion.activeIds[0] != 'DecisionLogicConfiguration') {
            this.getDecisionConfigurations();
        }
    }
    togglehelloSign(ID: string) {
        setTimeout(() => this.hellosignaccordion.toggle(ID), 0);
        if (this.hellosignaccordion.activeIds[0] != 'HelloSignConfiguration') {
            this.getHelloSignConfigurations();
        }
    }
    toggledataMerchConfigurations(ID: string) {
        setTimeout(() => this.dataMerchacc.toggle(ID), 0);
        if (this.dataMerchacc.activeIds[0] != 'DataMerchConfiguration') {
            this.getDataMerchConfig();
        }
    }


    /**
     * @description get form controls
     * @author Shine Dezign Infonet Pvt. Ltd.
     */
    get f(): { [key: string]: AbstractControl } {
        return this.addUserForm.controls;
    }
    getUserDetails() {
        let ud = this.authService.getUserDetails();
        if (ud) {
            this.userDetails = ud;
            this.getColorOnUpdate();
            this.style = { fill: ud?.color };
            this.loaderColour = ud?.color;
            this.color = ud?.color;
            // this.stroke={stroke:ud?.color};
            this.background = { background: ud?.color };

        }
    }
    getColorOnUpdate() {
        this.colorSubs = this.authService.getColor().subscribe((u) => {
            this.getUserDetails();
        });
    }


    /**
     * @description initialize add compnay form
     * @author Shine Dezign Infonet Pvt. Ltd.
     * @returns {void}
     */
    initAddUserForm(): void {
        this.addUserForm = this.fb.group({
            type: ['', [Validators.required]],
            from_name: [''],
            from: [''],
            api_key: [''],
            reply_from: [''],
            host: [''],
            username: [''],
            password: [''],
            security_layer: [1],
            sendgrid_status: [false],
            smtp_status: [false]

        })

    }
    initAddTwilioForm(): void {
        this.addTwilioForm = this.fb.group({
            twilio_sid: ['', [
                Validators.required,
                Validators.pattern(Custom_Regex.spaces),
                Validators.pattern(Custom_Regex.username),
                Validators.pattern(Custom_Regex.name),
                Validators.maxLength(100),
                Validators.minLength(3)
            ]],
            status: [0, [Validators.required]],
            twilio_auth_token: ['', [Validators.required, Validators.pattern(Custom_Regex.spaces)]],
            twilio_from: ['', [Validators.required]],

        })
    }
    get t(): { [key: string]: AbstractControl } {
        return this.addTwilioForm.controls;
    }
    initAddHelloSignForm(): void {
        this.addHelloSignForm = this.fb.group({
            hello_sign_api_key: ['', [Validators.required, Validators.pattern(Custom_Regex.spaces)]],
            hello_sign_enviroment: [0, [Validators.required]],

        })
    }
    get h(): { [key: string]: AbstractControl } {
        return this.addHelloSignForm.controls;
    }
    initAddExperianForm(): void {
        this.addExperianForm = this.fb.group({
            url: ['', [Validators.required, Validators.pattern(Custom_Regex.website), Validators.maxLength(100)]],
            subscriber_code: ['', [Validators.required, Validators.pattern(Custom_Regex.digitsOnly), Validators.maxLength(20),
            Validators.minLength(3)]],
            username: ['', [Validators.required, Validators.pattern(Custom_Regex.username), Validators.pattern(Custom_Regex.spaces), Validators.maxLength(100),
            Validators.minLength(3)]],
            password: ['', [Validators.required, Validators.pattern(Custom_Regex.spaces)]],
            client_id: ['', [Validators.required, Validators.pattern(Custom_Regex.spaces)]],
            secret_id: ['', [Validators.required, Validators.pattern(Custom_Regex.spaces)]],

        })
    }
    get e(): { [key: string]: AbstractControl } {
        return this.addExperianForm.controls;
    }
    initMoneyThumbForm(): void {
        this.addMoneyThumbForm = this.fb.group({
            money_thumb_token: ['', [Validators.required, Validators.pattern(Custom_Regex.spaces)]],
            money_thumb_user: ['', [Validators.required, Validators.pattern(Custom_Regex.email)]],
            money_thumb_password: ['', [Validators.required, Validators.pattern(Custom_Regex.spaces)]],

        })
    }
    get m(): { [key: string]: AbstractControl } {
        return this.addMoneyThumbForm.controls;
    }
    initDecisionLogicForm(): void {
        this.addDecisionLogicForm = this.fb.group({
            dl_service_key: ['', [Validators.required, Validators.pattern(Custom_Regex.username), Validators.pattern(Custom_Regex.name), Validators.pattern(Custom_Regex.spaces)]],
            dl_site_user_guid: ['', [Validators.required, Validators.pattern(Custom_Regex.spaces)]],
            dl_profile_guid: ['', [Validators.required, Validators.pattern(Custom_Regex.spaces)]],

        })
    }
    get d(): { [key: string]: AbstractControl } {
        return this.addDecisionLogicForm.controls;
    }
    initDataMerchForm(): void {
        this.addDataMerchForm = this.fb.group({
            data_merch_username: ['', [Validators.required, Validators.pattern(Custom_Regex.spaces)]],
            data_merch_password: ['', [Validators.required, Validators.pattern(Custom_Regex.spaces)]],

        })
    }
    get merch(): { [key: string]: AbstractControl } {
        return this.addDataMerchForm.controls;
    }
    changeSendGridStatus() {
        if (this.addUserForm.value.sendgrid_status == true) {
            Swal.fire({
                title: 'Are you sure want to enabled sendgrid status and disabled smtp status',
                icon: 'warning',
                showCancelButton: true,
                confirmButtonText: 'OK',
                confirmButtonColor: "#f0412e",
                // cancelButtonText: 'OK'
            }).then((result) => {
                if (result.value) {
                    Swal.close();
                    this.addUserForm.patchValue({
                        smtp_status: false,
                    });

                } else if (result.dismiss === Swal.DismissReason.cancel) {
                    this.addUserForm.patchValue({
                        sendgrid_status: false,
                    });
                    Swal.close()
                }
            })
        }
    }
    changeSmtpStatus() {
        if (this.addUserForm.value.smtp_status == true) {
            Swal.fire({
                title: 'Are you sure want to enabled smtp status and disabled sendgrid status',
                icon: 'warning',
                showCancelButton: true,
                confirmButtonText: 'OK',
                confirmButtonColor: "#f0412e",
                // cancelButtonText: 'OK'
            }).then((result) => {
                if (result.value) {
                    Swal.close();
                    this.addUserForm.patchValue({
                        sendgrid_status: false,
                    });

                } else if (result.dismiss === Swal.DismissReason.cancel) {
                    this.addUserForm.patchValue({
                        smtp_status: false,
                    });
                    Swal.close()
                }
            })
        }
    }
    changeType(type: any) {
        this.addUserForm.markAsUntouched();
        if (type == 'SMTP') {
            this.addUserForm.get('host')?.setValidators([
                Validators.required,
                Validators.pattern(Custom_Regex.spaces),
                Validators.pattern(Custom_Regex.username),
                Validators.pattern(Custom_Regex.name),
                Validators.maxLength(100),
                Validators.minLength(3)
            ]);
            this.addUserForm.get('username')?.setValidators([
                Validators.required,
                Validators.pattern(Custom_Regex.spaces),
                Validators.pattern(Custom_Regex.username),
                Validators.pattern(Custom_Regex.name),
                Validators.maxLength(100),
                Validators.minLength(3)
            ]);
            this.addUserForm.get('password')?.setValidators([
                Validators.required,
                Validators.pattern(Custom_Regex.spaces),
            ]);
            this.addUserForm.get('security_layer')?.setValidators([
                Validators.required,
            ]);
            this.addUserForm.get('smtp_status')?.setValidators([
                Validators.required,
            ]);
            this.addUserForm.updateValueAndValidity();
        } else {
            this.addUserForm.get('from_name')?.setValidators([
                Validators.required,
                Validators.pattern(Custom_Regex.spaces),
                Validators.pattern(Custom_Regex.username),
                Validators.pattern(Custom_Regex.name),
                Validators.maxLength(100),
                Validators.minLength(3)
            ]);
            this.addUserForm.get('from')?.setValidators([Validators.required, Validators.pattern(Custom_Regex.email)]);
            this.addUserForm.get('api_key')?.setValidators([
                Validators.required, Validators.pattern(Custom_Regex.spaces)
            ]);
            this.addUserForm.get('reply_from')?.setValidators([
                Validators.required, Validators.pattern(Custom_Regex.email)
            ]);
            this.addUserForm.get('sendgrid_status')?.setValidators([
                Validators.required,
            ]);
            this.addUserForm.updateValueAndValidity();
        }
    }

    /**
     * @description on add company submit
     * @author Shine Dezign Infonet Pvt. Ltd.
     * @returns { Promise<void> }
     */
    async addUserSubmit(): Promise<void> {
        if (this.addUserForm.value.type == 'SMTP') {
            this.addUserForm.get('from_name')?.clearValidators();
            this.addUserForm.get('from_name')?.updateValueAndValidity();
            this.addUserForm.get('from')?.clearValidators()
            this.addUserForm.get('from')?.updateValueAndValidity();
            this.addUserForm.get('api_key')?.clearValidators()
            this.addUserForm.get('api_key')?.updateValueAndValidity();
            this.addUserForm.get('reply_from')?.clearValidators()
            this.addUserForm.get('reply_from')?.updateValueAndValidity();
            this.addUserForm.get('sendgrid_status')?.clearValidators()
            this.addUserForm.get('sendgrid_status')?.updateValueAndValidity();
            this.addUserForm.get('host')?.setValidators([
                Validators.required,
                Validators.pattern(Custom_Regex.spaces),
                Validators.pattern(Custom_Regex.username),
                Validators.pattern(Custom_Regex.name),
                Validators.maxLength(100),
                Validators.minLength(3)
            ]);
            this.addUserForm.get('username')?.setValidators([
                Validators.required,
                Validators.pattern(Custom_Regex.spaces),
                Validators.pattern(Custom_Regex.username),
                Validators.pattern(Custom_Regex.name),
                Validators.maxLength(100),
                Validators.minLength(3)
            ]);
            this.addUserForm.get('password')?.setValidators([
                Validators.required,
                Validators.pattern(Custom_Regex.spaces),
            ]);
            this.addUserForm.get('security_layer')?.setValidators([
                Validators.required,
            ]);
            this.addUserForm.get('smtp_status')?.setValidators([
                Validators.required,
            ]);
            this.addUserForm.updateValueAndValidity();
            this.addUserForm.get('password')?.markAsTouched();
            this.addUserForm.get('host')?.markAsTouched();
            this.addUserForm.get('username')?.markAsTouched();
            this.addUserForm.get('security_layer')?.markAsTouched();
            this.addUserForm.get('smtp_status')?.markAsTouched();
        } else {
            this.addUserForm.get('host')?.clearValidators();
            this.addUserForm.get('host')?.updateValueAndValidity();
            this.addUserForm.get('username')?.clearValidators()
            this.addUserForm.get('username')?.updateValueAndValidity();
            this.addUserForm.get('password')?.clearValidators()
            this.addUserForm.get('password')?.updateValueAndValidity();
            this.addUserForm.get('security_layer')?.clearValidators()
            this.addUserForm.get('security_layer')?.updateValueAndValidity();
            this.addUserForm.get('smtp_status')?.clearValidators()
            this.addUserForm.get('smtp_status')?.updateValueAndValidity();
            this.addUserForm.get('from_name')?.setValidators([
                Validators.required,
                Validators.pattern(Custom_Regex.spaces),
                Validators.pattern(Custom_Regex.username),
                Validators.pattern(Custom_Regex.name),
                Validators.maxLength(100),
                Validators.minLength(3)
            ]);
            this.addUserForm.get('from')?.setValidators([Validators.required, Validators.pattern(Custom_Regex.email)]);
            this.addUserForm.get('api_key')?.setValidators([
                Validators.required, Validators.pattern(Custom_Regex.spaces)
            ]);
            this.addUserForm.get('reply_from')?.setValidators([
                Validators.required, Validators.pattern(Custom_Regex.email)
            ]);
            this.addUserForm.get('sendgrid_status')?.setValidators([
                Validators.required,
            ]);
            this.addUserForm.updateValueAndValidity();
            this.addUserForm.get('from_name')?.markAsTouched();
            this.addUserForm.get('from')?.markAsTouched();
            this.addUserForm.get('api_key')?.markAsTouched();
            this.addUserForm.get('reply_from')?.markAsTouched();
            this.addUserForm.get('sendgrid_status')?.markAsTouched();
        }
        if (this.addUserForm.valid) {
            try {
                this.commonService.showSpinner();
                let data = {}
                if (this.addUserForm.value.type == 'SMTP') {
                    data = {
                        service: 'smtp',
                        password: this.addUserForm.value.password,
                        host: this.addUserForm.value.host,
                        username: this.addUserForm.value.username,
                        security_layer: this.addUserForm.value.security_layer,
                        smtp_status: this.addUserForm.value.smtp_status,
                        sendgrid_status: this.addUserForm.value.sendgrid_status,
                    }
                } else {
                    data = {
                        service: 'SendGrid',
                        from_name: this.addUserForm.value.from_name,
                        from: this.addUserForm.value.from,
                        api_key: this.addUserForm.value.api_key,
                        reply_from: this.addUserForm.value.reply_from,
                        smtp_status: this.addUserForm.value.smtp_status,
                        sendgrid_status: this.addUserForm.value.sendgrid_status,
                    }
                }
                const res$ = this.apiService.postReq(API_PATH.STORE_EMAIL_CONFIGURATIONS, data, 'email-configuration', 'update');
                let response = await lastValueFrom(res$);
                if (response) {
                    let ud = this.authService.getUserDetails();
                    let user = {
                        ...ud,
                        email_configurations: 1,
                    }
                    const en = this.authService.encrypt(JSON.stringify(user));
                    localStorage.setItem(Constants.SETTINGS.USER_DETAILS, en);
                    this.authService.setEmailConfigurations(`${1}`)
                    localStorage.setItem(Constants.SETTINGS.USER_DETAILS, en);
                    this.commonService.showSuccess(response.message);
                    // this.router.navigate([`/${this.userBaseRoute}`]);

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
    async addTwilioSubmit(): Promise<void> {
        this.addTwilioForm.markAllAsTouched();
        if (this.addTwilioForm.valid) {
            try {
                this.commonService.showSpinner();
                let data = {
                    service: 'twilio',
                    ...this.addTwilioForm.value
                }
                const res$ = this.apiService.postReq(API_PATH.STORE_TWILIO_CONFIGURATIONS, data, 'email-configuration', 'update');
                let response = await lastValueFrom(res$);
                if (response) {
                    let ud = this.authService.getUserDetails();
                    let user = {
                        ...ud,
                        twilio_configurations: 1,
                    }
                    const en = this.authService.encrypt(JSON.stringify(user));
                    localStorage.setItem(Constants.SETTINGS.USER_DETAILS, en);
                    this.authService.setTwilioConfigurations(`${1}`)
                    localStorage.setItem(Constants.SETTINGS.USER_DETAILS, en);
                    this.commonService.showSuccess(response.message);

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
    async addMoneyThumbSubmit(): Promise<void> {
        this.addMoneyThumbForm.markAllAsTouched();
        if (this.addMoneyThumbForm.valid) {
            try {
                this.commonService.showSpinner();
                let data = {
                    service: 'moneyThumb',
                    ...this.addMoneyThumbForm.value
                }
                const res$ = this.apiService.postReq(API_PATH.STORE_MONEY_THUMB_CONFIGURATIONS, data, 'email-configuration', 'update');
                let response = await lastValueFrom(res$);
                if (response) {
                    let ud = this.authService.getUserDetails();
                    let user = {
                        ...ud,
                        email_configurations: 1,
                    }
                    const en = this.authService.encrypt(JSON.stringify(user));
                    localStorage.setItem(Constants.SETTINGS.USER_DETAILS, en);
                    this.authService.setEmailConfigurations(`${1}`)
                    localStorage.setItem(Constants.SETTINGS.USER_DETAILS, en);
                    this.commonService.showSuccess(response.message);
                    // this.router.navigate([`/${this.userBaseRoute}`]);

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
    async addDataMerchSubmit(): Promise<void> {
        this.addDataMerchForm.markAllAsTouched();
        if (this.addDataMerchForm.valid) {
            try {
                this.commonService.showSpinner();
                let data = {
                    service: 'dataMerch',
                    ...this.addDataMerchForm.value
                }
                const res$ = this.apiService.postReq(API_PATH.STORE_DATA_MERCH_CONFIGURATIONS, data, 'email-configuration', 'update');
                let response = await lastValueFrom(res$);
                if (response) {
                    let ud = this.authService.getUserDetails();
                    let user = {
                        ...ud,
                        email_configurations: 1,
                    }
                    const en = this.authService.encrypt(JSON.stringify(user));
                    localStorage.setItem(Constants.SETTINGS.USER_DETAILS, en);
                    this.authService.setEmailConfigurations(`${1}`)
                    localStorage.setItem(Constants.SETTINGS.USER_DETAILS, en);
                    this.commonService.showSuccess(response.message);
                    // this.router.navigate([`/${this.userBaseRoute}`]);

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
    async addDecisionLogicSubmit(): Promise<void> {
        this.addDecisionLogicForm.markAllAsTouched();
        if (this.addDecisionLogicForm.valid) {
            try {
                this.commonService.showSpinner();
                let data = {
                    service: 'decisionLogic',
                    ...this.addDecisionLogicForm.value
                }
                const res$ = this.apiService.postReq(API_PATH.STORE_DECISION_LOGIC_CONFIGURATIONS, data, 'email-configuration', 'update');
                let response = await lastValueFrom(res$);
                if (response) {
                    let ud = this.authService.getUserDetails();
                    let user = {
                        ...ud,
                        email_configurations: 1,
                    }
                    const en = this.authService.encrypt(JSON.stringify(user));
                    localStorage.setItem(Constants.SETTINGS.USER_DETAILS, en);
                    this.authService.setEmailConfigurations(`${1}`)
                    localStorage.setItem(Constants.SETTINGS.USER_DETAILS, en);
                    this.commonService.showSuccess(response.message);
                    // this.router.navigate([`/${this.userBaseRoute}`]);

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

    async addExperianSubmit(): Promise<void> {
        this.addExperianForm.markAllAsTouched();
        if (this.addExperianForm.valid) {
            try {
                this.commonService.showSpinner();
                let data = {
                    service: 'experian',
                    ...this.addExperianForm.value
                }
                const res$ = this.apiService.postReq(API_PATH.STORE_EXPERIAN_CONFIGURATIONS, data, 'email-configuration', 'update');
                let response = await lastValueFrom(res$);
                if (response) {
                    let ud = this.authService.getUserDetails();
                    let user = {
                        ...ud,
                        email_configurations: 1,
                    }
                    const en = this.authService.encrypt(JSON.stringify(user));
                    localStorage.setItem(Constants.SETTINGS.USER_DETAILS, en);
                    this.authService.setEmailConfigurations(`${1}`)
                    localStorage.setItem(Constants.SETTINGS.USER_DETAILS, en);
                    this.commonService.showSuccess(response.message);
                    // this.router.navigate([`/${this.userBaseRoute}`]);

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
    async addHelloSignSubmit(): Promise<void> {
        this.addHelloSignForm.markAllAsTouched();
        if (this.addHelloSignForm.valid) {
            try {
                this.commonService.showSpinner();
                let data = {
                    service: 'helloSign',
                    ...this.addHelloSignForm.value
                }
                const res$ = this.apiService.postReq(API_PATH.STORE_HELLO_SIGN_CONFIGURATIONS, data, 'email-configuration', 'update');
                let response = await lastValueFrom(res$);
                if (response) {
                    let ud = this.authService.getUserDetails();
                    let user = {
                        ...ud,
                        email_configurations: 1,
                    }
                    const en = this.authService.encrypt(JSON.stringify(user));
                    localStorage.setItem(Constants.SETTINGS.USER_DETAILS, en);
                    this.authService.setEmailConfigurations(`${1}`)
                    localStorage.setItem(Constants.SETTINGS.USER_DETAILS, en);
                    this.commonService.showSuccess(response.message);
                    // this.router.navigate([`/${this.userBaseRoute}`]);

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

    // async addUserSubmit(): Promise<void> {
    //     if (this.addUserForm.value.type == 'SMTP') {
    //         this.addUserForm.get('host')?.setValidators([
    //             Validators.required,
    //             Validators.pattern(Custom_Regex.spaces),
    //             Validators.pattern(Custom_Regex.username),
    //             Validators.pattern(Custom_Regex.name),
    //             Validators.maxLength(100),
    //             Validators.minLength(3)
    //         ]);
    //         this.addUserForm.get('username')?.setValidators([ 
    //             Validators.required,
    //             Validators.pattern(Custom_Regex.spaces),
    //             Validators.pattern(Custom_Regex.username),
    //             Validators.pattern(Custom_Regex.name),
    //             Validators.maxLength(100),
    //             Validators.minLength(3)
    //         ]);
    //         this.addUserForm.get('password')?.setValidators([
    //             Validators.required,
    //             Validators.pattern(Custom_Regex.password),
    //         ]);
    //         this.addUserForm.get('security_layer')?.setValidators([
    //             Validators.required,
    //         ]);
    //         this.addUserForm.updateValueAndValidity();
    //         this.addUserForm.markAllAsTouched();
    //         console.log("cg", this.addUserForm);

    //     } else {
    //         this.addUserForm.get('from_name')?.setValidators([
    //             Validators.required,
    //             Validators.pattern(Custom_Regex.spaces),
    //             Validators.pattern(Custom_Regex.username),
    //             Validators.pattern(Custom_Regex.name),
    //             Validators.maxLength(100),
    //             Validators.minLength(3)
    //         ]);
    //         this.addUserForm.get('from')?.setValidators([Validators.required, Validators.pattern(Custom_Regex.email)]);
    //         this.addUserForm.get('api_key')?.setValidators([
    //             Validators.required, Validators.pattern(Custom_Regex.spaces)
    //         ]);
    //         this.addUserForm.get('reply_from')?.setValidators([
    //             Validators.required, Validators.pattern(Custom_Regex.email)
    //         ]);
    //         this.addUserForm.updateValueAndValidity();
    //         this.addUserForm.markAllAsTouched();
    //     }
    //     this.addUserForm.markAllAsTouched();
    //     return;
    //     if (this.addUserForm.valid) {
    //         try {
    //             this.commonService.showSpinner();
    //             const res$ = this.apiService.postReq(API_PATH.SEND_GRID_ADD, this.addUserForm.value, 'email-configuration', 'update');
    //             let response = await lastValueFrom(res$);
    //             if (response) {
    //                 let ud = this.authService.getUserDetails();
    //                 let user = {
    //                     ...ud,
    //                     email_configurations: 1,
    //                 }
    //                 const en = this.authService.encrypt(JSON.stringify(user));
    //                 localStorage.setItem(Constants.SETTINGS.USER_DETAILS, en);
    //                 this.authService.setEmailConfigurations(`${1}`)
    //                 localStorage.setItem(Constants.SETTINGS.USER_DETAILS, en);
    //                 this.commonService.showSuccess(response.message);
    //                 this.router.navigate([`/${this.userBaseRoute}`]);

    //             }
    //             this.commonService.hideSpinner();
    //         } catch (error: any) {
    //             this.commonService.hideSpinner();
    //             if (error.error && error.error.message) {
    //                 this.commonService.showError(error.error.message);
    //             } else {
    //                 this.commonService.showError(error.message);

    //             }
    //         }

    //     } else {
    //         this.focusInvalidField();
    //     }
    // }
    get userBaseRoute() {
        return this.authService.getUserRole().toLowerCase();
    }
    patchTwilioValues() {
        this.addTwilioForm.patchValue({
            twilio_sid: this.twilioConfigurationsDetails?.twilio_sid,
            status: this.twilioConfigurationsDetails?.status,
            twilio_auth_token: this.twilioConfigurationsDetails?.twilio_auth_token,
            twilio_from: this.twilioConfigurationsDetails?.twilio_from,
        });
    }
    patchExperianValues() {
        this.addExperianForm.patchValue({
            url: this.experianConfigurationsDetails?.url,
            subscriber_code: this.experianConfigurationsDetails?.subscriber_code,
            username: this.experianConfigurationsDetails?.username,
            password: this.experianConfigurationsDetails?.password,
            client_id: this.experianConfigurationsDetails?.client_id,
            secret_id: this.experianConfigurationsDetails?.secret_id,

        })
    }
    patchHelloSignValues() {
        this.addHelloSignForm.patchValue({
            hello_sign_api_key: this.hellosignConfigurationsDetails?.hello_sign_api_key,
            hello_sign_enviroment: this.hellosignConfigurationsDetails?.hello_sign_enviroment,

        })
    }
    patchMoneyThumbValues() {
        this.addMoneyThumbForm.patchValue({
            money_thumb_token: this.moneythumbConfigurationsDetails?.money_thumb_token,
            money_thumb_user: this.moneythumbConfigurationsDetails?.money_thumb_user,
            money_thumb_password: this.moneythumbConfigurationsDetails?.money_thumb_password,

        })
    }
    patchDecisionValues() {
        this.addDecisionLogicForm.patchValue({
            dl_service_key: this.decisionConfigurationsDetails?.dl_service_key,
            dl_site_user_guid: this.decisionConfigurationsDetails?.dl_site_user_guid,
            dl_profile_guid: this.decisionConfigurationsDetails?.dl_profile_guid,

        })
    }
    patchDataMerchValues() {
        this.addDataMerchForm.patchValue({
            data_merch_username: this.dataMerchConfigurationsDetails?.data_merch_username,
            data_merch_password: this.dataMerchConfigurationsDetails?.data_merch_password,
        })
    }
    patchEmailConfigValues() {
        this.addUserForm.patchValue({
            from_name: this.emailConfigurationsDetails?.SendGrid.from_name,
            from: this.emailConfigurationsDetails?.SendGrid.from,
            api_key: this.emailConfigurationsDetails?.SendGrid.api_key,
            reply_from: this.emailConfigurationsDetails?.SendGrid.reply_from,
            sendgrid_status: this.emailConfigurationsDetails?.SendGrid.sendgrid_status,
            type: 'SendGrid',
            host: this.emailConfigurationsDetails?.smtp.host,
            username: this.emailConfigurationsDetails?.smtp.username,
            password: this.emailConfigurationsDetails?.smtp.password,
            security_layer: this.emailConfigurationsDetails?.smtp.security_layer,
            smtp_status: this.emailConfigurationsDetails?.smtp.smtp_status,
        });
    }
    // async getSendGridDetails(): Promise<void> {
    //     try {
    //         this.commonService.showSpinner();
    //         const res$ = this.apiService.getReq(API_PATH.SEND_GRID_VIEW, 'email-configuration', 'view');
    //         let response = await lastValueFrom(res$);
    //         if (response && response.data) {
    //             this.sendGridDetails = response.data;
    //             this.patchValues();
    //         }
    //         this.commonService.hideSpinner();
    //     } catch (error: any) {
    //         this.commonService.hideSpinner();
    //         if (error.error && error.error.message) {
    //             this.commonService.showError(error.error.message);
    //         } else {
    //             this.commonService.showError(error.message);

    //         }

    //     }
    // }
    async getEmailConfigurations(): Promise<void> {
        if (this.EmailConfgValidation) {
            this.initAddUserForm();
        }
        try {
            // this.uploadingEmailConfigurations = true;
            // this.commonService.showSpinnerWithId('uploadingEmailConfigurations');
            this.ngxLoader.startLoader('r1');
            const res$ = this.apiService.getReq(API_PATH.GET_EMAIL_CONFIGURATIONS, 'email-configuration', 'view');
            let response = await lastValueFrom(res$);
            if (response && response.data) {
                this.emailConfigurationsDetails = response.data;
                this.patchEmailConfigValues();
            }
            // this.uploadingEmailConfigurations = false;
            // this.commonService.hideSpinnerWithId('uploadingEmailConfigurations');
            this.ngxLoader.stopLoader('r1');

        } catch (error: any) {
            // this.uploadingEmailConfigurations = false;
            // this.commonService.hideSpinnerWithId('uploadingEmailConfigurations');
            this.ngxLoader.stopLoader('r1');

            if (error.error && error.error.message) {
                this.commonService.showError(error.error.message);
            } else {
                this.commonService.showError(error.message);

            }

        }
    }
    async getTwilioConfigurations(): Promise<void> {
        if (this.twilioValidation) {
            this.initAddTwilioForm();
        }
        try {
            // this.uploadingTwilioConfigurations = true;
            // this.commonService.showSpinnerWithId('uploadingTwilioConfigurations');
            this.ngxLoader.startLoader('r2');
            const res$ = this.apiService.getReq(API_PATH.GET_TWILIO_CONFIGURATIONS, 'email-configuration', 'view');
            let response = await lastValueFrom(res$);
            if (response && response.data) {
                this.twilioConfigurationsDetails = response.data;
                this.patchTwilioValues();
            }
            // this.uploadingTwilioConfigurations = false;
            // this.commonService.hideSpinnerWithId('uploadingTwilioConfigurations');

            this.ngxLoader.stopLoader('r2');

        } catch (error: any) {
            // this.uploadingTwilioConfigurations = false;
            // this.commonService.hideSpinnerWithId('uploadingTwilioConfigurations');

            this.ngxLoader.stopLoader('r2');

            if (error.error && error.error.message) {
                this.commonService.showError(error.error.message);
            } else {
                this.commonService.showError(error.message);

            }

        }
    }
    async getExperianConfigurations(): Promise<void> {
        if (this.ExpConfigValidation) {
            this.initAddExperianForm();
        }
        try {
            // this.uploadingExperianConfigurations = true;
            // this.commonService.showSpinnerWithId('uploadingExperianConfigurations');
            this.ngxLoader.startLoader('r3');
            const res$ = this.apiService.getReq(API_PATH.GET_EXPERIAN_CONFIGURATIONS, 'email-configuration', 'view');
            let response = await lastValueFrom(res$);
            if (response && response.data) {
                this.experianConfigurationsDetails = response.data;
                this.patchExperianValues();
            }
            // this.uploadingExperianConfigurations = false;
            // this.commonService.hideSpinnerWithId('uploadingExperianConfigurations');
            this.ngxLoader.stopLoader('r3');
        } catch (error: any) {
            // this.uploadingExperianConfigurations = false;
            // this.commonService.hideSpinnerWithId('uploadingExperianConfigurations');
            this.ngxLoader.stopLoader('r3');

            if (error.error && error.error.message) {
                this.commonService.showError(error.error.message);
            } else {
                this.commonService.showError(error.message);

            }

        }
    }
    async getHelloSignConfigurations(): Promise<void> {
        if (this.helloSgnValidation) {
            this.initAddHelloSignForm();

        }
        try {
            // this.uploadingHelloSignConfigurations = true;
            // this.commonService.showSpinnerWithId('uploadingHelloSignConfigurations');
            this.ngxLoader.startLoader('r4');

            const res$ = this.apiService.getReq(API_PATH.GET_HELLO_SIGN_CONFIGURATIONS, 'email-configuration', 'view');
            let response = await lastValueFrom(res$);
            if (response && response.data) {
                this.hellosignConfigurationsDetails = response.data;
                this.patchHelloSignValues();
            }
            // this.uploadingHelloSignConfigurations = false;
            // this.commonService.hideSpinnerWithId('uploadingHelloSignConfigurations');
            this.ngxLoader.stopLoader('r4');

        } catch (error: any) {
            // this.uploadingHelloSignConfigurations = false;
            // this.commonService.hideSpinnerWithId('uploadingHelloSignConfigurations');
            this.ngxLoader.stopLoader('r4');

            if (error.error && error.error.message) {
                this.commonService.showError(error.error.message);
            } else {
                this.commonService.showError(error.message);

            }

        }
    }
    async getMoneyThumbConfigurations(): Promise<void> {
        if (this.MoneythumbValidation) {
            this.initMoneyThumbForm();
        }
        try {
            // this.uploadingMoneyThumbConfigurations = true;
            // this.commonService.showSpinnerWithId('uploadingMoneyThumbConfigurations');
            this.ngxLoader.startLoader('r5');
            const res$ = this.apiService.getReq(API_PATH.GET_MONEY_THUMB_CONFIGURATIONS, 'email-configuration', 'view');
            let response = await lastValueFrom(res$);
            if (response && response.data) {
                this.moneythumbConfigurationsDetails = response.data;
                this.patchMoneyThumbValues();
            }
            // this.uploadingMoneyThumbConfigurations = false;
            // this.commonService.hideSpinnerWithId('uploadingMoneyThumbConfigurations');
            this.ngxLoader.stopLoader('r5');

        } catch (error: any) {
            this.ngxLoader.stopLoader('r5');

            // this.uploadingMoneyThumbConfigurations = false;
            // this.commonService.hideSpinnerWithId('uploadingMoneyThumbConfigurations');
            if (error.error && error.error.message) {
                this.commonService.showError(error.error.message);
            } else {
                this.commonService.showError(error.message);

            }

        }
    }
    async getDecisionConfigurations(): Promise<void> {
        if (this.DecissionLgcValidation) {
            this.initDecisionLogicForm();
        }
        try {
            this.ngxLoader.startLoader('r6');
            const res$ = this.apiService.getReq(API_PATH.GET_DECISION_LOGIC_CONFIGURATIONS, 'email-configuration', 'view');
            let response = await lastValueFrom(res$);
            if (response && response.data) {
                this.decisionConfigurationsDetails = response.data;
                this.patchDecisionValues();
            }
            // this.uploadingDecisionConfigurations = false;
            // this.commonService.hideSpinnerWithId('uploadingDecisionConfigurations');
            this.ngxLoader.stopLoader('r6');
        } catch (error: any) {
            // this.uploadingDecisionConfigurations = false;
            // this.commonService.hideSpinnerWithId('uploadingDecisionConfigurations');
            this.ngxLoader.stopLoader('r6');

            if (error.error && error.error.message) {
                this.commonService.showError(error.error.message);
            } else {
                this.commonService.showError(error.message);

            }

        }
    }
    async getDataMerchConfigurations(): Promise<void> {
        try {
            this.ngxLoader.startLoader('r7');
            const res$ = this.apiService.getReq(API_PATH.GET_DECISION_LOGIC_CONFIGURATIONS, 'email-configuration', 'view');
            let response = await lastValueFrom(res$);
            if (response && response.data) {
                this.decisionConfigurationsDetails = response.data;
                this.patchDecisionValues();
            }
            // this.uploadingDecisionConfigurations = false;
            // this.commonService.hideSpinnerWithId('uploadingDecisionConfigurations');
            this.ngxLoader.stopLoader('r7');
        } catch (error: any) {
            // this.uploadingDecisionConfigurations = false;
            // this.commonService.hideSpinnerWithId('uploadingDecisionConfigurations');
            this.ngxLoader.stopLoader('r7');

            if (error.error && error.error.message) {
                this.commonService.showError(error.error.message);
            } else {
                this.commonService.showError(error.message);

            }

        }
    }

    async getDataMerchConfig(): Promise<void> {
        if (this.DataMerchValidation) {
            this.initDataMerchForm();

        }
        try {
            this.ngxLoader.startLoader('r7');
            const res$ = this.apiService.getReq(API_PATH.GET_DATA_MERCH_CONFIGURATIONS, 'email-configuration', 'view');
            let response = await lastValueFrom(res$);
            if (response && response.data) {
                this.dataMerchConfigurationsDetails = response.data;
                this.patchDataMerchValues();
            }
            // this.uploadingDecisionConfigurations = false;
            // this.commonService.hideSpinnerWithId('uploadingDecisionConfigurations');
            this.ngxLoader.stopLoader('r7');
        } catch (error: any) {
            // this.uploadingDecisionConfigurations = false;
            // this.commonService.hideSpinnerWithId('uploadingDecisionConfigurations');
            this.ngxLoader.stopLoader('r7');

            if (error.error && error.error.message) {
                this.commonService.showError(error.error.message);
            } else {
                this.commonService.showError(error.message);

            }

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
    openModal(templateRef: TemplateRef<any>) {
        try {
            this.modal = this.modalService.open(templateRef, { backdrop: 'static', size: 'lg' });
        } catch (error: any) {
            this.commonService.showError(error.message);
        }
    }

    closeModal() {
        this.modal.close();
    }


    validationRemoveTwilio($event: NgbPanelChangeEvent, acc: any) {
        if (!acc.isExpanded($event.panelId)) {
            this.twilioValidation = true;
        }
    }

    validationRemoveExpConfig($event: NgbPanelChangeEvent, acc: any) {
        if (!acc.isExpanded($event.panelId)) {
            this.ExpConfigValidation = true;
        }


    }

    validationRemoveHelloSgn($event: NgbPanelChangeEvent, acc: any) {
        if (!acc.isExpanded($event.panelId)) {
            this.helloSgnValidation = true;
        }
    }
    validationRemoveMoneyThumb($event: NgbPanelChangeEvent, acc: any) {
        if (!acc.isExpanded($event.panelId)) {
            this.MoneythumbValidation = true;
        }
    }

    validationRemoveDecissionLgc($event: NgbPanelChangeEvent, acc: any) {
        if (!acc.isExpanded($event.panelId)) {
            this.ExpConfigValidation = true;
        }
    }

    validationRemoveDataMerch($event: NgbPanelChangeEvent, acc: any) {
        if (!acc.isExpanded($event.panelId)) {
            this.DataMerchValidation = true;
        }
    }
    validationEmailConfg($event: NgbPanelChangeEvent, acc: any) {
        if (!acc.isExpanded($event.panelId)) {
            this.EmailConfgValidation = true;
        }
    }
}