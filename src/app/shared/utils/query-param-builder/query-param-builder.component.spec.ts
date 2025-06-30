import { ComponentFixture, TestBed } from '@angular/core/testing';

import { QueryParamBuilderComponent } from './query-param-builder.component';

describe('QueryParamBuilderComponent', () => {
  let component: QueryParamBuilderComponent;
  let fixture: ComponentFixture<QueryParamBuilderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [QueryParamBuilderComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(QueryParamBuilderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
