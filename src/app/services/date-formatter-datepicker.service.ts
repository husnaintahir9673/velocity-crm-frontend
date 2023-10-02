import { Injectable } from '@angular/core';
import { NgbDateParserFormatter, NgbDateStruct } from '@ng-bootstrap/ng-bootstrap';

@Injectable({
    providedIn: 'root'
})
export class DateFormatterDatepickerService extends NgbDateParserFormatter {

    parse(value: string): NgbDateStruct | null {
        if (value != null) {
            const parts = value.split('-');
            if (parts.length === 3 && this.isNumber(parts[0]) && this.isNumber(parts[1]) && this.isNumber(parts[2])) {
                // return { month: parseInt(parts[1]), day: parseInt(parts[2]), year: parseInt(parts[0]) };
                const y:any = parts[0]; if(y.length === 4) { 
                    return { month: parseInt(parts[1]), day: parseInt(parts[2]), year: parseInt(parts[0]) };
                 } else { return { month: parseInt(parts[0]), day: parseInt(parts[1]), year: parseInt(parts[2]) }; }
            }
        }
        return null;
    }


    format(date: NgbDateStruct | null): string {
        return date && this.isNumber(date.day) && this.isNumber(date.month) && this.isNumber(date.year)
            ? `${this.padNumber(date.month)}-${this.padNumber(date.day)}-${date.year}`
            : '';
    }

    private isNumber(value: any): value is number {
        return !isNaN(parseInt(value));
    }

    private padNumber(value: number) {
        if (this.isNumber(value)) {
            return `0${value}`.slice(-2);
        } else {
            return '';
        }
    }
}
