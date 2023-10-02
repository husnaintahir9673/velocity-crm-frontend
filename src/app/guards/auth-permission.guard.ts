import { Injectable } from '@angular/core';
import { Router, CanActivate, ActivatedRouteSnapshot } from '@angular/router';
//services
import { AuthService } from '../services/auth.service';

@Injectable({ providedIn: 'root' })
export class AuthPermission implements CanActivate {

    constructor(
        public router: Router,
        public authService: AuthService
    ) { }

    /**
     * @description activate route only if user is authenticated
     * @returns {boolean}
     */
    canActivate(route: ActivatedRouteSnapshot): boolean {
        try {
            if(route && route.data) {
                const permission = route.data['permission'];
                if(this.authService.hasPermission(permission)) {
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