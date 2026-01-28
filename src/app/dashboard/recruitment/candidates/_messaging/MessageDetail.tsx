import { Message } from "./thread.type";
import { Separator } from "@/shared/ui/separator";
import { formatDateHumanReadable } from "@/shared/utils/formatDateHumanReadable";
import { Avatars } from "@/shared/ui/avatars";

interface MessageDetailProps {
  message: Message;
}

export default function MessageDetail({ message }: MessageDetailProps) {
  return (
    <div className="px-3">
      {/* Subject line */}
      <h1 className="text-2xl font-semibold mb-6">{message.subject}</h1>
      {/* “From / To / Date” bar */}
      <div className="text-sm text-gray-600">
        <div className="flex items-center space-x-2">
          {Avatars({
            name: message.from,
          })}
          <div className="font-semibold">
            <p className="font-semibold">{message.from}</p>
            <p className="font-medium">To: {message.to}</p>
          </div>
        </div>
        <div className="flex justify-end mt-1 px-6">
          <p className="font-medium text-sm">
            {formatDateHumanReadable(new Date(message.date))}
          </p>
        </div>
      </div>

      <Separator className="my-6" />
      {/* Message body */}
      {/* Styled body */}
      <pre
        className="
          whitespace-pre-wrap
          text-base
          leading-relaxed
          bg-gray-50
          border
          border-gray-200
          rounded-lg
          p-4
          shadow-2xs
          overflow-auto
        "
      >
        {message.body}
      </pre>
    </div>
  );
}
