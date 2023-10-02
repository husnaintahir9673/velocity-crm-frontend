import { Component, EventEmitter, Input, OnInit, Output, TemplateRef, ViewChild } from '@angular/core';
import { API_PATH } from '@constants/api-end-points';
import { NgbAccordion, NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { ApiService } from '@services/api.service';
import { AuthService } from '@services/auth.service';
import { CommonService } from '@services/common.service';
import moment from 'moment';
import { lastValueFrom, Subscription } from 'rxjs';

@Component({
    selector: 'app-all-detail-lead',
    templateUrl: './all-detail-lead.component.html',
    styleUrls: ['./all-detail-lead.component.scss']
})
export class AllDetailLeadComponent implements OnInit {
    @ViewChild('acc', { static: false }) accordion!: NgbAccordion;
    lead: any = {};
    modal!: NgbModalRef;
    @Input() leadId: string = '';
    dateFormat: string = "";
    timeZone: string = "";
    @Output() leadDetails: EventEmitter<any> = new EventEmitter()

    canDeclineLead: boolean = false;
    isLeadDeclined: boolean = true;
    style!: { fill: string; };
    background!: { background: string; };
    colorSubs!: Subscription;
    constructor(private commonService: CommonService,
        private apiService: ApiService,
        private modalService: NgbModal,
        private authService: AuthService) { }

    ngOnInit(): void {
        this.getLeadDetailsList();
        this.getUserDetails();
        this.canDeclineLead = this.authService.hasPermission('lead-decline');
    }

    async getLeadDetailsList() {
        try {
            this.commonService.showSpinner();
            const res$ = this.apiService.getReq(API_PATH.LEAD_DETAILS + this.leadId, 'lead', 'view');
            let response = await lastValueFrom(res$);
            if (response && response.data) {
                this.lead = response.data;
                this.isLeadDeclined = this.lead.is_lead_declined ? true : false;
                this.leadDetails.emit(response.data);
            }
            this.commonService.hideSpinner();
        } catch (error: any) {
            this.commonService.hideSpinner();
            this.commonService.showErrorMessage(error);
        }
    }
    declineLeadModal(templateRef: TemplateRef<any>) {
        try {
            this.modal = this.modalService.open(templateRef, { backdrop: 'static' });
        } catch (error) {
            this.commonService.showErrorMessage(error);
        }
    }
    getUserDetails(): void {
        try {
            let ud = this.authService.getUserDetails();
            if (ud) {
                this.dateFormat =  ud.date_format;
                this.timeZone = ud.time_zone;
                this.getColorOnUpdate();
                            this.style={fill:ud?.color};
                            // this.color=ud?.color;
                                // this.stroke={stroke:ud?.color};
                                this.background={background:ud?.color};
            
               
            }
        } catch (error: any) {
            this.commonService.showError(error.message);
        }
    }
    getColorOnUpdate() {
        this.colorSubs = this.authService.getColor().subscribe((u) => {
          this.getUserDetails();
        });
      }
    getDate(date: any){
        return moment(date).tz(this.timeZone).format(`${this.dateFormat} hh:mm:ss A`)
            
        }

    leadDeclined() {
        this.isLeadDeclined = true;
        this.lead.lead_status = 'Declined'
        this.closeModal();
        this.getLeadDetailsList();
    }
    openModal(templateRef: TemplateRef<any>) {
        try {
            this.modal = this.modalService.open(templateRef, { backdrop: 'static', size: 'xl' });
        } catch (error: any) {
            this.commonService.showError(error.message);
        }
    }

    closeModal() {
        this.modal.close();
    }
    toggle(ID: string) {
        setTimeout(() => this.accordion.toggle(ID), 0);
    }

}
