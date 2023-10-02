import { Component, ElementRef, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { API_PATH } from '@constants/api-end-points';
import { Custom_Regex, SETTINGS } from '@constants/constants';
import { AngularEditorConfig } from '@kolkov/angular-editor';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { ApiService } from '@services/api.service';
import { AuthService } from '@services/auth.service';
import { CommonService } from '@services/common.service';
import { EMPTY, lastValueFrom, map, Subscription } from 'rxjs';
import * as Model from './add-system-notification.model';
import { DndDropEvent } from 'ngx-drag-drop';

@Component({
	selector: 'app-add-system-notifications',
	templateUrl: './add-system-notifications.component.html',
	styleUrls: ['./add-system-notifications.component.scss']
})
export class AddSystemNotificationsComponent implements OnInit {
	popUps: any = {
		actionsPopup: false,
		statusPopup: false,
		sendMail: false,
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
	dripCampaignNameForm!: FormGroup

	campaignSteps: any[] = [];
	steps = Model.STEP;
	leadStatusList: any[] = [];
	leadSearchModel: string = '';
	systemSearchModel: string = '';
	triggerStatus: any = {};
	dripCampaignName: string = '';
	modal!: NgbModalRef;
	personilizedVariables: any = [];
	editorRef!:any;
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
	fromOptions: Array<any> = [];
	rolesList: Array<any> = [];
	systemStatusList: Array<any> = [];
	loading = false;
	color!: string;
	templateSelectColor: boolean = false;
	templateSelectColor2: boolean = false;
	editEmailPopup: boolean = false;
	editEmailPopupIndex!: number;

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
		this.getRolesOptions();
		this.initSendMail();
		this.getEmailTemplateList();
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
				this.color=ud?.color;
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
		if(this.sendMailForm.value.template_type == 'predefined'){
            this.templateSelectColor = true;
			this.templateSelectColor2 = false;

        }else{
            this.templateSelectColor = false;
        }
		if(this.sendMailForm.value.template_type == 'from_scratch'){
            this.templateSelectColor2 = true;
			this.templateSelectColor = false;

        }
        else{
            this.templateSelectColor2 = false;
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
		if(this.sendMailForm.value.template_type == 'predefined'){
            this.templateSelectColor = true;
			this.templateSelectColor2 = false;

        }else{
            this.templateSelectColor = false;
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
					campData.data.status_type = data.status_type;
					campData.data.list = data.list
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
	async getAllLists(): Promise<any> {
		try {
			let url = `?sort_by=${'updated_at'}&dir=${'DESC'}&page_limit=${this.usersListLimit}&page=${this.userListPage}`;
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
		let data = {
			status_id: this.leadStatusForm.value.status_type == 'specific' ? this.leadStatusForm.value.lead_status.id: null,
			status_name: this.leadStatusForm.value.status_type == 'specific' ? this.leadStatusForm.value.lead_status.name : 'all',
			system_id: this.leadStatusForm.value.system_status.id,
			system_name: this.leadStatusForm.value.system_status.name,
			status_type: this.leadStatusForm.value.status_type,
			header_text: `System trigger`
		}
		let campData: Model.STEPDATA = {
			type: this.steps.TRIGGER,
			header_text: `System trigger`,
			data: {
				status_id:  this.leadStatusForm.value.status_type == 'specific' ? this.leadStatusForm.value.lead_status.id: null,
				status_name: this.leadStatusForm.value.status_type == 'specific' ? this.leadStatusForm.value.lead_status.name : 'all',
				system_id: this.leadStatusForm.value.system_status.id,
				system_name: this.leadStatusForm.value.system_status.name,
				status_type: this.leadStatusForm.value.status_type,
			},
		}
		this.campaignSteps[0] = campData;
		this.popUps.statusPopup = false;

	}


	onLeadStatusChange(status: any) {
		this.triggerStatus = status;
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
	templateType(value: any) {
		if(value == 'predefined'){
            this.templateSelectColor = true;
			this.templateSelectColor2 = false;

        }else{
            this.templateSelectColor = false;
        }
        if(value == 'from_scratch'){
            this.templateSelectColor2 = true;
			this.templateSelectColor = false;

        }
        else{
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
						if(this.editEmailPopup){
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
						}else{
							let temp = this.emailTemplateList.find((e) => e.id === this.sendMailForm.value.template);
							if (temp) {
								data.templateText = temp.name;
							}
							this.addItemToCampaign(this.steps.SEND_EMAIL, data);
							this.closeAllModels();
						}
						
					} else if (this.sendMailForm.value.subject && this.sendMailForm.value.body) {
						data.templateText = this.sendMailForm.value.subject
						if(this.editEmailPopup){
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
						}else{
							this.addItemToCampaign(this.steps.SEND_EMAIL, data);
							this.closeAllModels();
						}
					
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
				return;
			}
			this.commonService.showSpinner();
			let data = {
				name: this.dripCampaignName,
				notification_setup: this.campaignSteps,
			}
			const res$ = this.apiService.postReq(API_PATH.SYSTEM_NOTIFICATIONS_ADD, data, 'system', 'notification-add');
			let response = await lastValueFrom(res$);
			if (response) {
				this.commonService.showSuccess(response.message);
				this.router.navigate([`/${this.userBaseRoute}/system-notification-list`]);
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

	// onTokenSelect(e: any) {
	// 	if (this.editorRef) {
	// 		// let actualName = e.target.value.replace(/[{} $]/g, "");
	// 		// actualName = actualName.replace(/[ _ ]/g, " ")
	// 		// ${this.transform(actualName)}: 
	// 		this.editorRef.executeCommand('insertText', `${e.target.value}`);
	// 	}
	// 	this.closeModal()
	// }
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
    transform(value:string): string {
        let first = value.substr(0,1).toUpperCase();
        return first + value.substr(1); 
      }
	initLeadStatus() {
		this.leadStatusForm = this.fb.group({
			status_type: ['specific', [Validators.required]],
			lead_status: [null],
			system_status: [null],
			// list: [null],
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
	getemailPopup(i : any){
        this.popUps.sendMail = true;
		this.editEmailPopup = true;
		this.editEmailPopupIndex = i;
		this.sendMailForm.patchValue({
			template_type: this.campaignSteps[i].data.template_type,
		  })
		if(this.campaignSteps[i].data.template_type == "from_scratch"){
			if(this.campaignSteps[i].data.template_type == 'from_scratch'){
				this.templateSelectColor2 = true;
				this.templateSelectColor = false;

			}
			else{
				this.templateSelectColor2 = false;
			} 
              this.sendMailForm.patchValue({
				subject:   this.campaignSteps[i].data.subject , 
				to_option_scratch:  this.campaignSteps[i].data.to_option_scratch,
				cc:   this.campaignSteps[i].data.cc,
				body:  this.campaignSteps[i].data.body,
				from_option_scratch:  this.campaignSteps[i].data.from_option_scratch,
			  })
			} else if(this.campaignSteps[i].data.template_type == "predefined"){
				if(this.campaignSteps[i].data.template_type == 'predefined'){
					this.templateSelectColor = true;
				this.templateSelectColor2 = false;

				}
				else{
					this.templateSelectColor = false;
				} 
				this.sendMailForm.patchValue({
					from_option:   this.campaignSteps[i].data.from_option , 
					cc_template:  this.campaignSteps[i].data.cc_template,
					to_option:   this.campaignSteps[i].data.to_option,
					template:  this.campaignSteps[i].data.templateId,
				})
			  }
        
	}
}

