'use client';
import React, { useEffect, useState, useCallback } from "react";
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Loader2, SearchIcon, Edit2Icon, DeleteIcon } from "lucide-react";
import { Input } from "@/components/ui/input";
import axios from "axios";
import { toast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { Table, TableBody, TableCell, TableColumn, TableHeader, TableRow } from "@heroui/react";
import { ModeToggle } from "@/components/ModeToggle";
import { Pagination, Tooltip } from "@heroui/react";
import { AdminSidebar } from "@/components/admin-sidebar";

interface User {
  _id: string;
  name: string;
  email: string;
  contact: string;
  key?: string;
}

const columns = [
  { name: "Name", uid: "name", sortable: true },
  { name: "Email", uid: "email", sortable: true },
  { name: "Contact", uid: "contact", sortable: true },
  { name: "Action", uid: "actions", sortable: false },
];

const INITIAL_VISIBLE_COLUMNS = ["name", "email", "contact", "actions"];

export default function UserTable() {
  const [users, setUsers] = useState<User[]>([]);
  const [filterValue, setFilterValue] = useState("");
  const [rowsPerPage, setRowsPerPage] = useState(15);
  const [page, setPage] = useState(1);
  const router = useRouter();

  const [sortDescriptor, setSortDescriptor] = useState({
    column: "name",
    direction: "ascending" as "ascending" | "descending",
  });

  const fetchUsers = async () => {
    try {
      const response = await axios.get(
        "http://localhost:5000/api/v1/users/getusers",
        {
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${localStorage.getItem("token")}`
          }
        }
      );
      
      const usersData = response.data.data || response.data || [];
      const usersWithKeys = usersData.map((user: User) => ({
        ...user,
        key: user._id
      }));
      
      setUsers(usersWithKeys);
    } catch (error) {
      console.error("Failed to fetch users", error);
      toast.error("Failed to fetch users");
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this user?")) return;

    try {
      await axios.delete(
        `http://localhost:5000/api/v1/users/deleteuser/${id}`,
        {
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${localStorage.getItem("token")}`
          }
        }
      );

      setUsers(prev => prev.filter(user => user._id !== id));
      toast({
        title: "Delete Successful!",
        description: "User deleted successfully!",
      })    } catch (error) {
      console.error("Failed to delete user", error);
      toast({
        title: "Error",
        description: "Failed to delete user.",
        variant: "destructive",
      })    }
  };

  const filteredItems = React.useMemo(() => {
    let filtered = [...users];

    if (filterValue) {
      const searchLower = filterValue.toLowerCase();
      filtered = filtered.filter(user =>
        user.name.toLowerCase().includes(searchLower) ||
        user.email.toLowerCase().includes(searchLower)
      );
    }

    return filtered;
  }, [users, filterValue]);

  const sortedItems = React.useMemo(() => {
    return [...filteredItems].sort((a, b) => {
      const first = a[sortDescriptor.column as keyof User] || "";
      const second = b[sortDescriptor.column as keyof User] || "";

      let cmp = 0;
      if (first < second) cmp = -1;
      if (first > second) cmp = 1;

      return sortDescriptor.direction === "descending" ? -cmp : cmp;
    });
  }, [filteredItems, sortDescriptor]);

  const paginatedItems = React.useMemo(() => {
    const start = (page - 1) * rowsPerPage;
    return sortedItems.slice(start, start + rowsPerPage);
  }, [sortedItems, page, rowsPerPage]);

  const pages = Math.ceil(filteredItems.length / rowsPerPage) || 1;

  const onNextPage = useCallback(() => {
    if (page < pages) setPage(page + 1);
  }, [page, pages]);

  const onPreviousPage = useCallback(() => {
    if (page > 1) setPage(page - 1);
  }, [page]);

  const onRowsPerPageChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    setRowsPerPage(Number(e.target.value));
    setPage(1);
  }, []);

  const topContent = React.useMemo(() => {
    return (
      <div className="flex justify-between items-center gap-4">
        <Input
          isClearable
          className="w-full max-w-[300px]"
          placeholder="Search by name or email"
          startContent={<SearchIcon className="h-4 w-5 text-muted-foreground" />}
          value={filterValue}
          onChange={(e) => setFilterValue(e.target.value)}
          onClear={() => setFilterValue("")}
        />
        <label className="flex items-center text-default-400 text-small">
          Rows per page:
          <select
            className="bg-transparent dark:bg-gray-800 outline-none text-default-400 text-small ml-2"
            onChange={onRowsPerPageChange}
            defaultValue="15"
          >
            <option value="5">5</option>
            <option value="10">10</option>
            <option value="15">15</option>
          </select>
        </label>
      </div>
    );
  }, [filterValue, onRowsPerPageChange, users.length]);

  const bottomContent = React.useMemo(() => {
    return (
      <div className="py-2 px-2 relative flex justify-between items-center">
        <span className="text-default-400 text-small">
          Total {users.length} users
        </span>

        {/* Centered Pagination */}
        <div className="absolute left-1/2 transform -translate-x-1/2">
          <Pagination
            isCompact
            showShadow
            color="success"
            page={page}
            total={pages}
            onChange={setPage}
            classNames={{
              cursor: "bg-[hsl(339.92deg_91.04%_52.35%)] shadow-md",
              item: "data-[active=true]:bg-[hsl(339.92deg_91.04%_52.35%)] data-[active=true]:text-white rounded-lg",
            }}
          />
        </div>

        {/* Navigation Buttons */}
        <div className="rounded-lg bg-default-100 hover:bg-default-200 hidden sm:flex w-[30%] justify-end gap-2">
          <Button
            className="bg-[hsl(339.92deg_91.04%_52.35%)]"
            variant="default"
            size="sm"
            disabled={page === 1}
            onClick={onPreviousPage}
          >
            Previous
          </Button>
          <Button
            className="bg-[hsl(339.92deg_91.04%_52.35%)]"
            variant="default"
            size="sm"
            disabled={page === pages}
            onClick={onNextPage}
          >
            Next
          </Button>
        </div>
      </div>
    );
  }, [page, pages, onPreviousPage, onNextPage, users.length]);

  const renderCell = useCallback((user: User, columnKey: string) => {
    if (columnKey === "actions") {
      return (
        <div className="relative flex items-center gap-2">
          <Tooltip>
            <span
              className="text-lg text-danger cursor-pointer active:opacity-50"
              onClick={(e) => {
                e.preventDefault();
                handleDelete(user._id);
              }}
            >
              <DeleteIcon className="h-6 w-6" />
            </span>
          </Tooltip>
        </div>
      );
    }
    return user[columnKey as keyof User];
  }, []);

  return (
    <SidebarProvider>
      <AdminSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
            <ModeToggle />
            <Separator orientation="vertical" className="mr-2 h-4" />
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbLink href="/admin/dashboard">
                    Dashboard
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator className="hidden md:block" />
                <BreadcrumbItem>
                  <BreadcrumbLink href="/admin/userform">
                    Create User
                  </BreadcrumbLink>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>
        <div className="container mx-auto py-10 px-4 sm:px-6 lg:px-8 pt-15">
          <Card className="max-w-6xl mx-auto">
            <CardHeader>
              <CardTitle className="text-3xl font-bold text-center">User Record</CardTitle>
            </CardHeader>
            <CardContent>
              {topContent}
              <Table>
                <TableHeader>
                  {columns.map((column) => (
                    <TableColumn key={column.uid}>{column.name}</TableColumn>
                  ))}
                </TableHeader>
                <TableBody emptyContent={"No users found"} items={paginatedItems}>
                  {(item) => (
                    <TableRow key={item._id}>
                      {(columnKey) => <TableCell style={{ fontSize: "12px", padding: "8px" }}>{renderCell(item, columnKey as string)}</TableCell>}
                    </TableRow>
                  )}
                </TableBody>
              </Table>
              {bottomContent}
            </CardContent>
          </Card>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}