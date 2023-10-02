import { Injectable } from '@angular/core';
import { Router, CanLoad, Route, CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
//services
import { AuthService } from '../services/auth.service';

@Injectable({ providedIn: 'root' })
export class RolePermission implements CanActivate {

    constructor(
        public router: Router,
        public authService: AuthService
    ) { }

    /**
     * @description activate route only if user is authenticated
     * @returns {boolean}
     */
    canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
        try {
            if(route && route.params && route.params['role']) {
                const role = route.params['role'];
                if(this.authService.getUserRole() === role && this.authService.hastoken()){
                    return true;
                }
                this.router.navigate(['/access-denied'])
                return false;
            } else if(state.url && state.url.split('/').length && state.url.split('/').length > 1) {
                const role = state.url.split('/')[1];
                if(this.authService.getUserRole() === role && this.authService.hastoken()){
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