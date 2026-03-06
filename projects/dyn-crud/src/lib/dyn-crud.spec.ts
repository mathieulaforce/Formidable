import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DynCrud } from './dyn-crud';

describe('DynCrud', () => {
  let component: DynCrud;
  let fixture: ComponentFixture<DynCrud>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DynCrud]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DynCrud);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
