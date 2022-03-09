import { SnackBar } from '../containers/snack-bar/SnackBar';
import { BasePafWidget } from './base/base-paf-widget';

export class SnackBarWidget extends BasePafWidget {
  constructor() {
    super('[paf-notification]', SnackBar);
  }
}
