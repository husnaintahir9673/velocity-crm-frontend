import { Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, FormControl } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { API_PATH } from '@constants/api-end-points';
import { ApiService } from '@services/api.service';
import { AuthService } from '@services/auth.service';
import { CommonService } from '@services/common.service';
import { lastValueFrom, Subscription } from 'rxjs';

@Component({
    selector: 'app-role-list-view',
    templateUrl: './role-list-view.component.html',
    styleUrls: ['./role-list-view.component.scss']
})
export class RoleListViewComponent implements OnInit {
    form!: FormGroup;
    roleName: string = '';
    roleData: { [key: string]: any } = {};
    roleID: string = '';
    roleList: any = [];
    activeId: any = '';
    bool: boolean = false;
    TestData: any;
    color: any;
    getAllID: Array<any> = [];
    colorSubs!: Subscription;
    constructor(
        private commonService: CommonService,
        private apiService: ApiService,
        private route: ActivatedRoute,
        private fb: FormBuilder,
        private router: Router,
        private authService: AuthService
    ) { }

    ngOnInit(): void {
        // this.getRolePermissions();
        // this.initForm();
        this.getUserDetails();
        this.myfunction()
        this.form = this.fb.group({});
        let params = this.route.snapshot.params;
        if (params && params['id']) {
            this.roleID = params['id'];
            this.getRolePermissions();
        } else {
            this.commonService.showError('');
        }
        // window.addEventListener("scroll", (event) => {
        // let scroll = this.scrollY;
        //   console.log('event',event)
        // });
    }

    //

    getUserDetails(): void {
        try {
            let ud = this.authService.getUserDetails();
            if (ud)
                this.getColorOnUpdate();
            // 	this.style={fill:ud?.color};
            this.color = ud?.color
        }
        catch (error: any) {
            this.commonService.showError(error.message);
        }
    }
    getColorOnUpdate() {
        this.colorSubs = this.authService.getColor().subscribe((u) => {
            this.getUserDetails();
        });
    }


    //

    /**
     * @description get permission details
     */
    async getRolePermissions() {
        try {
            this.commonService.showSpinner();
            const res$ = this.apiService.getReq(API_PATH.ROLE_DETAIL + `?role_id=${this.roleID}`, 'role', 'list');
            let response = await lastValueFrom(res$);
            // console.log('res',response.data.permissions)
            if (response && response.data) {
                this.roleName = response?.data?.name;
                this.roleData = response.data.permissions;
                // console.log(this.roleData,'hgdhsgdhsgsdj');
                // console.log(response.data.permissions)
                this.initForm();
            }
            this.commonService.hideSpinner();
        } catch (error: any) {
            this.commonService.hideSpinner();
            if (error && error.error) {
                this.commonService.showError(error.error.message);
            } else {
                this.commonService.showError(error.message);
            }
        }
    }

    /**
     * @description get controls
     */
    get permisionFormControls() {
        return this.form.controls;
    }

    /**
     * @description init form with data
     */
    initForm() {
        let data: any = {};
        for (const key in this.roleData) {
            let arr = [];
            for (let i = 0; i < this.roleData[key].names.length; i++) {
                let v = this.roleData[key].names[i].assigned ? true : false;
                arr.push(new FormControl(v));
            }
            data[`${key}`] = this.fb.array(arr);
        }
        this.form = this.fb.group(data);
    }

    /**
     * @description on click of update
     * @returns 
     */
    updatePermissions(): void {
        try {
            let permissions = [];
            for (const key in this.form.value) {
                for (let i = 0; i < this.form.value[key].length; i++) {
                    if (this.form.value[key][i]) {
                        permissions.push(this.roleData[key].names[i].name);
                    }
                }
            }
            if (!permissions.length) {
                this.commonService.showError("Minimum one permission is required");
                return
            } else {
                this.submitUpdatePermissions(permissions);
            }
        } catch (error: any) {
            this.commonService.showError(error.message);
        }
    }

    /**
     * @description subit updated permission
     * @param permissions 
     */
    async submitUpdatePermissions(permissions: Array<string>) {
        try {
            this.commonService.showSpinner();
            let res$ = this.apiService.postReq(API_PATH.UPDATE_ROLE_PERMISSION, { assign_permissions: permissions, role_id: this.roleID }, 'role', 'edit');
            let response = await lastValueFrom(res$);
            this.commonService.hideSpinner();
            this.commonService.showSuccess(response.message);
            this.router.navigate(['/company/roles']);
        } catch (error: any) {
            this.commonService.hideSpinner();
            if (error && error.error) {
                this.commonService.showError(error.error.message);
            } else {
                this.commonService.showError(error.message);
            }
        }
    }

    checkUncheckAll(roleCategory: string, event: any) {
        for (const key in this.form.value) {
            if (key == roleCategory) {
                for (let i = 0; i < this.form.value[key].length; i++) {
                    this.roleData[key].names[i].assigned = event.target.checked ? 1 : 0
                    if (this.roleData[key].names[i].assigned = event.target.checked) {
                        this.bool = true;
                    } else {
                        this.bool = false
                    }
                }
            }
        }
        this.initForm();
    }


    parentCheck(key: string, value: boolean) {
        let formArr = this.form.get(key) as FormArray;
        for (let i = 0; i < formArr.length; i++) {
            formArr.at(i).patchValue(value);
        }
    }


    isAllChecked(key: string) {
        let formArr = this.form.get(key) as FormArray;
        // new code here
        let d = formArr.value.every((item: boolean) => item === true)
        if (d) {

            this.bool = true
        } else {
            this.bool = false
        }
        // code end
        return formArr.value.every((item: boolean) => item === true);
    }


    checboxInputChange(roleCategory: string, checkBoxName: string, event: any) {
        for (const key in this.form.value) {
            if (key == roleCategory) {
                for (let i = 0; i < this.form.value[key].length; i++) {
                    if (roleCategory == 'Document' && checkBoxName == 'document-list') {
                        this.roleData[roleCategory].names[1].assigned = event.target.checked ? 1 : 0;
                        if (this.roleData[roleCategory].names[2].assigned == 1 && event.target.checked == false) {
                            this.roleData[roleCategory].names[2].assigned = 0;
                        }
                        if (this.roleData[roleCategory].names[3].assigned == 1 && event.target.checked == false) {
                            this.roleData[roleCategory].names[3].assigned = 0;
                        }
                    } else if (roleCategory == 'Document' && checkBoxName == 'document-update' && event.target.checked == true) {
                        this.roleData[roleCategory].names[1].assigned = this.roleData[roleCategory].names[2].assigned = 1;
                    } else if (roleCategory == 'Document' && checkBoxName == 'document-delete' && event.target.checked == true) {
                        this.roleData[roleCategory].names[1].assigned = this.roleData[roleCategory].names[3].assigned = 1;
                    } else if (roleCategory == 'Email-Template' && checkBoxName == 'email-template-list') {
                        this.roleData[roleCategory].names[0].assigned = event.target.checked ? 1 : 0;
                        if (this.roleData[roleCategory].names[1].assigned == 1 && event.target.checked == false) {
                            this.roleData[roleCategory].names[1].assigned = 0;
                        }
                        if (this.roleData[roleCategory].names[2].assigned == 1 && event.target.checked == false) {
                            this.roleData[roleCategory].names[2].assigned = 0;
                        }
                    } else if (roleCategory == 'Email-Template' && checkBoxName == 'email-template-view' && event.target.checked == true) {
                        this.roleData[roleCategory].names[0].assigned = this.roleData[roleCategory].names[1].assigned = 1;
                    } else if (roleCategory == 'Email-Template' && checkBoxName == 'email-template-view' && event.target.checked == false) {
                        this.roleData[roleCategory].names[1].assigned = 0;
                        this.roleData[roleCategory].names[2].assigned = 0;
                    } else if (roleCategory == 'Email-Template' && checkBoxName == 'email-template-update' && event.target.checked == true) {
                        this.roleData[roleCategory].names[0].assigned = this.roleData[roleCategory].names[1].assigned = this.roleData[roleCategory].names[2].assigned = 1;
                    } else if (roleCategory == 'Lead' && checkBoxName == 'lead-list') {
                        this.roleData[roleCategory].names[1].assigned = event.target.checked ? 1 : 0;
                        if (this.roleData[roleCategory].names[0].assigned == 1 && event.target.checked == false) {
                            this.roleData[roleCategory].names[0].assigned = 0;
                        }
                        if (this.roleData[roleCategory].names[3].assigned == 1 && event.target.checked == false) {
                            this.roleData[roleCategory].names[3].assigned = 0;
                        }
                        if (this.roleData[roleCategory].names[4].assigned == 1 && event.target.checked == false) {
                            this.roleData[roleCategory].names[4].assigned = 0;
                        }
                    } else if (roleCategory == 'Lead' && checkBoxName == 'lead-delete' && event.target.checked == true) {
                        this.roleData[roleCategory].names[0].assigned = this.roleData[roleCategory].names[1].assigned = this.roleData[roleCategory].names[4].assigned = 1;
                    } else if (roleCategory == 'Lead' && checkBoxName == 'lead-edit' && event.target.checked == true) {
                        this.roleData[roleCategory].names[0].assigned = this.roleData[roleCategory].names[1].assigned = this.roleData[roleCategory].names[3].assigned = 1;
                    } else if (roleCategory == 'Lead' && checkBoxName == 'lead-export' && event.target.checked == true) {
                        this.roleData[roleCategory].names[0].assigned = this.roleData[roleCategory].names[1].assigned = this.roleData[roleCategory].names[5].assigned = 1;
                    } else if (roleCategory == 'Lead-Document' && checkBoxName == 'lead-document-list') {
                        this.roleData[roleCategory].names[0].assigned = event.target.checked ? 1 : 0;
                        if (this.roleData[roleCategory].names[1].assigned == 1 && event.target.checked == false) {
                            this.roleData[roleCategory].names[1].assigned = 0;
                        }
                        if (this.roleData[roleCategory].names[3].assigned == 1 && event.target.checked == false) {
                            this.roleData[roleCategory].names[3].assigned = 0;
                        }
                        if (this.roleData[roleCategory].names[4].assigned == 1 && event.target.checked == false) {
                            this.roleData[roleCategory].names[4].assigned = 0;
                        }
                        if (this.roleData[roleCategory].names[5].assigned == 1 && event.target.checked == false) {
                            this.roleData[roleCategory].names[5].assigned = 0;
                        }
                    } else if (roleCategory == 'Lead-Document' && checkBoxName == 'lead-document-rename' && event.target.checked == true) {
                        this.roleData[roleCategory].names[0].assigned = this.roleData[roleCategory].names[1].assigned = this.roleData[roleCategory].names[3].assigned = 1;
                    } else if (roleCategory == 'Lead-Document' && checkBoxName == 'lead-document-delete' && event.target.checked == true) {
                        this.roleData[roleCategory].names[0].assigned = this.roleData[roleCategory].names[1].assigned = this.roleData[roleCategory].names[4].assigned = 1;
                    } else if (roleCategory == 'Lead-Document' && checkBoxName == 'document-share' && event.target.checked == true) {
                        this.roleData[roleCategory].names[0].assigned = this.roleData[roleCategory].names[1].assigned = this.roleData[roleCategory].names[5].assigned = 1;
                    } else if (roleCategory == 'Syndicate' && checkBoxName == 'syndicate-list') {
                        this.roleData[roleCategory].names[0].assigned = event.target.checked ? 1 : 0;
                        if (this.roleData[roleCategory].names[1].assigned == 1 && event.target.checked == false) {
                            this.roleData[roleCategory].names[1].assigned = 0;
                        }
                        if (this.roleData[roleCategory].names[3].assigned == 1 && event.target.checked == false) {
                            this.roleData[roleCategory].names[3].assigned = 0;
                        }
                        if (this.roleData[roleCategory].names[4].assigned == 1 && event.target.checked == false) {
                            this.roleData[roleCategory].names[4].assigned = 0;
                        }
                    } else if (roleCategory == 'Syndicate' && checkBoxName == 'syndicate-update-status' && event.target.checked == true) {
                        this.roleData[roleCategory].names[0].assigned = this.roleData[roleCategory].names[1].assigned = this.roleData[roleCategory].names[3].assigned = 1;
                    } else if (roleCategory == 'Syndicate' && checkBoxName == 'syndicate-delete' && event.target.checked == true) {
                        this.roleData[roleCategory].names[0].assigned = this.roleData[roleCategory].names[1].assigned = this.roleData[roleCategory].names[4].assigned = 1;
                    } else {
                        this.roleData[roleCategory].names[i].assigned = this.form.value[key][i] ? 1 : 0;
                    }
                }
            }
        }
        this.initForm();
    }



    markMasterCheckbox(roleCategory: string): any {
        for (const key in this.form.value) {
            if (key == roleCategory && roleCategory == 'Credit-Score') {
                var isChecked = 0
                for (let i = 0; i < this.form.value[key].length; i++) {
                    if (this.roleData[key].names[i].assigned == 1) {
                        isChecked++;
                        if (isChecked == 2) {
                            return true;
                        }
                    }
                }
            }
            if (key == roleCategory && roleCategory == 'Data-Merch') {
                var isChecked = 0
                for (let i = 0; i < this.form.value[key].length; i++) {
                    if (this.roleData[key].names[i].assigned == 1) {
                        isChecked++;
                        if (isChecked == 1) {
                            return true;
                        }
                    }
                }
            }
            if (key == roleCategory && roleCategory == 'Document') {
                var isChecked = 0
                for (let i = 0; i < this.form.value[key].length; i++) {
                    if (this.roleData[key].names[i].assigned == 1) {
                        isChecked++;
                        if (isChecked == 4) {
                            return true;
                        }
                    }
                }
            }
            if (key == roleCategory && roleCategory == 'Email-Template') {
                var isChecked = 0
                for (let i = 0; i < this.form.value[key].length; i++) {
                    if (this.roleData[key].names[i].assigned == 1) {
                        isChecked++;
                        if (isChecked == 3) {
                            return true;
                        }
                    }
                }
            }
            if (key == roleCategory && roleCategory == 'Experian-Score') {
                var isChecked = 0
                for (let i = 0; i < this.form.value[key].length; i++) {
                    if (this.roleData[key].names[i].assigned == 1) {
                        isChecked++;
                        if (isChecked == 2) {
                            return true;
                        }
                    }
                }
            }
            if (key == roleCategory && roleCategory == 'FCS') {
                var isChecked = 0
                for (let i = 0; i < this.form.value[key].length; i++) {
                    if (this.roleData[key].names[i].assigned == 1) {
                        isChecked++;
                        if (isChecked == 3) {
                            return true;
                        }
                    }
                }
            }
            if (key == roleCategory && roleCategory == 'Lead') {
                var isChecked = 0
                for (let i = 0; i < this.form.value[key].length; i++) {
                    if (this.roleData[key].names[i].assigned == 1) {
                        isChecked++;
                        if (isChecked == 6) {
                            return true;
                        }
                    }
                }
            }
            if (key == roleCategory && roleCategory == 'Lead-Calendar') {
                var isChecked = 0
                for (let i = 0; i < this.form.value[key].length; i++) {
                    if (this.roleData[key].names[i].assigned == 1) {
                        isChecked++;
                        if (isChecked == 3) {
                            return true;
                        }
                    }
                }
            }
            if (key == roleCategory && roleCategory == 'Lead-Document') {
                var isChecked = 0
                for (let i = 0; i < this.form.value[key].length; i++) {
                    if (this.roleData[key].names[i].assigned == 1) {
                        isChecked++;
                        if (isChecked == 6) {
                            return true;
                        }
                    }
                }
            }
            if (key == roleCategory && roleCategory == 'Lead-Interview') {
                var isChecked = 0
                for (let i = 0; i < this.form.value[key].length; i++) {
                    if (this.roleData[key].names[i].assigned == 1) {
                        isChecked++;
                        if (isChecked == 2) {
                            return true;
                        }
                    }
                }
            }
            if (key == roleCategory && roleCategory == 'Lead-Note') {
                var isChecked = 0
                for (let i = 0; i < this.form.value[key].length; i++) {
                    if (this.roleData[key].names[i].assigned == 1) {
                        isChecked++;
                        if (isChecked == 2) {
                            return true;
                        }
                    }
                }
            }
            if (key == roleCategory && roleCategory == 'Lead-Operations') {
                var isChecked = 0
                for (let i = 0; i < this.form.value[key].length; i++) {
                    if (this.roleData[key].names[i].assigned == 1) {
                        isChecked++;
                        if (isChecked == 11) {
                            return true;
                        }
                    }
                }
            }
            if (key == roleCategory && roleCategory == 'Lender') {
                var isChecked = 0
                for (let i = 0; i < this.form.value[key].length; i++) {
                    if (this.roleData[key].names[i].assigned == 1) {
                        isChecked++;
                        if (isChecked == 2) {
                            return true;
                        }
                    }
                }
            }
            if (key == roleCategory && roleCategory == 'Profile') {
                var isChecked = 0
                for (let i = 0; i < this.form.value[key].length; i++) {
                    if (this.roleData[key].names[i].assigned == 1) {
                        isChecked++;
                        if (isChecked == 2) {
                            return true;
                        }
                    }
                }
            }
            if (key == roleCategory && roleCategory == 'Report') {
                var isChecked = 0
                for (let i = 0; i < this.form.value[key].length; i++) {
                    if (this.roleData[key].names[i].assigned == 1) {
                        isChecked++;
                        if (isChecked == 4) {
                            return true;
                        }
                    }
                }
            }
            if (key == roleCategory && roleCategory == 'Syndicate') {
                var isChecked = 0
                for (let i = 0; i < this.form.value[key].length; i++) {
                    if (this.roleData[key].names[i].assigned == 1) {
                        isChecked++;
                        if (isChecked == 5) {
                            return true;
                        }
                    }
                }
            }
        }
    }

    myfunction() {
        this.route.fragment.subscribe((name: any) => {
            this.activeId = name
        })
    }

    // scroll(id: any) {
    //   this.activeId = id
    // const element:any = document.getElementById(id);
    // element.scrollIntoView({ behavior: "smooth" });
    // }

    // activateClass(id:any){
    //   id.active = !id.active;    
    // }



    getDisplayName(value: any) {
        let v1 = value.split('-');
        for (var i = 0; i < v1.length; i++) {
            v1[i] = v1[i].charAt(0).toUpperCase() + v1[i].slice(1);
        }
        const str2 = v1.join(" ");
        return str2

    }

    //new code below for checkbox

    ngAfterViewChecked(): void {
        for (let id of this.getAllID) {
            let data = document.getElementById(`${id.name}`) as HTMLInputElement;
            if (data.checked === true) {
                let dataID: any = []
                let data2 = document.getElementById(`${id.name}`) as HTMLInputElement
                dataID.push(data2);
                for (let i = 0; i < dataID.length; i++) {
                    dataID[i].style.backgroundColor = this.color;
                    dataID[i].style.borderColor = this.color;

                }
            }
            else {
                const data2 = document.getElementById(`${id.name}`) as HTMLInputElement
                if (!data2.checked) {
                    // console.log('as',data2)
                    const dataID: any = []
                    dataID.push(data2);
                    for (let i = 0; i < dataID.length; i++) {
                        dataID[i].style.backgroundColor = '';
                        dataID[i].style.borderColor = '';


                    }
                }
            }
        }

    }

    test(IdValue: any) {
        this.getAllID = IdValue;
    }
    changeFormat(key: any) {
        let v1 = key.split('-');
        for (var i = 0; i < v1.length; i++) {
            v1[i] = v1[i].charAt(0).toUpperCase() + v1[i].slice(1);
        }
        const str2 = v1.join("-");
        return str2
    }

}