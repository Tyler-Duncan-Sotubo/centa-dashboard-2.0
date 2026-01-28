/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import { Button } from "@/shared/ui/button";
import { Checkbox } from "@/shared/ui/checkbox";
import FormError from "@/shared/ui/form-error";
import { Label } from "@/shared/ui/label";
import Loading from "@/shared/ui/loading";
import { useUpdateMutation } from "@/shared/hooks/useUpdateMutation";
import { useQuery } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import useAxiosAuth from "@/shared/hooks/useAxiosAuth";

export default function PermissionManagementPage() {
  const [selectedRole, setSelectedRole] = useState<string | null>(null);
  const [localRolePermissions, setLocalRolePermissions] = useState<
    Record<string, string[]>
  >({});
  const { data: session, status } = useSession();
  const axiosInstance = useAxiosAuth();
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchPermissionSettings = async () => {
    const res = await axiosInstance.get("/api/permissions/company-all");
    return res.data.data;
  };

  const { data, isLoading, isError } = useQuery({
    queryKey: ["permissions"],
    queryFn: fetchPermissionSettings,
    enabled: !!session?.backendTokens?.accessToken,
    refetchOnMount: true,
  });

  useEffect(() => {
    if (data) {
      setLocalRolePermissions(data.rolePermissions);
      if (!selectedRole) {
        const firstRole = data.roles[0]?.id || null;
        setSelectedRole(firstRole);
      }
    }
  }, [data]);

  const handleTogglePermission = (permId: string, checked: boolean) => {
    if (!selectedRole) return;

    setLocalRolePermissions((prev) => {
      const currentPerms = new Set(prev[selectedRole] ?? []);
      if (checked) {
        currentPerms.add(permId);
      } else {
        currentPerms.delete(permId);
      }
      return { ...prev, [selectedRole]: Array.from(currentPerms) };
    });
  };

  const submitPermissions = useUpdateMutation({
    endpoint: "/api/permissions",
    successMessage: "Permissions updated successfully!",
    refetchKey: "permissions",
    onSuccess: () => {
      setIsSubmitting(false);
      setError(null);
    },
    onError: () => {
      setIsSubmitting(false);
    },
  });

  const handleSave = async () => {
    setIsSubmitting(true);
    await submitPermissions(
      { rolePermissions: localRolePermissions },
      setError,
    );
  };

  if (status === "loading" || isLoading) return <Loading />;
  if (isError)
    return (
      <div>
        <p>Error</p>
      </div>
    );

  const { roles, permissions } = data;

  function formatRoleName(name: string): string {
    return name
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  }

  function groupPermissions(permissions: { id: string; key: string }[]) {
    const grouped: Record<
      string,
      { id: string; key: string; label: string }[]
    > = {};

    for (const perm of permissions) {
      const [moduleRaw, ...rest] = perm.key.split(".");
      const moduleName = moduleRaw
        .replace(/_/g, " ")
        .replace(/\b\w/g, (c) => c.toUpperCase());
      const label = rest
        .map((part) =>
          part
            .split("_")
            .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
            .join(" "),
        )
        .join(": ");

      if (!grouped[moduleName]) grouped[moduleName] = [];
      grouped[moduleName].push({ id: perm.id, key: perm.key, label });
    }

    return grouped;
  }

  const groupedPermissions = groupPermissions(permissions);

  return (
    <div>
      <h1 className="text-xl font-bold mb-4">Company Permission Management</h1>

      <div className="flex space-x-10">
        {/* Roles */}
        <div className="w-1/4">
          <h2 className="font-semibold mb-2">Roles</h2>
          <ul className="space-y-2">
            {roles.map((role: { id: string; name: string }) => (
              <li key={role.id}>
                <Button
                  onClick={() => setSelectedRole(role.id)}
                  className={`px-3 py-2 w-full text-left border text-black ${
                    selectedRole === role.id ? "text-white" : "bg-white"
                  }`}
                >
                  {formatRoleName(role.name)}
                </Button>
              </li>
            ))}
          </ul>
        </div>

        {/* Permissions */}
        <div className="w-3/4">
          <h2 className="font-semibold mb-2">Permissions</h2>
          {selectedRole ? (
            <div className="flex flex-col gap-5">
              {Object.entries(groupedPermissions).map(([moduleName, perms]) => (
                <div key={moduleName}>
                  <h3 className="font-semibold text-blue-600 mb-2">
                    {moduleName}
                  </h3>
                  <div className="grid grid-cols-3 gap-2">
                    {perms.map((perm) => {
                      const checked = localRolePermissions[
                        selectedRole
                      ]?.includes(perm.id);
                      return (
                        <Label
                          key={perm.id}
                          className="flex items-start gap-3 p-3 border rounded-md hover:bg-accent/50"
                        >
                          <Checkbox
                            id={perm.id}
                            checked={checked}
                            onCheckedChange={(value) =>
                              handleTogglePermission(perm.id, Boolean(value))
                            }
                          />
                          <div className="grid gap-1.5 font-normal">
                            <p className="text-sm font-medium">{perm.label}</p>
                          </div>
                        </Label>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div>Select a role to edit permissions.</div>
          )}
        </div>
      </div>

      <div className="flex justify-end mt-6">
        <Button onClick={handleSave} isLoading={isSubmitting}>
          Save Changes
        </Button>
      </div>
      {error && <FormError message={error} />}
    </div>
  );
}
