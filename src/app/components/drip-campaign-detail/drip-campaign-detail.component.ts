import { Component, OnInit, TemplateRef } from '@angular/core';
import { AbstractControl, FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { API_PATH } from '@constants/api-end-points';
import { Custom_Regex } from '@constants/constants';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { ApiService } from '@services/api.service';
import { AuthService } from '@services/auth.service';
import { CommonService } from '@services/common.service';
import { lastValueFrom } from 'rxjs';

@Component({
    selector: 'app-drip-campaign-detail',
    templateUrl: './drip-campaign-detail.component.html',
    styleUrls: ['./drip-campaign-detail.component.scss', '../../styles/dashboard.scss', '../../styles/predictive-search.scss']
})
export class DripCampaignDetailComponent implements OnInit {
    modal!: NgbModalRef;
    leadStatusForm!: FormGroup;
    leadStatusList: Array<any> = [];
    dripCampaignName: string = '';
    showDripCampaign: boolean = false;
    leadStatusShow: boolean = false;
    showTime: boolean = false;
    showWait: boolean = false;
    updatedLeadStatus: string = '';
    templateId: string = '';
    userDetails: any = {};
    emailListLimit: number = 1000;
    emailListPage: number = 1;
    emailTemplateList: Array<any> = []
    constructor(private modalService: NgbModal,
        private commonService: CommonService,
        private fb: FormBuilder,
        private apiService: ApiService,
        private route: ActivatedRoute,
        private authService: AuthService,
        private router: Router) { }

    ngOnInit(): void {
        this.initLeadStatusForm();
        this.getLeadOptions();
        this.getEmailTemplateList();
        let queryParams = this.route.snapshot.queryParams;
        if (queryParams && queryParams['name'] && queryParams['id']) {
            this.dripCampaignName = queryParams['name'];
            this.templateId = queryParams['id'];
            this.leadStatusForm.patchValue({
                name:  this.dripCampaignName,
                template_id: this.templateId,
            })
          
        } else {
            this.commonService.showError('');
        }
     
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
    openModal(templateRef: TemplateRef<any>) {
        try {
            this.modal = this.modalService.open(templateRef, { backdrop: 'static', size: 'md' });
        } catch (error: any) {
            this.commonService.showError(error.message);
        }
    }
    closeModal() {
        this.modal.close();
    }
    async getLeadOptions() {
        try {
            this.commonService.showSpinner();
            const res$ = this.apiService.getReq(API_PATH.LEAD_OPTIONS_LIST, '', '');
            let response = await lastValueFrom(res$);
            if (response && response.data) {
                this.leadStatusList = response.data.status
                // let data = this.leadStatusList.filter((e) => e.name == 'New Lead');
                // this.leadStatusForm.patchValue({ lead_status: data[0].id });
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
    async getEmailTemplateList(): Promise<any> {
        try {
            let url = `?page_limit=${this.emailListLimit}&page=${this.emailListPage}`;
            this.commonService.showSpinner();
            const res$ = this.apiService.getReq(
                API_PATH.EMAIL_TEMPLATE_LIST + url,
                '',
                ''
            );
            let response = await lastValueFrom(res$);
            if (response && response.data.data) {
                // this.hasMoreUsers = response.data.hasMorePages;
                // this.totalUsersCount = response.data.total;
                this.emailTemplateList = response.data.data;
            } else {
                this.emailTemplateList = [];
                // this.hasMoreUsers = false;
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
  async submitDripCampaign(){
           this.leadStatusForm.markAllAsTouched();
           if(this.leadStatusForm.invalid){
               this.commonService.showError('Please complete the required steps before submitting')
           }

        if (this.leadStatusForm.valid) {
            let data = {
                ...this.leadStatusForm.value,
            //   template_id: this.templateId,
             pattern: 'gfjy',
                // name: this.leadStatusForm.value.name
            }
            try {
                this.commonService.showSpinner();
                const res$ = this.apiService.postReq(API_PATH.ADD_DRIP_CAMPAIGN, data, 'campaign', 'add');
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
