import { DateRange } from './components/DayCell';
export declare function createStaticRanges(ranges: {
    label: string;
    range: () => DateRange;
}[]): {
    label: string;
    range: () => DateRange;
    isSelected(range: DateRange): boolean;
}[];
export declare const defaultStaticRanges: {
    label: string;
    range: () => DateRange;
    isSelected(range: DateRange): boolean;
}[];
export declare const defaultInputRanges: {
    label: string;
    range(value: number): {
        startDate: Date;
        endDate: Date;
    };
    getCurrentValue(range: DateRange): number | "-" | "∞";
}[];
