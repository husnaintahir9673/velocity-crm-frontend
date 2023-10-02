import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'filesize'
})
export class FileSizePipe implements PipeTransform {
  transform(size: number, extension: string = 'MB') {
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    if (size == 0) return '0 Byte';
    const i = Math.floor(Math.log(size) / Math.log(1024));
    return Math.round(size / Math.pow(1024, i)) + ' ' + sizes[i];
  }
}
