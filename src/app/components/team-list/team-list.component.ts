import { Component, ElementRef, OnInit,ViewChild } from '@angular/core';
import { API_PATH } from '@constants/api-end-points';
import { NgbDateParserFormatter } from '@ng-bootstrap/ng-bootstrap';
import { ApiService } from '@services/api.service';
import { AuthService } from '@services/auth.service';
import { CommonService } from '@services/common.service';
import moment from 'moment';
import { lastValueFrom, Subscription, } from 'rxjs';

@Component({
    selector: 'app-team-list',
    templateUrl: './team-list.component.html',
    styleUrls: ['./team-list.component.scss', '../../styles/dashboard.scss', '../../styles/predictive-search.scss']
})
export class TeamListComponent implements OnInit {
    
    teamList: Array<any> = [];
    userListPage: number = 1;
    hasMoreUsers: boolean = false;
    usersListLimit: number = 10;
    totalUsersCount: number = 0;
    userId: string = '';
    passwordType: boolean = true;
    confirmpasswordType: boolean = true
    @ViewChild('datepicker') datepicker: any;
    predictiveSearchResults: Array<any> = [];
    @ViewChild('predictiveSearch', { static: false }) predictiveSearch!: ElementRef;
    canEditTeam: boolean = false;
    canCreateTeam: boolean = false;
    canDeleteTeam: boolean = false;
    dateFormat: string = '';
    timeZone: string = ''
    color!: string;
    style!: { fill: string; };
    background!: { background: string; };
    colorSubs!: Subscription;
    search = {
        order:'DESC',
        sortby:'created_at'
    }

    constructor(
        private commonService: CommonService,
        private apiService: ApiService,
        public formatter: NgbDateParserFormatter,
        private authService: AuthService
    ) { }

    ngOnInit(): void {            
        this.getUsersList();
        this.getUserDetails();
        this.canEditTeam = this.authService.hasPermission('team-edit');
        this.canCreateTeam = this.authService.hasPermission('team-create');   
        this.canDeleteTeam = this.authService.hasPermission('team-delete');
       
    }
    ngDoCheck():void {
        
        this.getPaginationList();
    }

    getUserDetails(): void {
        try {
            let ud = this.authService.getUserDetails();
            if (ud) {
              this.dateFormat = ud.date_format;
              this.timeZone = ud.time_zone;
              this.color = ud?.color
              this.getColorOnUpdate();
                this.style={fill:ud?.color};
            //  this.color=ud?.color;
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
    getDate(date: any){
        return moment(date).tz(this.timeZone).format(`${this.dateFormat} hh:mm:ss A`)
    }
    /**
    * @description get users list eg company list if adminisrator is logged in
    */
    async getUsersList(): Promise<any> {
        try {
            let url = `?sort_by=${this.search.sortby}&dir=${this.search.order}&page_limit=${this.usersListLimit}&page=${this.userListPage}`;
            this.commonService.showSpinner();
            const res$ = this.apiService.getReq(API_PATH.TEAM_LIST + url, 'team', 'list');
            let response = await lastValueFrom(res$);
            if (response.data && response.data.data) {
                this.hasMoreUsers = response.data.hasMorePages;
                this.totalUsersCount = response.data.total;
                this.teamList = response.data.data;
                
            } else {
                this.teamList = [];
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


    /**
     * @description on limit change
     * @param value 
     * @returns {void}
     * @author Shine Dezign Infonet Pvt. Ltd.
     */
    onUsersLimitChange(value: number): void {
        this.usersListLimit = value;
        this.userListPage = 1;
        this.getUsersList();
    }

    /**
  * @description on page change
  * @returns {void}
  * @param p 
  */
    onUserPageChange(p: number): void {
        this.userListPage = p;
        this.getUsersList();
    }

    /**
     * @description delete user after confirmation
     * @param user 
     * @author Shine Dezign Infonet Pvt. Ltd.
     * @returns { Promise<void> }
     */
    async deleteUser(user: any): Promise<void> {
        try {
            this.commonService.showSpinner();
            const res$ = this.apiService.postReq(API_PATH.TEAM_DELETE, { team_id: user.id }, 'team', 'delete');
            let response = await lastValueFrom(res$);
            if (response && response.data) {
                this.teamList = this.teamList.filter((e) => e.id != user.id);
                this.totalUsersCount = this.totalUsersCount - 1;
                this.commonService.showSuccess(response.message);
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

    sortBy(col:string){
    if(!this.teamList.length){
       return;
    }
    if(this.search.sortby === col){
       if(this.search.order === 'ASC'){
          this.search.order = 'DESC'
       }else{
           this.search.order = 'ASC'
       }
    }else{
        this.search.order = 'DESC';
        this.search.sortby = col;
    }
    this.getUsersList();
    }
}

