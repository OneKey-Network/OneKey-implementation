import { TransactionId } from '@core/model';
import { SeedEntry } from '@frontend/lib/paf-lib';

class SeedStorageService implements ISeedStorageService {
  /** Internal storage for generated Seeds. */
  private seedStorage = new Map<TransactionId, SeedEntry>();

  saveSeed(transactionId: TransactionId, seedEntry: SeedEntry) {
    this.seedStorage.set(transactionId, seedEntry);
  }

  getSeed(transactionId: TransactionId): SeedEntry | undefined {
    return this.seedStorage.get(transactionId);
  }
}

export interface ISeedStorageService {
  /**
   * Store the seed and its corresponding transactionId
   * @param transactionId
   * @param seedEntry
   */
  saveSeed: (transactionId: TransactionId, seedEntry: SeedEntry) => void;

  /**
   * return the seed for a given transactionId
   * @param transactionId
   */
  getSeed: (transactionId: TransactionId) => SeedEntry | undefined;
}
export const seedStorageService = new SeedStorageService();
