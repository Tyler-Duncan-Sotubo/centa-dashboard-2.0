export function formatRole(role: string): string {
  if (!role) return "";
  const parts = role.split("_");
  const displayPart = parts[parts.length - 1];
  return displayPart.charAt(0).toUpperCase() + displayPart.slice(1);
}
