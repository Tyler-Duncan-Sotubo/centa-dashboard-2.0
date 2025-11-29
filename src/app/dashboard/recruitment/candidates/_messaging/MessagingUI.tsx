// MessagingUI.tsx
import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Loading from "@/components/ui/loading";
import ComposeModal from "./ComposeModal";
import MessageList from "./MessageList";
import MessageDetail from "./MessageDetail";
import { Thread, Message } from "./thread.type";

const fetchThread = async (): Promise<Thread | null> => {
  const res = await fetch("/api/integrations/google/thread", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ candidateEmail: "tylertooxclusive@gmail.com" }),
  });

  if (res.status === 404) return null;
  if (!res.ok) throw new Error("Failed to fetch Gmail thread");
  return res.json();
};

export default function MessagingUI({
  candidateEmail,
}: {
  candidateEmail: string;
}) {
  const {
    data: thread,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery<Thread | null>({
    queryKey: ["Thread"],
    queryFn: fetchThread,
  });

  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);

  // once the thread loads, default‐select the first message
  useEffect(() => {
    if (thread && !selectedMessage) {
      setSelectedMessage(thread.messages[0]);
    }
  }, [thread, selectedMessage]);

  if (isLoading) return <Loading />;
  if (isError)
    return (
      <div className="text-red-500">Error: {(error as Error).message}</div>
    );
  if (!thread)
    return (
      <section>
        <div className="flex justify-end mb-4">
          <ComposeModal onSent={refetch} candidateEmail={candidateEmail} />
        </div>
        <div className="text-center mt-8 h-96">
          No Gmail threads found for this candidate.
        </div>
      </section>
    );

  return (
    <div className="flex divide-x h-full">
      {/* Left: list of messages */}
      <div className="w-1/3 px-4 overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-bold mb-4">Messages</h2>
          <ComposeModal onSent={refetch} candidateEmail={candidateEmail} />
        </div>
        <MessageList
          messages={thread.messages}
          selectedId={selectedMessage?.id ?? ""}
          onSelect={setSelectedMessage}
        />
      </div>

      {/* Right: detail of selected message */}
      <div className="w-2/3 px-4 overflow-y-auto">
        {selectedMessage ? (
          <MessageDetail message={selectedMessage} />
        ) : (
          <p className="text-gray-500">Select a message to view</p>
        )}
      </div>
    </div>
  );
}
