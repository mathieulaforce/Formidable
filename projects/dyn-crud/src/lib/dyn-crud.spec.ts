import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DynCrudListComponent } from './dyn-crud-list';

describe('DynCrudListComponent', () => {
  let component: DynCrudListComponent;
  let fixture: ComponentFixture<DynCrudListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DynCrudListComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(DynCrudListComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('config', {
      resourceName: 'Test',
      resourceNamePlural: 'Tests',
      columns: [],
    });
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
