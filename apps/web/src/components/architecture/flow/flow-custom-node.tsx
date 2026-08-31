import { memo } from "react";
import { Handle, Position, type NodeProps, type Node } from "@xyflow/react";
import { FileCode } from "lucide-react";
import { LAYER_COLORS, type FlowNodeData } from "./flow-types";

type FlowNode = Node<FlowNodeData, "flowStep">;

function FlowNodeComponent({ data }: NodeProps<FlowNode>) {
  const colors = LAYER_COLORS[data.layer];
  const Icon = data.icon;

  return (
    <div
      className={`w-[300px] rounded-xl border ${colors.borderLeft} border-l-[3px] bg-background/95 backdrop-blur-sm shadow-md hover:shadow-lg transition-all duration-200`}
    >
      <Handle
        type="target"
        position={Position.Top}
        className="!bg-muted-foreground/30 !w-2 !h-2 !border-none"
      />

      <div className="p-3.5 space-y-2">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2.5 min-w-0">
            <span
              className={`flex shrink-0 items-center justify-center size-7 rounded-lg text-xs font-bold ${colors.bg} ${colors.text}`}
            >
              {data.step}
            </span>
            <div className="flex items-center gap-1.5 min-w-0">
              <Icon className={`size-3.5 shrink-0 ${colors.text}`} />
              <span className="text-[11px] font-bold text-foreground leading-tight truncate">
                {data.title}
              </span>
            </div>
          </div>
          <span
            className={`shrink-0 text-[8px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md ${colors.bg} ${colors.text}`}
          >
            {data.layer}
          </span>
        </div>

        <p className="text-[10px] text-muted-foreground leading-relaxed line-clamp-2 pl-[38px]">
          {data.description}
        </p>

        <div className="flex items-center gap-1.5 text-[9px] text-muted-foreground/70 font-mono pl-[38px]">
          <FileCode className="size-2.5 shrink-0" />
          <span className="truncate">{data.file}</span>
        </div>
      </div>

      <Handle
        type="source"
        position={Position.Bottom}
        className="!bg-muted-foreground/30 !w-2 !h-2 !border-none"
      />
    </div>
  );
}

export const FlowCustomNode = memo(FlowNodeComponent);
