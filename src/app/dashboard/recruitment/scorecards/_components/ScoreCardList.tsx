"use client";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FaBuilding, FaClone, FaGlobe, FaTrash } from "react-icons/fa";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";
import { useCreateMutation } from "@/hooks/useCreateMutation";
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

export type ScoreCard = {
  id: string;
  name: string;
  description: string;
  isSystem: boolean;
  createdAt: string;
  criteria: {
    id: string;
    name: string;
    description: string;
    maxScore: number;
  }[];
};

export default function ScoreCardList({
  scoreCards,
}: {
  scoreCards: ScoreCard[];
}) {
  const [isLoading, setIsLoading] = useState(false);

  const cloneScoreCard = useCreateMutation({
    endpoint: `/api/interviews/scorecards-templates/clone`,
    successMessage: "Scorecard cloned successfully",
    refetchKey: "scoreCards",
  });

  const handleClone = async (card: ScoreCard) => {
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
      endpoint: `/api/interviews/scorecards-templates/${id}`,
      refetchKey: "scoreCards",
      successMessage: "Deleted successfully",
    });

    const handleConfirm = async () => {
      await deleteMutation();
      setOpen(false);
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
              Are you sure you want to delete this scorecard?
            </AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. All data associated with this
              scorecard will be permanently deleted.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <Button variant="destructive" onClick={handleConfirm}>
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
        {scoreCards.map((card) => (
          <Card
            key={card.id}
            className="flex flex-col justify-between max-h-48"
          >
            <CardHeader>
              <div className="flex justify-between items-start">
                <CardTitle className="text-md truncate w-2/3">
                  {card.name}
                </CardTitle>
                <Badge variant={card.isSystem ? "approved" : "outline"}>
                  {card.isSystem ? (
                    <FaGlobe className="mr-1" />
                  ) : (
                    <FaBuilding className="mr-1" />
                  )}
                  {card.isSystem ? "Global" : "Company"}
                </Badge>
              </div>
              <CardDescription className="text-sm truncate">
                {card.description}
              </CardDescription>
            </CardHeader>
            <CardContent className="flex justify-between items-center pt-4">
              <div className="space-x-2">
                {card.isSystem && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleClone(card)}
                    disabled={isLoading}
                    isLoading={isLoading}
                  >
                    <FaClone />
                  </Button>
                )}
                {!card.isSystem && (
                  <DeleteAlert
                    id={card.id}
                    trigger={
                      <Button variant="destructive" size="sm">
                        <FaTrash />
                      </Button>
                    }
                  />
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
                    <DialogTitle>{card.name}</DialogTitle>
                    <DialogDescription>{card.description}</DialogDescription>
                  </DialogHeader>

                  {card.criteria &&
                  card.criteria.filter((c) => c.id).length > 0 ? (
                    <ul className="mt-4 space-y-2">
                      {card.criteria.map(
                        (criterion) =>
                          criterion.id && (
                            <li
                              key={criterion.id}
                              className="border-b pb-2 last:border-none"
                            >
                              <p className="font-medium">{criterion.name}</p>
                              <p className="text-sm text-muted-foreground">
                                {criterion.description} (Max Score:{" "}
                                {criterion.maxScore})
                              </p>
                            </li>
                          )
                      )}
                    </ul>
                  ) : (
                    <p className="text-sm text-muted-foreground mt-4">
                      No criteria defined yet.
                    </p>
                  )}
                </DialogContent>
              </Dialog>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}
