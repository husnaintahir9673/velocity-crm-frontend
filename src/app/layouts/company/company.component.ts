import { Component, OnInit } from '@angular/core';
import { AuthService } from '@services/auth.service';
import { Subscription } from 'rxjs';

@Component({
    selector: 'app-company',
    templateUrl: './company.component.html',
    styleUrls: ['./company.component.scss']
})
export class CompanyComponent implements OnInit {
    emailConfigurationMessage: boolean = false;
    emailconfigurationsSubs: Subscription | any;
    emailConfigurations: number | any;
    constructor(private authService: AuthService) { }

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
            this.emailConfigurations = `${ud.email_configurations}`;
            this.getEmailConfigurationsOnUpdate()
            if (this.emailConfigurations == 0) {
                this.emailConfigurationMessage = true;
            } else if(this.emailConfigurations == 1){
                this.emailConfigurationMessage = false;
            }
            

        }
    }
    getEmailConfigurationsOnUpdate() {
        this.emailconfigurationsSubs = this.authService.getEmailConfigurations().subscribe((u) => {
            this.getUserDetails();
        });
    }

}
