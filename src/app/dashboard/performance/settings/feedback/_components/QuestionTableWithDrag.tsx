"use client";

import { useEffect, useRef, useState } from "react";
import { useDrag, useDrop, DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { GripVertical } from "lucide-react";
import {
  Table,
  TableHead,
  TableRow,
  TableHeader,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { FaEdit } from "react-icons/fa";
import FeedbackQuestionModal from "./CreateFeedbackQuestionModal";
import { DeleteIconDialog } from "@/components/DeleteIconDialog";

type Question = {
  id: string;
  type: string;
  question: string;
  inputType: string;
  order: number;
  isActive: boolean;
  createdAt: string;
};

type Props = {
  questions: Question[];
  onReorder?: (updated: Question[]) => void;
};

const ItemType = "QUESTION_ROW";

export default function QuestionTableWithDrag({ questions, onReorder }: Props) {
  const [items, setItems] = useState<Question[]>([]);
  const [draggingIndex, setDraggingIndex] = useState<number | null>(null);

  useEffect(() => {
    setItems([...questions].sort((a, b) => a.order - b.order));
  }, [questions]);

  const moveRow = (from: number, to: number) => {
    const updated = [...items];
    const [removed] = updated.splice(from, 1);
    updated.splice(to, 0, removed);
    const reordered = updated.map((q, i) => ({ ...q, order: i }));
    setItems(reordered);
    return reordered;
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="border rounded-md">
        <Table className="capitalize">
          <TableHeader>
            <TableRow>
              <TableHead className="w-10" />
              <TableHead>Question</TableHead>
              <TableHead>Input Type</TableHead>
              <TableHead>Order</TableHead>
              <TableHead className="text-center">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map((q, index) => (
              <DraggableRow
                key={q.id}
                index={index}
                question={q}
                moveRow={moveRow}
                setDraggingIndex={setDraggingIndex}
                draggingIndex={draggingIndex}
                onReorder={onReorder}
              />
            ))}
          </TableBody>
        </Table>
      </div>
    </DndProvider>
  );
}

type DraggableRowProps = {
  question: Question;
  index: number;
  moveRow: (from: number, to: number) => Question[];
  setDraggingIndex: (i: number | null) => void;
  draggingIndex: number | null;
  onReorder?: (updated: Question[]) => void;
  onEdit?: (question: Question) => void;
  onDelete?: (question: Question) => void;
};

function DraggableRow({
  question,
  index,
  moveRow,
  setDraggingIndex,
  draggingIndex,
  onReorder,
}: DraggableRowProps) {
  const ref = useRef<HTMLTableRowElement>(null);
  const [open, setOpen] = useState(false);

  const [, drop] = useDrop({
    accept: ItemType,
    drop: () => {
      if (draggingIndex !== null && draggingIndex !== index) {
        const reordered = moveRow(draggingIndex, index);
        onReorder?.(reordered);
      }
      setDraggingIndex(null); // Clear state after drop
    },
  });

  const [{ isDragging }, drag] = useDrag({
    type: ItemType,
    item: () => {
      setDraggingIndex(index);
      return { index };
    },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  drag(drop(ref));

  return (
    <>
      <TableRow
        ref={ref}
        style={{ opacity: isDragging ? 0.5 : 1 }}
        className="cursor-move text-md "
      >
        <TableCell className="w-10 py-5">
          <GripVertical size={16} className="text-muted-foreground" />
        </TableCell>
        <TableCell className="text-md">{question.question}</TableCell>
        <TableCell className="text-md">{question.inputType}</TableCell>
        <TableCell className="text-md">{question.order}</TableCell>
        <TableCell className="text-center space-x-2">
          <Button variant={"link"} size="icon" onClick={() => setOpen(true)}>
            <FaEdit />
          </Button>
          <DeleteIconDialog type="feedback-question" itemId={question.id} />
        </TableCell>
      </TableRow>{" "}
      <FeedbackQuestionModal
        open={open}
        setOpen={setOpen}
        selectedType={question.type}
        order={question.order}
        initialData={{
          id: question.id,
          question: question.question,
          inputType: question.inputType as
            | "text"
            | "rating"
            | "yes_no"
            | "dropdown"
            | "checkbox",
        }}
      />
    </>
  );
}
