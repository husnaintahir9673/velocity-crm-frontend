import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormGroup, FormBuilder, Validators, AbstractControl } from '@angular/forms';
import { API_PATH } from '@constants/api-end-points';
import { Custom_Regex } from '@constants/constants';
import { ApiService } from '@services/api.service';
import { CommonService } from '@services/common.service';
import { lastValueFrom } from 'rxjs';

@Component({
    selector: 'app-rename-doc',
    templateUrl: './rename-doc.component.html',
    styleUrls: ['./rename-doc.component.scss']
})
export class RenameDocComponent implements OnInit {
    renameForm!: FormGroup;
    @Input() filename: string = '';
    @Input() leadID: string = '';
    @Input() docID: string = '';

    @Output() closeModal: EventEmitter<any> = new EventEmitter();
    constructor(
        private fb: FormBuilder,
        private commonService: CommonService,
        private apiService: ApiService
    ) { }

    ngOnInit(): void {
        this.initRenameForm();
    }

    /**
     * @description initialize chnage password form
     * @author Shine Dezign Infonet Pvt. Ltd.
     */
     initRenameForm() {
        this.renameForm = this.fb.group({
            name: [this.filename, [
                Validators.required, 
                Validators.pattern(Custom_Regex.spaces), 
                Validators.pattern(Custom_Regex.address), 
                Validators.pattern(Custom_Regex.address2),
                Validators.minLength(3), 
                Validators.maxLength(100)]],
        })
    }

    /**
     * @description change passsword submit
     * @returns {Promise<void>}
     * @author Shine Dezign Infonet Pvt. Ltd.
     */
    async renameSubmit(): Promise<void> {
        this.renameForm.markAllAsTouched();
        if (this.renameForm.valid) {
            try {
                this.commonService.showSpinner();
                const res$ = this.apiService.postReq(API_PATH.RENAME_LEAD_DOC, { document_id: this.docID, name: this.renameForm.value.name }, 'lead', 'edit');
                let response = await lastValueFrom(res$);
                if (response) {
                    this.commonService.showSuccess(response.message);
                    this.closeModal.emit({
                        name: this.renameForm.value.name
                    });
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
        
    }

    /**
     * @description formcontrols getters
     * @author Shine Dezign Infonet Pvt. Ltd.
     * @returns { [key: string]: AbstractControl }
     */
    get f(): { [key: string]: AbstractControl } {
        return this.renameForm.controls;
    }

}
