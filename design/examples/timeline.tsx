import {
  Timeline,
  TimelineConnector,
  TimelineDescription,
  TimelineItem,
  TimelineMarker,
  TimelineTime,
  TimelineTitle,
  type TimelineStatus,
} from "@ui-sdk/react/timeline";

const steps: {
  value: string;
  title: string;
  dateTime: string;
  time: string;
  description: string;
  status: TimelineStatus;
}[] = [
  {
    value: "placed",
    title: "Order placed",
    dateTime: "2026-11-01",
    time: "Nov 1",
    description: "We received your order.",
    status: "complete",
  },
  {
    value: "packed",
    title: "Packed",
    dateTime: "2026-11-02",
    time: "Nov 2",
    description: "Your items left the shelf.",
    status: "complete",
  },
  {
    value: "shipped",
    title: "Shipped",
    dateTime: "2026-11-03",
    time: "Nov 3",
    description: "On its way with the carrier.",
    status: "current",
  },
  {
    value: "delivered",
    title: "Delivered",
    dateTime: "2026-11-05",
    time: "Nov 5",
    description: "Expected by Thursday.",
    status: "upcoming",
  },
];

function Example() {
  return (
    <Timeline aria-label="Order status">
      {steps.map((step) => (
        <TimelineItem key={step.value} value={step.value} status={step.status}>
          <TimelineMarker />
          <TimelineConnector />
          <TimelineTitle>{step.title}</TimelineTitle>
          <TimelineTime dateTime={step.dateTime}>{step.time}</TimelineTime>
          <TimelineDescription>{step.description}</TimelineDescription>
        </TimelineItem>
      ))}
    </Timeline>
  );
}

export { Example };
