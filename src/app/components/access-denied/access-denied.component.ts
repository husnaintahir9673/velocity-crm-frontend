import { Component, OnInit } from '@angular/core';
import { AuthService } from '@services/auth.service';
import { Roles } from '@constants/constants';
import { Router } from '@angular/router';
import * as Model from '@interfaces/common.interface';

@Component({
    selector: 'app-access-denied',
    templateUrl: './access-denied.component.html',
    styleUrls: ['./access-denied.component.scss']
})
export class AccessDeniedComponent implements OnInit {
    userDetails!: Model.UserDetails;
    // userDetails:;
    constructor(
        private authService: AuthService,
        private router: Router
    ) { }

    ngOnInit(): void {
        this.getUserDetails();
    }

    /**
     * @description get logged in user details
     * @author Shine Dezign Infonet Pvt. Ltd.
     */
    getUserDetails() {
        let ud = this.authService.getUserDetails();
        if (ud) {
            this.userDetails = ud;
        }
    }
    onimgerror(ref: any) {
        if(ref) {
            ref.src = 'assets/images/logo.png'
        }
    }

    onBack() {
        switch (this.userDetails.role) {
            case Roles.ADMINISTRATOR:
                this.router.navigate(['/admin'])
                break;
            case Roles.COMPANY:
                this.router.navigate(['/company'])
                break;
            default:
                this.router.navigate([`${this.userRole}`])
                break;
        }
    }

    get userRole() {
        return this.authService.getUserRole().toLowerCase();
    }

}
