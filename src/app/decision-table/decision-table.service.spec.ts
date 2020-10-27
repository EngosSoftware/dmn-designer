import { TestBed } from '@angular/core/testing';

import { DecisionTableService } from './decision-table.service';

describe('DecisionTableService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: DecisionTableService = TestBed.get(DecisionTableService);
    expect(service).toBeTruthy();
  });
});
