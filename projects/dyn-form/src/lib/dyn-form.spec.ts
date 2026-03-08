import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DynFormComponent } from './dyn-form';

describe('DynFormComponent', () => {
  let component: DynFormComponent;
  let fixture: ComponentFixture<DynFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DynFormComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(DynFormComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('fields', []);
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
