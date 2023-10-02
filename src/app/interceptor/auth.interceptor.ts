import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpHandler, HttpRequest } from '@angular/common/http';
import { throwError } from "rxjs";
import { catchError } from 'rxjs/operators';
import { AuthService } from '@services/auth.service';
import { SETTINGS } from '@constants/constants';
import { Router } from '@angular/router';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
    constructor(
        private authService: AuthService,
        private router: Router,
    ) { }

    intercept(req: HttpRequest<any>, next: HttpHandler) {
        let authReq = req;
        let token = this.authService.getToken();
        if (token) {
            authReq = req.clone({ headers: req.headers.set('Authorization', 'Bearer ' + token) });
        }
        return next.handle(authReq).pipe(
            catchError((error) => {
                if (error.status === 401) {
                    localStorage.removeItem(SETTINGS.TOKEN_KEY);
                    localStorage.removeItem(SETTINGS.USER_DETAILS);
                    this.router.navigate(['/login']);
                }
                return throwError(() => error);
            })
        );
    }
}