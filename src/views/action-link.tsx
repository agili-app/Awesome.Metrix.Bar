import { Button } from "@ui-sdk/react/button";
import type { ComponentProps } from "react";
import { css } from "../../styled-system/css";

type ActionLinkProps = Pick<ComponentProps<typeof Button>, "className" | "aria-label"> & {
  href: string;
  download?: boolean;
  children: string;
};

export function ActionLink({ href, download, ...props }: ActionLinkProps) {
  return (
    <span data-agent-action className={css({ display: "contents" })}>
      <Button {...props} render={<a href={href} download={download} />} />
    </span>
  );
}
