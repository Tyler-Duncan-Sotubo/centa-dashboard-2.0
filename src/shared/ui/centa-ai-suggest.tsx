import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  TooltipProvider,
} from "@/shared/ui/tooltip";
import { CentaAIBot } from "./CentaAIBot";

interface CentaAISuggestProps {
  isLoading?: boolean;
}

export function CentaAISuggest({ isLoading = false }: CentaAISuggestProps) {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="flex items-center cursor-pointer text-xmd gap-3">
            <CentaAIBot isLoading={isLoading} />
            Centa AI Suggest
          </div>
        </TooltipTrigger>
        <TooltipContent side="top" align="center">
          Let Centa AI generate smart suggestions
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
