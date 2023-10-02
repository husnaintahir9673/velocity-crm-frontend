import { Component, OnInit } from '@angular/core';
import {FormBuilder, FormGroup } from '@angular/forms';
import {Roles } from '@constants/constants';
import { API_PATH } from '@constants/api-end-points';
import { ApiService } from '@services/api.service';
import { lastValueFrom } from 'rxjs';
import { CommonService } from '@services/common.service';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '@services/auth.service';

@Component({
  selector: 'app-verify-user',
  templateUrl: './verify-user.component.html',
  styleUrls: ['./verify-user.component.scss']
})
export class VerifyUserComponent implements OnInit {
  resetPasswordForm!: FormGroup;
  token: string = '';
  passwordType: boolean = true;
  confirmpasswordType: boolean = true
  newPassword: boolean = false;
  constructor(
      private fb: FormBuilder,
      private apiService: ApiService,
      private commonService: CommonService,
      private router: Router,
      private route: ActivatedRoute,
      private authService: AuthService,
  ) { }

  ngOnInit(): void {

      // if (this.router.url.split('?')[0] === '/new-password') {
      //     this.newPassword = true;
      // }
      let queryParams = this.route.snapshot.queryParams;
      if (queryParams && queryParams['token']) {
          this.token = queryParams['token'];
          console.log("hujgy", this.token);
          if(this.token){
            this.getLogin();
          }
          

      } else {
          this.commonService.showError("Your token has been expired")
      }
      // this.initForgotPassForm();

  }
//   async submitLogin(): Promise<void> {
//     this.loginForm.markAllAsTouched();
//     try {
//         if (this.loginForm.valid) {
//             this.commonService.showSpinner();
//             let data = {
//                 email: this.loginForm.value.username.trim(),
//                 password: this.loginForm.value.password
//             }
//             const response$ = this.apiService.postReq(API_PATH.LOGIN, data, '', '');
//             const response = await lastValueFrom(response$);
//             this.redirectWithRole(response.data.role);
//             this.saveUserDetails(response);
//             this.commonService.showSuccess(response.message);
//             if (response && response.data) {
//                 if(Number(this.userDetails?.agent_logout_session) > 0){
//                     this.idle.setIdle(Number(this.userDetails?.agent_logout_session)* 60);
//                     // sets a timeout period of 5 seconds. after 10 seconds of inactivity, the user will be considered timed out.
//                     this.idle.setTimeout(1);
//                     // sets the default interrupts, in this case, things like clicks, scrolls, touches to the document
//                     this.idle.setInterrupts(DEFAULT_INTERRUPTSOURCES);
//                     this.idle.onIdleEnd.subscribe(() => { 
//                         this.idleState = 'No longer idle.'
//                         console.log(this.idleState);
//                         this.reset();
//                       });
                      
//                       this.idle.onTimeout.subscribe(() => {
//                         this.idleState = 'Timed out!';
//                         this.timedOut = true;
//                         console.log(this.idleState);
//                         this.logout();
//                         // this.router.navigate(['/']);
//                       });
                      
//                       this.idle.onIdleStart.subscribe(() => {
//                           this.idleState = 'You\'ve gone idle!'
//                           console.log(this.idleState);
//                         //   this.childModal.show();
//                       });
                      
//                       this.idle.onTimeoutWarning.subscribe((countdown: any) => {
//                         this.idleState = 'You will time out in ' + countdown + ' seconds!'
//                         console.log(this.idleState);
//                       });
                
                  
//                      this.reset();
//                 }
              
//                 if(response.data.role.toLowerCase() == 'admin'){
//                   response.data.role = 'cadmin'
//                 }
        
              
//                 if (this.loginForm.value.rememberMe) {
//                     const enc = this.authService.encrypt(JSON.stringify(data));
//                     localStorage.setItem(SETTINGS.USER_CREDENTIALS, enc);
//                 } else {
//                     localStorage.removeItem(SETTINGS.USER_CREDENTIALS)
//                 }
//             }
//             // this.commonService.hideSpinner();
//         }
//     } catch (error: any) {
//         this.commonService.hideSpinner();
//         if (error.error && error.error.message) {
//             this.commonService.showError(error.error.message);
//         } else {
//             this.commonService.showError(error.message);
//         }
//     }
// }
async getLogin() {
  try {
      this.commonService.showSpinner();
      const res$ = this.apiService.postReq(API_PATH.VERIFY_USER, { token: this.token }, '', '');
      let response = await lastValueFrom(res$);
      if (response && response.data) {
          // this.statesList = response.data;

      }
      this.commonService.hideSpinner();
  } catch (error: any) {
      this.commonService.hideSpinner();
      if (error.error && error.error.message) {
        this.router.navigate(['/'])
          // this.commonService.showError(error.error.message);
      } else {
        this.router.navigate(['/'])
          // this.commonService.showError(error.message);
      }
  }
}
  redirectWithRole(role: string): void {
    switch (role) {
        case Roles.ADMINISTRATOR:
            this.router.navigate(['/admin'])
            break;
        case Roles.COMPANY:
            this.router.navigate(['/company'])
            break;
        default:
            this.router.navigate([`/${role.toLowerCase()}`])
            break;
    }
}

  // /**
  //  * @description nitialize form
  //  * @author Shine Dezign Infonet Pvt. Ltd.
  //  */
  // initForgotPassForm() {
  //     this.resetPasswordForm = this.fb.group({
  //         password: ['', [Validators.required, Validators.pattern(Custom_Regex.password)]],
  //         password_confirmation: ['', [Validators.required]]
  //     }, { validators: this.commonService.checkPasswords })
  // }

  // /**
  //  * @description get form controls
  //  * @author Shine Dezign Infonet Pvt. Ltd.
  //  * @returns { [key: string]: AbstractControl }
  //  */
  // get f(): { [key: string]: AbstractControl } {
  //     return this.resetPasswordForm.controls;
  // }

  // /**
  //  * @author Shine Dezign Infonet Pvt. Ltd.
  //  * @returns {Promise<void>}
  //  */
  // async onSubmit(): Promise<void> {
  //     this.resetPasswordForm.markAllAsTouched();
  //     if (!this.token) {
  //         this.commonService.showError("Your token has been expired");
  //         return;
  //     }
  //     if (this.resetPasswordForm.valid) {
  //         try {
  //             this.commonService.showSpinner();
  //             let data: any = {
  //                 token: this.token,
  //                 password: this.resetPasswordForm.value.password,
  //                 password_confirmation: this.resetPasswordForm.value.password_confirmation
  //             }
  //             if (this.newPassword) {
  //                 data.new_password = 1;
  //             }
  //             const res$ = this.apiService.postReq(API_PATH.RESET_PASSWORD, data, '', '');
  //             let response = await lastValueFrom(res$);
  //             if (response && response.data) {
  //                 this.commonService.showSuccess(response.message);
  //                 this.saveUserDetails(response);
  //                 this.redirectWithRole(response.data.role);
  //                 // this.router.navigate(['/login']);
  //             }
  //             this.commonService.hideSpinner();
  //         } catch (error: any) {
  //             this.commonService.hideSpinner();
  //             if (error.error && error.error.message) {
  //                 this.commonService.showError(error.error.message);
  //             } else {
  //                 this.commonService.showError(error.message);
  //             }
  //         }
  //     }
  // }


  // /**
  // * @description redirect user according to the role
  // * @param role 
  // * @author Shine Dezign Infonet Pvt. Ltd.
  // * @returns {void}
  // */
  // redirectWithRole(role: string): void {
  //     switch (role) {
  //         case Roles.ADMINISTRATOR:
  //             this.router.navigate(['/admin'])
  //             break;
  //         case Roles.COMPANY:
  //             this.router.navigate(['/company'])
  //             break;
  //         default:
  //             this.router.navigate([`/${this.UserRole}`])
  //             break;
  //     }
  // }

  // get UserRole() {
  //     return this.authService.getUserRole().toLowerCase();
  // }

  // /**
  //  * @description save user details after login
  //  * @param response
  //  * @author Shine Dezign Infonet Pvt. Ltd. 
  //  * @returns {void}
  //  */
  // saveUserDetails(response: any): void {
  //     const userData: Model.UserDetails = {
  //         role: response.data.role,
  //         name: response.data.name,
  //         email: response.data.email,
  //         permissions: response.data.permissions,
  //         logoImage: response.data.logo_image,
  //         lead_email: '',
  //         email_configurations: response.data.email_configurations,
  //         twilio_configurations: response.data.twilio_configurations,
  //         date_format: response.data.date_format,
  //         time_zone: response.data.time_zone,  
  //         color: response.data.primary_color,
  //         reports_decription: response.data.reports_decription,
  //         company_type: response.data.company_type,
  //         user_id:response.data.user_id,
  //         agent_logout_session: response.data.agent_logout_session,
  //         manage_card_permission: response.data.manage_card_permission,
  //     }
  //     const en = this.authService.encrypt(JSON.stringify(userData));
  //     localStorage.setItem(SETTINGS.USER_DETAILS, en);
  //     localStorage.setItem(SETTINGS.TOKEN_KEY, response.data.token);

  // }

}

