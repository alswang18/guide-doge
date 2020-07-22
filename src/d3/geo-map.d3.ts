import * as d3 from 'd3';
import { BaseD3, RenderOptions as BaseRenderOptions } from './base.d3';
import * as topojson from 'topojson';
import { GeometryCollection, Topology } from 'topojson-specification';

type WorldTopology = Topology<{ land: GeometryCollection, countries: GeometryCollection }>;

export interface RenderOptions extends BaseRenderOptions {
  topoJsonUrl: string;
}

export class GeoMapD3 extends BaseD3<RenderOptions> {
  render() {
    super.render();

    this.renderMap().catch(console.error);
  }

  async renderMap() {
    const { height, width, topoJsonUrl } = this.renderOptions;

    const projection = d3.geoNaturalEarth1()
      .scale(153)
      .translate([width / 2, height / 2])
      .precision(.1);
    const path = d3.geoPath()
      .projection(projection);
    const graticule = d3.geoGraticule();

    const world = await d3.json(topoJsonUrl) as WorldTopology;

    const landPath = this.svg
      .append('path')
      .datum(topojson.feature(world, world.objects.land))
      .attr('d', path)
      .attr('fill', '#999');

    const boundaryPath = this.svg
      .append('path')
      .datum(topojson.mesh(world, world.objects.countries, (a, b) => a !== b))
      .attr('d', path)
      .attr('fill', 'none')
      .attr('stroke', '#fff')
      .attr('stroke-width', '.5px');

    const graticulePath = this.svg
      .append('path')
      .datum(graticule)
      .attr('d', path)
      .attr('fill', 'none')
      .attr('stroke', '#777')
      .attr('stroke-width', '.5px')
      .attr('stroke-opacity', '.5');
  }
}