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
    ariaLabels = {}
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
      updateShownDate();
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
        disablePreview: true
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJfcmVhY3QiLCJfaW50ZXJvcFJlcXVpcmVEZWZhdWx0IiwicmVxdWlyZSIsIl9kYXRlRm5zIiwiX2VuVVMiLCJfdXRpbHMiLCJfc3R5bGVzIiwiX0RhdGVJbnB1dCIsIl9jbGFzc25hbWVzIiwiX3JlYWN0TGlzdCIsIl9Nb250aCIsIm9iaiIsIl9fZXNNb2R1bGUiLCJkZWZhdWx0IiwiQ2FsZW5kYXIiLCJfcmVmIiwic2hvd01vbnRoQXJyb3ciLCJzaG93TW9udGhBbmRZZWFyUGlja2VycyIsImRpc2FibGVkRGF0ZXMiLCJkaXNhYmxlZERheSIsIm1pbkRhdGUiLCJhZGRZZWFycyIsIkRhdGUiLCJtYXhEYXRlIiwiZGF0ZSIsIm9uQ2hhbmdlIiwib25QcmV2aWV3Q2hhbmdlIiwib25SYW5nZUZvY3VzQ2hhbmdlIiwiY2xhc3NOYW1lcyIsImxvY2FsZSIsImVuVVMiLCJzaG93bkRhdGUiLCJvblNob3duRGF0ZUNoYW5nZSIsInJhbmdlcyIsInByZXZpZXciLCJkYXRlRGlzcGxheUZvcm1hdCIsIm1vbnRoRGlzcGxheUZvcm1hdCIsIndlZWtkYXlEaXNwbGF5Rm9ybWF0Iiwid2Vla1N0YXJ0c09uIiwiZGF5RGlzcGxheUZvcm1hdCIsImZvY3VzZWRSYW5nZSIsImRheUNvbnRlbnRSZW5kZXJlciIsIm1vbnRocyIsImNsYXNzTmFtZSIsInNob3dEYXRlRGlzcGxheSIsInNob3dQcmV2aWV3IiwiZGlzcGxheU1vZGUiLCJjb2xvciIsInVwZGF0ZVJhbmdlIiwic2Nyb2xsIiwiZW5hYmxlZCIsImRpcmVjdGlvbiIsInN0YXJ0RGF0ZVBsYWNlaG9sZGVyIiwiZW5kRGF0ZVBsYWNlaG9sZGVyIiwicmFuZ2VDb2xvcnMiLCJlZGl0YWJsZURhdGVJbnB1dHMiLCJkcmFnU2VsZWN0aW9uRW5hYmxlZCIsImZpeGVkSGVpZ2h0IiwiY2FsZW5kYXJGb2N1cyIsInByZXZlbnRTbmFwUmVmb2N1cyIsImFyaWFMYWJlbHMiLCJyZWZzIiwiUmVhY3QiLCJ1c2VSZWYiLCJkYXRlT3B0aW9ucyIsInN0eWxlcyIsImdlbmVyYXRlU3R5bGVzIiwiY29yZVN0eWxlcyIsImxpc3RTaXplQ2FjaGUiLCJsaXN0IiwiaXNGaXJzdFJlbmRlciIsInN0YXRlIiwic2V0U3RhdGUiLCJ1c2VTdGF0ZSIsIm1vbnRoTmFtZXMiLCJnZXRNb250aE5hbWVzIiwiZm9jdXNlZERhdGUiLCJjYWxjRm9jdXNEYXRlIiwiZHJhZyIsInN0YXR1cyIsInJhbmdlIiwic3RhcnREYXRlIiwiZW5kRGF0ZSIsImRpc2FibGVQcmV2aWV3Iiwic2Nyb2xsQXJlYSIsImNhbGNTY3JvbGxBcmVhIiwidW5kZWZpbmVkIiwidXBkYXRlU2hvd25EYXRlIiwibmV3Rm9jdXMiLCJmb2N1c1RvRGF0ZSIsInVzZUVmZmVjdCIsIkpTT04iLCJzdHJpbmdpZnkiLCJjdXJyZW50IiwiZ2V0VGltZSIsInMiLCJpc1ZlcnRpY2FsIiwib25EcmFnU2VsZWN0aW9uU3RhcnQiLCJvbkRyYWdTZWxlY3Rpb25FbmQiLCJuZXdSYW5nZSIsImlzU2FtZURheSIsIm9uRHJhZ1NlbGVjdGlvbk1vdmUiLCJoYW5kbGVSYW5nZUZvY3VzQ2hhbmdlIiwicmFuZ2VzSW5kZXgiLCJyYW5nZUl0ZW1JbmRleCIsImVzdGltYXRlTW9udGhTaXplIiwiaW5kZXgiLCJjYWNoZSIsIm1vbnRoV2lkdGgiLCJtb250aFN0ZXAiLCJhZGRNb250aHMiLCJzdGFydCIsImVuZCIsImdldE1vbnRoRGlzcGxheVJhbmdlIiwiaXNMb25nTW9udGgiLCJkaWZmZXJlbmNlSW5EYXlzIiwibG9uZ01vbnRoSGVpZ2h0IiwibW9udGhIZWlnaHQiLCJoYW5kbGVTY3JvbGwiLCJ2aXNpYmxlTW9udGhzIiwiZ2V0VmlzaWJsZVJhbmdlIiwidmlzaWJsZU1vbnRoIiwiaXNGb2N1c2VkVG9EaWZmZXJlbnQiLCJpc1NhbWVNb250aCIsInVwZGF0ZVByZXZpZXciLCJ2YWwiLCJwcmV2ZW50VW5uZWNlc3NhcnkiLCJhcmd1bWVudHMiLCJsZW5ndGgiLCJmb2N1c2VkRGF0ZURpZmYiLCJkaWZmZXJlbmNlSW5DYWxlbmRhck1vbnRocyIsImlzQWxsb3dlZEZvcndhcmQiLCJpc0FsbG93ZWRCYWNrd2FyZCIsIk1hdGgiLCJhYnMiLCJ0YXJnZXRNb250aEluZGV4IiwiaW5jbHVkZXMiLCJzY3JvbGxUbyIsImNoYW5nZVNob3duRGF0ZSIsInZhbHVlIiwibW9kZSIsIm1vZGVNYXBwZXIiLCJtb250aE9mZnNldCIsInNldE1vbnRoIiwic2V0WWVhciIsInNldCIsIm5ld0RhdGUiLCJtaW4iLCJtYXgiLCJyYW5nZXNJbnRlcm5hbCIsIm1hcCIsImkiLCJjcmVhdGVFbGVtZW50IiwiY2xhc3NuYW1lcyIsImNhbGVuZGFyV3JhcHBlciIsIm9uTW91c2VVcCIsIm9uTW91c2VMZWF2ZSIsIkRhdGVEaXNwbGF5IiwiTW9udGhBbmRZZWFyIiwiV2Vla2RheXMiLCJpbmZpbml0ZU1vbnRocyIsIm1vbnRoc1ZlcnRpY2FsIiwibW9udGhzSG9yaXpvbnRhbCIsInN0eWxlIiwid2lkdGgiLCJjYWxlbmRhcldpZHRoIiwiaGVpZ2h0IiwiY2FsZW5kYXJIZWlnaHQiLCJvblNjcm9sbCIsImVuZE9mTW9udGgiLCJhZGREYXlzIiwic3RhcnRPZk1vbnRoIiwidHlwZSIsInJlZiIsInRhcmdldCIsIml0ZW1TaXplRXN0aW1hdG9yIiwiYXhpcyIsIml0ZW1SZW5kZXJlciIsImtleSIsIm1vbnRoIiwic2hvd01vbnRoTmFtZSIsInNob3dXZWVrRGF5cyIsIkFycmF5IiwiZmlsbCIsIl8iLCJzdWJNb250aHMiLCJfcmVmMiIsInVwcGVyWWVhckxpbWl0IiwiZ2V0RnVsbFllYXIiLCJsb3dlclllYXJMaW1pdCIsImUiLCJzdG9wUHJvcGFnYXRpb24iLCJtb250aEFuZFllYXJXcmFwcGVyIiwibmV4dFByZXZCdXR0b24iLCJwcmV2QnV0dG9uIiwib25DbGljayIsIm1vbnRoQW5kWWVhclBpY2tlcnMiLCJtb250aFBpY2tlciIsImdldE1vbnRoIiwiTnVtYmVyIiwibW9udGhOYW1lIiwibW9udGhBbmRZZWFyRGl2aWRlciIsInllYXJQaWNrZXIiLCJ5ZWFyIiwibmV4dEJ1dHRvbiIsIl9yZWYzIiwibm93Iiwid2Vla0RheXMiLCJlYWNoRGF5T2ZJbnRlcnZhbCIsInN0YXJ0T2ZXZWVrIiwiZW5kT2ZXZWVrIiwiZGF5Iiwid2Vla0RheSIsImZvcm1hdCIsIl9yZWY0IiwiZGVmYXVsdENvbG9yIiwiZGF0ZURpc3BsYXlXcmFwcGVyIiwiZGlzYWJsZWQiLCJkYXRlRGlzcGxheSIsImRhdGVEaXNwbGF5SXRlbSIsImRhdGVEaXNwbGF5SXRlbUFjdGl2ZSIsInJlYWRPbmx5IiwicGxhY2Vob2xkZXIiLCJhcmlhTGFiZWwiLCJkYXRlSW5wdXQiLCJvbkZvY3VzIiwia2V5cyIsImxvY2FsaXplIl0sInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL2NvbXBvbmVudHMvQ2FsZW5kYXIvaW5kZXgudHN4Il0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBSZWFjdCBmcm9tICdyZWFjdCc7XG5pbXBvcnQgeyBTdHlsZXNUeXBlIH0gZnJvbSAnLi4vLi4vc3R5bGVzJztcbmltcG9ydCB7IEFyaWFzTGFiZWxzVHlwZSB9IGZyb20gJy4uLy4uL2FjY2Vzc2liaWxpdHknO1xuaW1wb3J0IHsgTG9jYWxlLCBXZWVrT3B0aW9ucywgTW9udGggYXMgRk5TTW9udGgsIGFkZERheXMsIGFkZE1vbnRocywgYWRkWWVhcnMsIGRpZmZlcmVuY2VJbkNhbGVuZGFyTW9udGhzLCBkaWZmZXJlbmNlSW5EYXlzLCBlYWNoRGF5T2ZJbnRlcnZhbCwgZW5kT2ZNb250aCwgZW5kT2ZXZWVrLCBmb3JtYXQsIGlzU2FtZURheSwgc3RhcnRPZk1vbnRoLCBzdGFydE9mV2Vlaywgc3ViTW9udGhzLCBpc1NhbWVNb250aCwgRm9ybWF0T3B0aW9ucywgUGFyc2VPcHRpb25zLCBzZXRNb250aCwgc2V0WWVhciwgbWluLCBtYXggfSBmcm9tICdkYXRlLWZucyc7XG5pbXBvcnQgeyBEYXRlUmFuZ2UgfSBmcm9tICcuLi9EYXlDZWxsJztcbmltcG9ydCB7IGVuVVMgfSBmcm9tICdkYXRlLWZucy9sb2NhbGUvZW4tVVMnO1xuaW1wb3J0IHsgY2FsY0ZvY3VzRGF0ZSwgZ2VuZXJhdGVTdHlsZXMsIGdldE1vbnRoRGlzcGxheVJhbmdlIH0gZnJvbSAnLi4vLi4vdXRpbHMnO1xuaW1wb3J0IGNvcmVTdHlsZXMgZnJvbSAnLi4vLi4vc3R5bGVzJztcbmltcG9ydCBEYXRlSW5wdXQgZnJvbSAnLi4vRGF0ZUlucHV0JztcbmltcG9ydCBjbGFzc25hbWVzIGZyb20gJ2NsYXNzbmFtZXMnO1xuaW1wb3J0IFJlYWN0TGlzdCBmcm9tICdyZWFjdC1saXN0JztcbmltcG9ydCBNb250aCBmcm9tICcuLi9Nb250aCc7XG5cbmV4cG9ydCB0eXBlIENhbGVuZGFyUHJvcHMgPSB7XG4gIHNob3dNb250aEFycm93PzogYm9vbGVhbixcbiAgc2hvd01vbnRoQW5kWWVhclBpY2tlcnM/OiBib29sZWFuLFxuICBkaXNhYmxlZERhdGVzPzogRGF0ZVtdLFxuICBkaXNhYmxlZERheT86IChkYXRlOiBEYXRlKSA9PiBib29sZWFuLFxuICBtaW5EYXRlPzogRGF0ZSxcbiAgbWF4RGF0ZT86IERhdGUsXG4gIGRhdGU/OiBEYXRlLFxuICBvbkNoYW5nZT86IChkYXRlOiBEYXRlKSA9PiB2b2lkLFxuICBvblByZXZpZXdDaGFuZ2U/OiAoZGF0ZT86IERhdGUpID0+IHZvaWQsXG4gIG9uUmFuZ2VGb2N1c0NoYW5nZT86IChyYW5nZTogbnVtYmVyW10pID0+IHZvaWQsXG4gIGNsYXNzTmFtZXM/OiBQYXJ0aWFsPFN0eWxlc1R5cGU+LFxuICBsb2NhbGU/OiBMb2NhbGUsXG4gIHNob3duRGF0ZT86IERhdGUsXG4gIG9uU2hvd25EYXRlQ2hhbmdlPzogKGRhdGU6IERhdGUpID0+IHZvaWQsXG4gIHJhbmdlcz86IERhdGVSYW5nZVtdLFxuICBwcmV2aWV3Pzoge1xuICAgIHN0YXJ0RGF0ZT86IERhdGUsXG4gICAgZW5kRGF0ZT86IERhdGUsXG4gICAgY29sb3I/OiBzdHJpbmdcbiAgfSxcbiAgZGF0ZURpc3BsYXlGb3JtYXQ/OiBzdHJpbmcsXG4gIG1vbnRoRGlzcGxheUZvcm1hdD86IHN0cmluZyxcbiAgd2Vla2RheURpc3BsYXlGb3JtYXQ/OiBzdHJpbmcsXG4gIHdlZWtTdGFydHNPbj86IG51bWJlcixcbiAgZGF5RGlzcGxheUZvcm1hdD86IHN0cmluZyxcbiAgZm9jdXNlZFJhbmdlPzogbnVtYmVyW10sXG4gIGRheUNvbnRlbnRSZW5kZXJlcj86IChkYXRlOiBEYXRlKSA9PiBSZWFjdC5SZWFjdEVsZW1lbnQsXG4gIGluaXRpYWxGb2N1c2VkUmFuZ2U/OiBudW1iZXJbXSxcbiAgbW9udGhzPzogbnVtYmVyLFxuICBjbGFzc05hbWU/OiBzdHJpbmcsXG4gIHNob3dEYXRlRGlzcGxheT86IGJvb2xlYW4sXG4gIHNob3dQcmV2aWV3PzogYm9vbGVhbixcbiAgZGlzcGxheU1vZGU/OiBcImRhdGVSYW5nZVwiIHwgXCJkYXRlXCIsXG4gIGNvbG9yPzogc3RyaW5nLFxuICB1cGRhdGVSYW5nZT86IChyYW5nZTogRGF0ZVJhbmdlKSA9PiB2b2lkLFxuICBzY3JvbGw/OiB7XG4gICAgZW5hYmxlZD86IGJvb2xlYW4sXG4gICAgbW9udGhIZWlnaHQ/OiBudW1iZXIsXG4gICAgbG9uZ01vbnRoSGVpZ2h0PzogbnVtYmVyLFxuICAgIG1vbnRoV2lkdGg/OiBudW1iZXIsXG4gICAgY2FsZW5kYXJXaWR0aD86IG51bWJlcixcbiAgICBjYWxlbmRhckhlaWdodD86IG51bWJlclxuICB9LFxuICBkaXJlY3Rpb24/OiAndmVydGljYWwnIHwgJ2hvcml6b250YWwnLFxuICBzdGFydERhdGVQbGFjZWhvbGRlcj86IHN0cmluZyxcbiAgZW5kRGF0ZVBsYWNlaG9sZGVyPzogc3RyaW5nLFxuICByYW5nZUNvbG9ycz86IHN0cmluZ1tdLFxuICBlZGl0YWJsZURhdGVJbnB1dHM/OiBib29sZWFuLFxuICBkcmFnU2VsZWN0aW9uRW5hYmxlZD86IGJvb2xlYW4sXG4gIGZpeGVkSGVpZ2h0PzogYm9vbGVhbixcbiAgY2FsZW5kYXJGb2N1cz86IFwiZm9yd2FyZHNcIiB8IFwiYmFja3dhcmRzXCIsXG4gIHByZXZlbnRTbmFwUmVmb2N1cz86IGJvb2xlYW4sXG4gIGFyaWFMYWJlbHM/OiBBcmlhc0xhYmVsc1R5cGVcbn07XG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIENhbGVuZGFyKHtcbiAgc2hvd01vbnRoQXJyb3cgPSB0cnVlLFxuICBzaG93TW9udGhBbmRZZWFyUGlja2VycyA9IHRydWUsXG4gIGRpc2FibGVkRGF0ZXMgPSBbXSxcbiAgZGlzYWJsZWREYXkgPSAoKSA9PiBmYWxzZSxcbiAgbWluRGF0ZSA9IGFkZFllYXJzKG5ldyBEYXRlKCksIC0xMDApLFxuICBtYXhEYXRlID0gYWRkWWVhcnMobmV3IERhdGUoKSwgMjApLFxuICBkYXRlLFxuICBvbkNoYW5nZSxcbiAgb25QcmV2aWV3Q2hhbmdlLFxuICBvblJhbmdlRm9jdXNDaGFuZ2UsXG4gIGNsYXNzTmFtZXMgPSB7fSxcbiAgbG9jYWxlID0gZW5VUyxcbiAgc2hvd25EYXRlLFxuICBvblNob3duRGF0ZUNoYW5nZSxcbiAgcmFuZ2VzID0gW10sXG4gIHByZXZpZXcsXG4gIGRhdGVEaXNwbGF5Rm9ybWF0ID0gJ01NTSBkLCB5eXl5JyxcbiAgbW9udGhEaXNwbGF5Rm9ybWF0ID0gJ01NTSB5eXl5JyxcbiAgd2Vla2RheURpc3BsYXlGb3JtYXQgPSAnRScsXG4gIHdlZWtTdGFydHNPbixcbiAgZGF5RGlzcGxheUZvcm1hdCA9ICdkJyxcbiAgZm9jdXNlZFJhbmdlID0gWzAsIDBdLFxuICBkYXlDb250ZW50UmVuZGVyZXIsXG4gIG1vbnRocyA9IDEsXG4gIGNsYXNzTmFtZSxcbiAgc2hvd0RhdGVEaXNwbGF5ID0gdHJ1ZSxcbiAgc2hvd1ByZXZpZXcgPSB0cnVlLFxuICBkaXNwbGF5TW9kZSA9ICdkYXRlJyxcbiAgY29sb3IgPSAnIzNkOTFmZicsXG4gIHVwZGF0ZVJhbmdlLFxuICBzY3JvbGwgPSB7XG4gICAgZW5hYmxlZDogZmFsc2VcbiAgfSxcbiAgZGlyZWN0aW9uID0gJ3ZlcnRpY2FsJyxcbiAgc3RhcnREYXRlUGxhY2Vob2xkZXIgPSBgRWFybHlgLFxuICBlbmREYXRlUGxhY2Vob2xkZXIgPSBgQ29udGludW91c2AsXG4gIHJhbmdlQ29sb3JzID0gWycjM2Q5MWZmJywgJyMzZWNmOGUnLCAnI2ZlZDE0YyddLFxuICBlZGl0YWJsZURhdGVJbnB1dHMgPSBmYWxzZSxcbiAgZHJhZ1NlbGVjdGlvbkVuYWJsZWQgPSB0cnVlLFxuICBmaXhlZEhlaWdodCA9IGZhbHNlLFxuICBjYWxlbmRhckZvY3VzID0gJ2ZvcndhcmRzJyxcbiAgcHJldmVudFNuYXBSZWZvY3VzID0gZmFsc2UsXG4gIGFyaWFMYWJlbHMgPSB7fSxcbn06IENhbGVuZGFyUHJvcHMpIHtcblxuICBjb25zdCByZWZzID0gUmVhY3QudXNlUmVmKHtcbiAgICBkYXRlT3B0aW9uczoge1xuICAgICAgbG9jYWxlLFxuICAgICAgd2Vla1N0YXJ0c09uXG4gICAgfSxcbiAgICBzdHlsZXM6IGdlbmVyYXRlU3R5bGVzKFtjb3JlU3R5bGVzLCBjbGFzc05hbWVzXSksXG4gICAgbGlzdFNpemVDYWNoZToge30sXG4gICAgbGlzdDogbnVsbCxcbiAgICBzY3JvbGwsXG4gICAgaXNGaXJzdFJlbmRlcjogdHJ1ZSxcbiAgICBkYXRlOiBkYXRlLFxuICAgIHJhbmdlczogcmFuZ2VzXG4gIH0pO1xuXG4gIGNvbnN0IFtzdGF0ZSwgc2V0U3RhdGVdID0gUmVhY3QudXNlU3RhdGUoe1xuICAgIG1vbnRoTmFtZXM6IGdldE1vbnRoTmFtZXMobG9jYWxlKSxcbiAgICBmb2N1c2VkRGF0ZTogY2FsY0ZvY3VzRGF0ZShudWxsLCBzaG93bkRhdGUsIGRhdGUsIG1vbnRocywgcmFuZ2VzLCBmb2N1c2VkUmFuZ2UsIGRpc3BsYXlNb2RlKSxcbiAgICBkcmFnOiB7XG4gICAgICBzdGF0dXM6IGZhbHNlLFxuICAgICAgcmFuZ2U6IHsgc3RhcnREYXRlOiBudWxsLCBlbmREYXRlOiBudWxsIH0sXG4gICAgICBkaXNhYmxlUHJldmlldzogZmFsc2VcbiAgICB9LFxuICAgIHNjcm9sbEFyZWE6IGNhbGNTY3JvbGxBcmVhKGRpcmVjdGlvbiwgbW9udGhzLCBzY3JvbGwpLFxuICAgIHByZXZpZXc6IHVuZGVmaW5lZFxuICB9KTtcblxuICBjb25zdCB1cGRhdGVTaG93bkRhdGUgPSAoKSA9PiB7XG4gICAgY29uc3QgbmV3Rm9jdXMgPSBjYWxjRm9jdXNEYXRlKHN0YXRlLmZvY3VzZWREYXRlLCBzaG93bkRhdGUsIGRhdGUsIG1vbnRocywgcmFuZ2VzLCBmb2N1c2VkUmFuZ2UsIGRpc3BsYXlNb2RlKTtcblxuICAgIGZvY3VzVG9EYXRlKG5ld0ZvY3VzKTtcbiAgfVxuXG4gIFJlYWN0LnVzZUVmZmVjdCgoKSA9PiB7XG5cbiAgICBpZiAoSlNPTi5zdHJpbmdpZnkocmFuZ2VzKSAhPSBKU09OLnN0cmluZ2lmeShyZWZzLmN1cnJlbnQucmFuZ2VzKSB8fCBkYXRlPy5nZXRUaW1lPy4oKSAhPSByZWZzLmN1cnJlbnQuZGF0ZT8uZ2V0VGltZT8uKCkpIHtcbiAgICAgIHJlZnMuY3VycmVudC5yYW5nZXMgPSByYW5nZXM7XG4gICAgICByZWZzLmN1cnJlbnQuZGF0ZSA9IGRhdGU7XG5cbiAgICAgIHVwZGF0ZVNob3duRGF0ZSgpO1xuICAgIH1cblxuICAgIGlmIChyZWZzLmN1cnJlbnQuZGF0ZU9wdGlvbnMubG9jYWxlICE9IGxvY2FsZSkge1xuICAgICAgcmVmcy5jdXJyZW50LmRhdGVPcHRpb25zLmxvY2FsZSA9IGxvY2FsZTtcbiAgICAgIHNldFN0YXRlKHMgPT4gKHsgLi4ucywgbW9udGhOYW1lczogZ2V0TW9udGhOYW1lcyhsb2NhbGUpIH0pKTtcbiAgICB9XG5cbiAgICByZWZzLmN1cnJlbnQuZGF0ZU9wdGlvbnMud2Vla1N0YXJ0c09uID0gd2Vla1N0YXJ0c09uO1xuXG4gICAgaWYgKEpTT04uc3RyaW5naWZ5KHJlZnMuY3VycmVudC5zY3JvbGwpICE9IEpTT04uc3RyaW5naWZ5KHNjcm9sbCkpIHtcbiAgICAgIHJlZnMuY3VycmVudC5zY3JvbGwgPSBzY3JvbGw7XG5cblxuICAgICAgc2V0U3RhdGUocyA9PiAoeyAuLi5zLCBzY3JvbGxBcmVhOiBjYWxjU2Nyb2xsQXJlYShkaXJlY3Rpb24sIG1vbnRocywgc2Nyb2xsKSB9KSk7XG4gICAgfVxuXG4gIH0sIFtyYW5nZXMsIGRhdGUsIHNjcm9sbCwgZGlyZWN0aW9uLCBtb250aHMsIGxvY2FsZSwgd2Vla1N0YXJ0c09uXSk7XG5cbiAgUmVhY3QudXNlRWZmZWN0KCgpID0+IHtcbiAgICBpZiAoc2Nyb2xsLmVuYWJsZWQpIHtcbiAgICAgIGZvY3VzVG9EYXRlKHN0YXRlLmZvY3VzZWREYXRlKTtcbiAgICB9XG4gIH0sIFtzY3JvbGwuZW5hYmxlZF0pO1xuXG4gIGNvbnN0IGlzVmVydGljYWwgPSBkaXJlY3Rpb24gPT09ICd2ZXJ0aWNhbCc7XG5cbiAgY29uc3Qgb25EcmFnU2VsZWN0aW9uU3RhcnQgPSAoZGF0ZTogRGF0ZSkgPT4ge1xuICAgIGlmIChkcmFnU2VsZWN0aW9uRW5hYmxlZCkge1xuICAgICAgc2V0U3RhdGUoeyAuLi5zdGF0ZSwgZHJhZzogeyBzdGF0dXM6IHRydWUsIHJhbmdlOiB7IHN0YXJ0RGF0ZTogZGF0ZSwgZW5kRGF0ZTogZGF0ZSB9LCBkaXNhYmxlUHJldmlldzogZmFsc2UgfSB9KTtcbiAgICB9IGVsc2Uge1xuICAgICAgb25DaGFuZ2U/LihkYXRlKTtcbiAgICB9XG4gIH1cblxuICBjb25zdCBvbkRyYWdTZWxlY3Rpb25FbmQgPSAoZGF0ZTogRGF0ZSkgPT4ge1xuICAgIGlmICghZHJhZ1NlbGVjdGlvbkVuYWJsZWQpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBpZiAoZGlzcGxheU1vZGUgPT0gJ2RhdGUnIHx8ICFzdGF0ZS5kcmFnLnN0YXR1cykge1xuICAgICAgb25DaGFuZ2U/LihkYXRlKTtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBjb25zdCBuZXdSYW5nZSA9IHtcbiAgICAgIHN0YXJ0RGF0ZTogc3RhdGUuZHJhZy5yYW5nZS5zdGFydERhdGUsXG4gICAgICBlbmREYXRlOiBkYXRlXG4gICAgfVxuXG4gICAgaWYgKGRpc3BsYXlNb2RlICE9ICdkYXRlUmFuZ2UnIHx8IGlzU2FtZURheShuZXdSYW5nZS5zdGFydERhdGUsIGRhdGUpKSB7XG4gICAgICBzZXRTdGF0ZSh7IC4uLnN0YXRlLCBkcmFnOiB7IHN0YXR1czogZmFsc2UsIHJhbmdlOiB7IHN0YXJ0RGF0ZTogbnVsbCwgZW5kRGF0ZTogbnVsbCB9LCBkaXNhYmxlUHJldmlldzogc3RhdGUuZHJhZy5kaXNhYmxlUHJldmlldyB9IH0pO1xuICAgICAgb25DaGFuZ2U/LihkYXRlKTtcbiAgICB9IGVsc2Uge1xuICAgICAgc2V0U3RhdGUoeyAuLi5zdGF0ZSwgZHJhZzogeyBzdGF0dXM6IGZhbHNlLCByYW5nZTogeyBzdGFydERhdGU6IG51bGwsIGVuZERhdGU6IG51bGwgfSwgZGlzYWJsZVByZXZpZXc6IHN0YXRlLmRyYWcuZGlzYWJsZVByZXZpZXcgfSB9KTtcbiAgICAgIHVwZGF0ZVJhbmdlPy4obmV3UmFuZ2UpO1xuICAgIH1cbiAgfVxuXG4gIGNvbnN0IG9uRHJhZ1NlbGVjdGlvbk1vdmUgPSAoZGF0ZTogRGF0ZSkgPT4ge1xuICAgIGlmICghc3RhdGUuZHJhZy5zdGF0dXMgfHwgIWRyYWdTZWxlY3Rpb25FbmFibGVkKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgc2V0U3RhdGUoeyAuLi5zdGF0ZSwgZHJhZzogeyBzdGF0dXM6IHN0YXRlLmRyYWcuc3RhdHVzLCByYW5nZTogeyBzdGFydERhdGU6IHN0YXRlLmRyYWcucmFuZ2Uuc3RhcnREYXRlLCBlbmREYXRlOiBkYXRlIH0sIGRpc2FibGVQcmV2aWV3OiB0cnVlIH0gfSk7XG4gIH1cblxuICBjb25zdCBoYW5kbGVSYW5nZUZvY3VzQ2hhbmdlID0gKHJhbmdlc0luZGV4OiBudW1iZXIsIHJhbmdlSXRlbUluZGV4OiBudW1iZXIpID0+IHtcbiAgICBvblJhbmdlRm9jdXNDaGFuZ2U/LihbcmFuZ2VzSW5kZXgsIHJhbmdlSXRlbUluZGV4XSk7XG4gIH1cblxuICBjb25zdCBlc3RpbWF0ZU1vbnRoU2l6ZSA9IChpbmRleDogbnVtYmVyLCBjYWNoZT86IHtbeDogc3RyaW5nXTogbnVtYmVyfSkgPT4ge1xuICAgIFxuICAgIGlmIChjYWNoZSkge1xuICAgICAgcmVmcy5jdXJyZW50Lmxpc3RTaXplQ2FjaGUgPSBjYWNoZTtcblxuICAgICAgaWYgKGNhY2hlW2luZGV4XSkge1xuICAgICAgICByZXR1cm4gY2FjaGVbaW5kZXhdO1xuICAgICAgfVxuICAgIH1cblxuICAgIGlmIChkaXJlY3Rpb24gPT0gJ2hvcml6b250YWwnKSB7XG4gICAgICByZXR1cm4gc3RhdGUuc2Nyb2xsQXJlYS5tb250aFdpZHRoO1xuICAgIH1cblxuICAgIGNvbnN0IG1vbnRoU3RlcCA9IGFkZE1vbnRocyhtaW5EYXRlLCBpbmRleCk7XG4gICAgY29uc3QgeyBzdGFydCwgZW5kIH0gPSBnZXRNb250aERpc3BsYXlSYW5nZShtb250aFN0ZXAsIHJlZnMuY3VycmVudC5kYXRlT3B0aW9ucyBhcyBXZWVrT3B0aW9ucyk7XG4gICAgY29uc3QgaXNMb25nTW9udGggPSBkaWZmZXJlbmNlSW5EYXlzKGVuZCwgc3RhcnQpICsgMSA+IDcgKiA1O1xuICAgIHJldHVybiBpc0xvbmdNb250aCA/IHN0YXRlLnNjcm9sbEFyZWEubG9uZ01vbnRoSGVpZ2h0IDogc3RhdGUuc2Nyb2xsQXJlYS5tb250aEhlaWdodDtcbiAgfVxuXG4gIGNvbnN0IGhhbmRsZVNjcm9sbCA9ICgpID0+IHtcbiAgICBjb25zdCB2aXNpYmxlTW9udGhzID0gcmVmcy5jdXJyZW50Lmxpc3QuZ2V0VmlzaWJsZVJhbmdlKCk7XG5cbiAgICBpZiAodmlzaWJsZU1vbnRoc1swXSA9PT0gdW5kZWZpbmVkKSByZXR1cm47XG5cbiAgICBjb25zdCB2aXNpYmxlTW9udGggPSBhZGRNb250aHMobWluRGF0ZSwgdmlzaWJsZU1vbnRoc1swXSB8fCAwKTtcbiAgICBjb25zdCBpc0ZvY3VzZWRUb0RpZmZlcmVudCA9ICFpc1NhbWVNb250aCh2aXNpYmxlTW9udGgsIHN0YXRlLmZvY3VzZWREYXRlKTtcblxuICAgIGlmIChpc0ZvY3VzZWRUb0RpZmZlcmVudCAmJiAhcmVmcy5jdXJyZW50LmlzRmlyc3RSZW5kZXIpIHtcbiAgICAgIHNldFN0YXRlKHMgPT4gKHsgLi4ucywgZm9jdXNlZERhdGU6IHZpc2libGVNb250aCB9KSk7XG4gICAgICBvblNob3duRGF0ZUNoYW5nZT8uKHZpc2libGVNb250aCk7XG4gICAgfVxuXG4gICAgcmVmcy5jdXJyZW50LmlzRmlyc3RSZW5kZXIgPSBmYWxzZTtcbiAgfVxuXG4gIGNvbnN0IHVwZGF0ZVByZXZpZXcgPSAodmFsPzogRGF0ZSkgPT4ge1xuICAgIGlmICghdmFsKSB7XG4gICAgICBzZXRTdGF0ZShzID0+ICh7IC4uLnMsIHByZXZpZXc6IHVuZGVmaW5lZCB9KSk7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgY29uc3QgcHJldmlldyA9IHtcbiAgICAgIHN0YXJ0RGF0ZTogdmFsLFxuICAgICAgZW5kRGF0ZTogdmFsLFxuICAgICAgY29sb3I6IGNvbG9yXG4gICAgfVxuXG4gICAgc2V0U3RhdGUocyA9PiAoeyAuLi5zLCBwcmV2aWV3IH0pKTtcbiAgfVxuXG4gIGNvbnN0IGZvY3VzVG9EYXRlID0gKGRhdGU6IERhdGUsIHByZXZlbnRVbm5lY2Vzc2FyeSA9IHRydWUpID0+IHtcblxuICAgIGlmICghc2Nyb2xsLmVuYWJsZWQpIHtcbiAgICAgIGlmIChwcmV2ZW50VW5uZWNlc3NhcnkgJiYgcHJldmVudFNuYXBSZWZvY3VzKSB7XG4gICAgICAgIGNvbnN0IGZvY3VzZWREYXRlRGlmZiA9IGRpZmZlcmVuY2VJbkNhbGVuZGFyTW9udGhzKGRhdGUsIHN0YXRlLmZvY3VzZWREYXRlKTtcblxuICAgICAgICBjb25zdCBpc0FsbG93ZWRGb3J3YXJkID0gY2FsZW5kYXJGb2N1cyA9PT0gJ2ZvcndhcmRzJyAmJiBmb2N1c2VkRGF0ZURpZmYgPj0gMDtcbiAgICAgICAgY29uc3QgaXNBbGxvd2VkQmFja3dhcmQgPSBjYWxlbmRhckZvY3VzID09PSAnYmFja3dhcmRzJyAmJiBmb2N1c2VkRGF0ZURpZmYgPD0gMDtcbiAgICAgICAgaWYgKChpc0FsbG93ZWRGb3J3YXJkIHx8IGlzQWxsb3dlZEJhY2t3YXJkKSAmJiBNYXRoLmFicyhmb2N1c2VkRGF0ZURpZmYpIDwgbW9udGhzKSB7XG4gICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIHNldFN0YXRlKHMgPT4gKHsgLi4ucywgZm9jdXNlZERhdGU6IGRhdGUgfSkpO1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGNvbnN0IHRhcmdldE1vbnRoSW5kZXggPSBkaWZmZXJlbmNlSW5DYWxlbmRhck1vbnRocyhkYXRlLCBtaW5EYXRlKTtcbiAgICBjb25zdCB2aXNpYmxlTW9udGhzID0gcmVmcy5jdXJyZW50Lmxpc3QuZ2V0VmlzaWJsZVJhbmdlKCk7XG5cbiAgICBpZiAocHJldmVudFVubmVjZXNzYXJ5ICYmIHZpc2libGVNb250aHMuaW5jbHVkZXModGFyZ2V0TW9udGhJbmRleCkpIHJldHVybjtcblxuICAgIHJlZnMuY3VycmVudC5pc0ZpcnN0UmVuZGVyID0gdHJ1ZTtcbiAgICByZWZzLmN1cnJlbnQubGlzdC5zY3JvbGxUbyh0YXJnZXRNb250aEluZGV4KTtcbiAgICBzZXRTdGF0ZShzID0+ICh7IC4uLnMsIGZvY3VzZWREYXRlOiBkYXRlIH0pKTtcbiAgfVxuXG4gIGNvbnN0IGNoYW5nZVNob3duRGF0ZSA9ICh2YWx1ZTogbnVtYmVyLCBtb2RlOiBcInNldFwiIHwgXCJzZXRZZWFyXCIgfCBcInNldE1vbnRoXCIgfCBcIm1vbnRoT2Zmc2V0XCIgPSBcInNldFwiKSA9PiB7XG4gICAgY29uc3QgbW9kZU1hcHBlciA9IHtcbiAgICAgIG1vbnRoT2Zmc2V0OiAoKSA9PiBhZGRNb250aHMoc3RhdGUuZm9jdXNlZERhdGUsIHZhbHVlKSxcbiAgICAgIHNldE1vbnRoOiAoKSA9PiBzZXRNb250aChzdGF0ZS5mb2N1c2VkRGF0ZSwgdmFsdWUpLFxuICAgICAgc2V0WWVhcjogKCkgPT4gc2V0WWVhcihzdGF0ZS5mb2N1c2VkRGF0ZSwgdmFsdWUpLFxuICAgICAgc2V0OiAoKSA9PiB2YWx1ZSxcbiAgICB9O1xuXG4gICAgY29uc3QgbmV3RGF0ZSA9IG1pbihbbWF4KFttb2RlTWFwcGVyW21vZGVdKCksIG1pbkRhdGVdKSwgbWF4RGF0ZV0pO1xuICAgIGZvY3VzVG9EYXRlKG5ld0RhdGUsIGZhbHNlKTtcbiAgICBvblNob3duRGF0ZUNoYW5nZT8uKG5ld0RhdGUpO1xuICB9XG5cbiAgY29uc3QgcmFuZ2VzSW50ZXJuYWwgPSByYW5nZXMubWFwKChyYW5nZSwgaSkgPT4gKHtcbiAgICAuLi5yYW5nZSxcbiAgICBjb2xvcjogcmFuZ2UuY29sb3IgfHwgcmFuZ2VDb2xvcnNbaV0gfHwgY29sb3IsXG4gIH0pKTtcblxuICByZXR1cm4gKFxuICAgIDxkaXZcbiAgICAgIGNsYXNzTmFtZT17Y2xhc3NuYW1lcyhyZWZzLmN1cnJlbnQuc3R5bGVzLmNhbGVuZGFyV3JhcHBlciwgY2xhc3NOYW1lKX1cbiAgICAgIG9uTW91c2VVcD17KCkgPT4ge1xuICAgICAgICBzZXRTdGF0ZSh7IC4uLnN0YXRlLCBkcmFnOiB7IHN0YXR1czogZmFsc2UsIHJhbmdlOiB7IHN0YXJ0RGF0ZTogbnVsbCwgZW5kRGF0ZTogbnVsbCB9LCBkaXNhYmxlUHJldmlldzogZmFsc2UgfSB9KTtcbiAgICAgIH19XG4gICAgICBvbk1vdXNlTGVhdmU9eygpID0+IHtcbiAgICAgICAgc2V0U3RhdGUoeyAuLi5zdGF0ZSwgZHJhZzogeyBzdGF0dXM6IGZhbHNlLCByYW5nZTogeyBzdGFydERhdGU6IG51bGwsIGVuZERhdGU6IG51bGwgfSwgZGlzYWJsZVByZXZpZXc6IGZhbHNlIH0gfSk7XG4gICAgICB9fT5cbiAgICAgIHtzaG93RGF0ZURpc3BsYXkgPyA8RGF0ZURpc3BsYXkgb25EcmFnU2VsZWN0aW9uRW5kPXtvbkRyYWdTZWxlY3Rpb25FbmR9IGhhbmRsZVJhbmdlRm9jdXNDaGFuZ2U9e2hhbmRsZVJhbmdlRm9jdXNDaGFuZ2V9IGRhdGVPcHRpb25zPXtyZWZzLmN1cnJlbnQuZGF0ZU9wdGlvbnMgYXMgUGFyc2VPcHRpb25zfSBhcmlhTGFiZWxzPXthcmlhTGFiZWxzfSBzdHlsZXM9e3JlZnMuY3VycmVudC5zdHlsZXN9IHN0YXJ0RGF0ZVBsYWNlaG9sZGVyPXtzdGFydERhdGVQbGFjZWhvbGRlcn0gZW5kRGF0ZVBsYWNlaG9sZGVyPXtlbmREYXRlUGxhY2Vob2xkZXJ9IGVkaXRhYmxlRGF0ZUlucHV0cz17ZWRpdGFibGVEYXRlSW5wdXRzfSBmb2N1c2VkUmFuZ2U9e2ZvY3VzZWRSYW5nZX0gY29sb3I9e2NvbG9yfSByYW5nZXM9e3Jhbmdlc0ludGVybmFsfSByYW5nZUNvbG9ycz17cmFuZ2VDb2xvcnN9IGRhdGVEaXNwbGF5Rm9ybWF0PXtkYXRlRGlzcGxheUZvcm1hdH0gLz4gOiBudWxsfVxuICAgICAgPE1vbnRoQW5kWWVhciBtb250aE5hbWVzPXtzdGF0ZS5tb250aE5hbWVzfSBmb2N1c2VkRGF0ZT17c3RhdGUuZm9jdXNlZERhdGV9IGNoYW5nZVNob3duRGF0ZT17Y2hhbmdlU2hvd25EYXRlfSBzdHlsZXM9e3JlZnMuY3VycmVudC5zdHlsZXMgYXMgU3R5bGVzVHlwZX0gc2hvd01vbnRoQW5kWWVhclBpY2tlcnM9e3Nob3dNb250aEFuZFllYXJQaWNrZXJzfSBzaG93TW9udGhBcnJvdz17c2hvd01vbnRoQXJyb3d9IG1pbkRhdGU9e21pbkRhdGV9IG1heERhdGU9e21heERhdGV9IGFyaWFMYWJlbHM9e2FyaWFMYWJlbHN9IC8+XG4gICAgICB7c2Nyb2xsLmVuYWJsZWQgPyAoXG4gICAgICAgIDxkaXY+XG4gICAgICAgICAge2lzVmVydGljYWwgPyA8V2Vla2RheXMgc3R5bGVzPXtyZWZzLmN1cnJlbnQuc3R5bGVzfSBkYXRlT3B0aW9ucz17cmVmcy5jdXJyZW50LmRhdGVPcHRpb25zfSB3ZWVrZGF5RGlzcGxheUZvcm1hdD17d2Vla2RheURpc3BsYXlGb3JtYXR9IC8+IDogbnVsbH1cbiAgICAgICAgICA8ZGl2XG4gICAgICAgICAgICBjbGFzc05hbWU9e2NsYXNzbmFtZXMoXG4gICAgICAgICAgICAgIHJlZnMuY3VycmVudC5zdHlsZXMuaW5maW5pdGVNb250aHMsXG4gICAgICAgICAgICAgIGlzVmVydGljYWwgPyByZWZzLmN1cnJlbnQuc3R5bGVzLm1vbnRoc1ZlcnRpY2FsIDogcmVmcy5jdXJyZW50LnN0eWxlcy5tb250aHNIb3Jpem9udGFsXG4gICAgICAgICAgICApfVxuICAgICAgICAgICAgb25Nb3VzZUxlYXZlPXsoKSA9PiBvblByZXZpZXdDaGFuZ2U/LigpfVxuICAgICAgICAgICAgc3R5bGU9e3tcbiAgICAgICAgICAgICAgd2lkdGg6IHR5cGVvZiBzdGF0ZS5zY3JvbGxBcmVhLmNhbGVuZGFyV2lkdGggPT09ICdzdHJpbmcnID8gc3RhdGUuc2Nyb2xsQXJlYS5jYWxlbmRhcldpZHRoIDogKChzdGF0ZS5zY3JvbGxBcmVhLmNhbGVuZGFyV2lkdGggfHwgMCkgKyAxMSksXG4gICAgICAgICAgICAgIGhlaWdodDogc3RhdGUuc2Nyb2xsQXJlYS5jYWxlbmRhckhlaWdodCArIDExLFxuICAgICAgICAgICAgfX1cbiAgICAgICAgICAgIG9uU2Nyb2xsPXtoYW5kbGVTY3JvbGx9PlxuICAgICAgICAgICAgPFJlYWN0TGlzdFxuICAgICAgICAgICAgICBsZW5ndGg9e2RpZmZlcmVuY2VJbkNhbGVuZGFyTW9udGhzKFxuICAgICAgICAgICAgICAgIGVuZE9mTW9udGgobWF4RGF0ZSksXG4gICAgICAgICAgICAgICAgYWRkRGF5cyhzdGFydE9mTW9udGgobWluRGF0ZSksIC0xKVxuICAgICAgICAgICAgICApfVxuICAgICAgICAgICAgICB0eXBlPVwidmFyaWFibGVcIlxuICAgICAgICAgICAgICByZWY9e3RhcmdldCA9PiB7XG4gICAgICAgICAgICAgICAgcmVmcy5jdXJyZW50Lmxpc3QgPSB0YXJnZXQ7XG4gICAgICAgICAgICAgIH19XG4gICAgICAgICAgICAgIGl0ZW1TaXplRXN0aW1hdG9yPXtlc3RpbWF0ZU1vbnRoU2l6ZX1cbiAgICAgICAgICAgICAgYXhpcz17aXNWZXJ0aWNhbCA/ICd5JyA6ICd4J31cbiAgICAgICAgICAgICAgaXRlbVJlbmRlcmVyPXsoaW5kZXgsIGtleSkgPT4ge1xuICAgICAgICAgICAgICAgIGNvbnN0IG1vbnRoU3RlcCA9IGFkZE1vbnRocyhtaW5EYXRlLCBpbmRleCk7XG4gICAgICAgICAgICAgICAgcmV0dXJuIChcbiAgICAgICAgICAgICAgICAgIDxNb250aFxuICAgICAgICAgICAgICAgICAgICBkYXlDb250ZW50UmVuZGVyZXI9e2RheUNvbnRlbnRSZW5kZXJlcn1cbiAgICAgICAgICAgICAgICAgICAgZml4ZWRIZWlnaHQ9e2ZpeGVkSGVpZ2h0fVxuICAgICAgICAgICAgICAgICAgICBzaG93UHJldmlldz17c2hvd1ByZXZpZXd9XG4gICAgICAgICAgICAgICAgICAgIHdlZWtkYXlEaXNwbGF5Rm9ybWF0PXt3ZWVrZGF5RGlzcGxheUZvcm1hdH1cbiAgICAgICAgICAgICAgICAgICAgZGF5RGlzcGxheUZvcm1hdD17ZGF5RGlzcGxheUZvcm1hdH1cbiAgICAgICAgICAgICAgICAgICAgZGlzcGxheU1vZGU9e2Rpc3BsYXlNb2RlfVxuICAgICAgICAgICAgICAgICAgICBvblByZXZpZXdDaGFuZ2U9e29uUHJldmlld0NoYW5nZSB8fCB1cGRhdGVQcmV2aWV3fVxuICAgICAgICAgICAgICAgICAgICBwcmV2aWV3PXtwcmV2aWV3IHx8IHN0YXRlLnByZXZpZXd9XG4gICAgICAgICAgICAgICAgICAgIHJhbmdlcz17cmFuZ2VzSW50ZXJuYWx9XG4gICAgICAgICAgICAgICAgICAgIGtleT17a2V5fVxuICAgICAgICAgICAgICAgICAgICBmb2N1c2VkUmFuZ2U9e2ZvY3VzZWRSYW5nZX1cbiAgICAgICAgICAgICAgICAgICAgZHJhZz17c3RhdGUuZHJhZ31cbiAgICAgICAgICAgICAgICAgICAgbW9udGhEaXNwbGF5Rm9ybWF0PXttb250aERpc3BsYXlGb3JtYXR9XG4gICAgICAgICAgICAgICAgICAgIGRhdGVPcHRpb25zPXtyZWZzLmN1cnJlbnQuZGF0ZU9wdGlvbnMgYXMgdW5rbm93biBhcyBGb3JtYXRPcHRpb25zfVxuICAgICAgICAgICAgICAgICAgICBkaXNhYmxlZERhdGVzPXtkaXNhYmxlZERhdGVzfVxuICAgICAgICAgICAgICAgICAgICBkaXNhYmxlZERheT17ZGlzYWJsZWREYXl9XG4gICAgICAgICAgICAgICAgICAgIG1vbnRoPXttb250aFN0ZXB9XG4gICAgICAgICAgICAgICAgICAgIG9uRHJhZ1NlbGVjdGlvblN0YXJ0PXtvbkRyYWdTZWxlY3Rpb25TdGFydH1cbiAgICAgICAgICAgICAgICAgICAgb25EcmFnU2VsZWN0aW9uRW5kPXtvbkRyYWdTZWxlY3Rpb25FbmR9XG4gICAgICAgICAgICAgICAgICAgIG9uRHJhZ1NlbGVjdGlvbk1vdmU9e29uRHJhZ1NlbGVjdGlvbk1vdmV9XG4gICAgICAgICAgICAgICAgICAgIG9uTW91c2VMZWF2ZT17KCkgPT4gb25QcmV2aWV3Q2hhbmdlPy4oKX1cbiAgICAgICAgICAgICAgICAgICAgc3R5bGVzPXtyZWZzLmN1cnJlbnQuc3R5bGVzIGFzIFN0eWxlc1R5cGV9XG4gICAgICAgICAgICAgICAgICAgIHN0eWxlPXtcbiAgICAgICAgICAgICAgICAgICAgICBpc1ZlcnRpY2FsXG4gICAgICAgICAgICAgICAgICAgICAgICA/IHsgaGVpZ2h0OiBlc3RpbWF0ZU1vbnRoU2l6ZShpbmRleCkgfVxuICAgICAgICAgICAgICAgICAgICAgICAgOiB7IGhlaWdodDogc3RhdGUuc2Nyb2xsQXJlYS5tb250aEhlaWdodCwgd2lkdGg6IGVzdGltYXRlTW9udGhTaXplKGluZGV4KSB9XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgc2hvd01vbnRoTmFtZVxuICAgICAgICAgICAgICAgICAgICBzaG93V2Vla0RheXM9eyFpc1ZlcnRpY2FsfVxuICAgICAgICAgICAgICAgICAgICBjb2xvcj17Y29sb3J9XG4gICAgICAgICAgICAgICAgICAgIG1heERhdGU9e21heERhdGV9XG4gICAgICAgICAgICAgICAgICAgIG1pbkRhdGU9e21pbkRhdGV9XG4gICAgICAgICAgICAgICAgICAgIGRhdGU9e2RhdGV9XG4gICAgICAgICAgICAgICAgICAvPlxuICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICAgIH19XG4gICAgICAgICAgICAvPlxuICAgICAgICAgIDwvZGl2PlxuICAgICAgICA8L2Rpdj5cbiAgICAgICkgOiAoXG4gICAgICAgIDxkaXZcbiAgICAgICAgICBjbGFzc05hbWU9e2NsYXNzbmFtZXMoXG4gICAgICAgICAgICByZWZzLmN1cnJlbnQuc3R5bGVzLm1vbnRocyxcbiAgICAgICAgICAgIGlzVmVydGljYWwgPyByZWZzLmN1cnJlbnQuc3R5bGVzLm1vbnRoc1ZlcnRpY2FsIDogcmVmcy5jdXJyZW50LnN0eWxlcy5tb250aHNIb3Jpem9udGFsXG4gICAgICAgICAgKX0+XG4gICAgICAgICAge25ldyBBcnJheShtb250aHMpLmZpbGwobnVsbCkubWFwKChfLCBpKSA9PiB7XG4gICAgICAgICAgICBsZXQgbW9udGhTdGVwID0gYWRkTW9udGhzKHN0YXRlLmZvY3VzZWREYXRlLCBpKTs7XG4gICAgICAgICAgICBpZiAoY2FsZW5kYXJGb2N1cyA9PT0gJ2JhY2t3YXJkcycpIHtcbiAgICAgICAgICAgICAgbW9udGhTdGVwID0gc3ViTW9udGhzKHN0YXRlLmZvY3VzZWREYXRlLCBtb250aHMgLSAxIC0gaSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gKFxuICAgICAgICAgICAgICA8TW9udGhcbiAgICAgICAgICAgICAgICBkYXlDb250ZW50UmVuZGVyZXI9e2RheUNvbnRlbnRSZW5kZXJlcn1cbiAgICAgICAgICAgICAgICBmaXhlZEhlaWdodD17Zml4ZWRIZWlnaHR9XG4gICAgICAgICAgICAgICAgd2Vla2RheURpc3BsYXlGb3JtYXQ9e3dlZWtkYXlEaXNwbGF5Rm9ybWF0fVxuICAgICAgICAgICAgICAgIGRheURpc3BsYXlGb3JtYXQ9e2RheURpc3BsYXlGb3JtYXR9XG4gICAgICAgICAgICAgICAgbW9udGhEaXNwbGF5Rm9ybWF0PXttb250aERpc3BsYXlGb3JtYXR9XG4gICAgICAgICAgICAgICAgc3R5bGU9e3t9fVxuICAgICAgICAgICAgICAgIHNob3dQcmV2aWV3PXtzaG93UHJldmlld31cbiAgICAgICAgICAgICAgICBkaXNwbGF5TW9kZT17ZGlzcGxheU1vZGV9XG4gICAgICAgICAgICAgICAgb25QcmV2aWV3Q2hhbmdlPXtvblByZXZpZXdDaGFuZ2UgfHwgdXBkYXRlUHJldmlld31cbiAgICAgICAgICAgICAgICBwcmV2aWV3PXtwcmV2aWV3IHx8IHN0YXRlLnByZXZpZXd9XG4gICAgICAgICAgICAgICAgcmFuZ2VzPXtyYW5nZXNJbnRlcm5hbH1cbiAgICAgICAgICAgICAgICBrZXk9e2l9XG4gICAgICAgICAgICAgICAgZHJhZz17c3RhdGUuZHJhZ31cbiAgICAgICAgICAgICAgICBmb2N1c2VkUmFuZ2U9e2ZvY3VzZWRSYW5nZX1cbiAgICAgICAgICAgICAgICBkYXRlT3B0aW9ucz17cmVmcy5jdXJyZW50LmRhdGVPcHRpb25zIGFzIEZvcm1hdE9wdGlvbnN9XG4gICAgICAgICAgICAgICAgZGlzYWJsZWREYXRlcz17ZGlzYWJsZWREYXRlc31cbiAgICAgICAgICAgICAgICBkaXNhYmxlZERheT17ZGlzYWJsZWREYXl9XG4gICAgICAgICAgICAgICAgbW9udGg9e21vbnRoU3RlcH1cbiAgICAgICAgICAgICAgICBvbkRyYWdTZWxlY3Rpb25TdGFydD17b25EcmFnU2VsZWN0aW9uU3RhcnR9XG4gICAgICAgICAgICAgICAgb25EcmFnU2VsZWN0aW9uRW5kPXtvbkRyYWdTZWxlY3Rpb25FbmR9XG4gICAgICAgICAgICAgICAgb25EcmFnU2VsZWN0aW9uTW92ZT17b25EcmFnU2VsZWN0aW9uTW92ZX1cbiAgICAgICAgICAgICAgICBvbk1vdXNlTGVhdmU9eygpID0+IG9uUHJldmlld0NoYW5nZT8uKCl9XG4gICAgICAgICAgICAgICAgc3R5bGVzPXtyZWZzLmN1cnJlbnQuc3R5bGVzIGFzIFN0eWxlc1R5cGV9XG4gICAgICAgICAgICAgICAgc2hvd1dlZWtEYXlzPXshaXNWZXJ0aWNhbCB8fCBpID09PSAwfVxuICAgICAgICAgICAgICAgIHNob3dNb250aE5hbWU9eyFpc1ZlcnRpY2FsIHx8IGkgPiAwfVxuICAgICAgICAgICAgICAgIGNvbG9yPXtjb2xvcn1cbiAgICAgICAgICAgICAgICBtYXhEYXRlPXttYXhEYXRlfVxuICAgICAgICAgICAgICAgIG1pbkRhdGU9e21pbkRhdGV9XG4gICAgICAgICAgICAgICAgZGF0ZT17ZGF0ZX1cbiAgICAgICAgICAgICAgLz5cbiAgICAgICAgICAgICk7XG4gICAgICAgICAgfSl9XG4gICAgICAgIDwvZGl2PlxuICAgICAgKX1cbiAgICA8L2Rpdj5cbiAgKTtcbn1cblxudHlwZSBNb250aEFuZFllYXJQcm9wcyA9IHtcbiAgc3R5bGVzOiBTdHlsZXNUeXBlLFxuICBzaG93TW9udGhBcnJvdzogYm9vbGVhbixcbiAgbWluRGF0ZTogRGF0ZSxcbiAgbWF4RGF0ZTogRGF0ZSxcbiAgYXJpYUxhYmVsczogQXJpYXNMYWJlbHNUeXBlLFxuICBmb2N1c2VkRGF0ZTogRGF0ZSxcbiAgc2hvd01vbnRoQW5kWWVhclBpY2tlcnM6IGJvb2xlYW4sXG4gIG1vbnRoTmFtZXM6IHN0cmluZ1tdLFxuICBjaGFuZ2VTaG93bkRhdGU6ICh2YWx1ZTogbnVtYmVyLCBtb2RlOiBcInNldFwiIHwgXCJtb250aE9mZnNldFwiIHwgXCJzZXRNb250aFwiIHwgXCJzZXRZZWFyXCIpID0+IHZvaWRcbn07XG5cbmZ1bmN0aW9uIE1vbnRoQW5kWWVhcih7XG4gIHN0eWxlcyxcbiAgc2hvd01vbnRoQXJyb3csXG4gIG1pbkRhdGUsXG4gIG1heERhdGUsXG4gIGFyaWFMYWJlbHMsXG4gIGZvY3VzZWREYXRlLFxuICBzaG93TW9udGhBbmRZZWFyUGlja2VycyxcbiAgY2hhbmdlU2hvd25EYXRlLFxuICBtb250aE5hbWVzXG59OiBNb250aEFuZFllYXJQcm9wcykge1xuXG4gIGNvbnN0IHVwcGVyWWVhckxpbWl0ID0gbWF4RGF0ZS5nZXRGdWxsWWVhcigpO1xuICBjb25zdCBsb3dlclllYXJMaW1pdCA9IG1pbkRhdGUuZ2V0RnVsbFllYXIoKTtcblxuICByZXR1cm4gKFxuICAgIDxkaXYgb25Nb3VzZVVwPXtlID0+IGUuc3RvcFByb3BhZ2F0aW9uKCl9IGNsYXNzTmFtZT17c3R5bGVzLm1vbnRoQW5kWWVhcldyYXBwZXJ9PlxuICAgICAge3Nob3dNb250aEFycm93ID8gKFxuICAgICAgICA8YnV0dG9uXG4gICAgICAgICAgdHlwZT1cImJ1dHRvblwiXG4gICAgICAgICAgY2xhc3NOYW1lPXtjbGFzc25hbWVzKHN0eWxlcy5uZXh0UHJldkJ1dHRvbiwgc3R5bGVzLnByZXZCdXR0b24pfVxuICAgICAgICAgIG9uQ2xpY2s9eygpID0+IGNoYW5nZVNob3duRGF0ZSgtMSwgJ21vbnRoT2Zmc2V0Jyl9XG4gICAgICAgICAgYXJpYS1sYWJlbD17YXJpYUxhYmVscy5wcmV2QnV0dG9ufT5cbiAgICAgICAgICA8aSAvPlxuICAgICAgICA8L2J1dHRvbj5cbiAgICAgICkgOiBudWxsfVxuICAgICAge3Nob3dNb250aEFuZFllYXJQaWNrZXJzID8gKFxuICAgICAgICA8c3BhbiBjbGFzc05hbWU9e3N0eWxlcy5tb250aEFuZFllYXJQaWNrZXJzfT5cbiAgICAgICAgICA8c3BhbiBjbGFzc05hbWU9e3N0eWxlcy5tb250aFBpY2tlcn0+XG4gICAgICAgICAgICA8c2VsZWN0XG4gICAgICAgICAgICAgIHZhbHVlPXtmb2N1c2VkRGF0ZS5nZXRNb250aCgpfVxuICAgICAgICAgICAgICBvbkNoYW5nZT17ZSA9PiBjaGFuZ2VTaG93bkRhdGUoTnVtYmVyKGUudGFyZ2V0LnZhbHVlKSwgJ3NldE1vbnRoJyl9XG4gICAgICAgICAgICAgIGFyaWEtbGFiZWw9e2FyaWFMYWJlbHMubW9udGhQaWNrZXJ9PlxuICAgICAgICAgICAgICB7bW9udGhOYW1lcy5tYXAoKG1vbnRoTmFtZTogc3RyaW5nLCBpOiBudW1iZXIpID0+IChcbiAgICAgICAgICAgICAgICA8b3B0aW9uIGtleT17aX0gdmFsdWU9e2l9PlxuICAgICAgICAgICAgICAgICAge21vbnRoTmFtZX1cbiAgICAgICAgICAgICAgICA8L29wdGlvbj5cbiAgICAgICAgICAgICAgKSl9XG4gICAgICAgICAgICA8L3NlbGVjdD5cbiAgICAgICAgICA8L3NwYW4+XG4gICAgICAgICAgPHNwYW4gY2xhc3NOYW1lPXtzdHlsZXMubW9udGhBbmRZZWFyRGl2aWRlcn0gLz5cbiAgICAgICAgICA8c3BhbiBjbGFzc05hbWU9e3N0eWxlcy55ZWFyUGlja2VyfT5cbiAgICAgICAgICAgIDxzZWxlY3RcbiAgICAgICAgICAgICAgdmFsdWU9e2ZvY3VzZWREYXRlLmdldEZ1bGxZZWFyKCl9XG4gICAgICAgICAgICAgIG9uQ2hhbmdlPXtlID0+IGNoYW5nZVNob3duRGF0ZShOdW1iZXIoZS50YXJnZXQudmFsdWUpLCAnc2V0WWVhcicpfVxuICAgICAgICAgICAgICBhcmlhLWxhYmVsPXthcmlhTGFiZWxzLnllYXJQaWNrZXJ9PlxuICAgICAgICAgICAgICB7bmV3IEFycmF5KHVwcGVyWWVhckxpbWl0IC0gbG93ZXJZZWFyTGltaXQgKyAxKVxuICAgICAgICAgICAgICAgIC5maWxsKHVwcGVyWWVhckxpbWl0KVxuICAgICAgICAgICAgICAgIC5tYXAoKHZhbCwgaSkgPT4ge1xuICAgICAgICAgICAgICAgICAgY29uc3QgeWVhciA9IHZhbCAtIGk7XG4gICAgICAgICAgICAgICAgICByZXR1cm4gKFxuICAgICAgICAgICAgICAgICAgICA8b3B0aW9uIGtleT17eWVhcn0gdmFsdWU9e3llYXJ9PlxuICAgICAgICAgICAgICAgICAgICAgIHt5ZWFyfVxuICAgICAgICAgICAgICAgICAgICA8L29wdGlvbj5cbiAgICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICAgICAgfSl9XG4gICAgICAgICAgICA8L3NlbGVjdD5cbiAgICAgICAgICA8L3NwYW4+XG4gICAgICAgIDwvc3Bhbj5cbiAgICAgICkgOiAoXG4gICAgICAgIDxzcGFuIGNsYXNzTmFtZT17c3R5bGVzLm1vbnRoQW5kWWVhclBpY2tlcnN9PlxuICAgICAgICAgIHttb250aE5hbWVzW2ZvY3VzZWREYXRlLmdldE1vbnRoKCldfSB7Zm9jdXNlZERhdGUuZ2V0RnVsbFllYXIoKX1cbiAgICAgICAgPC9zcGFuPlxuICAgICAgKX1cbiAgICAgIHtzaG93TW9udGhBcnJvdyA/IChcbiAgICAgICAgPGJ1dHRvblxuICAgICAgICAgIHR5cGU9XCJidXR0b25cIlxuICAgICAgICAgIGNsYXNzTmFtZT17Y2xhc3NuYW1lcyhzdHlsZXMubmV4dFByZXZCdXR0b24sIHN0eWxlcy5uZXh0QnV0dG9uKX1cbiAgICAgICAgICBvbkNsaWNrPXsoKSA9PiBjaGFuZ2VTaG93bkRhdGUoKzEsICdtb250aE9mZnNldCcpfVxuICAgICAgICAgIGFyaWEtbGFiZWw9e2FyaWFMYWJlbHMubmV4dEJ1dHRvbn0+XG4gICAgICAgICAgPGkgLz5cbiAgICAgICAgPC9idXR0b24+XG4gICAgICApIDogbnVsbH1cbiAgICA8L2Rpdj5cbiAgKVxufVxuXG50eXBlIFdlZWtkYXlzUHJvcHMgPSB7XG4gIHN0eWxlczogUGFydGlhbDxTdHlsZXNUeXBlPixcbiAgZGF0ZU9wdGlvbnM6IHtcbiAgICBsb2NhbGU6IExvY2FsZSxcbiAgICB3ZWVrU3RhcnRzT24/OiBudW1iZXJcbiAgfSxcbiAgd2Vla2RheURpc3BsYXlGb3JtYXQ6IHN0cmluZ1xufTtcblxuZnVuY3Rpb24gV2Vla2RheXMoe1xuICBzdHlsZXMsXG4gIGRhdGVPcHRpb25zLFxuICB3ZWVrZGF5RGlzcGxheUZvcm1hdFxufTogV2Vla2RheXNQcm9wcykge1xuICBjb25zdCBub3cgPSBuZXcgRGF0ZSgpO1xuXG4gIHJldHVybiAoXG4gICAgPGRpdiBjbGFzc05hbWU9e3N0eWxlcy53ZWVrRGF5c30+XG4gICAgICB7ZWFjaERheU9mSW50ZXJ2YWwoe1xuICAgICAgICBzdGFydDogc3RhcnRPZldlZWsobm93LCBkYXRlT3B0aW9ucyBhcyBXZWVrT3B0aW9ucyksXG4gICAgICAgIGVuZDogZW5kT2ZXZWVrKG5vdywgZGF0ZU9wdGlvbnMgYXMgV2Vla09wdGlvbnMpLFxuICAgICAgfSkubWFwKChkYXksIGkpID0+IChcbiAgICAgICAgPHNwYW4gY2xhc3NOYW1lPXtzdHlsZXMud2Vla0RheX0ga2V5PXtpfT5cbiAgICAgICAgICB7Zm9ybWF0KGRheSwgd2Vla2RheURpc3BsYXlGb3JtYXQsIGRhdGVPcHRpb25zIGFzIFdlZWtPcHRpb25zKX1cbiAgICAgICAgPC9zcGFuPlxuICAgICAgKSl9XG4gICAgPC9kaXY+XG4gICk7XG59XG5cbnR5cGUgRGF0ZURpc3BsYXlQcm9wcyA9IHtcbiAgZm9jdXNlZFJhbmdlOiBudW1iZXJbXSxcbiAgY29sb3I6IHN0cmluZyxcbiAgcmFuZ2VzOiBEYXRlUmFuZ2VbXSxcbiAgcmFuZ2VDb2xvcnM6IHN0cmluZ1tdLFxuICBkYXRlT3B0aW9uczogUGFyc2VPcHRpb25zLFxuICBkYXRlRGlzcGxheUZvcm1hdDogc3RyaW5nLFxuICBlZGl0YWJsZURhdGVJbnB1dHM6IGJvb2xlYW4sXG4gIHN0YXJ0RGF0ZVBsYWNlaG9sZGVyOiBzdHJpbmcsXG4gIGVuZERhdGVQbGFjZWhvbGRlcjogc3RyaW5nLFxuICBhcmlhTGFiZWxzOiBBcmlhc0xhYmVsc1R5cGUsXG4gIHN0eWxlczogUGFydGlhbDxTdHlsZXNUeXBlPixcbiAgb25EcmFnU2VsZWN0aW9uRW5kOiAoZGF0ZTogRGF0ZSkgPT4gdm9pZCxcbiAgaGFuZGxlUmFuZ2VGb2N1c0NoYW5nZTogKHJhbmdlc0luZGV4OiBudW1iZXIsIHJhbmdlSXRlbUluZGV4OiBudW1iZXIpID0+IHZvaWRcbn07XG5cbmZ1bmN0aW9uIERhdGVEaXNwbGF5KHtcbiAgZm9jdXNlZFJhbmdlLFxuICBjb2xvcixcbiAgcmFuZ2VzLFxuICByYW5nZUNvbG9ycyxcbiAgZGF0ZURpc3BsYXlGb3JtYXQsXG4gIGVkaXRhYmxlRGF0ZUlucHV0cyxcbiAgc3RhcnREYXRlUGxhY2Vob2xkZXIsXG4gIGVuZERhdGVQbGFjZWhvbGRlcixcbiAgYXJpYUxhYmVscyxcbiAgc3R5bGVzLFxuICBkYXRlT3B0aW9ucyxcbiAgb25EcmFnU2VsZWN0aW9uRW5kLFxuICBoYW5kbGVSYW5nZUZvY3VzQ2hhbmdlXG59OiBEYXRlRGlzcGxheVByb3BzKSB7XG4gIGNvbnN0IGRlZmF1bHRDb2xvciA9IHJhbmdlQ29sb3JzW2ZvY3VzZWRSYW5nZVswXV0gfHwgY29sb3I7XG5cbiAgcmV0dXJuIChcbiAgICA8ZGl2IGNsYXNzTmFtZT17c3R5bGVzLmRhdGVEaXNwbGF5V3JhcHBlcn0+XG4gICAgICB7cmFuZ2VzLm1hcCgocmFuZ2UsIGkpID0+IHtcbiAgICAgICAgaWYgKHJhbmdlLnNob3dEYXRlRGlzcGxheSA9PT0gZmFsc2UgfHwgKHJhbmdlLmRpc2FibGVkICYmICFyYW5nZS5zaG93RGF0ZURpc3BsYXkpKVxuICAgICAgICAgIHJldHVybiBudWxsO1xuICAgICAgICByZXR1cm4gKFxuICAgICAgICAgIDxkaXZcbiAgICAgICAgICAgIGNsYXNzTmFtZT17c3R5bGVzLmRhdGVEaXNwbGF5fVxuICAgICAgICAgICAga2V5PXtpfVxuICAgICAgICAgICAgc3R5bGU9e3sgY29sb3I6IHJhbmdlLmNvbG9yIHx8IGRlZmF1bHRDb2xvciB9fT5cbiAgICAgICAgICAgIDxEYXRlSW5wdXRcbiAgICAgICAgICAgICAgY2xhc3NOYW1lPXtjbGFzc25hbWVzKHN0eWxlcy5kYXRlRGlzcGxheUl0ZW0sIHtcbiAgICAgICAgICAgICAgICBbc3R5bGVzLmRhdGVEaXNwbGF5SXRlbUFjdGl2ZV06IGZvY3VzZWRSYW5nZVswXSA9PT0gaSAmJiBmb2N1c2VkUmFuZ2VbMV0gPT09IDAsXG4gICAgICAgICAgICAgIH0pfVxuICAgICAgICAgICAgICByZWFkT25seT17IWVkaXRhYmxlRGF0ZUlucHV0c31cbiAgICAgICAgICAgICAgZGlzYWJsZWQ9e3JhbmdlLmRpc2FibGVkfVxuICAgICAgICAgICAgICB2YWx1ZT17cmFuZ2Uuc3RhcnREYXRlfVxuICAgICAgICAgICAgICBwbGFjZWhvbGRlcj17c3RhcnREYXRlUGxhY2Vob2xkZXJ9XG4gICAgICAgICAgICAgIGRhdGVPcHRpb25zPXtkYXRlT3B0aW9uc31cbiAgICAgICAgICAgICAgZGF0ZURpc3BsYXlGb3JtYXQ9e2RhdGVEaXNwbGF5Rm9ybWF0fVxuICAgICAgICAgICAgICBhcmlhTGFiZWw9e1xuICAgICAgICAgICAgICAgIGFyaWFMYWJlbHMuZGF0ZUlucHV0ICYmXG4gICAgICAgICAgICAgICAgYXJpYUxhYmVscy5kYXRlSW5wdXRbcmFuZ2Uua2V5XSAmJlxuICAgICAgICAgICAgICAgIGFyaWFMYWJlbHMuZGF0ZUlucHV0W3JhbmdlLmtleV0uc3RhcnREYXRlXG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgb25DaGFuZ2U9e29uRHJhZ1NlbGVjdGlvbkVuZH1cbiAgICAgICAgICAgICAgb25Gb2N1cz17KCkgPT4gaGFuZGxlUmFuZ2VGb2N1c0NoYW5nZShpLCAwKX1cbiAgICAgICAgICAgIC8+XG4gICAgICAgICAgICA8RGF0ZUlucHV0XG4gICAgICAgICAgICAgIGNsYXNzTmFtZT17Y2xhc3NuYW1lcyhzdHlsZXMuZGF0ZURpc3BsYXlJdGVtLCB7XG4gICAgICAgICAgICAgICAgW3N0eWxlcy5kYXRlRGlzcGxheUl0ZW1BY3RpdmVdOiBmb2N1c2VkUmFuZ2VbMF0gPT09IGkgJiYgZm9jdXNlZFJhbmdlWzFdID09PSAxLFxuICAgICAgICAgICAgICB9KX1cbiAgICAgICAgICAgICAgcmVhZE9ubHk9eyFlZGl0YWJsZURhdGVJbnB1dHN9XG4gICAgICAgICAgICAgIGRpc2FibGVkPXtyYW5nZS5kaXNhYmxlZH1cbiAgICAgICAgICAgICAgdmFsdWU9e3JhbmdlLmVuZERhdGV9XG4gICAgICAgICAgICAgIHBsYWNlaG9sZGVyPXtlbmREYXRlUGxhY2Vob2xkZXJ9XG4gICAgICAgICAgICAgIGRhdGVPcHRpb25zPXtkYXRlT3B0aW9uc31cbiAgICAgICAgICAgICAgZGF0ZURpc3BsYXlGb3JtYXQ9e2RhdGVEaXNwbGF5Rm9ybWF0fVxuICAgICAgICAgICAgICBhcmlhTGFiZWw9e1xuICAgICAgICAgICAgICAgIGFyaWFMYWJlbHMuZGF0ZUlucHV0ICYmXG4gICAgICAgICAgICAgICAgYXJpYUxhYmVscy5kYXRlSW5wdXRbcmFuZ2Uua2V5XSAmJlxuICAgICAgICAgICAgICAgIGFyaWFMYWJlbHMuZGF0ZUlucHV0W3JhbmdlLmtleV0uZW5kRGF0ZVxuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIG9uQ2hhbmdlPXtvbkRyYWdTZWxlY3Rpb25FbmR9XG4gICAgICAgICAgICAgIG9uRm9jdXM9eygpID0+IGhhbmRsZVJhbmdlRm9jdXNDaGFuZ2UoaSwgMSl9XG4gICAgICAgICAgICAvPlxuICAgICAgICAgIDwvZGl2PlxuICAgICAgICApO1xuICAgICAgfSl9XG4gICAgPC9kaXY+XG4gICk7XG59XG5cbmZ1bmN0aW9uIGdldE1vbnRoTmFtZXMobG9jYWxlOiBMb2NhbGUpIHtcbiAgcmV0dXJuIFsuLi5BcnJheSgxMikua2V5cygpXS5tYXAoaSA9PiBsb2NhbGUubG9jYWxpemUubW9udGgoaSBhcyBGTlNNb250aCkpO1xufVxuXG5mdW5jdGlvbiBjYWxjU2Nyb2xsQXJlYShkaXJlY3Rpb246ICd2ZXJ0aWNhbCcgfCAnaG9yaXpvbnRhbCcsIG1vbnRoczogbnVtYmVyLCBzY3JvbGw6IENhbGVuZGFyUHJvcHNbXCJzY3JvbGxcIl0pIHtcbiAgaWYgKCFzY3JvbGwuZW5hYmxlZCkgcmV0dXJuIHsgZW5hYmxlZDogZmFsc2UgfTtcblxuICBjb25zdCBsb25nTW9udGhIZWlnaHQgPSBzY3JvbGwubG9uZ01vbnRoSGVpZ2h0IHx8IHNjcm9sbC5tb250aEhlaWdodDtcblxuICBpZiAoZGlyZWN0aW9uID09PSAndmVydGljYWwnKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgIGVuYWJsZWQ6IHRydWUsXG4gICAgICBtb250aEhlaWdodDogc2Nyb2xsLm1vbnRoSGVpZ2h0IHx8IDIyMCxcbiAgICAgIGxvbmdNb250aEhlaWdodDogbG9uZ01vbnRoSGVpZ2h0IHx8IDI2MCxcbiAgICAgIGNhbGVuZGFyV2lkdGg6ICdhdXRvJyxcbiAgICAgIGNhbGVuZGFySGVpZ2h0OiAoc2Nyb2xsLmNhbGVuZGFySGVpZ2h0IHx8IGxvbmdNb250aEhlaWdodCB8fCAyNDApICogbW9udGhzLFxuICAgIH07XG4gIH1cbiAgcmV0dXJuIHtcbiAgICBlbmFibGVkOiB0cnVlLFxuICAgIG1vbnRoV2lkdGg6IHNjcm9sbC5tb250aFdpZHRoIHx8IDMzMixcbiAgICBjYWxlbmRhcldpZHRoOiAoc2Nyb2xsLmNhbGVuZGFyV2lkdGggfHwgc2Nyb2xsLm1vbnRoV2lkdGggfHwgMzMyKSAqIG1vbnRocyxcbiAgICBtb250aEhlaWdodDogbG9uZ01vbnRoSGVpZ2h0IHx8IDMwMCxcbiAgICBjYWxlbmRhckhlaWdodDogbG9uZ01vbnRoSGVpZ2h0IHx8IDMwMCxcbiAgfTtcbn0iXSwibWFwcGluZ3MiOiI7Ozs7OztBQUFBLElBQUFBLE1BQUEsR0FBQUMsc0JBQUEsQ0FBQUMsT0FBQTtBQUdBLElBQUFDLFFBQUEsR0FBQUQsT0FBQTtBQUVBLElBQUFFLEtBQUEsR0FBQUYsT0FBQTtBQUNBLElBQUFHLE1BQUEsR0FBQUgsT0FBQTtBQUNBLElBQUFJLE9BQUEsR0FBQUwsc0JBQUEsQ0FBQUMsT0FBQTtBQUNBLElBQUFLLFVBQUEsR0FBQU4sc0JBQUEsQ0FBQUMsT0FBQTtBQUNBLElBQUFNLFdBQUEsR0FBQVAsc0JBQUEsQ0FBQUMsT0FBQTtBQUNBLElBQUFPLFVBQUEsR0FBQVIsc0JBQUEsQ0FBQUMsT0FBQTtBQUNBLElBQUFRLE1BQUEsR0FBQVQsc0JBQUEsQ0FBQUMsT0FBQTtBQUE2QixTQUFBRCx1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