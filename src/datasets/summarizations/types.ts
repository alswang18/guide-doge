import { XYPoint } from '../metas/types';

/**
 * Pair type for representing an option of a summary variable.
 * The first element is the text in string of the summary variable option, and the second element
 * is the membership function.
 */
export type SummaryVariableOptionPair<T> = [string, T];

export interface Summary {
  text: string;
  validity: number;
}

export type QuerySummariesFactory<PointT> = (points: PointT[]) => () => SummaryGroup[];
