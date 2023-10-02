import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import { AppComponent } from './app.component';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { AuthInterceptor } from './interceptor/auth.interceptor';
import { ToastrModule } from 'ngx-toastr';
import { NgxSpinnerModule } from "ngx-spinner";
import { DateFormatterDatepickerService } from '@services/date-formatter-datepicker.service'
//components
import { LoginComponent } from './components/on-boarding/login/login.component';
import { PageNotFoundComponent } from '@components/page-not-found/page-not-found.component';
import { ForgotPasswordComponent } from './components/on-boarding/forgot-password/forgot-password.component';
import { environment } from 'environments/environment';
import { ResetPasswordComponent } from './components/on-boarding/reset-password/reset-password.component';
import { SweetAlert2Module } from '@sweetalert2/ngx-sweetalert2';
import { DocumentAccessListComponent } from '@components/documents/document-access-list/document-access-list.component';
import { NgbDateParserFormatter } from '@ng-bootstrap/ng-bootstrap';
import { VerifyCustomerComponent } from '@components/verify-customer/verify-customer.component';
import { SubmissionThanksComponent } from './components/submission-thanks/submission-thanks.component';
import { NgxUiLoaderConfig, NgxUiLoaderModule, PB_DIRECTION, POSITION, SPINNER } from "ngx-ui-loader";
import { UnsubscribeComponent } from '@components/unsubscribe/unsubscribe.component';
import { UserIdleModule } from 'angular-user-idle';
import { NgIdleKeepaliveModule } from '@ng-idle/keepalive';
import { MomentModule } from 'angular2-moment';
import { VerifyUserComponent } from '@components/verify-user/verify-user.component';



const ngxUiLoaderConfig: NgxUiLoaderConfig = {
    bgsColor: "red",
    bgsPosition: POSITION.topRight,
    bgsSize: 40,
    bgsType: SPINNER.ballSpinClockwiseFadeRotating, // background spinner type
    fgsType: SPINNER.doubleBounce, // foreground spinner type
    pbDirection: PB_DIRECTION.leftToRight, // progress bar direction
    pbThickness: 5, // progress bar thickness
    pbColor: "#fa5440",
    fgsColor: "#fa5440",
  };

@NgModule({
    declarations: [
        AppComponent,
        LoginComponent,
        ForgotPasswordComponent,
        ResetPasswordComponent,
        PageNotFoundComponent,
        DocumentAccessListComponent,
        VerifyCustomerComponent,
        SubmissionThanksComponent,
        UnsubscribeComponent,
        VerifyUserComponent
        // UserIdleModule.forRoot({idle: 600, timeout: 300, ping: 120})
    ],
    imports: [
        BrowserModule,
        BrowserAnimationsModule,
        AppRoutingModule,
        NgbModule,
        FormsModule,
        ReactiveFormsModule,
        HttpClientModule,
        ToastrModule.forRoot({
            preventDuplicates: true,
            positionClass :'toast-top-right'
        }),
        NgxSpinnerModule,
        SweetAlert2Module.forRoot(),
        NgxUiLoaderModule.forRoot(ngxUiLoaderConfig),
        UserIdleModule,
        NgIdleKeepaliveModule.forRoot(),
        MomentModule,
    ],
    providers: [
        { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true },
        { provide: 'baseURL', useValue: environment.baseURL },
        { provide: NgbDateParserFormatter, useClass: DateFormatterDatepickerService }
    ],
    bootstrap: [AppComponent]
})
export class AppModule { }
