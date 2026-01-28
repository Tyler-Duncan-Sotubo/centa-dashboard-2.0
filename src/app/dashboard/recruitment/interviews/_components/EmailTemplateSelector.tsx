"use client";

import React, { useState } from "react";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/shared/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from "@/shared/ui/dialog";
import { Button } from "@/shared/ui/button";
import {
  FormControl,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/shared/ui/form";
import CreateEmailTemplateModal from "../../email-templates/_components/CreateEmailTemplateModal";

export type EmailTemplate = {
  id: string;
  name: string;
  subject: string;
  body: string;
};

interface EmailTemplateSelectorProps {
  value: string | undefined;
  onChange: (templateId: string) => void;
  templates: EmailTemplate[];
}

const EmailTemplateSelector: React.FC<EmailTemplateSelectorProps> = ({
  value,
  onChange,
  templates,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedPreviewId, setSelectedPreviewId] = useState<string | null>(
    null,
  );

  const selectedTemplate = templates.find(
    (tpl) => tpl.id === selectedPreviewId,
  );

  return (
    <FormItem>
      <div className="flex items-center justify-between mb-1">
        <FormLabel>Email Template</FormLabel>
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
            <SelectValue placeholder="Select email template" />
          </SelectTrigger>
        </FormControl>
        <SelectContent>
          {templates.map((tpl) => (
            <div
              key={tpl.id}
              className="flex items-center justify-between px-2 py-1"
            >
              <SelectItem value={tpl.id}>{tpl.name}</SelectItem>
              <Dialog>
                <DialogTrigger asChild>
                  <Button
                    type="button"
                    variant="link"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedPreviewId(tpl.id);
                    }}
                  >
                    Preview
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>{selectedTemplate?.name}</DialogTitle>
                    <DialogDescription>
                      Subject: {selectedTemplate?.subject}
                    </DialogDescription>
                  </DialogHeader>
                  <div className="mt-4 whitespace-pre-wrap text-sm">
                    {selectedTemplate?.body ? (
                      <div
                        dangerouslySetInnerHTML={{
                          __html: selectedTemplate.body,
                        }}
                      />
                    ) : (
                      <p className="text-muted-foreground">
                        No email content provided.
                      </p>
                    )}
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          ))}
        </SelectContent>
      </Select>
      <FormMessage />
      <CreateEmailTemplateModal open={isOpen} setOpen={setIsOpen} />
    </FormItem>
  );
};

export default EmailTemplateSelector;
