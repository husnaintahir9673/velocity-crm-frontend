import { Component, OnInit } from '@angular/core';
import { API_PATH } from '@constants/api-end-points';
import { ApiService } from '@services/api.service';
import { AuthService } from '@services/auth.service';
import { CommonService } from '@services/common.service';
import { lastValueFrom } from 'rxjs';
import * as Constants from '@constants/constants';

@Component({
    selector: 'app-dashboard-cards',
    templateUrl: './dashboard-cards.component.html',
    styleUrls: ['../../styles/dashboard.scss','./dashboard-cards.component.scss']
})
export class DashboardCardsComponent implements OnInit {
    dashboardData: any = {};
    roles = Constants.Roles;
    userRole: string = '';
    canListLead: boolean = false;
    viewfundedCount: boolean = false;
    viewdeclinedCount: boolean = false;
    viewUserCount: boolean = false;
    viewactiveLeadsCount: boolean = false;
    viewtotalLeadCount: boolean = false;
    viewappOutCount: boolean = false;
    viewdocsInCount: boolean = false;
    viewsubmittedCount: boolean = false;
    viewapprovedCount: boolean = false;
    viewcontractOutCount: boolean = false;
    viewcontractInCount: boolean = false;

    constructor(
        private authService: AuthService,
        private commonService: CommonService,
        private apiService: ApiService) { }

    ngOnInit(): void {
        this.getUserDetails();
        this.canListLead = this.authService.hasPermission('lead-list');
        this.getDashboardData();
    }


    async getDashboardData(): Promise<any> {
        try {
            this.commonService.showSpinner();
            const res$ = this.apiService.getReq(API_PATH.DASHBOARD, '', '');
            let response = await lastValueFrom(res$);
            if (response && response.data) {
                this.dashboardData = response.data;

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
                this.userRole = ud.role;
                for (let i = 0; i < ud.manage_card_permission.length; i++) {
                   if(ud.manage_card_permission[i].permission_name == 'funded-leads-count'){
                       this.viewfundedCount= ud.manage_card_permission[i].is_required
                   }else  if(ud.manage_card_permission[i].permission_name == 'declined-leads-count'){
                    this.viewdeclinedCount = ud.manage_card_permission[i].is_required
                }else  if(ud.manage_card_permission[i].permission_name == 'total-users-count'){
                    this.viewUserCount = ud.manage_card_permission[i].is_required
                }else  if(ud.manage_card_permission[i].permission_name == 'active-leads-count'){
                    this.viewactiveLeadsCount = ud.manage_card_permission[i].is_required
                }else  if(ud.manage_card_permission[i].permission_name == 'total-leads-count'){
                    this.viewtotalLeadCount = ud.manage_card_permission[i].is_required
                }  else  if(ud.manage_card_permission[i].permission_name == 'app-out-leads-count'){
                    this.viewappOutCount = ud.manage_card_permission[i].is_required
                } else  if(ud.manage_card_permission[i].permission_name == 'docs-in-leads-count'){
                    this.viewdocsInCount = ud.manage_card_permission[i].is_required
                }  else  if(ud.manage_card_permission[i].permission_name == 'submitted-leads-count'){
                    this.viewsubmittedCount = ud.manage_card_permission[i].is_required
                } else  if(ud.manage_card_permission[i].permission_name == 'approved-leads-count'){
                    this.viewapprovedCount = ud.manage_card_permission[i].is_required
                } else  if(ud.manage_card_permission[i].permission_name == 'contract-out-leads-count'){
                    this.viewcontractOutCount = ud.manage_card_permission[i].is_required
                }else  if(ud.manage_card_permission[i].permission_name == 'contract-in-leads-count'){
                    this.viewcontractInCount = ud.manage_card_permission[i].is_required
                }
                    
                }
                
            }
        } catch (error: any) {
            this.commonService.showError(error.message);
        }
    }
    get userBaseRoute() {
        return this.authService.getUserRole().toLowerCase();
    }

}
