import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Custom_Regex, SETTINGS, Roles } from '@constants/constants';
import { API_PATH } from '@constants/api-end-points';
import { ApiService } from '@services/api.service';
import { lastValueFrom } from 'rxjs';
import { CommonService } from '@services/common.service';
import { AuthService } from '@services/auth.service';
import { Router } from '@angular/router';

import * as Model from '@interfaces/common.interface';
import { UserIdleService } from 'angular-user-idle';
import { DEFAULT_INTERRUPTSOURCES, Idle } from '@ng-idle/core';
import { Keepalive } from '@ng-idle/keepalive';

@Component({
    selector: 'app-login',
    templateUrl: './login.component.html',
    styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
    loginForm!: FormGroup;
    passwordType: boolean = true;
    idleState = 'Not started.';
    timedOut = false;
    lastPing?: Date = new Date();
    title = 'angular-idle-timeout';
    userDetails: any = {}

    constructor(
        private fb: FormBuilder,
        private apiService: ApiService,
        private commonService: CommonService,
        private authService: AuthService,
        private router: Router,
        private userIdle: UserIdleService,
        private idle: Idle, private keepalive: Keepalive
    ) { }

    ngOnInit(): void {
        this.initLoginForm();
        this.checkUserDetails();
  
        
    }
    /**
     * @description check if remember me was check previously
     * @author Shine Dezign Infonet Pvt. Ltd.
     * @returns {void}
     */
    checkUserDetails(): void {
        try {
            let userCredentials = localStorage.getItem(SETTINGS.USER_CREDENTIALS);
            if (userCredentials) {
                let uc: any = this.authService.decrypt(userCredentials);
                if (uc) {
                    uc = JSON.parse(uc);
                    if (uc.email && uc.password) {
                        this.loginForm.patchValue({
                            username: uc.email,
                            password: uc.password,
                            rememberMe: true
                        })
                    }
                }
            }
        } catch (error: any) {
            this.commonService.showError(error.message)
        }
    }

    /**
     * @description initialize login form
     * @author Shine Dezign Infonet Pvt. Ltd.
     * @returns {void}
     */
    initLoginForm(): void {
        this.loginForm = this.fb.group({
            username: ['', [Validators.required, this.validateUsernameEmail]],
            password: ['', [Validators.required, Validators.pattern(Custom_Regex.spaces)]],
            rememberMe: [false]
        })
    }

    /**
     * @description get form controls
     * @returns { [key: string]: AbstractControl }
     * @author Shine Dezign Infonet Pvt. Ltd.
     */
    get f(): { [key: string]: AbstractControl } {
        return this.loginForm.controls;
    }

    /**
     * @description validate username and email
     * @param c 
     * @returns 
     * @author Shine Dezign Infonet Pvt. Ltd.
     */
    validateUsernameEmail(c: FormControl) {
        return (c.value.match(Custom_Regex.email) || c.value.match(Custom_Regex.username)) ? null : {
            usernameEmail: true
        };
    }

    /**
     * @description save user details after login
     * @param response
     * @author Shine Dezign Infonet Pvt. Ltd. 
     * @returns {void}
     */
    saveUserDetails(response: any): void {
        let primary_color = '#fa5440'
        if(response.data.primary_color){
            primary_color = response.data.primary_color
        }else{
            primary_color = '#fa5440'
        }
        const userData: Model.UserDetails = {
            role: response.data.role,
            name: response.data.name,
            email: response.data.email,
            permissions: response.data.permissions,
            logoImage: response.data.logo_image,
            lead_email: '',
            email_configurations: response.data.email_configurations,
            twilio_configurations: response.data.twilio_configurations,
            date_format: response.data.date_format,
            time_zone: response.data.time_zone,
            // color: response.data.primary_color,
            color: primary_color,
            reports_decription: response.data.reports_decription,
            company_type: response.data.company_type,
            user_id: response.data.user_id,
            agent_logout_session: response.data.agent_logout_session,
            manage_card_permission: response.data.manage_card_permission,
        }
        const en = this.authService.encrypt(JSON.stringify(userData));
        localStorage.setItem(SETTINGS.USER_DETAILS, en);
        localStorage.setItem(SETTINGS.TOKEN_KEY, response.data.token);
        this.getUserDetails()
    

    }
    getUserDetails() {
        let ud = this.authService.getUserDetails();
        if (ud) {
            this.userDetails = ud;
        }
    }

    /**
     * @description on login button click
     * @author Shine Dezign Infonet Pvt. Ltd.
     * @returns {Promise<void>}
     */
    async submitLogin(): Promise<void> {
        this.loginForm.markAllAsTouched();
        try {
            if (this.loginForm.valid) {
                this.commonService.showSpinner();
                let data = {
                    email: this.loginForm.value.username.trim(),
                    password: this.loginForm.value.password
                }
                const response$ = this.apiService.postReq(API_PATH.LOGIN, data, '', '');
                const response = await lastValueFrom(response$);
                this.redirectWithRole(response.data.role);
                this.saveUserDetails(response);
                this.commonService.showSuccess(response.message);
                if (response && response.data) {
                    if(Number(this.userDetails?.agent_logout_session) > 0){
                        this.idle.setIdle(Number(this.userDetails?.agent_logout_session)* 60);
                        // sets a timeout period of 5 seconds. after 10 seconds of inactivity, the user will be considered timed out.
                        this.idle.setTimeout(1);
                        // sets the default interrupts, in this case, things like clicks, scrolls, touches to the document
                        this.idle.setInterrupts(DEFAULT_INTERRUPTSOURCES);
                        this.idle.onIdleEnd.subscribe(() => { 
                            this.idleState = 'No longer idle.'
                            console.log(this.idleState);
                            this.reset();
                          });
                          
                          this.idle.onTimeout.subscribe(() => {
                            this.idleState = 'Timed out!';
                            this.timedOut = true;
                            console.log(this.idleState);
                            this.logout();
                            // this.router.navigate(['/']);
                          });
                          
                          this.idle.onIdleStart.subscribe(() => {
                              this.idleState = 'You\'ve gone idle!'
                              console.log(this.idleState);
                            //   this.childModal.show();
                          });
                          
                          this.idle.onTimeoutWarning.subscribe((countdown: any) => {
                            this.idleState = 'You will time out in ' + countdown + ' seconds!'
                            console.log(this.idleState);
                          });
                    
                      
                         this.reset();
                    }
                  
                    if(response.data.role.toLowerCase() == 'admin'){
                      response.data.role = 'cadmin'
                    }
            
                  
                    if (this.loginForm.value.rememberMe) {
                        const enc = this.authService.encrypt(JSON.stringify(data));
                        localStorage.setItem(SETTINGS.USER_CREDENTIALS, enc);
                    } else {
                        localStorage.removeItem(SETTINGS.USER_CREDENTIALS)
                    }
                }
                // this.commonService.hideSpinner();
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
    async logout() {
        try {
            this.commonService.showSpinner();
            const res$ = this.apiService.postReq(API_PATH.LOGOUT, {}, '', '');
            let response = await lastValueFrom(res$);
            this.commonService.hideSpinner();
            this.commonService.showError("Session Expired");
        }catch (error: any) {
            this.commonService.hideSpinner();
            if (error.error && error.error.message) {
                // this.commonService.showError(error.error.message);
            } else {
                // this.commonService.showError(error.message);
            }
        }
        localStorage.removeItem(SETTINGS.TOKEN_KEY);
        localStorage.removeItem(SETTINGS.USER_DETAILS);
        this.router.navigate(['/login']);
    }

    /**
     * @description redirect user according to the role
     * @param role 
     * @author Shine Dezign Infonet Pvt. Ltd.
     * @returns {void}
     */
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
   
  
    reset() {
      this.idle.watch();
      this.idleState = 'Started.';
      this.timedOut = false;
    }
    
}
