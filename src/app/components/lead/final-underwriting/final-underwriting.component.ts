import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { API_PATH } from '@constants/api-end-points';
import { Roles } from '@constants/constants';
import { ApiService } from '@services/api.service';
import { AuthService } from '@services/auth.service';
import { CommonService } from '@services/common.service';
import { lastValueFrom, Subscription } from 'rxjs';
import Swal from 'sweetalert2';

@Component({
	selector: 'app-final-underwriting',
	templateUrl: './final-underwriting.component.html',
	styleUrls: ['./final-underwriting.component.scss']
})
export class FinalUnderwritingComponent implements OnInit {
	leadID: string = '';
	allDocsList: any[] = [];
	note: string = '';
	userRole: string = '';
	role = Roles;
	lead: any = {};
	// style: { fill: string; };
	 color!: string;
	background!: { background: string; };
	colorSubs!:Subscription;
	constructor(
		private route: ActivatedRoute,
		private commonService: CommonService,
		private apiService: ApiService,
		private router: Router,
		private authService: AuthService,
	) { }

	ngOnInit(): void {
		let params = this.route.snapshot.params;
		if (params && params['id']) {
			this.leadID = params['id'];
			this.getDocsList();
		} else {
			this.commonService.showError('');
		}
		this.getUserDetails();
	}

	/**
* @description get user details from localstrorage
* @author Shine Dezign Infonet Pvt. Ltd.
* @returns {void}
*/
	getUserDetails(): void {
		try {
			let ud = this.authService.getUserDetails();
			if (ud) {
				this.userRole = ud.role;
				this.getColorOnUpdate();
			// 	this.style={fill:ud?.color};
			this.color=ud?.color;
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
	async getDocsList() {
		try {
			this.commonService.showSpinner();
			const res$ = this.apiService.postReq(API_PATH.PENDING_DOCS, { lead_id: this.leadID }, 'lead', 'view');
			const response = await lastValueFrom(res$);
			if (response && response.status_code == "200") {
				this.allDocsList = response.data.map((e: any) => ({ ...e, uploaded: false }));
				console.log(this.allDocsList,'daataa');
				
			} else {
				this.commonService.showError(response.message);
			}
			this.commonService.hideSpinner();
		} catch (error) {
			this.commonService.hideSpinner();
			this.commonService.showErrorMessage(error);
		}
	}

	async reqPendingDocs() {
		try {
			const reqDoc = this.allDocsList.filter(e => e.uploaded === true);
			let requestDoc = reqDoc.map(e => (e.value));
			if(!requestDoc.length){
				this.commonService.showError("Please select any document");
				return
			}
			this.commonService.showSpinner();
			let data = {
				lead_id: this.leadID,
				documents: requestDoc,
				custom_note: this.note
			}
			const res$ = this.apiService.postReq(API_PATH.REQ_PENDING_DOCS, data, 'lead', 'view');
			const response = await lastValueFrom(res$);
			if (response && response.status_code == "200") {
				this.commonService.showSuccess(response.message)
				this.router.navigate([`/${this.userBaseRoute}/lead-detail/` + this.leadID]);
			} else {
				this.commonService.showError(response.message);
			}
			this.commonService.hideSpinner();
		} catch (error: any) {
			if(error.error.message == 'Force send'){
				Swal.fire({
					title: 'This user unsubscribed for all the emails, you want to shoot an email?',
					icon: 'warning',
					showCancelButton: true,
					confirmButtonText: 'OK',
					confirmButtonColor: "#f0412e",
				}).then((result) => {
					if (result.value) {
					this.mailSendForcefully();
				  
					} else if (result.dismiss === Swal.DismissReason.cancel) {
						Swal.close()
					}
				})
			}
			this.commonService.hideSpinner();
			if (error.error && error.error.message) {
				if(error.error.message != 'Force send'){
				this.commonService.showError(error.error.message);
				}
			} else {
				this.commonService.showError(error.message);
			  
			}
		}
	}
	async mailSendForcefully(){
        try {
            this.commonService.showSpinner();
            let data = {
                email:  this.lead.email,
            }
            const res$ = this.apiService.postReq(API_PATH.MAIL_SEND_FORCEFULLY, data, 'send', 'app-and-email');
           let response = await lastValueFrom(res$);
            if (response) {
                if (response.api_response == 'success') {
                    this.reqPendingDocs();

                }
            }
            this.commonService.hideSpinner();
        } catch (error: any) {
            this.commonService.hideSpinner();
            if (error.error && error.error.message) {
                this.commonService.showError(error.error.message);
            } else {
                this.commonService.hideSpinner();
                this.commonService.showError(error.message);
            }
        }  
    }

	onCheckBoxChange(e: any, i: number) {
		try {
			this.allDocsList[i].uploaded = e.target.checked;
			// if(e.target.checked) {
			// 	this.allDocsList
			// } else {

			// }
		} catch (error) {
			this.commonService.showErrorMessage(error)
		}
	}

	get userBaseRoute() {
		return this.authService.getUserRole().toLowerCase();
	}
	getLeadBasicDetails(leadData: any) {
        this.lead = leadData;
        
    }

}
