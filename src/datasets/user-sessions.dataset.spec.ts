import * as UserSessionsDataset from './user-sessions.dataset';
import { Dataset } from './types';
import { createDefault } from '../utils/preferences';
import { Meta, MetaType } from './metas/types';

describe('UserSessionsDataset', () => {
  let dataset: Dataset;
  let currentTime: number;

  beforeEach(() => {
    const config = createDefault(UserSessionsDataset.configMeta);
    dataset = UserSessionsDataset.create(config);
    currentTime = Date.now();
  });

  it('should query data points.', () => {
    const testMeta = (meta: Meta) => {
      if (meta.type === MetaType.BAR_CHART || meta.type === MetaType.PIE_CHART) {
        const points = meta.queryData({});
        expect(points.length).toBeGreaterThan(0);
      } else {
        throw new Error(`Unexpected meta type '${meta.type}'.`);
      }
    };

    dataset.metas.map(testMeta);
  });
});
