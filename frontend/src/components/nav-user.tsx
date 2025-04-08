"use client"

import { ChevronsUpDown, LogOut, Edit, Loader2 } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { SidebarMenu, SidebarMenuButton, SidebarMenuItem, useSidebar } from "@/components/ui/sidebar"
import { useState, useEffect } from "react"
import axios from "axios"
import Link from "next/link"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useForm } from 'react-hook-form';


interface User {
  _id: string
  name: string
  email: string
  contact: number
  password: string
}

export function NavUser() {
  const { isMobile } = useSidebar()
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [open, setOpen] = useState(false);
  const [dialogKey, setDialogKey] = useState(0);
  const [editUser, setEditUser] = useState<User | null>(null);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [users, setUsers] = useState<User[]>([]);

  const form = useForm<User>({
    defaultValues: {
      name: '',
      email: '',
      contact: '',
      password: '',
    }
  })
  useEffect(() => {
    const fetchUser = async () => {
      try {
        setLoading(true)
        const userId = typeof window !== "undefined" ? localStorage.getItem("userId") : null

        if (!userId) {
          setError("User ID not found")
          return
        }

        const response = await axios.get(`http://localhost:5000/api/v1/users/getuser/${userId}`)
        setCurrentUser(response.data)
      } catch (err) {
        setError("Failed to fetch user data.")
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    fetchUser()
  }, [])

  const handleEditClick = (user: User) => {
    setEditUser(user);
    setIsEditing(true);
    setOpen(false);
    form.reset(user);
  };

  const onSubmit = async (data: User) => {
    setIsSubmitting(true);
    try {
      const response = await axios.put(
        `http://localhost:5000/api/v1/users/updateuser/${editUser?._id}`,
        {
          name: data.name,
          email: data.email,
          contact: data.contact,
          password: data.password
        },
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
      setCurrentUser(response.data.user);
      setIsEditing(false);
      setEditUser(null);

      const userId = localStorage.getItem("userId");
      if (userId) {
        const userResponse = await axios.get(`http://localhost:5000/api/v1/users/getuser/${userId}`);
        setCurrentUser(userResponse.data);
      }
    } catch (error) {
      console.error("Failed to update user:", error);
      setError("Failed to update user. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };


  if (loading) return <div>Loading...</div>
  if (error) return <div>Error: {error}</div>
  if (!currentUser) return <div>No user data</div>

  return (
    <>
      <SidebarMenu>
        <SidebarMenuItem>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <SidebarMenuButton
                size="lg"
                className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
              >
                <Avatar className="h-8 w-8 rounded-lg">
                  <AvatarFallback className="rounded-lg">
                    {currentUser?.name?.charAt(0).toUpperCase() || "U"}
                  </AvatarFallback>
                </Avatar>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">{currentUser?.name || "User"}</span>
                  <span className="truncate text-xs">{currentUser?.email || "No Email"}</span>
                </div>
                <ChevronsUpDown className="ml-auto size-4" />
              </SidebarMenuButton>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
              side={isMobile ? "bottom" : "right"}
              align="end"
              sideOffset={4}
            >
              <DropdownMenuItem asChild>
                <button
                  onClick={() => {
                    setOpen(false);
                    setTimeout(() => setOpen(true), 100);
                  }}
                  className="w-full text-left"

                >
                  <Dialog key={dialogKey} open={open} onOpenChange={setOpen}>
                    <DropdownMenuLabel className="p-0 font-normal">
                      <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                        <Avatar className="h-8 w-8 rounded-lg">
                          <AvatarFallback className="rounded-lg">
                            {currentUser?.name?.charAt(0).toUpperCase() || "U"}
                          </AvatarFallback>
                        </Avatar>
                        <div className="grid flex-1 text-left text-sm leading-tight">
                          <span className="truncate font-semibold">{currentUser?.name || "User"}</span>
                          <span className="truncate text-xs">{currentUser?.email || "No Email"}</span>
                        </div>
                      </div>
                    </DropdownMenuLabel>
                  </Dialog>
                </button>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <LogOut />
                <Link href="/login">Log out</Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </SidebarMenuItem>
      </SidebarMenu>


      <Dialog open={open} onOpenChange={(open) => {
        if (!open) {
          setOpen(false);
        }
      }}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto hide-scrollbar"
          onInteractOutside={(e) => {
            e.preventDefault();
          }
          } >
          <DialogHeader>
            <DialogTitle className="text-center">Company Profile</DialogTitle>
          </DialogHeader>
          {error ? (
            <div className="text-center text-red-500 py-4">{error}</div>
          ) : currentUser ? (
            <div className="space-y-6">
              <div className="flex flex-col items-center gap-4">
                <div className="relative">
                  <Avatar className="h-24 w-24 md:h-32 md:w-32 border-2 border-gray-200">

                    <AvatarFallback className="text-xl">
                      {currentUser.name?.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <CardContent className="space-y-2">
                  <div>
                    <p className="text-xs text-gray-400">Name</p>
                    <p>{currentUser.name}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">Email</p>
                    <p>{currentUser.email}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">Phone</p>
                    <p>{currentUser.contact}</p>
                  </div>
                </CardContent>
              </div>

              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setOpen(false)}>
                  Close
                </Button>
                <Button onClick={() => handleEditClick(currentUser)}>
                  <Edit className="mr-2 h-4 w-4" />
                  Edit Profile
                </Button>
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              No profile information available
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={isEditing} onOpenChange={(open) => {
        if (!open) {
          setIsEditing(false);
        }
      }}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto hide-scrollbar"
          onInteractOutside={(e) => {
            e.preventDefault();
          }}>
          <DialogHeader>
            <DialogTitle>Edit Profile</DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>User Name</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email Address</FormLabel>
                      <FormControl>
                        <Input type="email" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="contact"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Contact Number</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="flex justify-end gap-2 pt-4">
                <Button variant="outline" onClick={() => setIsEditing(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    "Save Changes"
                  )}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </>
  )
}