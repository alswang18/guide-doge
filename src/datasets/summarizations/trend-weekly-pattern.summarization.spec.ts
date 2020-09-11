import { queryFactory } from './trend-weekly-pattern.summarization';
import { TimeSeriesPoint } from '../metas/types';
import { hasHighValidity, hasLowValidity, isTextPartsInSummary, norSummaryFilters } from './utils/tests';

describe('queryFactory', () => {

  it('should have validity value between 0 and 1.', () => {
    const points: TimeSeriesPoint[] = [];
    for (let i = 1; i <= 31; i++) {
      const x = new Date(2020, 6, i);
      const y = i;
      points.push({ x, y });
    }

    const summaries = queryFactory(points)();
    for (const summary of summaries) {
      expect(summary.validity).toBeGreaterThanOrEqual(0.0);
      expect(summary.validity).toBeLessThanOrEqual(1.0);
    }
  });

  it('should create summaries describing monotonic increasing data.', () => {
    const points: TimeSeriesPoint[] = [];
    for (let i = 6; i <= 26; i++) {
      const x = new Date(2020, 6, i);
      const y = 200 + 5 * i;
      points.push({ x, y });
    }

    const isMondayToSundaySummary = isTextPartsInSummary('Monday', 'Sunday', 'similar');
    const isOtherSummary = norSummaryFilters(
      isMondayToSundaySummary,
    );

    const summaries = queryFactory(points)();
    const mondayToSundaySummary = summaries.filter(isMondayToSundaySummary);
    const otherSummaries = summaries.filter(isOtherSummary);

    expect(mondayToSundaySummary.length).toBe(1);
    expect(mondayToSundaySummary.every(hasHighValidity)).toBeTrue();
    expect(otherSummaries.every(hasLowValidity)).toBeTrue();
  });

  it('should create summaries describing monotonic decreasing data.', () => {
    const points: TimeSeriesPoint[] = [];
    for (let i = 6; i <= 26; i++) {
      const x = new Date(2020, 6, i);
      const y = 300 - 5 * i;
      points.push({ x, y });
    }

    const isMondayToSundaySummary = isTextPartsInSummary('Monday', 'Sunday', 'similar');
    const isOtherSummary = norSummaryFilters(
      isMondayToSundaySummary,
    );

    const summaries = queryFactory(points)();
    const mondayToSundaySummary = summaries.filter(isMondayToSundaySummary);
    const otherSummaries = summaries.filter(isOtherSummary);

    expect(mondayToSundaySummary.length).toBe(1);
    expect(mondayToSundaySummary.every(hasHighValidity)).toBeTrue();
    expect(otherSummaries.every(hasLowValidity)).toBeTrue();
  });

  it('should create summaries describing constant data.', () => {
    const points: TimeSeriesPoint[] = [];
    for (let i = 6; i <= 26; i++) {
      const x = new Date(2020, 6, i);
      const y = 100;
      points.push({ x, y });
    }

    const isMondayToSundaySummary = isTextPartsInSummary('Monday', 'Sunday', 'similar');
    const isOtherSummary = norSummaryFilters(
      isMondayToSundaySummary,
    );

    const summaries = queryFactory(points)();
    const mondayToSundaySummary = summaries.filter(isMondayToSundaySummary);
    const otherSummaries = summaries.filter(isOtherSummary);

    expect(mondayToSundaySummary.length).toBe(1);
    expect(mondayToSundaySummary.every(hasHighValidity)).toBeTrue();
    expect(otherSummaries.every(hasLowValidity)).toBeTrue();
  });

  it('should create summaries describing V shape weekly pattern in constant data.', () => {
    const weekPattern = [120, 60, 30, 10, 30, 60, 90];  // [Sun, Mon, Tue, Wed, Thu, Fri, Sat]
    const points: TimeSeriesPoint[] = [];
    for (let i = 6; i <= 26; i++) {
      const x = new Date(2020, 6, i);
      const y = 250 + weekPattern[x.getDay()];
      points.push({ x, y });
    }

    const isMondayToWednesdaySummary = isTextPartsInSummary('Monday', 'Wednesday', 'decreased');
    const isWednesdayToSundaySummary = isTextPartsInSummary('Wednesday', 'Sunday', 'increased');
    const isOtherSummary = norSummaryFilters(
      isMondayToWednesdaySummary,
      isWednesdayToSundaySummary,
    );

    const summaries = queryFactory(points)();
    const mondayToWednesdaySummary = summaries.filter(isMondayToWednesdaySummary);
    const wednesdayToSundaySummary = summaries.filter(isWednesdayToSundaySummary);
    const otherSummaries = summaries.filter(isOtherSummary);

    expect(mondayToWednesdaySummary.length).toBe(1);
    expect(mondayToWednesdaySummary.every(hasHighValidity)).toBeTrue();
    expect(wednesdayToSundaySummary.length).toBe(1);
    expect(wednesdayToSundaySummary.every(hasHighValidity)).toBeTrue();
    expect(otherSummaries.every(hasLowValidity)).toBeTrue();
  });

  it('should create summaries describing V shape weekly pattern in linearly increasing data.', () => {
    const weekPattern = [120, 60, 30, 10, 30, 60, 90];  // [Sun, Mon, Tue, Wed, Thu, Fri, Sat]
    const points: TimeSeriesPoint[] = [];
    for (let i = 6; i <= 26; i++) {
      const x = new Date(2020, 6, i);
      const y = 200 + i * 5 + weekPattern[x.getDay()];
      points.push({ x, y });
    }

    const isMondayToWednesdaySummary = isTextPartsInSummary('Monday', 'Wednesday', 'decreased');
    const isWednesdayToSundaySummary = isTextPartsInSummary('Wednesday', 'Sunday', 'increased');
    const isOtherSummary = norSummaryFilters(
      isMondayToWednesdaySummary,
      isWednesdayToSundaySummary,
    );

    const summaries = queryFactory(points)();
    const mondayToWednesdaySummary = summaries.filter(isMondayToWednesdaySummary);
    const wednesdayToSundaySummary = summaries.filter(isWednesdayToSundaySummary);
    const otherSummaries = summaries.filter(isOtherSummary);

    expect(mondayToWednesdaySummary.length).toBe(1);
    expect(mondayToWednesdaySummary.every(hasHighValidity)).toBeTrue();
    expect(wednesdayToSundaySummary.length).toBe(1);
    expect(wednesdayToSundaySummary.every(hasHighValidity)).toBeTrue();
    expect(otherSummaries.every(hasLowValidity)).toBeTrue();
  });

  it('should create summaries describing V shape weekly pattern in linearly decreasing data.', () => {
    const weekPattern = [120, 60, 30, 10, 30, 60, 90];  // [Sun, Mon, Tue, Wed, Thu, Fri, Sat]
    const points: TimeSeriesPoint[] = [];
    for (let i = 6; i <= 26; i++) {
      const x = new Date(2020, 6, i);
      const y = 300 - i * 5 + weekPattern[x.getDay()];
      points.push({ x, y });
    }

    const isMondayToWednesdaySummary = isTextPartsInSummary('Monday', 'Wednesday', 'decreased');
    const isWednesdayToSundaySummary = isTextPartsInSummary('Wednesday', 'Sunday', 'increased');
    const isOtherSummary = norSummaryFilters(
      isMondayToWednesdaySummary,
      isWednesdayToSundaySummary,
    );

    const summaries = queryFactory(points)();
    const mondayToWednesdaySummary = summaries.filter(isMondayToWednesdaySummary);
    const wednesdayToSundaySummary = summaries.filter(isWednesdayToSundaySummary);
    const otherSummaries = summaries.filter(isOtherSummary);

    expect(mondayToWednesdaySummary.length).toBe(1);
    expect(mondayToWednesdaySummary.every(hasHighValidity)).toBeTrue();
    expect(wednesdayToSundaySummary.length).toBe(1);
    expect(wednesdayToSundaySummary.every(hasHighValidity)).toBeTrue();
    expect(otherSummaries.every(hasLowValidity)).toBeTrue();
  });

  it('should create summaries describing U shape weekly pattern in constant data.', () => {
    const weekPattern = [100, 100, 50, 0, 0, 0, 50];  // [Sun, Mon, Tue, Wed, Thu, Fri, Sat]
    const points: TimeSeriesPoint[] = [];
    for (let i = 6; i <= 26; i++) {
      const x = new Date(2020, 6, i);
      const y = 250 + weekPattern[x.getDay()];
      points.push({ x, y });
    }

    const isMondayToWednesdaySummary = isTextPartsInSummary('Monday', 'Wednesday', 'decreased');
    const isWednesdayToFridaySummary = isTextPartsInSummary('Wednesday', 'Friday', 'similar');
    const isFridayToSundaySummary = isTextPartsInSummary('Friday', 'Sunday', 'increased');
    const isOtherSummary = norSummaryFilters(
      isMondayToWednesdaySummary,
      isWednesdayToFridaySummary,
      isFridayToSundaySummary,
    );

    const summaries = queryFactory(points)();
    const mondayToWednesdaySummary = summaries.filter(isMondayToWednesdaySummary);
    const wednesdayToFridaySummary = summaries.filter(isWednesdayToFridaySummary);
    const fridayToSundaySummary = summaries.filter(isFridayToSundaySummary);
    const otherSummaries = summaries.filter(isOtherSummary);

    expect(mondayToWednesdaySummary.length).toBe(1);
    expect(mondayToWednesdaySummary.every(hasHighValidity)).toBeTrue();
    expect(wednesdayToFridaySummary.length).toBe(1);
    expect(wednesdayToFridaySummary.every(hasHighValidity)).toBeTrue();
    expect(fridayToSundaySummary.length).toBe(1);
    expect(fridayToSundaySummary.every(hasHighValidity)).toBeTrue();
    expect(otherSummaries.every(hasLowValidity)).toBeTrue();
  });

  it('should create summaries describing U shape weekly pattern in linearly increasing data.', () => {
    const weekPattern = [100, 100, 50, 0, 0, 0, 50];  // [Sun, Mon, Tue, Wed, Thu, Fri, Sat]
    const points: TimeSeriesPoint[] = [];
    for (let i = 6; i <= 26; i++) {
      const x = new Date(2020, 6, i);
      const y = 200 + i * 5 + weekPattern[x.getDay()];
      points.push({ x, y });
    }

    const isMondayToWednesdaySummary = isTextPartsInSummary('Monday', 'Wednesday', 'decreased');
    const isWednesdayToFridaySummary = isTextPartsInSummary('Wednesday', 'Friday', 'similar');
    const isFridayToSundaySummary = isTextPartsInSummary('Friday', 'Sunday', 'increased');
    const isOtherSummary = norSummaryFilters(
      isMondayToWednesdaySummary,
      isWednesdayToFridaySummary,
      isFridayToSundaySummary,
    );

    const summaries = queryFactory(points)();
    const mondayToWednesdaySummary = summaries.filter(isMondayToWednesdaySummary);
    const wednesdayToFridaySummary = summaries.filter(isWednesdayToFridaySummary);
    const fridayToSundaySummary = summaries.filter(isFridayToSundaySummary);
    const otherSummaries = summaries.filter(isOtherSummary);

    expect(mondayToWednesdaySummary.length).toBe(1);
    expect(mondayToWednesdaySummary.every(hasHighValidity)).toBeTrue();
    expect(wednesdayToFridaySummary.length).toBe(1);
    expect(wednesdayToFridaySummary.every(hasHighValidity)).toBeTrue();
    expect(fridayToSundaySummary.length).toBe(1);
    expect(fridayToSundaySummary.every(hasHighValidity)).toBeTrue();
    expect(otherSummaries.every(hasLowValidity)).toBeTrue();
  });

  it('should create summaries describing U shape weekly pattern in linearly decreasing data.', () => {
    const weekPattern = [100, 100, 50, 0, 0, 0, 50];  // [Sun, Mon, Tue, Wed, Thu, Fri, Sat]
    const points: TimeSeriesPoint[] = [];
    for (let i = 6; i <= 26; i++) {
      const x = new Date(2020, 6, i);
      const y = 300 - i * 5 + weekPattern[x.getDay()];
      points.push({ x, y });
    }

    const isMondayToWednesdaySummary = isTextPartsInSummary('Monday', 'Wednesday', 'decreased');
    const isWednesdayToFridaySummary = isTextPartsInSummary('Wednesday', 'Friday', 'similar');
    const isFridayToSundaySummary = isTextPartsInSummary('Friday', 'Sunday', 'increased');
    const isOtherSummary = norSummaryFilters(
      isMondayToWednesdaySummary,
      isWednesdayToFridaySummary,
      isFridayToSundaySummary,
    );

    const summaries = queryFactory(points)();
    const mondayToWednesdaySummary = summaries.filter(isMondayToWednesdaySummary);
    const wednesdayToFridaySummary = summaries.filter(isWednesdayToFridaySummary);
    const fridayToSundaySummary = summaries.filter(isFridayToSundaySummary);
    const otherSummaries = summaries.filter(isOtherSummary);

    expect(mondayToWednesdaySummary.length).toBe(1);
    expect(mondayToWednesdaySummary.every(hasHighValidity)).toBeTrue();
    expect(wednesdayToFridaySummary.length).toBe(1);
    expect(wednesdayToFridaySummary.every(hasHighValidity)).toBeTrue();
    expect(fridayToSundaySummary.length).toBe(1);
    expect(fridayToSundaySummary.every(hasHighValidity)).toBeTrue();
    expect(otherSummaries.every(hasLowValidity)).toBeTrue();
  });
});
