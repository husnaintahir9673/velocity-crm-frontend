import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { API_PATH } from '@constants/api-end-points';
import { Custom_Regex } from '@constants/constants';
import { NgbAccordion, NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { ApiService } from '@services/api.service';
import { AuthService } from '@services/auth.service';
import { CommonService } from '@services/common.service';
import { lastValueFrom, Subscription } from 'rxjs';
import Swal from 'sweetalert2';

@Component({
    selector: 'app-propose-submission',
    templateUrl: './propose-submission.component.html',
    styleUrls: ['./propose-submission.component.scss']
})
export class ProposeSubmissionComponent implements OnInit {
    leadID: string = '';
    lendersList: any[] = [];
    proposeSubForm!: FormGroup;
    lead: any = {};
    style!: { fill: string; };
    background!: { background: string; };
    colorSubs!: Subscription;
    submittedlendersList: Array<any> = [];
    declineForm!:FormGroup;
    modal!: NgbModalRef;
    lenderID:string='';
    @ViewChild('sendSubmiision', { static: false }) sendSubmiision!: NgbAccordion;
    showPaperPlane: boolean = false;
    checkBoxColor: boolean = false;
    @ViewChild('rejectOffer') rejectOffer!: ElementRef;
    color!: string;
    
    constructor(
        private route: ActivatedRoute,
        private commonService: CommonService,
        private apiService: ApiService,
        private fb: FormBuilder,
        private router: Router,
        private authService: AuthService,
        private modalService: NgbModal,
    ) { }

    ngOnInit(): void {
        this.commonService.showSpinner();
        let params = this.route.snapshot.params;
        if (params && params['id']) {
            this.leadID = params['id'];
            this.getlendersList();
            this.getsubmittedlendersList();
            this.getUserDetails();
        } else {
            this.commonService.showError('');
            this.commonService.hideSpinner();
        }
        this.initProposeSubmission();
    }
    getUserDetails(): void {
        try {
            let ud = this.authService.getUserDetails();
            if (ud) {
              
                this.getColorOnUpdate();
                this.style={fill:ud?.color};
                this.color=ud?.color;
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

    initProposeSubmission() {
        this.proposeSubForm = this.fb.group({
            lenders: [[], [Validators.required]],
            custom_note: ['', [
                // Validators.pattern(Custom_Regex.spaces), 
                Validators.pattern(Custom_Regex.address), 
                Validators.pattern(Custom_Regex.address2),
                Validators.minLength(3),
                Validators.maxLength(1000)
            ]]
        })
    }

    async getlendersList() {
        try {
            const res$ = this.apiService.postReq(API_PATH.LEAD_SPECIFIC_LENDER, { lead_id: this.leadID } ,'lead', 'view');
            let response = await lastValueFrom(res$);
            if (response && response.status_code == "200") {
                this.lendersList = response.data;

            } else {
                this.commonService.showError(response.message);
            }
            this.commonService.hideSpinner();
        } catch (error: any) {
            this.commonService.hideSpinner();
            this.commonService.showErrorMessage(error);
        }
    }

    async getsubmittedlendersList() {
        try {
            const res$ = this.apiService.postReq(API_PATH.SUBMITTED_DEALS_LENDER_LIST, { lead_id: this.leadID }, 'propose', 'submission');
            let response = await lastValueFrom(res$);
            if (response && response.status_code == "200") {
                this.submittedlendersList = response.data;
                this.submittedlendersList.forEach(object => {
                    object.toggle = false
                });
                for (let i = 0; i < this.submittedlendersList.length; i++) {
                    if (this.submittedlendersList[i].status == 1 || this.submittedlendersList[i].status == 3) {
                        this.submittedlendersList[i].toggle = true;
                    } else {
                        this.submittedlendersList[i].toggle = false;
                    }
                }


            } else {
                this.commonService.showError(response.message);
            }
            this.commonService.hideSpinner();
        } catch (error: any) {
            this.commonService.hideSpinner();
            this.commonService.showErrorMessage(error);
        }
    }
    onChangeLender(lenderID: any, name: any, input: any, i: any) {
        this.submittedlendersList[i].toggle = true;
        if (!input.checked) {
            this.submittedlendersList[i].toggle = false
        }
        Swal.fire({
            title: 'Are you sure?',
            text: 'Do you recieved the offer from lender' + ' - ' + name + '?',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Yes',
            confirmButtonColor: "#f0412e",
            // cancelButtonText: 'OK'
        }).then((result) => {
            if (result.value) {
                this.updateLenderOfferStatus(lenderID, 1, 1, input, 'accept');
                // this.getLeadDetailsList();
            } else if (result.dismiss === Swal.DismissReason.cancel) {
                Swal.close()
                input.checked = 0;
                // this.checkBoxColor = false;
                this.submittedlendersList[i].toggle = false
            }
        })
    }
       //modal
       openModalDecline(templateRef:any) {
        // this.closeTriggerModal();
        // this.emailTemplateId = id
        try {
            this.modal = this.modalService.open(templateRef, { backdrop: 'static', size: 'md' });
          //   this.inintColorForm();
        } catch (error: any) {
            this.commonService.showError(error.message);
        }
    }
    closeDeclineModal() {
        this.modal.close();
    }
    //
    get d(): { [key: string]: AbstractControl } {
        return this.declineForm.controls;
    }
    initDeclineForm(){
        this.declineForm = this.fb.group({
            reason_note:['',[Validators.required]]
        })
    }
        /**
     * 
     * @param lenderID 
     * @param status_type 1 for response from lender, 2 for order acceptence for that lender
     * @param status 
     */
         async updateLenderOfferStatus(lenderID: string, status_type: number, status: number, input: any = null, type: any) {
            try {
                this.commonService.showSpinner();
                let  data = {}
                if(type == 'accept'){
                     data = {
                        lead_id: this.leadID,
                        lender_id: lenderID,
                        status_type: status_type,
                        status: status,
                        other_confirmation: status,
                        
                    }
                }else{
                    data = {
                        lead_id: this.leadID,
                        lender_id: lenderID,
                        status_type: status_type,
                        status: status,
                        other_confirmation: status,
                        decline_reason: this.declineForm.value.reason_note
                        
                    }
                }
                const res$ = this.apiService.postReq(API_PATH.UPDATE_LENDER_OFFER_STATUS, data, 'lead', 'submission');
                let response = await lastValueFrom(res$);
                if (response && response.status_code == "200") {
                    this.commonService.showSuccess(response.message);
                    if(status_type == 3){
                        this.router.navigate([`/${this.userBaseRoute}/lead-detail/` + this.leadID]);
                    // this.activeTab = 'Lender Offers'
                    }else{
                        this.router.navigate([`/${this.userBaseRoute}/lead-detail/` + this.leadID]);
                    // this.activeTab = 'Documents'
                    }
    
                    this.getlendersList();
                } else {
                    this.commonService.showError(response.message);
                    if (input)
                        input.checked = 0;
                }
                this.commonService.hideSpinner();
            } catch (error) {
                if (input)
                    input.checked = 0;
                this.commonService.hideSpinner();
                this.commonService.showErrorMessage(error);
            }
        }

        getdeclineUpdate(){
            this.declineForm.markAllAsTouched();
            if(this.declineForm.valid){
                const lenderId = this.lenderID
                this.updateLenderOfferStatus(lenderId, 3, 2, '' ,'decline');
                this.closeModal();
            }
        
            
    
        }

    /**
     * @description get form controls
     * @author Shine Dezign Infonet Pvt. Ltd.
     */
     get f(): { [key: string]: AbstractControl } {
        return this.proposeSubForm.controls;
    }

    async onSubmit() {
        try {
            this.commonService.showSpinner();
            this.proposeSubForm.markAllAsTouched();
            if(this.proposeSubForm.valid) {
                const res$ = this.apiService.postReq(API_PATH.PROPOSE_SUBMISSION,{ lead_id: this.leadID, note: this.proposeSubForm.value.custom_note, lender_id: this.proposeSubForm.value.lenders }, 'propose', 'submission');
                let response = await lastValueFrom(res$);
                if(response && response.status_code == "200") {
                    this.commonService.showSuccess(response.message);
                    this.router.navigate([`${this.userBaseRoute}/lead-detail/${this.leadID}`]);
                } else {
                    this.commonService.showError(response.message);
                }
                this.commonService.hideSpinner();
            } else {
                this.commonService.hideSpinner();
            }
        } catch (error) {
            this.commonService.hideSpinner();
            this.commonService.showErrorMessage(error);
        }
    }

    get userBaseRoute() {
        return this.authService.getUserRole();
    }
    getLeadBasicDetails(leadData: any) {
        this.lead = leadData;
        
    }
    closeModal() {
        this.modal.close();
    }
    toggleSendsubmission(ID: string) {
        setTimeout(() => this.sendSubmiision.toggle(ID), 0);
    }
    check(name: any, lenderID: string) {
        Swal.fire({
            title: 'Are you sure?',
            text: 'Do you want to accept the offer from lender' + ' - ' + name + '?',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Yes',
            confirmButtonColor: "#f0412e",
        }).then((result) => {
            if (result.value) {
                this.updateLenderOfferStatus(lenderID, 2, 1 ,'', 'accept');
                // this.getLeadDetailsList();
            } else if (result.dismiss === Swal.DismissReason.cancel) {
                Swal.close()
            }
        })
    }
    declineOfferPopup(lenderID:any) {
        Swal.fire({
            title: 'Are you sure?',
            text: 'Do you want to reject the offer?',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Yes',
            confirmButtonColor: "#f0412e",
        }).then(async (result) => {
            if (result.value) {
                this.lenderID = lenderID;
                this.initDeclineForm();
                this.openModalDecline(this.rejectOffer);
            } else if (result.dismiss === Swal.DismissReason.cancel) {
                Swal.close()
                // this.checkBoxColor = false;
            }
        })
    }
}
