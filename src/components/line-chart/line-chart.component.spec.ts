import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LineChartComponent } from './line-chart.component';
import { mockData, mockPoint } from '../../utils/mocks.spec';
import { MatCardModule } from '@angular/material/card';
import { LineChartD3 } from '../../d3/line-chart.d3';

describe('LineChartComponent', () => {
  let fixture: ComponentFixture<LineChartComponent>;
  let component: LineChartComponent;
  let lineChartD3: LineChartD3;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        MatCardModule,
      ],
      declarations: [
        LineChartComponent,
      ],
    });
    fixture = TestBed.createComponent(LineChartComponent);
    component = fixture.componentInstance;
    lineChartD3 = component.lineChartD3;
  });

  it('should instantiate.', () => {
    expect(component).toBeInstanceOf(LineChartComponent);
  });

  it('should have truthy i18n values.', () => {
    component.activePoint = mockPoint;
    expect(component.VISUALIZATION).toBeTruthy();
  });

  it('should have legend items with active points mapped.', () => {
    component.data$.next(mockData);
    component.activePoint = mockPoint;
    const { legendItems } = component;

    expect(legendItems.length).toBeGreaterThan(0);
    for (const legendItem of component.legendItems) {
      expect(legendItem.label).toBeTruthy();
      expect(legendItem.activePoint).toBeTruthy();
    }
  });

  it('should synchronize activePoint with activePoint$.', () => {
    const activePoint = mockPoint;

    component.activePoint = activePoint;

    expect(component.activePoint$.value).toBe(activePoint);
    expect(component.activePoint).toBe(activePoint);
  });

  it('should render d3 on init.', () => {
    spyOn(lineChartD3, 'render');
    component.ngOnInit();
    expect(lineChartD3.render).toHaveBeenCalled();
  });

  it('should clear d3 on destroy.', () => {
    spyOn(lineChartD3, 'clear');
    component.ngOnDestroy();
    expect(lineChartD3.clear).toHaveBeenCalled();
  });
});
