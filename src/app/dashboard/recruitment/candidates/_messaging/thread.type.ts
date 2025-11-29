export interface MessageViewProps {
  thread: {
    subject: string;
    messages: {
      id: string;
      from: string;
      to: string;
      date: string;
      body: string;
    }[];
  };
}

export interface Message {
  id: string;
  from: string;
  to: string;
  date: string;
  subject: string;
  snippet: string;
  body: string;
}

export interface Thread {
  id: string;
  subject: string;
  snippet: string;
  messages: Message[];
}
