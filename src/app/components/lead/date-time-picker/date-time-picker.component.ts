import { DatePipe } from '@angular/common';
import { Component, forwardRef, Injector, Input, OnInit, ViewChild } from '@angular/core';
import { NgControl, NG_VALUE_ACCESSOR } from '@angular/forms';
import { DateTimeModel } from '@components/lead/add-activity/date-time.model';
import { NgbDatepicker, NgbDateStruct, NgbPopover, NgbPopoverConfig, NgbTimeStruct } from '@ng-bootstrap/ng-bootstrap';
import { noop } from 'rxjs';
const now = new Date();
@Component({
    selector: 'app-date-time-picker',
    templateUrl: './date-time-picker.component.html',
    styleUrls: ['./date-time-picker.component.scss'],
    providers: [
        DatePipe,
        {
            provide: NG_VALUE_ACCESSOR,
            useExisting: forwardRef(() => DateTimePickerComponent),
            multi: true
        }
    ]
})

export class DateTimePickerComponent implements OnInit {

    @Input()
    dateString: string = '';

    @Input()
    inputDatetimeFormat = "M/d/yyyy H:mm:ss";
    @Input()
    hourStep = 1;
    @Input()
    minuteStep = 15;
    @Input()
    secondStep = 30;
    @Input()
    seconds = true;

    @Input()
    disabled = false;
    timePickerContent: any

    showTimePickerToggle: boolean = false;

    datetime: DateTimeModel = new DateTimeModel();
    firstTimeAssign = true;
    minDate: NgbDateStruct = { year: now.getFullYear(), month: now.getMonth() + 1, day: now.getDate() };
    outsideDays = 'hidden';

    @ViewChild(NgbPopover, { static: true })
    popover: NgbPopover | any;

    onTouched: () => void = noop;
    onChange: (_: any) => void = noop;

    ngControl: NgControl | any;

    constructor(private config: NgbPopoverConfig, private inj: Injector) {
        config.autoClose = "outside";
        config.placement = "auto";
    }

    ngOnInit(): void {
        this.ngControl = this.inj.get(NgControl);
    }

    ngAfterViewInit(): void {
        this.popover.hidden.subscribe((event: any) => {
            this.showTimePickerToggle = false;
        });
    }

    writeValue(newModel: string) {
        if (newModel) {
            this.datetime = Object.assign(
                this.datetime,
                DateTimeModel.fromLocalString(newModel)
            );
            this.dateString = newModel;
            this.setDateStringModel();
        } else {
            this.datetime = new DateTimeModel();
        }
    }

    registerOnChange(fn: any): void {
        this.onChange = fn;
    }

    registerOnTouched(fn: any): void {
        this.onTouched = fn;
    }

    toggleDateTimeState($event: any) {
        this.showTimePickerToggle = !this.showTimePickerToggle;
        $event.stopPropagation();
    }

    setDisabledState?(isDisabled: boolean): void {
        this.disabled = isDisabled;
    }

    onInputChange($event: any) {
        const value = $event.target.value;
        const dt = DateTimeModel.fromLocalString(value);

        if (dt) {
            this.datetime = dt;
            this.setDateStringModel();
        } else if (value.trim() === "") {
            this.datetime = new DateTimeModel();
            this.dateString = "";
            this.onChange(this.dateString);
        } else {
            this.onChange(value);
        }
    }

    onDateChange($event: string | NgbDateStruct, dp: NgbDatepicker) {
        const date = new DateTimeModel($event);

        if (!date) {
            this.dateString = this.dateString;
            return;
        }

        if (!this.datetime) {
            this.datetime = date;
        }

        this.datetime.year = date.year;
        this.datetime.month = date.month;
        this.datetime.day = date.day;

        const adjustedDate = new Date(this.datetime.toString());
        if (this.datetime.timeZoneOffset !== adjustedDate.getTimezoneOffset()) {
            this.datetime.timeZoneOffset = adjustedDate.getTimezoneOffset();
        }

        this.setDateStringModel();
    }

    onTimeChange(event: NgbTimeStruct) {
        this.datetime.hour = event.hour;
        this.datetime.minute = event.minute;
        this.datetime.second = event.second;

        this.setDateStringModel();
    }

    setDateStringModel() {
        this.dateString = this.datetime.toString();

        if (!this.firstTimeAssign) {
            this.onChange(this.dateString);
        } else {
            // Skip very first assignment to null done by Angular
            if (this.dateString !== null) {
                this.firstTimeAssign = false;
            }
        }
    }

    inputBlur($event: any) {
        this.onTouched();
    }
}
