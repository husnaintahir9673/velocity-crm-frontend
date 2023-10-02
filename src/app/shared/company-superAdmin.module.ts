import { NgModule, ModuleWithProviders } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { SweetAlert2Module } from '@sweetalert2/ngx-sweetalert2';

import { DocumentsListComponent } from '@components/documents/documents-list/documents-list.component';
import { RenameDocComponent } from '@components/lead/rename-doc/rename-doc.component';

import { NgxPaginationModule } from 'ngx-pagination';
import { NgxSpinnerModule } from "ngx-spinner";

@NgModule({
    imports: [
        NgxPaginationModule,
        CommonModule,
        NgxSpinnerModule,
        FormsModule,
        NgbModule,
        SweetAlert2Module
    ],
    exports: [
        DocumentsListComponent,
        NgxPaginationModule,
        CommonModule,
        NgxSpinnerModule,
        FormsModule,
        NgbModule,
        SweetAlert2Module,
        RenameDocComponent
    ],
    declarations: [
        DocumentsListComponent,
        RenameDocComponent
    ]
})
export class CompanySuperAdminModule {
    static forRoot(): ModuleWithProviders<CompanySuperAdminModule> {
        return {
            ngModule: CompanySuperAdminModule
        };
    }
}