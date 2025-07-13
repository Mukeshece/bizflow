import React from 'react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { HelpCircle } from 'lucide-react';

export default function HelpTooltip({ title, whatIsThis, howItIsUsed, whyToUse }) {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <HelpCircle className="w-3.5 h-3.5 text-slate-400 cursor-help" />
        </TooltipTrigger>
        <TooltipContent 
          side="top" 
          className="max-w-xs p-4 bg-gray-800 text-white rounded-lg shadow-lg"
          sideOffset={5}
        >
          <div className="space-y-3">
            <h4 className="font-semibold text-white">{title}</h4>
            
            {whatIsThis && (
              <div>
                <p className="text-xs font-medium text-gray-300 mb-1">What is this?</p>
                <p className="text-xs text-gray-100">{whatIsThis}</p>
              </div>
            )}
            
            {howItIsUsed && (
              <div>
                <p className="text-xs font-medium text-gray-300 mb-1">How it is used?</p>
                <p className="text-xs text-gray-100">{howItIsUsed}</p>
              </div>
            )}
            
            {whyToUse && (
              <div>
                <p className="text-xs font-medium text-gray-300 mb-1">Why to use?</p>
                <p className="text-xs text-gray-100">{whyToUse}</p>
              </div>
            )}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}