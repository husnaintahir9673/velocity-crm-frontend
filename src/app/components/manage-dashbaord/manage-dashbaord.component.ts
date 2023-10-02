import { Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { API_PATH } from '@constants/api-end-points';
import { Custom_Regex, SETTINGS } from '@constants/constants';
import { ApiService } from '@services/api.service';
import { AuthService } from '@services/auth.service';
import { CommonService } from '@services/common.service';
import { lastValueFrom, Subscription } from 'rxjs';

@Component({
  selector: 'app-manage-dashbaord',
  templateUrl: './manage-dashbaord.component.html',
  styleUrls: ['./manage-dashbaord.component.scss']
})
export class ManageDashbaordComponent implements OnInit {
    companyID: string = '';
    userDetails: any = {};
    lenderFormData: Array<any> = [];
    colorSubs!:Subscription;
    style!: { fill: string; };
    color!: string;
    background!: { background: string; };
    manageCardsPermission: Array<any> = [];

    constructor(
        private fb: FormBuilder,
        private commonService: CommonService,
        private apiService: ApiService,
        private router: Router,
        private authService: AuthService

    ) { }

    ngOnInit(): void {
        // this.getLenderOfferForm();
        this.getUserDetails();
    }

    lenderFormGroup = this.fb.group({
        lenderFormArray: this.fb.array([])
    });
    lenderForm(data: any) {
        return this.fb.group({
            permission_name: [data.permission_name ?? '',[
                Validators.pattern(Custom_Regex.spaces), 
                Validators.minLength(3), 
                Validators.maxLength(100),
                Validators.pattern(Custom_Regex.address),
                Validators.pattern(Custom_Regex.address2),
            ]],
            is_required: [data.is_required ?? ''],
        })
    }

  
   
    getDashboardPermissions() {
        this.colorSubs = this.authService.getDashboardPermissions().subscribe((u) => {
          this.getUserDetails();
        });
      }
    get lenderFormArray() {
        return (this.lenderFormGroup.get('lenderFormArray') as FormArray);
    }

    getPermissionName(value: any){
        let v1 = value.split('-');
        for (var i = 0; i < v1.length; i++) {
            v1[i] = v1[i].charAt(0).toUpperCase() + v1[i].slice(1);
        }
        const str2 = v1.join(" ");
        return str2
        
    }

    // async getLenderOfferForm() {
    //     try {

    //         this.commonService.showSpinner();
    //         const res$ = this.apiService.getReq(API_PATH.GET_LENDER_OFFER_FORM, '', '');
    //         let response = await lastValueFrom(res$);
    //         if (response && response.data) {
    //             this.lenderFormData = response.data;
    //             for (let data of this.lenderFormData) {
    //                 this.lenderFormArray.push(this.lenderForm(data));

    //             }
    //         }
    //         this.commonService.hideSpinner();
    //     } catch (error: any) {
    //         this.commonService.hideSpinner();
    //         if (error.error && error.error.message) {
    //             this.commonService.showError(error.error.message);
    //         } else {
    //             this.commonService.showError(error.message);
    //         }
    //     }
    // }
    getUserDetails() {
        let ud = this.authService.getUserDetails();
        if (ud) {
            this.userDetails = ud;
            this.manageCardsPermission = ud.manage_card_permission;
            for (let data of this.manageCardsPermission) {
                  this.lenderFormArray.push(this.lenderForm(data));
            }
            this.getDashboardPermissions();
            this.style={fill:ud?.color};
         this.color=ud?.color;
            this.background={background:ud?.color};

        }
    }
    updatePermissionSession(): void {
        try {
            let ud = this.authService.getUserDetails();
            if (ud) {
            let  user = {
                    ...ud,
                    manage_card_permission: this.lenderFormArray.value,
                   }
                const en = this.authService.encrypt(JSON.stringify(user));
                localStorage.setItem(SETTINGS.USER_DETAILS, en);
                this.authService.setColor(`${this.lenderFormArray.value}`)
                localStorage.setItem(SETTINGS.USER_DETAILS, en);
                
            }
        } catch (error: any) {
            this.commonService.showError(error.message);
        }
    }
    async submit() {
        try {

            this.commonService.showSpinner();
            let data ={
                manage_cards_permission:this.lenderFormArray.value
            }

            const res$ = this.apiService.postReq(API_PATH.DASBOARD_CARDS_UPDATE, data, '', '');
            let response = await lastValueFrom(res$);
            if (response.api_response == 'success') {
                this.commonService.showSuccess(response.message);
                this.updatePermissionSession();
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


