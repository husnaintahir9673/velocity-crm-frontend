import { Component, ElementRef, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { API_PATH } from '@constants/api-end-points';
import { Custom_Regex, SETTINGS } from '@constants/constants';
import { AngularEditorConfig } from '@kolkov/angular-editor';
import { NgbCalendar, NgbDate, NgbDateParserFormatter, NgbDateStruct, NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { ApiService } from '@services/api.service';
import { AuthService } from '@services/auth.service';
import { CommonService } from '@services/common.service';
import moment from 'moment';
import { EMPTY, lastValueFrom, map, Subscription } from 'rxjs';
import * as Model from './view-drip-campaign-model';
import { DndDropEvent } from 'ngx-drag-drop';

@Component({
    selector: 'app-view-drip-campaign',
    templateUrl: './view-drip-campaign.component.html',
    styleUrls: ['./view-drip-campaign.component.scss']
})
export class ViewDripCampaignComponent implements OnInit {

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

    delaytimer!: FormGroup;
    sendMailForm!: FormGroup;
    setPropertyForm!: FormGroup;
    gSettingForm!: FormGroup;
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
    canViewDripCampaignLogs: boolean = false;
    dripCampaignList: Array<any> = [];
    dateFormat: string = '';
    timeZone: string = '';
    leadStatusId: string = '';
    settingsData: any = {};
    personilizedVariables: any = [];
    // editorRef!: AngularEditorComponent;
    editorRef!: any;
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
    loading = false;


    ngOnInit(): void {
        this.getLeadOptions();
        this.initDelayForm();
        this.initSendMail();
        this.initLeadStatus();
        this.getEmailTemplateList();
        this.initSetPropertyForm();
        this.initGsettingForm();
        this.getUserDetails();
        this.getAllLists();


        let params = this.route.snapshot.params;
        let query = this.route.snapshot.queryParams;
        if (params['id']) {
            this.dripCampaignId = params['id'];
            this.getDripCampaignDetails();
            this.getDripcampaignLogsList();;
            this.getEnrollmentList();

        }
        if (query['mode'] && query['mode'] === 'edit') {
            this.editMode = true;
        }
        this.canViewDripCampaignLogs = this.authService.hasPermission('campaign-logs');
    }
    ngDoCheck(): void {

        this.getPaginationList();
        this.getDateColor();
    }
    // custom datepicker color
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
            template_type: ['predefined', [Validators.required]]
        })
    }

    initDelayForm() {
        this.delaytimer = this.fb.group({
            day: [0, [Validators.min(0), Validators.max(500)]],
            hour: [0, [Validators.min(0), Validators.max(23)]],
            minute: [0, [Validators.min(0), Validators.max(59)]],
        })
    }

    initSetPropertyForm() {
        this.setPropertyForm = this.fb.group({
            proprtyToSet: ['', [Validators.required]],
            leadStatus: [null]
        })
    }

    initGsettingForm() {
        try {
            this.gSettingForm = this.fb.group({
                day: ['everyday', [Validators.required]],
                from: [{ hour: 9, minute: 0, second: 0, disable: true }, [Validators.required]],
                to: [{ hour: 17, minute: 0, second: 0 }, [Validators.required]],
                type: ['anytime'],
                customDays: [[]]
            })
        } catch (error) {

        }
    }

    async getLeadOptions() {
        try {
            this.commonService.showSpinner();
            const res$ = this.apiService.getReq(API_PATH.LEAD_OPTIONS_LIST, '', '');
            let response = await lastValueFrom(res$);
            if (response && response.data) {
                this.leadStatusList = response.data.status
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
        this.gSettingForm.controls['day'].enable();
        this.gSettingForm.controls['customDays'].enable();
    }
    cancel() {
        this.editMode = !this.editMode;
        this.gSettingForm.controls['day'].disable();
        this.gSettingForm.controls['customDays'].disable();

        this.patchSettingsData();
    }

    closeAllModels() {
        this.delaytimer.patchValue({
            day: 0,
            hour: 0,
            minute: 0,
        })
        this.sendMailForm.patchValue({
            template_type: 'predefined',
            body: '',
            subject: '',
            cc: '',
            template: null
        });
        if (this.sendMailForm.value.template_type === 'predefined') {
            this.sendMailForm.get('template')?.clearValidators()
            this.sendMailForm.get('template')?.updateValueAndValidity();
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
        this.getEnrollmentList();
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
            const res$ = this.apiService.getReq(API_PATH.DRIP_CAMPAIGN_VIEW + url, 'campaign', 'view');
            let response = await lastValueFrom(res$);
            if (response && response.data && response.data.data) {
                this.dripCampaignDeleteStatus = response.data.data.isDeleted;
                if (this.dripCampaignDeleteStatus) {
                    this.gSettingForm.controls['day'].disable();
                    this.gSettingForm.controls['customDays'].disable();
                } else {
                    this.gSettingForm.controls['day'].enable();
                    this.gSettingForm.controls['customDays'].enable();
                }
                this.campaignSteps = response.data.data.compaignStep;
                this.leadStatusForm.patchValue({
                    status_type: this.campaignSteps[0].data.status_type
                })
               if(this.campaignSteps[0].data.status_type == "from_status"){
                this.leadStatusForm.patchValue({
                    lead_status: this.campaignSteps[0].data.status_id
                })
               }else{
                this.leadStatusForm.patchValue({
                    list: this.campaignSteps[0].data.list
                })
               }
             
                this.triggerStatus = {
                    name: this.campaignSteps[0].data.status_name,
                    id: this.campaignSteps[0].data.status_id
                }
                this.dripCampaignName = response.data.data.name;
                this.dripCampaignStatus = response.data.data.status;
                this.settingsData = response.data.data.settings;
                this.patchSettingsData();


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
    patchSettingsData() {
        this.gSettingForm.patchValue({
            day: this.settingsData.day,
            from: this.settingsData.from,
            to: this.settingsData.to,
            type: this.settingsData.type,
            customDays: this.settingsData.customDays,
        })
    }
    templateType(value: any) {
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
        } else {
            this.sendMailForm.get('template')?.clearValidators()
            this.sendMailForm.get('template')?.updateValueAndValidity();
            this.sendMailForm.get('body')?.clearValidators();
            this.sendMailForm.get('body')?.updateValueAndValidity();
            this.sendMailForm.get('subject')?.clearValidators()
            this.sendMailForm.get('subject')?.updateValueAndValidity();
            this.sendMailForm.get('cc')?.clearValidators()
            this.sendMailForm.get('cc')?.updateValueAndValidity();

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
                    campData.data.templateId = data.templateId;
                    campData.data.templateText = data.templateText;
                    campData.data.body = data.body;
                    campData.data.subject = data.subject;
                    campData.data.cc = data.cc;
                    break;
                case Model.STEP.TIME_DELAY:
                    campData.data.rawData = data.time;
                    let timeText = `${data.time.day} ${data.time.day > 1 ? 'Days' : 'Day'} ${data.time.hour} ${data.time.hour > 1 ? 'Hours' : 'Hour'} ${data.time.minute} ${data.time.minute > 1 ? 'Minutes' : 'Minute'}`;
                    campData.data.timeText = timeText;
                    break;
                case Model.STEP.TRIGGER:
                    campData.data.status_id = data.status_id;
                    campData.data.status_name = data.status_name;
                    campData.data.status_type = data.status_type;
                    campData.data.status = data.status,
                    this.campaignSteps = [];
                    break;
                case Model.STEP.SET_PROPERTY_VALUE:
                    campData.data.status_id = data.status_id;
                    campData.data.status_name = data.status_name;
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
    //     this.leadStatusForm.markAllAsTouched();
    //     if (this.leadStatusForm.value.status_type === 'from_list') {
    //         this.leadStatusForm.get('list')?.setValidators([Validators.required])
    //         this.leadStatusForm.get('list')?.updateValueAndValidity();
    //     }
    //     if (this.campaignSteps.length) {
    //         if (this.leadStatusForm.value.status_type === 'from_list') {
    //             let data = {
    //                 status_id: this.leadStatusForm.value.list.id,
    //                 status_name: this.leadStatusForm.value.list.name,
    //                 select_list: this.leadStatusForm.value.select_list,
    //                 header_text: `Campaign trigger`
    //             }
    //             let campData: Model.STEPDATA = {
    //                 type: this.steps.TRIGGER,
    //                 header_text: `Campaign trigger`,
    //                 data: {
    //                     status_id: this.leadStatusForm.value.list.id,
    //                     status_name: this.leadStatusForm.value.list.name,
    //                     select_list: this.leadStatusForm.value.select_list,
    //                 },
    //             }
    //             this.campaignSteps[0] = campData;
    //         } else if (this.leadStatusForm.value.status_type === 'from_status') {
    //             if (this.triggerStatus.id == undefined || this.triggerStatus.id == '') {

    //                 this.commonService.showError("Please select a status first");
    //                 return
    //             }
    //             let data = {
    //                 status_id: this.triggerStatus.id,
    //                 status_name: this.triggerStatus.name,
    //                 header_text: `Campaign trigger`
    //             }
    //             let campData: Model.STEPDATA = {
    //                 type: this.steps.TRIGGER,
    //                 header_text: `Campaign trigger`,
    //                 data: {
    //                     status_id: this.triggerStatus.id,
    //                     status_name: this.triggerStatus.name,
    //                 },
    //             }
    //             this.campaignSteps[0] = campData;
    //         }

    //         this.popUps.statusPopup = false;
    //     } else if (this.leadStatusForm.value.status_type === 'from_status') {
    //         if (this.triggerStatus.id == undefined || this.triggerStatus.id == '') {
    //             this.commonService.showError("Please select a status first");
    //             return
    //         }
    //         if (this.triggerStatus && this.triggerStatus.id) {
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
    //         }

    //     } else if (this.leadStatusForm.value.status_type === 'from_list') {
    //         try {

    //             let data = {
    //                 status_id: this.leadStatusForm.value.list.id,
    //                 status_name: this.leadStatusForm.value.list.name,
    //                 select_list: this.leadStatusForm.value.select_list,
    //                 header_text: `Campaign trigger`
    //             }
    //             this.addItemToCampaign(this.steps.TRIGGER, data);
    //             this.popUps.statusPopup = false;
    //         } catch (error) {
    //             console.log(error);
    //         }

    //     }


    // }
    addTrigger() {
        this.leadStatusForm.markAllAsTouched();
        if (this.leadStatusForm.value.status_type === 'from_list') {
            this.leadStatusForm.get('list')?.setValidators([Validators.required])
            this.leadStatusForm.get('list')?.updateValueAndValidity();
        }
        if (this.campaignSteps.length) {
            if (this.leadStatusForm.value.status_type === 'from_list') {
                let data = {
                    status_id: this.leadStatusForm.value.list.id,
                    status_name: this.leadStatusForm.value.list.name,
                    list: 'list',
                    status_type: this.leadStatusForm.value.status_type,
                    header_text: `Campaign trigger`
                }
                let campData: Model.STEPDATA = {
                    type: this.steps.TRIGGER,
                    header_text: `Campaign trigger`,
                    data: {
                        status_id: this.leadStatusForm.value.list.id,
                        status_name: this.leadStatusForm.value.list.name,
                        status_type: this.leadStatusForm.value.status_type,
                        list: 'list',
                    },
                }
                this.campaignSteps[0] = campData;
            } else if (this.leadStatusForm.value.status_type === 'from_status') {
                this.leadStatusForm.get('lead_status')?.setValidators([Validators.required])
                this.leadStatusForm.get('lead_status')?.updateValueAndValidity();
                let  statusArr = this.leadStatusList.filter((item) =>{
                    return this.leadStatusForm.value.lead_status.indexOf(item.id) !== -1;
                  });
              let status_name = []
              for (let i = 0; i < statusArr.length; i++) {
                status_name.push(statusArr[i].name) 
                  
              }
                let data = {
                    status_id: this.leadStatusForm.value.lead_status,
                    status_name: status_name,
                    status: statusArr,
                    status_type: this.leadStatusForm.value.status_type,
                    header_text: `Campaign trigger`
                }
                let campData: Model.STEPDATA = {
                    type: this.steps.TRIGGER,
                    header_text: `Campaign trigger`,
                    data: {
                        status_id: this.leadStatusForm.value.lead_status,
                        status_name: status_name,
                        status: statusArr,
                        status_type: this.leadStatusForm.value.status_type,
                    },
                }
                this.campaignSteps[0] = campData;
            }

            this.popUps.statusPopup = false;
        } else if (this.leadStatusForm.value.status_type === 'from_status') {
            this.leadStatusForm.get('lead_status')?.setValidators([Validators.required])
            this.leadStatusForm.get('lead_status')?.updateValueAndValidity();
                let  statusArr = this.leadStatusList.filter((item) =>{
                    return this.leadStatusForm.value.lead_status.indexOf(item.id) !== -1;
                  });  
              let status_name = []
              for (let i = 0; i < statusArr.length; i++) {
                status_name.push(statusArr[i].name) 
                  
              }
                    let data = {
                        status_id: this.leadStatusForm.value.lead_status,
                        status_name: status_name,
                        status: statusArr,
                        status_type: this.leadStatusForm.value.status_type,
                        header_text: `Campaign trigger`
                    }
                    this.addItemToCampaign(this.steps.TRIGGER, data);
                    this.popUps.statusPopup = false;

        } else if (this.leadStatusForm.value.status_type === 'from_list') {
            try {

                let data = {
                    status_id: this.leadStatusForm.value.list.id,
                    status_name: this.leadStatusForm.value.list.name,
                    list: 'list',
                    status_type: this.leadStatusForm.value.status_type,
                    header_text: `Campaign trigger`
                }
                this.addItemToCampaign(this.steps.TRIGGER, data);
                this.popUps.statusPopup = false;
            } catch (error) {
                console.log(error);
            }

        }


    }


    onLeadStatusChange(status: any) {
        this.triggerStatus = status;
    }

    onDelaySelection() {
        try {
            let timerValue = Object.values(this.delaytimer.value);
            if (timerValue.every((item: any) => item === 0)) {
                this.commonService.showError('Please select at least a value.');
                return;
            }
            let data = {
                header_text: `Delay for a set amount of time`,
                time: {
                    ...this.delaytimer.value
                }
            }
            this.addItemToCampaign(this.steps.TIME_DELAY, data);
            this.closeAllModels();
        } catch (error) {
            console.log(error);
        }
    }

    ontemplateSave() {
        try {
            this.sendMailForm.markAllAsTouched();
            if (this.sendMailForm.value.template_type === 'predefined') {
                this.sendMailForm.get('template')?.setValidators([Validators.required])
                this.sendMailForm.get('template')?.updateValueAndValidity();

            } else {
                this.sendMailForm.get('body')?.setValidators([Validators.required]);
                this.sendMailForm.get('body')?.updateValueAndValidity();

                this.sendMailForm.get('subject')?.setValidators([Validators.required])
                this.sendMailForm.get('subject')?.updateValueAndValidity();
                this.sendMailForm.get('cc')?.setValidators([Validators.pattern(Custom_Regex.email),])
                this.sendMailForm.get('cc')?.updateValueAndValidity();

            }
            this.sendMailForm.updateValueAndValidity();
            if (this.sendMailForm.valid) {
                let lastVal = this.campaignSteps[this.campaignSteps.length - 1];
                if (lastVal?.data?.templateId === this.sendMailForm.value.template && lastVal?.data?.templateId != null && this.sendMailForm.value.template != null) {
                    this.commonService.showError('Either select a different template or add delay between them')
                } else {
                    let data = {
                        templateId: this.sendMailForm.value.template,
                        templateText: this.sendMailForm.value.template,
                        body: this.sendMailForm.value.body,
                        subject: this.sendMailForm.value.subject,
                        cc: this.sendMailForm.value.cc,
                        header_text: 'Send email notification'
                    }

                    if (this.sendMailForm.value.template_type === 'predefined') {
                        let temp = this.emailTemplateList.find((e) => e.id === this.sendMailForm.value.template);
                        if (temp) {
                            data.templateText = temp.name;
                        }
                        this.addItemToCampaign(this.steps.SEND_EMAIL, data);
                        this.closeAllModels();
                    } else if (this.sendMailForm.value.subject && this.sendMailForm.value.body) {
                        data.templateText = this.sendMailForm.value.subject
                        this.addItemToCampaign(this.steps.SEND_EMAIL, data);
                        this.closeAllModels();
                    } else {
                        this.commonService.showError('Please select a template or provide subject and body')
                    }
                }
            }
        } catch (error) {
            console.log(error);
        }
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
            // const res$ = this.apiService.getReq(
            //     API_PATH.EMAIL_TEMPLWATE_LIST + url,
            //     '',
            //     ''
            // );
            const res$ = this.apiService.getReq(
                API_PATH.EMAIL_TEMPLATE_LISTING_NEW + url,
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

    setPropertySave() {
        try {
            this.setPropertyForm.markAllAsTouched();
            if (this.setPropertyForm.valid) {
                let data = {
                    status_id: this.setPropertyForm.value.leadStatus,
                    status_name: '',
                    header_text: ``
                }
                let temp = this.leadStatusList.find((e) => e.id === this.setPropertyForm.value.leadStatus);
                if (temp) {
                    data.status_name = temp.name;
                    data.header_text = `Set property value`;
                }
                this.addItemToCampaign(this.steps.SET_PROPERTY_VALUE, data);
                this.closeAllModels();
            }
        } catch (error) {

        }
    }

    get f() {
        return this.sendMailForm.controls;
    }

    onPopertyToSetChange() {
        try {
            if (this.setPropertyForm.value.proprtyToSet === 'lead-status') {
                this.setPropertyForm.get('leadStatus')?.setValidators([Validators.required])
                this.setPropertyForm.get('leadStatus')?.updateValueAndValidity();
            }
        } catch (error) {

        }
    }

    gSettingSave() {
        try {
            console.log(this.gSettingForm.valid);
        } catch (error) {
        }
    }

    gSettingdayChange() {
        try {
            if (this.gSettingForm.value.day === 'custom') {
                this.gSettingForm.get('customDays')?.setValidators([Validators.required]);
            } else {
                this.gSettingForm.get('customDays')?.setValidators([]);
            }
            this.gSettingForm.get('customDays')?.updateValueAndValidity();
        } catch (error) {

        }
    }

    onsettingTypeChange() {
        0
        try {
            if (this.gSettingForm.value.type === 'anytime') {
                this.gSettingForm.get('customDays')?.setValidators([]);
            }
        } catch (error) {

        }
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
                this.activeTab = 'Actions'
                return;
            }
            if (this.gSettingForm.valid) {
                if (this.gSettingForm.value.type === 'anytime') {
                    //sbmit data
                    let data = {
                        id: this.dripCampaignId,
                        name: this.dripCampaignName,
                        compaignStep: this.campaignSteps,
                        settings: this.gSettingForm.value
                    }
                    this.commonService.showSpinner();
                    const res$ = this.apiService.postReq(API_PATH.DRIP_CAMPAIGN_UPDATE, data, 'campaign', 'update');
                    let response = await lastValueFrom(res$);
                    if (response) {
                        this.commonService.showSuccess(response.message);
                        this.router.navigate([`/${this.userBaseRoute}/drip-campaign-list`]);
                    }
                    this.commonService.hideSpinner();

                } else if (this.gSettingForm.value.type != 'anytime') {
                    let settingsdata = this.gSettingForm.value;
                    if (settingsdata.to.hour > settingsdata.from.hour) {
                        //submit data
                        let data = {
                            id: this.dripCampaignId,
                            name: this.dripCampaignName,
                            compaignStep: this.campaignSteps,
                            settings: this.gSettingForm.value
                        }
                        this.commonService.showSpinner();
                        const res$ = this.apiService.postReq(API_PATH.DRIP_CAMPAIGN_UPDATE, data, 'campaign', 'update');
                        let response = await lastValueFrom(res$);
                        if (response) {
                            this.commonService.showSuccess(response.message);
                            this.router.navigate([`/${this.userBaseRoute}/drip-campaign-list`]);
                        }
                        this.commonService.hideSpinner();
                        this.commonService.hideSpinner();
                    } else if (settingsdata.to.hour == settingsdata.from.hour && settingsdata.to.minute > settingsdata.from.minute) {
                        //submit data
                        let data = {
                            id: this.dripCampaignId,
                            name: this.dripCampaignName,
                            compaignStep: this.campaignSteps,
                            settings: this.gSettingForm.value
                        }
                        this.commonService.showSpinner();
                        const res$ = this.apiService.postReq(API_PATH.DRIP_CAMPAIGN_UPDATE, data, 'campaign', 'update');
                        let response = await lastValueFrom(res$);
                        if (response) {
                            this.commonService.showSuccess(response.message);
                            this.router.navigate([`/${this.userBaseRoute}/drip-campaign-list`]);
                        }
                        this.commonService.hideSpinner();
                    } else {
                        this.commonService.showError('Please provide valid data for general settings');
                    }
                }

            }
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
    async getDripcampaignLogsList(): Promise<any> {
        try {
            let url = `?page_limit=${this.logslimit}&page=${this.logspage}&id=${this.dripCampaignId}`;
            // if (this.selectedDate) {
            //     url = url + `&daterange_filter=${this.selectedDate}`
            // }
            // if (this.companyStatus) {
            //     url = url + `&status=${this.companyStatus}`
            // }
            this.commonService.showSpinner();
            const res$ = this.apiService.getReq(API_PATH.DRIP_CAMPAINGN_LOGS_LIST + url, 'campaign', 'logs');
            let response = await lastValueFrom(res$);
            if (response && response.data) {
                if (response.data.logs) {
                    this.hasMoreLogs = response.data.hasMorePages;
                    this.totalLogs = response.data.total;
                    this.dripCampaignList = response.data.logs;
                } else {
                    this.dripCampaignList = [];
                }

            } else {
                this.dripCampaignList = [];
                this.hasMoreLogs = false;
                this.logspage = 1;
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
    getUserDetails(): void {
        try {
            let ud = this.authService.getUserDetails();
            if (ud) {
                this.dateFormat = ud.date_format;
                this.timeZone = ud.time_zone;
                this.color = ud?.color
                this.style = { fill: ud?.color };
                // this.stroke={stroke:ud?.color};
                this.background = { background: ud?.color };
            }
        } catch (error: any) {
            this.commonService.showError(error.message);
        }
    }
    getDate(date: any) {
        return moment(date).tz(this.timeZone).format(`${this.dateFormat} hh:mm:ss A`)
    }
    getColorOnUpdate() {
        this.colorSubs = this.authService.getColor().subscribe((u) => {
            this.getUserDetails();
        });
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
    //     if(this.editorRef) {
    //     // let actualName = e.target.value.replace(/[{} $]/g, "");
    //     // actualName = actualName.replace(/[ _ ]/g, " ")
    //     // ${this.transform(actualName)}: 
    //         this.editorRef.executeCommand('insertText',`${e.target.value}`);
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
    changeHours(value: any) {
        if (value > 23 || value < 0) {
            this.commonService.showError('Please fill hours less than and equal to 23')
            this.delaytimer.patchValue({
                hour: 0
            })
        }


    }
    changeMinutes(value: any) {
        if (value > 59 || value < 0) {
            this.commonService.showError('Please fill minutes less than and equal to 59')
            this.delaytimer.patchValue({
                minute: 0
            })
        }

    }
    /**
   * @description on page change
   * @returns {void}
   * @param p 
   */
    onPageChange(p: number): void {
        this.enrollmentpage = p;
        this.getEnrollmentList();
    }
    onLogsPageChange(p: number): void {
        this.logspage = p;
        this.getDripcampaignLogsList();
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
                this.enrollmentpage = 1;
                this.getEnrollmentList();
            }
        }
    }
    async getEnrollmentList() {
        try {
            let url = `?id=${this.dripCampaignId}&page=${this.enrollmentpage}&page_limit=${this.enrollmentlimit}`;
            if (this.enrollmentSearch) {
                url = `${url}&search=${this.enrollmentSearch}`;
            }
            if (this.selectedDate) {
                url = `${url}&dateRange=${this.selectedDate}`;
            }
            // ,{ search: this.enrollmentSearch, page: this.enrollmentpage, dateRange: this.selectedDate },
            this.commonService.showSpinner();
            let res$ = this.apiService.getReq(API_PATH.DRIP_CAMPAIGNS_ENROLLMENT_LIST + url, 'campaign', 'update');
            let response = await lastValueFrom(res$);
            if (response && response.status_code == 200) {
                if (response.data) {
                    this.stats = response.data?.data?.stats
                }
                if (response.data && response.data.data.enrollments) {
                    this.enrollmentList = response.data.data.enrollments;
                    this.totalEnrollment = response.data.data.total
                } else {
                    this.enrollmentList = [];
                    this.totalEnrollment = 0;
                    this.enrollmentpage = 1;
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
    leadDetailsLink(id: any) {
        const url = this.router.serializeUrl(this.router.createUrlTree([`/${this.userBaseRoute}/lead-detail/${id}`]));
        window.open(url, '_blank')
    }
    initLeadStatus() {
        this.leadStatusForm = this.fb.group({
            status_type: ['from_status', [Validators.required]],
            // select_list: ['active_list'],
            lead_status:[null],
            list: [null],
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
    onChange(e: any) {
        let data = e.target.value;
    }

}

