import { TestBed } from '@angular/core/testing';

import { ScatterPlotService } from './scatter-plot.service';

describe('ScatterPlotService', () => {
  let service: ScatterPlotService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ScatterPlotService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
