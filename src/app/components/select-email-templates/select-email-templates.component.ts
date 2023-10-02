import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormArray, FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { API_PATH } from '@constants/api-end-points';
import { Custom_Regex } from '@constants/constants';
import { ApiService } from '@services/api.service';
import { AuthService } from '@services/auth.service';
import { CommonService } from '@services/common.service';
import { lastValueFrom, Subscription } from 'rxjs';

@Component({
  selector: 'app-select-email-templates',
  templateUrl: './select-email-templates.component.html',
  styleUrls: ['./select-email-templates.component.scss']
})
export class SelectEmailTemplatesComponent implements OnInit {
  companyID: string = '';
    userDetails: any = {};
    lenderFormData: Array<any> = [];
    colorSubs!:Subscription;
    style!: { fill: string; };
    color!: string;
    background!: { background: string; };
    manageCardsPermission: Array<any> = [];
    companyId: string = '';
    selectedTemplates: Array<any> = [];
    show: string = '';

    constructor(
        private fb: FormBuilder,
        private commonService: CommonService,
        private apiService: ApiService,
        private router: Router,
        private authService: AuthService,
        private route: ActivatedRoute

    ) { }

    ngOnInit(): void {
       this.getLenderOfferForm();
       let queryParams = this.route.snapshot.queryParams;
       if (queryParams && queryParams['company_id'] && queryParams['show']) {
           this.companyId = queryParams['company_id'];
       } else {
           this.commonService.showError('');
       }
        // this.getUserDetails();
    }

    lenderFormGroup = this.fb.group({
      type: ['all',[
        Validators.required,
    ]],
        lenderFormArray: this.fb.array([])
    });
    lenderForm(data: any) {
        return this.fb.group({
             id: [data.id ?? ''],
            template_name: [data.template_name ?? '',[
                Validators.pattern(Custom_Regex.spaces), 
                Validators.minLength(3), 
                Validators.maxLength(100),
                Validators.pattern(Custom_Regex.address),
                Validators.pattern(Custom_Regex.address2),
            ]],
            is_checked: [data.is_checked ?? ''],
        })
    }

  
   
    // getDashboardPermissions() {
    //     this.colorSubs = this.authService.getDashboardPermissions().subscribe((u) => {
    //       this.getUserDetails();
    //     });
    //   }
    get lenderFormArray() {
        return (this.lenderFormGroup.get('lenderFormArray') as FormArray);
    }

    getPermissionName(value: any){
        let v1 = value.split('-');
       let v2 = v1[0].split('_')  ;
        for (var i = 0; i < v2.length; i++) {
            v2[i] = v2[i].charAt(0).toUpperCase() + v2[i].slice(1);
        }
        const str2 = v2.join(" ");
        return str2
        
    }

    async getLenderOfferForm() {
        try {

            this.commonService.showSpinner();
            const res$ = this.apiService.getReq(API_PATH.SELECT_EMAIL_TEMPLATES, 'email', 'template-list');
            let response = await lastValueFrom(res$);
            if (response && response.data && response.data.systemTemplates) {
                this.lenderFormData = response.data.systemTemplates;
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
    // getUserDetails() {
    //     let ud = this.authService.getUserDetails();
    //     if (ud) {
    //         this.userDetails = ud;
    //         this.manageCardsPermission = ud.manage_card_permission;
    //         for (let data of this.manageCardsPermission) {
    //               this.lenderFormArray.push(this.lenderForm(data));
    //         }
    //         this.getDashboardPermissions();
    //         this.style={fill:ud?.color};
    //      this.color=ud?.color;
    //         this.background={background:ud?.color};

    //     }
    // }
    async submit() {
        try {

            // this.commonService.showSpinner();
            this.selectedTemplates = [];
            let data ={
                 company_id: this.companyId,
                 type: this.lenderFormGroup.value.type,
                 selected_templates: this.selectedTemplates
            }
          let selected_template = []
            if(this.lenderFormGroup.value.type == 'custom'){
            for (let i = 0; i < this.lenderFormArray.value.length; i++) {
              selected_template = this.lenderFormArray.value.filter((e: any) => e.is_checked == true);  
            }
            for (let index = 0; index < selected_template.length; index++) {
             this.selectedTemplates.push(selected_template[index].id);     
            }
          }

            const res$ = this.apiService.postReq(API_PATH.USER_GENERATE_TEMPLATES, data, 'company', 'create');
            let response = await lastValueFrom(res$);
            if (response.api_response == 'success') {
                this.commonService.showSuccess(response.message);
                // this.updatePermissionSession();
                this.router.navigate([`/admin/company`]); 

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
    get f(): { [key: string]: AbstractControl } {
      return this.lenderFormGroup.controls;
  }



}



