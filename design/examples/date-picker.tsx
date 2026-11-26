import {
  CalendarDay,
  CalendarGrid,
  CalendarHeading,
  CalendarNext,
  CalendarPrevious,
  CalendarWeekday,
  CalendarWeekdays,
  CalendarWeeks,
  DatePicker,
  DatePickerContent,
  DatePickerHint,
  DatePickerInput,
  DatePickerTrigger,
} from "@ui-sdk/react/date-picker";

function Example() {
  return (
    <DatePicker defaultValue="2026-10-16">
      <div data-slot="row">
        <DatePickerInput aria-label="Due date" />
        <DatePickerTrigger aria-label="Choose date" />
      </div>
      <DatePickerHint />
      <DatePickerContent>
        <CalendarPrevious />
        <CalendarHeading />
        <CalendarNext />
        <CalendarGrid>
          <CalendarWeekdays>{(index) => <CalendarWeekday index={index} />}</CalendarWeekdays>
          <CalendarWeeks>{(cell) => <CalendarDay value={cell.date} />}</CalendarWeeks>
        </CalendarGrid>
      </DatePickerContent>
    </DatePicker>
  );
}

export { Example };
