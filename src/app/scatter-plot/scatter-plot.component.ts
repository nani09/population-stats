import {
  Component,
  ElementRef,
  OnDestroy,
  OnInit,
  Renderer2,
  ViewChild,
} from '@angular/core';
import { ScatterPlotService } from './scatter-plot.service';
import { Subscription, combineLatest } from 'rxjs';
import { IChartConfig, IDataRow, IYearData } from '../app.component';
import {
  select,
  selectAll,
  scaleLinear,
  axisBottom,
  axisLeft,
  max,
  min,
  range,
} from 'd3';
import { FormGroup, FormControl } from '@angular/forms';

@Component({
  selector: 'app-scatter-plot',
  templateUrl: './scatter-plot.component.html',
  styleUrls: ['./scatter-plot.component.css'],
})
export class ScatterPlotComponent implements OnInit, OnDestroy {
  private subscriptions: Subscription[] = [];
  private scatterPlotData?: IYearData;
  public configs?: IChartConfig;
  @ViewChild('ScatterPlotContainer') private scatterPlotContainer?: ElementRef;

  public yearForm = new FormGroup({
    yearFormControl: new FormControl(),
  });
  public years: string[] = [];
  public worldPopulation: number = 0;
  public selectedYear?: number;

  constructor(
    private scatterPlotService: ScatterPlotService,
    private renderer: Renderer2
  ) {}

  ngOnInit(): void {
    const formSubscription = combineLatest(
      this.yearForm.valueChanges,
      this.scatterPlotService.chartConfigs$
    ).subscribe(([formValue, configs]) => {
      if (formValue.yearFormControl && configs) {
        this.configs = configs;
        this.selectedYear = formValue.yearFormControl;
        const data = this.scatterPlotData[formValue.yearFormControl];
        this.worldPopulation =
          Object.values(data).reduce((n, { population }) => n + population, 0) *
          1000;
        this.draw(data);
      }
    });

    const dataSubscription = this.scatterPlotService.scatterPlotDat$.subscribe(
      (data) => {
        this.scatterPlotData = data;
        this.years = Object.keys(data);
        this.yearForm.patchValue({ yearFormControl: this.years[0] });
      }
    );

    this.subscriptions.push(dataSubscription);
    this.subscriptions.push(formSubscription);
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach((sub) => sub.unsubscribe());
  }

  private draw(data: IDataRow[]) {
    selectAll('svg > *').remove();
    if (data && this.configs) {
      const svg = select('svg')
        .style(
          'height',
          this.configs.height + this.configs.top + this.configs.bottom
        )
        .style('width', this.configs.width)
        .append('g')
        .attr(
          'transform',
          `translate(${this.configs.left},${this.configs.top})`
        );

      const x = scaleLinear()
        .domain([0, max(data, (d) => d.populationDensity)])
        .range([0, this.configs.width]);
      const xAxisLabels = range(x.domain()[1]).filter((el) => el % 200 === 0);

      const y = scaleLinear()
        .domain([
          min(data, (d) => d.populationGrowthRate) - 2,
          max(data, (d) => d.populationGrowthRate) + 2,
        ])
        .range([this.configs.height, 0]);

      const densityRange = [
        min(data, (d) => d.population),
        max(data, (d) => d.population),
      ];

      const scaleRadius = scaleLinear().domain(densityRange).range([3, 20]);

      const mouseover = (event: MouseEvent, d: IDataRow) => {
        const circle = event.target as SVGRectElement;
        this.renderer.setStyle(circle, 'opacity', '0.9');
        select('.tooltip')
          .html(
            `<span><b>Country</b> : ${d.country}</span><br>
            <span><b>Region</b> : ${d.region}</span><br>
            <span><b>Population</b> : ${d.population}</span><br>
            <span><b>Density</b> : ${d.populationDensity}</span><br>
            <span><b>Growth rate</b> : ${d.populationGrowthRate}</span><br>`
          )
          .style('display', 'block')
          .style('opacity', 1)
          .style('position', 'absolute')
          .style('left', `${event.pageX}px`)
          .style('top', `${event.pageY}px`);
      };

      const mouseleave = (event: MouseEvent, d: IDataRow) => {
        const circle = event.target as SVGRectElement;
        this.renderer.setStyle(circle, 'opacity', '1');
        select('.tooltip').style('display', 'none');
      };

      const setColor = (d: IDataRow) => {
        return d.region === 'Europe and Africa'
          ? this.configs.colorsArray[0]
          : d.region === 'Asia and Pacific'
          ? this.configs.colorsArray[1]
          : this.configs.colorsArray[2];
      };

      svg
        .append('g')
        .attr('transform', `translate(0,${this.configs.height})`)
        .call(
          axisBottom(x).tickPadding(10).tickSize(0).tickValues(xAxisLabels)
        );
      svg
        .append('text')
        .attr('transform', 'rotate(0)')
        .attr('y', this.configs.height + this.configs.top + 20)
        .attr('x', this.configs.width / 2)
        .attr('dx', '1em')
        .style('font-family', 'cursive')
        .style('text-anchor', 'middle')
        .text('Population Density');

      svg.append('g').call(axisLeft(y).tickPadding(10).tickSize(0));
      svg
        .append('text')
        .attr('transform', 'rotate(-90)')
        .attr('y', -this.configs.left)
        .attr('x', -(this.configs.height / 2))
        .attr('dy', '1.5em')
        .style('text-anchor', 'middle')
        .style('font-family', 'cursive')
        .text('Population Growth(%)');

      svg
        .append('g')
        .selectAll('circle')
        .data(data)
        .enter()
        .append('circle')
        .attr('cx', (d) => x(d.populationDensity))
        .attr('cy', (d) => y(d.populationGrowthRate))
        .attr('r', (d) => scaleRadius(d.population))
        .style('fill', setColor)
        .on('mouseover', mouseover)
        .on('mouseleave', mouseleave);
    }
  }
}
