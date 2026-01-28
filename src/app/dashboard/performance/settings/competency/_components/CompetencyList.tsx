"use client";

import { Button } from "@/shared/ui/button";
import { FaCirclePlus } from "react-icons/fa6";
import { useState } from "react";
import CompetencyModal from "./CompetencyModal";
import { FaEdit } from "react-icons/fa";
import { DeleteIconDialog } from "@/shared/ui/delete-icon-dialog";
import { Competency } from "@/types/performance/question-competency.type";

type Props = {
  competencies: Competency[];
  activeId: string | null;
  setActiveId: (id: string) => void;
  isDisabled?: boolean;
};

export default function CompetencyList({
  competencies,
  activeId,
  setActiveId,
  isDisabled,
}: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [isEditingOpen, setIsEditingOpen] = useState(false);

  const allOption = {
    id: "all",
    name: "All Competencies",
    questions: [],
    isGlobal: true,
  };

  const fullList = [allOption, ...competencies];

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">Competencies</h2>
        <Button onClick={() => setIsOpen(true)} disabled={isDisabled}>
          <FaCirclePlus className="mr-2" /> Add Competency
        </Button>
      </div>
      <ul className="space-y-1">
        {fullList.map((comp) => (
          <li
            key={comp.id}
            onClick={() => setActiveId(comp.id)}
            className={`p-4 rounded cursor-pointer hover:bg-monzo-background hover:text-monzo-textPrimary border ${
              activeId === comp.id
                ? "bg-monzo-background border-monzo-brandDark font-semibold text-monzo-textPrimary"
                : ""
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="space-y-1 w-full">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-md font-semibold mb-2">{comp.name}</p>
                    {comp.id === "all" && (
                      <p className="text-sm text-muted-foreground">
                        {competencies.flatMap((c) => c.questions).length}{" "}
                        {competencies.flatMap((c) => c.questions).length === 1
                          ? "question"
                          : "questions"}
                      </p>
                    )}
                    {comp.id !== "all" && (
                      <p className="text-sm text-muted-foreground">
                        {comp.questions.length}{" "}
                        {comp.questions.length === 1 ? "question" : "questions"}
                      </p>
                    )}
                  </div>

                  <div>
                    {comp.id !== "all" && !comp.isGlobal && !isDisabled && (
                      <>
                        <Button
                          className={`text-monzo-textPrimary ${
                            activeId === comp.id ? "" : "text-muted-foreground"
                          }`}
                          variant={"link"}
                          onClick={(e) => {
                            e.stopPropagation();
                            setIsEditingOpen(true);
                          }}
                        >
                          <FaEdit />
                        </Button>
                        <DeleteIconDialog itemId={comp.id} type="competency" />
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </li>
        ))}
      </ul>
      <CompetencyModal open={isOpen} setOpen={setIsOpen} />

      <CompetencyModal
        open={isEditingOpen}
        setOpen={setIsEditingOpen}
        initialData={
          activeId
            ? competencies.find((comp) => comp.id === activeId)
            : undefined
        }
      />
    </div>
  );
}
