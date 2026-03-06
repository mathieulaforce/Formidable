import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DynForm } from './dyn-form';

describe('DynForm', () => {
  let component: DynForm;
  let fixture: ComponentFixture<DynForm>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DynForm]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DynForm);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
