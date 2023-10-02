import { Component, ElementRef, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { API_PATH } from '@constants/api-end-points';
import { Custom_Regex } from '@constants/constants';
import { AngularEditorComponent } from '@kolkov/angular-editor';
import { NgbCalendar, NgbDate, NgbDateParserFormatter, NgbDateStruct, NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { ApiService } from '@services/api.service';
import { AuthService } from '@services/auth.service';
import { CommonService } from '@services/common.service';
import { lastValueFrom, Subscription } from 'rxjs';
import * as Model from './list.model';
import moment from 'moment';

@Component({
    selector: 'app-create-list',
    templateUrl: './create-list.component.html',
    styleUrls: ['./create-list.component.scss']
})
export class CreateListComponent implements OnInit {
    popUps: any = {
        actionsPopup: false,
        setPropertyValue: false
    }
    activeTab: string = 'Actions';
    addOnAIndex: number | null = null;
    emailTemplateList: any[] = [];
    templatesSearchModel: string = '';
    maxDate!: NgbDateStruct;
    hoveredDate: NgbDate | null = null;
    fromDate!: NgbDate | null;
    toDate!: NgbDate | null;
    selectedDate: any = '';
    setPropertyForm!: FormGroup;
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
    @ViewChild('datepicker') datepicker: any;
    @ViewChild('personizedVars') personizedVars!: ElementRef;
    leadList: Array<any> = [];
    leadpage: number = 1;
    totalLeads: number = 0;
    leadlimit: number = 10;
    hasMoreLeads: boolean = false;
    dateFormat: string = '';
    timeZone: string = '';
    leadIdArray: any[] = [];
    editFirstIndex: boolean = false;
    selectList: string = '';
    leadSourceList: Array<any> = [];
    assineesList: Array<any> = [];
    countriesList: Array<any> = [];
    statesList: Array<any> = [];
    style!: { fill: string; };
    color!: string;
    background!: { background: string; };
    colorSubs!: Subscription;
    CheckBoxCondition: boolean = false;
    CheckBoxCondition2: boolean = false;


    constructor(
        private fb: FormBuilder,
        private commonService: CommonService,
        private apiService: ApiService,
        private router: Router,
        private authService: AuthService,
        private route: ActivatedRoute,
        private modalService: NgbModal,
        private calendar: NgbCalendar,
        public formatter: NgbDateParserFormatter,
    ) { }

    ngOnInit(): void {

        this.getLeadOptions();
        this.getAssignedOptions();
        this.initSetPropertyForm();
        this.getUserDetails();
        this.getCountries();
        let queryParams = this.route.snapshot.queryParams;
        if (queryParams && queryParams['name'] &&  queryParams['list']) {
            this.dripCampaignName = queryParams['name'];
            this.selectList = queryParams['list'];
            this.getLeadList();
        } else {
            this.commonService.showError('');
        }
        this.maxDate = this.calendar.getToday();
    }
     ngDoCheck():void {
        
        this.getPaginationList();
        this.getDateColor();
    }
    // custom datepicker color


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
    initSetPropertyForm() {
        this.setPropertyForm = this.fb.group({
            proprtyToSet: ['', [Validators.required]],
            leadStatus: [null],
            leadSource: [null],
            assignedTo: [null],
            ownerName: [''],
            companyName: [''],
            date: [''],
            leadNo: [''],
            state: [null],
            country: [null]
        })
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

    
    async getCountries() {
        try {
            this.commonService.showSpinner();
            const res$ = this.apiService.getReq(API_PATH.COUNTRIES_LIST, '', '');
            let response = await lastValueFrom(res$);
            if (response && response.data) {
                this.countriesList = response.data;
                let i = this.countriesList.findIndex((e: any) => e.name === "United States");
                if (i > -1) {
                    this.setPropertyForm.get('country')?.patchValue(this.countriesList[i].id);
                    this.getStates(this.countriesList[i].id);
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

    /**
     * @description get states list
     * @param country_id 
     * @author Shine Dezign Infonet Pvt. Ltd.
     */
    async getStates(country_id: string) {
        try {
            this.commonService.showSpinner();
            const res$ = this.apiService.postReq(API_PATH.STATES, { country_id: country_id }, '', '');
            let response = await lastValueFrom(res$);
            if (response && response.data) {
                this.statesList = response.data;
                this.setPropertyForm.patchValue({ state: '' });
               
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
    onCountryChange(countryId: any): void {
        this.getStates(countryId);

    }
    async getAssignedOptions() {
        try {
            this.commonService.showSpinner();
            const res$ = this.apiService.getReq(API_PATH.LIST_FOR_USERS, 'user', 'list');
            let response = await lastValueFrom(res$);
            if (response && response.data) {
                this.assineesList = response.data;   
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

    async getLeadOptions() {
        try {
            this.commonService.showSpinner();
            const res$ = this.apiService.getReq(API_PATH.LEAD_OPTIONS_LIST, '', '');
            let response = await lastValueFrom(res$);
            if (response && response.data) {
                this.leadSourceList = response.data.lead_source;
                this.leadSourceList.sort((a, b) => a.name.localeCompare(b.name))
                this.leadStatusList = response.data.status;
                this.leadStatusList.sort((a, b) => a.name.localeCompare(b.name))
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
    //  this.setPropertyForm.patchValue({
    //         leadStatus: null,
    //         ownerName: '',
    //         companyName: '',
    //         leadNo: '',
    //         date: '',
    //         proprtyToSet: ''
    //     })
        // this.setPropertyForm.get('leadStatus')?.clearValidators();
        // this.setPropertyForm.get('leadStatus')?.updateValueAndValidity();
        // this.setPropertyForm.get('ownerName')?.clearValidators()
        // this.setPropertyForm.get('ownerName')?.updateValueAndValidity();
        // this.setPropertyForm.get('leadNo')?.clearValidators()
        // this.setPropertyForm.get('leadNo')?.updateValueAndValidity();
        // this.setPropertyForm.get('date')?.clearValidators()
        // this.setPropertyForm.get('date')?.updateValueAndValidity();
        // this.setPropertyForm.get('companyName')?.clearValidators()
        // this.setPropertyForm.get('companyName')?.updateValueAndValidity();
   
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
                case Model.STEP.SET_PROPERTY_VALUE:
                    campData.data.status_id = data.status_id;
                    campData.data.status_name = data.status_name;
                    if(this.setPropertyForm.value.proprtyToSet == 'bussiness-state'){
                        campData.data.country_id = data.country_id;
                    }
                
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



    onLeadStatusChange(status: any) {
        this.triggerStatus = status;
    }

    removeStep(index: number, header: any) {
        try {    
            if(header == 'Set property value(Lead Status)'){
                if(this.campaignSteps[0].data.status_id != this.setPropertyForm.value.leadStatus){
                    this.setPropertyForm.patchValue({
                        leadStatus: null
                    })
            
                }
                this.campaignSteps.splice(index, 1);
                this.getLeadList();
               this.setPropertyForm.get('leadStatus')?.clearValidators()
               this.setPropertyForm.get('leadStatus')?.updateValueAndValidity();
            }  else   if(header == 'Set property value(Lead Source)'){
                if(this.campaignSteps[0].data.status_id != this.setPropertyForm.value.leadSource){
                this.setPropertyForm.patchValue({
                    leadSource: null
                })
            }
                this.campaignSteps.splice(index, 1);
                this.getLeadList();
                this.setPropertyForm.get('leadSource')?.clearValidators()
                this.setPropertyForm.get('leadSource')?.updateValueAndValidity();
            }
            else   if(header == 'Set property value(Assigned To)'){
                if(this.campaignSteps[0].data.status_id != this.setPropertyForm.value.assignedTo){
                    this.setPropertyForm.patchValue({
                        assignedTo: null
                    })
                }
              
                this.campaignSteps.splice(index, 1);
                this.getLeadList();
                this.setPropertyForm.get('assignedTo')?.clearValidators()
                this.setPropertyForm.get('assignedTo')?.updateValueAndValidity();
            }
            else   if(header == 'Set property value(Bussiness State)'){
                if(this.campaignSteps[0].data.status_id != this.setPropertyForm.value.state){
                    this.setPropertyForm.patchValue({
                        state: ''
                    })
                }
                this.campaignSteps.splice(index, 1);
                this.getLeadList();
                this.setPropertyForm.get('state')?.clearValidators()
                this.setPropertyForm.get('state')?.updateValueAndValidity();
            }
            else if(header == 'Set property value(Company Name)'){
                
                this.setPropertyForm.patchValue({
                    companyName: ''
                })
                this.campaignSteps.splice(index, 1);
                this.getLeadList();
        this.setPropertyForm.get('companyName')?.clearValidators()
        this.setPropertyForm.get('companyName')?.updateValueAndValidity();
            }else   if(header == 'Set property value(Created By)'){
                this.setPropertyForm.patchValue({
                    ownerName: ''
                })
                this.campaignSteps.splice(index, 1);
                this.getLeadList();
                this.setPropertyForm.get('ownerName')?.clearValidators()
                this.setPropertyForm.get('ownerName')?.updateValueAndValidity();
            }else   if(header == 'Set property value(Lead No)'){
                this.setPropertyForm.patchValue({
                    leadNo: ''
                })
                this.campaignSteps.splice(index, 1);
                this.getLeadList();
                this.setPropertyForm.get('leadNo')?.clearValidators()
                this.setPropertyForm.get('leadNo')?.updateValueAndValidity();
            }else   if(header == 'Set property value(Date)'){
                this.setPropertyForm.patchValue({
                    date: ''
                })
                this.campaignSteps.splice(index, 1);
                this.getLeadList(); 
                this.setPropertyForm.get('date')?.clearValidators()
                this.setPropertyForm.get('date')?.updateValueAndValidity();
            }

        } catch (error) {

        }
    }

    onPopertyToSetChange() {
        // this.setPropertyForm.get('ownerName')?.clearValidators()
        // this.setPropertyForm.get('ownerName')?.updateValueAndValidity();
        // this.setPropertyForm.get('companyName')?.clearValidators()
        // this.setPropertyForm.get('companyName')?.updateValueAndValidity();
        // this.setPropertyForm.get('leadNo')?.clearValidators()
        // this.setPropertyForm.get('leadNo')?.updateValueAndValidity();
        // this.setPropertyForm.get('date')?.clearValidators()
        // this.setPropertyForm.get('date')?.updateValueAndValidity();
    }
    openSetPropertyPopup(){
        if(this.setPropertyForm.value.leadStatus == ''){
            this.setPropertyForm.get('leadStatus')?.clearValidators();
            this.setPropertyForm.get('leadStatus')?.updateValueAndValidity();
        }else if(this.setPropertyForm.value.leadSource == ''){
            this.setPropertyForm.get('leadSource')?.clearValidators();
            this.setPropertyForm.get('leadSource')?.updateValueAndValidity();
        }else if(this.setPropertyForm.value.assignedTo == ''){
            this.setPropertyForm.get('assignedTo')?.clearValidators();
            this.setPropertyForm.get('assignedTo')?.updateValueAndValidity();
        }
        else if(this.setPropertyForm.value.ownerName == ''){
            this.setPropertyForm.get('ownerName')?.clearValidators();
            this.setPropertyForm.get('ownerName')?.updateValueAndValidity();
        }else if(this.setPropertyForm.value.companyName == ''){
            this.setPropertyForm.get('companyName')?.clearValidators();
            this.setPropertyForm.get('companyName')?.updateValueAndValidity();
        }else if(this.setPropertyForm.value.leadNo == ''){
            this.setPropertyForm.get('leadNo')?.clearValidators();
            this.setPropertyForm.get('leadNo')?.updateValueAndValidity();
        }else if(this.setPropertyForm.value.date == ''){
            this.setPropertyForm.get('date')?.clearValidators();
            this.setPropertyForm.get('date')?.updateValueAndValidity();
        }else if(this.setPropertyForm.value.country == '' ||  this.setPropertyForm.value.state == '' ){
            this.setPropertyForm.get('country')?.clearValidators();
            this.setPropertyForm.get('country')?.updateValueAndValidity();
            this.setPropertyForm.get('state')?.clearValidators();
            this.setPropertyForm.get('state')?.updateValueAndValidity();
        }
        this.editFirstIndex = false;
        this.popUps.setPropertyValue = true;
    }

    async onEndClick() {
        try {
            if (this.campaignSteps.length < 1) {
                this.commonService.showError('Please complete required steps before proceeding');
                return;
            }
                  //sbmit data
                  for (let i = 0; i< this.campaignSteps.length; i++) {
                 let text =   this.campaignSteps[i].header_text.toString().replace("Set property value","");
                    let text2 = text.toString().replace(/[()]/g, '');
                    this.campaignSteps[i].header_text = text2
                    }
                    let data = {
                        name: this.dripCampaignName,
                        select_list: this.selectList,
                        leadCompaignStep: this.campaignSteps,
                        // leadList: this.leadList
                    }
                    this.commonService.showSpinner();
                    const res$ = this.apiService.postReq(API_PATH.LIST_ADD, data, 'list', 'add');
                    let response = await lastValueFrom(res$);
                    if (response) {
                        this.commonService.showSuccess(response.message);
                        this.router.navigate([`/${this.userBaseRoute}/list`]);
                    }
                    this.commonService.hideSpinner();
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
            select_list: ['active',  [
                Validators.required,]],
        })
        if(this.dripCampaignNameForm.value.select_list == 'active'){
            this.CheckBoxCondition = true;
            }else{
                this.CheckBoxCondition = false;
            }
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
                select_list: this.selectList,
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
            this.selectList = this.dripCampaignNameForm.value.select_list;
            this.closeModal();
            this.getLeadList();
        }
    }
    setPropertySave() {
        try {
            this.setPropertyForm.markAllAsTouched();
            this.setPropertyForm.value.date = this.selectedDate;
            if (this.setPropertyForm.value.proprtyToSet === 'lead-status') {
                this.setPropertyForm.get('leadStatus')?.setValidators([Validators.required])
                this.setPropertyForm.get('leadStatus')?.updateValueAndValidity();
            } else  if (this.setPropertyForm.value.proprtyToSet === 'lead-source') {
                this.setPropertyForm.get('leadSource')?.setValidators([Validators.required])
                this.setPropertyForm.get('leadSource')?.updateValueAndValidity();
            }else  if (this.setPropertyForm.value.proprtyToSet === 'assigned-to') {
                this.setPropertyForm.get('assignedTo')?.setValidators([Validators.required])
                this.setPropertyForm.get('assignedTo')?.updateValueAndValidity();
            }
            else  if (this.setPropertyForm.value.proprtyToSet === 'bussiness-state') {
                this.setPropertyForm.get('state')?.setValidators([Validators.required])
                this.setPropertyForm.get('state')?.updateValueAndValidity();
                this.setPropertyForm.get('country')?.setValidators([Validators.required])
                this.setPropertyForm.get('country')?.updateValueAndValidity();
            }
            else if (this.setPropertyForm.value.proprtyToSet === 'owner-name') {
                this.setPropertyForm.get('ownerName')?.setValidators([Validators.required, Validators.pattern(Custom_Regex.spaces),
                Validators.pattern(Custom_Regex.lettersOnly), Validators.maxLength(100),
                Validators.minLength(3)
                ])
                this.setPropertyForm.get('ownerName')?.updateValueAndValidity();
            } else if (this.setPropertyForm.value.proprtyToSet === 'company-name') {
                this.setPropertyForm.get('companyName')?.setValidators([Validators.required, Validators.pattern(Custom_Regex.spaces), Validators.pattern(Custom_Regex.lettersOnly), Validators.maxLength(100),
                Validators.minLength(3)
                ])
                this.setPropertyForm.get('companyName')?.updateValueAndValidity();
            } else if (this.setPropertyForm.value.proprtyToSet === 'lead-no') {
                this.setPropertyForm.get('leadNo')?.setValidators([Validators.required, Validators.pattern(Custom_Regex.spaces),
                Validators.pattern(Custom_Regex.digitsOnly), Validators.maxLength(100),
                ])
                this.setPropertyForm.get('leadNo')?.updateValueAndValidity();
            } else if (this.setPropertyForm.value.proprtyToSet === 'date') {
                this.setPropertyForm.get('date')?.setValidators([Validators.required])
                this.setPropertyForm.get('date')?.updateValueAndValidity();
            }

            if (this.setPropertyForm.valid) {
                let data = {
                    status_id: '',
                    status_name: '',
                    header_text: ``,
                    country_id: '',
                    type: this.steps.SET_PROPERTY_VALUE,
                }
                let temp = this.leadStatusList.find((e) => e.id === this.setPropertyForm.value.leadStatus);
                let tempLeadSource = this.leadSourceList.find((e) => e.id === this.setPropertyForm.value.leadSource);
                let tempAssignedTo = this.assineesList.find((e) => e.id === this.setPropertyForm.value.assignedTo);
                let tempBussinessState = this.statesList.find((e) => e.id === this.setPropertyForm.value.state);
                if (this.setPropertyForm.value.proprtyToSet === 'lead-status') {
                    if (temp) {
                        data.status_id = this.setPropertyForm.value.leadStatus,
                        data.status_name = temp.name;
                        data.header_text = `Set property value(Lead Status)`;
                        // data.status_id = this.setPropertyForm.value.leadStatus;
                    }
                } else if (this.setPropertyForm.value.proprtyToSet === 'lead-source') {
                    if (tempLeadSource) {
                        data.status_id = this.setPropertyForm.value.leadSource,
                        data.status_name = tempLeadSource.name;
                        data.header_text = `Set property value(Lead Source)`;
                    }

                }  else if (this.setPropertyForm.value.proprtyToSet === 'assigned-to') {
                    if (tempAssignedTo) {
                        data.status_id = this.setPropertyForm.value.assignedTo,
                        data.status_name = tempAssignedTo.name;
                        data.header_text = `Set property value(Assigned To)`;
                    }

                } else if (this.setPropertyForm.value.proprtyToSet === 'owner-name') {
                    data.status_name = this.setPropertyForm.value.ownerName;
                    data.header_text = `Set property value(Created By)`;

                }else if (this.setPropertyForm.value.proprtyToSet === 'bussiness-state') {
                    if (tempBussinessState) {
                    data.status_id = this.setPropertyForm.value.state,
                    data.status_name = tempBussinessState.name;
                    data.country_id = this.setPropertyForm.value.country,
                    data.header_text = `Set property value(Bussiness State)`;
                    }

                }
                else if (this.setPropertyForm.value.proprtyToSet === 'company-name') {
                    data.status_name = this.setPropertyForm.value.companyName;
                    data.header_text = `Set property value(Company Name)`;
                } else if (this.setPropertyForm.value.proprtyToSet === 'lead-no') {
                    data.status_name = this.setPropertyForm.value.leadNo;
                    data.header_text = `Set property value(Lead No)`;
                } else if (this.setPropertyForm.value.proprtyToSet === 'date') {
                    data.status_name = this.setPropertyForm.value.date;
                    data.header_text = `Set property value(Date)`;
                }   
               if(this.campaignSteps.length && this.editFirstIndex == true){
                if(this.setPropertyForm.value.proprtyToSet == 'bussiness-state'){
                    let campData: Model.STEPDATA = {
                        type: data.type,
                        header_text: data.header_text,
                        data: {
                            status_id: data.status_id,
                            status_name: data.status_name,
                            country_id: this.setPropertyForm.value.country,
                        },
                    }
                    this.campaignSteps[0] = campData;
                    
                }else{
                    let campData: Model.STEPDATA = {   type: data.type,
                        header_text: data.header_text,
                        data: {
                            status_id: data.status_id,
                            status_name: data.status_name,
                            country_id: this.setPropertyForm.value.country,
                            
                        },}
                        this.campaignSteps[0] = campData;
                } 
               }else{
                this.addItemToCampaign(this.steps.SET_PROPERTY_VALUE, data);
               }
          
                this.getLeadList();
                this.closeAllModels();
            }
        } catch (error) {

        }
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
                this.setPropertyForm.value.date = this.selectedDate;
                this.setPropertyForm.patchValue({
                    date: this.selectedDate
                })
                //this.onSearch();
            }
        }
    }
    async getLeadList() {
        try {
            let data = {
                list_type: this.selectList,
                list_created_date: "",
                lead_status: this.setPropertyForm.value.leadStatus,
                lead_source: this.setPropertyForm.value.leadSource,
                assigned_to: this.setPropertyForm.value.assignedTo,
                owner_name: this.setPropertyForm.value.ownerName,
                company_name: this.setPropertyForm.value.companyName,
                lead_no: this.setPropertyForm.value.leadNo,
                daterange_filter: this.setPropertyForm.value.date,
                state_id: this.setPropertyForm.value.state,
                page_limit: this.leadlimit,
                page: this.leadpage

            };
            // if(this.setPropertyForm.value.leadStatus) {
            //     data.list_type = this.selectList,
            //     data.list_created_date = "",
            //     data.lead_status = this.setPropertyForm.value.leadStatus
            // } else if(this.setPropertyForm.value.ownerName) {
            //     data.list_type = this.selectList,
            //     data.list_created_date = "",
            //     data.owner_name = this.setPropertyForm.value.ownerName
            // } else if(this.setPropertyForm.value.companyName) {
            //     data.list_type = this.selectList,
            //     data.list_created_date = "",
            //     data.company_name = this.setPropertyForm.value.companyName
            // } else if(this.setPropertyForm.value.date) {
            //     data.list_type = this.selectList,
            //     data.list_created_date = "",
            //     data.daterange_filter = this.setPropertyForm.value.date
            // } else if(this.setPropertyForm.value.leadNo) {
            //     data.list_type = this.selectList,
            //     data.list_created_date = "",
            //     data.lead_no = this.setPropertyForm.value.leadNo
            // }
            this.commonService.showSpinner();
            const res$ = this.apiService.postReq(API_PATH.CAMPAIGN_LEAD_LIST, data, 'lead', 'list');
            let response = await lastValueFrom(res$);
            if (response && response.data) {
                if (response && response.data.data) {
                    this.hasMoreLeads = response.data.hasMorePages;
                    this.totalLeads = response.data.total;
                    this.leadList = response.data.data;
                } else {
                    this.leadList = [];
                    this.hasMoreLeads = false;
                    this.leadpage = 1;
                }

            } else {
                this.leadList = [];
                this.hasMoreLeads = false;
                this.leadpage = 1;
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
    onLeadsPageChange(p: number): void {
        this.leadpage = p;
        this.getLeadList();
    }
    getDate(date: any) {
        return moment(date).tz(this.timeZone).format(`${this.dateFormat} hh:mm:ss A`)
    }
    getUserDetails(): void {
        try {
            let ud = this.authService.getUserDetails();
            if (ud) {
                this.dateFormat = ud.date_format;
                this.timeZone = ud.time_zone;
                this.getColorOnUpdate();
                this.style={fill:ud?.color};
                 this.color=ud?.color;
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

    onCheckingAll(target: any) {
        this.leadIdArray = [];
        for (let i = 0; i < this.leadList.length; i++) {
            this.leadList[i].selected = target.checked;
            if (target.checked) {
                this.leadIdArray.push(this.leadList[i].id);

            }
        }
    }



    onChange(id: any, target: EventTarget | null) {
        const input = target as HTMLInputElement;
        if (input.checked) {
            if (!this.leadIdArray.includes(id)) {
                this.leadIdArray.push(id);
            }
        } else {
            let i = this.leadIdArray.findIndex(x => x === id);
            if (i > -1) {
                this.leadIdArray.splice(i, 1);
            }
        }
    }
    editsetProperty(){ 
        this.editFirstIndex = true;
        if(this.campaignSteps[0].header_text == 'Set property value(Lead Status)'){
            this.setPropertyForm.patchValue({
                proprtyToSet: 'lead-status'
            })
            this.popUps.setPropertyValue = true;
        }else if(this.campaignSteps[0].header_text == 'Set property value(Company Name)'){
            this.setPropertyForm.patchValue({
                proprtyToSet: 'company-name'
            })
            this.popUps.setPropertyValue = true;
        }else if(this.campaignSteps[0].header_text == 'Set property value(Created By)'){
            this.setPropertyForm.patchValue({
                proprtyToSet: 'owner-name'
            })
            this.popUps.setPropertyValue = true;
        }
        else if(this.campaignSteps[0].header_text == 'Set property value(Lead No)'){
            this.setPropertyForm.patchValue({
                proprtyToSet: 'lead-no'
            })
            this.popUps.setPropertyValue = true;
        }
        else if(this.campaignSteps[0].header_text == 'Set property value(Assigned To)'){
            this.setPropertyForm.patchValue({
                proprtyToSet: 'assigned-to'
            })
            this.popUps.setPropertyValue = true;
        }
        else if(this.campaignSteps[0].header_text == 'Set property value(Lead Source)'){
            this.setPropertyForm.patchValue({
                proprtyToSet: 'lead-source'
            })
            this.popUps.setPropertyValue = true;
        }
        else if(this.campaignSteps[0].header_text == 'Set property value(Date)'){
            this.setPropertyForm.patchValue({
                proprtyToSet: 'date'
            })
            this.popUps.setPropertyValue = true;
        }
        else if(this.campaignSteps[0].header_text == 'Set property value(Bussiness State)'){
            this.setPropertyForm.patchValue({
                proprtyToSet: 'bussiness-state'
            })
            this.popUps.setPropertyValue = true;
        }
    }
    oncheckBox(e:any){
        let data = e.target.value;
        if(data == 'active'){
        this.CheckBoxCondition = true;
        }else{
            this.CheckBoxCondition = false;
        }
        if(data == 'static'){
            this.CheckBoxCondition2 = true;
        }else{
            this.CheckBoxCondition2 = false;
        }
        
      
      }

}

