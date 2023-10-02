import { Component, OnInit } from '@angular/core';
import { AuthService } from '@services/auth.service';
import { Subscription } from 'rxjs';
import * as Constants from '@constants/constants';

@Component({
    selector: 'app-user-layout',
    templateUrl: './user-layout.component.html',
    styleUrls: ['./user-layout.component.scss']
})
export class UserLayoutComponent implements OnInit {
    emailConfigurationMessage: boolean = false;
    emailconfigurationsSubs: Subscription | any;
    emailConfigurations: number | any;
    userDetails: any = {};
    roles = Constants.Roles;
    constructor(private authService: AuthService) { }

    ngOnInit(): void {
        this.getUserDetails();
    }
    /**
     * @description get logged in user details
     * @author Shine Dezign Infonet Pvt. Ltd.
     */
    /**
      * @description get logged in user details
      * @author Shine Dezign Infonet Pvt. Ltd.
      */
    getUserDetails() {
        let ud = this.authService.getUserDetails();
          this.userDetails = ud;
          if (ud) {
            this.emailConfigurations = `${ud.email_configurations}`;
            this.getEmailConfigurationsOnUpdate()
            if (this.emailConfigurations == 0) {
                this.emailConfigurationMessage = true;
            } else if (this.emailConfigurations == 1) {
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
