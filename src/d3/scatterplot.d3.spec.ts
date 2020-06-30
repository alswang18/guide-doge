import { Scatterplot } from './scatterplot.d3';
import { resolve } from 'dns';

describe('VR Scatter Plot', () => {
  const shape = 'a-sphere';
  let element: HTMLElement;
  let scatterplot: Scatterplot;

  beforeEach( () =>  {
    element = document.createElement('a-scene');
    scatterplot = new Scatterplot(shape);
  });
  it('places no points bc 1:1 correspondence with empty element array', () => {
    scatterplot.init(element, []);
    const expectedPosArray = [];
    const result = getPosition(element, shape);
    expect(result).toEqual(expectedPosArray);
  });
  it('places points for each element in a one element array', () => {
    scatterplot.init(element, [10]);
    const expectedPosArray = [{ x: 0, y: 0, z: -20 }];
    const result = getPosition(element, shape);
    expect(result).toEqual(expectedPosArray);
  });
  it('places points for each element in a two element array', () => {
    scatterplot.init(element, [10, 10]);
    const expectedPosArray = [{ x: 0, y: 0, z: -20 }, { x: 5, y: 10, z: -20 }];
    const result = getPosition(element, shape);
    expect(result).toEqual(expectedPosArray);
  });
  it('places points for each element in a eight element array', () => {
    scatterplot.init(element, [10, 10, 20, 20, 30, 30, 40, 40]);
    const expectedPosArray = [
      { x: 0, y: 0, z: -20 }, { x: 5, y: 10, z: -20 },
      { x: 10, y: 20, z: -40 }, { x: 15, y: 30, z: -40 },
      { x: 20, y: 40, z: -60 }, { x: 25, y: 50, z: -60 },
     { x: 30, y: 60, z: -80 }, { x: 35, y: 70, z: -80 }];
    const result = getPosition(element, shape);
    expect(result).toEqual(expectedPosArray);
  });
});

// returns array of actual position vectors
function getPosition(element: HTMLElement, shape: string): Array<{x: number, y: number, z: number}>{
  const childrenArray = element.querySelectorAll(shape);
  const positionArray: Array<{x: number, y: number, z: number}> = [];
  for (const child of (childrenArray as any)){
    positionArray.push((child as any).components.position.attrValue);
  }
  return positionArray;
}
