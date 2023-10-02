import { Component, Input, OnInit, TemplateRef } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { API_PATH } from '@constants/api-end-points';
import { Custom_Regex, Mask, Roles } from '@constants/constants';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { ApiService } from '@services/api.service';
import { AuthService } from '@services/auth.service';
import { CommonService } from '@services/common.service';
import { lastValueFrom, Subscription } from 'rxjs';

@Component({
    selector: 'app-lead-send-sms',
    templateUrl: './lead-send-sms.component.html',
    styleUrls: ['./lead-send-sms.component.scss']
})
export class LeadSendSmsComponent implements OnInit {

    sendSmsForm!: FormGroup;
    declineTypes: any[] = [];
    declineReasons: any[] = [];
    @Input() leadPhonenumber: string = '';
    emailTemplatesList: Array<any> = [];
    firstTemplateKey: any;
    modal!: NgbModalRef;
    previewForm!: FormGroup;
    leadID: string = '';
    lead: any = {};
    mask = Mask;
    twilioconfigurationsSubs: Subscription | any;
    twilioConfigurations: number | any;
    twilioConfigurationMessage: boolean = false;
    style!: { fill: string; };
    background!: { background: string; };
    colorSubs!: Subscription;

    constructor(
        private fb: FormBuilder,
        private commoService: CommonService,
        private apiService: ApiService,
        private modalService: NgbModal,
        private route: ActivatedRoute,
        private router: Router,
        private authService: AuthService

    ) { }

    ngOnInit(): void {
        let params = this.route.snapshot.params;
        if (params && params['id']) {
            this.leadID = params['id'];

        } else {
            this.commoService.showError('');
        }
        let queryParams = this.route.snapshot.queryParams;
        if (queryParams && queryParams['phone_number']) {
            this.leadPhonenumber = queryParams['phone_number'];
            this.initSendSmsForm();
        }

        this.sendSmsForm.patchValue({
            phone_number: this.leadPhonenumber,
        });

        this.getSmsTemplateOptions();
        this.getUserDetails();


    }

    async getDeclineOptions() {
        try {
            this.commoService.showSpinner();
            const res$ = this.apiService.postReq(API_PATH.DECLINE_OPTIONS, { group_name: ['lead_decline_type', 'lead_decline_reason'] }, 'lead', 'view');
            const response = await lastValueFrom(res$);
            if (response && response.status_code === "200") {
                this.declineReasons = response.data.lead_decline_reason;
                this.declineTypes = response.data.lead_decline_type;
            } else {
                this.commoService.showError(response.message);
            }
            this.commoService.hideSpinner();
        } catch (error) {
            this.commoService.hideSpinner();
            this.commoService.showErrorMessage(error);
        }
    }
    initSendSmsForm() {
        this.sendSmsForm = this.fb.group({
            phone_number: ['', [Validators.required,Validators.pattern(Custom_Regex.digitsOnly)]],
            // [Validators.required]
            sms_template: [''],
            message: ['', [
                Validators.required, 
                // Validators.pattern(Custom_Regex.spaces),
                Validators.pattern(Custom_Regex.address),
                Validators.pattern(Custom_Regex.address2),
                Validators.maxLength(1000),
                Validators.minLength(3)
            ]],
        })
    }
    get s(): { [key: string]: AbstractControl } {
        return this.sendSmsForm.controls;
    }
    async sendSms() {
        try {
            this.sendSmsForm.markAllAsTouched();
            if (this.sendSmsForm.valid) {
                this.commoService.showSpinner();
                let data = {
                    ...this.sendSmsForm.value,
                    lead_id: this.leadID
                }
                const res$ = this.apiService.postReq(API_PATH.LEAD_SEND_SMS, data, 'send', 'sms');
                const response = await lastValueFrom(res$);
                if (response && response.status_code == "200") {
                    this.commoService.showSuccess(response.message);
                    this.router.navigate([`/${this.userBaseRoute}/lead-detail/` + this.leadID]);
                } else {
                    this.commoService.showError(response.message);
                }
                this.commoService.hideSpinner();
            }
        } catch (error) {
            this.commoService.hideSpinner();
            this.commoService.showErrorMessage(error);
        }
    }
    get userBaseRoute() {
        return this.authService.getUserRole().toLowerCase();
    }
    async getSmsTemplateOptions() {
        let url = '';
        if (Roles.ADMINISTRATOR) {
            url = `?&lead_id=${this.leadID}`;
        }
        try {
            this.commoService.showSpinner();
            const res$ = this.apiService.getReq(API_PATH.GET_OPTIONS_SMS_TEMPLATE + url, '', '');
            let response = await lastValueFrom(res$);
            if (response && response.data) {
                this.emailTemplatesList = response.data;
                if (response.data[0]) {
                    this.firstTemplateKey = response.data[0].name;
                    this.sendSmsForm.patchValue({
                        message: response.data[0].text,
                    });

                }
            }
            this.commoService.hideSpinner();
        } catch (error: any) {
            this.commoService.hideSpinner();
            if (error.error && error.error.message) {
                this.commoService.showError(error.error.message);
            } else {
                this.commoService.showError(error.message);
            }
        }
    }

    async getSmsTemplateData() {
        try {
            let data = {
                template: this.sendSmsForm.value.message,
                lead_id: this.leadID
            }
            this.commoService.showSpinner();
            const res$ = this.apiService.postReq(API_PATH.SEND_SMS_PREVIEW, data, '', '');
            let response = await lastValueFrom(res$);
            if (response && response.data) {
                this.previewForm.patchValue({
                    message: response.data,
                });
            }
            this.commoService.hideSpinner();
        } catch (error: any) {
            this.commoService.hideSpinner();
            if (error.error && error.error.message) {
                this.commoService.showError(error.error.message);
            } else {
                this.commoService.showError(error.message);
            }
        }


    }
    initPreviewForm() {
        this.previewForm = this.fb.group({
            message: [''],
        })
    }
    get p(): { [key: string]: AbstractControl } {
        return this.previewForm.controls;
    }

    openModal(templateRef: TemplateRef<any>) {
        try {
            this.modal = this.modalService.open(templateRef, { backdrop: 'static', size: 'md' });
            this.initPreviewForm();
            this.getSmsTemplateData();
        } catch (error: any) {
            this.commoService.showError(error.message);
        }
    }

    closePreviewModal() {
        this.modal.close();
    }
    getLeadBasicDetails(leadData: any) {
        this.lead = leadData;

    }
    getUserDetails() {
        let ud = this.authService.getUserDetails();
        if (ud) {
            this.twilioConfigurations = `${ud.twilio_configurations}`;
            this.getColorOnUpdate();
                this.style={fill:ud?.color};
                // this.color=ud?.color;
                    // this.stroke={stroke:ud?.color};
                 
                     this.background={background:ud?.color};
                  
            this.getEmailConfigurationsOnUpdate()
            if (this.twilioConfigurations == 0) {
                this.twilioConfigurationMessage = true;
            } else if(this.twilioConfigurations == 1){
                this.twilioConfigurationMessage = false;
            }
            

        }
    }
    getColorOnUpdate() {
        this.colorSubs = this.authService.getColor().subscribe((u) => {
          this.getUserDetails();
        });
      }
    getEmailConfigurationsOnUpdate() {
        this.twilioconfigurationsSubs = this.authService.getEmailConfigurations().subscribe((u) => {
            this.getUserDetails();
        });
    }
    
}
