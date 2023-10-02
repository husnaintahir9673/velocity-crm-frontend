import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Custom_Regex } from '@constants/constants';
import { AuthService } from '@services/auth.service';

@Component({
  selector: 'app-create-list-name',
  templateUrl: './create-list-name.component.html',
  styleUrls: ['./create-list-name.component.scss']
})
export class CreateListNameComponent implements OnInit {
  listForm!: FormGroup;
  style!: {fill:string};
  background!: { background: string; };
  colorSubs!: any;
  color!: string;
  CheckBoxCondition: boolean = false
  CheckBoxCondition2: boolean = false

  constructor(
      private fb: FormBuilder,
      private router: Router,
      private authService: AuthService
  ) { }

  ngOnInit(): void {
  this.initListForm()
  this.getUserDetails();
  }

  getUserDetails(): void {
        let ud = this.authService.getUserDetails();
        if (ud) {
            this.getColorOnUpdate();
            this.style={fill:ud?.color};
             this.color=ud?.color;
                // this.stroke={stroke:ud?.color};
                this.background={background:ud?.color};

        }
    } 
    getColorOnUpdate() {
      this.colorSubs = this.authService.getColor().subscribe((u) => {
        this.getUserDetails();
      });
    }

    initListForm() {
      this.listForm = this.fb.group({
          name: ['', [
              Validators.required,
              Validators.pattern(Custom_Regex.spaces),
              Validators.pattern(Custom_Regex.username),
              Validators.pattern(Custom_Regex.name),
              Validators.minLength(3),
              Validators.maxLength(100)
          ]],
          select_list: ['active',  [
            Validators.required,]],
      })
      if(this.listForm.value.select_list == 'active'){
        this.CheckBoxCondition = true;
        }else{
            this.CheckBoxCondition = false;
        }
  }
       get f(): { [key: string]: AbstractControl } {
        return this.listForm.controls;
    }
    async addListSubmit(): Promise<void> {
      this.listForm.markAllAsTouched();
      if (this.listForm.valid) {
          this.router.navigate([`/${this.userBaseRoute}/list/create-list`], { queryParams: { name: this.listForm.value.name , list: this.listForm.value.select_list} });
      } 

}
get userBaseRoute() {
  return this.authService.getUserRole().toLowerCase();
}

onChange(e:any){
  let data = e.target.value;
  if(data == 'active'){
  this.CheckBoxCondition = true;
  }else{
      this.CheckBoxCondition = false;
  }
  if(data == 'static'){
      this.CheckBoxCondition2 = true;
  }else{
      this.CheckBoxCondition2 = false;
  }
  

}
}

