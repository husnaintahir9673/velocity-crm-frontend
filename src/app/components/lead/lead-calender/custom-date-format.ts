import { CalendarDateFormatter, DateFormatterParams } from 'angular-calendar';
import { formatDate } from '@angular/common';
import { Injectable } from '@angular/core';

@Injectable()
export class CustomDateFormatter extends CalendarDateFormatter {

    public override monthViewColumnHeader({ date, locale }: DateFormatterParams): string {
        if(!locale) locale = '';
        return formatDate(date, 'EEE', locale);
    }

    public override monthViewDayNumber({ date, locale }: DateFormatterParams): string {
        if(!locale) locale = '';
        return formatDate(date, 'dd', locale);
    }

}