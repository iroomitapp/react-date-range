"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = Calendar;
var _react = _interopRequireDefault(require("react"));
var _dateFns = require("date-fns");
var _enUS = require("date-fns/locale/en-US");
var _utils = require("../../utils");
var _styles = _interopRequireDefault(require("../../styles"));
var _DateInput = _interopRequireDefault(require("../DateInput"));
var _classnames = _interopRequireDefault(require("classnames"));
var _reactList = _interopRequireDefault(require("react-list"));
var _Month = _interopRequireDefault(require("../Month"));
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
function Calendar(_ref) {
  let {
    showMonthArrow = true,
    showMonthAndYearPickers = true,
    disabledDates = [],
    disabledDay = () => false,
    minDate = (0, _dateFns.addYears)(new Date(), -100),
    maxDate = (0, _dateFns.addYears)(new Date(), 20),
    date,
    onChange,
    onPreviewChange,
    onRangeFocusChange,
    classNames = {},
    locale = _enUS.enUS,
    shownDate,
    onShownDateChange,
    ranges = [],
    preview,
    dateDisplayFormat = 'MMM d, yyyy',
    monthDisplayFormat = 'MMM yyyy',
    weekdayDisplayFormat = 'E',
    weekStartsOn,
    dayDisplayFormat = 'd',
    focusedRange = [0, 0],
    dayContentRenderer,
    months = 1,
    className,
    showDateDisplay = true,
    showPreview = true,
    displayMode = 'date',
    color = '#3d91ff',
    updateRange,
    scroll = {
      enabled: false
    },
    direction = 'vertical',
    startDatePlaceholder = `Early`,
    endDatePlaceholder = `Continuous`,
    rangeColors = ['#3d91ff', '#3ecf8e', '#fed14c'],
    editableDateInputs = false,
    dragSelectionEnabled = true,
    fixedHeight = false,
    calendarFocus = 'forwards',
    preventSnapRefocus = false,
    ariaLabels = {},
    preventScrollToFocusedMonth = false
  } = _ref;
  const refs = _react.default.useRef({
    dateOptions: {
      locale,
      weekStartsOn
    },
    styles: (0, _utils.generateStyles)([_styles.default, classNames]),
    listSizeCache: {},
    list: null,
    scroll,
    isFirstRender: true,
    date: date,
    ranges: ranges
  });
  const [state, setState] = _react.default.useState({
    monthNames: getMonthNames(locale),
    focusedDate: (0, _utils.calcFocusDate)(null, shownDate, date, months, ranges, focusedRange, displayMode),
    drag: {
      status: false,
      range: {
        startDate: null,
        endDate: null
      },
      disablePreview: false
    },
    scrollArea: calcScrollArea(direction, months, scroll),
    preview: undefined
  });
  const updateShownDate = () => {
    const newFocus = (0, _utils.calcFocusDate)(state.focusedDate, shownDate, date, months, ranges, focusedRange, displayMode);
    focusToDate(newFocus);
  };
  _react.default.useEffect(() => {
    if (JSON.stringify(ranges) != JSON.stringify(refs.current.ranges) || date?.getTime?.() != refs.current.date?.getTime?.()) {
      refs.current.ranges = ranges;
      refs.current.date = date;
      if (!preventScrollToFocusedMonth) {
        updateShownDate();
      }
    }
    if (refs.current.dateOptions.locale != locale) {
      refs.current.dateOptions.locale = locale;
      setState(s => ({
        ...s,
        monthNames: getMonthNames(locale)
      }));
    }
    refs.current.dateOptions.weekStartsOn = weekStartsOn;
    if (JSON.stringify(refs.current.scroll) != JSON.stringify(scroll)) {
      refs.current.scroll = scroll;
      setState(s => ({
        ...s,
        scrollArea: calcScrollArea(direction, months, scroll)
      }));
    }
  }, [ranges, date, scroll, direction, months, locale, weekStartsOn]);
  _react.default.useEffect(() => {
    if (scroll.enabled) {
      focusToDate(state.focusedDate);
    }
  }, [scroll.enabled]);
  const isVertical = direction === 'vertical';
  const onDragSelectionStart = date => {
    if (dragSelectionEnabled) {
      setState({
        ...state,
        drag: {
          status: true,
          range: {
            startDate: date,
            endDate: date
          },
          disablePreview: false
        }
      });
    } else {
      onChange?.(date);
    }
  };
  const onDragSelectionEnd = date => {
    if (!dragSelectionEnabled) {
      return;
    }
    if (displayMode == 'date' || !state.drag.status) {
      onChange?.(date);
      return;
    }
    const newRange = {
      startDate: state.drag.range.startDate,
      endDate: date
    };
    if (displayMode != 'dateRange' || (0, _dateFns.isSameDay)(newRange.startDate, date)) {
      setState({
        ...state,
        drag: {
          status: false,
          range: {
            startDate: null,
            endDate: null
          },
          disablePreview: state.drag.disablePreview
        }
      });
      onChange?.(date);
    } else {
      setState({
        ...state,
        drag: {
          status: false,
          range: {
            startDate: null,
            endDate: null
          },
          disablePreview: state.drag.disablePreview
        }
      });
      updateRange?.(newRange);
    }
  };
  const onDragSelectionMove = date => {
    if (!state.drag.status || !dragSelectionEnabled) {
      return;
    }
    setState({
      ...state,
      drag: {
        status: state.drag.status,
        range: {
          startDate: state.drag.range.startDate,
          endDate: date
        },
        disablePreview: state.drag.disablePreview
      }
    });
  };
  const handleRangeFocusChange = (rangesIndex, rangeItemIndex) => {
    onRangeFocusChange?.([rangesIndex, rangeItemIndex]);
  };
  const estimateMonthSize = (index, cache) => {
    if (cache) {
      refs.current.listSizeCache = cache;
      if (cache[index]) {
        return cache[index];
      }
    }
    if (direction == 'horizontal') {
      return state.scrollArea.monthWidth;
    }
    const monthStep = (0, _dateFns.addMonths)(minDate, index);
    const {
      start,
      end
    } = (0, _utils.getMonthDisplayRange)(monthStep, refs.current.dateOptions);
    const isLongMonth = (0, _dateFns.differenceInDays)(end, start) + 1 > 7 * 5;
    return isLongMonth ? state.scrollArea.longMonthHeight : state.scrollArea.monthHeight;
  };
  const handleScroll = () => {
    const visibleMonths = refs.current.list.getVisibleRange();
    if (visibleMonths[0] === undefined) return;
    const visibleMonth = (0, _dateFns.addMonths)(minDate, visibleMonths[0] || 0);
    const isFocusedToDifferent = !(0, _dateFns.isSameMonth)(visibleMonth, state.focusedDate);
    if (isFocusedToDifferent && !refs.current.isFirstRender) {
      setState(s => ({
        ...s,
        focusedDate: visibleMonth
      }));
      onShownDateChange?.(visibleMonth);
    }
    refs.current.isFirstRender = false;
  };
  const updatePreview = val => {
    if (!val) {
      setState(s => ({
        ...s,
        preview: undefined
      }));
      return;
    }
    const preview = {
      startDate: val,
      endDate: val,
      color: color
    };
    setState(s => ({
      ...s,
      preview
    }));
  };
  const focusToDate = function (date) {
    let preventUnnecessary = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : true;
    if (!scroll.enabled) {
      if (preventUnnecessary && preventSnapRefocus) {
        const focusedDateDiff = (0, _dateFns.differenceInCalendarMonths)(date, state.focusedDate);
        const isAllowedForward = calendarFocus === 'forwards' && focusedDateDiff >= 0;
        const isAllowedBackward = calendarFocus === 'backwards' && focusedDateDiff <= 0;
        if ((isAllowedForward || isAllowedBackward) && Math.abs(focusedDateDiff) < months) {
          return;
        }
      }
      setState(s => ({
        ...s,
        focusedDate: date
      }));
      return;
    }
    const targetMonthIndex = (0, _dateFns.differenceInCalendarMonths)(date, minDate);
    const visibleMonths = refs.current.list.getVisibleRange();
    if (preventUnnecessary && visibleMonths.includes(targetMonthIndex)) return;
    refs.current.isFirstRender = true;
    refs.current.list.scrollTo(targetMonthIndex);
    setState(s => ({
      ...s,
      focusedDate: date
    }));
  };
  const changeShownDate = function (value) {
    let mode = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : "set";
    const modeMapper = {
      monthOffset: () => (0, _dateFns.addMonths)(state.focusedDate, value),
      setMonth: () => (0, _dateFns.setMonth)(state.focusedDate, value),
      setYear: () => (0, _dateFns.setYear)(state.focusedDate, value),
      set: () => value
    };
    const newDate = (0, _dateFns.min)([(0, _dateFns.max)([modeMapper[mode](), minDate]), maxDate]);
    focusToDate(newDate, false);
    onShownDateChange?.(newDate);
  };
  const rangesInternal = ranges.map((range, i) => ({
    ...range,
    color: range.color || rangeColors[i] || color
  }));
  return /*#__PURE__*/_react.default.createElement("div", {
    className: (0, _classnames.default)(refs.current.styles.calendarWrapper, className),
    onMouseUp: () => {
      setState({
        ...state,
        drag: {
          status: false,
          range: {
            startDate: null,
            endDate: null
          },
          disablePreview: false
        }
      });
    },
    onMouseLeave: () => {
      setState({
        ...state,
        drag: {
          status: false,
          range: {
            startDate: null,
            endDate: null
          },
          disablePreview: false
        }
      });
    }
  }, showDateDisplay ? /*#__PURE__*/_react.default.createElement(DateDisplay, {
    onDragSelectionEnd: onDragSelectionEnd,
    handleRangeFocusChange: handleRangeFocusChange,
    dateOptions: refs.current.dateOptions,
    ariaLabels: ariaLabels,
    styles: refs.current.styles,
    startDatePlaceholder: startDatePlaceholder,
    endDatePlaceholder: endDatePlaceholder,
    editableDateInputs: editableDateInputs,
    focusedRange: focusedRange,
    color: color,
    ranges: rangesInternal,
    rangeColors: rangeColors,
    dateDisplayFormat: dateDisplayFormat
  }) : null, /*#__PURE__*/_react.default.createElement(MonthAndYear, {
    monthNames: state.monthNames,
    focusedDate: state.focusedDate,
    changeShownDate: changeShownDate,
    styles: refs.current.styles,
    showMonthAndYearPickers: showMonthAndYearPickers,
    showMonthArrow: showMonthArrow,
    minDate: minDate,
    maxDate: maxDate,
    ariaLabels: ariaLabels
  }), scroll.enabled ? /*#__PURE__*/_react.default.createElement("div", null, isVertical ? /*#__PURE__*/_react.default.createElement(Weekdays, {
    styles: refs.current.styles,
    dateOptions: refs.current.dateOptions,
    weekdayDisplayFormat: weekdayDisplayFormat
  }) : null, /*#__PURE__*/_react.default.createElement("div", {
    className: (0, _classnames.default)(refs.current.styles.infiniteMonths, isVertical ? refs.current.styles.monthsVertical : refs.current.styles.monthsHorizontal),
    onMouseLeave: () => onPreviewChange?.(),
    style: {
      width: typeof state.scrollArea.calendarWidth === 'string' ? state.scrollArea.calendarWidth : (state.scrollArea.calendarWidth || 0) + 11,
      height: state.scrollArea.calendarHeight + 11
    },
    onScroll: handleScroll
  }, /*#__PURE__*/_react.default.createElement(_reactList.default, {
    length: (0, _dateFns.differenceInCalendarMonths)((0, _dateFns.endOfMonth)(maxDate), (0, _dateFns.addDays)((0, _dateFns.startOfMonth)(minDate), -1)),
    type: "variable",
    ref: target => {
      refs.current.list = target;
    },
    itemSizeEstimator: estimateMonthSize,
    axis: isVertical ? 'y' : 'x',
    itemRenderer: (index, key) => {
      const monthStep = (0, _dateFns.addMonths)(minDate, index);
      return /*#__PURE__*/_react.default.createElement(_Month.default, {
        dayContentRenderer: dayContentRenderer,
        fixedHeight: fixedHeight,
        showPreview: showPreview,
        weekdayDisplayFormat: weekdayDisplayFormat,
        dayDisplayFormat: dayDisplayFormat,
        displayMode: displayMode,
        onPreviewChange: onPreviewChange || updatePreview,
        preview: preview || state.preview,
        ranges: rangesInternal,
        key: key,
        focusedRange: focusedRange,
        drag: state.drag,
        monthDisplayFormat: monthDisplayFormat,
        dateOptions: refs.current.dateOptions,
        disabledDates: disabledDates,
        disabledDay: disabledDay,
        month: monthStep,
        onDragSelectionStart: onDragSelectionStart,
        onDragSelectionEnd: onDragSelectionEnd,
        onDragSelectionMove: onDragSelectionMove,
        onMouseLeave: () => onPreviewChange?.(),
        styles: refs.current.styles,
        style: isVertical ? {
          height: estimateMonthSize(index)
        } : {
          height: state.scrollArea.monthHeight,
          width: estimateMonthSize(index)
        },
        showMonthName: true,
        showWeekDays: !isVertical,
        color: color,
        maxDate: maxDate,
        minDate: minDate,
        date: date
      });
    }
  }))) : /*#__PURE__*/_react.default.createElement("div", {
    className: (0, _classnames.default)(refs.current.styles.months, isVertical ? refs.current.styles.monthsVertical : refs.current.styles.monthsHorizontal)
  }, new Array(months).fill(null).map((_, i) => {
    let monthStep = (0, _dateFns.addMonths)(state.focusedDate, i);
    ;
    if (calendarFocus === 'backwards') {
      monthStep = (0, _dateFns.subMonths)(state.focusedDate, months - 1 - i);
    }
    return /*#__PURE__*/_react.default.createElement(_Month.default, {
      dayContentRenderer: dayContentRenderer,
      fixedHeight: fixedHeight,
      weekdayDisplayFormat: weekdayDisplayFormat,
      dayDisplayFormat: dayDisplayFormat,
      monthDisplayFormat: monthDisplayFormat,
      style: {},
      showPreview: showPreview,
      displayMode: displayMode,
      onPreviewChange: onPreviewChange || updatePreview,
      preview: preview || state.preview,
      ranges: rangesInternal,
      key: i,
      drag: state.drag,
      focusedRange: focusedRange,
      dateOptions: refs.current.dateOptions,
      disabledDates: disabledDates,
      disabledDay: disabledDay,
      month: monthStep,
      onDragSelectionStart: onDragSelectionStart,
      onDragSelectionEnd: onDragSelectionEnd,
      onDragSelectionMove: onDragSelectionMove,
      onMouseLeave: () => onPreviewChange?.(),
      styles: refs.current.styles,
      showWeekDays: !isVertical || i === 0,
      showMonthName: !isVertical || i > 0,
      color: color,
      maxDate: maxDate,
      minDate: minDate,
      date: date
    });
  })));
}
function MonthAndYear(_ref2) {
  let {
    styles,
    showMonthArrow,
    minDate,
    maxDate,
    ariaLabels,
    focusedDate,
    showMonthAndYearPickers,
    changeShownDate,
    monthNames
  } = _ref2;
  const upperYearLimit = maxDate.getFullYear();
  const lowerYearLimit = minDate.getFullYear();
  return /*#__PURE__*/_react.default.createElement("div", {
    onMouseUp: e => e.stopPropagation(),
    className: styles.monthAndYearWrapper
  }, showMonthArrow ? /*#__PURE__*/_react.default.createElement("button", {
    type: "button",
    className: (0, _classnames.default)(styles.nextPrevButton, styles.prevButton),
    onClick: () => changeShownDate(-1, 'monthOffset'),
    "aria-label": ariaLabels.prevButton
  }, /*#__PURE__*/_react.default.createElement("i", null)) : null, showMonthAndYearPickers ? /*#__PURE__*/_react.default.createElement("span", {
    className: styles.monthAndYearPickers
  }, /*#__PURE__*/_react.default.createElement("span", {
    className: styles.monthPicker
  }, /*#__PURE__*/_react.default.createElement("select", {
    value: focusedDate.getMonth(),
    onChange: e => changeShownDate(Number(e.target.value), 'setMonth'),
    "aria-label": ariaLabels.monthPicker
  }, monthNames.map((monthName, i) => /*#__PURE__*/_react.default.createElement("option", {
    key: i,
    value: i
  }, monthName)))), /*#__PURE__*/_react.default.createElement("span", {
    className: styles.monthAndYearDivider
  }), /*#__PURE__*/_react.default.createElement("span", {
    className: styles.yearPicker
  }, /*#__PURE__*/_react.default.createElement("select", {
    value: focusedDate.getFullYear(),
    onChange: e => changeShownDate(Number(e.target.value), 'setYear'),
    "aria-label": ariaLabels.yearPicker
  }, new Array(upperYearLimit - lowerYearLimit + 1).fill(upperYearLimit).map((val, i) => {
    const year = val - i;
    return /*#__PURE__*/_react.default.createElement("option", {
      key: year,
      value: year
    }, year);
  })))) : /*#__PURE__*/_react.default.createElement("span", {
    className: styles.monthAndYearPickers
  }, monthNames[focusedDate.getMonth()], " ", focusedDate.getFullYear()), showMonthArrow ? /*#__PURE__*/_react.default.createElement("button", {
    type: "button",
    className: (0, _classnames.default)(styles.nextPrevButton, styles.nextButton),
    onClick: () => changeShownDate(+1, 'monthOffset'),
    "aria-label": ariaLabels.nextButton
  }, /*#__PURE__*/_react.default.createElement("i", null)) : null);
}
function Weekdays(_ref3) {
  let {
    styles,
    dateOptions,
    weekdayDisplayFormat
  } = _ref3;
  const now = new Date();
  return /*#__PURE__*/_react.default.createElement("div", {
    className: styles.weekDays
  }, (0, _dateFns.eachDayOfInterval)({
    start: (0, _dateFns.startOfWeek)(now, dateOptions),
    end: (0, _dateFns.endOfWeek)(now, dateOptions)
  }).map((day, i) => /*#__PURE__*/_react.default.createElement("span", {
    className: styles.weekDay,
    key: i
  }, (0, _dateFns.format)(day, weekdayDisplayFormat, dateOptions))));
}
function DateDisplay(_ref4) {
  let {
    focusedRange,
    color,
    ranges,
    rangeColors,
    dateDisplayFormat,
    editableDateInputs,
    startDatePlaceholder,
    endDatePlaceholder,
    ariaLabels,
    styles,
    dateOptions,
    onDragSelectionEnd,
    handleRangeFocusChange
  } = _ref4;
  const defaultColor = rangeColors[focusedRange[0]] || color;
  return /*#__PURE__*/_react.default.createElement("div", {
    className: styles.dateDisplayWrapper
  }, ranges.map((range, i) => {
    if (range.showDateDisplay === false || range.disabled && !range.showDateDisplay) return null;
    return /*#__PURE__*/_react.default.createElement("div", {
      className: styles.dateDisplay,
      key: i,
      style: {
        color: range.color || defaultColor
      }
    }, /*#__PURE__*/_react.default.createElement(_DateInput.default, {
      className: (0, _classnames.default)(styles.dateDisplayItem, {
        [styles.dateDisplayItemActive]: focusedRange[0] === i && focusedRange[1] === 0
      }),
      readOnly: !editableDateInputs,
      disabled: range.disabled,
      value: range.startDate,
      placeholder: startDatePlaceholder,
      dateOptions: dateOptions,
      dateDisplayFormat: dateDisplayFormat,
      ariaLabel: ariaLabels.dateInput && ariaLabels.dateInput[range.key] && ariaLabels.dateInput[range.key].startDate,
      onChange: onDragSelectionEnd,
      onFocus: () => handleRangeFocusChange(i, 0)
    }), /*#__PURE__*/_react.default.createElement(_DateInput.default, {
      className: (0, _classnames.default)(styles.dateDisplayItem, {
        [styles.dateDisplayItemActive]: focusedRange[0] === i && focusedRange[1] === 1
      }),
      readOnly: !editableDateInputs,
      disabled: range.disabled,
      value: range.endDate,
      placeholder: endDatePlaceholder,
      dateOptions: dateOptions,
      dateDisplayFormat: dateDisplayFormat,
      ariaLabel: ariaLabels.dateInput && ariaLabels.dateInput[range.key] && ariaLabels.dateInput[range.key].endDate,
      onChange: onDragSelectionEnd,
      onFocus: () => handleRangeFocusChange(i, 1)
    }));
  }));
}
function getMonthNames(locale) {
  return [...Array(12).keys()].map(i => locale.localize.month(i));
}
function calcScrollArea(direction, months, scroll) {
  if (!scroll.enabled) return {
    enabled: false
  };
  const longMonthHeight = scroll.longMonthHeight || scroll.monthHeight;
  if (direction === 'vertical') {
    return {
      enabled: true,
      monthHeight: scroll.monthHeight || 220,
      longMonthHeight: longMonthHeight || 260,
      calendarWidth: 'auto',
      calendarHeight: (scroll.calendarHeight || longMonthHeight || 240) * months
    };
  }
  return {
    enabled: true,
    monthWidth: scroll.monthWidth || 332,
    calendarWidth: (scroll.calendarWidth || scroll.monthWidth || 332) * months,
    monthHeight: longMonthHeight || 300,
    calendarHeight: longMonthHeight || 300
  };
}
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJfcmVhY3QiLCJfaW50ZXJvcFJlcXVpcmVEZWZhdWx0IiwicmVxdWlyZSIsIl9kYXRlRm5zIiwiX2VuVVMiLCJfdXRpbHMiLCJfc3R5bGVzIiwiX0RhdGVJbnB1dCIsIl9jbGFzc25hbWVzIiwiX3JlYWN0TGlzdCIsIl9Nb250aCIsIm9iaiIsIl9fZXNNb2R1bGUiLCJkZWZhdWx0IiwiQ2FsZW5kYXIiLCJfcmVmIiwic2hvd01vbnRoQXJyb3ciLCJzaG93TW9udGhBbmRZZWFyUGlja2VycyIsImRpc2FibGVkRGF0ZXMiLCJkaXNhYmxlZERheSIsIm1pbkRhdGUiLCJhZGRZZWFycyIsIkRhdGUiLCJtYXhEYXRlIiwiZGF0ZSIsIm9uQ2hhbmdlIiwib25QcmV2aWV3Q2hhbmdlIiwib25SYW5nZUZvY3VzQ2hhbmdlIiwiY2xhc3NOYW1lcyIsImxvY2FsZSIsImVuVVMiLCJzaG93bkRhdGUiLCJvblNob3duRGF0ZUNoYW5nZSIsInJhbmdlcyIsInByZXZpZXciLCJkYXRlRGlzcGxheUZvcm1hdCIsIm1vbnRoRGlzcGxheUZvcm1hdCIsIndlZWtkYXlEaXNwbGF5Rm9ybWF0Iiwid2Vla1N0YXJ0c09uIiwiZGF5RGlzcGxheUZvcm1hdCIsImZvY3VzZWRSYW5nZSIsImRheUNvbnRlbnRSZW5kZXJlciIsIm1vbnRocyIsImNsYXNzTmFtZSIsInNob3dEYXRlRGlzcGxheSIsInNob3dQcmV2aWV3IiwiZGlzcGxheU1vZGUiLCJjb2xvciIsInVwZGF0ZVJhbmdlIiwic2Nyb2xsIiwiZW5hYmxlZCIsImRpcmVjdGlvbiIsInN0YXJ0RGF0ZVBsYWNlaG9sZGVyIiwiZW5kRGF0ZVBsYWNlaG9sZGVyIiwicmFuZ2VDb2xvcnMiLCJlZGl0YWJsZURhdGVJbnB1dHMiLCJkcmFnU2VsZWN0aW9uRW5hYmxlZCIsImZpeGVkSGVpZ2h0IiwiY2FsZW5kYXJGb2N1cyIsInByZXZlbnRTbmFwUmVmb2N1cyIsImFyaWFMYWJlbHMiLCJwcmV2ZW50U2Nyb2xsVG9Gb2N1c2VkTW9udGgiLCJyZWZzIiwiUmVhY3QiLCJ1c2VSZWYiLCJkYXRlT3B0aW9ucyIsInN0eWxlcyIsImdlbmVyYXRlU3R5bGVzIiwiY29yZVN0eWxlcyIsImxpc3RTaXplQ2FjaGUiLCJsaXN0IiwiaXNGaXJzdFJlbmRlciIsInN0YXRlIiwic2V0U3RhdGUiLCJ1c2VTdGF0ZSIsIm1vbnRoTmFtZXMiLCJnZXRNb250aE5hbWVzIiwiZm9jdXNlZERhdGUiLCJjYWxjRm9jdXNEYXRlIiwiZHJhZyIsInN0YXR1cyIsInJhbmdlIiwic3RhcnREYXRlIiwiZW5kRGF0ZSIsImRpc2FibGVQcmV2aWV3Iiwic2Nyb2xsQXJlYSIsImNhbGNTY3JvbGxBcmVhIiwidW5kZWZpbmVkIiwidXBkYXRlU2hvd25EYXRlIiwibmV3Rm9jdXMiLCJmb2N1c1RvRGF0ZSIsInVzZUVmZmVjdCIsIkpTT04iLCJzdHJpbmdpZnkiLCJjdXJyZW50IiwiZ2V0VGltZSIsInMiLCJpc1ZlcnRpY2FsIiwib25EcmFnU2VsZWN0aW9uU3RhcnQiLCJvbkRyYWdTZWxlY3Rpb25FbmQiLCJuZXdSYW5nZSIsImlzU2FtZURheSIsIm9uRHJhZ1NlbGVjdGlvbk1vdmUiLCJoYW5kbGVSYW5nZUZvY3VzQ2hhbmdlIiwicmFuZ2VzSW5kZXgiLCJyYW5nZUl0ZW1JbmRleCIsImVzdGltYXRlTW9udGhTaXplIiwiaW5kZXgiLCJjYWNoZSIsIm1vbnRoV2lkdGgiLCJtb250aFN0ZXAiLCJhZGRNb250aHMiLCJzdGFydCIsImVuZCIsImdldE1vbnRoRGlzcGxheVJhbmdlIiwiaXNMb25nTW9udGgiLCJkaWZmZXJlbmNlSW5EYXlzIiwibG9uZ01vbnRoSGVpZ2h0IiwibW9udGhIZWlnaHQiLCJoYW5kbGVTY3JvbGwiLCJ2aXNpYmxlTW9udGhzIiwiZ2V0VmlzaWJsZVJhbmdlIiwidmlzaWJsZU1vbnRoIiwiaXNGb2N1c2VkVG9EaWZmZXJlbnQiLCJpc1NhbWVNb250aCIsInVwZGF0ZVByZXZpZXciLCJ2YWwiLCJwcmV2ZW50VW5uZWNlc3NhcnkiLCJhcmd1bWVudHMiLCJsZW5ndGgiLCJmb2N1c2VkRGF0ZURpZmYiLCJkaWZmZXJlbmNlSW5DYWxlbmRhck1vbnRocyIsImlzQWxsb3dlZEZvcndhcmQiLCJpc0FsbG93ZWRCYWNrd2FyZCIsIk1hdGgiLCJhYnMiLCJ0YXJnZXRNb250aEluZGV4IiwiaW5jbHVkZXMiLCJzY3JvbGxUbyIsImNoYW5nZVNob3duRGF0ZSIsInZhbHVlIiwibW9kZSIsIm1vZGVNYXBwZXIiLCJtb250aE9mZnNldCIsInNldE1vbnRoIiwic2V0WWVhciIsInNldCIsIm5ld0RhdGUiLCJtaW4iLCJtYXgiLCJyYW5nZXNJbnRlcm5hbCIsIm1hcCIsImkiLCJjcmVhdGVFbGVtZW50IiwiY2xhc3NuYW1lcyIsImNhbGVuZGFyV3JhcHBlciIsIm9uTW91c2VVcCIsIm9uTW91c2VMZWF2ZSIsIkRhdGVEaXNwbGF5IiwiTW9udGhBbmRZZWFyIiwiV2Vla2RheXMiLCJpbmZpbml0ZU1vbnRocyIsIm1vbnRoc1ZlcnRpY2FsIiwibW9udGhzSG9yaXpvbnRhbCIsInN0eWxlIiwid2lkdGgiLCJjYWxlbmRhcldpZHRoIiwiaGVpZ2h0IiwiY2FsZW5kYXJIZWlnaHQiLCJvblNjcm9sbCIsImVuZE9mTW9udGgiLCJhZGREYXlzIiwic3RhcnRPZk1vbnRoIiwidHlwZSIsInJlZiIsInRhcmdldCIsIml0ZW1TaXplRXN0aW1hdG9yIiwiYXhpcyIsIml0ZW1SZW5kZXJlciIsImtleSIsIm1vbnRoIiwic2hvd01vbnRoTmFtZSIsInNob3dXZWVrRGF5cyIsIkFycmF5IiwiZmlsbCIsIl8iLCJzdWJNb250aHMiLCJfcmVmMiIsInVwcGVyWWVhckxpbWl0IiwiZ2V0RnVsbFllYXIiLCJsb3dlclllYXJMaW1pdCIsImUiLCJzdG9wUHJvcGFnYXRpb24iLCJtb250aEFuZFllYXJXcmFwcGVyIiwibmV4dFByZXZCdXR0b24iLCJwcmV2QnV0dG9uIiwib25DbGljayIsIm1vbnRoQW5kWWVhclBpY2tlcnMiLCJtb250aFBpY2tlciIsImdldE1vbnRoIiwiTnVtYmVyIiwibW9udGhOYW1lIiwibW9udGhBbmRZZWFyRGl2aWRlciIsInllYXJQaWNrZXIiLCJ5ZWFyIiwibmV4dEJ1dHRvbiIsIl9yZWYzIiwibm93Iiwid2Vla0RheXMiLCJlYWNoRGF5T2ZJbnRlcnZhbCIsInN0YXJ0T2ZXZWVrIiwiZW5kT2ZXZWVrIiwiZGF5Iiwid2Vla0RheSIsImZvcm1hdCIsIl9yZWY0IiwiZGVmYXVsdENvbG9yIiwiZGF0ZURpc3BsYXlXcmFwcGVyIiwiZGlzYWJsZWQiLCJkYXRlRGlzcGxheSIsImRhdGVEaXNwbGF5SXRlbSIsImRhdGVEaXNwbGF5SXRlbUFjdGl2ZSIsInJlYWRPbmx5IiwicGxhY2Vob2xkZXIiLCJhcmlhTGFiZWwiLCJkYXRlSW5wdXQiLCJvbkZvY3VzIiwia2V5cyIsImxvY2FsaXplIl0sInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL2NvbXBvbmVudHMvQ2FsZW5kYXIvaW5kZXgudHN4Il0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBSZWFjdCBmcm9tICdyZWFjdCc7XG5pbXBvcnQgeyBTdHlsZXNUeXBlIH0gZnJvbSAnLi4vLi4vc3R5bGVzJztcbmltcG9ydCB7IEFyaWFMYWJlbHNUeXBlIH0gZnJvbSAnLi4vLi4vYWNjZXNzaWJpbGl0eSc7XG5pbXBvcnQgeyBMb2NhbGUsIFdlZWtPcHRpb25zLCBNb250aCBhcyBGTlNNb250aCwgYWRkRGF5cywgYWRkTW9udGhzLCBhZGRZZWFycywgZGlmZmVyZW5jZUluQ2FsZW5kYXJNb250aHMsIGRpZmZlcmVuY2VJbkRheXMsIGVhY2hEYXlPZkludGVydmFsLCBlbmRPZk1vbnRoLCBlbmRPZldlZWssIGZvcm1hdCwgaXNTYW1lRGF5LCBzdGFydE9mTW9udGgsIHN0YXJ0T2ZXZWVrLCBzdWJNb250aHMsIGlzU2FtZU1vbnRoLCBGb3JtYXRPcHRpb25zLCBQYXJzZU9wdGlvbnMsIHNldE1vbnRoLCBzZXRZZWFyLCBtaW4sIG1heCB9IGZyb20gJ2RhdGUtZm5zJztcbmltcG9ydCB7IERhdGVSYW5nZSB9IGZyb20gJy4uL0RheUNlbGwnO1xuaW1wb3J0IHsgZW5VUyB9IGZyb20gJ2RhdGUtZm5zL2xvY2FsZS9lbi1VUyc7XG5pbXBvcnQgeyBjYWxjRm9jdXNEYXRlLCBnZW5lcmF0ZVN0eWxlcywgZ2V0TW9udGhEaXNwbGF5UmFuZ2UgfSBmcm9tICcuLi8uLi91dGlscyc7XG5pbXBvcnQgY29yZVN0eWxlcyBmcm9tICcuLi8uLi9zdHlsZXMnO1xuaW1wb3J0IERhdGVJbnB1dCBmcm9tICcuLi9EYXRlSW5wdXQnO1xuaW1wb3J0IGNsYXNzbmFtZXMgZnJvbSAnY2xhc3NuYW1lcyc7XG5pbXBvcnQgUmVhY3RMaXN0IGZyb20gJ3JlYWN0LWxpc3QnO1xuaW1wb3J0IE1vbnRoIGZyb20gJy4uL01vbnRoJztcblxuZXhwb3J0IHR5cGUgQ2FsZW5kYXJQcm9wcyA9IHtcbiAgc2hvd01vbnRoQXJyb3c/OiBib29sZWFuLFxuICBzaG93TW9udGhBbmRZZWFyUGlja2Vycz86IGJvb2xlYW4sXG4gIGRpc2FibGVkRGF0ZXM/OiBEYXRlW10sXG4gIGRpc2FibGVkRGF5PzogKGRhdGU6IERhdGUpID0+IGJvb2xlYW4sXG4gIG1pbkRhdGU/OiBEYXRlLFxuICBtYXhEYXRlPzogRGF0ZSxcbiAgZGF0ZT86IERhdGUsXG4gIG9uQ2hhbmdlPzogKGRhdGU6IERhdGUpID0+IHZvaWQsXG4gIG9uUHJldmlld0NoYW5nZT86IChkYXRlPzogRGF0ZSkgPT4gdm9pZCxcbiAgb25SYW5nZUZvY3VzQ2hhbmdlPzogKHJhbmdlOiBudW1iZXJbXSkgPT4gdm9pZCxcbiAgY2xhc3NOYW1lcz86IFBhcnRpYWw8U3R5bGVzVHlwZT4sXG4gIGxvY2FsZT86IExvY2FsZSxcbiAgc2hvd25EYXRlPzogRGF0ZSxcbiAgb25TaG93bkRhdGVDaGFuZ2U/OiAoZGF0ZTogRGF0ZSkgPT4gdm9pZCxcbiAgcmFuZ2VzPzogRGF0ZVJhbmdlW10sXG4gIHByZXZpZXc/OiB7XG4gICAgc3RhcnREYXRlPzogRGF0ZSxcbiAgICBlbmREYXRlPzogRGF0ZSxcbiAgICBjb2xvcj86IHN0cmluZ1xuICB9LFxuICBkYXRlRGlzcGxheUZvcm1hdD86IHN0cmluZyxcbiAgbW9udGhEaXNwbGF5Rm9ybWF0Pzogc3RyaW5nLFxuICB3ZWVrZGF5RGlzcGxheUZvcm1hdD86IHN0cmluZyxcbiAgd2Vla1N0YXJ0c09uPzogbnVtYmVyLFxuICBkYXlEaXNwbGF5Rm9ybWF0Pzogc3RyaW5nLFxuICBmb2N1c2VkUmFuZ2U/OiBudW1iZXJbXSxcbiAgZGF5Q29udGVudFJlbmRlcmVyPzogKGRhdGU6IERhdGUpID0+IFJlYWN0LlJlYWN0RWxlbWVudCxcbiAgaW5pdGlhbEZvY3VzZWRSYW5nZT86IG51bWJlcltdLFxuICBtb250aHM/OiBudW1iZXIsXG4gIGNsYXNzTmFtZT86IHN0cmluZyxcbiAgc2hvd0RhdGVEaXNwbGF5PzogYm9vbGVhbixcbiAgc2hvd1ByZXZpZXc/OiBib29sZWFuLFxuICBkaXNwbGF5TW9kZT86IFwiZGF0ZVJhbmdlXCIgfCBcImRhdGVcIixcbiAgY29sb3I/OiBzdHJpbmcsXG4gIHVwZGF0ZVJhbmdlPzogKHJhbmdlOiBEYXRlUmFuZ2UpID0+IHZvaWQsXG4gIHNjcm9sbD86IHtcbiAgICBlbmFibGVkPzogYm9vbGVhbixcbiAgICBtb250aEhlaWdodD86IG51bWJlcixcbiAgICBsb25nTW9udGhIZWlnaHQ/OiBudW1iZXIsXG4gICAgbW9udGhXaWR0aD86IG51bWJlcixcbiAgICBjYWxlbmRhcldpZHRoPzogbnVtYmVyLFxuICAgIGNhbGVuZGFySGVpZ2h0PzogbnVtYmVyXG4gIH0sXG4gIGRpcmVjdGlvbj86ICd2ZXJ0aWNhbCcgfCAnaG9yaXpvbnRhbCcsXG4gIHN0YXJ0RGF0ZVBsYWNlaG9sZGVyPzogc3RyaW5nLFxuICBlbmREYXRlUGxhY2Vob2xkZXI/OiBzdHJpbmcsXG4gIHJhbmdlQ29sb3JzPzogc3RyaW5nW10sXG4gIGVkaXRhYmxlRGF0ZUlucHV0cz86IGJvb2xlYW4sXG4gIGRyYWdTZWxlY3Rpb25FbmFibGVkPzogYm9vbGVhbixcbiAgZml4ZWRIZWlnaHQ/OiBib29sZWFuLFxuICBjYWxlbmRhckZvY3VzPzogXCJmb3J3YXJkc1wiIHwgXCJiYWNrd2FyZHNcIixcbiAgcHJldmVudFNuYXBSZWZvY3VzPzogYm9vbGVhbixcbiAgYXJpYUxhYmVscz86IEFyaWFMYWJlbHNUeXBlLFxuICBwcmV2ZW50U2Nyb2xsVG9Gb2N1c2VkTW9udGg/OiBib29sZWFuXG59O1xuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbiBDYWxlbmRhcih7XG4gIHNob3dNb250aEFycm93ID0gdHJ1ZSxcbiAgc2hvd01vbnRoQW5kWWVhclBpY2tlcnMgPSB0cnVlLFxuICBkaXNhYmxlZERhdGVzID0gW10sXG4gIGRpc2FibGVkRGF5ID0gKCkgPT4gZmFsc2UsXG4gIG1pbkRhdGUgPSBhZGRZZWFycyhuZXcgRGF0ZSgpLCAtMTAwKSxcbiAgbWF4RGF0ZSA9IGFkZFllYXJzKG5ldyBEYXRlKCksIDIwKSxcbiAgZGF0ZSxcbiAgb25DaGFuZ2UsXG4gIG9uUHJldmlld0NoYW5nZSxcbiAgb25SYW5nZUZvY3VzQ2hhbmdlLFxuICBjbGFzc05hbWVzID0ge30sXG4gIGxvY2FsZSA9IGVuVVMsXG4gIHNob3duRGF0ZSxcbiAgb25TaG93bkRhdGVDaGFuZ2UsXG4gIHJhbmdlcyA9IFtdLFxuICBwcmV2aWV3LFxuICBkYXRlRGlzcGxheUZvcm1hdCA9ICdNTU0gZCwgeXl5eScsXG4gIG1vbnRoRGlzcGxheUZvcm1hdCA9ICdNTU0geXl5eScsXG4gIHdlZWtkYXlEaXNwbGF5Rm9ybWF0ID0gJ0UnLFxuICB3ZWVrU3RhcnRzT24sXG4gIGRheURpc3BsYXlGb3JtYXQgPSAnZCcsXG4gIGZvY3VzZWRSYW5nZSA9IFswLCAwXSxcbiAgZGF5Q29udGVudFJlbmRlcmVyLFxuICBtb250aHMgPSAxLFxuICBjbGFzc05hbWUsXG4gIHNob3dEYXRlRGlzcGxheSA9IHRydWUsXG4gIHNob3dQcmV2aWV3ID0gdHJ1ZSxcbiAgZGlzcGxheU1vZGUgPSAnZGF0ZScsXG4gIGNvbG9yID0gJyMzZDkxZmYnLFxuICB1cGRhdGVSYW5nZSxcbiAgc2Nyb2xsID0ge1xuICAgIGVuYWJsZWQ6IGZhbHNlXG4gIH0sXG4gIGRpcmVjdGlvbiA9ICd2ZXJ0aWNhbCcsXG4gIHN0YXJ0RGF0ZVBsYWNlaG9sZGVyID0gYEVhcmx5YCxcbiAgZW5kRGF0ZVBsYWNlaG9sZGVyID0gYENvbnRpbnVvdXNgLFxuICByYW5nZUNvbG9ycyA9IFsnIzNkOTFmZicsICcjM2VjZjhlJywgJyNmZWQxNGMnXSxcbiAgZWRpdGFibGVEYXRlSW5wdXRzID0gZmFsc2UsXG4gIGRyYWdTZWxlY3Rpb25FbmFibGVkID0gdHJ1ZSxcbiAgZml4ZWRIZWlnaHQgPSBmYWxzZSxcbiAgY2FsZW5kYXJGb2N1cyA9ICdmb3J3YXJkcycsXG4gIHByZXZlbnRTbmFwUmVmb2N1cyA9IGZhbHNlLFxuICBhcmlhTGFiZWxzID0ge30sXG4gIHByZXZlbnRTY3JvbGxUb0ZvY3VzZWRNb250aCA9IGZhbHNlXG59OiBDYWxlbmRhclByb3BzKSB7XG5cbiAgY29uc3QgcmVmcyA9IFJlYWN0LnVzZVJlZih7XG4gICAgZGF0ZU9wdGlvbnM6IHtcbiAgICAgIGxvY2FsZSxcbiAgICAgIHdlZWtTdGFydHNPblxuICAgIH0sXG4gICAgc3R5bGVzOiBnZW5lcmF0ZVN0eWxlcyhbY29yZVN0eWxlcywgY2xhc3NOYW1lc10pLFxuICAgIGxpc3RTaXplQ2FjaGU6IHt9LFxuICAgIGxpc3Q6IG51bGwsXG4gICAgc2Nyb2xsLFxuICAgIGlzRmlyc3RSZW5kZXI6IHRydWUsXG4gICAgZGF0ZTogZGF0ZSxcbiAgICByYW5nZXM6IHJhbmdlc1xuICB9KTtcblxuICBjb25zdCBbc3RhdGUsIHNldFN0YXRlXSA9IFJlYWN0LnVzZVN0YXRlKHtcbiAgICBtb250aE5hbWVzOiBnZXRNb250aE5hbWVzKGxvY2FsZSksXG4gICAgZm9jdXNlZERhdGU6IGNhbGNGb2N1c0RhdGUobnVsbCwgc2hvd25EYXRlLCBkYXRlLCBtb250aHMsIHJhbmdlcywgZm9jdXNlZFJhbmdlLCBkaXNwbGF5TW9kZSksXG4gICAgZHJhZzoge1xuICAgICAgc3RhdHVzOiBmYWxzZSxcbiAgICAgIHJhbmdlOiB7IHN0YXJ0RGF0ZTogbnVsbCwgZW5kRGF0ZTogbnVsbCB9LFxuICAgICAgZGlzYWJsZVByZXZpZXc6IGZhbHNlXG4gICAgfSxcbiAgICBzY3JvbGxBcmVhOiBjYWxjU2Nyb2xsQXJlYShkaXJlY3Rpb24sIG1vbnRocywgc2Nyb2xsKSxcbiAgICBwcmV2aWV3OiB1bmRlZmluZWRcbiAgfSk7XG5cbiAgY29uc3QgdXBkYXRlU2hvd25EYXRlID0gKCkgPT4ge1xuICAgIGNvbnN0IG5ld0ZvY3VzID0gY2FsY0ZvY3VzRGF0ZShzdGF0ZS5mb2N1c2VkRGF0ZSwgc2hvd25EYXRlLCBkYXRlLCBtb250aHMsIHJhbmdlcywgZm9jdXNlZFJhbmdlLCBkaXNwbGF5TW9kZSk7XG5cbiAgICBmb2N1c1RvRGF0ZShuZXdGb2N1cyk7XG4gIH1cblxuICBSZWFjdC51c2VFZmZlY3QoKCkgPT4ge1xuXG4gICAgaWYgKEpTT04uc3RyaW5naWZ5KHJhbmdlcykgIT0gSlNPTi5zdHJpbmdpZnkocmVmcy5jdXJyZW50LnJhbmdlcykgfHwgZGF0ZT8uZ2V0VGltZT8uKCkgIT0gcmVmcy5jdXJyZW50LmRhdGU/LmdldFRpbWU/LigpKSB7XG4gICAgICByZWZzLmN1cnJlbnQucmFuZ2VzID0gcmFuZ2VzO1xuICAgICAgcmVmcy5jdXJyZW50LmRhdGUgPSBkYXRlO1xuXG4gICAgICBpZighcHJldmVudFNjcm9sbFRvRm9jdXNlZE1vbnRoKSB7XG4gICAgICAgIHVwZGF0ZVNob3duRGF0ZSgpO1xuICAgICAgfVxuICAgIH1cblxuICAgIGlmIChyZWZzLmN1cnJlbnQuZGF0ZU9wdGlvbnMubG9jYWxlICE9IGxvY2FsZSkge1xuICAgICAgcmVmcy5jdXJyZW50LmRhdGVPcHRpb25zLmxvY2FsZSA9IGxvY2FsZTtcbiAgICAgIHNldFN0YXRlKHMgPT4gKHsgLi4ucywgbW9udGhOYW1lczogZ2V0TW9udGhOYW1lcyhsb2NhbGUpIH0pKTtcbiAgICB9XG5cbiAgICByZWZzLmN1cnJlbnQuZGF0ZU9wdGlvbnMud2Vla1N0YXJ0c09uID0gd2Vla1N0YXJ0c09uO1xuXG4gICAgaWYgKEpTT04uc3RyaW5naWZ5KHJlZnMuY3VycmVudC5zY3JvbGwpICE9IEpTT04uc3RyaW5naWZ5KHNjcm9sbCkpIHtcbiAgICAgIHJlZnMuY3VycmVudC5zY3JvbGwgPSBzY3JvbGw7XG5cblxuICAgICAgc2V0U3RhdGUocyA9PiAoeyAuLi5zLCBzY3JvbGxBcmVhOiBjYWxjU2Nyb2xsQXJlYShkaXJlY3Rpb24sIG1vbnRocywgc2Nyb2xsKSB9KSk7XG4gICAgfVxuXG4gIH0sIFtyYW5nZXMsIGRhdGUsIHNjcm9sbCwgZGlyZWN0aW9uLCBtb250aHMsIGxvY2FsZSwgd2Vla1N0YXJ0c09uXSk7XG5cbiAgUmVhY3QudXNlRWZmZWN0KCgpID0+IHtcbiAgICBpZiAoc2Nyb2xsLmVuYWJsZWQpIHtcbiAgICAgIGZvY3VzVG9EYXRlKHN0YXRlLmZvY3VzZWREYXRlKTtcbiAgICB9XG4gIH0sIFtzY3JvbGwuZW5hYmxlZF0pO1xuXG4gIGNvbnN0IGlzVmVydGljYWwgPSBkaXJlY3Rpb24gPT09ICd2ZXJ0aWNhbCc7XG5cbiAgY29uc3Qgb25EcmFnU2VsZWN0aW9uU3RhcnQgPSAoZGF0ZTogRGF0ZSkgPT4ge1xuICAgIGlmIChkcmFnU2VsZWN0aW9uRW5hYmxlZCkge1xuICAgICAgc2V0U3RhdGUoeyAuLi5zdGF0ZSwgZHJhZzogeyBzdGF0dXM6IHRydWUsIHJhbmdlOiB7IHN0YXJ0RGF0ZTogZGF0ZSwgZW5kRGF0ZTogZGF0ZSB9LCBkaXNhYmxlUHJldmlldzogZmFsc2UgfSB9KTtcbiAgICB9IGVsc2Uge1xuICAgICAgb25DaGFuZ2U/LihkYXRlKTtcbiAgICB9XG4gIH1cblxuICBjb25zdCBvbkRyYWdTZWxlY3Rpb25FbmQgPSAoZGF0ZTogRGF0ZSkgPT4ge1xuICAgIGlmICghZHJhZ1NlbGVjdGlvbkVuYWJsZWQpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBpZiAoZGlzcGxheU1vZGUgPT0gJ2RhdGUnIHx8ICFzdGF0ZS5kcmFnLnN0YXR1cykge1xuICAgICAgb25DaGFuZ2U/LihkYXRlKTtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBjb25zdCBuZXdSYW5nZSA9IHtcbiAgICAgIHN0YXJ0RGF0ZTogc3RhdGUuZHJhZy5yYW5nZS5zdGFydERhdGUsXG4gICAgICBlbmREYXRlOiBkYXRlXG4gICAgfVxuXG4gICAgaWYgKGRpc3BsYXlNb2RlICE9ICdkYXRlUmFuZ2UnIHx8IGlzU2FtZURheShuZXdSYW5nZS5zdGFydERhdGUsIGRhdGUpKSB7XG4gICAgICBzZXRTdGF0ZSh7IC4uLnN0YXRlLCBkcmFnOiB7IHN0YXR1czogZmFsc2UsIHJhbmdlOiB7IHN0YXJ0RGF0ZTogbnVsbCwgZW5kRGF0ZTogbnVsbCB9LCBkaXNhYmxlUHJldmlldzogc3RhdGUuZHJhZy5kaXNhYmxlUHJldmlldyB9IH0pO1xuICAgICAgb25DaGFuZ2U/LihkYXRlKTtcbiAgICB9IGVsc2Uge1xuICAgICAgc2V0U3RhdGUoeyAuLi5zdGF0ZSwgZHJhZzogeyBzdGF0dXM6IGZhbHNlLCByYW5nZTogeyBzdGFydERhdGU6IG51bGwsIGVuZERhdGU6IG51bGwgfSwgZGlzYWJsZVByZXZpZXc6IHN0YXRlLmRyYWcuZGlzYWJsZVByZXZpZXcgfSB9KTtcbiAgICAgIHVwZGF0ZVJhbmdlPy4obmV3UmFuZ2UpO1xuICAgIH1cbiAgfVxuXG4gIGNvbnN0IG9uRHJhZ1NlbGVjdGlvbk1vdmUgPSAoZGF0ZTogRGF0ZSkgPT4ge1xuICAgIGlmICghc3RhdGUuZHJhZy5zdGF0dXMgfHwgIWRyYWdTZWxlY3Rpb25FbmFibGVkKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgc2V0U3RhdGUoeyAuLi5zdGF0ZSwgZHJhZzogeyBzdGF0dXM6IHN0YXRlLmRyYWcuc3RhdHVzLCByYW5nZTogeyBzdGFydERhdGU6IHN0YXRlLmRyYWcucmFuZ2Uuc3RhcnREYXRlLCBlbmREYXRlOiBkYXRlIH0sIGRpc2FibGVQcmV2aWV3OiBzdGF0ZS5kcmFnLmRpc2FibGVQcmV2aWV3IH0gfSk7XG4gIH1cblxuICBjb25zdCBoYW5kbGVSYW5nZUZvY3VzQ2hhbmdlID0gKHJhbmdlc0luZGV4OiBudW1iZXIsIHJhbmdlSXRlbUluZGV4OiBudW1iZXIpID0+IHtcbiAgICBvblJhbmdlRm9jdXNDaGFuZ2U/LihbcmFuZ2VzSW5kZXgsIHJhbmdlSXRlbUluZGV4XSk7XG4gIH1cblxuICBjb25zdCBlc3RpbWF0ZU1vbnRoU2l6ZSA9IChpbmRleDogbnVtYmVyLCBjYWNoZT86IHtbeDogc3RyaW5nXTogbnVtYmVyfSkgPT4ge1xuICAgIFxuICAgIGlmIChjYWNoZSkge1xuICAgICAgcmVmcy5jdXJyZW50Lmxpc3RTaXplQ2FjaGUgPSBjYWNoZTtcblxuICAgICAgaWYgKGNhY2hlW2luZGV4XSkge1xuICAgICAgICByZXR1cm4gY2FjaGVbaW5kZXhdO1xuICAgICAgfVxuICAgIH1cblxuICAgIGlmIChkaXJlY3Rpb24gPT0gJ2hvcml6b250YWwnKSB7XG4gICAgICByZXR1cm4gc3RhdGUuc2Nyb2xsQXJlYS5tb250aFdpZHRoO1xuICAgIH1cblxuICAgIGNvbnN0IG1vbnRoU3RlcCA9IGFkZE1vbnRocyhtaW5EYXRlLCBpbmRleCk7XG4gICAgY29uc3QgeyBzdGFydCwgZW5kIH0gPSBnZXRNb250aERpc3BsYXlSYW5nZShtb250aFN0ZXAsIHJlZnMuY3VycmVudC5kYXRlT3B0aW9ucyBhcyBXZWVrT3B0aW9ucyk7XG4gICAgY29uc3QgaXNMb25nTW9udGggPSBkaWZmZXJlbmNlSW5EYXlzKGVuZCwgc3RhcnQpICsgMSA+IDcgKiA1O1xuICAgIHJldHVybiBpc0xvbmdNb250aCA/IHN0YXRlLnNjcm9sbEFyZWEubG9uZ01vbnRoSGVpZ2h0IDogc3RhdGUuc2Nyb2xsQXJlYS5tb250aEhlaWdodDtcbiAgfVxuXG4gIGNvbnN0IGhhbmRsZVNjcm9sbCA9ICgpID0+IHtcbiAgICBjb25zdCB2aXNpYmxlTW9udGhzID0gcmVmcy5jdXJyZW50Lmxpc3QuZ2V0VmlzaWJsZVJhbmdlKCk7XG5cbiAgICBpZiAodmlzaWJsZU1vbnRoc1swXSA9PT0gdW5kZWZpbmVkKSByZXR1cm47XG5cbiAgICBjb25zdCB2aXNpYmxlTW9udGggPSBhZGRNb250aHMobWluRGF0ZSwgdmlzaWJsZU1vbnRoc1swXSB8fCAwKTtcbiAgICBjb25zdCBpc0ZvY3VzZWRUb0RpZmZlcmVudCA9ICFpc1NhbWVNb250aCh2aXNpYmxlTW9udGgsIHN0YXRlLmZvY3VzZWREYXRlKTtcblxuICAgIGlmIChpc0ZvY3VzZWRUb0RpZmZlcmVudCAmJiAhcmVmcy5jdXJyZW50LmlzRmlyc3RSZW5kZXIpIHtcbiAgICAgIHNldFN0YXRlKHMgPT4gKHsgLi4ucywgZm9jdXNlZERhdGU6IHZpc2libGVNb250aCB9KSk7XG4gICAgICBvblNob3duRGF0ZUNoYW5nZT8uKHZpc2libGVNb250aCk7XG4gICAgfVxuXG4gICAgcmVmcy5jdXJyZW50LmlzRmlyc3RSZW5kZXIgPSBmYWxzZTtcbiAgfVxuXG4gIGNvbnN0IHVwZGF0ZVByZXZpZXcgPSAodmFsPzogRGF0ZSkgPT4ge1xuICAgIGlmICghdmFsKSB7XG4gICAgICBzZXRTdGF0ZShzID0+ICh7IC4uLnMsIHByZXZpZXc6IHVuZGVmaW5lZCB9KSk7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgY29uc3QgcHJldmlldyA9IHtcbiAgICAgIHN0YXJ0RGF0ZTogdmFsLFxuICAgICAgZW5kRGF0ZTogdmFsLFxuICAgICAgY29sb3I6IGNvbG9yXG4gICAgfVxuXG4gICAgc2V0U3RhdGUocyA9PiAoeyAuLi5zLCBwcmV2aWV3IH0pKTtcbiAgfVxuXG4gIGNvbnN0IGZvY3VzVG9EYXRlID0gKGRhdGU6IERhdGUsIHByZXZlbnRVbm5lY2Vzc2FyeSA9IHRydWUpID0+IHtcblxuICAgIGlmICghc2Nyb2xsLmVuYWJsZWQpIHtcbiAgICAgIGlmIChwcmV2ZW50VW5uZWNlc3NhcnkgJiYgcHJldmVudFNuYXBSZWZvY3VzKSB7XG4gICAgICAgIGNvbnN0IGZvY3VzZWREYXRlRGlmZiA9IGRpZmZlcmVuY2VJbkNhbGVuZGFyTW9udGhzKGRhdGUsIHN0YXRlLmZvY3VzZWREYXRlKTtcblxuICAgICAgICBjb25zdCBpc0FsbG93ZWRGb3J3YXJkID0gY2FsZW5kYXJGb2N1cyA9PT0gJ2ZvcndhcmRzJyAmJiBmb2N1c2VkRGF0ZURpZmYgPj0gMDtcbiAgICAgICAgY29uc3QgaXNBbGxvd2VkQmFja3dhcmQgPSBjYWxlbmRhckZvY3VzID09PSAnYmFja3dhcmRzJyAmJiBmb2N1c2VkRGF0ZURpZmYgPD0gMDtcbiAgICAgICAgaWYgKChpc0FsbG93ZWRGb3J3YXJkIHx8IGlzQWxsb3dlZEJhY2t3YXJkKSAmJiBNYXRoLmFicyhmb2N1c2VkRGF0ZURpZmYpIDwgbW9udGhzKSB7XG4gICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIHNldFN0YXRlKHMgPT4gKHsgLi4ucywgZm9jdXNlZERhdGU6IGRhdGUgfSkpO1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGNvbnN0IHRhcmdldE1vbnRoSW5kZXggPSBkaWZmZXJlbmNlSW5DYWxlbmRhck1vbnRocyhkYXRlLCBtaW5EYXRlKTtcbiAgICBjb25zdCB2aXNpYmxlTW9udGhzID0gcmVmcy5jdXJyZW50Lmxpc3QuZ2V0VmlzaWJsZVJhbmdlKCk7XG5cbiAgICBpZiAocHJldmVudFVubmVjZXNzYXJ5ICYmIHZpc2libGVNb250aHMuaW5jbHVkZXModGFyZ2V0TW9udGhJbmRleCkpIHJldHVybjtcblxuICAgIHJlZnMuY3VycmVudC5pc0ZpcnN0UmVuZGVyID0gdHJ1ZTtcbiAgICByZWZzLmN1cnJlbnQubGlzdC5zY3JvbGxUbyh0YXJnZXRNb250aEluZGV4KTtcbiAgICBzZXRTdGF0ZShzID0+ICh7IC4uLnMsIGZvY3VzZWREYXRlOiBkYXRlIH0pKTtcbiAgfVxuXG4gIGNvbnN0IGNoYW5nZVNob3duRGF0ZSA9ICh2YWx1ZTogbnVtYmVyLCBtb2RlOiBcInNldFwiIHwgXCJzZXRZZWFyXCIgfCBcInNldE1vbnRoXCIgfCBcIm1vbnRoT2Zmc2V0XCIgPSBcInNldFwiKSA9PiB7XG4gICAgY29uc3QgbW9kZU1hcHBlciA9IHtcbiAgICAgIG1vbnRoT2Zmc2V0OiAoKSA9PiBhZGRNb250aHMoc3RhdGUuZm9jdXNlZERhdGUsIHZhbHVlKSxcbiAgICAgIHNldE1vbnRoOiAoKSA9PiBzZXRNb250aChzdGF0ZS5mb2N1c2VkRGF0ZSwgdmFsdWUpLFxuICAgICAgc2V0WWVhcjogKCkgPT4gc2V0WWVhcihzdGF0ZS5mb2N1c2VkRGF0ZSwgdmFsdWUpLFxuICAgICAgc2V0OiAoKSA9PiB2YWx1ZSxcbiAgICB9O1xuXG4gICAgY29uc3QgbmV3RGF0ZSA9IG1pbihbbWF4KFttb2RlTWFwcGVyW21vZGVdKCksIG1pbkRhdGVdKSwgbWF4RGF0ZV0pO1xuICAgIGZvY3VzVG9EYXRlKG5ld0RhdGUsIGZhbHNlKTtcbiAgICBvblNob3duRGF0ZUNoYW5nZT8uKG5ld0RhdGUpO1xuICB9XG5cbiAgY29uc3QgcmFuZ2VzSW50ZXJuYWwgPSByYW5nZXMubWFwKChyYW5nZSwgaSkgPT4gKHtcbiAgICAuLi5yYW5nZSxcbiAgICBjb2xvcjogcmFuZ2UuY29sb3IgfHwgcmFuZ2VDb2xvcnNbaV0gfHwgY29sb3IsXG4gIH0pKTtcblxuICByZXR1cm4gKFxuICAgIDxkaXZcbiAgICAgIGNsYXNzTmFtZT17Y2xhc3NuYW1lcyhyZWZzLmN1cnJlbnQuc3R5bGVzLmNhbGVuZGFyV3JhcHBlciwgY2xhc3NOYW1lKX1cbiAgICAgIG9uTW91c2VVcD17KCkgPT4ge1xuICAgICAgICBzZXRTdGF0ZSh7IC4uLnN0YXRlLCBkcmFnOiB7IHN0YXR1czogZmFsc2UsIHJhbmdlOiB7IHN0YXJ0RGF0ZTogbnVsbCwgZW5kRGF0ZTogbnVsbCB9LCBkaXNhYmxlUHJldmlldzogZmFsc2UgfSB9KTtcbiAgICAgIH19XG4gICAgICBvbk1vdXNlTGVhdmU9eygpID0+IHtcbiAgICAgICAgc2V0U3RhdGUoeyAuLi5zdGF0ZSwgZHJhZzogeyBzdGF0dXM6IGZhbHNlLCByYW5nZTogeyBzdGFydERhdGU6IG51bGwsIGVuZERhdGU6IG51bGwgfSwgZGlzYWJsZVByZXZpZXc6IGZhbHNlIH0gfSk7XG4gICAgICB9fT5cbiAgICAgIHtzaG93RGF0ZURpc3BsYXkgPyA8RGF0ZURpc3BsYXkgb25EcmFnU2VsZWN0aW9uRW5kPXtvbkRyYWdTZWxlY3Rpb25FbmR9IGhhbmRsZVJhbmdlRm9jdXNDaGFuZ2U9e2hhbmRsZVJhbmdlRm9jdXNDaGFuZ2V9IGRhdGVPcHRpb25zPXtyZWZzLmN1cnJlbnQuZGF0ZU9wdGlvbnMgYXMgUGFyc2VPcHRpb25zfSBhcmlhTGFiZWxzPXthcmlhTGFiZWxzfSBzdHlsZXM9e3JlZnMuY3VycmVudC5zdHlsZXN9IHN0YXJ0RGF0ZVBsYWNlaG9sZGVyPXtzdGFydERhdGVQbGFjZWhvbGRlcn0gZW5kRGF0ZVBsYWNlaG9sZGVyPXtlbmREYXRlUGxhY2Vob2xkZXJ9IGVkaXRhYmxlRGF0ZUlucHV0cz17ZWRpdGFibGVEYXRlSW5wdXRzfSBmb2N1c2VkUmFuZ2U9e2ZvY3VzZWRSYW5nZX0gY29sb3I9e2NvbG9yfSByYW5nZXM9e3Jhbmdlc0ludGVybmFsfSByYW5nZUNvbG9ycz17cmFuZ2VDb2xvcnN9IGRhdGVEaXNwbGF5Rm9ybWF0PXtkYXRlRGlzcGxheUZvcm1hdH0gLz4gOiBudWxsfVxuICAgICAgPE1vbnRoQW5kWWVhciBtb250aE5hbWVzPXtzdGF0ZS5tb250aE5hbWVzfSBmb2N1c2VkRGF0ZT17c3RhdGUuZm9jdXNlZERhdGV9IGNoYW5nZVNob3duRGF0ZT17Y2hhbmdlU2hvd25EYXRlfSBzdHlsZXM9e3JlZnMuY3VycmVudC5zdHlsZXMgYXMgU3R5bGVzVHlwZX0gc2hvd01vbnRoQW5kWWVhclBpY2tlcnM9e3Nob3dNb250aEFuZFllYXJQaWNrZXJzfSBzaG93TW9udGhBcnJvdz17c2hvd01vbnRoQXJyb3d9IG1pbkRhdGU9e21pbkRhdGV9IG1heERhdGU9e21heERhdGV9IGFyaWFMYWJlbHM9e2FyaWFMYWJlbHN9IC8+XG4gICAgICB7c2Nyb2xsLmVuYWJsZWQgPyAoXG4gICAgICAgIDxkaXY+XG4gICAgICAgICAge2lzVmVydGljYWwgPyA8V2Vla2RheXMgc3R5bGVzPXtyZWZzLmN1cnJlbnQuc3R5bGVzfSBkYXRlT3B0aW9ucz17cmVmcy5jdXJyZW50LmRhdGVPcHRpb25zfSB3ZWVrZGF5RGlzcGxheUZvcm1hdD17d2Vla2RheURpc3BsYXlGb3JtYXR9IC8+IDogbnVsbH1cbiAgICAgICAgICA8ZGl2XG4gICAgICAgICAgICBjbGFzc05hbWU9e2NsYXNzbmFtZXMoXG4gICAgICAgICAgICAgIHJlZnMuY3VycmVudC5zdHlsZXMuaW5maW5pdGVNb250aHMsXG4gICAgICAgICAgICAgIGlzVmVydGljYWwgPyByZWZzLmN1cnJlbnQuc3R5bGVzLm1vbnRoc1ZlcnRpY2FsIDogcmVmcy5jdXJyZW50LnN0eWxlcy5tb250aHNIb3Jpem9udGFsXG4gICAgICAgICAgICApfVxuICAgICAgICAgICAgb25Nb3VzZUxlYXZlPXsoKSA9PiBvblByZXZpZXdDaGFuZ2U/LigpfVxuICAgICAgICAgICAgc3R5bGU9e3tcbiAgICAgICAgICAgICAgd2lkdGg6IHR5cGVvZiBzdGF0ZS5zY3JvbGxBcmVhLmNhbGVuZGFyV2lkdGggPT09ICdzdHJpbmcnID8gc3RhdGUuc2Nyb2xsQXJlYS5jYWxlbmRhcldpZHRoIDogKChzdGF0ZS5zY3JvbGxBcmVhLmNhbGVuZGFyV2lkdGggfHwgMCkgKyAxMSksXG4gICAgICAgICAgICAgIGhlaWdodDogc3RhdGUuc2Nyb2xsQXJlYS5jYWxlbmRhckhlaWdodCArIDExLFxuICAgICAgICAgICAgfX1cbiAgICAgICAgICAgIG9uU2Nyb2xsPXtoYW5kbGVTY3JvbGx9PlxuICAgICAgICAgICAgPFJlYWN0TGlzdFxuICAgICAgICAgICAgICBsZW5ndGg9e2RpZmZlcmVuY2VJbkNhbGVuZGFyTW9udGhzKFxuICAgICAgICAgICAgICAgIGVuZE9mTW9udGgobWF4RGF0ZSksXG4gICAgICAgICAgICAgICAgYWRkRGF5cyhzdGFydE9mTW9udGgobWluRGF0ZSksIC0xKVxuICAgICAgICAgICAgICApfVxuICAgICAgICAgICAgICB0eXBlPVwidmFyaWFibGVcIlxuICAgICAgICAgICAgICByZWY9e3RhcmdldCA9PiB7XG4gICAgICAgICAgICAgICAgcmVmcy5jdXJyZW50Lmxpc3QgPSB0YXJnZXQ7XG4gICAgICAgICAgICAgIH19XG4gICAgICAgICAgICAgIGl0ZW1TaXplRXN0aW1hdG9yPXtlc3RpbWF0ZU1vbnRoU2l6ZX1cbiAgICAgICAgICAgICAgYXhpcz17aXNWZXJ0aWNhbCA/ICd5JyA6ICd4J31cbiAgICAgICAgICAgICAgaXRlbVJlbmRlcmVyPXsoaW5kZXgsIGtleSkgPT4ge1xuICAgICAgICAgICAgICAgIGNvbnN0IG1vbnRoU3RlcCA9IGFkZE1vbnRocyhtaW5EYXRlLCBpbmRleCk7XG4gICAgICAgICAgICAgICAgcmV0dXJuIChcbiAgICAgICAgICAgICAgICAgIDxNb250aFxuICAgICAgICAgICAgICAgICAgICBkYXlDb250ZW50UmVuZGVyZXI9e2RheUNvbnRlbnRSZW5kZXJlcn1cbiAgICAgICAgICAgICAgICAgICAgZml4ZWRIZWlnaHQ9e2ZpeGVkSGVpZ2h0fVxuICAgICAgICAgICAgICAgICAgICBzaG93UHJldmlldz17c2hvd1ByZXZpZXd9XG4gICAgICAgICAgICAgICAgICAgIHdlZWtkYXlEaXNwbGF5Rm9ybWF0PXt3ZWVrZGF5RGlzcGxheUZvcm1hdH1cbiAgICAgICAgICAgICAgICAgICAgZGF5RGlzcGxheUZvcm1hdD17ZGF5RGlzcGxheUZvcm1hdH1cbiAgICAgICAgICAgICAgICAgICAgZGlzcGxheU1vZGU9e2Rpc3BsYXlNb2RlfVxuICAgICAgICAgICAgICAgICAgICBvblByZXZpZXdDaGFuZ2U9e29uUHJldmlld0NoYW5nZSB8fCB1cGRhdGVQcmV2aWV3fVxuICAgICAgICAgICAgICAgICAgICBwcmV2aWV3PXtwcmV2aWV3IHx8IHN0YXRlLnByZXZpZXd9XG4gICAgICAgICAgICAgICAgICAgIHJhbmdlcz17cmFuZ2VzSW50ZXJuYWx9XG4gICAgICAgICAgICAgICAgICAgIGtleT17a2V5fVxuICAgICAgICAgICAgICAgICAgICBmb2N1c2VkUmFuZ2U9e2ZvY3VzZWRSYW5nZX1cbiAgICAgICAgICAgICAgICAgICAgZHJhZz17c3RhdGUuZHJhZ31cbiAgICAgICAgICAgICAgICAgICAgbW9udGhEaXNwbGF5Rm9ybWF0PXttb250aERpc3BsYXlGb3JtYXR9XG4gICAgICAgICAgICAgICAgICAgIGRhdGVPcHRpb25zPXtyZWZzLmN1cnJlbnQuZGF0ZU9wdGlvbnMgYXMgdW5rbm93biBhcyBGb3JtYXRPcHRpb25zfVxuICAgICAgICAgICAgICAgICAgICBkaXNhYmxlZERhdGVzPXtkaXNhYmxlZERhdGVzfVxuICAgICAgICAgICAgICAgICAgICBkaXNhYmxlZERheT17ZGlzYWJsZWREYXl9XG4gICAgICAgICAgICAgICAgICAgIG1vbnRoPXttb250aFN0ZXB9XG4gICAgICAgICAgICAgICAgICAgIG9uRHJhZ1NlbGVjdGlvblN0YXJ0PXtvbkRyYWdTZWxlY3Rpb25TdGFydH1cbiAgICAgICAgICAgICAgICAgICAgb25EcmFnU2VsZWN0aW9uRW5kPXtvbkRyYWdTZWxlY3Rpb25FbmR9XG4gICAgICAgICAgICAgICAgICAgIG9uRHJhZ1NlbGVjdGlvbk1vdmU9e29uRHJhZ1NlbGVjdGlvbk1vdmV9XG4gICAgICAgICAgICAgICAgICAgIG9uTW91c2VMZWF2ZT17KCkgPT4gb25QcmV2aWV3Q2hhbmdlPy4oKX1cbiAgICAgICAgICAgICAgICAgICAgc3R5bGVzPXtyZWZzLmN1cnJlbnQuc3R5bGVzIGFzIFN0eWxlc1R5cGV9XG4gICAgICAgICAgICAgICAgICAgIHN0eWxlPXtcbiAgICAgICAgICAgICAgICAgICAgICBpc1ZlcnRpY2FsXG4gICAgICAgICAgICAgICAgICAgICAgICA/IHsgaGVpZ2h0OiBlc3RpbWF0ZU1vbnRoU2l6ZShpbmRleCkgfVxuICAgICAgICAgICAgICAgICAgICAgICAgOiB7IGhlaWdodDogc3RhdGUuc2Nyb2xsQXJlYS5tb250aEhlaWdodCwgd2lkdGg6IGVzdGltYXRlTW9udGhTaXplKGluZGV4KSB9XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgc2hvd01vbnRoTmFtZVxuICAgICAgICAgICAgICAgICAgICBzaG93V2Vla0RheXM9eyFpc1ZlcnRpY2FsfVxuICAgICAgICAgICAgICAgICAgICBjb2xvcj17Y29sb3J9XG4gICAgICAgICAgICAgICAgICAgIG1heERhdGU9e21heERhdGV9XG4gICAgICAgICAgICAgICAgICAgIG1pbkRhdGU9e21pbkRhdGV9XG4gICAgICAgICAgICAgICAgICAgIGRhdGU9e2RhdGV9XG4gICAgICAgICAgICAgICAgICAvPlxuICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICAgIH19XG4gICAgICAgICAgICAvPlxuICAgICAgICAgIDwvZGl2PlxuICAgICAgICA8L2Rpdj5cbiAgICAgICkgOiAoXG4gICAgICAgIDxkaXZcbiAgICAgICAgICBjbGFzc05hbWU9e2NsYXNzbmFtZXMoXG4gICAgICAgICAgICByZWZzLmN1cnJlbnQuc3R5bGVzLm1vbnRocyxcbiAgICAgICAgICAgIGlzVmVydGljYWwgPyByZWZzLmN1cnJlbnQuc3R5bGVzLm1vbnRoc1ZlcnRpY2FsIDogcmVmcy5jdXJyZW50LnN0eWxlcy5tb250aHNIb3Jpem9udGFsXG4gICAgICAgICAgKX0+XG4gICAgICAgICAge25ldyBBcnJheShtb250aHMpLmZpbGwobnVsbCkubWFwKChfLCBpKSA9PiB7XG4gICAgICAgICAgICBsZXQgbW9udGhTdGVwID0gYWRkTW9udGhzKHN0YXRlLmZvY3VzZWREYXRlLCBpKTs7XG4gICAgICAgICAgICBpZiAoY2FsZW5kYXJGb2N1cyA9PT0gJ2JhY2t3YXJkcycpIHtcbiAgICAgICAgICAgICAgbW9udGhTdGVwID0gc3ViTW9udGhzKHN0YXRlLmZvY3VzZWREYXRlLCBtb250aHMgLSAxIC0gaSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gKFxuICAgICAgICAgICAgICA8TW9udGhcbiAgICAgICAgICAgICAgICBkYXlDb250ZW50UmVuZGVyZXI9e2RheUNvbnRlbnRSZW5kZXJlcn1cbiAgICAgICAgICAgICAgICBmaXhlZEhlaWdodD17Zml4ZWRIZWlnaHR9XG4gICAgICAgICAgICAgICAgd2Vla2RheURpc3BsYXlGb3JtYXQ9e3dlZWtkYXlEaXNwbGF5Rm9ybWF0fVxuICAgICAgICAgICAgICAgIGRheURpc3BsYXlGb3JtYXQ9e2RheURpc3BsYXlGb3JtYXR9XG4gICAgICAgICAgICAgICAgbW9udGhEaXNwbGF5Rm9ybWF0PXttb250aERpc3BsYXlGb3JtYXR9XG4gICAgICAgICAgICAgICAgc3R5bGU9e3t9fVxuICAgICAgICAgICAgICAgIHNob3dQcmV2aWV3PXtzaG93UHJldmlld31cbiAgICAgICAgICAgICAgICBkaXNwbGF5TW9kZT17ZGlzcGxheU1vZGV9XG4gICAgICAgICAgICAgICAgb25QcmV2aWV3Q2hhbmdlPXtvblByZXZpZXdDaGFuZ2UgfHwgdXBkYXRlUHJldmlld31cbiAgICAgICAgICAgICAgICBwcmV2aWV3PXtwcmV2aWV3IHx8IHN0YXRlLnByZXZpZXd9XG4gICAgICAgICAgICAgICAgcmFuZ2VzPXtyYW5nZXNJbnRlcm5hbH1cbiAgICAgICAgICAgICAgICBrZXk9e2l9XG4gICAgICAgICAgICAgICAgZHJhZz17c3RhdGUuZHJhZ31cbiAgICAgICAgICAgICAgICBmb2N1c2VkUmFuZ2U9e2ZvY3VzZWRSYW5nZX1cbiAgICAgICAgICAgICAgICBkYXRlT3B0aW9ucz17cmVmcy5jdXJyZW50LmRhdGVPcHRpb25zIGFzIEZvcm1hdE9wdGlvbnN9XG4gICAgICAgICAgICAgICAgZGlzYWJsZWREYXRlcz17ZGlzYWJsZWREYXRlc31cbiAgICAgICAgICAgICAgICBkaXNhYmxlZERheT17ZGlzYWJsZWREYXl9XG4gICAgICAgICAgICAgICAgbW9udGg9e21vbnRoU3RlcH1cbiAgICAgICAgICAgICAgICBvbkRyYWdTZWxlY3Rpb25TdGFydD17b25EcmFnU2VsZWN0aW9uU3RhcnR9XG4gICAgICAgICAgICAgICAgb25EcmFnU2VsZWN0aW9uRW5kPXtvbkRyYWdTZWxlY3Rpb25FbmR9XG4gICAgICAgICAgICAgICAgb25EcmFnU2VsZWN0aW9uTW92ZT17b25EcmFnU2VsZWN0aW9uTW92ZX1cbiAgICAgICAgICAgICAgICBvbk1vdXNlTGVhdmU9eygpID0+IG9uUHJldmlld0NoYW5nZT8uKCl9XG4gICAgICAgICAgICAgICAgc3R5bGVzPXtyZWZzLmN1cnJlbnQuc3R5bGVzIGFzIFN0eWxlc1R5cGV9XG4gICAgICAgICAgICAgICAgc2hvd1dlZWtEYXlzPXshaXNWZXJ0aWNhbCB8fCBpID09PSAwfVxuICAgICAgICAgICAgICAgIHNob3dNb250aE5hbWU9eyFpc1ZlcnRpY2FsIHx8IGkgPiAwfVxuICAgICAgICAgICAgICAgIGNvbG9yPXtjb2xvcn1cbiAgICAgICAgICAgICAgICBtYXhEYXRlPXttYXhEYXRlfVxuICAgICAgICAgICAgICAgIG1pbkRhdGU9e21pbkRhdGV9XG4gICAgICAgICAgICAgICAgZGF0ZT17ZGF0ZX1cbiAgICAgICAgICAgICAgLz5cbiAgICAgICAgICAgICk7XG4gICAgICAgICAgfSl9XG4gICAgICAgIDwvZGl2PlxuICAgICAgKX1cbiAgICA8L2Rpdj5cbiAgKTtcbn1cblxudHlwZSBNb250aEFuZFllYXJQcm9wcyA9IHtcbiAgc3R5bGVzOiBTdHlsZXNUeXBlLFxuICBzaG93TW9udGhBcnJvdzogYm9vbGVhbixcbiAgbWluRGF0ZTogRGF0ZSxcbiAgbWF4RGF0ZTogRGF0ZSxcbiAgYXJpYUxhYmVsczogQXJpYUxhYmVsc1R5cGUsXG4gIGZvY3VzZWREYXRlOiBEYXRlLFxuICBzaG93TW9udGhBbmRZZWFyUGlja2VyczogYm9vbGVhbixcbiAgbW9udGhOYW1lczogc3RyaW5nW10sXG4gIGNoYW5nZVNob3duRGF0ZTogKHZhbHVlOiBudW1iZXIsIG1vZGU6IFwic2V0XCIgfCBcIm1vbnRoT2Zmc2V0XCIgfCBcInNldE1vbnRoXCIgfCBcInNldFllYXJcIikgPT4gdm9pZFxufTtcblxuZnVuY3Rpb24gTW9udGhBbmRZZWFyKHtcbiAgc3R5bGVzLFxuICBzaG93TW9udGhBcnJvdyxcbiAgbWluRGF0ZSxcbiAgbWF4RGF0ZSxcbiAgYXJpYUxhYmVscyxcbiAgZm9jdXNlZERhdGUsXG4gIHNob3dNb250aEFuZFllYXJQaWNrZXJzLFxuICBjaGFuZ2VTaG93bkRhdGUsXG4gIG1vbnRoTmFtZXNcbn06IE1vbnRoQW5kWWVhclByb3BzKSB7XG5cbiAgY29uc3QgdXBwZXJZZWFyTGltaXQgPSBtYXhEYXRlLmdldEZ1bGxZZWFyKCk7XG4gIGNvbnN0IGxvd2VyWWVhckxpbWl0ID0gbWluRGF0ZS5nZXRGdWxsWWVhcigpO1xuXG4gIHJldHVybiAoXG4gICAgPGRpdiBvbk1vdXNlVXA9e2UgPT4gZS5zdG9wUHJvcGFnYXRpb24oKX0gY2xhc3NOYW1lPXtzdHlsZXMubW9udGhBbmRZZWFyV3JhcHBlcn0+XG4gICAgICB7c2hvd01vbnRoQXJyb3cgPyAoXG4gICAgICAgIDxidXR0b25cbiAgICAgICAgICB0eXBlPVwiYnV0dG9uXCJcbiAgICAgICAgICBjbGFzc05hbWU9e2NsYXNzbmFtZXMoc3R5bGVzLm5leHRQcmV2QnV0dG9uLCBzdHlsZXMucHJldkJ1dHRvbil9XG4gICAgICAgICAgb25DbGljaz17KCkgPT4gY2hhbmdlU2hvd25EYXRlKC0xLCAnbW9udGhPZmZzZXQnKX1cbiAgICAgICAgICBhcmlhLWxhYmVsPXthcmlhTGFiZWxzLnByZXZCdXR0b259PlxuICAgICAgICAgIDxpIC8+XG4gICAgICAgIDwvYnV0dG9uPlxuICAgICAgKSA6IG51bGx9XG4gICAgICB7c2hvd01vbnRoQW5kWWVhclBpY2tlcnMgPyAoXG4gICAgICAgIDxzcGFuIGNsYXNzTmFtZT17c3R5bGVzLm1vbnRoQW5kWWVhclBpY2tlcnN9PlxuICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT17c3R5bGVzLm1vbnRoUGlja2VyfT5cbiAgICAgICAgICAgIDxzZWxlY3RcbiAgICAgICAgICAgICAgdmFsdWU9e2ZvY3VzZWREYXRlLmdldE1vbnRoKCl9XG4gICAgICAgICAgICAgIG9uQ2hhbmdlPXtlID0+IGNoYW5nZVNob3duRGF0ZShOdW1iZXIoZS50YXJnZXQudmFsdWUpLCAnc2V0TW9udGgnKX1cbiAgICAgICAgICAgICAgYXJpYS1sYWJlbD17YXJpYUxhYmVscy5tb250aFBpY2tlcn0+XG4gICAgICAgICAgICAgIHttb250aE5hbWVzLm1hcCgobW9udGhOYW1lOiBzdHJpbmcsIGk6IG51bWJlcikgPT4gKFxuICAgICAgICAgICAgICAgIDxvcHRpb24ga2V5PXtpfSB2YWx1ZT17aX0+XG4gICAgICAgICAgICAgICAgICB7bW9udGhOYW1lfVxuICAgICAgICAgICAgICAgIDwvb3B0aW9uPlxuICAgICAgICAgICAgICApKX1cbiAgICAgICAgICAgIDwvc2VsZWN0PlxuICAgICAgICAgIDwvc3Bhbj5cbiAgICAgICAgICA8c3BhbiBjbGFzc05hbWU9e3N0eWxlcy5tb250aEFuZFllYXJEaXZpZGVyfSAvPlxuICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT17c3R5bGVzLnllYXJQaWNrZXJ9PlxuICAgICAgICAgICAgPHNlbGVjdFxuICAgICAgICAgICAgICB2YWx1ZT17Zm9jdXNlZERhdGUuZ2V0RnVsbFllYXIoKX1cbiAgICAgICAgICAgICAgb25DaGFuZ2U9e2UgPT4gY2hhbmdlU2hvd25EYXRlKE51bWJlcihlLnRhcmdldC52YWx1ZSksICdzZXRZZWFyJyl9XG4gICAgICAgICAgICAgIGFyaWEtbGFiZWw9e2FyaWFMYWJlbHMueWVhclBpY2tlcn0+XG4gICAgICAgICAgICAgIHtuZXcgQXJyYXkodXBwZXJZZWFyTGltaXQgLSBsb3dlclllYXJMaW1pdCArIDEpXG4gICAgICAgICAgICAgICAgLmZpbGwodXBwZXJZZWFyTGltaXQpXG4gICAgICAgICAgICAgICAgLm1hcCgodmFsLCBpKSA9PiB7XG4gICAgICAgICAgICAgICAgICBjb25zdCB5ZWFyID0gdmFsIC0gaTtcbiAgICAgICAgICAgICAgICAgIHJldHVybiAoXG4gICAgICAgICAgICAgICAgICAgIDxvcHRpb24ga2V5PXt5ZWFyfSB2YWx1ZT17eWVhcn0+XG4gICAgICAgICAgICAgICAgICAgICAge3llYXJ9XG4gICAgICAgICAgICAgICAgICAgIDwvb3B0aW9uPlxuICAgICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgICAgICB9KX1cbiAgICAgICAgICAgIDwvc2VsZWN0PlxuICAgICAgICAgIDwvc3Bhbj5cbiAgICAgICAgPC9zcGFuPlxuICAgICAgKSA6IChcbiAgICAgICAgPHNwYW4gY2xhc3NOYW1lPXtzdHlsZXMubW9udGhBbmRZZWFyUGlja2Vyc30+XG4gICAgICAgICAge21vbnRoTmFtZXNbZm9jdXNlZERhdGUuZ2V0TW9udGgoKV19IHtmb2N1c2VkRGF0ZS5nZXRGdWxsWWVhcigpfVxuICAgICAgICA8L3NwYW4+XG4gICAgICApfVxuICAgICAge3Nob3dNb250aEFycm93ID8gKFxuICAgICAgICA8YnV0dG9uXG4gICAgICAgICAgdHlwZT1cImJ1dHRvblwiXG4gICAgICAgICAgY2xhc3NOYW1lPXtjbGFzc25hbWVzKHN0eWxlcy5uZXh0UHJldkJ1dHRvbiwgc3R5bGVzLm5leHRCdXR0b24pfVxuICAgICAgICAgIG9uQ2xpY2s9eygpID0+IGNoYW5nZVNob3duRGF0ZSgrMSwgJ21vbnRoT2Zmc2V0Jyl9XG4gICAgICAgICAgYXJpYS1sYWJlbD17YXJpYUxhYmVscy5uZXh0QnV0dG9ufT5cbiAgICAgICAgICA8aSAvPlxuICAgICAgICA8L2J1dHRvbj5cbiAgICAgICkgOiBudWxsfVxuICAgIDwvZGl2PlxuICApXG59XG5cbnR5cGUgV2Vla2RheXNQcm9wcyA9IHtcbiAgc3R5bGVzOiBQYXJ0aWFsPFN0eWxlc1R5cGU+LFxuICBkYXRlT3B0aW9uczoge1xuICAgIGxvY2FsZTogTG9jYWxlLFxuICAgIHdlZWtTdGFydHNPbj86IG51bWJlclxuICB9LFxuICB3ZWVrZGF5RGlzcGxheUZvcm1hdDogc3RyaW5nXG59O1xuXG5mdW5jdGlvbiBXZWVrZGF5cyh7XG4gIHN0eWxlcyxcbiAgZGF0ZU9wdGlvbnMsXG4gIHdlZWtkYXlEaXNwbGF5Rm9ybWF0XG59OiBXZWVrZGF5c1Byb3BzKSB7XG4gIGNvbnN0IG5vdyA9IG5ldyBEYXRlKCk7XG5cbiAgcmV0dXJuIChcbiAgICA8ZGl2IGNsYXNzTmFtZT17c3R5bGVzLndlZWtEYXlzfT5cbiAgICAgIHtlYWNoRGF5T2ZJbnRlcnZhbCh7XG4gICAgICAgIHN0YXJ0OiBzdGFydE9mV2Vlayhub3csIGRhdGVPcHRpb25zIGFzIFdlZWtPcHRpb25zKSxcbiAgICAgICAgZW5kOiBlbmRPZldlZWsobm93LCBkYXRlT3B0aW9ucyBhcyBXZWVrT3B0aW9ucyksXG4gICAgICB9KS5tYXAoKGRheSwgaSkgPT4gKFxuICAgICAgICA8c3BhbiBjbGFzc05hbWU9e3N0eWxlcy53ZWVrRGF5fSBrZXk9e2l9PlxuICAgICAgICAgIHtmb3JtYXQoZGF5LCB3ZWVrZGF5RGlzcGxheUZvcm1hdCwgZGF0ZU9wdGlvbnMgYXMgV2Vla09wdGlvbnMpfVxuICAgICAgICA8L3NwYW4+XG4gICAgICApKX1cbiAgICA8L2Rpdj5cbiAgKTtcbn1cblxudHlwZSBEYXRlRGlzcGxheVByb3BzID0ge1xuICBmb2N1c2VkUmFuZ2U6IG51bWJlcltdLFxuICBjb2xvcjogc3RyaW5nLFxuICByYW5nZXM6IERhdGVSYW5nZVtdLFxuICByYW5nZUNvbG9yczogc3RyaW5nW10sXG4gIGRhdGVPcHRpb25zOiBQYXJzZU9wdGlvbnMsXG4gIGRhdGVEaXNwbGF5Rm9ybWF0OiBzdHJpbmcsXG4gIGVkaXRhYmxlRGF0ZUlucHV0czogYm9vbGVhbixcbiAgc3RhcnREYXRlUGxhY2Vob2xkZXI6IHN0cmluZyxcbiAgZW5kRGF0ZVBsYWNlaG9sZGVyOiBzdHJpbmcsXG4gIGFyaWFMYWJlbHM6IEFyaWFMYWJlbHNUeXBlLFxuICBzdHlsZXM6IFBhcnRpYWw8U3R5bGVzVHlwZT4sXG4gIG9uRHJhZ1NlbGVjdGlvbkVuZDogKGRhdGU6IERhdGUpID0+IHZvaWQsXG4gIGhhbmRsZVJhbmdlRm9jdXNDaGFuZ2U6IChyYW5nZXNJbmRleDogbnVtYmVyLCByYW5nZUl0ZW1JbmRleDogbnVtYmVyKSA9PiB2b2lkXG59O1xuXG5mdW5jdGlvbiBEYXRlRGlzcGxheSh7XG4gIGZvY3VzZWRSYW5nZSxcbiAgY29sb3IsXG4gIHJhbmdlcyxcbiAgcmFuZ2VDb2xvcnMsXG4gIGRhdGVEaXNwbGF5Rm9ybWF0LFxuICBlZGl0YWJsZURhdGVJbnB1dHMsXG4gIHN0YXJ0RGF0ZVBsYWNlaG9sZGVyLFxuICBlbmREYXRlUGxhY2Vob2xkZXIsXG4gIGFyaWFMYWJlbHMsXG4gIHN0eWxlcyxcbiAgZGF0ZU9wdGlvbnMsXG4gIG9uRHJhZ1NlbGVjdGlvbkVuZCxcbiAgaGFuZGxlUmFuZ2VGb2N1c0NoYW5nZVxufTogRGF0ZURpc3BsYXlQcm9wcykge1xuICBjb25zdCBkZWZhdWx0Q29sb3IgPSByYW5nZUNvbG9yc1tmb2N1c2VkUmFuZ2VbMF1dIHx8IGNvbG9yO1xuXG4gIHJldHVybiAoXG4gICAgPGRpdiBjbGFzc05hbWU9e3N0eWxlcy5kYXRlRGlzcGxheVdyYXBwZXJ9PlxuICAgICAge3Jhbmdlcy5tYXAoKHJhbmdlLCBpKSA9PiB7XG4gICAgICAgIGlmIChyYW5nZS5zaG93RGF0ZURpc3BsYXkgPT09IGZhbHNlIHx8IChyYW5nZS5kaXNhYmxlZCAmJiAhcmFuZ2Uuc2hvd0RhdGVEaXNwbGF5KSlcbiAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgcmV0dXJuIChcbiAgICAgICAgICA8ZGl2XG4gICAgICAgICAgICBjbGFzc05hbWU9e3N0eWxlcy5kYXRlRGlzcGxheX1cbiAgICAgICAgICAgIGtleT17aX1cbiAgICAgICAgICAgIHN0eWxlPXt7IGNvbG9yOiByYW5nZS5jb2xvciB8fCBkZWZhdWx0Q29sb3IgfX0+XG4gICAgICAgICAgICA8RGF0ZUlucHV0XG4gICAgICAgICAgICAgIGNsYXNzTmFtZT17Y2xhc3NuYW1lcyhzdHlsZXMuZGF0ZURpc3BsYXlJdGVtLCB7XG4gICAgICAgICAgICAgICAgW3N0eWxlcy5kYXRlRGlzcGxheUl0ZW1BY3RpdmVdOiBmb2N1c2VkUmFuZ2VbMF0gPT09IGkgJiYgZm9jdXNlZFJhbmdlWzFdID09PSAwLFxuICAgICAgICAgICAgICB9KX1cbiAgICAgICAgICAgICAgcmVhZE9ubHk9eyFlZGl0YWJsZURhdGVJbnB1dHN9XG4gICAgICAgICAgICAgIGRpc2FibGVkPXtyYW5nZS5kaXNhYmxlZH1cbiAgICAgICAgICAgICAgdmFsdWU9e3JhbmdlLnN0YXJ0RGF0ZX1cbiAgICAgICAgICAgICAgcGxhY2Vob2xkZXI9e3N0YXJ0RGF0ZVBsYWNlaG9sZGVyfVxuICAgICAgICAgICAgICBkYXRlT3B0aW9ucz17ZGF0ZU9wdGlvbnN9XG4gICAgICAgICAgICAgIGRhdGVEaXNwbGF5Rm9ybWF0PXtkYXRlRGlzcGxheUZvcm1hdH1cbiAgICAgICAgICAgICAgYXJpYUxhYmVsPXtcbiAgICAgICAgICAgICAgICBhcmlhTGFiZWxzLmRhdGVJbnB1dCAmJlxuICAgICAgICAgICAgICAgIGFyaWFMYWJlbHMuZGF0ZUlucHV0W3JhbmdlLmtleV0gJiZcbiAgICAgICAgICAgICAgICBhcmlhTGFiZWxzLmRhdGVJbnB1dFtyYW5nZS5rZXldLnN0YXJ0RGF0ZVxuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIG9uQ2hhbmdlPXtvbkRyYWdTZWxlY3Rpb25FbmR9XG4gICAgICAgICAgICAgIG9uRm9jdXM9eygpID0+IGhhbmRsZVJhbmdlRm9jdXNDaGFuZ2UoaSwgMCl9XG4gICAgICAgICAgICAvPlxuICAgICAgICAgICAgPERhdGVJbnB1dFxuICAgICAgICAgICAgICBjbGFzc05hbWU9e2NsYXNzbmFtZXMoc3R5bGVzLmRhdGVEaXNwbGF5SXRlbSwge1xuICAgICAgICAgICAgICAgIFtzdHlsZXMuZGF0ZURpc3BsYXlJdGVtQWN0aXZlXTogZm9jdXNlZFJhbmdlWzBdID09PSBpICYmIGZvY3VzZWRSYW5nZVsxXSA9PT0gMSxcbiAgICAgICAgICAgICAgfSl9XG4gICAgICAgICAgICAgIHJlYWRPbmx5PXshZWRpdGFibGVEYXRlSW5wdXRzfVxuICAgICAgICAgICAgICBkaXNhYmxlZD17cmFuZ2UuZGlzYWJsZWR9XG4gICAgICAgICAgICAgIHZhbHVlPXtyYW5nZS5lbmREYXRlfVxuICAgICAgICAgICAgICBwbGFjZWhvbGRlcj17ZW5kRGF0ZVBsYWNlaG9sZGVyfVxuICAgICAgICAgICAgICBkYXRlT3B0aW9ucz17ZGF0ZU9wdGlvbnN9XG4gICAgICAgICAgICAgIGRhdGVEaXNwbGF5Rm9ybWF0PXtkYXRlRGlzcGxheUZvcm1hdH1cbiAgICAgICAgICAgICAgYXJpYUxhYmVsPXtcbiAgICAgICAgICAgICAgICBhcmlhTGFiZWxzLmRhdGVJbnB1dCAmJlxuICAgICAgICAgICAgICAgIGFyaWFMYWJlbHMuZGF0ZUlucHV0W3JhbmdlLmtleV0gJiZcbiAgICAgICAgICAgICAgICBhcmlhTGFiZWxzLmRhdGVJbnB1dFtyYW5nZS5rZXldLmVuZERhdGVcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICBvbkNoYW5nZT17b25EcmFnU2VsZWN0aW9uRW5kfVxuICAgICAgICAgICAgICBvbkZvY3VzPXsoKSA9PiBoYW5kbGVSYW5nZUZvY3VzQ2hhbmdlKGksIDEpfVxuICAgICAgICAgICAgLz5cbiAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgKTtcbiAgICAgIH0pfVxuICAgIDwvZGl2PlxuICApO1xufVxuXG5mdW5jdGlvbiBnZXRNb250aE5hbWVzKGxvY2FsZTogTG9jYWxlKSB7XG4gIHJldHVybiBbLi4uQXJyYXkoMTIpLmtleXMoKV0ubWFwKGkgPT4gbG9jYWxlLmxvY2FsaXplLm1vbnRoKGkgYXMgRk5TTW9udGgpKTtcbn1cblxuZnVuY3Rpb24gY2FsY1Njcm9sbEFyZWEoZGlyZWN0aW9uOiAndmVydGljYWwnIHwgJ2hvcml6b250YWwnLCBtb250aHM6IG51bWJlciwgc2Nyb2xsOiBDYWxlbmRhclByb3BzW1wic2Nyb2xsXCJdKSB7XG4gIGlmICghc2Nyb2xsLmVuYWJsZWQpIHJldHVybiB7IGVuYWJsZWQ6IGZhbHNlIH07XG5cbiAgY29uc3QgbG9uZ01vbnRoSGVpZ2h0ID0gc2Nyb2xsLmxvbmdNb250aEhlaWdodCB8fCBzY3JvbGwubW9udGhIZWlnaHQ7XG5cbiAgaWYgKGRpcmVjdGlvbiA9PT0gJ3ZlcnRpY2FsJykge1xuICAgIHJldHVybiB7XG4gICAgICBlbmFibGVkOiB0cnVlLFxuICAgICAgbW9udGhIZWlnaHQ6IHNjcm9sbC5tb250aEhlaWdodCB8fCAyMjAsXG4gICAgICBsb25nTW9udGhIZWlnaHQ6IGxvbmdNb250aEhlaWdodCB8fCAyNjAsXG4gICAgICBjYWxlbmRhcldpZHRoOiAnYXV0bycsXG4gICAgICBjYWxlbmRhckhlaWdodDogKHNjcm9sbC5jYWxlbmRhckhlaWdodCB8fCBsb25nTW9udGhIZWlnaHQgfHwgMjQwKSAqIG1vbnRocyxcbiAgICB9O1xuICB9XG4gIHJldHVybiB7XG4gICAgZW5hYmxlZDogdHJ1ZSxcbiAgICBtb250aFdpZHRoOiBzY3JvbGwubW9udGhXaWR0aCB8fCAzMzIsXG4gICAgY2FsZW5kYXJXaWR0aDogKHNjcm9sbC5jYWxlbmRhcldpZHRoIHx8IHNjcm9sbC5tb250aFdpZHRoIHx8IDMzMikgKiBtb250aHMsXG4gICAgbW9udGhIZWlnaHQ6IGxvbmdNb250aEhlaWdodCB8fCAzMDAsXG4gICAgY2FsZW5kYXJIZWlnaHQ6IGxvbmdNb250aEhlaWdodCB8fCAzMDAsXG4gIH07XG59Il0sIm1hcHBpbmdzIjoiOzs7Ozs7QUFBQSxJQUFBQSxNQUFBLEdBQUFDLHNCQUFBLENBQUFDLE9BQUE7QUFHQSxJQUFBQyxRQUFBLEdBQUFELE9BQUE7QUFFQSxJQUFBRSxLQUFBLEdBQUFGLE9BQUE7QUFDQSxJQUFBRyxNQUFBLEdBQUFILE9BQUE7QUFDQSxJQUFBSSxPQUFBLEdBQUFMLHNCQUFB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