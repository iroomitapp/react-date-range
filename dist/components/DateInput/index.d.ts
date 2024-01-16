import { ParseOptions } from 'date-fns';
import React, { FocusEvent } from 'react';
type DateInputProps = {
    value: Date;
    placeholder: string;
    disabled?: boolean;
    readOnly?: boolean;
    dateOptions?: ParseOptions;
    dateDisplayFormat: string;
    ariaLabel?: string;
    className?: string;
    onFocus: (event: FocusEvent<HTMLInputElement>) => void;
    onChange: (date: Date) => void;
};
declare const _default: React.NamedExoticComponent<DateInputProps>;
export default _default;
