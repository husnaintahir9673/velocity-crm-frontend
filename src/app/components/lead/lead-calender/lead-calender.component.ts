import { Component, Input, OnInit, TemplateRef } from '@angular/core';
import { endOfDay } from 'date-fns';
import {
    CalendarEvent,
    CalendarView,
    CalendarDateFormatter
} from 'angular-calendar';
import { lastValueFrom, Subject, Subscription } from 'rxjs';
import { ActivatedRoute } from '@angular/router';
import { ApiService } from '@services/api.service';
import { NgbDateParserFormatter, NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { CommonService } from '@services/common.service';
import { API_PATH } from '@constants/api-end-points';
import { CustomDateFormatter } from './custom-date-format';
import * as Constants from '@constants/constants';
import { AuthService } from '@services/auth.service';
import moment from 'moment';

@Component({
    selector: 'app-lead-calender',
    templateUrl: './lead-calender.component.html',
    styleUrls: ['./lead-calender.component.scss'],
    providers: [
        {
            provide: CalendarDateFormatter,
            useClass: CustomDateFormatter,
        },
    ],
})
export class LeadCalenderComponent implements OnInit {
    leadID: string = '';
    view: CalendarView = CalendarView.Month;
    leadActivityList: Array<any> = [];
    CalendarView = CalendarView;
    viewDate: Date = new Date();
    refresh = new Subject<void>();
    events: CalendarEvent[] = [
    ];
    eventData: any
    modal!: NgbModalRef;
    roles = Constants.Roles;
    userRole: string = '';
    canAddActivity: boolean = false;
    dateFormat: string = '';
    timeZone: string = ''
    style!: { fill: string; };
    background!: { background: string; };
    colorSubs!:Subscription;
    color!: string;
    @Input() leadDetails: any = {};


    constructor(
        private apiService: ApiService,
        private route: ActivatedRoute,
        public formatter: NgbDateParserFormatter,
        private commonService: CommonService,
        private modalService: NgbModal,
        private authService: AuthService,
    ) { }

    ngOnInit(): void {
        this.canAddActivity = this.authService.hasPermission('lead-activity-add');
        let params = this.route.snapshot.params;
        if (params && params['id']) {
            this.leadID = params['id'];
            this.getLeadActivitesList();
        } else {
            this.commonService.showError('');
        }
        this.getUserDetails();
    }
    ngDoCheck():void {
        
     this.getData();
    }
    getData(){
    document.getElementsByClassName('cal-cell-row cal-header ng-star-inserted')[0]?.setAttribute('style',`color:${this.color}`);
    document.getElementsByClassName('cal-cell cal-day-cell cal-today cal-in-month ng-star-inserted')[0]?.getElementsByClassName
    ('cal-cell-top ng-star-inserted')[0]?.getElementsByClassName('cal-day-number')[0]?.setAttribute('style',`color:${this.color}`);

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

    getDate(date: any) {
        return moment(date).tz(this.timeZone).format(`${this.dateFormat} hh:mm:ss A`)
    }

    setView(view: CalendarView) {
        this.view = view;
    }

    async getLeadActivitesList() {
        try {
            this.commonService.showSpinner();
            const res$ = this.apiService.postReq(API_PATH.LEAD_ACTIVITIES, { lead_id: this.leadID }, 'lead', 'list');
            let response = await lastValueFrom(res$);
            if (response && response.data.logs) {
                this.events = response.data.logs.map((e: any) => ({
                    start: new Date(e.start_date),
                    end: endOfDay(new Date(e.start_date)),
                    title: e.subject,
                    assigned_to: e.assigned_to,
                    comment: e.comment,
                    event_type: e.event_type,
                    activity_type: e.activity_type,
                    subject: e.subject
                }));
                this.leadActivityList = response.data.logs;
            } else {
                this.leadActivityList = [];
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

    pastEvents(date: Date): boolean {
        var now = new Date();
        now.setHours(0, 0, 0, 0);
        if (date < now) {
            return true
        }
        return false;
    }

    openModal(modal: TemplateRef<any>, data: any) {
        this.eventData = data
        let options: any = {
            backdrop: 'static',
            size: 'lg'
        }
        this.modal = this.modalService.open(modal, options)
    }

    closeModal() {
        this.modal.close();
    }

    get userBaseRoute() {
        return this.authService.getUserRole().toLowerCase();
    }
}
