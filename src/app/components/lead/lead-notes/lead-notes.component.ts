import { Component, Input, OnInit, TemplateRef } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { API_PATH } from '@constants/api-end-points';
import { ApiService } from '@services/api.service';
import { CommonService } from '@services/common.service';
import { lastValueFrom, Subscription } from 'rxjs';
import * as Constants from '@constants/constants';
import { AuthService } from '@services/auth.service';
import { AbstractControl, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { Custom_Regex } from '@constants/constants';
import moment from 'moment';

@Component({
    selector: 'app-lead-notes',
    templateUrl: './lead-notes.component.html',
    styleUrls: ['../lead-activities/lead-activities.component.scss', './lead-notes.component.scss']
})
export class LeadNotesComponent implements OnInit {
    addNoteForm!: FormGroup;
    leadID: string = '';
    leadNotesList: Array<any> = [];
    leadName: string = '';
    roles = Constants.Roles;
    userRole: string = '';
    userName: string = '';
    model!:NgbModalRef;
    selectedLead: any = {};
    canAddNote: boolean = false;
    dateFormat: string = '';
    timeZone: string = ''
    style!: { fill: string; };
    background!: { background: string; };
    colorSubs!:Subscription;
    notepage: number = 1;
    limit: number = 10;
    total: number = 0;
    color!: string;
    lead: any = {};


    constructor(
        private commonService: CommonService,
        private apiService: ApiService,
        private route: ActivatedRoute,
        private authService: AuthService,
        private fb: FormBuilder,
        private modalService: NgbModal
    ) { }

    ngOnInit(): void {
        this.canAddNote = this.authService.hasPermission('lead-note-add');
        let params = this.route.snapshot.params;
        if (params && params['id']) {
            this.leadID = params['id'];
            this.getLeadNotes();
            this.getLeadDetailsList();
        } else {
            this.commonService.showError('');
        }      
        this.getUserDetails();
        this.initNoteForm();
    }

    openModal(templateRef: TemplateRef<any>) {
        this.model = this.modalService.open(templateRef)
    }
    async getLeadDetailsList() {
        try {
            this.commonService.showSpinner();
            const res$ = this.apiService.getReq(API_PATH.LEAD_DETAILS + this.leadID, 'lead', 'view');
            let response = await lastValueFrom(res$);
            if (response && response.data) {
                this.lead = response.data;
                
            }
            this.commonService.hideSpinner();
        } catch (error: any) {
            this.commonService.hideSpinner();
            this.commonService.showErrorMessage(error);
        }
    }

    closeModal() {
        this.model.close();
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
                this.userName = ud?.name;
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
    getDate(date: any){
        return moment(date).tz(this.timeZone).format(`${this.dateFormat} hh:mm:ss A`)
    }

    // async getLeadNotes() {
    //     try {
    //         this.commonService.showSpinner();
    //         const res$ = this.apiService.postReq(API_PATH.LEAD_NOTES, { lead_id: this.leadID,page: this.updatepage,}, 'lead', 'list');
    //         let response = await lastValueFrom(res$);
    //         if (response && response.data) {
    //             this.leadNotesList = response.data;
    //         } else {
    //             this.leadNotesList = [];
    //             this.updatepage = 1;

    //         }
    //         this.commonService.hideSpinner();
    //     } catch (error: any) {
    //         this.commonService.hideSpinner();
    //         if (error.error && error.error.message) {
    //             this.commonService.showError(error.error.message);
    //         } else {
    //             this.commonService.showError(error.message);
    //         }
    //     }
    // }
    async getLeadNotes() {
        try {
            this.commonService.showSpinner();
            let res$ = this.apiService.postReq(API_PATH.LEAD_UPDATES, { lead_id: this.leadID, page: this.notepage }, 'lead', 'list');
            let response = await lastValueFrom(res$);
            if (response && response.status_code == 200) {
                if (response.data.logs) {
                    this.leadNotesList = response.data.logs;
                    this.total = response.data.total
                } else {
                    this.leadNotesList = [];
                    this.total = 0;
                    this.notepage = 1;
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
	 * @description formcontrols getters
	 * @author Shine Dezign Infonet Pvt. Ltd.
	 * @returns { [key: string]: AbstractControl }
	 */
	get f(): { [key: string]: AbstractControl } {
		return this.addNoteForm.controls;
	}

    /**
	 * @description initialize  add activity form
	 * @author Shine Dezign Infonet Pvt. Ltd.
	 */
	initNoteForm() {
		this.addNoteForm = this.fb.group({
			note: ['', [
                Validators.required,
                // Validators.pattern(Custom_Regex.spaces), 
                Validators.pattern(Custom_Regex.address), 
                Validators.pattern(Custom_Regex.address2),
                Validators.minLength(3), 
                Validators.maxLength(1000)
            ]],
		});
	}

    /**
     * 
     */
    async addNote() {
        try {
            this.addNoteForm.markAllAsTouched();
            if(this.addNoteForm.value.note){
                this.addNoteForm.get('note')?.patchValue(this.addNoteForm.get('note')?.value.trim());
            }    
            if(this.addNoteForm.valid) {
                this.commonService.showSpinner();
                const res$ = this.apiService.postReq(API_PATH.CREATE_LEAD_NOTE, { lead_id: this.leadID, note: this.addNoteForm.get('note')?.value },'lead', 'edit');
                const response = await lastValueFrom(res$);
                if(response && response.status_code == "200") {
                    this.getLeadNotes();
                    // let data = {
                    //     lead_id: this.leadID,
                    //     created_at: new Date().toISOString() ,
                    //     added_by: this.userName,
                    //     note: this.addNoteForm.get('note')?.value
                    // }
                    // this.leadNotesList = [ data, ...this.leadNotesList ];
                    this.addNoteForm.reset();
                this.commonService.showSuccess(response.message);

                } else {
                    this.commonService.showError(response.message);
                }
                this.commonService.hideSpinner();
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
    onPageChange(p: number): void {
        this.notepage = p;
        this.getLeadNotes();
    }
    //
    ngDoCheck():void {
        
     this.getPaginationList();
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

}
