import { AfterViewInit, Component, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { SignaturePadComponent } from '@almothafar/angular-signature-pad';
import { CommonService } from '@services/common.service';
import { ApiService } from '@services/api.service';
import { AuthService } from '@services/auth.service';
import { API_PATH } from '@constants/api-end-points';
import { lastValueFrom } from 'rxjs';
import { Router } from '@angular/router';

@Component({
    selector: 'app-signature-pad',
    templateUrl: './signature-pad.component.html',
    styleUrls: ['./signature-pad.component.scss']
})
export class SignaturePadComponents implements OnInit, AfterViewInit {
    @Input() tabView: boolean = true;
    @Output() tabViewChange = new EventEmitter<boolean>();
    @ViewChild('pad', { static: false }) signaturePad!: SignaturePadComponent;
    @Input() customerSign = ''
    @Output() close: EventEmitter<any> = new EventEmitter();
    @Output() customerSignChange = new EventEmitter<string>();
    @Output() pendingDocuments = new EventEmitter<any>();
    @Input() leadId: string = '';
    signaturePadOptions: any = { // passed through to szimek/signature_pad constructor
        'minWidth': 2,
        'canvasWidth': 500,
        'canvasHeight': 200
    };
    color: string = '#FA5440';
    constructor(private commonService: CommonService, private apiService: ApiService,
        private authService: AuthService,
        private router: Router) { }

    ngOnInit(): void {
        this.getUserDetails();
    }
    getUserDetails() {
        let ud = this.authService.getUserDetails();
        if (ud) {
            this.color = ud?.color;
        }
    }
    ngAfterViewInit() {
        if (this.signaturePad) {
            this.signaturePad.fromDataURL(this.customerSign);
        }
    }

    drawComplete() {
        // will be notified of szimek/signature_pad's onEnd event
        this.customerSign = this.signaturePad.toDataURL();
        this.customerSignChange.emit(this.customerSign);
        // console.log(this.signaturePad.toDataURL());
    }

    resetSignPad() {
        if (this.signaturePad)
            this.signaturePad.clear();
        this.customerSignChange.emit('');
    }

    closeModal(value: any) {
        if (!this.customerSign && value == false) {
            this.commonService.showError('Please add owner signature before submitting');
            return;
        }
        if (value == true) {
            this.close.emit();
        }
        if (this.customerSign && value == false) {
            this.close.emit();
            this.tabViewChange.emit(false);
            this.pendingDocuments.emit();
            this.addSignatureEmail();
        }

    }
    async addSignatureEmail(): Promise<void> {
            try {
                this.commonService.showSpinner();
                let data = {
                   lead_id: this.leadId
                }
                const res$ = this.apiService.postReq(API_PATH.FIRST_OWNER_SIGNATURE, data, 'lead', 'edit');
                let response = await lastValueFrom(res$);
                if (response) {
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

    }


}
