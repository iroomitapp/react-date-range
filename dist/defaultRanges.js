"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.createStaticRanges = createStaticRanges;
exports.defaultStaticRanges = exports.defaultInputRanges = void 0;
var _dateFns = require("date-fns");
const defineds = {
  startOfWeek: (0, _dateFns.startOfWeek)(new Date()),
  endOfWeek: (0, _dateFns.endOfWeek)(new Date()),
  startOfLastWeek: (0, _dateFns.startOfWeek)((0, _dateFns.addDays)(new Date(), -7)),
  endOfLastWeek: (0, _dateFns.endOfWeek)((0, _dateFns.addDays)(new Date(), -7)),
  startOfToday: (0, _dateFns.startOfDay)(new Date()),
  endOfToday: (0, _dateFns.endOfDay)(new Date()),
  startOfYesterday: (0, _dateFns.startOfDay)((0, _dateFns.addDays)(new Date(), -1)),
  endOfYesterday: (0, _dateFns.endOfDay)((0, _dateFns.addDays)(new Date(), -1)),
  startOfMonth: (0, _dateFns.startOfMonth)(new Date()),
  endOfMonth: (0, _dateFns.endOfMonth)(new Date()),
  startOfLastMonth: (0, _dateFns.startOfMonth)((0, _dateFns.addMonths)(new Date(), -1)),
  endOfLastMonth: (0, _dateFns.endOfMonth)((0, _dateFns.addMonths)(new Date(), -1))
};
const staticRangeHandler = {
  range: {},
  isSelected(range) {
    const definedRange = this.range();
    return (0, _dateFns.isSameDay)(range.startDate, definedRange.startDate) && (0, _dateFns.isSameDay)(range.endDate, definedRange.endDate);
  }
};
function createStaticRanges(ranges) {
  return ranges.map(range => ({
    ...staticRangeHandler,
    ...range
  }));
}
const defaultStaticRanges = exports.defaultStaticRanges = createStaticRanges([{
  label: 'Today',
  range: () => ({
    startDate: defineds.startOfToday,
    endDate: defineds.endOfToday
  })
}, {
  label: 'Yesterday',
  range: () => ({
    startDate: defineds.startOfYesterday,
    endDate: defineds.endOfYesterday
  })
}, {
  label: 'This Week',
  range: () => ({
    startDate: defineds.startOfWeek,
    endDate: defineds.endOfWeek
  })
}, {
  label: 'Last Week',
  range: () => ({
    startDate: defineds.startOfLastWeek,
    endDate: defineds.endOfLastWeek
  })
}, {
  label: 'This Month',
  range: () => ({
    startDate: defineds.startOfMonth,
    endDate: defineds.endOfMonth
  })
}, {
  label: 'Last Month',
  range: () => ({
    startDate: defineds.startOfLastMonth,
    endDate: defineds.endOfLastMonth
  })
}]);
const defaultInputRanges = exports.defaultInputRanges = [{
  label: 'days up to today',
  range(value) {
    return {
      startDate: (0, _dateFns.addDays)(defineds.startOfToday, (Math.max(Number(value), 1) - 1) * -1),
      endDate: defineds.endOfToday
    };
  },
  getCurrentValue(range) {
    if (!(0, _dateFns.isSameDay)(range.endDate, defineds.endOfToday)) return '-';
    if (!range.startDate) return '∞';
    return (0, _dateFns.differenceInCalendarDays)(defineds.endOfToday, range.startDate) + 1;
  }
}, {
  label: 'days starting today',
  range(value) {
    const today = new Date();
    return {
      startDate: today,
      endDate: (0, _dateFns.addDays)(today, Math.max(Number(value), 1) - 1)
    };
  },
  getCurrentValue(range) {
    if (!(0, _dateFns.isSameDay)(range.startDate, defineds.startOfToday)) return '-';
    if (!range.endDate) return '∞';
    return (0, _dateFns.differenceInCalendarDays)(range.endDate, defineds.startOfToday) + 1;
  }
}];
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJfZGF0ZUZucyIsInJlcXVpcmUiLCJkZWZpbmVkcyIsInN0YXJ0T2ZXZWVrIiwiRGF0ZSIsImVuZE9mV2VlayIsInN0YXJ0T2ZMYXN0V2VlayIsImFkZERheXMiLCJlbmRPZkxhc3RXZWVrIiwic3RhcnRPZlRvZGF5Iiwic3RhcnRPZkRheSIsImVuZE9mVG9kYXkiLCJlbmRPZkRheSIsInN0YXJ0T2ZZZXN0ZXJkYXkiLCJlbmRPZlllc3RlcmRheSIsInN0YXJ0T2ZNb250aCIsImVuZE9mTW9udGgiLCJzdGFydE9mTGFzdE1vbnRoIiwiYWRkTW9udGhzIiwiZW5kT2ZMYXN0TW9udGgiLCJzdGF0aWNSYW5nZUhhbmRsZXIiLCJyYW5nZSIsImlzU2VsZWN0ZWQiLCJkZWZpbmVkUmFuZ2UiLCJpc1NhbWVEYXkiLCJzdGFydERhdGUiLCJlbmREYXRlIiwiY3JlYXRlU3RhdGljUmFuZ2VzIiwicmFuZ2VzIiwibWFwIiwiZGVmYXVsdFN0YXRpY1JhbmdlcyIsImV4cG9ydHMiLCJsYWJlbCIsImRlZmF1bHRJbnB1dFJhbmdlcyIsInZhbHVlIiwiTWF0aCIsIm1heCIsIk51bWJlciIsImdldEN1cnJlbnRWYWx1ZSIsImRpZmZlcmVuY2VJbkNhbGVuZGFyRGF5cyIsInRvZGF5Il0sInNvdXJjZXMiOlsiLi4vc3JjL2RlZmF1bHRSYW5nZXMudHMiXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtcbiAgYWRkRGF5cyxcbiAgZW5kT2ZEYXksXG4gIHN0YXJ0T2ZEYXksXG4gIHN0YXJ0T2ZNb250aCxcbiAgZW5kT2ZNb250aCxcbiAgYWRkTW9udGhzLFxuICBzdGFydE9mV2VlayxcbiAgZW5kT2ZXZWVrLFxuICBpc1NhbWVEYXksXG4gIGRpZmZlcmVuY2VJbkNhbGVuZGFyRGF5cyxcbn0gZnJvbSAnZGF0ZS1mbnMnO1xuXG5pbXBvcnQgeyBEYXRlUmFuZ2UgfSBmcm9tICcuL2NvbXBvbmVudHMvRGF5Q2VsbCc7XG5cbmNvbnN0IGRlZmluZWRzID0ge1xuICBzdGFydE9mV2Vlazogc3RhcnRPZldlZWsobmV3IERhdGUoKSksXG4gIGVuZE9mV2VlazogZW5kT2ZXZWVrKG5ldyBEYXRlKCkpLFxuICBzdGFydE9mTGFzdFdlZWs6IHN0YXJ0T2ZXZWVrKGFkZERheXMobmV3IERhdGUoKSwgLTcpKSxcbiAgZW5kT2ZMYXN0V2VlazogZW5kT2ZXZWVrKGFkZERheXMobmV3IERhdGUoKSwgLTcpKSxcbiAgc3RhcnRPZlRvZGF5OiBzdGFydE9mRGF5KG5ldyBEYXRlKCkpLFxuICBlbmRPZlRvZGF5OiBlbmRPZkRheShuZXcgRGF0ZSgpKSxcbiAgc3RhcnRPZlllc3RlcmRheTogc3RhcnRPZkRheShhZGREYXlzKG5ldyBEYXRlKCksIC0xKSksXG4gIGVuZE9mWWVzdGVyZGF5OiBlbmRPZkRheShhZGREYXlzKG5ldyBEYXRlKCksIC0xKSksXG4gIHN0YXJ0T2ZNb250aDogc3RhcnRPZk1vbnRoKG5ldyBEYXRlKCkpLFxuICBlbmRPZk1vbnRoOiBlbmRPZk1vbnRoKG5ldyBEYXRlKCkpLFxuICBzdGFydE9mTGFzdE1vbnRoOiBzdGFydE9mTW9udGgoYWRkTW9udGhzKG5ldyBEYXRlKCksIC0xKSksXG4gIGVuZE9mTGFzdE1vbnRoOiBlbmRPZk1vbnRoKGFkZE1vbnRocyhuZXcgRGF0ZSgpLCAtMSkpLFxufTtcblxuY29uc3Qgc3RhdGljUmFuZ2VIYW5kbGVyID0ge1xuICByYW5nZToge30sXG4gIGlzU2VsZWN0ZWQocmFuZ2U6IERhdGVSYW5nZSkge1xuICAgIGNvbnN0IGRlZmluZWRSYW5nZSA9IHRoaXMucmFuZ2UoKTtcbiAgICByZXR1cm4gKFxuICAgICAgaXNTYW1lRGF5KHJhbmdlLnN0YXJ0RGF0ZSwgZGVmaW5lZFJhbmdlLnN0YXJ0RGF0ZSkgJiZcbiAgICAgIGlzU2FtZURheShyYW5nZS5lbmREYXRlLCBkZWZpbmVkUmFuZ2UuZW5kRGF0ZSlcbiAgICApO1xuICB9LFxufTtcblxuZXhwb3J0IGZ1bmN0aW9uIGNyZWF0ZVN0YXRpY1JhbmdlcyhyYW5nZXM6IHtsYWJlbDogc3RyaW5nLCByYW5nZTogKCkgPT4gRGF0ZVJhbmdlfVtdKSB7XG4gIHJldHVybiByYW5nZXMubWFwKHJhbmdlID0+ICh7IC4uLnN0YXRpY1JhbmdlSGFuZGxlciwgLi4ucmFuZ2UgfSkpO1xufVxuXG5leHBvcnQgY29uc3QgZGVmYXVsdFN0YXRpY1JhbmdlcyA9IGNyZWF0ZVN0YXRpY1JhbmdlcyhbXG4gIHtcbiAgICBsYWJlbDogJ1RvZGF5JyxcbiAgICByYW5nZTogKCkgPT4gKHtcbiAgICAgIHN0YXJ0RGF0ZTogZGVmaW5lZHMuc3RhcnRPZlRvZGF5LFxuICAgICAgZW5kRGF0ZTogZGVmaW5lZHMuZW5kT2ZUb2RheSxcbiAgICB9KSxcbiAgfSxcbiAge1xuICAgIGxhYmVsOiAnWWVzdGVyZGF5JyxcbiAgICByYW5nZTogKCkgPT4gKHtcbiAgICAgIHN0YXJ0RGF0ZTogZGVmaW5lZHMuc3RhcnRPZlllc3RlcmRheSxcbiAgICAgIGVuZERhdGU6IGRlZmluZWRzLmVuZE9mWWVzdGVyZGF5LFxuICAgIH0pLFxuICB9LFxuXG4gIHtcbiAgICBsYWJlbDogJ1RoaXMgV2VlaycsXG4gICAgcmFuZ2U6ICgpID0+ICh7XG4gICAgICBzdGFydERhdGU6IGRlZmluZWRzLnN0YXJ0T2ZXZWVrLFxuICAgICAgZW5kRGF0ZTogZGVmaW5lZHMuZW5kT2ZXZWVrLFxuICAgIH0pLFxuICB9LFxuICB7XG4gICAgbGFiZWw6ICdMYXN0IFdlZWsnLFxuICAgIHJhbmdlOiAoKSA9PiAoe1xuICAgICAgc3RhcnREYXRlOiBkZWZpbmVkcy5zdGFydE9mTGFzdFdlZWssXG4gICAgICBlbmREYXRlOiBkZWZpbmVkcy5lbmRPZkxhc3RXZWVrLFxuICAgIH0pLFxuICB9LFxuICB7XG4gICAgbGFiZWw6ICdUaGlzIE1vbnRoJyxcbiAgICByYW5nZTogKCkgPT4gKHtcbiAgICAgIHN0YXJ0RGF0ZTogZGVmaW5lZHMuc3RhcnRPZk1vbnRoLFxuICAgICAgZW5kRGF0ZTogZGVmaW5lZHMuZW5kT2ZNb250aCxcbiAgICB9KSxcbiAgfSxcbiAge1xuICAgIGxhYmVsOiAnTGFzdCBNb250aCcsXG4gICAgcmFuZ2U6ICgpID0+ICh7XG4gICAgICBzdGFydERhdGU6IGRlZmluZWRzLnN0YXJ0T2ZMYXN0TW9udGgsXG4gICAgICBlbmREYXRlOiBkZWZpbmVkcy5lbmRPZkxhc3RNb250aCxcbiAgICB9KSxcbiAgfSxcbl0pO1xuXG5leHBvcnQgY29uc3QgZGVmYXVsdElucHV0UmFuZ2VzID0gW1xuICB7XG4gICAgbGFiZWw6ICdkYXlzIHVwIHRvIHRvZGF5JyxcbiAgICByYW5nZSh2YWx1ZTogbnVtYmVyKSB7XG4gICAgICByZXR1cm4ge1xuICAgICAgICBzdGFydERhdGU6IGFkZERheXMoZGVmaW5lZHMuc3RhcnRPZlRvZGF5LCAoTWF0aC5tYXgoTnVtYmVyKHZhbHVlKSwgMSkgLSAxKSAqIC0xKSxcbiAgICAgICAgZW5kRGF0ZTogZGVmaW5lZHMuZW5kT2ZUb2RheSxcbiAgICAgIH07XG4gICAgfSxcbiAgICBnZXRDdXJyZW50VmFsdWUocmFuZ2U6IERhdGVSYW5nZSkge1xuICAgICAgaWYgKCFpc1NhbWVEYXkocmFuZ2UuZW5kRGF0ZSwgZGVmaW5lZHMuZW5kT2ZUb2RheSkpIHJldHVybiAnLSc7XG4gICAgICBpZiAoIXJhbmdlLnN0YXJ0RGF0ZSkgcmV0dXJuICfiiJ4nO1xuICAgICAgcmV0dXJuIGRpZmZlcmVuY2VJbkNhbGVuZGFyRGF5cyhkZWZpbmVkcy5lbmRPZlRvZGF5LCByYW5nZS5zdGFydERhdGUpICsgMTtcbiAgICB9LFxuICB9LFxuICB7XG4gICAgbGFiZWw6ICdkYXlzIHN0YXJ0aW5nIHRvZGF5JyxcbiAgICByYW5nZSh2YWx1ZTogbnVtYmVyKSB7XG4gICAgICBjb25zdCB0b2RheSA9IG5ldyBEYXRlKCk7XG4gICAgICByZXR1cm4ge1xuICAgICAgICBzdGFydERhdGU6IHRvZGF5LFxuICAgICAgICBlbmREYXRlOiBhZGREYXlzKHRvZGF5LCBNYXRoLm1heChOdW1iZXIodmFsdWUpLCAxKSAtIDEpLFxuICAgICAgfTtcbiAgICB9LFxuICAgIGdldEN1cnJlbnRWYWx1ZShyYW5nZTogRGF0ZVJhbmdlKSB7XG4gICAgICBpZiAoIWlzU2FtZURheShyYW5nZS5zdGFydERhdGUsIGRlZmluZWRzLnN0YXJ0T2ZUb2RheSkpIHJldHVybiAnLSc7XG4gICAgICBpZiAoIXJhbmdlLmVuZERhdGUpIHJldHVybiAn4oieJztcbiAgICAgIHJldHVybiBkaWZmZXJlbmNlSW5DYWxlbmRhckRheXMocmFuZ2UuZW5kRGF0ZSwgZGVmaW5lZHMuc3RhcnRPZlRvZGF5KSArIDE7XG4gICAgfSxcbiAgfSxcbl07XG4iXSwibWFwcGluZ3MiOiI7Ozs7Ozs7QUFBQSxJQUFBQSxRQUFBLEdBQUFDLE9BQUE7QUFlQSxNQUFNQyxRQUFRLEdBQUc7RUFDZkMsV0FBVyxFQUFFLElBQUFBLG9CQUFXLEVBQUMsSUFBSUMsSUFBSSxDQUFDLENBQUMsQ0FBQztFQUNwQ0MsU0FBUyxFQUFFLElBQUFBLGtCQUFTLEVBQUMsSUFBSUQsSUFBSSxDQUFDLENBQUMsQ0FBQztFQUNoQ0UsZUFBZSxFQUFFLElBQUFILG9CQUFXLEVBQUMsSUFBQUksZ0JBQU8sRUFBQyxJQUFJSCxJQUFJLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUM7RUFDckRJLGFBQWEsRUFBRSxJQUFBSCxrQkFBUyxFQUFDLElBQUFFLGdCQUFPLEVBQUMsSUFBSUgsSUFBSSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDO0VBQ2pESyxZQUFZLEVBQUUsSUFBQUMsbUJBQVUsRUFBQyxJQUFJTixJQUFJLENBQUMsQ0FBQyxDQUFDO0VBQ3BDTyxVQUFVLEVBQUUsSUFBQUMsaUJBQVEsRUFBQyxJQUFJUixJQUFJLENBQUMsQ0FBQyxDQUFDO0VBQ2hDUyxnQkFBZ0IsRUFBRSxJQUFBSCxtQkFBVSxFQUFDLElBQUFILGdCQUFPLEVBQUMsSUFBSUgsSUFBSSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDO0VBQ3JEVSxjQUFjLEVBQUUsSUFBQUYsaUJBQVEsRUFBQyxJQUFBTCxnQkFBTyxFQUFDLElBQUlILElBQUksQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQztFQUNqRFcsWUFBWSxFQUFFLElBQUFBLHFCQUFZLEVBQUMsSUFBSVgsSUFBSSxDQUFDLENBQUMsQ0FBQztFQUN0Q1ksVUFBVSxFQUFFLElBQUFBLG1CQUFVLEVBQUMsSUFBSVosSUFBSSxDQUFDLENBQUMsQ0FBQztFQUNsQ2EsZ0JBQWdCLEVBQUUsSUFBQUYscUJBQVksRUFBQyxJQUFBRyxrQkFBUyxFQUFDLElBQUlkLElBQUksQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQztFQUN6RGUsY0FBYyxFQUFFLElBQUFILG1CQUFVLEVBQUMsSUFBQUUsa0JBQVMsRUFBQyxJQUFJZCxJQUFJLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO0FBQ3RELENBQUM7QUFFRCxNQUFNZ0Isa0JBQWtCLEdBQUc7RUFDekJDLEtBQUssRUFBRSxDQUFDLENBQUM7RUFDVEMsVUFBVUEsQ0FBQ0QsS0FBZ0IsRUFBRTtJQUMzQixNQUFNRSxZQUFZLEdBQUcsSUFBSSxDQUFDRixLQUFLLENBQUMsQ0FBQztJQUNqQyxPQUNFLElBQUFHLGtCQUFTLEVBQUNILEtBQUssQ0FBQ0ksU0FBUyxFQUFFRixZQUFZLENBQUNFLFNBQVMsQ0FBQyxJQUNsRCxJQUFBRCxrQkFBUyxFQUFDSCxLQUFLLENBQUNLLE9BQU8sRUFBRUgsWUFBWSxDQUFDRyxPQUFPLENBQUM7RUFFbEQ7QUFDRixDQUFDO0FBRU0sU0FBU0Msa0JBQWtCQSxDQUFDQyxNQUFpRCxFQUFFO0VBQ3BGLE9BQU9BLE1BQU0sQ0FBQ0MsR0FBRyxDQUFDUixLQUFLLEtBQUs7SUFBRSxHQUFHRCxrQkFBa0I7SUFBRSxHQUFHQztFQUFNLENBQUMsQ0FBQyxDQUFDO0FBQ25FO0FBRU8sTUFBTVMsbUJBQW1CLEdBQUFDLE9BQUEsQ0FBQUQsbUJBQUEsR0FBR0gsa0JBQWtCLENBQUMsQ0FDcEQ7RUFDRUssS0FBSyxFQUFFLE9BQU87RUFDZFgsS0FBSyxFQUFFQSxDQUFBLE1BQU87SUFDWkksU0FBUyxFQUFFdkIsUUFBUSxDQUFDTyxZQUFZO0lBQ2hDaUIsT0FBTyxFQUFFeEIsUUFBUSxDQUFDUztFQUNwQixDQUFDO0FBQ0gsQ0FBQyxFQUNEO0VBQ0VxQixLQUFLLEVBQUUsV0FBVztFQUNsQlgsS0FBSyxFQUFFQSxDQUFBLE1BQU87SUFDWkksU0FBUyxFQUFFdkIsUUFBUSxDQUFDVyxnQkFBZ0I7SUFDcENhLE9BQU8sRUFBRXhCLFFBQVEsQ0FBQ1k7RUFDcEIsQ0FBQztBQUNILENBQUMsRUFFRDtFQUNFa0IsS0FBSyxFQUFFLFdBQVc7RUFDbEJYLEtBQUssRUFBRUEsQ0FBQSxNQUFPO0lBQ1pJLFNBQVMsRUFBRXZCLFFBQVEsQ0FBQ0MsV0FBVztJQUMvQnVCLE9BQU8sRUFBRXhCLFFBQVEsQ0FBQ0c7RUFDcEIsQ0FBQztBQUNILENBQUMsRUFDRDtFQUNFMkIsS0FBSyxFQUFFLFdBQVc7RUFDbEJYLEtBQUssRUFBRUEsQ0FBQSxNQUFPO0lBQ1pJLFNBQVMsRUFBRXZCLFFBQVEsQ0FBQ0ksZUFBZTtJQUNuQ29CLE9BQU8sRUFBRXhCLFFBQVEsQ0FBQ007RUFDcEIsQ0FBQztBQUNILENBQUMsRUFDRDtFQUNFd0IsS0FBSyxFQUFFLFlBQVk7RUFDbkJYLEtBQUssRUFBRUEsQ0FBQSxNQUFPO0lBQ1pJLFNBQVMsRUFBRXZCLFFBQVEsQ0FBQ2EsWUFBWTtJQUNoQ1csT0FBTyxFQUFFeEIsUUFBUSxDQUFDYztFQUNwQixDQUFDO0FBQ0gsQ0FBQyxFQUNEO0VBQ0VnQixLQUFLLEVBQUUsWUFBWTtFQUNuQlgsS0FBSyxFQUFFQSxDQUFBLE1BQU87SUFDWkksU0FBUyxFQUFFdkIsUUFBUSxDQUFDZSxnQkFBZ0I7SUFDcENTLE9BQU8sRUFBRXhCLFFBQVEsQ0FBQ2lCO0VBQ3BCLENBQUM7QUFDSCxDQUFDLENBQ0YsQ0FBQztBQUVLLE1BQU1jLGtCQUFrQixHQUFBRixPQUFBLENBQUFFLGtCQUFBLEdBQUcsQ0FDaEM7RUFDRUQsS0FBSyxFQUFFLGtCQUFrQjtFQUN6QlgsS0FBS0EsQ0FBQ2EsS0FBYSxFQUFFO0lBQ25CLE9BQU87TUFDTFQsU0FBUyxFQUFFLElBQUFsQixnQkFBTyxFQUFDTCxRQUFRLENBQUNPLFlBQVksRUFBRSxDQUFDMEIsSUFBSSxDQUFDQyxHQUFHLENBQUNDLE1BQU0sQ0FBQ0gsS0FBSyxDQUFDLEVBQUUsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDO01BQ2hGUixPQUFPLEVBQUV4QixRQUFRLENBQUNTO0lBQ3BCLENBQUM7RUFDSCxDQUFDO0VBQ0QyQixlQUFlQSxDQUFDakIsS0FBZ0IsRUFBRTtJQUNoQyxJQUFJLENBQUMsSUFBQUcsa0JBQVMsRUFBQ0gsS0FBSyxDQUFDSyxPQUFPLEVBQUV4QixRQUFRLENBQUNTLFVBQVUsQ0FBQyxFQUFFLE9BQU8sR0FBRztJQUM5RCxJQUFJLENBQUNVLEtBQUssQ0FBQ0ksU0FBUyxFQUFFLE9BQU8sR0FBRztJQUNoQyxPQUFPLElBQUFjLGlDQUF3QixFQUFDckMsUUFBUSxDQUFDUyxVQUFVLEVBQUVVLEtBQUssQ0FBQ0ksU0FBUyxDQUFDLEdBQUcsQ0FBQztFQUMzRTtBQUNGLENBQUMsRUFDRDtFQUNFTyxLQUFLLEVBQUUscUJBQXFCO0VBQzVCWCxLQUFLQSxDQUFDYSxLQUFhLEVBQUU7SUFDbkIsTUFBTU0sS0FBSyxHQUFHLElBQUlwQyxJQUFJLENBQUMsQ0FBQztJQUN4QixPQUFPO01BQ0xxQixTQUFTLEVBQUVlLEtBQUs7TUFDaEJkLE9BQU8sRUFBRSxJQUFBbkIsZ0JBQU8sRUFBQ2lDLEtBQUssRUFBRUwsSUFBSSxDQUFDQyxHQUFHLENBQUNDLE1BQU0sQ0FBQ0gsS0FBSyxDQUFDLEVBQUUsQ0FBQyxDQUFDLEdBQUcsQ0FBQztJQUN4RCxDQUFDO0VBQ0gsQ0FBQztFQUNESSxlQUFlQSxDQUFDakIsS0FBZ0IsRUFBRTtJQUNoQyxJQUFJLENBQUMsSUFBQUcsa0JBQVMsRUFBQ0gsS0FBSyxDQUFDSSxTQUFTLEVBQUV2QixRQUFRLENBQUNPLFlBQVksQ0FBQyxFQUFFLE9BQU8sR0FBRztJQUNsRSxJQUFJLENBQUNZLEtBQUssQ0FBQ0ssT0FBTyxFQUFFLE9BQU8sR0FBRztJQUM5QixPQUFPLElBQUFhLGlDQUF3QixFQUFDbEIsS0FBSyxDQUFDSyxPQUFPLEVBQUV4QixRQUFRLENBQUNPLFlBQVksQ0FBQyxHQUFHLENBQUM7RUFDM0U7QUFDRixDQUFDLENBQ0YiLCJpZ25vcmVMaXN0IjpbXX0=