import {
  Pagination,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationList,
  PaginationNext,
  PaginationPrevious,
} from "@ui-sdk/react/pagination";

function PageNavigation() {
  return (
    <Pagination aria-label="Pagination" pageCount={10}>
      <PaginationList>
        {({ items }) => (
          <>
            <PaginationItem>
              <PaginationPrevious aria-label="Previous page" />
            </PaginationItem>
            {items.map((item) => (
              <PaginationItem key={item}>
                {typeof item === "number" ? <PaginationLink page={item} /> : <PaginationEllipsis />}
              </PaginationItem>
            ))}
            <PaginationItem>
              <PaginationNext aria-label="Next page" />
            </PaginationItem>
          </>
        )}
      </PaginationList>
    </Pagination>
  );
}

export { PageNavigation as Example };
