import { Component, ElementRef, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { API_PATH } from '@constants/api-end-points';
import { Custom_Regex, Mask } from '@constants/constants';
import { ApiService } from '@services/api.service';
import { AuthService } from '@services/auth.service';
import { CommonService } from '@services/common.service';
import { lastValueFrom } from 'rxjs';

@Component({
    selector: 'app-view-edit-team',
    templateUrl: './view-edit-team.component.html',
    styleUrls: ['./view-edit-team.component.scss']
})
export class ViewEditTeamComponent implements OnInit {
    addTeamForm!: FormGroup;
    userList: Array<any> = [];
    teamMembersList: Array<any> = [];
    passwordType: boolean = true;
    mask = Mask;
    loading = false;
    hasMoreUsers: boolean = false;
    userListPage: number = 1;
    editMode: boolean = false;
    teamID: string = '';
    teamDetails: any = {};
    teamMembers: Array<any> = [];
    canUpdateTeam: boolean = false;
    allMembers: any[] = [];
    teamLeaderId: string = '';
    constructor(
        private fb: FormBuilder,
        private apiService: ApiService,
        private commonService: CommonService,
        private router: Router,
        private authService: AuthService,
        private el: ElementRef,
        private route: ActivatedRoute
    ) { }

    ngOnInit(): void {
        let params = this.route.snapshot.params;
        let query = this.route.snapshot.queryParams;
        if (params['id']) {
            this.teamID = params['id'];
            this.getTeamDetails();

        }
        this.initaddTeamForm();
        this.getUserListOptions();
        if (query['mode'] && query['mode'] === 'edit') {
            this.editMode = true;
        }
        if (!this.editMode) {
            this.addTeamForm?.controls['members'].disable();

        }
        this.canUpdateTeam = this.authService.hasPermission('team-delete');

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
                Validators.minLength(3),
                Validators.pattern(Custom_Regex.name),
                Validators.maxLength(100)]],
            leader_id: ['', [Validators.required]],
            members: ['', [Validators.required]],

        })
    }
    async getUserListOptions() {
        try {
            // let url = `?page_limit=15&page=${this.userListPage}`;
            let url = `?page_limit=1000&page=${this.userListPage}&type=team`;
            this.commonService.showSpinner();
            const res$ = this.apiService.getReq(API_PATH.LIST_FOR_USERS + url, 'user', 'list');
            let response = await lastValueFrom(res$);
            if (response && response.data) {
                this.hasMoreUsers = response.data.hasMorePages;
                this.allMembers = [...this.allMembers, ...response.data];
                this.userList = [...this.userList, ...response.data];
                this.teamMembersList = [...this.teamMembersList, ...response.data];
                if (this.teamDetails.leader_id) {
                    setTimeout(() => {
                        let teamMemberArray = this.teamMembersList.filter((e: any) => e.id != this.teamDetails.leader_id);
                         this.teamMembersList = teamMemberArray;
                    })
                  
                }


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
    patchValues() {
        if (!this.editMode) {
            this.teamMembers = [];
            for (let i = 0; i < this.teamDetails?.members.length; i++) {
                this.teamMembers.push(this.teamDetails?.members[i].member_name);
                this.teamMembers.join(', ');
            }
        }
        let members_ids = [];

        for (let member of this.teamDetails.members) {
            members_ids.push(member.id);
        }
        //   let arr = this.addTeamForm.value.members;
        //   arr = arr.filter((e: any)=> e != member.id);
        //   this.addTeamForm.get('members')?.patchValue(arr);
        this.addTeamForm.patchValue({
            team_name: this.teamDetails.team_name,
            leader_id: this.teamDetails.leader_id,
            members: members_ids,
        })
        this.teamLeaderId = this.teamDetails.leader_id;


    }
    async getTeamDetails(): Promise<void> {
        try {
            this.commonService.showSpinner();
            let data = {
                team_id: this.teamID
            }
            const res$ = this.apiService.postReq(API_PATH.TEAM_VIEW, data, 'team', 'edit');
            let response = await lastValueFrom(res$);
            if (response && response.data) {
                this.teamDetails = response.data;
                this.patchValues();

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
    edit() {
        this.editMode = !this.editMode;
        this.addTeamForm.controls['members'].enable();
    }
    cancel() {
        this.editMode = !this.editMode;
        this.addTeamForm.controls['members'].disable();
        this.patchValues();
    }
    onScrollToEnd() {
        this.userListPage = this.userListPage + 1;
        if (this.hasMoreUsers == true) {
            this.getUserListOptions();
        }
    }

    onTeamLeaderChange(leaderId: any): void {
        this.teamMembersList = this.allMembers;
        if (leaderId) {
            this.teamMembersList = this.teamMembersList.filter((e) => e.id != leaderId);
            let arr = this.addTeamForm.value.members;
            arr = arr.filter((e: any) => e != leaderId);
            this.addTeamForm.get('members')?.patchValue(arr);
        }
    }

    /**
     * @description on add company submit
     * @author Shine Dezign Infonet Pvt. Ltd.
     * @returns { Promise<void> }
     */
    async updateTeamSubmit(): Promise<void> {
        this.addTeamForm.markAllAsTouched();
        if (this.addTeamForm.valid) {
            try {
                this.commonService.showSpinner();
                let data = {
                    ...this.addTeamForm.value,
                    team_id: this.teamID
                }
                const res$ = this.apiService.postReq(API_PATH.TEAM_EDIT, data, 'team', 'update-status');
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

}


