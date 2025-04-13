'use client';
import React, { useEffect, useState, useCallback } from "react";
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Button } from "@/components/ui/button";
import { Loader2, SearchIcon, Edit2Icon, DeleteIcon, FileDown } from "lucide-react";
import { Input } from "@/components/ui/input";
import axios from "axios";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { Table, TableBody, TableCell, TableColumn, TableHeader, TableRow } from "@heroui/react";
import { ModeToggle } from "@/components/ModeToggle";
import { Pagination, Tooltip } from "@heroui/react";
import { AppSidebar } from "@/components/app-sidebar";

interface ContactPerson {
    firstName: string;
    middleName: string;
    lastName: string;
    contactNo: string;
    email: string;
    designation: string;
    _id: string;
    key?: string;

}

const generateUniqueId = () => {
    return Math.random().toString(36).substring(2) + Date.now().toString(36);
};

const columns = [
    { name: "FIRST NAME", uid: "firstName", sortable: true, width: "120px" },
    { name: "MIDDLE NAME", uid: "middleName", sortable: true, width: "120px" },
    { name: "LAST NAME", uid: "lastName", sortable: true, width: "120px" },
    { name: "CONTACT NO", uid: "contactNo", sortable: true, width: "120px" },
    { name: "EMAIL", uid: "email", sortable: true, width: "120px" },
    { name: "DESIGNATION", uid: "designation", sortable: true, width: "120px" },
];

const INITIAL_VISIBLE_COLUMNS = ["firstName", "middleName", "lastName", "contactNo", "email", "designation",];

export default function ContactPersonDetailsTable() {
    const [contactPersons, setContactPersons] = useState<ContactPerson[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [selectedKeys, setSelectedKeys] = useState<Set<string>>(new Set([]));
    const [visibleColumns, setVisibleColumns] = useState<Set<string>>(new Set(INITIAL_VISIBLE_COLUMNS));
    const [rowsPerPage, setRowsPerPage] = useState(15);
    const [page, setPage] = useState(1);
    const [filterValue, setFilterValue] = useState<string>("");

    const [isDownloading, setIsDownloading] = useState<boolean | null>(null);
    const [sortDescriptor, setSortDescriptor] = useState({
        column: "firstName",
        direction: "ascending",
    });

    const router = useRouter();
    const hasSearchFilter = Boolean(filterValue);


    const fetchContactPersons = async () => {
        try {
            const response = await axios.get(
                `http://localhost:5000/api/v1/contactperson/getContactPersons`,
                {
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${localStorage.getItem("token")}`,
                    },
                }
            );
            let contactPersonsData = response.data.data || [];

            setContactPersons(prev => [...contactPersonsData, ...prev]);

            setError(null);
        } catch (error) {
            console.error("Error fetching contact persons:", error);
            setError("Failed to fetch contact persons. Please try again.");
            setContactPersons([]);
        }
    };


    const handleDelete = async (contactPersonId: string) => {
        if (!window.confirm("Are you sure you want to delete this contact person?")) {
            return;
        }

        try {
            await axios.delete(
                `http://localhost:5000/api/v1/contactperson/deleteContactPerson/${contactPersonId}`,
                {
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${localStorage.getItem("token")}`,
                    },
                }
            );

            setContactPersons(prev => prev.filter(contact => contact._id !== contactPersonId));
            toast.success("Contact person deleted successfully");
        } catch (error) {
            console.error("Error deleting contact person:", error);
            toast.error("Failed to delete contact person");
        }
    };

    const filteredItems = React.useMemo<ContactPerson[]>(() => {
        let filtered = [...contactPersons];

        if (hasSearchFilter) {
            const searchLower = filterValue.toLowerCase();
            filtered = filtered.filter(contact =>
                contact.firstName.toLowerCase().includes(searchLower) ||
                contact.middleName.toLowerCase().includes(searchLower) ||
                contact.lastName.toLowerCase().includes(searchLower) ||
                contact.contactNo.toLowerCase().includes(searchLower) ||
                contact.email.toLowerCase().includes(searchLower)
            );
        }

        return filtered;
    }, [contactPersons, filterValue, hasSearchFilter]);

    const sortedItems = React.useMemo(() => {
        return [...filteredItems].sort((a, b) => {
            const first = a[sortDescriptor.column as keyof ContactPerson] || "";
            const second = b[sortDescriptor.column as keyof ContactPerson] || "";

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
            <div className="flex justify-between gap-3 items-end">
                <Input
                                    isClearable
                                    className="w-full max-w-[300px]"
                                    placeholder="Search by name or GST"
                                    startContent={<SearchIcon className="h-4 w-5 text-muted-foreground" />}
                                    value={filterValue}
                                    onChange={(e) => setFilterValue(e.target.value)}
                                    onClear={() => setFilterValue("")}
                                />
                <label className="flex items-center text-default-400 text-small">
                    Rows per page:
                    <select
                        className="bg-transparent dark:bg-gray-800 outline-none text-default-400 text-small"
                        onChange={onRowsPerPageChange}
                        defaultValue="5"
                    >
                        <option value="5">5</option>
                        <option value="10">10</option>
                        <option value="15">15</option>
                    </select>
                </label>
            </div>
        );
    }, [filterValue, onRowsPerPageChange, contactPersons.length]);

    const bottomContent = React.useMemo(() => {
        return (
            <div className="py-2 px-2 flex justify-between items-center">
                <span className="text-default-400 text-small">
                    Total {contactPersons.length} contacts
                </span>
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
    }, [page, pages, onPreviousPage, onNextPage]);

    const renderCell = useCallback((contact: ContactPerson, columnKey: string) => {
        if (columnKey === "actions") {
            return (
                <div className="relative flex items-center gap-2">
                    <Tooltip>
                        <span
                            className="text-lg text-danger cursor-pointer"
                            onClick={() => handleDelete(contact._id)}
                        >
                            <DeleteIcon />
                        </span>
                    </Tooltip>

                    <Tooltip>
                        <span
                            className="text-lg text-info cursor-pointer active:opacity-50"
                            onClick={(e) => {
                                e.preventDefault();
                                router.push(`admincustomer?id=${contact._id}`);
                            }}
                        >
                            <Edit2Icon className="h-6 w-6" />
                        </span>
                    </Tooltip>
                </div>
            );
        }
        return contact[columnKey as keyof ContactPerson];
    }, []);

    useEffect(() => {
        fetchContactPersons();
    }, []);

    return (
        <SidebarProvider>
            <AppSidebar />
            <SidebarInset>
                <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
                    <div className="flex items-center gap-2 px-4">
                        <SidebarTrigger className="-ml-1" />
                        <ModeToggle />
                        <Separator orientation="vertical" className="mr-2 h-4" />
                        <Breadcrumb>
                            <BreadcrumbList>
                                <BreadcrumbLink href="/admin/dashboard">
                                    Dashboard
                                </BreadcrumbLink>
                                <BreadcrumbSeparator className="hidden md:block" />
                                <BreadcrumbItem>
                                    <BreadcrumbLink href="/admin/contactform">
                                        Create Contact
                                    </BreadcrumbLink>
                                </BreadcrumbItem>
                            </BreadcrumbList>
                        </Breadcrumb>
                    </div>
                </header>
                <div className="container mx-auto py-10 px-4 sm:px-6 lg:px-8 pt-15">
                    <Card className="max-w-6xl mx-auto">
                        <CardHeader>
                            <CardTitle className="text-3xl font-bold text-center">Contact Record</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {topContent}
                            <Table>
                                <TableHeader>
                                    {columns.map((column) => (
                                        <TableColumn key={column.uid}>{column.name}</TableColumn>
                                    ))}
                                </TableHeader>
                                <TableBody emptyContent={"No companies found"} items={paginatedItems}>
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