import { useState, useEffect, useMemo } from "react";
import {
  ReactFlow,
  Controls,
  Background,
  BackgroundVariant,
  type Node,
  type Edge,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { FlowCustomNode } from "./flow-custom-node";

const nodeTypes = { flowStep: FlowCustomNode };

interface FlowDiagramProps {
  nodes: Node[];
  edges: Edge[];
}

export function FlowDiagram({ nodes, edges }: FlowDiagramProps) {
  const [isClient, setIsClient] = useState(false);
  useEffect(() => setIsClient(true), []);

  const defaultEdgeOptions = useMemo(() => ({ type: "smoothstep" as const, animated: true }), []);

  if (!isClient) {
    return (
      <div className="h-[500px] sm:h-[600px] lg:h-[700px] w-full rounded-xl border border-muted/50 bg-muted/10 animate-pulse" />
    );
  }

  return (
    <div className="h-[500px] sm:h-[600px] lg:h-[700px] w-full rounded-xl border border-muted/50 bg-background/30 backdrop-blur-sm overflow-hidden">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        defaultEdgeOptions={defaultEdgeOptions}
        fitView
        fitViewOptions={{ padding: 0.3 }}
        nodesDraggable={false}
        nodesConnectable={false}
        elementsSelectable={false}
        panOnDrag
        zoomOnScroll
        minZoom={0.2}
        maxZoom={1.5}
        proOptions={{ hideAttribution: true }}
      >
        <Controls
          position="bottom-right"
          showInteractive={false}
          className="!bg-background !border-muted !shadow-md [&>button]:!bg-background [&>button]:!border-muted [&>button]:!text-foreground"
        />
        <Background
          variant={BackgroundVariant.Dots}
          gap={20}
          size={1}
          color="hsl(var(--muted-foreground) / 0.15)"
        />
      </ReactFlow>
    </div>
  );
}
