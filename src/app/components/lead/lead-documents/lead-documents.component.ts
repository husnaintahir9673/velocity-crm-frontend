import { Component, ElementRef, EventEmitter, OnInit, Output, TemplateRef, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { API_PATH } from '@constants/api-end-points';
import { NgbCalendar, NgbDate, NgbDateParserFormatter, NgbDateStruct, NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { ApiService } from '@services/api.service';
import { CommonService } from '@services/common.service';
import { lastValueFrom, Subscription } from 'rxjs';
import * as Constants from '@constants/constants';
import { AuthService } from '@services/auth.service';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import moment from 'moment';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import Inputmask from 'inputmask';


@Component({
    selector: 'app-lead-documents',
    templateUrl: './lead-documents.component.html',
    styleUrls: ['../../../styles/dashboard.scss', './lead-documents.component.scss']
})
export class LeadDocumentsComponent implements OnInit {
    selectedFiles: Array<File> = [];
    leadId: string = '';
    documentsList: Array<any> = [];
    page: number = 1;
    search: string = '';
    limit: number = 10;
    selectedDate: string = '';
    todayDate!: NgbDateStruct;
    hasMoreDocs: boolean = false;
    modal!: NgbModalRef;
    documentDetails: any = {};
    uploading: boolean = false;
    roles = Constants.Roles;
    userRole: string = '';
    filesForm: FormGroup | any;
    docTypes: any[] = [];
    docIdArray: any[] = [];
    syndicateList: any[] = [];
    selectedSyndicates: string[] = [];
    errMsg: string = '';
    canShareDoc: boolean = false;
    canViewDoc: boolean = false;
    canUploadDoc: boolean = false;
    canRenameDoc: boolean = false;
    canDeleteDoc: boolean = false;
    canDownloadDoc: boolean = false
    tabView: boolean = false;
    dateFormat: string = '';
    timeZone: string = '';
    actualdocTypes: Array<any> = [];
    lead: any = {};
    nowDate!: string;
    @Output() leadDocument = new EventEmitter<any>();
    @ViewChild('ownerDob', { static: false }) ownerDob!: ElementRef;
    style!: { fill: string; };
    background!: { background: string; };
    colorSubs!: Subscription;
    color!: string;
    hoveredDate: NgbDate | null = null;
    fromDate!: NgbDate | null;
    toDate!: NgbDate | null;
    maxDate!: NgbDateStruct;
    @ViewChild('datepicker') datepicker: any;
    constructor(
        private commonService: CommonService,
        private apiService: ApiService,
        private route: ActivatedRoute,
        private calender: NgbCalendar,
        private formatter: NgbDateParserFormatter,
        private authService: AuthService,
        private modalService: NgbModal,
        private fb: FormBuilder,
        private ngxLoader: NgxUiLoaderService,
        private calendar: NgbCalendar,

    ) { }

    ngOnInit(): void {
        this.maxDate = this.calendar.getToday();
        this.todayDate = this.calender.getToday();
        let d = new Date();
        let day: any = d.getDate();
        if (day.toString().length < 2) {
            day = '0' + day;
        }
        this.nowDate = `${((d.getMonth() + "1")).slice(-2)}-${day}-${d.getFullYear()}`
        // this.nowDate = `${d.getMonth() + 1}-${day}-${d.getFullYear()}`
        this.canShareDoc = this.authService.hasPermission('document-share');
        this.canViewDoc = this.authService.hasPermission('lead-document-view');
        this.canUploadDoc = this.authService.hasPermission('lead-document-upload');
        this.canRenameDoc = this.authService.hasPermission('lead-document-rename');
        this.canDeleteDoc = this.authService.hasPermission('lead-document-delete');
        this.canDownloadDoc = this.authService.hasPermission('lead-document-download');
        if (this.canUploadDoc) {
            this.getDocumentTypes();
        }
        
        let params = this.route.snapshot.params;
        if (params && params['id']) {
            this.leadId = params['id'];
            this.getLeadDocuments();
            this.getLeadDetailsList();
        }
        this.getUserDetails();
        this.initForm();
  

    }
    async getLeadDetailsList() {
        try {
            this.commonService.showSpinner();
            const res$ = this.apiService.getReq(API_PATH.LEAD_DETAILS + this.leadId, 'lead', 'view');
            let response = await lastValueFrom(res$);
            if (response && response.data) {
                this.lead = response.data;
            }
            this.commonService.hideSpinner();
        } catch (error: any) {
            this.commonService.hideSpinner();
            this.commonService.showErrorMessage(error);
        }
    }
    initOwnerDob() {
        for (let i = 0; i < this.formFileArray.length; i++) {
            let data = document.getElementById(`${i}`);
            if (data) {
                Inputmask('datetime', {
                    inputFormat: 'mm-dd-yyyy',
                    placeholder: 'mm-dd-yyyy',
                    alias: 'datetime',
                    min: '01-01-1920',
                    max: this.nowDate,
                    clearMaskOnLostFocus: false,
                }).mask(data);
            }

        }     
        // if (this.ownerDob) {
        //     Inputmask('datetime', {
        //         inputFormat: 'mm-dd-yyyy',
        //         placeholder: 'mm-dd-yyyy',
        //         alias: 'datetime',
        //         min: '01-01-1920',
        //         max: this.nowDate,
        //         clearMaskOnLostFocus: false,
        //     }).mask(this.ownerDob.nativeElement);
        // }
    }
    ngAfterViewInit(): void {
        this.initOwnerDob();
    }


    /**
     * @description get user details from localstrorage
     * @author Shine Dezign Infonet Pvt. Ltd.
     * @returns {void}
     */
    getUserDetails(): void {
        try {
            let ud = this.authService.getUserDetails();
            if (ud) {
                this.userRole = ud.role;
                this.dateFormat = ud.date_format;
                this.timeZone = ud.time_zone;
                this.getColorOnUpdate();
                this.style = { fill: ud?.color };
                this.color = ud?.color;
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
    getDate(date: any) {
        return moment(date).tz(this.timeZone).format(`${this.dateFormat} hh:mm:ss A`)

    }

    async getDocumentTypes() {
        try {
            const res$ = this.apiService.getReq(API_PATH.DOCUMENT_TYPES, 'lead', 'document-upload');
            const response = await lastValueFrom(res$);
            if (response && response.status_code == "200") {
                this.docTypes = response.data;
                // this.actualdocTypes = response.data
            }
        } catch (error) {
            this.commonService.showErrorMessage(error);
        }
    }

    /**
     * @description delete document
     * @param docId 
     */
    async deleteDoc(docId: string) {
        try {
            this.commonService.showSpinner();
            const res$ = this.apiService.postReq(API_PATH.DELETE_LEAD_DOC, { document_id: docId }, 'lead', 'document-delete');
            let response = await lastValueFrom(res$);
            if (response && response.status_code == "200") {
                this.commonService.showSuccess(response.message);
                // let data = this.documentsList.filter((e) => e.document_id == docId);
                // if (data[0].document_type != 'other') {
                //     let data2 = this.actualdocTypes.filter((e) => e.value == data[0].document_type);
                //     this.docTypes.push(data2[0])
                // }
                this.documentsList = this.documentsList.filter(e => e.document_id !== docId);


            } else {
                this.commonService.showError(response.message);
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
    async downloadFile(doc: any) {
        try {
            this.commonService.showSpinner();
            const res$ = this.apiService.postReq(API_PATH.DOWNLOAD_FILE, { file: doc.actual_name }, 'lead', 'list', 'arraybuffer');
            const response = await lastValueFrom(res$);
            const arrayBufferView = new Uint8Array(response);
            const file = new Blob([arrayBufferView], { type: doc.document_type });
            let url = window.URL.createObjectURL(file);
            let a = document.createElement('a');
            document.body.appendChild(a);
            a.setAttribute('style', 'display: none');
            a.href = url;
            a.download = doc.actual_name;
            a.click();
            window.URL.revokeObjectURL(url);
            a.remove();
            this.commonService.hideSpinner();
        } catch (error) {
            this.commonService.hideSpinner();
            this.commonService.showErrorMessage(error)
        }
    }

    /**
     * @description open modal
     * @param modal 
     * @author Shine Dezign Infonet Pvt. Ltd.
     */
    openModal(modal: TemplateRef<any>, doc: any) {
        this.documentDetails = {
            name: doc.document_name,
            id: doc.document_id
        }
        let options: any = {
            backdrop: 'static',
        }
        this.modal = this.modalService.open(modal, options)
    }

    /**
     * 
     * @param value 
     */
    onModelClose(value: any) {
        if (value && value.name) {
            const i = this.documentsList.findIndex((e) => e.document_id === this.documentDetails.id);
            if (i > -1) {
                this.documentsList[i].document_name = value.name;
            }
        }
        this.closeModal();
    }

    /**
     * @description close modal
     * @author Shine Dezign Infonet Pvt. Ltd.
     */
    closeModal() {
        this.modal.close();
    }

    /**
     * 
     * @param value 
     */
    onDateSelect(value: NgbDate) {
        this.selectedDate = this.formatter.format(value);
        this.page = 1;
        this.getLeadDocuments();
    }

    /**
     * 
     * @param files 
     */
    onFileChange(files: File[], input: any) {
        this.selectedFiles = [];
        for (let i = 0; i < files.length; i++) {
            if (files[i].size / 1024 / 1024 > 30) {
                this.commonService.showError('Maximum file size allowed is 30MB');
            } else if (!Constants.SETTINGS.ALLOWED_FILES.includes(files[i].type)) {
                this.commonService.showError('Invalid file type. Allowed file type are - gif|jpeg|png|txt|doc|docx|xlsx|xls|pdf|wav|mp3');
            } else {
                // this.selectedFiles.push(files[i]);
                this.addFileToForm(files[i])
            }
        }
        input.value = '';
    }

    initForm() {
        this.filesForm = this.fb.group({
            files: this.fb.array([])
        })
    }

    get formFileArray() {
        return this.filesForm.get('files') as FormArray;
    }

    addFileToForm(file: File) {
        this.formFileArray.push(this.fb.group({
            fileName: [file.name],
            doc_type: ['other'],
            // doc_type: ['other'],
            // doc_name: ['', [ 
            //     Validators.required, 
            //     Validators.pattern(Constants.Custom_Regex.spaces), 
            //     Validators.minLength(3), 
            //     Validators.maxLength(100),
            //     Validators.pattern(Constants.Custom_Regex.username),
            //     Validators.pattern(Constants.Custom_Regex.name)
            // ]],
            doc_name: [''],
            document_date: [null],
            doc_note: [''],
            file: [file]
        }))
    }

    removeFileFromArray(i: number) {
        this.formFileArray.removeAt(i);
    }

    /**
     * @description remove file
     * @param i 
     */
    removeLocalFile(i: number) {
        this.selectedFiles.splice(i, 1);
    }
    getDocType(val: string): string {
        // let v = this.actualdocTypes.find(e => e.value === val);
        let v = this.docTypes.find(e => e.value === val);
        if (v) {
            return v.text;
        }
        return '';
    }

    docsType(value: any, i: any) {
        // if(this.formFileArray.value[i].doc_type == 'other'){
        //     this.docTypes = this.docTypes.filter(e => e.text !== this.formFileArray.value[i].doc_type);
        // }

        if (this.filesForm.get('files')['controls'][i].controls.doc_type.value == '3month_bank_statement') {
            this.initOwnerDob();
            if (this.filesForm.get('files')['controls'][i].controls.document_date.value && !Constants.Custom_Regex.date.test(this.filesForm.get('files')['controls'][i].controls.document_date.value)) {
                this.commonService.showError('Invalid document date.');
                this.commonService.hideSpinner();
                return;
            }
            for (let i = 0; i < this.formFileArray.length; i++) {
                this.filesForm.get('files')['controls'][i].controls.document_date.setValidators(Validators.required);
                this.filesForm.get('files')['controls'][i].controls.document_date.updateValueAndValidity();
                this.filesForm.get('files')['controls'][i].controls.doc_note.setValidators(Validators.pattern(Constants.Custom_Regex.spaces));
                this.filesForm.get('files')['controls'][i].controls.doc_note.updateValueAndValidity();
            }
        } else {
            this.filesForm.get('files')['controls'][i].controls.doc_name.setValidators([
                Validators.required,
                Validators.pattern(Constants.Custom_Regex.spaces),
                Validators.minLength(3),
                Validators.maxLength(100),
                Validators.pattern(Constants.Custom_Regex.username),
                Validators.pattern(Constants.Custom_Regex.name)
            ]);
            this.filesForm.get('files')['controls'][i].controls.doc_name.updateValueAndValidity();
        }
    }
    /**
     * @description get documents list
     */
    async getLeadDocuments() {
        try {
            this.commonService.showSpinner();
            let reqData: any = {
                lead_id: this.leadId,
                page: this.page,
                records_per_page: this.limit
            }
            if (this.search) {
                reqData.name = this.search;
            }
            if (this.selectedDate) {
                // reqData.date = this.selectedDate;
                  reqData.daterange_filter = this.selectedDate;

            }
            const res$ = this.apiService.postReq(API_PATH.LEAD_DOCUMENTS, reqData, 'lead', 'document-list');
            let response = await lastValueFrom(res$);
            if (response && response.status_code == "200") {
                if (this.page === 1) {
                    this.documentsList = response.data.documents;
                    this.documentsList.forEach((object) => { object.toggle = false });
                } else {
                    this.documentsList = [...this.documentsList, ...response.data.documents];
                }
                this.page < response.data.last_page ? this.hasMoreDocs = true : this.hasMoreDocs = false;
                // for (let i = 0; i < this.documentsList.length; i++) {
                //     if (this.documentsList[i].document_type != 'other') {
                //         this.docTypes = this.docTypes.filter(e => e.value != this.documentsList[i].document_type)
                //     }
                // }
            } else {
                this.documentsList = [];
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
     * @description load more documents
     */
    loadMoreRecords() {
        if (this.hasMoreDocs) {
            this.page++;
            this.getLeadDocuments();
        }
    }
    documentDate() {
        this.initOwnerDob();
    }
    async uploadDocuments() {
        try {
            // let arr = [];
            if (this.formFileArray.length) {
                for (let i = 0; i < this.formFileArray.length; i++) {
                    // arr.push(this.filesForm.get('files')['controls'][i].controls.doc_type.value);
                    if (this.filesForm.get('files')['controls'][i].controls.document_date.value && !Constants.Custom_Regex.date.test(this.filesForm.get('files')['controls'][i].controls.document_date.value)) {
                        this.commonService.showError('Invalid document date.');
                        this.uploading = false;
                        this.commonService.hideSpinner();
                        return;
                    }

                    if (this.filesForm.get('files')['controls'][i].controls.doc_type.value == '3month_bank_statement') {
                        this.filesForm.get('files')['controls'][i].controls.document_date.setValidators(Validators.required);
                        this.filesForm.get('files')['controls'][i].controls.document_date.updateValueAndValidity();
                        this.filesForm.get('files')['controls'][i].controls.document_date.markAsTouched();
                        this.filesForm.get('files')['controls'][i].controls.doc_note.setValidators(Validators.pattern(Constants.Custom_Regex.spaces));
                        this.filesForm.get('files')['controls'][i].controls.doc_note.updateValueAndValidity();
                        this.filesForm.get('files')['controls'][i].controls.doc_note.markAsTouched();
                    } else {
                        this.filesForm.get('files')['controls'][i].controls.document_date.clearValidators();
                        this.filesForm.get('files')['controls'][i].controls.document_date.updateValueAndValidity();
                        this.filesForm.get('files')['controls'][i].controls.doc_note.clearValidators();
                        this.filesForm.get('files')['controls'][i].controls.doc_note.updateValueAndValidity();
                    }

                }

                for (let i = 0; i < this.formFileArray.length; i++) {
                    if (this.filesForm.get('files')['controls'][i].controls.doc_type.value != '3month_bank_statement') {
                        this.filesForm.get('files')['controls'][i].controls.doc_name.setValidators([Validators.required, Validators.pattern(Constants.Custom_Regex.spaces),
                        Validators.minLength(3),
                        Validators.maxLength(100),
                        Validators.pattern(Constants.Custom_Regex.username),
                        Validators.pattern(Constants.Custom_Regex.name)
                        ]);
                        this.filesForm.get('files')['controls'][i].controls.doc_name.updateValueAndValidity();
                        this.filesForm.get('files')['controls'][i].controls.doc_name.markAsTouched();
                    } else {
                        this.filesForm.get('files')['controls'][i].controls.doc_name.clearValidators();
                        this.filesForm.get('files')['controls'][i].controls.doc_name.updateValueAndValidity();
                    }

                }

                // for (let i = 0; i < arr.length; i++) {
                //     if (arr[i] != 'other') {
                //         if (arr.indexOf(arr[i]) !== arr.lastIndexOf(arr[i])) {
                //             this.commonService.showError('Duplicate document types are not allowed');
                //             this.uploading = false;
                //             this.commonService.hideSpinner();
                //             return;
                //         }
                //     }

                // }

                this.uploading = true;
                if (this.formFileArray.valid) {
                    const formData: FormData = new FormData();
                    for (let i = 0; i < this.formFileArray.value.length; i++) {
                        formData.append('document[]', this.formFileArray.value[i].file, this.formFileArray.value[i].fileName);
                        if (this.filesForm.get('files')['controls'][i].controls.doc_type.value == '3month_bank_statement') {
                            formData.append('name[]', this.formFileArray.value[i].document_date);
                            formData.append('note[]', this.formFileArray.value[i].doc_note);
                        } else {
                            formData.append('name[]', this.formFileArray.value[i].doc_name);
                        }

                        formData.append('document_type[]', this.formFileArray.value[i].doc_type);
                    }
                    formData.append('lead_id', this.leadId);
                    // this.uploading = true;

                    this.ngxLoader.startLoader('r1');
                    const res$ = this.apiService.postReq(API_PATH.UPLOAD_LEAD_DOC, formData, 'lead', 'document-upload');
                    const response = await lastValueFrom(res$);
                    if (response && response.status_code == "200") {
                        this.commonService.showSuccess(response.message);
                        // for (let i = 0; i < this.formFileArray.value.length; i++) {
                        //     if (this.formFileArray.value[i].doc_type != 'other') {
                        //         this.docTypes = this.docTypes.filter(e => e.value != this.formFileArray.value[i].doc_type);
                        //     }
                        // }
                        this.uploading = false;
                        this.ngxLoader.stopLoader('r1');
                        this.search = '';
                        this.page = 1;
                        this.selectedDate = '';
                        this.formFileArray.clear();
                        this.getLeadDocuments();
                        this.leadDocument.emit();
                    } else {
                        this.uploading = false;
                        this.commonService.showError(response.message);
                        this.ngxLoader.stopLoader('r1');

                    }
                } else {
                    this.formFileArray.markAllAsTouched();
                    this.uploading = false;
                }
            } else {
                this.commonService.showError('No file selected.')
                this.uploading = false;
            }
        } catch (error: any) {
            this.uploading = false;
            this.commonService.hideSpinnerWithId('uploading');
            this.commonService.hideSpinner();
            if (error.error && error.error.message) {
                this.commonService.showError(error.error.message);
            } else {
                this.commonService.showError(error.message);
            }
        }
    }
    /**
     * @description share docs by emial
     */
    shareByEmail() {

    }

    onChange(doc: any, target: EventTarget | null, index: number) {
        const input = target as HTMLInputElement;
        if (input.checked) {
            this.documentsList[index].toggle = true;
            let i = this.docIdArray.findIndex(e => e.document_id === doc.document_id);
            if (i === -1) {
                this.docIdArray.push(doc);
            }
        } else {
            this.documentsList[index].toggle = false;

            let i = this.docIdArray.findIndex(x => x.document_id === doc.document_id);
            if (i > -1) {
                this.docIdArray.splice(i, 1);
            }
        }
    }
    tabClickView(value: any) {
        if (value == true) {
            this.tabView = true
        } else {
            this.tabView = false;
        }
        for (let i = 0; i < this.documentsList.length; i++) {
            this.documentsList[i].toggle = false;
        }


    }

    onShareByEmail(templateRef: TemplateRef<any>) {
        if (this.canShareDoc) {
            if (this.docIdArray.length) {
                if (!this.syndicateList.length) {
                    this.getSyndicatesList();
                }
                this.openShareEmailModal(templateRef)
            } else {
                this.commonService.showError('Please select documents first');
            }
        }
    }

    openShareEmailModal(modal: TemplateRef<any>) {
        let options: any = {
            backdrop: 'static',
            size: 'lg'
        }
        this.modal = this.modalService.open(modal, options)
    }

    async getSyndicatesList() {
        try {
            let url = `?&lead_id=${this.leadId}`;
            this.commonService.showSpinner();
            const res$ = this.apiService.getReq(API_PATH.ALL_SYNDICATE_LIST + url, 'lead', 'list');
            const response = await lastValueFrom(res$);
            if (response && response.status_code == "200") {
                this.syndicateList = response.data;
            }
            this.commonService.hideSpinner()
        } catch (error) {
            this.commonService.hideSpinner();
            this.commonService.showErrorMessage(error);
        }
    }

    async shareDocuments() {
        try {
            this.commonService.showSpinner();
            if (this.docIdArray.length) {
                if (this.selectedSyndicates.length) {
                    this.errMsg = '';
                    let data = {
                        lead_id: this.leadId,
                        syndicate_id: this.selectedSyndicates,
                        lead_document_detail_id: this.docIdArray.map(e => (e.document_id))
                    }
                    const res$ = this.apiService.postReq(API_PATH.SHARE_DOC, data, 'document', 'share');
                    const response = await lastValueFrom(res$);
                    if (response && response.status_code == "200") {
                        this.commonService.showSuccess(response.message);
                        this.closeModal();
                    } else {
                        this.commonService.showError(response.message)
                    }
                    this.commonService.hideSpinner();
                } else {
                    this.errMsg = 'Please selected atleast one syndicate.';
                    this.commonService.hideSpinner();
                }
            } else {
                this.commonService.hideSpinner();
            }
        } catch (error) {
            this.commonService.hideSpinner();
            this.commonService.showErrorMessage(error);
        }
    }
    // custom datepicker color
    ngDoCheck(): void {
        this.getDateColor();
    }

    getDateColor() {
        let monthNameClr = document.getElementsByClassName('ngb-dp-month-name');
        // let data3 = document.getElementsByClassName('btn btn-link ngb-dp-arrow-btn');
        let arrowColor = document.getElementsByClassName('ngb-dp-navigation-chevron');
        for (let i = 0; i < monthNameClr.length; i++) {
            monthNameClr[i].setAttribute('style', `color:${this.color}`)
            arrowColor[i].setAttribute('style', `border-color:${this.color}`)
        }
        let weekNameClr = document.getElementsByClassName('ngb-dp-weekday small');
        for (let i = 0; i < weekNameClr.length; i++) {
            weekNameClr[i].setAttribute('style', `color:${this.color}`)
        }



        const tds = document.getElementsByClassName('custom-day') as HTMLCollectionOf<HTMLElement>;
        for (let index = 0; index < tds.length; index++) {
            tds[index].style.setProperty('--custom', `${this.color}`);

        }
    }
    getDocumentListUpdate() {
        this.getLeadDocuments();
    }
    isHovered(date: NgbDate) {
        return this.fromDate && !this.toDate && this.hoveredDate && date.after(this.fromDate) && date.before(this.hoveredDate);
    }

    isInside(date: NgbDate) {
        return this.toDate && date.after(this.fromDate) && date.before(this.toDate);
    }

    isRange(date: NgbDate) {
        return date.equals(this.fromDate) || (this.toDate && date.equals(this.toDate)) || this.isInside(date) || this.isHovered(date);
    }

    validateInput(currentValue: NgbDate | null, input: string): NgbDate | null {
        const parsed = this.formatter.parse(input);
        return parsed && this.calendar.isValid(NgbDate.from(parsed)) ? NgbDate.from(parsed) : currentValue;
    }

    onDateSelection(date: NgbDate) {
        if (!this.fromDate && !this.toDate) {
            this.fromDate = date;
        } else if (this.fromDate && !this.toDate && date && (date.equals(this.fromDate) || date.after(this.fromDate))) {
            this.toDate = date;
            this.datepicker.toggle();
        } else {
            this.toDate = null;
            this.fromDate = date;
        }
        let sDate = '';
        if (this.fromDate) {
            sDate = this.formatter.format(this.fromDate);
            if (this.toDate) {
                sDate = sDate + ' / ' + this.formatter.format(this.toDate);
                this.selectedDate = sDate;
                this.page = 1;
                this.getLeadDocuments();
            }
        }
    }

}
