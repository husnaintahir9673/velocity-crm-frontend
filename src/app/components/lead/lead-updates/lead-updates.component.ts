import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { API_PATH } from '@constants/api-end-points';
import { NgbCalendar, NgbDate, NgbDateParserFormatter, NgbDateStruct } from '@ng-bootstrap/ng-bootstrap';
import { ApiService } from '@services/api.service';
import { AuthService } from '@services/auth.service';
import { CommonService } from '@services/common.service';
import moment from 'moment';
import { lastValueFrom, Subscription } from 'rxjs';

@Component({
    selector: 'app-lead-updates',
    templateUrl: './lead-updates.component.html',
    styleUrls: ['./lead-updates.component.scss']
})
export class LeadUpdatesComponent implements OnInit {
    leadID: string = '';
    updatesList: Array<any> = [];
    search: string = '';
    updatepage: number = 1;
    limit: number = 10;
    total: number = 0;
    selectedDate: string = '';
    hoveredDate: NgbDate | null = null;
    fromDate!: NgbDate | null;
    toDate!: NgbDate | null;
    maxDate!: NgbDateStruct;
    dateFormat: string = '';
    timeZone: string = ''
    @ViewChild('datepicker') datepicker: any;
    style!: { fill: string; };
    background!: { background: string; };
    colorSubs!: Subscription;
    color!: string;
    constructor(
        private route: ActivatedRoute,
        private commonService: CommonService,
        private apiService: ApiService,
        public formatter: NgbDateParserFormatter,
        private calendar: NgbCalendar,
        private authService: AuthService
    ) { }

    ngOnInit(): void {
        this.maxDate = this.calendar.getToday();
        let params = this.route.snapshot.params;
        if (params && params['id']) {
            this.leadID = params['id'];
            this.getLeadUpdates();
        } else {
            this.commonService.showError('');
        }
        this.getUserDetails();

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
    getPaginationList() {
          // change index 0 -> 1
        let data = document.getElementsByClassName('ngx-pagination')[1]?.getElementsByTagName('li');
        for (let i = 0; i < data?.length; i++) {
            if (data[i].className == 'current' || data[i].className == 'current ng-star-inserted' || data[i].className == 'ng-star-inserted current') {
                data[i].style.background = this.color;
            } else {
                data[i].style.background = 'none';

            }
        }




    }

    /**
     * @description get lead updatessss
     */
    async getLeadUpdates() {
        try {
            this.commonService.showSpinner();
            let res$ = this.apiService.postReq(API_PATH.LEAD_UPDATES, { lead_id: this.leadID, search: this.search, page: this.updatepage, dateRange: this.selectedDate }, 'lead', 'list');
            let response = await lastValueFrom(res$);
            if (response && response.status_code == 200) {
                if (response.data.logs) {
                    this.updatesList = response.data.logs;
                    this.total = response.data.total
                } else {
                    this.updatesList = [];
                    this.total = 0;
                    this.updatepage = 1;
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
    getUserDetails(): void {
        try {
            let ud = this.authService.getUserDetails();
            if (ud) {
                this.dateFormat = ud.date_format;
                this.timeZone = ud.time_zone;
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
    getDate(date: any) {
        return moment(date).tz(this.timeZone).format(`${this.dateFormat} hh:mm:ss A`)
    }

    /**
     * @description on page change
     * @returns {void}
     * @param p 
     */
    onPageChange(p: number): void {
        this.updatepage = p;
        this.getLeadUpdates();
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
                this.updatepage = 1;
                this.getLeadUpdates();
            }
        }
    }

}
