import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { API_PATH } from '@constants/api-end-points';
import { NgbAccordion, NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { ApiService } from '@services/api.service';
import { AuthService } from '@services/auth.service';
import { CommonService } from '@services/common.service';
import moment from 'moment';
import { lastValueFrom } from 'rxjs';

@Component({
	selector: 'app-lead-overview',
	templateUrl: './lead-overview.component.html',
	styleUrls: ['./lead-overview.component.scss']
})
export class LeadOverviewComponent implements OnInit {
	leadId: string = '';
	lead: any = {};
	@ViewChild('acc', { static: false }) accordion!: NgbAccordion;
	canEditLead: boolean = false;
	isLeadDeclined: boolean = false;
	modal!: NgbModalRef;
	canDeclineLead: boolean = false;
	dateFormat: string = '';
	timeZone: string = '';
	constructor(private route: ActivatedRoute,
		private commonService: CommonService,
		private apiService: ApiService,
		private modalService: NgbModal,
		private authService: AuthService) { }

	ngOnInit(): void {
		let queryParams = this.route.snapshot.queryParams;
		if (queryParams && queryParams['lead_id']) {
			this.leadId = queryParams['lead_id'];
			this.getLeadDetailsList();
			this.getUserDetails();
		} else {
			this.commonService.showError("Lead Id is not correct")
		}
		this.canDeclineLead = this.authService.hasPermission('lead-decline');
	}
	toggle(ID: string) {
		setTimeout(() => this.accordion.toggle(ID), 0);
	}
	async getLeadDetailsList() {
		try {
			this.commonService.showSpinner();
			const res$ = this.apiService.getReq(API_PATH.LEAD_DETAILS + this.leadId, 'lead', 'view');
			let response = await lastValueFrom(res$);
			if (response && response.data) {
				this.lead = response.data;
				console.log("hj", this.lead)
				this.isLeadDeclined = this.lead.is_lead_declined ? true : false;
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
	leadDeclined() {
		this.isLeadDeclined = true;
		this.lead.lead_status = 'Declined'
		this.closeModal();
		this.getLeadDetailsList();
	}
	closeModal() {
		this.modal.close();
	}
	getDate(date: any) {
		if (date && this.timeZone && this.dateFormat) {
			return moment(date).tz(this.timeZone).format(`${this.dateFormat} hh:mm:ss A`)
		} else {
			this.timeZone = 'America/Adak',
				this.dateFormat = 'MMM DD, yyyy'
			return moment(date).tz(this.timeZone).format(`${this.dateFormat} hh:mm:ss A`);
		}


	}
	getUserDetails(): void {
		try {
			let ud = this.authService.getUserDetails();
			if (ud) {
				this.dateFormat = ud.date_format;
				this.timeZone = ud.time_zone;
			}
		} catch (error: any) {
			this.commonService.showError(error.message);
		}
	}

}
