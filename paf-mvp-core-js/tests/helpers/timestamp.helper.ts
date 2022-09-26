import { Timestamp } from '@onekey/core/model/generated-model';
import { getTimeStampInSec } from '@onekey/core/timestamp';

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
