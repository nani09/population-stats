import { Component, HostListener, OnInit } from '@angular/core';
import { csv } from 'd3';
import { ScatterPlotService } from './scatter-plot/scatter-plot.service';

export interface IDataRow {
  country: string;
  year: number;
  population: number;
  populationDensity: number;
  populationGrowthRate: number;
}

export interface IChartConfig {
  width?: number;
  height?: number;
  top: number;
  right: number;
  bottom: number;
  left: number;
  title?: string;
  isSmallScreen?: boolean;
}

export interface IYearData {
  [key: string]: IDataRow[];
}

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent implements OnInit {
  public data?: IDataRow[];
  public chartConfigs: IChartConfig = {
    top: 20,
    right: 50,
    bottom: 60,
    left: 60,
    height: 450,
    width: 1400,
    title: 'Population Growth vs Density Correlation',
  };

  constructor(private scatterPlotService: ScatterPlotService) {}

  ngOnInit(): void {
    this.onResize();
    this.scatterPlotService.setChartConfigs(this.chartConfigs);
    const rowsData = {};
    csv('../assets/population.csv').then((data) => {
      data.forEach((el) => {
        const growthRate = +el[' Population_Growth_Rate '].replace(
          /\D+\.?\D+/g,
          ''
        );
        if (!growthRate) {
          return;
        }
        const obj = {
          country: el['Country'],
          population: +el[' Population (000s) '].split(',').join(''),
          populationDensity: +el[' Population_Density '],
          populationGrowthRate: growthRate,
          year: +el['Year'],
        } as IDataRow;
        if (rowsData[obj.year]) {
          rowsData[obj.year].push(obj);
        } else {
          rowsData[obj.year] = [obj];
        }
      });
      this.scatterPlotService.setScatterPlotData(rowsData as IYearData);
    });
  }

  @HostListener('window:resize', ['$event'])
  onResize() {
    if (window.screen.width < 700) {
      this.chartConfigs.width = window.screen.width - this.chartConfigs.right;
      this.chartConfigs.isSmallScreen = true;
    } else {
      this.chartConfigs.width = 1400;
      this.chartConfigs.height = 450;
      this.chartConfigs.isSmallScreen = false;
    }
    this.scatterPlotService.setChartConfigs(this.chartConfigs);
  }
}
