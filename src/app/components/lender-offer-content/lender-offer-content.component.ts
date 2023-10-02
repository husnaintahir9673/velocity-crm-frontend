import { Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { API_PATH } from '@constants/api-end-points';
import { Custom_Regex } from '@constants/constants';
import { ApiService } from '@services/api.service';
import { AuthService } from '@services/auth.service';
import { CommonService } from '@services/common.service';
import { lastValueFrom, Subscription } from 'rxjs';

@Component({
    selector: 'app-lender-offer-content',
    templateUrl: './lender-offer-content.component.html',
    styleUrls: ['./lender-offer-content.component.scss']
})
export class LenderOfferContentComponent implements OnInit {

    lenderOfferForm!: FormGroup;
    companyID: string = '';
    userDetails: any = {};
    lenderFormData: Array<any> = [];
    colorSubs!:Subscription;
    style!: { fill: string; };
    color!: string;
    background!: { background: string; };

    constructor(
        private fb: FormBuilder,
        private commonService: CommonService,
        private apiService: ApiService,
        private router: Router,
        private authService: AuthService

    ) { }

    ngOnInit(): void {
        this.getLenderOfferForm();
        this.getUserDetails();
    }

    lenderFormGroup = this.fb.group({
        lenderFormArray: this.fb.array([])
    });
    lenderForm(data: any) {
        return this.fb.group({
            label: [data.label ?? '',[
                Validators.pattern(Custom_Regex.spaces), 
                Validators.minLength(3), 
                Validators.maxLength(100),
                Validators.pattern(Custom_Regex.address),
                Validators.pattern(Custom_Regex.address2),
            ]],
            field_id: [data.field_id ?? '',],
            is_required: [data.is_required ?? ''],
            input_type: [data.input_type ?? ''],
            slug: [data.slug ?? ''],
        })
    }

  
   
getColorOnUpdate() {
   this.colorSubs = this.authService.getColor().subscribe((u) => {
     this.getUserDetails();
   });
}
    get lenderFormArray() {
        return (this.lenderFormGroup.get('lenderFormArray') as FormArray);
    }



    async getLenderOfferForm() {
        try {

            this.commonService.showSpinner();
            const res$ = this.apiService.getReq(API_PATH.GET_LENDER_OFFER_FORM, '', '');
            let response = await lastValueFrom(res$);
            if (response && response.data) {
                this.lenderFormData = response.data;
                for (let data of this.lenderFormData) {
                    this.lenderFormArray.push(this.lenderForm(data));

                }
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
    getUserDetails() {
        let ud = this.authService.getUserDetails();
        if (ud) {
            this.userDetails = ud;
            this.getColorOnUpdate();
            this.style={fill:ud?.color};
         this.color=ud?.color;
            this.background={background:ud?.color};

        }
    }
    async submit() {
        try {

            this.commonService.showSpinner();
            // const formData: FormData = new FormData();
            // let lendersData = []
            // for (let i = 0; i < this.lenderFormArray.value.length; i++) {
            //   let lender = {
            //     field_id: this.lenderFormArray.value[i].field_id,
            //     is_required: this.lenderFormArray.value[i].is_required,
            //   }
            //   lendersData.push(lender);
            // }
            // formData.append('fields[]', JSON.stringify(lendersData))
            let data ={
                fields:this.lenderFormArray.value
            }

            const res$ = this.apiService.postReq(API_PATH.SUBMIT_LENDER_FORM, data, '', '');
            let response = await lastValueFrom(res$);
            if (response) {
                this.commonService.showSuccess(response.message);
                this.router.navigate([`/${this.userBaseRoute}`]);

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
    get userBaseRoute() {
        return this.authService.getUserRole().toLowerCase();
    }



}

