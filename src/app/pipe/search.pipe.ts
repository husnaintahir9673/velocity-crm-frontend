import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'searchFilter' })

export class SearchPipe implements PipeTransform {
    transform(items: any[], searchText: string): any[] {
        return items ? items.filter(item => item.name.search(new RegExp(searchText, 'i')) > -1) : [];
    }

}