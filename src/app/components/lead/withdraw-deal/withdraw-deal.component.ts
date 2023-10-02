import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { API_PATH } from '@constants/api-end-points';
import { Custom_Regex } from '@constants/constants';
import { ApiService } from '@services/api.service';
import { AuthService } from '@services/auth.service';
import { CommonService } from '@services/common.service';
import { lastValueFrom, Subscription } from 'rxjs';

@Component({
    selector: 'app-withdraw-deal',
    templateUrl: './withdraw-deal.component.html',
    styleUrls: ['./withdraw-deal.component.scss']
})
export class WithdrawDealComponent implements OnInit {
    withDrawForm!: FormGroup;
    withDrawReasons: any[] = [];

    @Input() leadId: string = '';
    @Output() closeModal = new EventEmitter<any>();
    @Output() leadWithDrawed = new EventEmitter<any>();
    // style!: { fill: string; };
    // color!: string;
    background!: { background: string; };
    colorSubs!: Subscription;

    constructor(
        private fb: FormBuilder,
        private commoService: CommonService,
        private apiService: ApiService,
        private authService:AuthService
    ) { }

    ngOnInit(): void {
        this.initWithdrawForm();
        this.getWithdrawOptions();
        this.getUserDetails();
    }
    getUserDetails(): void {
            let ud = this.authService.getUserDetails();
            if (ud) {
           
                this.getColorOnUpdate();
                // this.style={fill:ud?.color};
                // this.color=ud?.color;
                    // this.stroke={stroke:ud?.color};
                 
                     this.background={background:ud?.color};
                  
                
            }
        }
    getColorOnUpdate() {
        this.colorSubs = this.authService.getColor().subscribe((u) => {
          this.getUserDetails();
        });
      }

    initWithdrawForm() {
        this.withDrawForm = this.fb.group({
            // Validators.pattern(Custom_Regex.address),Validators.pattern(Custom_Regex.address2),Validators.maxLength(200),
            // , Validators.minLength(3)
            reason: ['', [Validators.required]],
            note: ['', [ Validators.required, Validators.pattern(Custom_Regex.address),Validators.pattern(Custom_Regex.address2), Validators.maxLength(1000), Validators.minLength(3)]]
        })
    }

    async getWithdrawOptions() {
        try {
            this.commoService.showSpinner();
            const res$ = this.apiService.postReq(API_PATH.DECLINE_OPTIONS, { group_name: ['lead_withdraw_reason'] }, 'lead', 'view');
            const response = await lastValueFrom(res$);
            if (response && response.status_code === "200") {
                this.withDrawReasons = response.data.lead_withdraw_reason;
            } else {
                this.commoService.showError(response.message);
            }
            this.commoService.hideSpinner();
        } catch (error) {
            this.commoService.hideSpinner();
            this.commoService.showErrorMessage(error);
        }
    }

    get f(): { [key: string]: AbstractControl } {
        return this.withDrawForm.controls;
    }

    closeModel() {
        this.closeModal.emit();
    }

    async withdrawLead() {
        try {
            this.withDrawForm.markAllAsTouched();
            if (this.withDrawForm.valid) {
                this.commoService.showSpinner();
                let data = {
                    lead_id: this.leadId,
                    reason_id: this.withDrawForm.value.reason,
                    note: this.withDrawForm.value.note.trim(),
                }
                const res$ = this.apiService.postReq(API_PATH.WITHDRAW_LEAD, data, 'lead', 'withdraw')
                const response = await lastValueFrom(res$);
                if (response && response.status_code == "200") {
                    this.commoService.showSuccess(response.message);
                    this.leadWithDrawed.emit();
                } else {
                    this.commoService.showError(response.message);
                }
                this.commoService.hideSpinner();
            } else {
                this.commoService.hideSpinner();
            }

        } catch (error) {
            this.commoService.hideSpinner();
            this.commoService.showErrorMessage(error);
        }
    }

}
