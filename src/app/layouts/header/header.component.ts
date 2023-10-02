import { Component, ElementRef, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { AuthService } from '@services/auth.service';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import * as Model from '@interfaces/common.interface';
import { CommonService } from '@services/common.service';
import { SETTINGS, Roles } from '@constants/constants';
import { Router } from '@angular/router';
import { ApiService } from '@services/api.service';
import { API_PATH } from '@constants/api-end-points';
import { debounceTime, distinctUntilChanged, filter, fromEvent, lastValueFrom, Subscription, switchMap, tap } from 'rxjs';
import { FormBuilder, FormGroup } from '@angular/forms';

@Component({
    selector: 'app-header',
    templateUrl: './header.component.html',
    styleUrls: ['./header.component.scss', '../../styles/dashboard.scss', '../../styles/predictive-search.scss']
})
export class HeaderComponent implements OnInit {

    modal!: NgbModalRef;
    userNameSubs: Subscription | any;
    logoSubs: Subscription | any;
    username: string = '';
    colorSubs: Subscription | any;
    companySubs: Subscription | any;
    logoUpdate: string = '';
    userDetails!: Model.UserDetails;
    roles = Roles;
    searchList: Array<any> = [];
    searchedValue: string = '';
    searchType: string = 'Lead';
    type: string = 'lead';
    canViewReports: boolean = false;
    predictiveSearchResults: Array<any> = [];
    @ViewChild('predictiveSearch', { static: false }) predictiveSearch!: ElementRef;
    canUpdateProfile: boolean = false;
    canChangePassword: boolean = false;
    canViewEmailTemplatesList: boolean = false;
    canViewEmailConfigurations: boolean = false;
    canViewHeaderSearch: boolean = false;
    canViewTeamList: boolean = false;
    canLenderOfferForm: boolean = false;
    canViewDripCampaignList: boolean = false;
    canViewPayrollList: boolean = false;
    isMenuCollapsed = true;
    canViewDocumentsList: boolean = false;
    canViewLeadList: boolean = false;
    predictiveSearchId: string = '';
    canViewList: boolean = false;
    colorForm!: FormGroup;
    style!: { fill: string; };
    stroke!: { stroke: string; };
    background!: { background: string; };
    link!: { color: string; };
    color: string = '#fa5440';
    canViewAgentList: boolean = false;
    companyType: string = '';
    flag: boolean = true;
    panelOpenState = false;
    tabType: string = "";
    canViewSystemList: boolean = false;
    canViewLenderList: boolean = false;
    canViewLeadSourceList: boolean = false;
    canViewUserList: boolean = false;
    canViewManageCards: boolean = false;
    managePermission: Array<any> = [];
    canViewSyndicateList: boolean = false;
    canViewLeadStatusList: boolean = false;
    canViewBusinessTypeList: boolean = false;

    constructor(
        private authService: AuthService,
        private modalService: NgbModal,
        private router: Router,
        private commonService: CommonService,
        private apiService: ApiService,
        private fb: FormBuilder
    ) { }

    ngOnInit(): void {
        this.inintColorForm();
        this.getUserDetails();
        this.canUpdateProfile = this.authService.hasPermission('profile-update');
        this.canChangePassword = this.authService.hasPermission('password-update');
        this.canViewEmailTemplatesList = this.authService.hasPermission('email-template-list');
        this.canViewEmailConfigurations = this.authService.hasPermission('email-configuration-view');
        this.canViewHeaderSearch = this.authService.hasPermission('header-search');
        this.canViewTeamList = this.authService.hasPermission('team-list');
        this.canLenderOfferForm = this.authService.hasPermission('lender-offer-form-field');
        this.canViewReports = this.authService.hasPermission('report-list');
        this.canViewDripCampaignList = this.authService.hasPermission('campaign-list');
        this.canViewDocumentsList = this.authService.hasPermission('document-list');
        this.canViewPayrollList = this.authService.hasPermission('payroll-list');
        this.canViewLeadList = this.authService.hasPermission('lead-list');
        this.canViewList = this.authService.hasPermission('list-lists');
        this.canViewAgentList = this.authService.hasPermission('agent-list');
        this.canViewSystemList = this.authService.hasPermission('system-notification-list');
        this.canViewLenderList = this.authService.hasPermission('lender-list');
        this.canViewLeadSourceList = this.authService.hasPermission('lead-source-list');
        this.canViewUserList = this.authService.hasPermission('user-list');
        this.canViewManageCards = this.authService.hasPermission('manage-cards');
        this.canViewSyndicateList = this.authService.hasPermission('syndicate-list');
        this.canViewLeadStatusList = this.authService.hasPermission('lead-status-list');
        this.canViewBusinessTypeList = this.authService.hasPermission('business-type-list');

    }
    clickOntab(tab: any) {
        if (this.tabType != "" && this.tabType === tab) {
            this.panelOpenState = false;
            this.tabType = "";
        } else {
            this.panelOpenState = true;
            this.tabType = tab;
        }
    }


    onimgerror(ref: any) {
        if (ref) {
            ref.src = 'assets/images/logo.png'
        }
    }

    /**
     * @description get logged in user details
     * @author Shine Dezign Infonet Pvt. Ltd.
     */
    getUserDetails() {
        let ud = this.authService.getUserDetails();
        if (ud) {
            this.userDetails = ud;
            this.username = `${this.userDetails.name}`;
            this.logoUpdate = `${this.userDetails?.logoImage}`;
            this.managePermission = ud.manage_card_permission;
            this.getUserNameOnUpdate();
            this.getColorOnUpdate();
            this.style = { fill: this.userDetails?.color };
            this.color = this.userDetails?.color;
            this.stroke = { stroke: this.userDetails?.color };
            this.background = { background: this.userDetails?.color };
            this.link = { color: this.userDetails?.color };
            this.companyType = `${this.userDetails?.company_type}`;
            // this.link={background:this.userDetails.color,
            // color:this.userDetails.color}
            // let ele = document.getElementsByClassName('.nav-link.active')
            // console.log(ele,'test');

            // let myElement = document.getElementsByTagName('path')
            // for (let i = 0; i < myElement.length; i++) {
            //     myElement[i].style.fill = this.userDetails.color

            // }
            // console.log(this.userDetails.color,'test');
            // default project color = #fa5440    

            this.colorForm.patchValue({ color: this.userDetails?.color });
        }
    }
    getUserNameOnUpdate() {
        this.userNameSubs = this.authService.getUserName().subscribe((u) => {
            this.getUserDetails();
        });
    }
    getColorOnUpdate() {
        this.colorSubs = this.authService.getColor().subscribe((u) => {
            this.getUserDetails();
        });
    }

    getLogoUpdate() {
        this.logoSubs = this.authService.getLogo().subscribe((u) => {
            this.logoUpdate = u;
            this.getUserDetails();
        });
    }


    /**
     * @description open modal
     * @param modal 
     * @author Shine Dezign Infonet Pvt. Ltd.
     */
    openModal(modal: TemplateRef<any>, modalType: string = '') {
        let options: any = {
            backdrop: 'static',
        }
        switch (modalType) {
            case 'edit-profile':
                options.size = 'lg'
                break;

            default:
                break;
        }
        this.modal = this.modalService.open(modal, options)
    }

    /**
     * @description close modal
     * @author Shine Dezign Infonet Pvt. Ltd.
     */
    closeModal() {
        this.modal.close();
    }
    async getSearchOptions() {
        // if (this.searchedValue && this.searchType == 'Lead') {
        if (this.searchType == 'Lead') {
            switch (this.userDetails.role) {
                case Roles.ADMINISTRATOR:
                    this.router.navigate(['/admin/leads'],
                        { queryParams: { search: this.searchedValue, searchId: this.predictiveSearchId } });
                    break;
                case Roles.COMPANY:
                    this.router.navigate(['/company/leads'],
                        { queryParams: { search: this.searchedValue, searchId: this.predictiveSearchId } });
                    break;
                default:
                    this.router.navigate([`/${this.userRole}`],
                        { queryParams: { search: this.searchedValue, searchId: this.predictiveSearchId } });
                    break;
                // case Roles.UNDERWRITER:
                //     this.router.navigate(['/under-writter'],
                //         { queryParams: { search: this.searchedValue } });
                //     break;
                // case Roles.BRANCHMANAGER:
                //     this.router.navigate(['/branchmanager'],
                //         { queryParams: { search: this.searchedValue } });
                //     break;
                // default:
                //     break;
            }


        }
        // else if (this.searchedValue && this.searchType == 'Company') {
        else if (this.searchType == 'Company') {
            switch (this.userDetails.role) {
                case Roles.ADMINISTRATOR:
                    this.router.navigate(['/admin/company'],
                        { queryParams: { search: this.searchedValue, searchId: this.predictiveSearchId } });
                    break;
                default:
                    break;
            }

        }
        // else if (this.searchedValue && this.searchType == 'User') {
        // this.searchedValue &&
        else if (this.searchType == 'User') {
            switch (this.userDetails.role) {
                case Roles.ADMINISTRATOR:
                    this.router.navigate(['/admin/users'],
                        { queryParams: { search: this.searchedValue, searchId: this.predictiveSearchId } });
                    break;
                case Roles.COMPANY:
                    this.router.navigate(['/company/user'],
                        { queryParams: { search: this.searchedValue, searchId: this.predictiveSearchId } });
                    break;
                default:
                    break;
            }

        }

    }


    ngAfterViewInit() {
        fromEvent(this.predictiveSearch.nativeElement, 'keyup').pipe(
            tap(() => {
                if (!this.predictiveSearch.nativeElement.value) {
                    this.predictiveSearchResults = [];
                }
            }),
            filter(() => this.predictiveSearch.nativeElement.value && this.predictiveSearch.nativeElement.value.length > 0),
            debounceTime(200),
            distinctUntilChanged(),
            switchMap(() => this.apiService.postReq(API_PATH.PREDICTIVE_SEARCH, { search: this.predictiveSearch.nativeElement.value, records_per_search: 500, type: this.type }, this.type, 'list'))
        ).subscribe((res) => {
            if (res && res.status_code == "200") {
                this.predictiveSearchResults = res.data;


            } else {
                this.predictiveSearchResults = [];
            }
        })
    }
    onChangeSearchType(value: any) {
        if (value == 'Lead') {
            this.type = 'lead';
        } else if (value == 'Company') {
            this.type = 'company';
        } else {
            this.type = 'user';
        }
        if (this.searchedValue && value == 'Lead') {
            this.type = 'lead';
            switch (this.userDetails.role) {
                case Roles.ADMINISTRATOR:
                    this.router.navigate(['/admin/leads'],
                        { queryParams: { search: this.searchedValue, searchId: this.predictiveSearchId } });
                    break;
                case Roles.COMPANY:
                    this.router.navigate(['/company/leads'],
                        { queryParams: { search: this.searchedValue, searchId: this.predictiveSearchId } });
                    break;
                default:
                    this.router.navigate([`/${this.userRole}`],
                        { queryParams: { search: this.searchedValue, searchId: this.predictiveSearchId } });
                    break;
                // case Roles.UNDERWRITER:
                //     this.router.navigate(['/under-writter'],
                //         { queryParams: { search: this.searchedValue } });
                //     break;
                // case Roles.BRANCHMANAGER:
                //     this.router.navigate(['/branchmanager'],
                //         { queryParams: { search: this.searchedValue } });
                //     break;
                // default:
                //     break;
            }
        } else if (this.searchedValue && value == 'Company') {
            this.type = 'company';
            switch (this.userDetails.role) {
                case Roles.ADMINISTRATOR:
                    this.router.navigate(['/admin/company'],
                        { queryParams: { search: this.searchedValue, searchId: this.predictiveSearchId } });
                    break;
                default:
                    break;
            }

        } else if (this.searchedValue && value == 'User') {
            this.type = 'user';

            switch (this.userDetails.role) {
                case Roles.ADMINISTRATOR:
                    this.router.navigate(['/admin/users'],
                        { queryParams: { search: this.searchedValue, searchId: this.predictiveSearchId } });
                    break;
                case Roles.COMPANY:
                    this.router.navigate(['/company/user'],
                        { queryParams: { search: this.searchedValue, searchId: this.predictiveSearchId } });
                    break;
                default:
                    break;
            }

        }

    }
    /**
     * @description logout user
     * @author Shine Dezign Infonet Pvt. Ltd.
     */
    async logout() {
        try {
            this.commonService.showSpinner();
            const res$ = this.apiService.postReq(API_PATH.LOGOUT, {}, '', '');
            let response = await lastValueFrom(res$);
            this.commonService.hideSpinner();
            this.commonService.showSuccess(response.message);
        } catch (error: any) {
            this.commonService.hideSpinner();
            if (error.error && error.error.message) {
                this.commonService.showError(error.error.message);
            } else {
                this.commonService.showError(error.message);
            }
        }
        localStorage.removeItem(SETTINGS.TOKEN_KEY);
        localStorage.removeItem(SETTINGS.USER_DETAILS);
        this.router.navigate(['/login']);
    }

    comingSoonMessage() {
        this.commonService.showError("You don't have access to open this module!");
    }

    get userRole() {
        return this.authService.getUserRole();
    }
    get userBaseRoute() {
        return this.authService.getUserRole().toLowerCase();
    }

    inintColorForm() {
        this.colorForm = this.fb.group({
            color: ['#FA5440']
        })
    }
    openModalcolor(templateRef: TemplateRef<any>) {
        // this.closeTriggerModal();
        // this.emailTemplateId = id
        try {
            this.modal = this.modalService.open(templateRef, { backdrop: 'static', size: 'md' });
            //   this.inintColorForm();
        } catch (error: any) {
            this.commonService.showError(error.message);
        }
    }
    closeColorModal() {
        this.modal.close();
    }

    async colorPickerSubmit(): Promise<void> {
        try {
            this.commonService.showSpinner();
            let data = {
                primary_color: this.colorForm.value.color
            }
            const res$ = this.apiService.postReq(API_PATH.UPDATE_COLOR, data, '', '');
            let response = await lastValueFrom(res$);
            if (response.api_response == 'success') {
                this.commonService.showSuccess(response.message);
                this.updateColorSession();
                this.closeColorModal();
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
    updateColorSession(): void {
        try {
            let ud = this.authService.getUserDetails();
            if (ud) {
                let user = {
                    ...ud,
                    color: this.colorForm.value.color,
                }
                const en = this.authService.encrypt(JSON.stringify(user));
                localStorage.setItem(SETTINGS.USER_DETAILS, en);
                this.authService.setColor(`${this.colorForm.value.color}`)
                localStorage.setItem(SETTINGS.USER_DETAILS, en);

            }
        } catch (error: any) {
            this.commonService.showError(error.message);
        }
    }

}
