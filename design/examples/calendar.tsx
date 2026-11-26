import {
  Calendar,
  CalendarDay,
  CalendarGrid,
  CalendarHeading,
  CalendarNext,
  CalendarPrevious,
  CalendarWeekday,
  CalendarWeekdays,
  CalendarWeeks,
} from "@ui-sdk/react/calendar";

function Example() {
  return (
    <Calendar defaultValue="2026-10-16">
      <CalendarPrevious />
      <CalendarHeading />
      <CalendarNext />
      <CalendarGrid>
        <CalendarWeekdays>{(index) => <CalendarWeekday index={index} />}</CalendarWeekdays>
        <CalendarWeeks>{(cell) => <CalendarDay value={cell.date} />}</CalendarWeeks>
      </CalendarGrid>
    </Calendar>
  );
}

export { Example };
