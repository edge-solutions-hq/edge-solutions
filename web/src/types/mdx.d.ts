declare module "*.mdx" {
  import type { ComponentType } from "react";

  const Content: ComponentType;

  export default Content;
  export const metadata:
    | {
        title?: string;
        description?: string;
      }
    | undefined;
}
