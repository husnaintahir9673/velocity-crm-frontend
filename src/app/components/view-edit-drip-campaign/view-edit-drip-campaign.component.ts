import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { API_PATH } from '@constants/api-end-points';
import { Custom_Regex } from '@constants/constants';
import { ApiService } from '@services/api.service';
import { AuthService } from '@services/auth.service';
import { CommonService } from '@services/common.service';
import { lastValueFrom } from 'rxjs';

@Component({
    selector: 'app-view-edit-drip-campaign',
    templateUrl: './view-edit-drip-campaign.component.html',
    styleUrls: ['./view-edit-drip-campaign.component.scss', '../../styles/dashboard.scss', '../../styles/predictive-search.scss']
})
export class ViewEditDripCampaignComponent implements OnInit {
    leadStatusForm!: FormGroup;
    leadStatusList: Array<any> = [];
    showDripCampaign: boolean = false;
    leadStatusShow: boolean = false;
    showTime: boolean = false;
    showWait: boolean = false;
    updatedLeadStatus: string = '';
    templateId: string = '';
    editMode: Boolean = false;
    dripCampaignID: string = '';
    dripCampaignDetails: any = {};
    emailListLimit: number = 1000;
    emailListPage: number = 1;
    emailTemplateList: Array<any> = [];
    canEditDripCampaign: boolean = false
    constructor(
        private commonService: CommonService,
        private fb: FormBuilder,
        private apiService: ApiService,
        private authService: AuthService,
        private router: Router,
        private route: ActivatedRoute) { }

    ngOnInit(): void {
        this.initLeadStatusForm();
        this.getLeadOptions();
        this.getEmailTemplateList();
        let params = this.route.snapshot.params;
        let query = this.route.snapshot.queryParams;
        if (params['id']) {
            this.dripCampaignID = params['id'];
            this.getDripCampaignDetails();
        }
        if (query['mode'] && query['mode'] === 'edit') {
            this.editMode = true;
        }
        this.canEditDripCampaign = this.authService.hasPermission('campaign-update');

    }
    initLeadStatusForm() {
        this.leadStatusForm = this.fb.group({
            name: ['', [
                Validators.required,
                Validators.pattern(Custom_Regex.spaces),
                Validators.pattern(Custom_Regex.username),
                Validators.pattern(Custom_Regex.name),
                Validators.minLength(3),
                Validators.maxLength(100)
            ]],
            lead_status: ['', [
                Validators.required,
            ]],
            wait_for: [''],
            time: ['', [
                Validators.required,
            ]],
            template_id: ['', [
                Validators.required,
            ]],
        })
    }
    get l(): { [key: string]: AbstractControl } {
        return this.leadStatusForm.controls;
    }
    async getEmailTemplateList(): Promise<any> {
        try {
            let url = `?page_limit=${this.emailListLimit}&page=${this.emailListPage}`;
            this.commonService.showSpinner();
            const res$ = this.apiService.getReq(
                API_PATH.EMAIL_TEMPLATE_LISTING_NEW + url,
                '',
                ''
            );
            // const res$ = this.apiService.getReq(
            //     API_PATH.EMAIL_TEMPLATE_LIST + url,
            //     '',
            //     ''
            // );
            let response = await lastValueFrom(res$);
            if (response && response.data.data) {
                this.emailTemplateList = response.data.data;
            } else {
                this.emailTemplateList = [];
                this.emailListPage = 1;
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

    async getDripCampaignDetails(): Promise<void> {
        try {
            this.commonService.showSpinner();
            let url = `?id=${this.dripCampaignID}`;
            const res$ = this.apiService.getReq(API_PATH.DRIP_CAMPAIGN_VIEW + url, 'campaign', 'view');
            let response = await lastValueFrom(res$);
            if (response && response.data) {
                this.dripCampaignDetails = response.data.data;
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
        this.leadStatusForm.patchValue({
            name: this.dripCampaignDetails.name,
            lead_status: this.dripCampaignDetails.lead_status,
            wait_for: this.dripCampaignDetails.wait_for,
            time: this.dripCampaignDetails.time,
            template_id: this.dripCampaignDetails.template_id,
        })
    }
    cancel() {
        this.editMode = !this.editMode;
        this.patchValues();
    }
    async getLeadOptions() {
        try {
            this.commonService.showSpinner();
            const res$ = this.apiService.getReq(API_PATH.LEAD_OPTIONS_LIST, '', '');
            let response = await lastValueFrom(res$);
            if (response && response.data) {
                this.leadStatusList = response.data.status
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
    async submitDripCampaign() {
        this.leadStatusForm.markAllAsTouched();
        if (this.leadStatusForm.invalid) {
            this.commonService.showError('Please complete the required steps before submitting')
        }

        if (this.leadStatusForm.valid) {
            let data = {
                ...this.leadStatusForm.value,
                // template_id: this.templateId,
                pattern: 'gfjy',
                id: this.dripCampaignID
            }
            try {
                this.commonService.showSpinner();
                const res$ = this.apiService.postReq(API_PATH.DRIP_CAMPAIGN_UPDATE, data, 'campaign', 'update');
                let response = await lastValueFrom(res$);
                if (response) {
                    this.commonService.showSuccess(response.message);
                    this.router.navigate([`/${this.userBaseRoute}/drip-campaign-list`]);
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
    get userBaseRoute() {
        return this.authService.getUserRole().toLowerCase();
    }
}

