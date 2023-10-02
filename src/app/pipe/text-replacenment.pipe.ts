import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'textReplacement'
})
export class TextReplacement implements PipeTransform {
  transform(text: string) {
    if(text) {
        return text.replace(/_/g," ");
    } 
    return '';
  }
}