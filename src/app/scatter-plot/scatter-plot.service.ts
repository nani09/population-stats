import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { IChartConfig, IDataRow, IYearData } from '../app.component';

@Injectable({
  providedIn: 'root',
})
export class ScatterPlotService {
  private dataBehaviourSubj = new BehaviorSubject<IYearData>({});
  private chartConfigSubj = new BehaviorSubject<IChartConfig>(
    {} as IChartConfig
  );

  public scatterPlotDat$ = this.dataBehaviourSubj.asObservable();
  public chartConfigs$ = this.chartConfigSubj.asObservable();

  constructor() {}

  public setScatterPlotData(rows: IYearData): void {
    this.dataBehaviourSubj.next(rows);
  }

  public setChartConfigs(config: IChartConfig) {
    this.chartConfigSubj.next(config);
  }
}
