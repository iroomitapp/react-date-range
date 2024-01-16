import { FocusEvent, ReactElement, ReactNode } from 'react';
type InputRangeFieldProps = {
    value?: string | number;
    styles: {
        inputRange: string;
        inputRangeInput: string;
        inputRangeLabel?: string;
    };
    placeholder?: string;
    label: ReactElement | ReactNode;
    onChange: (value: number) => void;
    onBlur: (event: FocusEvent<HTMLInputElement>) => void;
    onFocus: (event: FocusEvent<HTMLInputElement>) => void;
};
export default function InputRangeField({ styles, placeholder, value, label, onChange, onBlur, onFocus }: InputRangeFieldProps): import("react/jsx-runtime").JSX.Element;
export {};
