import { Component, ElementRef, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { API_PATH } from '@constants/api-end-points';
import { Custom_Regex } from '@constants/constants';
import { ApiService } from '@services/api.service';
import { AuthService } from '@services/auth.service';
import { CommonService } from '@services/common.service';
import { lastValueFrom, Subscription } from 'rxjs';

@Component({
    selector: 'app-create-team',
    templateUrl: './create-team.component.html',
    styleUrls: ['./create-team.component.scss']
})
export class CreateTeamComponent implements OnInit {


    addTeamForm!: FormGroup;
    userList: Array<any> = [];
    teamMembersList: Array<any> = [];
    hasMoreUsers: boolean = false;
    userListPage: number = 1;
    allMembers: any[] = [];
    style!: { fill: string; };
    color!: string;
    background!: { background: string; };
    colorSubs!: Subscription;
    constructor(
        private fb: FormBuilder,
        private apiService: ApiService,
        private commonService: CommonService,
        private router: Router,
        private el: ElementRef,
        private authService:AuthService
    ) { }

    ngOnInit(): void {
        this.initaddTeamForm();
        this.getUserListOptions();
        this.getUserDetails();
    }
    getUserDetails(): void {
        try {
            let ud = this.authService.getUserDetails();
            if (ud) {
             
                this.getColorOnUpdate();
                this.style={fill:ud?.color};
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

    /**
     * @description get form controls
     * @author Shine Dezign Infonet Pvt. Ltd.
     */
    get f(): { [key: string]: AbstractControl } {
        return this.addTeamForm.controls;
    }


    /**
     * @description initialize add compnay form
     * @author Shine Dezign Infonet Pvt. Ltd.
     * @returns {void}
     */
    initaddTeamForm(): void {
        this.addTeamForm = this.fb.group({
            team_name: ['', [
                Validators.required, 
                Validators.pattern(Custom_Regex.spaces), 
                Validators.pattern(Custom_Regex.username), 
                Validators.pattern(Custom_Regex.name),
                Validators.minLength(3),  
                Validators.maxLength(100)
            ]],
            leader_id: ['', [Validators.required]],
            members: [[], [Validators.required]],

        })
    }
    async getUserListOptions() {
        try {
            let url = `?page_limit=1000&page=${this.userListPage}&type=team`;
            this.commonService.showSpinner();
            const res$ = this.apiService.getReq(API_PATH.LIST_FOR_USERS + url, 'user', 'list');
            let response = await lastValueFrom(res$);
            if (response && response.data) {
                this.hasMoreUsers = response.data.hasMorePages;
                this.allMembers = [ ...this.allMembers, ...response.data];
                this.userList = [ ...this.userList, ...response.data];
                this.teamMembersList = [ ...this.teamMembersList, ...response.data];

            } else {
                this.userList = [];
                this.hasMoreUsers = false;
                this.userListPage = 1;
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
    onScrollToEnd() {
        this.userListPage = this.userListPage + 1;
        if (this.hasMoreUsers == true) {
            this.getUserListOptions();
        }
    }

    onTeamLeaderChange(leaderId: any): void {
        this.teamMembersList = this.allMembers;
        if(leaderId) {
            this.teamMembersList = this.teamMembersList.filter((e) => e.id != leaderId);
            let arr = this.addTeamForm.value.members;
            arr = arr.filter((e: any)=> e != leaderId);
            this.addTeamForm.get('members')?.patchValue(arr);
        }
    }

    /**
     * @description on add company submit
     * @author Shine Dezign Infonet Pvt. Ltd.
     * @returns { Promise<void> }
     */
    async addUserSubmit(): Promise<void> {
        this.addTeamForm.markAllAsTouched();
        if (this.addTeamForm.valid) {
            try {
                this.commonService.showSpinner();
                let data = {
                    ...this.addTeamForm.value,
                }
                const res$ = this.apiService.postReq(API_PATH.CREATE_TEAM, data, 'team', 'create');
                let response = await lastValueFrom(res$);
                if (response) {
                    this.commonService.showSuccess(response.message);
                    this.router.navigate(['/company/team-list']);
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

        } else {
            this.focusInvalidField();
        }
    }

     /**
     * @description focus first invalid field
     */
    focusInvalidField() {
        const firstInvalidControl: HTMLElement = this.el.nativeElement.querySelector(
            ".form-group .ng-invalid"
        );
        if (firstInvalidControl)
            firstInvalidControl.focus();
    }

    isTeamLead(id: string) {
        if(id === this.addTeamForm.value.leader_id) {
            return true;
        } 
        return false;
    }

}
