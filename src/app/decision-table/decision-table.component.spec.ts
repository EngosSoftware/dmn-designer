import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DecisionTableComponent } from './decision-table.component';

describe('DecisionTableComponent', () => {
  let component: DecisionTableComponent;
  let fixture: ComponentFixture<DecisionTableComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DecisionTableComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DecisionTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
