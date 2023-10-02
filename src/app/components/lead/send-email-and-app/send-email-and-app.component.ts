import { Component, ViewChild, OnInit, OnDestroy, TemplateRef } from '@angular/core';
import { ApiService } from '@services/api.service';
import { API_PATH } from '@constants/api-end-points';
import { CommonService } from '@services/common.service';
import { EMPTY, lastValueFrom, map, Subscription } from 'rxjs';
import { AbstractControl, FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { CKEditorComponent } from 'ng2-ckeditor';
import { AuthService } from '@services/auth.service';
import { ActivatedRoute, Router } from '@angular/router';
import Swal from 'sweetalert2';
import { NgbCalendar, NgbDateParserFormatter, NgbDateStruct, NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import * as Model from '@interfaces/common.interface';
import { Custom_Regex, Roles, SETTINGS } from '@constants/constants';
import { AngularEditorConfig} from '@kolkov/angular-editor';

@Component({
    selector: 'app-send-email-and-app',
    templateUrl: './send-email-and-app.component.html',
    styleUrls: ['./send-email-and-app.component.scss']
})
export class SendEmailAndAppComponent implements OnInit, OnDestroy {
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
    prevConfig: any = CKEDITOR.config;
    mycontent: string | undefined;
    log: string = '';
    @ViewChild("myckeditor")
    ckeditor!: CKEditorComponent;
    @ViewChild("myprevieweditor")
    previeweditor!: CKEditorComponent;
    firstTemplateKey: any;
    canUpdateTemplate: boolean = false;
    canAddTemplate: boolean = false;
    showDeleteButton: boolean = false;
    emailTemplateId: string = '';
    todayDate!: NgbDateStruct;
    leadID: string = '';
    emailSubs!: Subscription;
    userDetails!: Model.UserDetails;
    email: string | null = '';
    filesForm!: FormGroup;
    selectedFiles: any[] = [];
    uploading: boolean = false;
    companyListPage: number = 1;
    companySearch: string = '';
    companiesList: Array<any> = [];
    hasMoreCompanies: boolean = false;
    role = Roles;
    modal!: NgbModalRef;
    previewForm!: FormGroup;
    lead: any = {};
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
    };
    previewConfig: AngularEditorConfig = {
        height: '400px',
        editable: false,
        sanitize: false,
        showToolbar: false,
        toolbarHiddenButtons: [
            [],
            [
                'insertImage',
                'insertVideo'
            ]
        ]
    }
    style!: { fill: string; };
    background!: { background: string; };
    colorSubs!: Subscription;
    color!: string;

    constructor(
        private commonService: CommonService,
        private apiService: ApiService,
        public fb: FormBuilder,
        private authService: AuthService,
        private route: ActivatedRoute,
        private calender: NgbCalendar,
        private formatter: NgbDateParserFormatter,
        private router: Router,
        private modalService: NgbModal
    ) { }

    ngOnInit(): void {
        let params = this.route.snapshot.params;
        if (params && params['id']) {
            this.leadID = params['id'];
        } else {
            this.commonService.showError('');
        }
        this.canAddTemplate = this.authService.hasPermission('email-template-add');
        this.canUpdateTemplate = this.authService.hasPermission('send-app-and-email');
        this.initEmailTemplateForm();
        this.initForm();
        this.getUserDetails();
        this.todayDate = this.calender.getToday();
        this.getEmailTemplateOptions()

        // this.getEmailOnUpdate();

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
            }
            ],
            // Remove the redundant buttons from toolbar groups defined above.
            removeButtons: 'Strike,Subscript,Superscript,Anchor,SpecialChar,PasteFromWord,ShowBlocks,blocks,bidi,Iframe,PageBreak',
            allowedContent: true
        };
        // this.prevConfig.isReadOnly = true;
        this.prevConfig = {
            forcePasteAsPlainText: true,
            removePlugins: 'exportpdf',
            toolbarLocation: 'bottom',
            height: '350',
            readOnly: true,
            removeButtons: 'Strike,Subscript,Superscript,Anchor,SpecialChar,PasteFromWord,ShowBlocks,blocks,bidi,Iframe,PageBreak',
            // toolbarGroups: [

            // ],

            allowedContent: false
        };
    }

    ngOnDestroy() {
        if (this.emailSubs) {
            this.emailSubs.unsubscribe();
        }
        localStorage.removeItem('sendAppEmail');
    }

    get userBaseRoute() {
        return this.authService.getUserRole().toLowerCase();
    }

    ValidateEmails(control: AbstractControl): { [key: string]: any } | null {
        let val: string = control.value;
        if (val) {
            let emails = val.replace(/\s/g, '').split(",");
            if (emails.length) {
                for (var i = 0; i < emails.length; i++) {
                    if (emails[i] == "" || !Custom_Regex.email.test(emails[i])) {
                        return { 'invalidEmail': true };
                    }
                }
                return null;
            }
            return null;
        }
        return null;
    }

    /**
     * @description initialize email template form
     * @author Shine Dezign Infonet Pvt. Ltd.
     */
    initEmailTemplateForm() {
        this.emailTemplateForm = this.fb.group({
            email: ['', [Validators.required, this.ValidateEmails, Validators.pattern(Custom_Regex.spaces)]],
            cc: ['', [this.ValidateEmails, Validators.pattern(Custom_Regex.spaces)]],
            bcc: ['', [this.ValidateEmails, Validators.pattern(Custom_Regex.spaces)]],
            template_name: ['', [Validators.required]],
            subject: ['', [
                Validators.required, 
                Validators.pattern(Custom_Regex.spaces),
                Validators.pattern(Custom_Regex.address),
                Validators.pattern(Custom_Regex.address2),
                Validators.minLength(3),
                Validators.maxLength(100)
            ]],
            template: ['', [Validators.required]],
            schedule: ['0', [Validators.required]],
            send_on: [''],

        });
    }
    changeEmail(value: any) {
        if(value == 1) {
            this.emailTemplateForm.get('send_on')?.setValidators([Validators.required]);
             this.emailTemplateForm.get('send_on')?.updateValueAndValidity();
        }else{
            this.emailTemplateForm.get('send_on')?.clearValidators();
             this.emailTemplateForm.get('send_on')?.updateValueAndValidity();
        }

    }

    getUserDetails() {
        let ud = this.authService.getUserDetails();
        if (ud) {
            this.userDetails = ud;
            this.getColorOnUpdate();
                this.style={fill:ud?.color};
                 this.color=ud?.color;
                    // this.stroke={stroke:ud?.color};
                 
                     this.background={background:ud?.color};
                  
            this.email = localStorage.getItem('sendAppEmail') ? localStorage.getItem('sendAppEmail') : '';
            if (!this.email) {
                this.commonService.showError('Something went wrong.');
            }
            this.emailTemplateForm.patchValue({
                email: this.email
            })
        }
    }
    getColorOnUpdate() {
        this.colorSubs = this.authService.getColor().subscribe((u) => {
          this.getUserDetails();
        });
      }
    getEmailOnUpdate() {
        this.emailSubs = this.authService.getEmail().subscribe((u) => {
            this.getUserDetails();
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
        this.formFileArray.markAllAsTouched();
        if (this.emailTemplateForm.valid && this.formFileArray.valid) {
            if(this.emailTemplateForm.value.schedule == 1) {
                this.emailTemplateForm.get('send_on')?.setValidators([Validators.required]);
                this.emailTemplateForm.get('send_on')?.updateValueAndValidity();
            }else{
                this.emailTemplateForm.get('send_on')?.clearValidators();
                this.emailTemplateForm.get('send_on')?.updateValueAndValidity();
            }
            try {

                const ccs = this.emailTemplateForm.value.cc ? this.emailTemplateForm.value.cc.split(",") : [];
                const bccs = this.emailTemplateForm.value.bcc ? this.emailTemplateForm.value.bcc.split(",") : [];
                const formData: FormData = new FormData();
                for (let i = 0; i < ccs.length; i++) {
                    formData.append('ccs[]', ccs[i]);
                }
                for (let i = 0; i < bccs.length; i++) {
                    formData.append('bccs[]', bccs[i]);
                }

                formData.append('lead_id', this.leadID);
                // formData.append('ccs[]', JSON.stringify(ccs));
                // formData.append('bccs[]', JSON.stringify(bccs));
                formData.append('template_id', this.emailTemplateForm.get('template_name')?.value);
                formData.append('email', this.emailTemplateForm.get('email')?.value),
                formData.append('subject', this.emailTemplateForm.get('subject')?.value),
                    formData.append('template', this.emailTemplateForm.get('template')?.value);
                formData.append('schedule', this.emailTemplateForm.get('schedule')?.value);
                formData.append('send_on', this.formatter.format(this.emailTemplateForm.value.send_on));
                for (let i = 0; i < this.formFileArray.value.length; i++) {
                    formData.append('document[]', this.formFileArray.value[i].file, this.formFileArray.value[i].fileName);
                    formData.append('document_name[]', this.formFileArray.value[i].doc_name);
                }
                this.commonService.showSpinner();
                const res$ = this.apiService.postReq(API_PATH.SEND_EMAIL_SUBMIT, formData, 'send', 'app-and-email');
                let response = await lastValueFrom(res$);
                if (response) {
                    this.commonService.showSuccess(response.message);
                    if (response.api_response == 'success') {
                        this.commonService.showSuccess(response.message);
                        localStorage.removeItem('sendAppEmail');
                        this.router.navigate([`/${this.userBaseRoute}/lead-detail/` + this.leadID]);

                    }

                }
                this.commonService.hideSpinner();
            } catch (error: any) {
                if(error.error.message == 'Force send'){
                    Swal.fire({
                        title: 'This user unsubscribed for all the emails, you want to shoot an email?',
                        icon: 'warning',
                        showCancelButton: true,
                        confirmButtonText: 'OK',
                        confirmButtonColor: "#f0412e",
                    }).then((result) => {
                        if (result.value) {
                        this.mailSendForcefully();
                      
                        } else if (result.dismiss === Swal.DismissReason.cancel) {
                            Swal.close()
                        }
                    })
                }
                this.commonService.hideSpinner();
                if (error.error && error.error.message) {
                    if(error.error.message != 'Force send'){
                    this.commonService.showError(error.error.message);
                    }
                } else {
                    this.commonService.showError(error.message);
                  
                }
            }

        }

    }

   async mailSendForcefully(){
        try {
            this.commonService.showSpinner();
            let data = {
                email: this.emailTemplateForm.value.email,
            }
            const res$ = this.apiService.postReq(API_PATH.MAIL_SEND_FORCEFULLY, data, 'send', 'app-and-email');
           let response = await lastValueFrom(res$);
            if (response) {
                // this.commonService.showSuccess(response.message);
                if (response.api_response == 'success') {
                    this.emailTemplateFormSubmit();
                    // this.commonService.showSuccess(response.message);

                }
            }
            this.commonService.hideSpinner();
        } catch (error: any) {
            this.commonService.hideSpinner();
            if (error.error && error.error.message) {
                this.commonService.showError(error.error.message);
            } else {
                this.commonService.hideSpinner();
                this.commonService.showError(error.message);
            }
        }  
    }
    async previewTemplate() {
        try {
            this.commonService.showSpinner();
            let data = {
                lead_id: this.leadID,
                template: this.emailTemplateForm.value.template
            }
            const res$ = this.apiService.postReq(API_PATH.SEND_EMAIL_PREVIEW, data, 'send', 'app-and-email');
           let response = await lastValueFrom(res$);
            if (response) {
                // this.commonService.showSuccess(response.message);
                if (response && response.data) {
                    this.previewForm.patchValue({
                        preview_template: response.data
                    });
                    // this.commonService.showSuccess(response.message);

                }
            }
            this.commonService.hideSpinner();
        } catch (error: any) {
            this.commonService.hideSpinner();
            if (error.error && error.error.message) {
                this.commonService.showError(error.error.message);
            } else {
                this.commonService.hideSpinner();
                this.commonService.showError(error.message);
            }
        }
    }
    initPreviewForm() {
        this.previewForm = this.fb.group({
            preview_template: [''],
        })
    }
    openModal(templateRef: TemplateRef<any>) {
        try {
            this.modal = this.modalService.open(templateRef, { backdrop: 'static', size: 'lg' });
            this.initPreviewForm();
            this.previewTemplate();
        } catch (error: any) {
            this.commonService.showError(error.message);
        }
    }

    closeModal() {
        this.modal.close();
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
    async deleteEmail() {
        try {
            let data = {
                template_id: this.emailTemplateId,
            }

            this.commonService.showSpinner();
            const res$ = await this.apiService.postReq(API_PATH.EMAIL_TEMPLATES_DELETE, data, 'email-template', 'delete')
            const response = await lastValueFrom(res$);
            if (response && response.status_code == "200") {
                this.commonService.showSuccess(response.message);
                this.emailTemplatesList = this.emailTemplatesList.filter(el => !this.emailTemplateId.includes(el.id));
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
            let url = '';
            if (this.userDetails.role == Roles.ADMINISTRATOR) {
                url = `?lead_id=${this.leadID}`
            }
            this.commonService.showSpinner();
            const res$ = this.apiService.getReq(API_PATH.SEND_APP_EMAIL_TEMPLATE_LIST + url, 'send', 'app-and-email');
            let response = await lastValueFrom(res$);
            if (response && response.data) {
                this.emailTemplatesList = response.data;
                   let data1 = this.emailTemplatesList.filter((e) => e.name == 'Access Documents');
                   if(data1[0]?.id){
                    this.firstTemplateKey = data1[0].id ;
                   }else if (response.data[0]) {
                        this.firstTemplateKey = response.data[0].id
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
    // async onCompanySelect(value: any) {
    //   this.companyId = value;
    // }
    async getEmailTemplateData(template: any) {
        if (template) {
            try {
                let data = {}

                if (this.userDetails.role == Roles.ADMINISTRATOR) {
                    data = {
                        template_id: template,
                        lead_id: this.leadID
                    }
                } else {
                    data = {
                        template_id: template,
                    }
                }
                this.commonService.showSpinner();
                const res$ = this.apiService.postReq(API_PATH.GET_EMAIL_TEMPLATE_HTML, data, 'send', 'app-and-email');
                let response = await lastValueFrom(res$);
                if (response && response.data) {
                    this.emailTemplateForm.patchValue({
                        subject: response.data.subject,
                        template: response.data.template
                    });
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
    addFileToForm(file: File) {
        this.formFileArray.push(this.fb.group({
            fileName: [file.name],
            doc_name: ['', [
                Validators.required, 
                Validators.pattern(Custom_Regex.spaces), 
                Validators.pattern(Custom_Regex.username),
                Validators.pattern(Custom_Regex.name),
                Validators.minLength(3),
                Validators.maxLength(100)
            ]],
            file: [file]
        }))
    }

    initForm() {
        this.filesForm = this.fb.group({
            files: this.fb.array([])
        })
    }

    get formFileArray() {
        return this.filesForm.get('files') as FormArray;
    }
    removeFileFromArray(i: number) {
        this.formFileArray.removeAt(i);
    }
    /**
 * 
 * @param files 
 */
    onFileChange(files: File[], input: any) {
        this.selectedFiles = [];
        for (let i = 0; i < files.length; i++) {
            if (files[i].size / 1024 / 1024 > 10) {
                this.commonService.showError('Maximum file size allowed is 10MB');
            } else if (!SETTINGS.ALLOWED_FILES.includes(files[i].type)) {
                this.commonService.showError('Invalid file type. Allowed file type are - gif|jpeg|png|txt|doc|docx|xlsx|xls|pdf|wav|mp3 ');
            } else {
                this.addFileToForm(files[i])
            }
        }
        input.value = '';
    }
    async uploadDocuments() {
        try {
            this.uploading = true;
            let lead_id = '';
            if (this.formFileArray.length) {
                if (this.formFileArray.valid) {
                    const formData: FormData = new FormData();
                    for (let i = 0; i < this.formFileArray.value.length; i++) {
                        formData.append('document[]', this.formFileArray.value[i].file, this.formFileArray.value[i].fileName);
                        formData.append('name[]', this.formFileArray.value[i].doc_name);
                        formData.append('document_type[]', this.formFileArray.value[i].doc_type);
                    }
                    formData.append('lead_id', lead_id);

                    this.uploading = true;
                    this.commonService.showSpinnerWithId('uploading');
                    const res$ = this.apiService.postReq(API_PATH.UPLOAD_LEAD_DOC, formData, 'lead', 'edit');
                    const response = await lastValueFrom(res$);
                    if (response && response.status_code == "200") {
                        this.commonService.showSuccess(response.message);
                        this.uploading = false;
                        this.commonService.hideSpinnerWithId('uploading');
                        this.selectedFiles = [];
                        // this.search = '';
                        // this.page = 1;
                        // this.getDocsList();
                        this.formFileArray.clear();
                    } else {
                        this.uploading = false;
                        this.commonService.showError(response.message);
                        this.commonService.hideSpinnerWithId('uploading');
                    }
                } else {
                    this.formFileArray.markAllAsTouched();
                    this.uploading = false;
                }

            } else {
                this.commonService.showError('No file selected.')
                this.uploading = false;
            }
        } catch (error) {
            this.uploading = false;
            this.commonService.hideSpinnerWithId('uploading');
            this.commonService.hideSpinner();
            this.commonService.showErrorMessage(error);
        }
    }


    getLeadBasicDetails(leadData: any) {
        this.lead = leadData;

    }
// custom datepicker color
ngDoCheck():void {
    this.getDateColor();
}

getDateColor(){
    let monthNameClr = document.getElementsByClassName('ngb-dp-month-name');
    // let data3 = document.getElementsByClassName('btn btn-link ngb-dp-arrow-btn');
    let arrowColor = document.getElementsByClassName('ngb-dp-navigation-chevron');
    for (let i = 0; i < monthNameClr.length; i++) {
        monthNameClr[i].setAttribute('style',`color:${this.color}`)
        arrowColor[i].setAttribute('style',`border-color:${this.color}`)
        }
        let weekNameClr = document.getElementsByClassName('ngb-dp-weekday small');
        for (let i = 0; i < weekNameClr.length; i++) {
            weekNameClr[i].setAttribute('style',`color:${this.color}`)
            }
        


    const tds = document.getElementsByClassName('custom-day') as HTMLCollectionOf<HTMLElement>;
for (let index = 0; index < tds.length; index++) {
 tds[index].style.setProperty('--custom',`${this.color}`);

}
 }

}

