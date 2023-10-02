import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CrmUpdatePermissionDescriptionComponent } from './crm-update-permission-description.component';

describe('CrmUpdatePermissionDescriptionComponent', () => {
  let component: CrmUpdatePermissionDescriptionComponent;
  let fixture: ComponentFixture<CrmUpdatePermissionDescriptionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CrmUpdatePermissionDescriptionComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CrmUpdatePermissionDescriptionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
