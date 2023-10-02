import { Injectable } from '@angular/core';
import { Router, CanLoad, Route } from '@angular/router';
//services
import { AuthService } from '../services/auth.service';

@Injectable({ providedIn: 'root' })
export class PermissionGuard implements CanLoad {

    constructor(
        public router: Router,
        public authService: AuthService
    ) { }

    /**
     * @description activate route only if user is authenticated
     * @returns {boolean}
     */
    canLoad(route: Route): boolean {
        try {
            if(route && route.data) {
                const role = route.data['role'];
                if(this.authService.hasRole(role) && this.authService.hastoken()) {
                    return true;
                }
                this.router.navigate(['/access-denied'])
                return false;
            }
            this.router.navigate(['/access-denied'])
            return false;
           
        } catch (error) {
            return false;
        }
    }
}