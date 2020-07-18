// run `tsc Scatterplot.ts` to compile into Scatterplot.js file

// for running on browser
// import * as _d3 from 'd3';

// declare global {
// const d3: typeof _d3;
// }

// for running on unit tests
import * as d3 from 'd3';
import * as THREE from 'three';
import { XYPoint, XYZPoint } from '../datasets/metas/types';
import { TimeSeriesPoint } from '../datasets/queries/time-series.query';
import { VRTimeSeriesPoint } from '../datasets/queries/vr-time-series.query';

export class Scatterplot{
    private data: TimeSeriesPoint[] | VRTimeSeriesPoint[];
    private shape: string;
    private container: HTMLElement | null;
    private dataType: string;
    private timeScale: d3.ScaleTime<number, number>;


  constructor(shape: string) {
    this.shape = shape;
  }
  init(container: HTMLElement | null, data: TimeSeriesPoint[] | VRTimeSeriesPoint[], dataType: string){
    this.data = data;
    this.dataType = dataType;
    this.container = container;
    this.generatePts();
    this.setColor('blue');
    this.createSky('gray');
  }
  private scaleTime(date: Date): number{
    console.log(this.data[0].x);
    console.log(this.data[this.data.length -1].x);
    const startTime = this.data[0].x;
    const endTime = this.data[this.data.length -1].x;
    this.timeScale = d3.scaleTime().domain([startTime, endTime]).rangeRound([0, 30]);
    console.log(this.timeScale(date)); 
    return this.timeScale(date);
  }

  private generatePts() {
    // create a scale so that there is correspondence between data set and screen render
    const hscale = d3.scaleLinear();
    // hscale needs to be reassessed - this.data not of type number - need to write function to return max of each dimension
    // hscale.domain([0, d3.max(this.data)]       // max of dataset
    // .range([0, 10]);                                      // linear mapping of data set values to values from 0 to 10
     // enter identifies any DOM elements to be added when # array elements doesn't match
    d3.select(this.container).selectAll(this.shape).data(this.data).enter().append(this.shape);
    // d is data at index, i within
    // select all shapes within given container
    d3.select(this.container).selectAll(this.shape).attr('radius', 0.5);
    d3.select(this.container).selectAll(this.shape).attr('position', (d, i) => {
      const x = this.scaleTime((d as TimeSeriesPoint | VRTimeSeriesPoint).x);
      const y = (d as TimeSeriesPoint | VRTimeSeriesPoint).y;
      if (this.dataType === 'vrScatter'){
        const z = (d as VRTimeSeriesPoint).z;
        return `${x} ${y} ${z}`;
      }
     return `${x} ${y}`;
    });
  }

  private setColor(color) {
    d3.select(this.container).selectAll(this.shape).attr('color', () => {
      return color;
    });
  }

  private createSky(color: string | number){
    const sky = document.createElement('a-sky');
    sky.id = 'sky';
    this.container?.appendChild(sky);
    d3.select(this.container).selectAll('#sky').attr('color', () => {
      return color;
    });
  }
}
