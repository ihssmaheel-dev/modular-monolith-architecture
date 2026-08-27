import * as React from "react";
import * as CollapsiblePrimitive from "@radix-ui/react-collapsible";

const Collapsible = (
  props: React.ComponentProps<typeof CollapsiblePrimitive.Root>,
) => <CollapsiblePrimitive.Root {...props} />;

const CollapsibleTrigger = (
  props: React.ComponentProps<typeof CollapsiblePrimitive.CollapsibleTrigger>,
) => <CollapsiblePrimitive.CollapsibleTrigger {...props} />;

const CollapsibleContent = (
  props: React.ComponentProps<typeof CollapsiblePrimitive.CollapsibleContent>,
) => <CollapsiblePrimitive.CollapsibleContent {...props} />;

export { Collapsible, CollapsibleTrigger, CollapsibleContent };
