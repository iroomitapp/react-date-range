import { CalendarProps } from '../Calendar';
import { type DateRange } from '../DayCell';
export type DateRangeProps = {
    onChange: (dateRange: DateRange) => void;
    onRangeFocusChange?: (range: number[]) => void;
    className?: string;
    ranges?: DateRange[];
    moveRangeOnFirstSelection?: boolean;
    retainEndDateOnFirstSelection?: boolean;
    previewRange?: DateRange;
} & CalendarProps;
export default function DateRange({ ariaLabels, weekStartsOn, weekdayDisplayFormat, editableDateInputs, endDatePlaceholder, showMonthAndYearPickers, onShownDateChange, preventSnapRefocus, preview, scroll, showDateDisplay, showMonthArrow, showPreview, shownDate, startDatePlaceholder, date, dateDisplayFormat, dayContentRenderer, dayDisplayFormat, direction, disabledDay, dragSelectionEnabled, fixedHeight, locale, calendarFocus, className, monthDisplayFormat, months, onChange, classNames, ranges, moveRangeOnFirstSelection, retainEndDateOnFirstSelection, rangeColors, disabledDates, initialFocusedRange, focusedRange, maxDate, minDate, onRangeFocusChange, color, previewRange }: DateRangeProps): import("react/jsx-runtime").JSX.Element;
