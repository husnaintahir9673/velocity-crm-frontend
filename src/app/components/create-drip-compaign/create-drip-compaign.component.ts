import { Component, ElementRef, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { API_PATH } from '@constants/api-end-points';
import { Custom_Regex, SETTINGS } from '@constants/constants';
import { AngularEditorComponent, AngularEditorConfig } from '@kolkov/angular-editor';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { ApiService } from '@services/api.service';
import { AuthService } from '@services/auth.service';
import { CommonService } from '@services/common.service';
import { EMPTY, lastValueFrom, map, Subscription } from 'rxjs';
import * as Model from './create-drip-compaign.model';
import { DndDropEvent } from 'ngx-drag-drop';
@Component({
    selector: 'app-create-drip-compaign',
    templateUrl: './create-drip-compaign.component.html',
    styleUrls: ['./create-drip-compaign.component.scss']
})
export class CreateDripCompaignComponent implements OnInit {
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
    leadStatusForm!: FormGroup;
    setPropertyForm!: FormGroup;
    gSettingForm!: FormGroup;
    dripCampaignNameForm!: FormGroup

    campaignSteps: any[] = [];
    steps = Model.STEP;
    leadStatusList: any[] = [];
    leadSearchModel: string = '';
    triggerStatus: any = {};
    dripCampaignName: string = '';
    modal!: NgbModalRef;
    personilizedVariables: any = [];
    // editorRef!: AngularEditorComponent;
    editorRef!: any;
    replaceIndex!: number;
    dragIndex!: number;
    dragedItem: any[''];
    EffectAllowed: any = 'all';
    draggable = {
        data: {},
        effectAllowed: this.EffectAllowed,
        disable: false,
        handle: false
    };
    usersListLimit: number = 1000;
    userListPage: number = 1;
    hasMoreUsers: boolean = false;
    listingList: Array<any> = [];
    totalUsersCount: number = 0;
    activeStaticList: boolean = false;
    @ViewChild('personizedVars') personizedVars!: ElementRef;
    style!: { fill: string; };
    background!: { background: string; };
    colorSubs!: Subscription;
    color!: string;
    loading = false;

    constructor(
        private fb: FormBuilder,
        private commonService: CommonService,
        private apiService: ApiService,
        private router: Router,
        private authService: AuthService,
        private route: ActivatedRoute,
        private modalService: NgbModal,
    ) { }

    ngOnInit(): void {
        this.getLeadOptions();
        this.initDelayForm();
        this.initSendMail();
        this.getEmailTemplateList();
        this.initSetPropertyForm();
        this.initGsettingForm();
        this.initLeadStatus();
        this.getAllLists();
        this.getUserDetails();
        let queryParams = this.route.snapshot.queryParams;
        if (queryParams && queryParams['name']) {
            this.dripCampaignName = queryParams['name'];

        } else {
            this.commonService.showError('');
        }
    }
    getUserDetails(): void {
        try {
            let ud = this.authService.getUserDetails();
            if (ud) {
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

    onDragStart(event: DragEvent, i: any, item: any[],) {
        this.dragIndex = i
        this.dragedItem = item
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
        this.campaignSteps = list
    }
    onDraggableMoved(event: DragEvent, item: any, list: any[], effect: any, i: number) {
    }


    onDragover(event: DragEvent, i: any) {
        this.replaceIndex = i;
    }

    onDrop(event: DndDropEvent, list: any[]) {
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
                from: [{ hour: 9, minute: 0, second: 0 }, [Validators.required]],
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
                this.leadStatusList = response.data.status;
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


    closeAllModels() {
        this.delaytimer.patchValue({
            day: 0,
            hour: 0,
            minute: 0,
        });
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
                    campData.data.status = data.status,
                    campData.data.status_type = data.status_type;
                    campData.data.list = data.list
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
    //                 list: 'list',
    //                 header_text: `Campaign trigger`
    //             }
    //             let campData: Model.STEPDATA = {
    //                 type: this.steps.TRIGGER,
    //                 header_text: `Campaign trigger`,
    //                 data: {
    //                     status_id: this.leadStatusForm.value.list.id,
    //                     status_name: this.leadStatusForm.value.list.name,
    //                     list: 'list',
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
    //                 list: 'list',
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
                    status_type: this.leadStatusForm.value.status_type,
                    list: 'list',
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
                        status_type: this.leadStatusForm.value.status_type,
                        status: statusArr,
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


    save2() {

        // if(this.campaignSteps.length) {
        //     let data = {
        //         status_id: this.triggerStatus.id,
        //         status_name: this.triggerStatus.name,
        //         header_text: `Campaign trigger`
        //     }
        //     let campData: Model.STEPDATA = {
        //         type: this.steps.TRIGGER,
        //         header_text: `Campaign trigger`,
        //         data: {
        //             status_id: this.triggerStatus.id,
        //             status_name: this.triggerStatus.name,
        //         },
        //     }
        //     this.campaignSteps[0] = campData;
        //     this.popUps.statusPopup = false;

        // } else {
        //     if(this.triggerStatus && this.triggerStatus.id) {
        //         try {

        //             let data = {
        //                 status_id: this.triggerStatus.id,
        //                 status_name: this.triggerStatus.name,
        //                 header_text: `Campaign trigger`
        //             }
        //             this.addItemToCampaign(this.steps.TRIGGER, data);
        //             this.popUps.statusPopup = false;
        //         } catch (error) {
        //             console.log(error);
        //         }
        //     } else {
        //         this.commonService.showError("Please select a status first");
        //     }
        // }



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
    templateType(value: any) {
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
            // this.sendMailForm.updateValueAndValidity();
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
    changeTimeDelay(i: number, text: any, step: any) {
        switch (step) {
            case step == "time-delay":
                this.popUps.timeDelay = true
                break;
            case Model.STEP.TIME_DELAY:
                // campData.data.rawData = data.time;
                // let timeText = `${data.time.day} ${data.time.day > 1 ? 'Days' : 'Day'} ${data.time.hour} ${data.time.hour > 1 ? 'Hours' : 'Hour'} ${data.time.minute} ${data.time.minute > 1 ? 'Minutes' : 'Minute'}`;
                // campData.data.timeText = timeText;
                break;
            case Model.STEP.TRIGGER:
                // campData.data.status_id = data.status_id;
                // campData.data.status_name = data.status_name;
                // this.campaignSteps = [];
                break;
            case Model.STEP.SET_PROPERTY_VALUE:
                // campData.data.status_id = data.status_id;
                // campData.data.status_name = data.status_name;
                break;
            default:
                break;
        }


    }

    async getEmailTemplateList(): Promise<any> {
        try {
            let url = `?page_limit=1000&page=1`;
            this.commonService.showSpinner();

            // const res$ = this.apiService.getReq(
            //     API_PATH.EMAIL_TEMPLATE_LIST + url,
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
                        name: this.dripCampaignName,
                        compaignStep: this.campaignSteps,
                        settings: this.gSettingForm.value
                    }
                    this.commonService.showSpinner();
                    const res$ = this.apiService.postReq(API_PATH.ADD_DRIP_CAMPAIGN, data, 'campaign', 'add');
                    let response = await lastValueFrom(res$);
                    if (response) {
                        this.commonService.showSuccess(response.message);
                        this.router.navigate([`/${this.userBaseRoute}/drip-campaign-list`]);
                    }
                    this.commonService.hideSpinner();

                } else if (this.gSettingForm.value.type != 'anytime') {
                    let settingData = this.gSettingForm.value;
                    if (settingData.to.hour > settingData.from.hour) {
                        //submit data
                        let data = {
                            name: this.dripCampaignName,
                            compaignStep: this.campaignSteps,
                            settings: this.gSettingForm.value
                        }
                        this.commonService.showSpinner();
                        const res$ = this.apiService.postReq(API_PATH.ADD_DRIP_CAMPAIGN, data, 'campaign', 'add');
                        let response = await lastValueFrom(res$);
                        if (response) {
                            this.commonService.showSuccess(response.message);
                            this.router.navigate([`/${this.userBaseRoute}/drip-campaign-list`]);
                        }
                        this.commonService.hideSpinner();
                    } else if (settingData.to.hour == settingData.from.hour && settingData.to.minute > settingData.from.minute) {
                        //submit data
                        let data = {
                            name: this.dripCampaignName,
                            compaignStep: this.campaignSteps,
                            settings: this.gSettingForm.value
                        }
                        this.commonService.showSpinner();
                        const res$ = this.apiService.postReq(API_PATH.ADD_DRIP_CAMPAIGN, data, 'campaign', 'add');
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
            //  else {
            //     this.commonService.showError('Please provide valid data for general settings');
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
    // onTokenSelect(e: any) {
    //     if (this.editorRef) {
    //         // let actualName = e.target.value.replace(/[{} $]/g, "");
    //         // actualName = actualName.replace(/[ _ ]/g, " ")
    //         // ${this.transform(actualName)}: 
    //         this.editorRef.executeCommand('insertText', `${e.target.value}`);
    //     }
    //     this.closeModal()
    // }
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

    selectType(value: any) {
        if (this.leadStatusForm.value.status_type === 'from_status') {
            this.leadStatusForm.get('list')?.clearValidators();
            this.leadStatusForm.get('list')?.updateValueAndValidity();
            this.triggerStatus = {}
        } else if (this.leadStatusForm.value.status_type === 'from_list') {
            this.triggerStatus = {}
        }


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

    showActiveStatic(value: any) {
        if (!value) {
            this.activeStaticList = false;
        } else {
            this.activeStaticList = true;

        }

    }
    onChange(e: any) {
        let data = e.target.value;
    }
}
