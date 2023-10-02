import { Injectable } from '@angular/core';
import { SETTINGS } from '@constants/constants';


import * as Model from '@interfaces/common.interface';

import * as CryptoJS from 'crypto-js';
import { BehaviorSubject, Subject } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class AuthService {
    private userNameChange = new Subject<string>();
	public userNameChange$ = this.userNameChange.asObservable();
    private colorChange = new Subject<string>();
	public colorChange$ = this.colorChange.asObservable();
    private logoutSessionChange = new Subject<string>();
	public logoutSessionChange$ = this.logoutSessionChange.asObservable();
    private dashboardPermissionChange = new Subject<string>();
	public dashboardPermission$ = this.dashboardPermissionChange.asObservable();
    private logoChange = new Subject<string>();
	public logoChange$ = this.logoChange.asObservable();
    private configurationsChange = new Subject<string>();
	public configurationsChange$ = this.configurationsChange.asObservable();
    private twilioconfigurationsChange = new Subject<string>();
	public twilioconfigurationsChange$ = this.twilioconfigurationsChange.asObservable();
    private bb = new BehaviorSubject('');
    private bb$ = this.bb.asObservable();
    constructor() { }

    /**
     * @description encrpt
     * @param value 
     * @returns 
     */
     encrypt(value: string):string {
        let c= CryptoJS.AES.encrypt(value, SETTINGS.ENC_KEY).toString();
        return c;
    }

    /**
     * @description decrpt value
     * @param value 
     * @returns 
     */
    decrypt(value: string):string {
        var bytes  = CryptoJS.AES.decrypt(value, SETTINGS.ENC_KEY);
        return bytes.toString(CryptoJS.enc.Utf8);
    } 

    /**
     * @description check if user has same role as which route he is accessing
     * @param role 
     */
    hasRole(role: string) {
        let userDetails: Model.UserDetails | null = this.getUserDetails();
        if(userDetails && userDetails.role === role) {
            return true;
        }
        return false;
    }

    /**
     * @description check for given permission
     * @param permission 
     * @returns {boolean}
     */
    hasPermission(permission: string): boolean {
        let userDetails: Model.UserDetails | null = this.getUserDetails();
        if(userDetails && userDetails.permissions && userDetails.permissions.length) {
            if(userDetails.permissions.includes(permission)) {
                return true;
            }
        }
        return false;
    }

    /**
     * @description get user details
     * @returns 
     */
    getUserDetails(): Model.UserDetails | null {
        try {
            let userDetails:any = localStorage.getItem(SETTINGS.USER_DETAILS);
            if(userDetails) {
                userDetails = this.decrypt(userDetails);
                userDetails = JSON.parse(userDetails);
                return userDetails;
            }
            return null;
        } catch (error) {
            return null;
        }
    }
    setKeyToLS(key: string, value: string) {
		localStorage.setItem(key, value);
	}
    
	/**
		* @description get username on change
		* @returns Observable
		*/
	getUserName() {
		return this.userNameChange$;
	}
    	/**
	 * @description set username on profile update
	 * @param userName 
	 */
	setUserName(userName: string) {
		this.userNameChange.next(userName);
	}
    getColor() {
		return this.colorChange$;
	}
    	/**
	 * @description set username on profile update
	 * @param userName 
	 */
	setColor(color: string) {
		this.colorChange.next(color);
	}
    getDashboardPermissions() {
		return this.dashboardPermission$;
	}
    	/**
	 * @description set username on profile update
	 * @param userName 
	 */
	setDashboardPermissions(permission: any) {
		this.dashboardPermissionChange.next(permission);
	}
    getLogoutSession() {
		return this.logoutSessionChange$;
	}
    	/**
	 * @description set username on profile update
	 * @param userName 
	 */
    setLogoutSession(name: string) {
		this.logoutSessionChange.next(name);
	}
    
	getEmailConfigurations() {
		return this.configurationsChange$;
	}
    	/**
	 * @description set username on profile update
	 * @param userName 
	 */
	setEmailConfigurations(userName: string) {
		this.configurationsChange.next(userName);
	}

    getTwilioConfigurations() {
		return this.twilioconfigurationsChange$;
	}
    	/**
	 * @description set username on profile update
	 * @param userName 
	 */
	setTwilioConfigurations(userName: string) {
		this.twilioconfigurationsChange.next(userName);
	}
	/**
	 * @description set username on profile update
	 * @param userName 
	 */
	setEmail(userName: string) {
		this.bb.next(userName);
	}

    /**
		* @description get username on change
		* @returns Observable
		*/
	getEmail() {
		return this.bb$;
	}




    	/**
		* @description get username on change
		* @returns Observable
		*/
	getLogo() {
		return this.logoChange$;
	}

	/**
	 * @description set username on profile update
	 * @param userName 
	 */
	setLogo(logo: string) {
		this.logoChange.next(logo);
	}
    /**
     * @description check if user has token
     */
    hastoken() {
        try {
            if(localStorage.getItem(SETTINGS.TOKEN_KEY)) {
                return true;
            }
            return false;
        } catch (error) {
            return false;
        }
        
    }

    getUserRole() {
        let userDetails: Model.UserDetails | null = this.getUserDetails();
        if(userDetails && userDetails.role) {
            return userDetails.role.toLowerCase();
        }
        return '';
    }

    /**
     * @description get token from localstroge
     * @returns {string | null}
     */
    getToken(): string | null {
        try {
            let token = localStorage.getItem(SETTINGS.TOKEN_KEY)
            if(token) {
                return token;
            }
            return null
        } catch (error) {
            return null
        }
    }
}
