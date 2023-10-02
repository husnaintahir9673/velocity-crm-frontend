import { ChangeDetectorRef, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { API_PATH } from '@constants/api-end-points';
import * as Constants from '@constants/constants';
import { ApiService } from '@services/api.service';
import { AuthService } from '@services/auth.service';
import { CommonService } from '@services/common.service';
import { lastValueFrom } from 'rxjs';


@Component({
  selector: 'app-global-search',
  templateUrl: './global-search.component.html',
  styleUrls: ['./global-search.component.scss']
})
export class GlobalSearchComponent implements OnInit {
  roles = Constants.Roles;
  userRole: string = '';
  dashboardData: any = {};
  searchList: Array<any> = [];
  searchedValue: any = '';
  leads: any;
  companies: any;
  users: any;
  activeTab: string = 'Leads';
  advanceSearchToggle: boolean = false;

  constructor(
      private authService: AuthService,
      private commonService: CommonService,
      private apiService: ApiService,
      private router : Router,
      private route: ActivatedRoute
  ) { }

  ngOnInit(): void {
        this.route.queryParams
        .subscribe(params => {
          this.searchedValue = params['searchValue'];
          this.getSearchOptions();
        }
      );
      this.getDashboardData();
      this.getUserDetails();
  }
  openLeads(){
    switch (this.userRole) {
      case Constants.Roles.ADMINISTRATOR:
          this.router.navigate(['/admin/leads' ],
          { queryParams: { search: this.searchedValue }});
          break;
      case Constants.Roles.COMPANY:
          this.router.navigate(['/company/leads'],
          { queryParams: { search: this.searchedValue }});
          break;
      case Constants.Roles.SUBMITTER:
          this.router.navigate(['/submitter'] ,
    { queryParams: { search: this.searchedValue }});
          break;
      default:
          break;
  }
  }
  openUserList(){
    switch (this.userRole) {
      case Constants.Roles.ADMINISTRATOR:
          this.router.navigate(['/admin/users' ],
          { queryParams: { search: this.searchedValue }});
          break;
      case Constants.Roles.COMPANY:
          this.router.navigate(['/company/user'],
          { queryParams: { search: this.searchedValue }});
          break;
      default:
          break;
  }

  }
  openCompanyList(){
    switch (this.userRole) {
      case Constants.Roles.ADMINISTRATOR:
          this.router.navigate(['/admin/company' ],
          { queryParams: { search: this.searchedValue }});
          break;
      default:
          break;
  }

  }

  async getSearchOptions() {
    try {
        this.commonService.showSpinner();
        const res$ = this.apiService.getReq(API_PATH.DASHBOARD_SEARCH + `?search=${this.searchedValue}`,'', '');
        let response = await lastValueFrom(res$);
        if (response && response.data) {
            this.searchList = response.data;
            this.leads = response.data.leads;
            this.companies = response.data.companies;
            this.users = response.data.users;
            
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
   * @description get data from api for stats
   * @author Shine Dezign Infonet Pvt. Ltd.
   * @returns {Promise<void>}
   */
  async getDashboardData(): Promise<any> {
      try {
          this.commonService.showSpinner();
          const res$ = this.apiService.getReq(API_PATH.DASHBOARD,'','');
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
          }
      } catch (error: any) {
          this.commonService.showError(error.message);
      }
  }

}
