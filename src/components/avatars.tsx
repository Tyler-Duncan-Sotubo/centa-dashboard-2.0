import { Avatar, AvatarFallback } from "./ui/avatar";

const avatarColors = [
  "bg-red-500",
  "bg-blue-500",
  "bg-green-500",
  "bg-yellow-500",
  "bg-purple-500",
  "bg-pink-500",
  "bg-indigo-500",
  "bg-orange-500",
];

const getColorClass = (name: string) => {
  if (!name || !name.trim()) return avatarColors[0]; // default color if no name
  const hash = Array.from(name).reduce(
    (acc, char) => acc + char.charCodeAt(0),
    0
  );
  return avatarColors[hash % avatarColors.length];
};

export const Avatars = ({ name }: { name?: string }) => {
  const safeName = name?.trim() || ""; // ensure no undefined/null
  const initials = safeName
    ? safeName
        .split(/\s+/)
        .map((n) => n[0])
        .join("")
        .toUpperCase()
    : "NA";

  const bgClass = getColorClass(safeName);

  return (
    <div className="flex items-center gap-2">
      <Avatar className="w-12 h-12">
        <AvatarFallback>
          <div
            className={`w-12 h-12 text-white flex items-center justify-center font-bold rounded-full ${bgClass}`}
          >
            {initials}
          </div>
        </AvatarFallback>
      </Avatar>
    </div>
  );
};
