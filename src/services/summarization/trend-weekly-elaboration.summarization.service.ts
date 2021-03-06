import { Injectable } from '@angular/core';
import { map } from 'rxjs/operators';
import { Observable, zip } from 'rxjs';
import { SummarizationDataSourceService } from './summarization-data-source.service';
import { SummaryGroup, Summary } from './types';
import { TimeSeriesPoint } from '../../datasets/metas/types';
import {
  createLinearModel,
  LinearModel,
} from './libs/trend';
import {
  timeSeriesPointToNumPoint,
  groupPointsByXWeek,
} from './utils/time-series';
import { formatY } from '../../utils/formatters';
import { SummarizationService, BaseConfig } from './summarization.service';
import { WeekdayWeekendRelativeConfig, WeekdayWeekendRelativeSummarizationService } from './weekday-weekend-relative.summarization.service';

export interface TrendWeeklyElaborationConfig extends WeekdayWeekendRelativeConfig {
  metric: string;
  metricUnit: string;
}

export type TrendWeeklyElaborationProperties = {
  weekPointArrays: TimeSeriesPoint[][];
  weekLinearModels: LinearModel[];
};

const defaultConfig: Partial<TrendWeeklyElaborationConfig> = {
  metric: 'active users',
  metricUnit: 'users',
};

@Injectable({
  providedIn: 'any',
})
export class TrendWeeklyElaborationSummarizationService extends
  SummarizationService<TimeSeriesPoint, TrendWeeklyElaborationProperties, TrendWeeklyElaborationConfig>  {

  constructor(
    protected summarizationDataSourceService: SummarizationDataSourceService,
    protected weekdayWeekendRelativeSummarizationService: WeekdayWeekendRelativeSummarizationService,
  ) {
    super();
  }

  prepareConfig(config: BaseConfig & Partial<TrendWeeklyElaborationConfig>): TrendWeeklyElaborationConfig {
    return { ...defaultConfig, ...config } as TrendWeeklyElaborationConfig;
  }

  createDataProperties$(config: TrendWeeklyElaborationConfig): Observable<TrendWeeklyElaborationProperties> {
    // The length of datumLabels should be 1 for this summarization
    const { datumLabels } = config;

    return zip(
      this.summarizationDataSourceService.pointsByLabels$(datumLabels),
      this.weekdayWeekendRelativeSummarizationService.dataProperties$(config),
    ).pipe(map(([pointsArray, { weekdayWeekendEqualValidity }]) => {
      // datum label should be unique in data, so length of pointsArray is either 0 or 1
      const points = (pointsArray.length === 0 ? [] : pointsArray[0]) as TimeSeriesPoint[];

      const isWeekdayWeekendEqual = weekdayWeekendEqualValidity > 0.7;

      const uWeekend = (p: TimeSeriesPoint) => {
        const dayOfWeek = p.x.getDay();
        switch (dayOfWeek) {
          case 5: // Friday
            return 0.2;
          case 6: // Saturday
          case 0: // Sunday
            return 1;
          default: // All other days
            return 0;
        }
      };
      const uWeekday = (p: TimeSeriesPoint) => 1 - uWeekend(p);
      const isWeekend = (p: TimeSeriesPoint) => uWeekend(p) > 0.5;
      const isWeekday = (p: TimeSeriesPoint) => uWeekday(p) > 0.5;

      // Only consider weeks with more than 3 days when creating summaries
      // Weeks with 3 days or less are considered to belong to last/next 30 days
      const weekPointArrays = groupPointsByXWeek(points).filter(weekPoints => weekPoints.length >= 4);

      // TODO: Create rate comparison summaries with fuzzy logic for both weekday and overall points
      const weekLinearModels = weekPointArrays.map(weekPoints => {
        if (isWeekdayWeekendEqual) {
          return createLinearModel(weekPoints.map(timeSeriesPointToNumPoint));
        } else {
          return createLinearModel(weekPoints.filter(isWeekday).map(timeSeriesPointToNumPoint));
        }
      });

      return {
        weekPointArrays,
        weekLinearModels,
      };
    }));
  }

  /**
   * Create summaries that describe the linear dynamic in each of the week individually. It depends
   * on the data properties from WeekdayWeekendRelativeSummarizationService to determine whether to
   * estimate linear model on weekdays only or all 7 days in the week.
   *
   * Sample summaries:
   * - The active users from Monday to Sunday in the first week decreased by 8 users per day from 108 (R2 = 0.12).
   * - The active users from Monday to Sunday in the first week increased by 9 users per day from 170 (R2 = 0.23).
   */
  createSummaries$(config: TrendWeeklyElaborationConfig): Observable<SummaryGroup[]> {
    const { metric, metricUnit } = config;

    return zip(
      this.weekdayWeekendRelativeSummarizationService.dataProperties$(config),
      this.dataProperties$(config),
    ).pipe(map(([
      { weekdayWeekendEqualValidity },
      { weekPointArrays, weekLinearModels }
    ]) => {
      const numOfWeeks = weekPointArrays.length;
      const isWeekdayWeekendEqual = weekdayWeekendEqualValidity > 0.7;

      const ordinalTexts = ['first', 'second', 'third', 'fourth', 'fifth'];
      const summaries: Summary[] = [];

      for (let i = 0; i < numOfWeeks; i++) {
        const weekRate = weekLinearModels[i].gradient;
        const weekStartPrediction = weekLinearModels[i].prediction[0].y;

        const weekRateAbsolute = Math.abs(weekRate);
        const weekdayWeekendDescriptor = isWeekdayWeekendEqual ? 'from Monday to Sunday' : 'from Monday to Friday';

        const dynamicDescriptor = weekRate >= 0 ? 'increased' : 'decreased';

        const r2Text = `R2 = ${weekLinearModels[i].r2}`;
        const text = `The ${metric} <b>${weekdayWeekendDescriptor}</b> in the <b>${ordinalTexts[i]} week</b> <b>${dynamicDescriptor}</b> by <b>${formatY(weekRateAbsolute)}</b> ${metricUnit} per day from ${formatY(weekStartPrediction)} <b>(${r2Text})</b>.`;

        summaries.push({
          text,
          validity: 1.0,
        });

        if (!isWeekdayWeekendEqual) {
          const fridayPoint = weekPointArrays[i].find(({ x }) => x.getDay() === 5);
          const saturdayPoint = weekPointArrays[i].find(({ x }) => x.getDay() === 6);

          if (fridayPoint && saturdayPoint) {
            const yDiff = saturdayPoint.y - fridayPoint.y;
            const yDiffAbsolute = Math.abs(yDiff);
            const yDiffDynamicDescriptor = yDiff >= 0 ? 'increased' : 'decreased';

            const friSatDiffText = `The ${metric} from Friday to Saturday <b>${yDiffDynamicDescriptor} by ${formatY(yDiffAbsolute)}</b> ${metricUnit} in the <b>${ordinalTexts[i]} week.`;
            summaries.push({
              text: friSatDiffText,
              validity: 1.0,
            });
          }
        }
      }
      return [{
        title: 'Trend Weekly Elaboration',
        summaries,
      }];

    }));
  }
}
