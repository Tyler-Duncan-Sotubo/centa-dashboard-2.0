"use client";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FaGlobe, FaTrash } from "react-icons/fa";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useDeleteMutation } from "@/hooks/useDeleteMutation";
import { FaClone } from "react-icons/fa6";
import { useCreateMutation } from "@/hooks/useCreateMutation";

export type EmailTemplate = {
  id: string;
  name: string;
  subject: string;
  body: string;
  isGlobal: boolean;
  createdAt: string;
};

export default function EmailTemplateList({
  templates,
}: {
  templates: EmailTemplate[];
}) {
  const [deleting, setDeleting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const cloneScoreCard = useCreateMutation({
    endpoint: `/api/interviews/email-templates/clone`,
    successMessage: "Email template cloned successfully",
    refetchKey: "emailTemplates",
  });

  const handleClone = async (card: EmailTemplate) => {
    setIsLoading(true);
    try {
      await cloneScoreCard({
        templateId: card.id,
      });
    } catch (error) {
      console.error("Error cloning scorecard:", error);
    } finally {
      setIsLoading(false);
    }
  };

  function DeleteAlert({
    id,
    trigger,
  }: {
    id: string;
    trigger?: React.ReactNode;
  }) {
    const [open, setOpen] = useState(false);

    const deleteMutation = useDeleteMutation({
      endpoint: `/api/interviews/email-templates/${id}`,
      refetchKey: "emailTemplates",
      successMessage: "Email template deleted successfully",
    });

    const handleConfirm = async () => {
      setDeleting(true);
      try {
        await deleteMutation();
      } finally {
        setDeleting(false);
        setOpen(false);
      }
    };

    return (
      <AlertDialog open={open} onOpenChange={setOpen}>
        <AlertDialogTrigger asChild>
          {trigger ?? (
            <Button variant="destructive" size="sm">
              Delete
            </Button>
          )}
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Are you sure you want to delete this email template?
            </AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This template may be in use.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <Button
              variant="destructive"
              onClick={handleConfirm}
              disabled={deleting}
            >
              Confirm
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    );
  }

  return (
    <section>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 mt-8">
        {templates.map((tpl) => (
          <Card key={tpl.id} className="flex flex-col justify-between max-h-48">
            <CardHeader>
              <div className="flex justify-between items-start">
                <CardTitle className="text-md truncate w-2/3">
                  {tpl.name}
                </CardTitle>
                <Badge variant={tpl.isGlobal ? "approved" : "outline"}>
                  <FaGlobe className="mr-1" />
                  {tpl.isGlobal ? "Global" : "Custom"}
                </Badge>
              </div>
              <CardDescription className="text-sm truncate">
                {tpl.subject}
              </CardDescription>
            </CardHeader>
            <CardContent className="flex justify-between items-center pt-4">
              <div className="space-x-2">
                {!tpl.isGlobal && (
                  <DeleteAlert
                    id={tpl.id}
                    trigger={
                      <Button variant="destructive" size="sm">
                        <FaTrash />
                      </Button>
                    }
                  />
                )}
                {tpl.isGlobal && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleClone(tpl)}
                    disabled={isLoading}
                    isLoading={isLoading}
                  >
                    <FaClone />
                  </Button>
                )}
              </div>
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm">
                    Preview
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-xl">
                  <DialogHeader>
                    <DialogTitle>{tpl.subject}</DialogTitle>
                    <DialogDescription>{tpl.name}</DialogDescription>
                  </DialogHeader>
                  <div className="mt-4 whitespace-pre-wrap text-sm">
                    {tpl.body}
                  </div>
                </DialogContent>
              </Dialog>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}
