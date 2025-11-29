import { Message } from "./thread.type";

interface MessageListProps {
  messages: Message[];
  selectedId: string;
  onSelect: (msg: Message) => void;
}

export default function MessageList({
  messages,
  selectedId,
  onSelect,
}: MessageListProps) {
  return (
    <ul>
      {messages.map((msg) => (
        <li
          key={msg.id}
          className={`p-3 mb-2 cursor-pointer rounded ${
            msg.id === selectedId ? "bg-blue-100" : "hover:bg-gray-100"
          }`}
          onClick={() => onSelect(msg)}
        >
          <h3 className="font-semibold">{msg.subject}</h3>
          <p className="text-sm text-gray-600 truncate">{msg.snippet}</p>
        </li>
      ))}
    </ul>
  );
}
