import { Component, ElementRef, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { API_PATH } from '@constants/api-end-points';
import { Custom_Regex, SETTINGS } from '@constants/constants';
import {AngularEditorConfig } from '@kolkov/angular-editor';
import { NgbCalendar, NgbDate, NgbDateParserFormatter, NgbDateStruct, NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { ApiService } from '@services/api.service';
import { AuthService } from '@services/auth.service';
import { CommonService } from '@services/common.service';
import moment from 'moment';
import { EMPTY, lastValueFrom, map, Subscription } from 'rxjs';
import * as Model from './view-edit-system-notification-model';
import { DndDropEvent } from 'ngx-drag-drop';

@Component({
    selector: 'app-view-edit-system-notifications',
    templateUrl: './view-edit-system-notifications.component.html',
    styleUrls: ['./view-edit-system-notifications.component.scss']
})
export class ViewEditSystemNotificationsComponent implements OnInit {

    popUps: any = {
        actionsPopup: false,
        statusPopup: false,
        timeDelay: false,
        sendMail: false,
        setPropertyValue: false
    }
    activeTab: string = 'Actions';
    addOnAIndex: number | null = null;
    emailTemplateList: any[] = [];
    templatesSearchModel: string = '';
    editorConfig: AngularEditorConfig = {
        height: '200px',
        editable: true,
        sanitize: false,
        uploadUrl: 'company/image-upload',
        upload: (file) => {
            const formData = new FormData();
            formData.append("image", file);
            if (SETTINGS.ALLOWED_FILES.includes(file.type)) {

                this.commonService.showSpinner();
                return this.apiService.postReq(API_PATH.UPLOAD_EMAIL_TEMPLATE_IMAGE, formData, 'documents', 'upload').pipe(
                    map((x: any) => {
                        x.body = { imageUrl: x.data.imageUrl };
                        this.commonService.hideSpinner();
                        return x;
                    })
                )

            }

            else {
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
    sendMailForm!: FormGroup;
    leadStatusForm!: FormGroup;

    campaignSteps: Array<any> = [];
    campaignData: Array<any> = [];
    steps = Model.STEP;
    leadStatusList: any[] = [];
    leadSearchModel: string = '';
    triggerStatus: any = {};
    dripCampaignName: string = '';
    dripCampaignId: string = '';
    dripCampaignNameForm!: FormGroup;
    modal!: NgbModalRef;
    dateFormat: string = '';
    timeZone: string = '';
    leadStatusId: string = '';
    settingsData: any = {};
    personilizedVariables: any = [];
    // editorRef!: AngularEditorComponent;
    editorRef!:any;
    @ViewChild('personizedVars') personizedVars!: ElementRef;
    dripCampaignDeleteStatus: boolean = false;
    hourStep = 0;
    minuteStep = 0;
    selectedDate: string = '';
    hoveredDate: NgbDate | null = null;
    fromDate!: NgbDate | null;
    toDate!: NgbDate | null;
    maxDate!: NgbDateStruct;
    @ViewChild('datepicker') datepicker: any;
    enrollmentpage: number = 1;
    logspage: number = 1;
    totalLogs: number = 0;
    logslimit: number = 10;
    hasMoreLogs: boolean = false;
    enrollmentList: Array<any> = [];
    totalEnrollment: number = 0;
    enrollmentSearch: string = '';
    enrollmentlimit: number = 10;
    stats: any = {};
    editMode: boolean = false;
    replaceIndex!: number;
    dragIndex!: number;
    dragedItem: any[''];
    dripCampaignStatus: string = '';
    activeStaticList: boolean = false;
    color!: string;
    style!: { fill: string; };
    background!: { background: string; };
    colorSubs!: Subscription;
    templateSelectColor: boolean = false;
    templateSelectColor2: boolean = false;
    constructor(
        private fb: FormBuilder,
        private commonService: CommonService,
        private apiService: ApiService,
        private router: Router,
        private authService: AuthService,
        private route: ActivatedRoute,
        private modalService: NgbModal,
        public formatter: NgbDateParserFormatter,
        private calendar: NgbCalendar,
    ) { }
    EffectAllowed: any = 'all';
    draggable = {
        // note that data is handled with JSON.stringify/JSON.parse
        // only set simple data or POJO's as methods will be lost 
        data: {},
        //   this.campaignData
        effectAllowed: this.EffectAllowed,
        disable: false,
        handle: false
    };
    usersListLimit: number = 1000;
    userListPage: number = 1;
    hasMoreUsers: boolean = false;
    listingList: Array<any> = [];
    totalUsersCount: number = 0;
    fromOptions: Array<any> = [];
    rolesList: Array<any> = [];
    systemStatusList: Array<any> = [];
    loading = false;
    editEmailPopup: boolean = false;
    editEmailPopupIndex!: number

    ngOnInit(): void {
        this.getLeadOptions();
        this.getRolesOptions();
        this.initSendMail();
        this.initLeadStatus();
        this.getEmailTemplateList();
        this.getUserDetails();
        this.getAllLists();
        let params = this.route.snapshot.params;
        let query = this.route.snapshot.queryParams;
        if (params['id']) {
            this.dripCampaignId = params['id'];
            this.getDripCampaignDetails();
        }
        if (query['mode'] && query['mode'] === 'edit') {
            this.editMode = true;
        }
    }
    ngDoCheck(): void {

        this.getPaginationList();
    }

    onDragStart(event: DragEvent, i: any, item: any[],) {
        //  if(i != 0){
        //      console.log("dj");

        //     this.draggable.disable = false;
        //     this.draggable.effectAllowed = 'move'
        // }else{
        //     console.log("else");

        //     this.draggable.effectAllowed = 'none'
        //         this.draggable.disable = true;
        // }
        this.dragIndex = i
        this.dragedItem = item
        // this.draggable.data = this.campaignSteps[i];
        // console.log("drag", this.draggable.data);

        // console.log("drag started", JSON.stringify(event, null, 2));
    }
    onDragCanceled(event: DragEvent) {
    }

    onDragEnd(event: DragEvent, list: any[]) {
        if (this.dragIndex < this.replaceIndex && this.dragIndex != 0) {
            this.replaceIndex = this.replaceIndex - 1;
            if (this.replaceIndex != 0) {
                let item1 = list.splice(this.dragIndex, 1)
                let item2 = list.splice(this.replaceIndex, 1)
                list.splice(this.replaceIndex, 0, item1[0]);
                list.splice(this.dragIndex, 0, item2[0]);
            }
        } else if (this.dragIndex > this.replaceIndex) {
            if (this.replaceIndex != 0) {
                let item1 = list.splice(this.dragIndex, 1)
                let item2 = list.splice(this.replaceIndex, 1)
                list.splice(this.replaceIndex, 0, item1[0]);
                list.splice(this.dragIndex, 0, item2[0]);
            }
        } else if (this.dragIndex == this.replaceIndex) {
        } else if (this.dragIndex == 0 || this.replaceIndex == 0) {
        }
        // console.log("n sb", this.dragIndex);
        // console.log("replaceIndexb", this.replaceIndex);

        this.campaignData = list;


        // list.splice()

        // console.log("drag ended", JSON.stringify(event, null, 2)); 
    }

    //   onDraggableCopied(event:DragEvent) {

    //     console.log("draggable copied", JSON.stringify(event, null, 2));
    //   }

    //   onDraggableLinked(event:DragEvent) {

    //     console.log("draggable linked", JSON.stringify(event, null, 2));
    //   }

    onDraggableMoved(event: DragEvent, item: any, list: any[], effect: any, i: number) {
        //   console.log('list',)
        // if( effect === "move" ) {

        //     const index = list.indexOf( item );
        // list.splice( index, 1 );
        //   }
        // console.log("draggable moved", JSON.stringify(event, null, 2));
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
    async changeStatus(status: any) {
        try {
            let data = { name: this.dripCampaignName, id: this.dripCampaignId, status: status }
            const res$ = this.apiService.postReq(API_PATH.DRIP_CAMPAIGN_UPDATE_STATUS, data, 'campaign', 'update');
            const response = await lastValueFrom(res$);
            if (response && response.status_code == '200') {
                this.dripCampaignStatus = 'Active'
                this.commonService.showSuccess(response.message);
            } else {
                this.commonService.showError(response.message)
            }
            this.commonService.hideSpinner();
        } catch (error) {
            this.commonService.hideSpinner();
            this.commonService.showErrorMessage(error);
        }

    }

    leadType(value: any) {
        if (this.leadStatusForm.value.status_type === 'all') {
			this.leadStatusForm.get('lead_status')?.clearValidators();
            this.sendMailForm.get('lead_status')?.updateValueAndValidity();
			this.leadStatusForm.patchValue({
				lead_status: null
			})
            
        } 

    }

    onDragover(event: DragEvent, i: any) {
        this.replaceIndex = i;
        // console.log("dragover", JSON.stringify(event, null, 2));
    }

    onDrop(event: DndDropEvent, list: any[]) {
        // if( list
        //     && (event.dropEffect === "copy"
        //       || event.dropEffect === "move") ) {

        //     let index = event.index;

        //     if( typeof index === "undefined" ) {

        //       index = list.length;
        //     }

        //     list.splice( index, 0, event.data );
        //   }


        // console.log("dropped", JSON.stringify(event, null, 2));
    }
    removeItem(item: any, list: any[]): void {
        list.splice(list.indexOf(item), 1);
    }

    initSendMail() {
        this.sendMailForm = this.fb.group({
            template: [null,],
            subject: ['', [Validators.maxLength(500)]],
            cc: [''],
            body: ['',],
            from_option: [''],
            to_option: [''],
            cc_template: [''],
            from_option_scratch: [''],
            to_option_scratch: [''],
            template_type: ['predefined', [Validators.required]]
        })
        if (this.sendMailForm.value.template_type == 'predefined') {
            this.templateSelectColor = true;
            this.templateSelectColor2 = false;

        } else {
            this.templateSelectColor = false;
        }
    }
    async getLeadOptions() {
        try {
            this.commonService.showSpinner();
            const res$ = this.apiService.getReq(API_PATH.LEAD_OPTIONS_LIST, '', '');
            let response = await lastValueFrom(res$);
            if (response && response.data) {
                this.leadStatusList = response.data.status;
                this.fromOptions = response.data.from_options;
                this.systemStatusList = response.data.system_status;
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
    }
    cancel() {
        this.editMode = !this.editMode;

    }

    closeAllModels() {
        this.sendMailForm.patchValue({
            template_type: 'predefined',
            body: '',
            subject: '',
            cc: '',
            from_option: '',
            to_option: '',
            cc_template: '',
            from_option_scratch: '',
            to_option_scratch: '',
            template: null
        });
        if (this.sendMailForm.value.template_type == 'predefined') {
            this.templateSelectColor = true;
            this.templateSelectColor2 = false;

        } else {
            this.templateSelectColor = false;
        } if (this.sendMailForm.value.template_type == 'from_scratch') {
            this.templateSelectColor2 = true;
            this.templateSelectColor = false;

        }
        else {
            this.templateSelectColor2 = false;
        }
        if (this.sendMailForm.value.template_type === 'predefined') {
            this.sendMailForm.get('template')?.clearValidators()
            this.sendMailForm.get('template')?.updateValueAndValidity();
            this.sendMailForm.get('cc_template')?.clearValidators()
            this.sendMailForm.get('cc_template')?.updateValueAndValidity();
        } else {
            this.sendMailForm.get('body')?.clearValidators();
            this.sendMailForm.get('body')?.updateValueAndValidity();
            this.sendMailForm.get('subject')?.clearValidators()
            this.sendMailForm.get('subject')?.updateValueAndValidity();
            this.sendMailForm.get('cc')?.clearValidators()
            this.sendMailForm.get('cc')?.updateValueAndValidity();

        }
        for (const key in this.popUps) {
            this.popUps[key] = false;
        }
    }

    resetCompanyList() {
        this.enrollmentSearch = '';
        this.selectedDate = '';
        this.fromDate = null;
        this.toDate = null;
    }


    openActionsModel() {
        try {
            this.closeAllModels();
            if (!this.campaignSteps.length) {
                this.popUps.statusPopup = true;
            } else {
                this.popUps.actionsPopup = true;
            }
        } catch (error) {
            console.log(error);
        }
    }

    setUpTrigger() {
        try {

        } catch (error) {

        }
    }
    async getDripCampaignDetails(): Promise<void> {
        try {
            this.commonService.showSpinner();
            let url = `?id=${this.dripCampaignId}`;
            const res$ = this.apiService.getReq(API_PATH.SYSTEM_NOTIFICATION_VIEW + url, 'system', 'notification-view');
            let response = await lastValueFrom(res$);
            if (response && response.data) {
                this.dripCampaignDeleteStatus = response.data.isDeleted;
                // if (this.dripCampaignDeleteStatus) {
                //     this.gSettingForm.controls['day'].disable();
                //     this.gSettingForm.controls['customDays'].disable();
                // } else {
                //     this.gSettingForm.controls['day'].enable();
                //     this.gSettingForm.controls['customDays'].enable();
                // }
                this.campaignSteps = response.data.notification_setup;
                this.leadStatusForm.patchValue({
                    lead_status: this.campaignSteps[0].data.status_id,
                    system_status: this.campaignSteps[0].data.system_id,
                    status_type: this.campaignSteps[0].data.status_type ? this.campaignSteps[0].data.status_type : 'specific',
                })
                this.dripCampaignName = response.data.name;
                // this.dripCampaignStatus = response.data.data.status;
                // this.settingsData = response.data.data.settings;
                // this.patchSettingsData();


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
    templateType(value: any) {
        if (value == 'predefined') {
            this.templateSelectColor = true;
            this.templateSelectColor2 = false;

        } else {
            this.templateSelectColor = false;
        }
        if (value == 'from_scratch') {
            this.templateSelectColor2 = true;
            this.templateSelectColor = false;

        }
        else {
            this.templateSelectColor2 = false;
        }
        //from_scratch data
        //predefined data
        if (this.sendMailForm.value.template_type === 'predefined') {
            this.sendMailForm.get('body')?.clearValidators();
            this.sendMailForm.get('body')?.updateValueAndValidity();
            this.sendMailForm.get('subject')?.clearValidators()
            this.sendMailForm.get('subject')?.updateValueAndValidity();
            this.sendMailForm.get('cc')?.clearValidators()
            this.sendMailForm.get('cc')?.updateValueAndValidity();
            this.sendMailForm.get('template')?.clearValidators()
            this.sendMailForm.get('template')?.updateValueAndValidity();
            this.sendMailForm.get('cc_template')?.clearValidators()
            this.sendMailForm.get('cc_template')?.updateValueAndValidity();
        } else {
            this.sendMailForm.get('template')?.clearValidators()
            this.sendMailForm.get('template')?.updateValueAndValidity();
            this.sendMailForm.get('body')?.clearValidators();
            this.sendMailForm.get('body')?.updateValueAndValidity();
            this.sendMailForm.get('subject')?.clearValidators()
            this.sendMailForm.get('subject')?.updateValueAndValidity();
            this.sendMailForm.get('cc')?.clearValidators()
            this.sendMailForm.get('cc')?.updateValueAndValidity();
            this.sendMailForm.get('cc_template')?.clearValidators()
            this.sendMailForm.get('cc_template')?.updateValueAndValidity();

        }

    }
    ontemplateSave() {
        try {
            this.sendMailForm.markAllAsTouched();
            if (this.sendMailForm.value.template_type === 'predefined') {
                this.sendMailForm.get('template')?.setValidators([Validators.required])
                this.sendMailForm.get('template')?.updateValueAndValidity();
                this.sendMailForm.get('cc_template')?.setValidators([Validators.pattern(Custom_Regex.email),])
                this.sendMailForm.get('cc_template')?.updateValueAndValidity();
            } else {
                this.sendMailForm.get('body')?.setValidators([Validators.required]);
                this.sendMailForm.get('body')?.updateValueAndValidity();
                this.sendMailForm.get('subject')?.setValidators([Validators.required])
                this.sendMailForm.get('subject')?.updateValueAndValidity();
                this.sendMailForm.get('cc')?.setValidators([Validators.pattern(Custom_Regex.email),])
                this.sendMailForm.get('cc')?.updateValueAndValidity();
            }
            if (this.sendMailForm.valid) {
                let lastVal = this.campaignSteps[this.campaignSteps.length - 1];
                if (lastVal?.data?.templateId === this.sendMailForm.value.template && lastVal?.data?.templateId != null && this.sendMailForm.value.template != null && !this.editEmailPopup) {
                    this.commonService.showError('Either select a different template or add delay between them')
                } else {
                    let data = {
                        template_type: this.sendMailForm.value.template_type,
                        templateId: this.sendMailForm.value.template,
                        templateText: this.sendMailForm.value.template,
                        body: this.sendMailForm.value.body,
                        subject: this.sendMailForm.value.subject,
                        cc: this.sendMailForm.value.cc,
                        cc_template: this.sendMailForm.value.cc_template,
                        from_option: this.sendMailForm.value.from_option,
                        to_option: this.sendMailForm.value.to_option,
                        from_option_scratch: this.sendMailForm.value.from_option_scratch,
                        to_option_scratch: this.sendMailForm.value.to_option_scratch,
                        header_text: 'Send email notification'
                    }
                    if (this.sendMailForm.value.template_type === 'predefined') {
                        let temp = this.emailTemplateList.find((e) => e.id === this.sendMailForm.value.template);
                        if (temp) {
                            data.templateText = temp.name;
                        }
                        if (this.editEmailPopup) {
                            console.log("ifffe", this.editEmailPopupIndex);
                            let campData: Model.STEPDATA = {
                                type: this.steps.SEND_EMAIL,
                                header_text: 'Send email notification',
                                data: {
                                    template_type: this.sendMailForm.value.template_type,
                                    templateId: this.sendMailForm.value.template,
                                    templateText: this.sendMailForm.value.template,
                                    body: this.sendMailForm.value.body,
                                    subject: this.sendMailForm.value.subject,
                                    cc: this.sendMailForm.value.cc,
                                    cc_template: this.sendMailForm.value.cc_template,
                                    from_option: this.sendMailForm.value.from_option,
                                    to_option: this.sendMailForm.value.to_option,
                                    from_option_scratch: this.sendMailForm.value.from_option_scratch,
                                    to_option_scratch: this.sendMailForm.value.to_option_scratch,
                                },

                            }
                            let temp = this.emailTemplateList.find((e) => e.id === this.sendMailForm.value.template);
                            if (temp) {
                                campData.data.templateText = temp.name;
                            }
                            this.campaignSteps[this.editEmailPopupIndex] = campData;
                            this.closeAllModels();
                        } else {
                            let temp = this.emailTemplateList.find((e) => e.id === this.sendMailForm.value.template);
                            if (temp) {
                                data.templateText = temp.name;
                            }
                            console.log("else");


                            this.addItemToCampaign(this.steps.SEND_EMAIL, data);
                            this.closeAllModels();
                        }

                    } else if (this.sendMailForm.value.subject && this.sendMailForm.value.body) {
                        data.templateText = this.sendMailForm.value.subject
                        if (this.editEmailPopup) {
                            console.log("ifffe", this.editEmailPopupIndex);
                            let campData: Model.STEPDATA = {
                                type: this.steps.SEND_EMAIL,
                                header_text: 'Send email notification',
                                data: {
                                    template_type: this.sendMailForm.value.template_type,
                                    templateId: this.sendMailForm.value.template,
                                    templateText: this.sendMailForm.value.subject,
                                    body: this.sendMailForm.value.body,
                                    subject: this.sendMailForm.value.subject,
                                    cc: this.sendMailForm.value.cc,
                                    cc_template: this.sendMailForm.value.cc_template,
                                    from_option: this.sendMailForm.value.from_option,
                                    to_option: this.sendMailForm.value.to_option,
                                    from_option_scratch: this.sendMailForm.value.from_option_scratch,
                                    to_option_scratch: this.sendMailForm.value.to_option_scratch,
                                },
                            }
                            this.campaignSteps[this.editEmailPopupIndex] = campData;
                            this.closeAllModels();
                        } else {
                            this.addItemToCampaign(this.steps.SEND_EMAIL, data);
                            this.closeAllModels();
                        }

                    } else {
                        this.commonService.showError('Please select a template or provide subject and body')
                    }
                    // if (this.sendMailForm.value.template_type === 'predefined') {
                    // 	let temp = this.emailTemplateList.find((e) => e.id === this.sendMailForm.value.template);
                    // 	if (temp) {
                    // 		data.templateText = temp.name;
                    // 	}
                    // 	this.addItemToCampaign(this.steps.SEND_EMAIL, data);
                    // 	this.closeAllModels();
                    // } else if (this.sendMailForm.value.subject && this.sendMailForm.value.body) {
                    // 	data.templateText = this.sendMailForm.value.subject
                    // 	this.addItemToCampaign(this.steps.SEND_EMAIL, data);
                    // 	this.closeAllModels();
                    // } else {
                    // 	this.commonService.showError('Please select a template or provide subject and body')
                    // }
                }
            }
        } catch (error) {
            console.log(error);
        }
    }
    addItemToCampaign(type: string, data: any) {
        try {
            let campData: Model.STEPDATA = {
                type: type,
                header_text: data.header_text,
                data: {},
            }
            switch (type) {
                case Model.STEP.SEND_EMAIL:
                    campData.data.template_type = data.template_type;
                    campData.data.templateId = data.templateId;
                    campData.data.templateText = data.templateText;
                    campData.data.body = data.body;
                    campData.data.subject = data.subject;
                    campData.data.cc = data.cc;
                    campData.data.from_option = data.from_option;
                    campData.data.to_option = data.to_option;
                    campData.data.cc_template = data.cc_template
                    campData.data.from_option_scratch = data.from_option_scratch
                    campData.data.to_option_scratch = data.to_option_scratch
                    break;
                case Model.STEP.TRIGGER:
                    campData.data.status_id = data.status_id;
                    campData.data.status_name = data.status_name;
                    campData.data.select_list = data.select_list;
                    campData.data.status_type = data.status_type;
                    this.campaignSteps = [];
                    break;
                default:
                    break;
            }
            if (this.addOnAIndex != null) {
                this.campaignSteps.splice(this.addOnAIndex + 1, 0, campData);
            } else {
                this.campaignSteps.push(campData);
            }
        } catch (error) {
            console.log(error);
        }
    }

    // addTrigger() {
    //     if(this.campaignSteps.length) {   
    //         let data = {
    //             status_id: this.triggerStatus.id,
    //             status_name: this.triggerStatus.name,
    //             header_text: `Campaign trigger`
    //         }
    //         let campData: Model.STEPDATA = {
    //             type: this.steps.TRIGGER,
    //             header_text: `Campaign trigger`,
    //             data: {
    //                 status_id: this.triggerStatus.id,
    //                 status_name: this.triggerStatus.name,
    //             },
    //         }
    //         this.campaignSteps[0] = campData;
    //         this.popUps.statusPopup = false;

    //     } else {
    //         if(this.triggerStatus && this.triggerStatus.id) {
    //             try {

    //                 let data = {
    //                     status_id: this.triggerStatus.id,
    //                     status_name: this.triggerStatus.name,
    //                     header_text: `Campaign trigger`
    //                 }
    //                 this.addItemToCampaign(this.steps.TRIGGER, data);
    //                 this.popUps.statusPopup = false;
    //             } catch (error) {
    //                 console.log(error);
    //             }
    //         } else {
    //             this.commonService.showError("Please select a status first");
    //         }
    //     }


    // }
    addTrigger() {
        if(this.leadStatusForm.value.status_type == 'specific'){
			this.leadStatusForm.get('lead_status')?.setValidators([Validators.required]);
			this.leadStatusForm.get('lead_status')?.updateValueAndValidity();
		} else{
			this.leadStatusForm.get('lead_status')?.clearValidators();
			this.leadStatusForm.get('lead_status')?.updateValueAndValidity();
		}
        this.leadStatusForm.get('system_status')?.setValidators([Validators.required]);
        this.leadStatusForm.get('system_status')?.updateValueAndValidity();
        this.leadStatusForm.markAllAsTouched();
        let temp = this.leadStatusList.find((e) => e.id === this.leadStatusForm.value.lead_status);
        let temp2 = this.systemStatusList.find((e) => e.id === this.leadStatusForm.value.system_status);
        let data = {
            status_id: '',
            status_name: '',
            system_id: '',
            system_name: '',
            status_type: '',
            header_text: `System trigger`
        }
        if (temp ||  temp2) {
              data.status_id = this.leadStatusForm.value.status_type == 'specific' ? temp.id : null,
                data.status_name = this.leadStatusForm.value.status_type == 'specific' ? temp.name : 'all',
                data.system_id = temp2.id,
                data.system_name = temp2.name,
                data.status_type = this.leadStatusForm.value.status_type,
                data.header_text = `System trigger`
        }


        let campData: Model.STEPDATA = {
            type: this.steps.TRIGGER,
            header_text: `System trigger`,
            data: {
                status_id: this.leadStatusForm.value.status_type == 'specific' ? data.status_id : null,
                status_name: this.leadStatusForm.value.status_type == 'specific' ? data.status_name : 'all',
                system_id: data.system_id,
                system_name: data.system_name,
                status_type: this.leadStatusForm.value.status_type,
            },

        }
        this.campaignSteps[0] = campData;
        this.popUps.statusPopup = false;

    }

    onLeadStatusChange(status: any) {
        this.triggerStatus = status;
    }

    removeStep(index: number) {
        try {
            this.campaignSteps.splice(index, 1);
        } catch (error) {

        }
    }

    async getEmailTemplateList(): Promise<any> {
        try {
            let url = `?page_limit=1000&page=1`;
            this.commonService.showSpinner();
            const res$ = this.apiService.getReq(
                API_PATH.SYSTEM_EMAIL_TEMPLATE_LIST + url,
                '',
                ''
            );
            let response = await lastValueFrom(res$);
            if (response && response.data.data) {
                this.emailTemplateList = response.data.data;
            } else {
                this.emailTemplateList = [];
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

    onSubjectChange() {
        try {
            if (this.sendMailForm.value.subject) {
                this.sendMailForm.patchValue({
                    template: null
                })
            }
        } catch (error) {

        }
    }

    get f() {
        return this.sendMailForm.controls;
    }
    async onEndClick() {

        if (this.campaignSteps.length < 2) {
            this.commonService.showError('Please complete required steps before proceeding');
            return;
        }
        this.activeTab = 'Settings'

    }

    async onSettingsSave() {
        try {
            if (this.campaignSteps.length < 2) {
                this.commonService.showError('Please complete required steps before proceeding');
                // this.activeTab = 'Actions'
                return;
            }
            this.commonService.showSpinner();
            let data = {
                id: this.dripCampaignId,
                name: this.dripCampaignName,
                notification_setup: this.campaignSteps,
                // settings: this.gSettingForm.value
            }
            const res$ = this.apiService.postReq(API_PATH.SYSTEM_NOTIFICATION_UPDATE, data, 'system', 'notification-update');
            let response = await lastValueFrom(res$);
            if (response) {
                this.commonService.showSuccess(response.message);
                this.router.navigate([`/${this.userBaseRoute}/system-notification-list`]);
            }
            this.commonService.hideSpinner();
            // if (this.gSettingForm.valid) {
            // 	if (this.gSettingForm.value.type === 'anytime') {
            // 		let data = {
            // 			name: this.dripCampaignName,
            // 			notification_setup: this.campaignSteps,
            // 			settings: this.gSettingForm.value
            // 		}
            // 		this.commonService.showSpinner();
            // 		const res$ = this.apiService.postReq(API_PATH.SYSTEM_NOTIFICATIONS_ADD, data, 'system', 'notification-add');
            // 		let response = await lastValueFrom(res$);
            // 		if (response) {
            // 			this.commonService.showSuccess(response.message);
            // 			this.router.navigate([`/${this.userBaseRoute}/system-notification-list`]);
            // 		}
            // 		this.commonService.hideSpinner();

            // 	} else if (this.gSettingForm.value.type != 'anytime') {
            // 		let settingData = this.gSettingForm.value;
            // 		if (settingData.to.hour > settingData.from.hour) {
            // 			let data = {
            // 				name: this.dripCampaignName,
            // 				compaignStep: this.campaignSteps,
            // 				settings: this.gSettingForm.value
            // 			}
            // 			this.commonService.showSpinner();
            // 			const res$ = this.apiService.postReq(API_PATH.SYSTEM_NOTIFICATIONS_ADD, data, 'system', 'notification-add');
            // 			let response = await lastValueFrom(res$);
            // 			if (response) {
            // 				this.commonService.showSuccess(response.message);
            // 				this.router.navigate([`/${this.userBaseRoute}/system-notification-list`]);
            // 			}
            // 			this.commonService.hideSpinner();
            // 		} else if (settingData.to.hour == settingData.from.hour && settingData.to.minute > settingData.from.minute) {
            // 			let data = {
            // 				name: this.dripCampaignName,
            // 				compaignStep: this.campaignSteps,
            // 				settings: this.gSettingForm.value
            // 			}
            // 			this.commonService.showSpinner();
            // 			const res$ = this.apiService.postReq(API_PATH.ADD_DRIP_CAMPAIGN, data, 'campaign', 'add');
            // 			let response = await lastValueFrom(res$);
            // 			if (response) {
            // 				this.commonService.showSuccess(response.message);
            // 				this.router.navigate([`/${this.userBaseRoute}/system-notification-list`]);
            // 			}
            // 			this.commonService.hideSpinner();
            // 		} else {
            // 			this.commonService.showError('Please provide valid data for general settings');
            // 		}
            // 	}
            // }
        } catch (error: any) {
            this.commonService.hideSpinner();
            if (error.error && error.error.message) {
                this.commonService.showError(error.error.message);
            } else {
                this.commonService.showError(error.message);
            }
        }
    }
    get userBaseRoute() {
        return this.authService.getUserRole().toLowerCase();
    }
    initDripCampaignForm() {
        this.dripCampaignNameForm = this.fb.group({
            name: ['', [
                Validators.required,
                Validators.pattern(Custom_Regex.spaces),
                Validators.pattern(Custom_Regex.username),
                Validators.pattern(Custom_Regex.name),
                Validators.minLength(3),
                Validators.maxLength(100)
            ]],
        })
    }
    get n(): { [key: string]: AbstractControl } {
        return this.dripCampaignNameForm.controls;
    }
    openModal(templateRef: TemplateRef<any>) {
        try {
            this.modal = this.modalService.open(templateRef, { backdrop: 'static', size: 'md' });
            this.initDripCampaignForm();
            this.dripCampaignNameForm.patchValue({
                name: this.dripCampaignName,
            })
        } catch (error: any) {
            this.commonService.showError(error.message);
        }
    }
    closeModal() {
        this.modal.close();
    }
    submitDripCampaignName() {
        this.dripCampaignNameForm.markAllAsTouched();
        if (this.dripCampaignNameForm.valid) {
            this.dripCampaignName = this.dripCampaignNameForm.value.name;
            this.closeModal();
        }
    }
    getUserDetails(): void {
        try {
            let ud = this.authService.getUserDetails();
            if (ud) {
                this.dateFormat = ud.date_format;
                this.timeZone = ud.time_zone;
                this.color = ud?.color;
                this.getColorOnUpdate();
                this.style = { fill: ud?.color };
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
    async openPeronisedForm(e: any) {
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

    // onTokenSelect(e: any) {
    //     if (this.editorRef) {
    //         // let actualName = e.target.value.replace(/[{} $]/g, "");
    //         // actualName = actualName.replace(/[ _ ]/g, " ")
    //         // ${this.transform(actualName)}: 
    //         this.editorRef.executeCommand('insertText', `${e.target.value}`);
    //     }
    //     this.closeModal()
    // }
    onTokenSelect(e: any) {
        // console.log("jii", e.target.value);
        if (this.editorRef) {
            let actualName = e.replace(/[{} $]/g, "");
            actualName = actualName.replace(/[ _ ]/g, " ")
            this.editorRef.focus();
            this.editorRef.editorService.restoreSelection();
            this.editorRef.executeCommand('insertText', `${this.transform(actualName)}: ${e}`);
        }
        this.closeModal()
    }
    transform(value: string): string {
        let first = value.substr(0, 1).toUpperCase();
        return first + value.substr(1);
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
            }
        }
    }
    leadDetailsLink(id: any) {
        const url = this.router.serializeUrl(this.router.createUrlTree([`/${this.userBaseRoute}/lead-detail/${id}`]));
        window.open(url, '_blank')
    }
    initLeadStatus() {
        this.leadStatusForm = this.fb.group({
            // status_type: ['from_status', [Validators.required]],
            status_type: ['specific', [Validators.required]],
            lead_status: [null],
            system_status: [null],
            // list: [null],
        })
    }

    get control() {
        return this.leadStatusForm.controls;
    }
    async getAllLists(): Promise<any> {
        try {

            // let url = `?&page_limit=${this.usersListLimit}&page=${this.userListPage}`;
            let url = `?sort_by=${'updated_at'}&dir=${'DESC'}&page_limit=${this.usersListLimit}&page=${this.userListPage}`;
            // if (this.searchKeyword) {
            //     url = url + `&search_keyword=${this.predictiveSearchId}`
            // }
            this.commonService.showSpinner();
            const res$ = this.apiService.getReq(API_PATH.LIST_CAMPAIGN + url, 'campaign', 'list');
            let response = await lastValueFrom(res$);
            if (response && response.data) {
                if (response.data.data) {
                    this.hasMoreUsers = response.data.hasMorePages;
                    this.totalUsersCount = response.data.total;
                    this.listingList = response.data.data;
                } else {
                    this.listingList = [];
                }

            } else {
                this.listingList = [];
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

    selectType(value: any) {
        if (this.leadStatusForm.value.status_type === 'from_status') {
            this.leadStatusForm.get('list')?.clearValidators();
            this.leadStatusForm.get('list')?.updateValueAndValidity()
        }

    }
    showActiveStatic(value: any) {
        if (!value) {
            this.activeStaticList = false;
        } else {
            this.activeStaticList = true;

        }

    }
    getPaginationList() {

        let data = document.getElementsByClassName('ngx-pagination')[0]?.getElementsByTagName('li');
        for (let i = 0; i < data?.length; i++) {
            if (data[i].className == 'current' || data[i].className == 'current ng-star-inserted' || data[i].className == 'ng-star-inserted current') {
                data[i].style.background = this.color;
            } else {
                data[i].style.background = 'none';

            }
        }




    }
    getemailPopup(i: any) {
        this.popUps.sendMail = true;
        this.editEmailPopup = true;
        this.editEmailPopupIndex = i;
        this.sendMailForm.patchValue({
            template_type: this.campaignSteps[i].data.template_type,
        })
        if (this.campaignSteps[i].data.template_type == "from_scratch") {
            if (this.campaignSteps[i].data.template_type == 'from_scratch') {
                this.templateSelectColor2 = true;
                this.templateSelectColor = false;

            } else {
                this.templateSelectColor2 = false;
            }
            this.sendMailForm.patchValue({
                subject: this.campaignSteps[i].data.subject,
                to_option_scratch: this.campaignSteps[i].data.to_option_scratch,
                cc: this.campaignSteps[i].data.cc,
                body: this.campaignSteps[i].data.body,
                from_option_scratch: this.campaignSteps[i].data.from_option_scratch,
            })
        } else if (this.campaignSteps[i].data.template_type == "predefined") {
            if (this.campaignSteps[i].data.template_type == 'predefined') {
                this.templateSelectColor = true;
                this.templateSelectColor2 = false;
            } else {
                this.templateSelectColor = false;
            }
            this.sendMailForm.patchValue({
                from_option: this.campaignSteps[i].data.from_option,
                cc_template: this.campaignSteps[i].data.cc_template,
                to_option: this.campaignSteps[i].data.to_option,
                template: this.campaignSteps[i].data.templateId,
            })
        }

    }

}

