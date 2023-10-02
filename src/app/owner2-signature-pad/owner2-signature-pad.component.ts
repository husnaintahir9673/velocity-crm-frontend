import { Component, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { SignaturePadComponent } from '@almothafar/angular-signature-pad';
import { CommonService } from '@services/common.service';
import { ApiService } from '@services/api.service';

@Component({
  selector: 'app-owner2-signature-pad',
  templateUrl: './owner2-signature-pad.component.html',
  styleUrls: ['./owner2-signature-pad.component.scss']
})
export class Owner2SignaturePadComponent implements OnInit {
  @Input() tabView: boolean = true;
  @Output() tabViewChange = new EventEmitter<boolean>();
  @ViewChild('pad2', { static: false }) signaturePad!: SignaturePadComponent;
  @Input() customer2Sign = '';
  @Input() customerSign = ''
  @Output() close: EventEmitter<any> = new EventEmitter();
  @Output() customer2SignChange = new EventEmitter<string>();
  @Output() customerSignChange = new EventEmitter<string>();
  @Output() pendingDocuments = new EventEmitter<any>();
  signaturePadOptions: any = { // passed through to szimek/signature_pad constructor
      'minWidth': 2,
      'canvasWidth': 500,
      'canvasHeight': 200
  };

  constructor(  private commonService: CommonService, private apiService: ApiService,) { }

  ngOnInit(): void {
  }

  ngAfterViewInit() {
      if(this.signaturePad) {
          this.signaturePad.fromDataURL(this.customer2Sign);
      }
  }

  drawComplete() {
      // will be notified of szimek/signature_pad's onEnd event
      this.customer2Sign = this.signaturePad.toDataURL();
      this.customer2SignChange.emit(this.customer2Sign);
      // console.log(this.signaturePad.toDataURL());
  }

  resetSignPad() {
      if (this.signaturePad)
          this.signaturePad.clear();
          this.customer2SignChange.emit('');
  }

  closeModal(value: any) {
      if (!this.customer2Sign && value == false) {
          this.commonService.showError('Please add owner 2 signature before submitting');
          return;
      }
      if (!this.customerSign && value == false) {
        this.commonService.showError('Please add owner 1 signature before submitting');
        return;
    }
      if(value == true){
          this.close.emit();
      }
      if(this.customer2Sign && value == false){
          this.close.emit();
          this.tabViewChange.emit(false);
          this.pendingDocuments.emit();
      }
     
  }


}
