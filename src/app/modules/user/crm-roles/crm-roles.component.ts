import { Component, OnInit, TemplateRef } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { API_PATH } from '@constants/api-end-points';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { ApiService } from '@services/api.service';
import { CommonService } from '@services/common.service';
import { lastValueFrom } from 'rxjs';

@Component({
    selector: 'app-crm-roles',
    templateUrl: './crm-roles.component.html',
    styleUrls: ['../../../styles/dashboard.scss', './crm-roles.component.scss']
})
export class CrmRolesComponent implements OnInit {
    addRoleForm!: FormGroup;
    rolesList: Array<any> = [];
    modal!: NgbModalRef;
    newRoleId: string = '';
    constructor(
        private commonService: CommonService,
        private apiService: ApiService,
        private modalService: NgbModal,
        private fb: FormBuilder,
        private router: Router
    ) { }

    ngOnInit(): void {
        this.getRolesList();

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
        try {
            this.commonService.showSpinner();
            const res$ = this.apiService.postReq(API_PATH.ROLE_DELETE, { role_id: role.id }, 'role', 'delete');
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

