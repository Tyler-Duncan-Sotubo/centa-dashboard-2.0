// export function hasPermission(
//   userPermissions: string[],
//   allowedPermissions?: string[]
// ): boolean {
//   if (!allowedPermissions || allowedPermissions.length === 0) return true;
//   return allowedPermissions.some((permission) =>
//     userPermissions.includes(permission)
//   );
// }

export function hasPermission(
  userPermissions: readonly string[],
  required?: readonly string[]
): boolean {
  if (!required || required.length === 0) return true;
  // ALL-of (AND) logic
  return required.every((perm) => userPermissions.includes(perm));
}
