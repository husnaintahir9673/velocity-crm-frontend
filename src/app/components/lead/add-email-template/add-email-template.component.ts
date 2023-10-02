import { Component, ViewChild, OnInit, ElementRef } from '@angular/core';
import { ApiService } from '@services/api.service';
import { API_PATH } from '@constants/api-end-points';
import { CommonService } from '@services/common.service';
import { lastValueFrom, map, Subscription } from 'rxjs';
import { AbstractControl, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CKEditorComponent } from 'ng2-ckeditor';
import { AuthService } from '@services/auth.service';
import { Router } from '@angular/router';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { Custom_Regex, SETTINGS } from '@constants/constants';
import { AngularEditorConfig, AngularEditorComponent } from '@kolkov/angular-editor';
import Swal from 'sweetalert2';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { EMPTY } from 'rxjs'



@Component({
    selector: 'app-add-email-template',
    templateUrl: './add-email-template.component.html',
    styleUrls: ['./add-email-template.component.scss']
})
export class AddEmailTemplateComponent implements OnInit {
    modal!: NgbModalRef;
    emailTemplatesList: Array<any> = [];
    selectedTemplate: any;
    emailTemplateHTML: any;
    emailSubject: string = '';
    emailTemplateForm!: FormGroup;
    template_name: any;
    subject: any;
    template: any;
    name = 'ng2-ckeditor';
    ckeConfig: any = CKEDITOR.config;
    mycontent: string | undefined;
    log: string = '';
    @ViewChild("myckeditor")
    ckeditor!: CKEditorComponent;
    firstTemplateKey: any;
    canAddTemplate: boolean = false;
    personilizedVariables: any = [];
    // editorRef!: AngularEditorComponent;
    editorRef!:any;
    imageUrl: string = '';
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
    colorSubs!:Subscription;
    constructor(
        private commonService: CommonService,
        private apiService: ApiService,
        public fb: FormBuilder,
        private authService: AuthService,
        private router: Router,
        private modalService: NgbModal,
        private ngxLoader: NgxUiLoaderService

    ) { }

    ngOnInit(): void {
        this.canAddTemplate = this.authService.hasPermission('email-template-add');
        this.initEmailTemplateForm();
        this.getUserDetails();
        this.getLeadOptions();
        this.getPersonilzedVars();
        this.getRolesOptions();
        // this.getEmailTemplateData();
        this.ckeConfig = {
            //extraPlugins: 'divarea',
            forcePasteAsPlainText: true,
            removePlugins: 'exportpdf',
            toolbarLocation: 'bottom',
            height: '350',
            toolbarGroups: [{
                "name": "basicstyles",
                "groups": ["basicstyles"]
            },
            {
                "name": "links",
                "groups": ["links"]
            },
            {
                "name": "list",
                "groups": ['list', 'indent', 'align', 'NumberedList', 'BulletedList', 'todoList', '-', 'Outdent', 'Indent', '-', 'Blockquote']
            },
            {
                "name": "insert",
                "groups": ["insert"]
            },
            {
                "name": "tools",
                "groups": ["Maximize"]
            },{
                "name": "custom"
            }
            ],
            // Remove the redundant buttons from toolbar groups defined above.
            removeButtons: 'Strike,Subscript,Superscript,Anchor,SpecialChar,PasteFromWord,ShowBlocks,blocks,bidi,Iframe,PageBreak',
            allowedContent: true
        };

    }
    get userBaseRoute() {
        return this.authService.getUserRole().toLowerCase();
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

    /**
     * @description initialize email template form
     * @author Shine Dezign Infonet Pvt. Ltd.
     */
    initEmailTemplateForm() {
        this.emailTemplateForm = this.fb.group({
            template_name: ['', [
                Validators.required,
                Validators.pattern(Custom_Regex.spaces), 
                Validators.pattern(Custom_Regex.address), 
                Validators.pattern(Custom_Regex.address2),
                Validators.maxLength(100),
                Validators.minLength(3)
            ]],
            subject: ['', [
                Validators.required, 
                Validators.pattern(Custom_Regex.spaces), 
                Validators.pattern(Custom_Regex.address), 
                Validators.pattern(Custom_Regex.address2),
                Validators.maxLength(100), 
                Validators.minLength(3)
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
    
    async handleContinue(): Promise<void> {
        this.emailTemplateForm.markAllAsTouched();
        if(this.emailTemplateForm.valid) {
            Swal.fire({
                title: 'Please confirm your template name and subject',
                icon: 'warning',
                showCancelButton: true,
                confirmButtonText: ' Ok',
                confirmButtonColor: "#f0412e",
                cancelButtonText: 'Cancel'
            }).then((result)=>{if(result.value){
                Swal.fire({
                    title: 'Please select the action !',
                    // html:'<input type="checkbox"  id="checkbox1" value="Save"> <label for="save">Save</label><input type="checkbox" id="checkbox2" value="sendEmail"> <label for="sendEmail">Send Test Email</label> ',
                    icon: 'warning',
                    showCancelButton: true,
                    confirmButtonText: 'Save',
                    confirmButtonColor: "#f0412e",
                    cancelButtonText: 'Send Test Email & Save',
                    customClass:'swal-wide',
                    cancelButtonColor:"#D51B07",

                }).then((result)=>{
                    if(result.value){
                        this.addemailTemplateFormSubmit()
                        Swal.close()
                        // console.log(result.value)
                        // if (response) {
                        //     this.commonService.showSpinner();
                        //     this.commonService.showSuccess(response.message);
                        //     this.router.navigate([`/${this.userBaseRoute}/email-template-list`]);
                        // }
                    } else if (result.dismiss === Swal.DismissReason.cancel) {
                        this.sendTestEmail();
                        Swal.close()
                }})
             if(result.dismiss=== Swal.DismissReason.cancel){
                    Swal.close()
                }
            }})
        }
        
    }

    async addemailTemplateFormSubmit(): Promise<void> {
        this.emailTemplateForm.markAllAsTouched();
        if (this.emailTemplateForm.valid) {
            try {
                let data = {
                    ...this.emailTemplateForm.value
                }
                this.commonService.showSpinner();
                const res$ = this.apiService.postReq(API_PATH.ADD_EMAIL_TEMPLATE, data, 'email-template', 'add');
                let response = await lastValueFrom(res$);
                if(response){
                //    console.log(response)
                   this.commonService.showSuccess(response.message)
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


    async openPeronisedForm(e: any) {
        try {
            this.editorRef = e;
            if(!Object.keys(this.personilizedVariables).length) {
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
            if(response && response.status_code == "200") {
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
        if(this.modal)
        this.modal.close();
    }
    transform(value:string): string {
        let first = value.substr(0,1).toUpperCase();
        return first + value.substr(1); 
      }

    onTokenSelect(e: any) {
        // console.log("jii", e.target.value);
        if(this.editorRef) {
        let actualName = e.replace(/[{} $]/g, "");
        actualName = actualName.replace(/[ _ ]/g, " ")
        this.editorRef.focus();
        this.editorRef.editorService.restoreSelection();
        this.editorRef.executeCommand('insertText',`${this.transform(actualName)}: ${e}`);
        }
        this.closeModal()
    }
     getCapitalizeName(name: any){
        let actualName = name.replace(/[{} $]/g, "");
        actualName = actualName.replace(/[ _ ]/g, " ")
        return this.transform(actualName)
     }
    async sendTestEmail(): Promise<void> {
        this.emailTemplateForm.markAllAsTouched();
        if (this.emailTemplateForm.valid) {
            try {
                let data = {
                    // ...this.emailTemplateForm.value,
                    // template_subject:this.emailTemplateForm.get('subject')?.value,
                    template_name:this.emailTemplateForm.value.template_name,
                    template_subject:this.emailTemplateForm.value.subject,
                    template: this.emailTemplateForm.value.template,
                }
                this.commonService.showSpinner();
                const res$ = this.apiService.postReq(API_PATH.SEND_TEST_EMAIL_TEMPLATE, data, 'email-template', 'update');
                let response = await lastValueFrom(res$);
                if (response) {
                    this.commonService.showSuccess(response.message);
                    this.addemailTemplateFormSubmit();
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
}


