import { Component, OnInit, TemplateRef } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { API_PATH } from '@constants/api-end-points';
import { Custom_Regex } from '@constants/constants';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { ApiService } from '@services/api.service';
import { AuthService } from '@services/auth.service';
import { CommonService } from '@services/common.service';
import { lastValueFrom, Subscription } from 'rxjs';
import Swal from 'sweetalert2';

@Component({
    selector: 'app-roles',
    templateUrl: './roles.component.html',
    styleUrls: ['../../../styles/dashboard.scss', './roles.component.scss']
})
export class RolesComponent implements OnInit {
    addRoleForm!: FormGroup;
    rolesList: Array<any> = [];
    modal!: NgbModalRef;
    newRoleId: string = '';
    style!: { fill: string; };
    background!: { background: string; };
    colorSubs!: Subscription;
    deleteModal!: NgbModalRef;
    totalUserCount: number = 0;
    otherUserCount: number = 0;
    hardDelete: number = 0;
    deleteRoleId: string = '';
    constructor(
        private commonService: CommonService,
        private apiService: ApiService,
        private modalService: NgbModal,
        private fb: FormBuilder,
        private router: Router,
        private authService: AuthService
    ) { }

    ngOnInit(): void {
        this.getRolesList();
        this.getUserDetails();

    }

    getUserDetails(): void {
        try {
            let ud = this.authService.getUserDetails();
            if (ud) {
                this.getColorOnUpdate();
                this.style = { fill: ud?.color };
                // this.color=ud?.color;
                // this.stroke={stroke:ud?.color};
                this.background = { background: ud?.color };

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

    initaddRoleForm() {
        this.addRoleForm = this.fb.group({
            name: ['', [
                Validators.required,
                Validators.pattern(/^[A-Za-z]+$/),
                Validators.minLength(3),
                Validators.maxLength(20)
            ]],
        })
    }

    /**
     * @description change passsword submit
     * @returns {Promise<void>}
     * @author Shine Dezign Infonet Pvt. Ltd.
     */
    async addRoleSubmit(): Promise<void> {
        this.addRoleForm.markAllAsTouched();
        if (this.addRoleForm.valid) {
            let data = {
                ...this.addRoleForm.value,
            }
            try {
                this.commonService.showSpinner();
                const res$ = this.apiService.postReq(API_PATH.ADD_ROLE, data, 'role', 'create');
                let response = await lastValueFrom(res$);
                if (response) {
                    this.commonService.showSuccess(response.message);
                    this.closeModal();
                    if (response.data) {
                        this.newRoleId = response.data.role_id
                    }
                    this.router.navigate(['/company/role/' + this.newRoleId]);
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

    }
    /**
       * @description delete user after confirmation
       * @param user 
       * @author Shine Dezign Infonet Pvt. Ltd.
       * @returns { Promise<void> }
       */
    async deleteRole(role: any): Promise<void> {
        this.deleteRoleId = role
        try {
            this.commonService.showSpinner();
            const res$ = this.apiService.postReq(API_PATH.ROLE_DELETE, { role_id: role.id, hard_delete: this.hardDelete}, 'role', 'delete');
            let response = await lastValueFrom(res$);
            if (response && response.data) {
                // this.rolesList = this.rolesList.filter((e) => e.id != role.id);

            }
            if (response.data.other_roles_count || response.data.total_users_count) {
                this.otherUserCount = response.data.other_roles_count;
                this.totalUserCount = response.data.total_users_count;
           this.opendeleteRole()
            }
            if (response.data.other_roles_count == 0 ||  response.data.total_users_count == 0) {
                this.otherUserCount = response.data.other_roles_count;
                this.totalUserCount = response.data.total_users_count;
       this.opendeleteRole()
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
    async deletespecificRole(role: any): Promise<void> {
        this.deleteRoleId = role
        try {
            this.commonService.showSpinner();
            const res$ = this.apiService.postReq(API_PATH.ROLE_DELETE, { role_id: role.id, hard_delete: this.hardDelete}, 'role', 'delete');
            let response = await lastValueFrom(res$);
            if (response && response.data) {
                this.rolesList = this.rolesList.filter((e) => e.id != role.id);
                this.commonService.showSuccess(response.message);
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
    opendeleteRole() {
        let user = '';
        let otheruser = '';
        if(this.totalUserCount == 0 || this.totalUserCount == 1){
            user = 'user'
        }else{
            user = 'users'
        }
        if(this.otherUserCount == 0 || this.otherUserCount == 1){
            otheruser = 'user'
        }else{
            otheruser = 'users'
        }
        let title = "There are " + this.totalUserCount + ' ' +  user + " associated with this role and " + this.otherUserCount + ' ' + otheruser + " has assign multiple roles"
        Swal.fire({      
            title: title,
            text: 'Are you still sure to delete this role?',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Yes',
            confirmButtonColor: "#f0412e",
            cancelButtonText: 'Cancel'
        }).then((result) => {
            if (result.value) {
                this.hardDelete = 1;
                console.log("hvg", this.deleteRoleId);
                
                this.deletespecificRole(this.deleteRoleId)
            } else if (result.dismiss === Swal.DismissReason.cancel) {
                Swal.close();
            }
        })

    }
    /**
     * @description formcontrols getters
     * @author Shine Dezign Infonet Pvt. Ltd.
     * @returns { [key: string]: AbstractControl }
     */
    get f(): { [key: string]: AbstractControl } {
        return this.addRoleForm.controls;
    }

    openModal(templateRef: TemplateRef<any>) {
        try {
            this.modal = this.modalService.open(templateRef, { backdrop: 'static', size: 'md' });
            this.initaddRoleForm();
        } catch (error: any) {
            this.commonService.showError(error.message);
        }
    }

    closeModal() {
        this.modal.close();
    }
    /**
     * @description get roles list
     */
    async getRolesList() {
        try {
            this.commonService.showSpinner();
            const res$ = this.apiService.getReq(API_PATH.ROLES_LIST, 'role', 'list');
            let response = await lastValueFrom(res$);
            if (response && response.data) {
                this.rolesList = response.data;
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

}
