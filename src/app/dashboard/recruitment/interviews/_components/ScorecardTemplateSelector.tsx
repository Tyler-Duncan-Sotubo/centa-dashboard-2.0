"use client";

import React, { useState } from "react";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  FormControl,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import CreateScorecardModal from "../../scorecards/_components/CreateScorecardModal";

export type Scorecard = {
  id: string;
  name: string;
  description?: string;
  criteria?: { description: string; name: string; maxScore: number }[]; // if you have detailed structure
};

interface ScorecardTemplateSelectorProps {
  value: string | undefined;
  onChange: (templateId: string) => void;
  scorecards: Scorecard[];
}

const ScorecardTemplateSelector: React.FC<ScorecardTemplateSelectorProps> = ({
  value,
  onChange,
  scorecards,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedPreviewId, setSelectedPreviewId] = useState<string | null>(
    null
  );

  const selectedPreview = scorecards.find(
    (card) => card.id === selectedPreviewId
  );

  return (
    <FormItem>
      <div className="flex items-center justify-between mb-1">
        <FormLabel>Scorecard Template</FormLabel>
        <Button
          type="button"
          variant="link"
          size="sm"
          onClick={() => setIsOpen(true)}
          className="text-sm"
        >
          Create New Template
        </Button>
      </div>
      <Select value={value} onValueChange={onChange}>
        <FormControl>
          <SelectTrigger>
            <SelectValue placeholder="Select scorecard template" />
          </SelectTrigger>
        </FormControl>
        <SelectContent>
          {scorecards.map((card) => (
            <div
              key={card.id}
              className="flex items-center justify-between px-2 py-1"
            >
              <SelectItem value={card.id}>{card.name}</SelectItem>
              <Dialog>
                <DialogTrigger asChild>
                  <Button
                    type="button"
                    variant="link"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedPreviewId(card.id);
                    }}
                  >
                    Preview
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>{selectedPreview?.name}</DialogTitle>
                    <DialogDescription>
                      {selectedPreview?.description ||
                        "No description provided."}
                    </DialogDescription>
                  </DialogHeader>
                  {selectedPreview?.criteria?.length ? (
                    <ul className="mt-4 list-disc space-y-3 pl-4 text-sm ">
                      {selectedPreview.criteria.map((q, i) => (
                        <li key={i} className="text-md text-muted-foreground">
                          <span className="font-medium text-black">
                            {q.name}
                          </span>
                          : {q.description} (Max Score: {q.maxScore})
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-sm text-muted-foreground mt-4">
                      No questions listed in this scorecard.
                    </p>
                  )}
                </DialogContent>
              </Dialog>
            </div>
          ))}
        </SelectContent>
      </Select>
      <FormMessage />
      <CreateScorecardModal open={isOpen} setOpen={setIsOpen} />
    </FormItem>
  );
};

export default ScorecardTemplateSelector;
