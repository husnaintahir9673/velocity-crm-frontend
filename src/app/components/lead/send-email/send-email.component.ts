import { Component, ViewChild, OnInit, ElementRef } from '@angular/core';
import { ApiService } from '@services/api.service';
import { API_PATH } from '@constants/api-end-points';
import { CommonService } from '@services/common.service';
import { EMPTY, lastValueFrom, map, Subscription } from 'rxjs';
import { AbstractControl, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CKEditorComponent } from 'ng2-ckeditor';
import { AuthService } from '@services/auth.service';
import Swal from 'sweetalert2';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { Custom_Regex, SETTINGS } from '@constants/constants';
import { AngularEditorConfig, AngularEditorComponent } from '@kolkov/angular-editor';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
    selector: 'app-send-email',
    templateUrl: './send-email.component.html',
    styleUrls: ['./send-email.component.scss']
})
export class SendEmailComponent implements OnInit {
    modal!: NgbModalRef;
    emailTemplatesList: Array<any> = [];
    selectedTemplate: any;
    emailTemplateHTML: any;
    emailSubject: string = '';
    emailTemplateForm!: FormGroup;
    template_name: any;
    templateId: string = '';
    subject: any;
    template: any;
    name = 'ng2-ckeditor';
    ckeConfig: any = CKEDITOR.config;
    mycontent: string | undefined;
    log: string = '';
    @ViewChild("myckeditor")
    ckeditor!: CKEditorComponent;
    firstTemplateKey: any;
    canUpdateTemplate: boolean = false;
    canAddTemplate: boolean = false;
    showDeleteButton: boolean = false;
    emailTemplateId: string = '';
    canDeleteTemplate: boolean = false;
    personilizedVariables: any = [];
    editorRef!:any;
    editMode: boolean = false;
    emailTemplateType: string = '';
    duplicateMode: boolean = false;
    leadStatusList: Array<any> = [];
    templateType: Array<any> = [];
    fromOptions: Array<any> = [];
    rolesList: Array<any> = [];
    loading = false;
    editorConfig: AngularEditorConfig = {
        height: '600px',
        editable: true,
        sanitize: false,
        uploadUrl: 'company/image-upload',
        upload: (file)=> {
            const formData = new FormData();
            formData.append("image", file);
            if (SETTINGS.ALLOWED_FILES.includes(file.type)) {
                
                this.commonService.showSpinner();
                return this.apiService.postReq(API_PATH.UPLOAD_EMAIL_TEMPLATE_IMAGE, formData, 'documents', 'upload').pipe(
                      map((x: any) => {
                      x.body = {imageUrl: x.data.imageUrl};
                      this.commonService.hideSpinner();
                    return x;
                   })
                  )
                
            }
            
            else{
                this.commonService.showError('Invalid file type. Allowed file type are - gif|jpeg|png|txt|doc|docx|xlsx|xls|pdf|wav|mp3 ');
                return EMPTY;
            }
       },
        uploadWithCredentials: false,
        toolbarHiddenButtons: [
            [],
            [
                // 'insertImage',
                'insertVideo'
            ]
        ]
    }
    @ViewChild('personizedVars') personizedVars!: ElementRef;
    style!: { fill: string; };
    background!: { background: string; };
    colorSubs!: Subscription;

    constructor(
        private commonService: CommonService,
        private apiService: ApiService,
        public fb: FormBuilder,
        private authService: AuthService,
        private modalService: NgbModal,
        private route: ActivatedRoute,
        private router: Router
    ) { }

    ngOnInit(): void {
        this.getUserDetails();
        this.canAddTemplate = this.authService.hasPermission('email-template-add');
        this.canUpdateTemplate = this.authService.hasPermission('email-template-update');
        this.canDeleteTemplate = this.authService.hasPermission('email-template-delete');
        let params = this.route.snapshot.params;
        let query = this.route.snapshot.queryParams;
        if (params['id']) {
            this.templateId = params['id'];
            this.getEmailTemplateData();

        }
        if (query['mode'] && query['mode'] === 'duplicate') {
            this.duplicateMode = true;
        }

        this.getEmailTemplateOptions();
        this.initEmailTemplateForm();
        this.getLeadOptions();
        this.getPersonilzedVars();
        this.getRolesOptions();
      
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
            this.commonService.showError(error.message);
        }
    }
    getColorOnUpdate() {
        this.colorSubs = this.authService.getColor().subscribe((u) => {
          this.getUserDetails();
        });
      }

    get userBaseRoute() {
        return this.authService.getUserRole().toLowerCase();
    }

    /**
     * @description initialize email template form
     * @author Shine Dezign Infonet Pvt. Ltd.
     */
    initEmailTemplateForm() {
        this.emailTemplateForm = this.fb.group({
            template_name: ['', [Validators.required]],
            subject: ['', [
                Validators.required,
                Validators.pattern(Custom_Regex.spaces),
                Validators.pattern(Custom_Regex.address),
                Validators.pattern(Custom_Regex.address2),
                Validators.minLength(3),
                Validators.maxLength(100)
            ]],
            template_type:  ['', [Validators.required,]],
            send_application_attachment: [1],
            // is_default: [0, [Validators.required,]],
            // lead_status:  [''],
            status: [1],
            send_bcc:  [0],
            from_option:  [''],
            to_option:  [''],
            bcc_option:  [''],
            keep_renewal_user:  [0],
            template: ['', [Validators.required]]
        });
    }

    /**
     * @description formcontrols getters
     * @author Shine Dezign Infonet Pvt. Ltd.
     * @returns { [key: string]: AbstractControl }
     */
    get f(): { [key: string]: AbstractControl } {
        return this.emailTemplateForm.controls;
    }

    async emailTemplateFormSubmit(): Promise<void> {
        this.emailTemplateForm.markAllAsTouched();
        if (this.emailTemplateForm.valid) {
            let url = '';
            if(this.duplicateMode){
                url = API_PATH.ADD_EMAIL_TEMPLATE
            }else{
                url = API_PATH.SAVE_EMAIL_TEMPLATE
            }
            try {
                let data = {
                    ...this.emailTemplateForm.value,
                    template_id: this.templateId,
                    type: this.emailTemplateType
                }
                this.commonService.showSpinner();
                const res$ = this.apiService.postReq(url, data, 'email-template', 'update');
                let response = await lastValueFrom(res$);
                if (response) {
                    this.commonService.showSuccess(response.message);
                    this.router.navigate([`/${this.userBaseRoute}/email-template-list`]);
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
    async getLeadOptions() {
        try {
            this.commonService.showSpinner();
            const res$ = this.apiService.getReq(API_PATH.LEAD_OPTIONS_LIST, '', '');
            let response = await lastValueFrom(res$);
            if (response && response.data) {
                this.leadStatusList = response.data.status;
                this.templateType = response.data.template_type;
                this.fromOptions = response.data.from_options
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
    async getRolesOptions() {
        try {
            this.commonService.showSpinner();
            const res$ = this.apiService.getReq(API_PATH.ROLES_EMAIL_LIST, 'user', 'list');
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
    opensendEmailRemovepopup() {
        Swal.fire({
            title: 'Are you sure want to delete?',
            text: 'You will not be able to revert this!',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Yes, delete it!',
            confirmButtonColor: "#f0412e",
            cancelButtonText: 'Cancel'
        }).then((result) => {
            if (result.value) {
                this.deleteEmail();

            } else if (result.dismiss === Swal.DismissReason.cancel) {
                Swal.close()
            }
        })

    }
    getCapitalizeName(name: any){
        let actualName = name.replace(/[{} $]/g, "");
        actualName = actualName.replace(/[ _ ]/g, " ")
        return this.transform(actualName)
     }
    async deleteEmail() {
        try {
            let data = {
                template_id: this.emailTemplateId
            }
            this.commonService.showSpinner();
            const res$ = await this.apiService.postReq(API_PATH.EMAIL_TEMPLATES_DELETE, data, 'email-template', 'delete')
            const response = await lastValueFrom(res$);
            if (response && response.status_code == "200") {
                this.commonService.showSuccess(response.message);
                this.emailTemplatesList = this.emailTemplatesList.filter(el => !this.emailTemplateId.includes(el.id));
                if (this.emailTemplatesList[0]) {
                    this.firstTemplateKey = this.emailTemplatesList[0].key
                }
                Swal.close();

            }
            this.commonService.hideSpinner();


        } catch (error: any) {
            this.commonService.hideSpinner();
            this.commonService.showError(error.error.message);
        }
    }


    async getEmailTemplateOptions() {
        try {
            this.commonService.showSpinner();
            const res$ = this.apiService.getReq(API_PATH.GET_ALL_EMAIL_TEMPLATE_NAMES, 'email-template', 'view');
            let response = await lastValueFrom(res$);
            if (response && response.data) {
                this.emailTemplatesList = response.data;
             
                if (response.data[0]) {
                    this.firstTemplateKey = response.data[0].key
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

    // async getEmailTemplateData(template: any) {
    //     if (template) {
    //         try {
    //             this.commonService.showSpinner();
    //             const res$ = this.apiService.postReq(API_PATH.GET_EMAIL_TEMPLATE_HTML, { 'template_name': template }, 'email-template', 'view');
    //             let response = await lastValueFrom(res$);
    //             if (response && response.data) {
    //                 this.emailTemplateForm.patchValue({
    //                     subject: response.data.subject,
    //                     template: response.data.template
    //                 });
    //                 if (response.data.type == 1) {
    //                     this.emailTemplateId = response.data.id
    //                     this.showDeleteButton = true
    //                 } else {
    //                     this.showDeleteButton = false
    //                 }
    //             }
    //             this.commonService.hideSpinner();
    //         } catch (error: any) {
    //             this.commonService.hideSpinner();
    //             if (error.error && error.error.message) {
    //                 this.commonService.showError(error.error.message);
    //             } else {
    //                 this.commonService.showError(error.message);
    //             }
    //         }
    //     }

    // }
    async getEmailTemplateData() {
            try {
                this.commonService.showSpinner();
                const res$ = this.apiService.postReq(API_PATH.GET_EMAIL_TEMPLATE_HTML, { 'template_id': this.templateId }, 'email-template', 'view');
                let response = await lastValueFrom(res$);
                if (response && response.data) {
                    if(this.duplicateMode){
                        this.emailTemplateForm.patchValue({
                            subject: response.data.subject,
                            template: response.data.template,
                            template_name: response.data.template_name + '_new',
                            template_type: response.data.template_type,
                            send_application_attachment: response.data.send_application_attachment,
                            // is_default: response.data.is_default,
                            // lead_status: response.data.lead_status,
                            status: response.data.status,
                            send_bcc: response.data.send_bcc,
                            from_option: response.data.from_option,
                            to_option: response.data.to_option,
                            bcc_option: response.data.bcc_option,
                            keep_renewal_user: response.data.keep_renewal_user,
                        });
                    }else{
                        this.emailTemplateForm.patchValue({
                            subject: response.data.subject,
                            template: response.data.template,
                            template_name: response.data.template_name,
                            template_type: response.data.template_type,
                            send_application_attachment: response.data.send_application_attachment,
                            // is_default: response.data.is_default,
                            // lead_status: response.data.lead_status,
                            status: response.data.status,
                            send_bcc: response.data.send_bcc,
                            from_option: response.data.from_option,
                            to_option: response.data.to_option,
                            bcc_option: response.data.bcc_option,
                            keep_renewal_user: response.data.keep_renewal_user,
                        });
                    }
                  
                    this.emailTemplateType = response.data.type
            
                    
                    if (response.data.type == 1) {
                        this.emailTemplateId = response.data.id
                        this.showDeleteButton = true
                    } else {
                        this.showDeleteButton = false
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

    async openPeronisedForm(e: AngularEditorComponent) {
        try {
            this.editorRef = e;
            if (!Object.keys(this.personilizedVariables).length) {
                this.getPersonilzedVars();
            }
            this.modal = this.modalService.open(this.personizedVars);

        } catch (error: any) {
            this.commonService.hideSpinner();
            this.commonService.showErrorMessage(error);
        }
    }

    async getPersonilzedVars() {
        try {
            this.commonService.showSpinner();
            const res$ = this.apiService.getReq(API_PATH.PERSONILIZED_VARIABLES, '', '');
            let response = await lastValueFrom(res$);
            if (response && response.status_code == "200") {
                this.personilizedVariables = response.data;
            } else {
                this.commonService.showError(response.message);
            }
            this.commonService.hideSpinner();
        } catch (error) {
            this.commonService.hideSpinner();
            this.commonService.showErrorMessage(error);
        }
    }

    closeModal() {
        if (this.modal)
            this.modal.close();
    }

    transform(value:string): string {
        let first = value.substr(0,1).toUpperCase();
        return first + value.substr(1); 
      }

    onTokenSelect(e: any) {
        if(this.editorRef) {
            // let actualName = e.target.value.replace(/[{} $]/g, "");
            // actualName = actualName.replace(/[ _ ]/g, " ")
            // this.editorRef.executeCommand('insertText',`${this.transform(actualName)}: ${e.target.value}`);
            if(this.editorRef) {
                let actualName = e.replace(/[{} $]/g, "");
                actualName = actualName.replace(/[ _ ]/g, " ")
                this.editorRef.focus();
                this.editorRef.editorService.restoreSelection();
                this.editorRef.executeCommand('insertText',`${this.transform(actualName)}: ${e}`);
                
                
                }
            // this.editorRef.executeCommand('insertText',`${e.target.value}`);
        }
        this.closeModal()
    }

    async sendTestEmail(): Promise<void> {
        this.emailTemplateForm.markAllAsTouched();
        if (this.emailTemplateForm.valid) {
            try {
                let data = {
                    // ...this.emailTemplateForm.value,
                    // template_subject:this.emailTemplateForm.get('subject')?.value,
                    template_id: this.templateId,
                    template_name:this.emailTemplateForm.value.template_name,
                    template_subject:this.emailTemplateForm.value.subject,
                    template: this.emailTemplateForm.value.template,
                }
                this.commonService.showSpinner();
                const res$ = this.apiService.postReq(API_PATH.SEND_TEST_EMAIL_TEMPLATE, data, 'email-template', 'update');
                let response = await lastValueFrom(res$);
                if (response) {
                    this.commonService.showSuccess(response.message);
                    // this.router.navigate([`/${this.userBaseRoute}/email-template-list`]);
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

}
