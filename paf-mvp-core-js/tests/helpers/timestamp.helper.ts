import { Timestamp } from '@core/model/generated-model';
import { getTimeStampInSec } from '@core/timestamp';

export class MockTimer {
  get timestamp(): Timestamp {
    return this._timestamp;
  }

  set timestamp(value: Timestamp) {
    this._timestamp = value;
  }

  private _timestamp: Timestamp;

  constructor(timestamp: Timestamp = getTimeStampInSec()) {
    this._timestamp = timestamp;
  }
}
