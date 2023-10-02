import { Component, OnInit } from '@angular/core';
import { Location } from '@angular/common';

@Component({
    selector: 'app-coming-soon',
    templateUrl: './coming-soon.component.html',
    styleUrls: ['./coming-soon.component.scss']
})
export class ComingSoonComponent implements OnInit {

    constructor(
        private loc: Location,
    ) { }

    ngOnInit(): void {
    }
    onBack() {
        this.loc.back();
    }

}
