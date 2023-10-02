import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { API_PATH } from '@constants/api-end-points';
import { Custom_Regex } from '@constants/constants';
import { ApiService } from '@services/api.service';
import { AuthService } from '@services/auth.service';
import { CommonService } from '@services/common.service';
import { lastValueFrom, Subscription } from 'rxjs';
import Swal from 'sweetalert2';
import moment from 'moment';

@Component({
    selector: 'app-fund-details',
    templateUrl: './fund-details.component.html',
    styleUrls: ['./fund-details.component.scss']
})
export class FundDetailsComponent implements OnInit {
    leadID: string = '';
    totalRemainingFundingAmount: number = 0;
    fundDetails: any;
    fundDetailForm!: FormGroup;
    syndicateList: Array<any> = [];
    partcipantList: Array<any> = [];
    participantid: string = '';
    selectedParticipantID: string = '';
    selectedParticipant: any = {};
    lead : any = {};
    dateFormat: string = '';
    timeZone: string = '';
    style!: { fill: string; };
    background!: { background: string; };
    colorSubs!:Subscription;
    constructor(
        private route: ActivatedRoute,
        private commonService: CommonService,
        private apiService: ApiService,
        private fb: FormBuilder,
        private router: Router,
        private authService: AuthService
    ) { }

    ngOnInit(): void {
        let params = this.route.snapshot.params;
        if (params && params['id']) {
            this.leadID = params['id'];
            this.getFundingList();
        } else {
            this.commonService.showError('');
        }
        this.initfundDetailForm();
        this.getUserDetails();
        // this.getSyndicatesList();
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

    initfundDetailForm(): void {
        this.fundDetailForm = this.fb.group({
            participant_form: this.fb.array([]),
        });
        //  this.addParticipantForm(true);
    }

    get f(): { [key: string]: AbstractControl } {
        return this.fundDetailForm.controls;
    }
    get participantFaArray() {
        return this.fundDetailForm.get('participant_form') as FormArray;
    }

    onAddButtonClick() {
        if (this.selectedParticipantID) {
            this.selectedParticipant = this.syndicateList.find((e) => e.id == this.selectedParticipantID);
            this.selectedParticipant.selected = 1;
            this.participantFaArray.push(this.participantForm());
            let index = this.syndicateList.findIndex((e) => e.id === this.selectedParticipantID);
            if (index > -1) {
                this.syndicateList[index].selected = 1;
            }
            this.selectedParticipantID = '';

        } else {
            this.commonService.showError('Please select participant first')
        }
    }


    participantForm() {
        return this.fb.group({
            syndicate_name: [this.selectedParticipant.name],
            syndicator_id: [this.selectedParticipant.id, [Validators.pattern(Custom_Regex.spaces)]],
            management_fee: ['', [Validators.pattern(Custom_Regex.amount)]],
            syndication_fee: ['', [Validators.pattern(Custom_Regex.amount)]],
            underwriting_fee: ['', [Validators.pattern(Custom_Regex.amount)]],
            broker_commission: ['', [Validators.pattern(Custom_Regex.amount)]],
            upsell_commission: ['', [Validators.pattern(Custom_Regex.amount)]],
            purchase_price: ['', [Validators.pattern(Custom_Regex.amount)]],
            // participation_value: [],
            // participation_id: []
        })
    }
    // addParticipantForm(value: any) {
    //     this.participantFaArray.push(this.participantForm('', value));
    // }

    removeParticipant(i: number, syndicateID: string = '') {
        this.participantFaArray.removeAt(i);
        let index = this.syndicateList.findIndex((e) => e.id === syndicateID);
        if (index > -1) {
            this.syndicateList[index].selected = 0;
        }
    }
    participantChange(event: any) {
        this.getParticipantList();
    }
    remainingFundingAmount() {
        let total = 0;
        this.fundDetailForm.value.participant_form.length.map((result: any) => {
            total += Number(result.purchase_price)
        });
        this.totalRemainingFundingAmount = Number(this.fundDetails?.funding_amount) - total;

    }
    async getFundingList() {
        try {
            let data = {
                lead_id: this.leadID
            }
            this.commonService.showSpinner();
            const res$ = this.apiService.postReq(API_PATH.PRE_FUNDING_LIST, data, 'participant', 'create');
            let response = await lastValueFrom(res$);
            if (response && response.data && response.status_code == "200") {
                this.fundDetails = response.data;
                this.syndicateList = response.data.syndicates;
                this.syndicateList = response.data.syndicates.map((e: any) => ({ ...e, selected: 0 }));
                this.getParticipantList();

            }
            this.commonService.hideSpinner();
        } catch (error: any) {
            this.commonService.hideSpinner();
            this.commonService.showErrorMessage(error);
        }
    }
    async getParticipantList() {
        try {
            let data = {
                lead_id: this.leadID
            }
            this.commonService.showSpinner();
            const res$ = this.apiService.postReq(API_PATH.PARTICIPANT_LIST, data, 'participant', 'create');
            let response = await lastValueFrom(res$);
            if (response && response.data) {
                this.partcipantList = response.data;
                for (let i = 0; i < this.syndicateList.length; i++) {
                    let index = this.partcipantList.findIndex((e) => e.syndicator_id === this.syndicateList[i].id);
                    if (index > -1) {
                        this.syndicateList[i].selected = 1;
                    }
                }
            }
            this.commonService.hideSpinner();
        } catch (error: any) {
            this.commonService.hideSpinner();
            this.commonService.showErrorMessage(error);
        }
    }
    openparticipantRemovepopup(i: number, id: any) {
        Swal.fire({
            title: 'Are you sure want to remove?',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Yes, remove it!',
            confirmButtonColor: "#f0412e",
            cancelButtonText: 'Cancel'
        }).then((result) => {
            if (result.value) {
                this.deleteparticipant(i, id);

            } else if (result.dismiss === Swal.DismissReason.cancel) {
                Swal.close()
            }
        })

    }
    async deleteparticipant(i: any, id: any) {
        try {
            let data = {
                participant_id: id
            }
            this.commonService.showSpinner();
            const res$ = this.apiService.postReq(API_PATH.PARTICIPATION_DELETE, data, 'participant', 'delete')
            const response = await lastValueFrom(res$);
            if (response && response.status_code == "200") {
                this.commonService.showSuccess(response.message);
                let data = this.partcipantList.filter((e) => e.id == id);
                let index = this.syndicateList.findIndex((e) => e.id === data[0].syndicator_id);
                if (index > -1) {
                    this.syndicateList[index].selected = 0;
                }
                this.partcipantList = this.partcipantList.filter((e) => e.id != id);
                Swal.close();

            }
            this.commonService.hideSpinner();


        } catch (error: any) {
            this.commonService.hideSpinner();
            this.commonService.showError(error.error.message);
        }
    }

    // async getSyndicatesList() {
    //     try {
    //         this.commonService.showSpinner();
    //         const res$ = this.apiService.getReq(API_PATH.ALL_SYNDICATE_LIST, '', '');
    //         const response = await lastValueFrom(res$);
    //         if (response && response.status_code == "200") {
    //             this.syndicateList = response.data.map((e: any) => ({ ...e, selected: 0 }));
    //               this.getParticipantList();
    //         } else {
    //             this.commonService.showError(response.message);
    //         }
    //         this.commonService.hideSpinner()
    //     } catch (error) {
    //         this.commonService.hideSpinner();
    //         this.commonService.showErrorMessage(error);
    //     }
    // }
    get userBaseRoute() {
        return this.authService.getUserRole().toLowerCase();
    }
    async addParticipant() {
        this.fundDetailForm.markAllAsTouched();
        if (this.fundDetailForm.valid) {
            let amount = 0;
            for (let i = 0; i < this.partcipantList.length; i++) {
                amount += Number(this.partcipantList[i].purchase_price);
            }
            let formAmount = 0;
            for (let i = 0; i < this.fundDetailForm.value.participant_form.length; i++) {
                formAmount += Number(this.fundDetailForm.value.participant_form[i].purchase_price);
            }
            let totalAmount = amount + formAmount;
            if (this.fundDetails?.funding_amount < totalAmount) {
                this.commonService.showError("Remaining amount should be 0 or greater than 0");
                return
            }
            this.commonService.showSpinner();
            try {
                let data = {
                    lead_id: this.leadID,
                    participant: this.fundDetailForm.value.participant_form,
                }
                const res$ = this.apiService.postReq(API_PATH.ADD_FUNDING_DETAILS, data, 'participant', 'create');
                let response = await lastValueFrom(res$);
                if (response && response.status_code == "200") {
                    this.commonService.showSuccess(response.message);
                    this.router.navigate([`/${this.userBaseRoute}/lead-detail/` + this.leadID]);
                } else {
                    this.commonService.showError(response.message);
                }
                this.commonService.hideSpinner();
            } catch (error: any) {
                this.commonService.hideSpinner();
                this.commonService.showErrorMessage(error);
            }
        } else {
            this.commonService.hideSpinner();
        }
    }

    get remainingFund() {
        try {
            let fa = Number(this.fundDetails.funding_amount);
            let amount = 0;
            for (let i = 0; i < this.partcipantList.length; i++) {
                amount += Number(this.partcipantList[i].purchase_price);
            }
            let formAmount = 0;
            for (let i = 0; i < this.fundDetailForm.value.participant_form.length; i++) {
                formAmount += Number(this.fundDetailForm.value.participant_form[i].purchase_price);
            }
            return fa - amount - formAmount;
        } catch (error) {
            return 0
        }

    }
    getLeadBasicDetails(leadData: any) {
        this.lead = leadData;
        
    }

    getDate(date: any){
        return moment(date).tz(this.timeZone).format(`${this.dateFormat} hh:mm:ss A`)
    }
}
