import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { API_PATH } from '@constants/api-end-points';
import { Custom_Regex } from '@constants/constants';
import { ApiService } from '@services/api.service';
import { AuthService } from '@services/auth.service';
import { CommonService } from '@services/common.service';
import { lastValueFrom } from 'rxjs';

@Component({
    selector: 'app-decline-lead',
    templateUrl: './decline-lead.component.html',
    styleUrls: ['./decline-lead.component.scss']
})
export class DeclineLeadComponent implements OnInit {
    declineForm!: FormGroup;
    declineTypes: any[] = [];
    declineReasons: any[] = [];
    @Input() leadId: string = '';
    @Output() closeModal = new EventEmitter<any>();
    @Output() leadDeclined = new EventEmitter<any>();
    colorSubs: any;
    style!: { fill: string; };
    color!: string;
    background!: { background: string; };

    constructor(
        private fb: FormBuilder,
        private commoService: CommonService,
        private apiService: ApiService,
        private authService: AuthService
    ) { }

    ngOnInit(): void {
        this.initDeclineForm();
        this.getDeclineOptions();
        this.getUserDetails();
    }

    getUserDetails(): void {
        try {
            let ud = this.authService.getUserDetails();
            if (ud) {
                this.getColorOnUpdate();
                this.style = { fill: ud?.color };
                this.color = ud?.color;
                this.background = { background: ud?.color };


            }
        } catch (error: any) {
            // this.commonService.showError(error.message);
        }
    }
    getColorOnUpdate() {
        this.colorSubs = this.authService.getColor().subscribe((u) => {
            this.getUserDetails();
        });
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

    closeModel() {
        this.closeModal.emit();
    }

    get f(): { [key: string]: AbstractControl } {
        return this.declineForm.controls;
    }

    initDeclineForm() {
        this.declineForm = this.fb.group({
            declineType: ['', [Validators.required]],
            declineReason: [[], [Validators.required]],
            note: ['', [Validators.required, Validators.pattern(Custom_Regex.address), Validators.pattern(Custom_Regex.address2), Validators.maxLength(1000), Validators.minLength(3)]]
        })
    }

    async declineLead() {
        try {
            this.declineForm.markAllAsTouched();
            if (this.declineForm.valid) {
                this.commoService.showSpinner();
                let data = {
                    decline_id: this.leadId,
                    type: this.declineForm.value.declineType,
                    reason: this.declineForm.value.declineReason,
                    note: this.declineForm.value.note
                }
                const res$ = this.apiService.postReq(API_PATH.DECLINE_LEAD, data, 'lead', 'decline');
                const response = await lastValueFrom(res$);
                if (response && response.status_code == "200") {
                    this.commoService.showSuccess(response.message);
                    // this.closeModal.emit();
                    this.leadDeclined.emit();
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

}
