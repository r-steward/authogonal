import moment from 'moment';

export interface DateProvider {
  getDateTime(): Date;
}

export class DateProviderSystem implements DateProvider {
  getDateTime(): Date {
    return moment.utc().toDate();
  }
}
