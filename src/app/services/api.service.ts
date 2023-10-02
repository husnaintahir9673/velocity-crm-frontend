import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
const GOOGLE_MAPS_API_KEY = 'AIzaSyAVi72zWS5TE912KQJO-hqDY-X-W7H_8R0';

export type Maps = typeof google.maps;

@Injectable({
    providedIn: 'root'
})
export class ApiService {

    constructor(
        private http: HttpClient,
        @Inject('baseURL') private baseURL: string
    ) { }


    /**
       * @description get req
       * @param url 
       * @returns {Promise} 
       */
     getReq(url: string, mdl: string, operation: string): Observable<any> {
        const headerDict = {
            'mdl': mdl,
            operation: operation
        }
        const requestOptions = {
            headers: new HttpHeaders(headerDict),
        };
        return this.http.get(this.baseURL + url, requestOptions);
    }
    getGoogleReq(url: string): Observable<any> {
        // const headerDict = {
        //     'mdl': mdl,
        //     operation: operation
        // }
        // const requestOptions = {
        //     headers: new HttpHeaders(headerDict),
        // };
        return this.http.get(url);
    }

    /**
     * @description post req
     * @param url 
     * @param reqData 
     * @returns {Promise} 
     */
    postReq(url: string, reqData: any, mdl: string, operation: string, responseType: string = ''): Observable<any> {
        const headerDict = {
            'mdl': mdl,
            operation: operation
        }
        const requestOptions: any = {
            headers: new HttpHeaders(headerDict),
        };
        if(responseType) {
            requestOptions.responseType = responseType
        }
        return this.http.post(this.baseURL + url, reqData, requestOptions);
    }
    
  // public readonly api = this.load();

  private load(): Promise<Maps> {
    const script = document.createElement('script');
    script.type = 'text/javascript';
    script.async = true;
    script.defer = true;
    // tslint:disable-next-line:no-bitwise
    const callbackName = `GooglePlaces_cb_` + ((Math.random() * 1e9) >>> 0);
    script.src = this.getScriptSrc(callbackName);

    interface MyWindow { [name: string]: Function; };
    const myWindow: MyWindow = window as any;

    const promise = new Promise((resolve, reject) => {
      myWindow[callbackName] = resolve;
      script.onerror = reject;
    });
    document.body.appendChild(script);
    return promise.then(() => google.maps);
  }

  private getScriptSrc(callback: string): string {
    interface QueryParams { [key: string]: string; };
    const query: QueryParams = {
      v: '3',
      callback,
      key: GOOGLE_MAPS_API_KEY,
      libraries: 'places',
    };
    const params = Object.keys(query).map(key => `${key}=${query[key]}`).join('&');
    return `//maps.googleapis.com/maps/api/js?${params}&language=fr`;
  }
}
