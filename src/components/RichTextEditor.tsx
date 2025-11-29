import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import {
  FaBold,
  FaItalic,
  FaListOl,
  FaListUl,
  FaQuoteLeft,
  FaRedo,
  FaStrikethrough,
  FaUnderline,
  FaUndo,
} from "react-icons/fa";
import { Editor } from "@tiptap/react";
import { Button } from "@/components/ui/button";
import { LuHeading3, LuHeading2 } from "react-icons/lu";

const MenuBar = ({ editor }: { editor: Editor | null }) => {
  if (!editor) return null;

  const handleClick = (
    event: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ) => {
    event.preventDefault(); // Prevent form submission
  };

  return (
    <div className="menuBar flex flex-wrap mb-2 gap-2">
      <Button
        size={"icon"}
        onClick={(e) => {
          handleClick(e); // Prevent form submission
          editor.chain().focus().toggleBold().run();
        }}
        className={editor.isActive("bold") ? "is_active" : ""}
      >
        <FaBold />
      </Button>
      <Button
        size={"icon"}
        onClick={(e) => {
          handleClick(e); // Prevent form submission
          editor.chain().focus().toggleItalic().run();
        }}
        className={editor.isActive("italic") ? "is_active" : ""}
      >
        <FaItalic />
      </Button>
      <Button
        size={"icon"}
        onClick={(e) => {
          handleClick(e); // Prevent form submission
          editor.chain().focus().toggleUnderline().run();
        }}
        className={editor.isActive("underline") ? "is_active" : ""}
      >
        <FaUnderline />
      </Button>
      <Button
        size={"icon"}
        onClick={(e) => {
          handleClick(e); // Prevent form submission
          editor.chain().focus().toggleStrike().run();
        }}
        className={editor.isActive("strike") ? "is_active" : ""}
      >
        <FaStrikethrough />
      </Button>
      <Button
        size={"icon"}
        onClick={(e) => {
          handleClick(e); // Prevent form submission
          editor.chain().focus().toggleHeading({ level: 2 }).run();
        }}
        className={editor.isActive("heading", { level: 2 }) ? "is_active" : ""}
      >
        <LuHeading2 />
      </Button>
      <Button
        size={"icon"}
        onClick={(e) => {
          handleClick(e); // Prevent form submission
          editor.chain().focus().toggleHeading({ level: 3 }).run();
        }}
        className={editor.isActive("heading", { level: 3 }) ? "is_active" : ""}
      >
        <LuHeading3 />
      </Button>
      <Button
        size={"icon"}
        onClick={(e) => {
          handleClick(e); // Prevent form submission
          editor.chain().focus().toggleBulletList().run();
        }}
        className={editor.isActive("bulletList") ? "is_active" : ""}
      >
        <FaListUl />
      </Button>
      <Button
        size={"icon"}
        onClick={(e) => {
          handleClick(e); // Prevent form submission
          editor.chain().focus().toggleOrderedList().run();
        }}
        className={editor.isActive("orderedList") ? "is_active" : ""}
      >
        <FaListOl />
      </Button>
      <Button
        size={"icon"}
        onClick={(e) => {
          handleClick(e); // Prevent form submission
          editor.chain().focus().toggleBlockquote().run();
        }}
        className={editor.isActive("blockquote") ? "is_active" : ""}
      >
        <FaQuoteLeft />
      </Button>
      <Button
        size={"icon"}
        onClick={(e) => {
          handleClick(e); // Prevent form submission
          editor.chain().focus().undo().run();
        }}
      >
        <FaUndo />
      </Button>
      <Button
        size={"icon"}
        onClick={(e) => {
          handleClick(e); // Prevent form submission
          editor.chain().focus().redo().run();
        }}
      >
        <FaRedo />
      </Button>
    </div>
  );
};

type TiptapProps = {
  value: string;
  onChange: (value: string) => void;
};

export const RichTextEditor = ({ value, onChange }: TiptapProps) => {
  const editor = useEditor({
    extensions: [StarterKit, Underline],
    content: value,
    immediatelyRender: false,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
  });

  return (
    <div className="textEditor">
      <MenuBar editor={editor} />
      <EditorContent editor={editor} />
    </div>
  );
};
