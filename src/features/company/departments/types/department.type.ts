export type Department = {
  id: string;
  name: string;
  description: string;
  createdAt: string;
  head: {
    id: string;
    name: string;
    email: string;
    avatarUrl?: string;
  } | null;
  employees: {
    id: string;
    name: string;
    avatarUrl?: string;
  }[];
};
