import { WeekOptions } from 'date-fns';
import { StylesType } from './styles';
import { DateRange } from './components/DayCell';
export declare function calcFocusDate(currentFocusedDate: Date, shownDate?: Date, date?: Date, months?: number, ranges?: DateRange[], focusedRange?: number[], displayMode?: "dateRange" | "date"): Date;
export declare function findNextRangeIndex(ranges: DateRange[], currentRangeIndex?: number): number;
export declare function getMonthDisplayRange(date: Date, dateOptions?: WeekOptions, fixedHeight?: boolean): {
    start: Date;
    end: Date;
    startDateOfMonth: Date;
    endDateOfMonth: Date;
};
export declare function generateStyles(sources: Partial<StylesType>[]): Partial<StylesType>;
