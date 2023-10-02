import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { AbstractControl, FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { API_PATH } from '@constants/api-end-points';
import { Custom_Regex } from '@constants/constants';
import { ApiService } from '@services/api.service';
import { AuthService } from '@services/auth.service';
import { CommonService } from '@services/common.service';
import { lastValueFrom, Subscription } from 'rxjs';

@Component({
    selector: 'app-add-commission',
    templateUrl: './add-commission.component.html',
    styleUrls: ['./add-commission.component.scss']
})
export class AddCommissionComponent implements OnInit {

    addCommissionForm!: FormGroup;
    @Input() leadId: string = '';
    @Input() leadDetails: any = {};
    usersList: Array<any> = [];
    addAutomaticcommission: boolean = false;
    alluser: boolean = false;
    automaticUserList: Array<any> = [];
    allUserList: Array<any> = [];
    @Output() closeModal = new EventEmitter<any>();
    @Output() leadAddcommision = new EventEmitter<any>();
    actualAmount: number = 0;
    index: number = 0;
    automaticUsers: any;
    allselectedUsers: any;
    style!: { fill: string; };
    background!: { background: string; };
    colorSubs!:Subscription;
    constructor(
        private fb: FormBuilder,
        private commoService: CommonService,
        private apiService: ApiService,
        private router: Router,
        private authService: AuthService
    ) { }

    ngOnInit(): void {
        this.initaddCommissionForm();
        this.getCommisionList();
        this.getUserDetails();

    }
    getUserDetails(): void {
        try {
            let ud = this.authService.getUserDetails();
            if (ud) {
              
                this.getColorOnUpdate();
                this.style={fill:ud?.color};
                // this.color=ud?.color;
                    // this.stroke={stroke:ud?.color};
                 
                     this.background={background:ud?.color};
                  
                
            }
        } catch (error: any) {
            this.commoService.showError(error.message);
        }
    }
    getColorOnUpdate() {
        this.colorSubs = this.authService.getColor().subscribe((u) => {
          this.getUserDetails();
        });
      }

    initaddCommissionForm() {
        this.addCommissionForm = this.fb.group({
            users: this.fb.array([]),
        });
    }
    get addCommissionFArray() {
        return this.addCommissionForm.get('users') as FormArray;
    }

    commissionForm(user: any) {
        return this.fb.group({
            id: [user.id, [Validators.required]],
            name: [user.name],
            role: [user.role],
            commission_percentage: ['', [Validators.pattern(Custom_Regex.amount)]],
            amount: [0],
            userType: [user.userType ? user.userType : ''],
        })
    }

    addcommissionForm(user: any) {
        this.addCommissionFArray.push(this.commissionForm(user));
    }

    removeCommissionForm(i: number, agn: any, removeFrom: boolean = false) {
        this.addCommissionFArray.removeAt(i);
        if (removeFrom && agn && agn.userType) {
            if (agn.userType === 'AC') {
                this.automaticUsers = this.automaticUsers.filter((e: any) => e != agn.id);

            } else {
                this.allselectedUsers = this.allselectedUsers.filter((e: any) => e != agn.id);

            }
        }
    }

    get f(): { [key: string]: AbstractControl } {
        return this.addCommissionForm.controls;
    }

    closeModel() {
        this.closeModal.emit();
    }

    async addCommssionSubmit() {
        this.addCommissionForm.markAllAsTouched();
        if (this.addCommissionForm.valid) {
            try {

                let reqData: any = {
                    lead_id: this.leadId,
                    commissionDetail: [],
                }

                for (let i = 0; i < this.addCommissionFArray.length; i++) {
                    let ins = {
                        user_id: this.addCommissionForm.value.users[i].id,
                        commission_percentage: this.addCommissionForm.value.users[i].commission_percentage,
                    }
                    reqData.commissionDetail.push(ins);
                }
                this.commoService.showSpinner();
                const res$ = this.apiService.postReq(API_PATH.ADD_COMMISSION, reqData, 'add', 'commission');
                let response = await lastValueFrom(res$);
                if (response && response.data) {
                    this.commoService.showSuccess(response.message);
                    this.leadAddcommision.emit();
                    this.router.navigate([`/${this.userBaseRoute}/lead-detail/` + this.leadId]);

                }
                this.commoService.hideSpinner();
            } catch (error: any) {
                this.commoService.hideSpinner();
                if (error.error && error.error.message) {
                    this.commoService.showError(error.error.message);
                } else {
                    this.commoService.showError(error.message);
                }
            }
        }

    }

    get userBaseRoute() {
        return this.authService.getUserRole().toLowerCase();
    }

    onCommissionPercentage(value: any, i: number) {
        let totalValue = 0
        for (let i = 0; i < this.addCommissionFArray.length; i++) {
            totalValue += Number(this.addCommissionForm.value.users[i].commission_percentage)
        }

        if (totalValue > 100) {
            this.commoService.showError('You can given only 100% commission in total')
            this.addCommissionFArray.at(i).get('commission_percentage')?.patchValue('');
            this.addCommissionFArray.at(i).get('amount')?.patchValue('');
        } else if (totalValue <= 100) {
            let requestedamount = this.leadDetails?.lead_commissioned_amount;
            let amount = (value / 100) * requestedamount;
            this.actualAmount = amount;
            this.index = i;
            this.addCommissionFArray.at(i).get('amount')?.patchValue( Number(amount.toFixed(2)).toLocaleString('en-GB'));
            // amount.toFixed(2)
        }
    }

    async getCommisionList() {
        try {
            this.commoService.showSpinner();
            const res$ = this.apiService.postReq(API_PATH.USER_COMMISION_LIST, { lead_id: this.leadId }, 'lead', 'view');
            let response = await lastValueFrom(res$);
            if (response && response.data) {
                this.usersList = response.data.commissioned_users;
                this.automaticUserList = response.data.auto_commission_users;
                this.allUserList = response.data.all_user_list;
                this.usersList.sort((a, b) => a.value - b.value);
                this.usersList.sort((a, b) => {
                    const nameA = a.role.toUpperCase();
                    const nameB = b.role.toUpperCase();
                    if (nameA < nameB) {
                        return -1;
                    }
                    if (nameA > nameB) {
                        return 1;
                    }
                    return 0;
                });
                for (let i = 0; i < this.usersList.length; i++) {
                    this.addcommissionForm(this.usersList[i]);
                }
            } else {
                this.allUserList = [];
                this.automaticUserList = [];
                this.commoService.showError(response.message);
            }
            this.commoService.hideSpinner();
        } catch (error) {
            this.commoService.hideSpinner();
            this.commoService.showErrorMessage(error);
        }
    }

    automaticCommission(e: any[]) {
        for (let i = 0; i < e.length; i++) {
            let index = this.addCommissionFArray.value.findIndex((el: any) => el.id === e[i].id);
            if (index == -1) {
                e[i].userType = 'AC';
                this.addcommissionForm(e[i]);
            }
        }
    }

    automaticCommissionRemove(event: any) {
        let index = this.addCommissionFArray.value.findIndex((e: any) => e.id === event.value.id);
        this.removeCommissionForm(index, event.value)

    }

    allCommissionRemove(event: any) {
        let index = this.addCommissionFArray.value.findIndex((e: any) => e.id === event.value.id);
        this.removeCommissionForm(index, event.value)
    }

    userCommission(e: any[]) {
        for (let i = 0; i < e.length; i++) {
            let index = this.addCommissionFArray.value.findIndex((el: any) => el.id === e[i].id);
            if (index == -1) {
                e[i].userType = 'other';
                this.addcommissionForm(e[i]);
            }
        }
    }

}
