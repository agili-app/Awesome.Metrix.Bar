import {
  Accordion,
  AccordionHeader,
  AccordionItem,
  AccordionPanel,
  AccordionTrigger,
} from "@ui-sdk/react/accordion";

function Example() {
  return (
    <Accordion>
      <AccordionItem value="shipping">
        <AccordionHeader>
          <AccordionTrigger>Shipping</AccordionTrigger>
        </AccordionHeader>
        <AccordionPanel>Orders arrive in five to seven days.</AccordionPanel>
      </AccordionItem>
    </Accordion>
  );
}

export { Example };
