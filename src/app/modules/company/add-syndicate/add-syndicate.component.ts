import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { AbstractControl, FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { API_PATH } from '@constants/api-end-points';
import { Custom_Regex, Mask, SETTINGS } from '@constants/constants';
import { NgbCalendar, NgbDateParserFormatter, NgbDateStruct } from '@ng-bootstrap/ng-bootstrap';
import { ApiService } from '@services/api.service';
import { AuthService } from '@services/auth.service';
import { CommonService } from '@services/common.service';
import { lastValueFrom, Subscription } from 'rxjs';

@Component({
    selector: 'app-add-syndicate',
    templateUrl: './add-syndicate.component.html',
    styleUrls: ['./add-syndicate.component.scss']
})
export class AddSyndicateComponent implements OnInit {

    addUserForm!: FormGroup;
    countriesList: Array<any> = [];
    statesList: Array<any> = [];
    rolesList: Array<any> = [];
    mask = Mask;
    maxDate!: NgbDateStruct;
    filesForm!: FormGroup;
    selectedFiles: any[] = [];
    uploading: boolean = false;
    todayDate: string = '';
    @ViewChild('dob',) DOB!: ElementRef;
    style!: { fill: string; };
    background!: { background: string; };
    colorSubs!: Subscription;

    constructor(
        private fb: FormBuilder,
        private apiService: ApiService,
        private commonService: CommonService,
        private router: Router,
        private el: ElementRef,
        private calendar: NgbCalendar,
        private formatter: NgbDateParserFormatter,
        private authService: AuthService
    ) { }

    ngOnInit(): void {
        this.getUserDetails();
        this.initAddUserForm();
        let d = new Date();
        let day: any = d.getDate();
        if (day.toString().length < 2) {
            day = '0' + day;
        }
        this.todayDate = `${((d.getMonth() + "1")).slice(-2)}-${day}-${d.getFullYear()}`
        // this.todayDate = `${d.getMonth() + 1}-${day}-${d.getFullYear()}`
        this.initForm();


    }
    ngAfterViewInit(): void {
        if (this.DOB) {
            Inputmask('datetime', {
                inputFormat: 'mm-dd-yyyy',
                placeholder: 'mm-dd-yyyy',
                alias: 'datetime',
                min: '01-01-1920',
                max: this.todayDate,
                clearMaskOnLostFocus: false,
            }).mask(this.DOB.nativeElement);
        }

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
    changeSyndicateFee(value: any) {
        if (Number(value) > 100) {
            this.commonService.showError("Please enter value less than or equal to 100")
            this.addUserForm.patchValue({ syndication_fee: '' })
        }
    }
    changeManagementFee(value: any) {
        if (Number(value) > 100) {
            this.commonService.showError("Please enter value less than or equal to 100")
            this.addUserForm.patchValue({ management_fee: '' })
        }
    }


    /**
     * @description get form controls
     * @author Shine Dezign Infonet Pvt. Ltd.
     */
    get f(): { [key: string]: AbstractControl } {
        return this.addUserForm.controls;
    }


    /**
     * @description initialize add compnay form
     * @author Shine Dezign Infonet Pvt. Ltd.
     * @returns {void}
     */
    initAddUserForm(): void {
        this.addUserForm = this.fb.group({
            name: ['', [
                Validators.required,
                Validators.pattern(Custom_Regex.spaces),
                Validators.pattern(Custom_Regex.lettersOnly),
                Validators.maxLength(100),
                Validators.minLength(3)
            ]],
            email: ['', [Validators.required, Validators.pattern(Custom_Regex.spaces), Validators.pattern(Custom_Regex.email),]],
            phone_number: ['', [Validators.required, Validators.pattern(Custom_Regex.digitsOnly)]],
            status: ['1', [Validators.required]],
            syndication_fee: ['', [Validators.required, Validators.pattern(Custom_Regex.amount)]],
            management_fee: ['', [Validators.required, Validators.pattern(Custom_Regex.amount)]],
            mpa_signed_date: ['', Validators.required],

        })
    }

    addFileToForm(file: File) {
        this.formFileArray.push(this.fb.group({
            fileName: [file.name],
            doc_name: ['', [
                Validators.required,
                Validators.pattern(Custom_Regex.spaces),
                Validators.pattern(Custom_Regex.username),
                Validators.pattern(Custom_Regex.name),
                Validators.maxLength(100),
                Validators.minLength(3)
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
                // if (this.roles.ADMINISTRATOR === this.userRole) {
                //     if (!this.company || !this.leadOfCompany) {
                //         this.commonService.showError('Please select company and lead first.')
                //         this.uploading = false;
                //         return;
                //     }
                //     lead_id = this.leadOfCompany;
                // } else {
                //     if (!this.leadId) {
                //         this.uploading = false;
                //         this.commonService.showError('Please select lead first.')
                //         return;
                //     }
                //     lead_id = this.leadId
                // }
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



    /**
     * @description on add company submit
     * @author Shine Dezign Infonet Pvt. Ltd.
     * @returns { Promise<void> }
     */
    async addUserSubmit(): Promise<void> {
        this.addUserForm.markAllAsTouched();
        this.formFileArray.markAllAsTouched();
        if (!this.formFileArray.length) {
            this.commonService.showError('Please select any document')
        }
        if (this.addUserForm.valid && this.formFileArray.length && this.formFileArray.valid) {
            if (this.addUserForm.value.mpa_signed_date && !Custom_Regex.date.test(this.addUserForm.value.mpa_signed_date)) {
                this.commonService.showError('Invalid mpa signed date.');
                this.commonService.hideSpinner();
                return;
            }
            try {
                this.commonService.showSpinner();
                const formData: FormData = new FormData();
                formData.append('name', this.addUserForm.get('name')?.value);
                formData.append('email', this.addUserForm.get('email')?.value);
                formData.append('phone_number', this.addUserForm.get('phone_number')?.value),
                    formData.append('status', this.addUserForm.get('status')?.value);
                formData.append('syndication_fee', this.addUserForm.get('syndication_fee')?.value);
                formData.append('management_fee', this.addUserForm.get('management_fee')?.value);
                formData.append('mpa_signed_date', this.addUserForm.value.mpa_signed_date ? this.addUserForm.value.mpa_signed_date : "");
                for (let i = 0; i < this.formFileArray.value.length; i++) {
                    formData.append('document[]', this.formFileArray.value[i].file, this.formFileArray.value[i].fileName);
                    formData.append('document_name[]', this.formFileArray.value[i].doc_name);
                }
                const res$ = this.apiService.postReq(API_PATH.ADD_SYNDICATE, formData, 'syndicate', 'add');
                let response = await lastValueFrom(res$);
                if (response) {
                    this.commonService.showSuccess(response.message);
                    this.router.navigate([`/${this.userBaseRoute}/syndicates`]);
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
    get userBaseRoute() {
        return this.authService.getUserRole().toLowerCase();
    }

}
