import { ReactElement } from 'react';
import { DateRange } from '../DayCell';
export type DefinedRangeProps = {
    inputRanges?: {
        label: string;
        range: (value: number) => DateRange;
        getCurrentValue: (range: DateRange) => number | "-" | "∞";
    }[];
    staticRanges?: {
        label: string;
        range: () => DateRange;
        isSelected: (value: DateRange) => boolean;
        hasCustomRendering?: boolean;
    }[];
    ranges?: DateRange[];
    className?: string;
    headerContent?: ReactElement;
    footerContent?: ReactElement;
    focusedRange?: number[];
    rangeColors?: string[];
    focusNextRangeOnDefinedRangeClick?: boolean;
    onPreviewChange?: (value?: DateRange) => void;
    onChange?: (value: {
        [x: string]: DateRange;
    }) => void;
    renderStaticRangeLabel?: (staticRange: DefinedRangeProps["staticRanges"][number]) => ReactElement;
    onRangeFocusChange?: (range: number[]) => void;
};
export default function DefinedRange({ className, headerContent, footerContent, inputRanges, staticRanges, rangeColors, ranges, focusedRange, focusNextRangeOnDefinedRangeClick, onChange, onPreviewChange, renderStaticRangeLabel, onRangeFocusChange }: DefinedRangeProps): import("react/jsx-runtime").JSX.Element;
