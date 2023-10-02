import { Component, OnInit } from '@angular/core';
import { AuthService } from '@services/auth.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit{
  title = 'velocity';
  style!: { fill: string; };
  color: string = '#fa5440' ;
  colorSubs: any;
  background!: { background: string; };
  getValue:boolean = false;
  removeSpinner:boolean = true;
constructor( private authService:AuthService){

}
ngOnInit():void{
  this.getColorOnUpdate()
  this.getUserDetails();
  
 }
 getUserDetails() {
   
   let ud = this.authService.getUserDetails();
   if(ud?.role === 'Administrator'){
  this.removeSpinner= true;
  this.getValue = false;

   }else{
    this.getValue = true;
    this.removeSpinner = false;
   }
      if (ud) {
          this.getColorOnUpdate();
          this.style={fill:ud?.color};
          this.color = ud?.color
          
          this.background={background:ud?.color};
          if(this.color){
          }
 

      }
  } 
  ngDoCheck():void{
    let ud = this.authService.getUserDetails();
    if(ud?.role === 'Administrator'){
      this.removeSpinner= true;
      this.getValue = false;
    
       }else{
     this.getValue = true;
     this.removeSpinner= false;

       }
    this.color = '#fa5440';
    if(ud){
        if(ud.color != ''){
          this.getValue = true;
          this.removeSpinner = false;
          this.color = ud.color
        }else{
          this.color = '#fa5440'
          this.removeSpinner = true;

        }
      }
    // if(window.localStorage.length === 1 || !window.localStorage.length){
    //   this.color = '#fa5440'
    // }else{
    //   if(ud){
    //   this.color = ud.color
    //   }
    // }
    }
  getColorOnUpdate() {
    this.colorSubs = this.authService.getColor().subscribe((u) => {
      this.getUserDetails();
    });
  }
}
