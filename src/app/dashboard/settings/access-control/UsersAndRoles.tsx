"use client";

import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import Image from "next/image";
import { User } from "@/types/user.type";
import { useState } from "react";
import UsersAndRoleModal from "./UsersAndRoleModal";
import PageHeader from "@/components/pageHeader";
import { Users } from "lucide-react";
import DefaultManagerSettings from "./DefaultManager";
import TwoFactorAuthToggle from "./TwoFactor";
import SecurityHistoryPage from "./SecurityHistory";
import { formatDistanceToNow } from "date-fns";

// Role descriptions
const roles = [
  {
    name: "Super Admin",
    description:
      "Full access to the system, including user management, role assignment, and system settings.",
  },
  {
    name: "Admin",
    description:
      "Can manage users, assign roles, and oversee HR and payroll functions.",
  },
  {
    name: "HR Manager",
    description:
      "Responsible for employee records, hiring, and managing HR-related tasks.",
  },
  {
    name: "Payroll Specialist",
    description:
      "Handles employee payroll, tax documentation, and salary disbursements.",
  },
];

export default function UsersAndRoles({ users }: { users: User[] }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [user, setUser] = useState<User | null>(null);

  return (
    <div>
      <PageHeader
        title="Team and security"
        description="Manage users and roles to control access to the system."
        tooltip="Users and roles are essential for maintaining security and ensuring that only authorized personnel have access to sensitive information. You can add, edit, or remove users and assign them specific roles based on their responsibilities."
        icon={<Users className="h-5 w-5" />}
      >
        <Button
          onClick={() => {
            setIsEditing(false);
            setIsOpen(true);
            setUser(null);
          }}
        >
          Invite User
        </Button>
      </PageHeader>
      <div className="mt-8">
        <Tabs defaultValue="users" className="w-full">
          <div className="flex items-center justify-between my-10">
            <TabsList className="flex justify-start ">
              <TabsTrigger value="users">Users</TabsTrigger>
              <TabsTrigger value="roles">Roles</TabsTrigger>
              <TabsTrigger value="default-manager">Default Manager</TabsTrigger>
              <TabsTrigger value="two-step-authentication">
                Two-step Authentication
              </TabsTrigger>
              <TabsTrigger value="security-history">
                Security History
              </TabsTrigger>
            </TabsList>
          </div>
          {/* Users Tab */}
          <TabsContent value="users">
            <Table className="text-md">
              <TableHeader>
                <TableRow>
                  <TableHead>User Details</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Last Login</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="py-4">
                      <div className="flex items-center space-x-2 ">
                        <div>
                          {user.avatar ? (
                            <Image
                              alt="user thumbnail"
                              src={user.avatar}
                              className="rounded-full"
                              width={60}
                              height={60}
                            />
                          ) : (
                            <Image
                              alt="user thumbnail"
                              src="https://res.cloudinary.com/dw1ltt9iz/image/upload/v1757584748/user-thumbnail_esajvk.gif"
                              className=" rounded-full"
                              width={60}
                              height={60}
                            />
                          )}
                        </div>
                        <div className="flex flex-col">
                          <p className="font-medium">
                            {user.first_name} {user.last_name}
                          </p>
                          <p className=" text-muted-foreground">{user.email}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="font-semibold">
                      {user.role === "super_admin"
                        ? "Super Admin"
                        : user.role === "manager"
                        ? "Line Manager"
                        : user.role === "hr_manager"
                        ? "HR Manager"
                        : user.role === "payroll_specialist"
                        ? "Payroll Specialist"
                        : "Unknown"}
                    </TableCell>
                    <TableCell>
                      <span
                        className={`px-2 py-1 rounded text-md font-medium bg-green-100 text-green-700`}
                      >
                        Active
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      {user.lastLogin ? (
                        formatDistanceToNow(new Date(user.lastLogin), {
                          addSuffix: true,
                        })
                      ) : (
                        <span className="text-muted-foreground">Never</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setIsEditing(true);
                          setIsOpen(true);
                          setUser(user);
                        }}
                      >
                        Edit
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TabsContent>

          {/* Roles Tab */}
          <TabsContent value="roles">
            <Table className="text-md">
              <TableHeader>
                <TableRow>
                  <TableHead>Role Name</TableHead>
                  <TableHead>Description</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {roles.map((role) => (
                  <TableRow key={role.name}>
                    <TableCell className="font-semibold">{role.name}</TableCell>
                    <TableCell className="py-4">{role.description}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TabsContent>
          {/* Default Manager Tab */}
          <TabsContent value="default-manager">
            <DefaultManagerSettings />
          </TabsContent>
          {/* Two-step Authentication Tab */}
          <TabsContent value="two-step-authentication">
            <TwoFactorAuthToggle />
          </TabsContent>
          {/* Security History Tab */}
          <TabsContent value="security-history">
            <SecurityHistoryPage />
          </TabsContent>
        </Tabs>
      </div>

      <UsersAndRoleModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        isEditing={isEditing}
        user={user}
      />
    </div>
  );
}
