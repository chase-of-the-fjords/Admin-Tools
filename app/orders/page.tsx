"use client";

import Link from "next/link";

import {
  getOrders,
  getCompanies,
  createOrder,
  deleteOrder,
  editOrder,
  getLoginInfo,
  createCompany,
  editCompany,
  deleteCompany,
} from "./interface/interface.js";

import { useEffect, useState, useMemo, useContext, createContext } from "react";

import { Button } from "@/components/ui/button";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import z from "zod";

import { compile, evaluate } from "mathjs";

const ReloadContext = createContext<Function>(() => {});
const DataContext = createContext<{
  companies: CompanyType[];
  orders: OrderType[];
}>({ companies: [], orders: [] });
const UserContext = createContext<{ user: UserType; setUser: Function }>({
  user: {
    name: "",
    id: 0,
    password: "",
    active: 0,
  },
  setUser: () => {},
});

type CompanyType = {
  id: number;
  name: string;
  image: any;
  priority: number;
  notes: string;
  log: any;
};

type OrderType = {
  order_id: number;
  name: string;
  company: number;
  category: number;
  quantity: number;
  completed: number;
  priority: number;
  notes: string;
  start: any;
  end: any;
  log: any;
  id: string;
};

type UserType = {
  id: number;
  name: string;
  password: string;
  active: number;
};

export default function Orders() {
  const [user, setUser] = useState<UserType>({
    name: "",
    id: 0,
    password: "",
    active: 0,
  });

  const [orders, setOrders] = useState<OrderType[]>([]);
  const [companies, setCompanies] = useState<CompanyType[]>([]);

  async function reload() {
    await getOrders({ setOrders });
    await getCompanies({ setCompanies });
  }

  useEffect(() => {
    reload();

    const interval = setInterval(() => {
      reload();
    }, 60000);

    return () => clearInterval(interval);
  }, []);

  return (
    <DataContext.Provider value={{ orders, companies }}>
      <ReloadContext.Provider value={reload}>
        <UserContext.Provider value={{ user: user, setUser: setUser }}>
          <Menu />
          <OrderList />
        </UserContext.Provider>
      </ReloadContext.Provider>
    </DataContext.Provider>
  );
}

// The menu bar component.
function Menu() {
  const { user, setUser } = useContext(UserContext);
  const { orders } = useContext(DataContext);
  const [openPopup, setOpenPopup] = useState(false);
  const [invalidLogin, setInvalidLogin] = useState(false);

  const [createCompanyOpen, setCreateCompanyOpen] = useState(false);

  const formSchema = z.object({
    password: z.string(),
  });

  type FormType = z.infer<typeof formSchema>;

  const form = useForm<FormType>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      password: "",
    },
  });

  useEffect(() => {
    form.reset();
    setInvalidLogin(false);
  }, [openPopup]);

  const onSubmit = async (data: FormType) => {
    let newUser: UserType = await getLoginInfo({
      user: { password: data.password },
      setUser,
    });
    if (newUser.active == 1) {
      setOpenPopup(false);
      setInvalidLogin(false);
    } else {
      setInvalidLogin(true);
    }
  };

  const totalOpenOrders = useMemo(() => {
    let total = 0;
    orders.forEach((order) => {
      total += order.quantity - order.completed;
    });
    return total;
  }, [orders]);

  return (
    <>
      <div className="invisible h-8 font-RobotoMono" />
      <div className="fixed top-0 z-10 w-screen h-8 m-auto shadow-xl bg-cool-grey-50">
        <div className="relative max-w-[1000px] mx-auto">
          {user.active == 1 ? (
            <div className="absolute invisible w-full mx-auto mt-1 text-lg font-semibold text-center sm:visible top-4">{`${user.name} is currently editing`}</div>
          ) : (
            <div className="absolute invisible w-full mx-auto mt-1 text-lg font-semibold text-center sm:visible top-4">{`${totalOpenOrders} open orders`}</div>
          )}
          <Link href="./" className="absolute">
            <img src="./inverted-logo.png" className="mt-2 ml-4 h-7" />
          </Link>
          {user.active == 0 ? (
            <Dialog open={openPopup} onOpenChange={setOpenPopup}>
              <DialogTrigger asChild>
                <span className="absolute mt-1 mr-6 font-semibold transition-colors cursor-pointer right-1 top-4 hover:text-cool-grey-900 text-cool-grey-500">
                  Log in
                </span>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px] bg-white">
                <DialogHeader>
                  <DialogTitle>Log in</DialogTitle>
                </DialogHeader>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)}>
                    {/* PASSWORD */}
                    <FormField
                      name="password"
                      control={form.control}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel htmlFor="password" className="text-left">
                            Password <span className="text-red-500">*</span>
                          </FormLabel>
                          <FormControl>
                            <div>
                              <Input
                                {...form.register("password")}
                                placeholder="abc123"
                                type="password"
                                onFocus={(e) => e.target.select()}
                                autoComplete="new-password"
                              />
                              <FormMessage className="mt-2">
                                {invalidLogin && "Invalid login"}
                              </FormMessage>
                            </div>
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    <DialogFooter className="mt-4">
                      <Button type="submit">Submit</Button>
                    </DialogFooter>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          ) : (
            <div>
              <DropdownMenu>
                <DropdownMenuTrigger className="absolute mt-1 mr-6 font-semibold transition-colors cursor-pointer right-1 top-4 hover:text-cool-grey-900 text-cool-grey-500">
                  Menu
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem
                    onClick={() =>
                      setUser({ id: 0, name: "", password: "", active: 0 })
                    }
                  >
                    Log Out
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setCreateCompanyOpen(true)}>
                    Create Company
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          )}
        </div>
        <CreateCompanyForm
          isOpen={createCompanyOpen}
          setOpen={setCreateCompanyOpen}
        />
      </div>
    </>
  );
}

function OrderList() {
  const reload = useContext(ReloadContext);
  const { user, setUser } = useContext(UserContext);
  const { companies, orders }: any = useContext(DataContext);

  return (
    <div className="flex flex-wrap justify-center px-2 mx-auto mt-6 mb-6 gap-x-6 gap-y-4">
      {companies.map((company: CompanyType) => {
        return (
          <Company
            company={company}
            orders={orders.filter((order: OrderType) => {
              if (user.active) return order.company == company.id;
              return order.company == company.id && order.end == null;
            })}
            key={company.id}
          />
        );
      })}
    </div>
  );
}

function Company({
  company,
  orders,
}: {
  company: CompanyType;
  orders: OrderType[];
}) {
  const { user, setUser } = useContext(UserContext);

  const [editCompanyOpen, setEditCompanyOpen] = useState(false);

  const sortedOrders = useMemo(() => {
    return orders.sort((a: OrderType, b: OrderType) => {
      if (a.end == null && b.end != null) return -1;
      else if (a.end != null && b.end == null) return 1;
      else if (a.priority > b.priority) return -1;
      else if (a.priority < b.priority) return 1;
      else if (a.name < b.name) return -1;
      else if (a.name > b.name) return 1;
      else if (a.quantity > b.quantity) return -1;
      else return 1;
    });
  }, [orders]);

  const sortedPutters = useMemo(() => {
    return sortedOrders.filter((order) => { return order.category == 0 });
  }, [sortedOrders])
  
  const sortedAccessories = useMemo(() => {
    return sortedOrders.filter((order) => { return order.category == 1 });
  }, [sortedOrders])

  const totalOpenOrders = useMemo(() => {
    let total = 0;
    orders.forEach((order) => {
      if (order.end == null) total += order.quantity - order.completed;
    });
    return total;
  }, [orders]);

  const totalOpenPutters = useMemo(() => {
    let total = 0;
    sortedPutters.forEach((order) => {
      if (order.end == null) total += order.quantity - order.completed;
    });
    return total;
  }, [sortedPutters]);

  const totalOpenAccessories = useMemo(() => {
    let total = 0;
    sortedAccessories.forEach((order) => {
      if (order.end == null) total += order.quantity - order.completed;
    });
    return total;
  }, [sortedAccessories]);

  return (
    <>
      {orders.length > 0 || user.active ? (
        <div className="w-13 h-fit font-inter">
          {/* Logo & button */}
          <div className="relative mb-4 h-fit">
            <div className="h-[48px]">
              <HoverCard >
                <HoverCardTrigger asChild>
                  {company.image != "" ? (
                    <img
                      src={`${company.image}`}
                      className={`absolute bottom-0 h-[32px] ${
                        (user.active || company.notes) && "cursor-pointer"
                      }`}
                      alt={company.name}
                      onClick={() => {
                        if (user.active) setEditCompanyOpen(true);
                      }}
                    />
                  ) : (
                    <h3
                      className={`absolute bottom-0 text-2xl font-semibold align-bottom ${
                        (user.active || company.notes) && "cursor-pointer"
                      }`}
                      onClick={() => {
                        if (user.active) setEditCompanyOpen(true);
                      }}
                    >
                      {company.name}
                    </h3>
                  )}
                </HoverCardTrigger>
                {company.notes != "" && <HoverCardContent className="w-80">
                  <div className="text-sm whitespace-pre-line">{company.notes}</div>
                </HoverCardContent>}
              </HoverCard>
              {user.active == 1 && <CreateOrderForm company={company} />}
            </div>
          </div>
          {sortedPutters.length > 0 && <div className="mb-2 ml-2 text-xl font-semibold text-center">
            {totalOpenPutters} putter{totalOpenPutters == 1 ? "" : "s"}
          </div>}
          {sortedPutters.map((order) => {
            return (
              <Order company={company} order={order} key={order.order_id} />
            );
          })}
          {sortedAccessories.length > 0 && <div className="mb-2 ml-2 text-xl font-semibold text-center">
            {totalOpenAccessories} {totalOpenAccessories == 1 ? "accessory" : "accessories"}
          </div>}
          {sortedAccessories.map((order) => {
            return (
              <Order company={company} order={order} key={order.order_id} />
            );
          })}
          {/* <div className="text-xl font-semibold text-center">
            {totalOpenOrders} open orders
          </div> */}
          <EditCompanyForm
            company={company}
            isOpen={editCompanyOpen}
            setOpen={setEditCompanyOpen}
          />
        </div>
      ) : (
        <></>
      )}
    </>
  );
}

function Order({ company, order }: { company: CompanyType; order: OrderType }) {
  const reload = useContext(ReloadContext);
  const { user, setUser } = useContext(UserContext);
  const { companies }: any = useContext(DataContext);

  const [openPopup, setOpenPopup] = useState(false);

  const companyNames = companies.map((c: CompanyType) => c.name);
  const CompanyEnum = z.enum(companyNames, {
    required_error: "Company is required",
    message: "Company must be chosen from list",
  });

  type PriorityEnum = "Low" | "Medium" | "High";
  type CategoryEnum = "Putter" | "Accessory";

  const isOldJob = useMemo(() => {
    return order.end != null;
  }, [order]);

  let defaultPriority: PriorityEnum = useMemo(() => {
    if (order.priority == 0) return "Low";
    else if (order.priority == 2) return "High";
    else return "Medium";
  }, [order]);

  let defaultCategory: CategoryEnum = useMemo(() => {
    if (order.category == 1) return "Accessory";
    return "Putter";
  }, [order])

  const formSchema = z.object({
    company: CompanyEnum,
    category: z.enum(["Putter", "Accessory"], {
      invalid_type_error: "Invalid input",
    }),
    name: z.string().min(2, {
      message: "Minimum 2 characters",
    }),
    id: z.optional(z.string()),
    completed: z.preprocess((a) => {
      try {
        if (typeof a == "number") return a;
        return evaluate(z.string().parse(a));
      } catch (e) {
        return undefined;
      }
    }, z.number({ message: "Number is required" }).min(0, { message: "Value cannot be negative" })),
    total: z.preprocess((a) => {
      try {
        if (typeof a == "number") return a;
        return evaluate(z.string().parse(a));
      } catch (e) {
        return undefined;
      }
    }, z.number({ message: "Number is required" }).min(0, { message: "Value cannot be negative" })),
    priority: z.optional(
      z.enum(["Low", "Medium", "High"], {
        invalid_type_error: "Invalid input",
      })
    ),
    notes: z.optional(z.string()),
  });

  type FormType = z.infer<typeof formSchema>;

  const form = useForm<FormType>({
    resolver: zodResolver(formSchema),
    defaultValues: useMemo(() => {
      return {
        company: company.name,
        category: defaultCategory,
        name: order.name,
        id: order.id,
        completed: order.completed,
        total: order.quantity,
        priority: defaultPriority,
        notes: order.notes,
      };
    }, [company, order]),
  });

  const onSubmit = async (data: FormType) => {
    let priority = 1;
    if (data.priority == "Low") priority = 0;
    else if (data.priority == "High") priority = 2;

    let category = 0;
    if (data.category == "Accessory") category = 1;

    let editedOrder = {
      name: data.name,
      company: companies.find((c: CompanyType) => data.company == c.name).id,
      category: category,
      quantity: data.total,
      completed: data.completed,
      priority: priority,
      notes: data.notes,
      id: data.id,
      order_id: order.order_id,
    };

    await editOrder({ order: editedOrder, originalOrder: order, user });
    setOpenPopup(false);
    await reload();
  };

  let priorityStyle = "border-l-yellow-500";

  if (order.priority == 1) priorityStyle = "border-l-blue-500";
  else if (order.priority == 2) priorityStyle = "border-l-red-500";

  useEffect(() => {
    if (openPopup)
      form.reset({
        company: company.name,
        category: defaultCategory,
        name: order.name,
        id: order.id,
        completed: order.completed,
        total: order.quantity,
        priority: defaultPriority,
        notes: order.notes,
      });
  }, [openPopup]);

  return user.active == 1 ? (
    <Dialog open={openPopup} onOpenChange={setOpenPopup}>
      <DialogTrigger asChild>
        <div
          className={`${priorityStyle} relative bg-cool-grey-50 mb-4 w-13 h-[80px] rounded-md border-l-8 transition-all cursor-pointer ${
            isOldJob
              ? "opacity-75 shadow-inner cursor-not-allowed"
              : "shadow-md hover:shadow-lg hover:-translate-y-1"
          }`}
        >
          {/* Name and number */}
          <div className="absolute align-top top-3 left-3">
            <span className="text-xl font-semibold">{order.name} </span>
            {order.id != "" && (
              <span className="text-md text-cool-grey-600">#{order.id}</span>
            )}
          </div>
          {/* Quantity open */}
          <div className="absolute align-bottom bottom-3 left-3">
            <span className="text-xl font-semibold">
              {order.quantity - order.completed}{" "}
            </span>
            <span className="text-md text-cool-grey-600">open</span>
          </div>
          {/* Right side */}
          <div className="absolute pb-[1px] align-bottom bottom-3 right-3">
            <span className="text-md">
              {order.completed}/{order.quantity}{" "}
            </span>
            <span className="text-sm text-cool-grey-600">delivered</span>
          </div>
          {/* Notes icon */}
          {order.notes != "" && (
            <div className="absolute top-2 right-3 fill-cool-grey-600">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                height="24"
                viewBox="0 -960 960 960"
                width="24"
              >
                <path d="M120-240v-80h480v80H120Zm0-200v-80h720v80H120Zm0-200v-80h720v80H120Z" />
              </svg>
            </div>
          )}
        </div>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] bg-white">
        <DialogHeader>
          <DialogTitle>Edit order</DialogTitle>
          <DialogDescription>Edit an order.</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <div className="grid grid-cols-4 gap-4 py-4">
              {/* PART NAME */}
              <FormField
                name="name"
                control={form.control}
                render={({ field }) => (
                  <FormItem className="col-span-4">
                    <FormLabel htmlFor="name" className="text-left">
                      Part <span className="text-red-500">*</span>
                    </FormLabel>
                    <FormControl>
                      <div>
                        <Input
                          {...form.register("name")}
                          placeholder="ER2"
                          onFocus={(e) => e.target.select()}
                        />
                        <FormMessage className="mt-2" />
                      </div>
                    </FormControl>
                  </FormItem>
                )}
              />

              {/* COMPANY */}
              <FormField
                name="company"
                control={form.control}
                render={({ field }) => (
                  <FormItem className="col-span-2">
                    <Label htmlFor="company" className="text-left">
                      Company <span className="text-red-500">*</span>
                    </Label>
                    <FormControl>
                      <div>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={company.name}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Company" />
                          </SelectTrigger>
                          <SelectContent>
                            {companies.map((c: CompanyType) => (
                              <SelectItem value={c.name} key={c.id}>
                                {c.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage className="mt-2" />
                      </div>
                    </FormControl>
                  </FormItem>
                )}
              />

              {/* CATEGORY */}
              <FormField
                name="category"
                control={form.control}
                render={({ field }) => (
                  <FormItem className="col-span-2">
                    <Label htmlFor="category" className="text-left">
                      Category <span className="text-red-500">*</span>
                    </Label>
                    <FormControl>
                      <div>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={defaultCategory}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Category" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Putter">
                              Putter
                            </SelectItem>
                            <SelectItem value="Accessory">
                              Accessory
                            </SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage className="mt-2" />
                      </div>
                    </FormControl>
                  </FormItem>
                )}
              />

              {/* TOTAL COMPLETED */}
              <FormField
                name="completed"
                control={form.control}
                render={({ field }) => (
                  <FormItem className="col-span-2">
                    <FormLabel className="text-right">
                      Delivered <span className="text-red-500">*</span>
                    </FormLabel>
                    <FormControl>
                      <div>
                        <Input
                          {...form.register("completed", {
                            required: true,
                          })}
                          type="text"
                          onFocus={(e) => e.target.select()}
                        />
                        <FormMessage className="mt-2" />
                      </div>
                    </FormControl>
                  </FormItem>
                )}
              />

              {/* TOTAL QUANTITY */}
              <FormField
                name="total"
                control={form.control}
                render={({ field }) => (
                  <FormItem className="col-span-2">
                    <FormLabel className="text-right">
                      Quantity <span className="text-red-500">*</span>
                    </FormLabel>
                    <FormControl>
                      <div>
                        <Input
                          {...form.register("total", {
                            required: true,
                          })}
                          type="text"
                          placeholder="2000"
                          onFocus={(e) => e.target.select()}
                        />
                        <FormMessage className="mt-2" />
                      </div>
                    </FormControl>
                  </FormItem>
                )}
              />

              {/* ID NUMBER (Optional) */}
              <FormField
                name="id"
                control={form.control}
                render={({ field }) => (
                  <FormItem className="col-span-2">
                    <FormLabel>ID Number</FormLabel>
                    <FormControl className="col-span-3">
                      <div>
                        <Input
                          {...form.register("id")}
                          placeholder="1234"
                          onFocus={(e) => e.target.select()}
                        />
                        <FormMessage className="mt-2" />
                      </div>
                    </FormControl>
                  </FormItem>
                )}
              />

              {/* PRIORITY (LOW, MEDIUM, HIGH) */}
              <FormField
                name="priority"
                control={form.control}
                render={({ field }) => (
                  <FormItem className="col-span-2">
                    <Label htmlFor="priority">Priority</Label>
                    <FormControl>
                      <div>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={defaultPriority}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="High">High</SelectItem>
                            <SelectItem value="Medium">Medium</SelectItem>
                            <SelectItem value="Low">Low</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage className="mt-2" />
                      </div>
                    </FormControl>
                  </FormItem>
                )}
              />

              {/* NOTES */}
              <FormField
                name="notes"
                control={form.control}
                render={({ field }) => (
                  <FormItem className="col-span-4">
                    <FormLabel>Notes</FormLabel>
                    <FormControl className="col-span-3">
                      <div>
                        <Textarea
                          {...form.register("notes")}
                          placeholder=""
                          defaultValue={order.notes}
                          onFocus={(e) => e.target.select()}
                        />
                        <FormMessage className="mt-2" />
                      </div>
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>
            <DialogFooter className="gap-2">
              {isOldJob || (
                <Button
                  type="button"
                  variant="destructive"
                  onClick={async () => {
                    await deleteOrder({
                      order: order,
                      user: user,
                    });
                    setOpenPopup(false);
                    reload();
                  }}
                >
                  Delete
                </Button>
              )}
              <Button type="submit">{isOldJob ? "Restore" : "Save"}</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  ) : (
    <HoverCard>
      <HoverCardTrigger asChild>
        <div
          className={`${priorityStyle} relative mb-4 w-13 h-[80px] bg-cool-grey-50 rounded-md border-l-8 shadow-md transition-all cursor-pointer hover:shadow-lg`}
        >
          {/* Name and number */}
          <div className="absolute align-top top-3 left-3">
            <span className="text-xl font-semibold">{order.name} </span>
            {order.id != "" && (
              <span className="text-md text-cool-grey-600">#{order.id}</span>
            )}
          </div>
          {/* Quantity open */}
          <div className="absolute align-bottom bottom-3 left-3">
            <span className="text-xl font-semibold">
              {order.quantity - order.completed}{" "}
            </span>
            <span className="text-md text-cool-grey-600">open</span>
          </div>
          {/* Right side */}
          <div className="absolute pb-[1px] align-bottom bottom-3 right-3">
            <span className="text-md">
              {order.completed}/{order.quantity}{" "}
            </span>
            <span className="text-sm text-cool-grey-600">delivered</span>
          </div>
          {/* Notes icon */}
          {order.notes != "" && (
            <div className="absolute top-2 right-3 fill-cool-grey-600">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                height="24"
                viewBox="0 -960 960 960"
                width="24"
              >
                <path d="M120-240v-80h480v80H120Zm0-200v-80h720v80H120Zm0-200v-80h720v80H120Z" />
              </svg>
            </div>
          )}
        </div>
      </HoverCardTrigger>
      {order.notes != "" && (
        <HoverCardContent className="w-80 bg-cool-grey-50">
          <p className="text-sm whitespace-pre-line">{order.notes}</p>
        </HoverCardContent>
      )}
    </HoverCard>
  );
}

function CreateOrderForm({ company }: { company: CompanyType }) {
  const reload = useContext(ReloadContext);
  const { user, setUser } = useContext(UserContext);
  const { companies }: any = useContext(DataContext);

  const [openPopup, setOpenPopup] = useState(false);

  const companyNames = companies.map((c: CompanyType) => c.name);
  const CompanyEnum = z.enum(companyNames, {
    required_error: "Company is required",
    message: "Company must be chosen from list",
  });

  const formSchema = z.object({
    company: CompanyEnum,
    category: z.enum(["Putter", "Accessory"], {
      invalid_type_error: "Invalid input",
    }),
    name: z.string().min(2, {
      message: "Minimum 2 characters",
    }),
    id: z.optional(z.string()),
    completed: z.preprocess((a) => {
      try {
        if (typeof a == "number") return a;
        return evaluate(z.string().parse(a));
      } catch (e) {
        return undefined;
      }
    }, z.number({ message: "Number is required" }).min(0, { message: "Value cannot be negative" })),
    total: z.preprocess((a) => {
      try {
        if (typeof a == "number") return a;
        return evaluate(z.string().parse(a));
      } catch (e) {
        return undefined;
      }
    }, z.number({ message: "Number is required" }).min(0, { message: "Value cannot be negative" })),
    priority: z.optional(
      z.enum(["Low", "Medium", "High"], {
        invalid_type_error: "Invalid input",
      })
    ),
    notes: z.optional(z.string()),
  });

  type FormType = z.infer<typeof formSchema>;

  const form = useForm<FormType>({
    resolver: zodResolver(formSchema),
    defaultValues: useMemo(() => {
      return {
        company: company.name,
        category: undefined,
        name: undefined,
        id: undefined,
        completed: 0,
        total: undefined,
        priority: undefined,
        notes: undefined,
      };
    }, [company]),
  });

  useEffect(() => {
    form.reset();
  }, [openPopup]);

  const onSubmit = async (data: FormType) => {
    let priority = 1;
    if (data.priority == "Low") priority = 0;
    else if (data.priority == "High") priority = 2;
    
    let category = 0;
    if (data.category == "Accessory") category = 1;

    let order = {
      name: data.name,
      company: company.id,
      category: category,
      quantity: data.total,
      completed: data.completed,
      priority: priority,
      notes: data.notes,
      id: data.id,
    };

    await createOrder({ order, user });
    setOpenPopup(false);
    reload();
  };

  return (
    <Dialog open={openPopup} onOpenChange={setOpenPopup}>
      <DialogTrigger asChild>
        <span className="absolute bottom-0 right-0 inline-block text-lg font-medium transition-all text-cool-grey-600 hover:cursor-pointer hover:text-cool-grey-900">
          + New
        </span>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] bg-white">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <DialogHeader>
              <DialogTitle>Create order</DialogTitle>
              <DialogDescription>Create an order.</DialogDescription>
            </DialogHeader>
            <div className="grid grid-cols-4 gap-4 py-4">
              {/* PART NAME */}
              <FormField
                name="name"
                control={form.control}
                render={({ field }) => (
                  <FormItem className="col-span-4">
                    <FormLabel htmlFor="name" className="text-left">
                      Part <span className="text-red-500">*</span>
                    </FormLabel>
                    <FormControl>
                      <div>
                        <Input
                          {...form.register("name")}
                          onFocus={(e) => e.target.select()}
                          placeholder="ER2"
                        />
                        <FormMessage className="mt-2" />
                      </div>
                    </FormControl>
                  </FormItem>
                )}
              />

              {/* COMPANY */}
              <FormField
                name="company"
                control={form.control}
                render={({ field }) => (
                  <FormItem className="col-span-2">
                    <Label htmlFor="company" className="text-left">
                      Company <span className="text-red-500">*</span>
                    </Label>
                    <FormControl>
                      <div>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={company.name}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Company" />
                          </SelectTrigger>
                          <SelectContent>
                            {companies.map((c: CompanyType) => {
                              return (
                                <SelectItem value={c.name} key={c.id}>
                                  {c.name}
                                </SelectItem>
                              );
                            })}
                          </SelectContent>
                        </Select>
                        <FormMessage className="mt-2" />
                      </div>
                    </FormControl>
                  </FormItem>
                )}
              />

              {/* CATEGORY */}
              <FormField
                name="category"
                control={form.control}
                render={({ field }) => (
                  <FormItem className="col-span-2">
                    <Label htmlFor="category" className="text-left">
                      Category <span className="text-red-500">*</span>
                    </Label>
                    <FormControl>
                      <div>
                        <Select
                          onValueChange={field.onChange}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Category" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Putter">
                              Putter
                            </SelectItem>
                            <SelectItem value="Accessory">
                              Accessory
                            </SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage className="mt-2" />
                      </div>
                    </FormControl>
                  </FormItem>
                )}
              />

              {/* TOTAL COMPLETED */}
              <FormField
                name="completed"
                control={form.control}
                render={({ field }) => (
                  <FormItem className="col-span-2">
                    <FormLabel className="text-right">
                      Delivered <span className="text-red-500">*</span>
                    </FormLabel>
                    <FormControl>
                      <div>
                        <Input
                          {...form.register("completed", {
                            required: true,
                          })}
                          onFocus={(e) => e.target.select()}
                        />
                        <FormMessage className="mt-2" />
                      </div>
                    </FormControl>
                  </FormItem>
                )}
              />

              {/* TOTAL QUANTITY */}
              <FormField
                name="total"
                control={form.control}
                render={({ field }) => (
                  <FormItem className="col-span-2">
                    <FormLabel className="text-right">
                      Quantity <span className="text-red-500">*</span>
                    </FormLabel>
                    <FormControl>
                      <div>
                        <Input
                          {...form.register("total", {
                            required: true,
                          })}
                          placeholder="2000"
                          onFocus={(e) => e.target.select()}
                        />
                        <FormMessage className="mt-2" />
                      </div>
                    </FormControl>
                  </FormItem>
                )}
              />

              {/* ID NUMBER (Optional) */}
              <FormField
                name="id"
                control={form.control}
                render={({ field }) => (
                  <FormItem className="col-span-2">
                    <FormLabel>ID Number</FormLabel>
                    <FormControl className="col-span-3">
                      <div>
                        <Input
                          {...form.register("id")}
                          placeholder="1234"
                          onFocus={(e) => e.target.select()}
                        />
                        <FormMessage className="mt-2" />
                      </div>
                    </FormControl>
                  </FormItem>
                )}
              />

              {/* PRIORITY (LOW, MEDIUM, HIGH) */}
              <FormField
                name="priority"
                control={form.control}
                render={({ field }) => (
                  <FormItem className="col-span-2">
                    <Label htmlFor="priority">Priority</Label>
                    <FormControl>
                      <div>
                        <Select onValueChange={field.onChange}>
                          <SelectTrigger>
                            <SelectValue placeholder="" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="High">High</SelectItem>
                            <SelectItem value="Medium">Medium</SelectItem>
                            <SelectItem value="Low">Low</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage className="mt-2" />
                      </div>
                    </FormControl>
                  </FormItem>
                )}
              />

              {/* NOTES */}
              <FormField
                name="notes"
                control={form.control}
                render={({ field }) => (
                  <FormItem className="col-span-4">
                    <FormLabel>Notes</FormLabel>
                    <FormControl className="col-span-3">
                      <div>
                        <Textarea
                          {...form.register("notes")}
                          placeholder=""
                          onFocus={(e) => e.target.select()}
                        />
                        <FormMessage className="mt-2" />
                      </div>
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>
            <DialogFooter className="gap-2">
              <Button type="submit">Save</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

function CreateCompanyForm({
  isOpen,
  setOpen,
}: {
  isOpen: boolean;
  setOpen: (open: boolean) => void;
}) {
  const reload = useContext(ReloadContext);
  const { user, setUser } = useContext(UserContext);
  const { companies, orders } = useContext(DataContext);

  const formSchema = z.object({
    name: z.string().min(1, {
      message: "Name is required",
    }),
    logo: z.optional(z.string()),
    priority: z.optional(
      z.number().min(1, { message: "Priority must be at least 1" })
    ),
    notes: z.optional(z.string())
  });

  type FormType = z.infer<typeof formSchema>;

  const form = useForm<FormType>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      logo: "",
      priority: undefined,
      notes: "",
    },
  });

  useEffect(() => {
    form.reset();
  }, [isOpen]);

  const onSubmit = async (data: FormType) => {
    let priorityValue = data.priority;

    if (priorityValue == undefined) {
      priorityValue = 1;
      for (let i = 0; i < companies.length; i++) {
        if (
          companies[i].priority > priorityValue &&
          companies[i].priority < 5000
        )
          priorityValue = companies[i].priority;
      }
      priorityValue += 10;
    }

    let company = {
      name: data.name,
      image: data.logo,
      priority: priorityValue,
      notes: data.notes,
    };

    await createCompany({ company, user });
    setOpen(false);
    reload();
  };

  return (
    <Dialog open={isOpen} onOpenChange={setOpen}>
      <DialogTrigger asChild></DialogTrigger>
      <DialogContent className="sm:max-w-[425px] bg-white">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <DialogHeader>
              <DialogTitle>Create company</DialogTitle>
              <DialogDescription>
                Create a company to add to the page
              </DialogDescription>
            </DialogHeader>
            <div className="grid grid-cols-4 gap-4 py-4">
              {/* NAME */}
              <FormField
                name="name"
                control={form.control}
                render={({ field }) => (
                  <FormItem className="col-span-4">
                    <FormLabel htmlFor="name" className="text-left">
                      Name <span className="text-red-500">*</span>
                    </FormLabel>
                    <FormControl>
                      <div>
                        <Input
                          {...form.register("name")}
                          onFocus={(e) => e.target.select()}
                          placeholder="Evnroll"
                        />
                        <FormMessage className="mt-2" />
                      </div>
                    </FormControl>
                  </FormItem>
                )}
              />

              {/* LOGO (Optional) */}
              <FormField
                name="logo"
                control={form.control}
                render={({ field }) => (
                  <FormItem className="col-span-4">
                    <FormLabel htmlFor="logo" className="text-left">
                      Logo (Optional)
                    </FormLabel>
                    <FormControl>
                      <div>
                        <Input
                          {...form.register("logo")}
                          onFocus={(e) => e.target.select()}
                          placeholder="https://i.imgur.com/dnIig58.png"
                        />
                        <FormMessage className="mt-2" />
                      </div>
                    </FormControl>
                  </FormItem>
                )}
              />

              {/* PRIORITY (Optional) */}
              <FormField
                name="priority"
                control={form.control}
                render={({ field }) => (
                  <FormItem className="col-span-4">
                    <FormLabel htmlFor="priority" className="text-left">
                      Priority
                    </FormLabel>
                    <FormDescription>
                      Smaller values appear at the top of the page
                    </FormDescription>
                    <FormControl>
                      <div>
                        <Input
                          {...form.register("priority", {
                            setValueAs: (v) =>
                              v === "" ? undefined : parseInt(v, 10),
                          })}
                          onFocus={(e) => e.target.select()}
                          type="number"
                          placeholder="50"
                        />
                        <FormMessage className="mt-2" />
                      </div>
                    </FormControl>
                  </FormItem>
                )}
              />

              {/* NOTES */}
              <FormField
                name="notes"
                control={form.control}
                render={({ field }) => (
                  <FormItem className="col-span-4">
                    <FormLabel>Notes</FormLabel>
                    <FormControl className="col-span-3">
                      <div>
                        <Textarea
                          {...form.register("notes")}
                          placeholder=""
                          onFocus={(e) => e.target.select()}
                        />
                        <FormMessage className="mt-2" />
                      </div>
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>
            <DialogFooter className="gap-2">
              <Button type="submit">Save</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

function EditCompanyForm({
  company,
  isOpen,
  setOpen,
}: {
  company: CompanyType;
  isOpen: boolean;
  setOpen: (open: boolean) => void;
}) {
  const reload = useContext(ReloadContext);
  const { user, setUser } = useContext(UserContext);
  const { companies }: any = useContext(DataContext);

  const formSchema = z.object({
    name: z.string().min(1, {
      message: "Name is required",
    }),
    logo: z.optional(z.string()),
    priority: z.number().min(1, { message: "Priority must be at least 1" }),
    notes: z.optional(z.string()),
  });

  type FormType = z.infer<typeof formSchema>;

  const form = useForm<FormType>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: company.name,
      logo: company.image,
      priority: company.priority,
      notes: company.notes,
    },
  });

  const onSubmit = async (data: FormType) => {
    let newCompany = {
      name: data.name,
      image: data.logo,
      priority: data.priority,
      id: company.id,
      notes: data.notes,
    };

    await editCompany({ company: newCompany, originalCompany: company, user });
    setOpen(false);
    reload();
  };

  return (
    <Dialog open={isOpen} onOpenChange={setOpen}>
      <DialogTrigger asChild></DialogTrigger>
      <DialogContent className="sm:max-w-[425px] bg-white">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <DialogHeader>
              <DialogTitle>Edit company</DialogTitle>
              <DialogDescription>Edit a company's details</DialogDescription>
            </DialogHeader>
            <div className="grid grid-cols-4 gap-4 py-4">
              {/* NAME */}
              <FormField
                name="name"
                control={form.control}
                render={({ field }) => (
                  <FormItem className="col-span-4">
                    <FormLabel htmlFor="name" className="text-left">
                      Name <span className="text-red-500">*</span>
                    </FormLabel>
                    <FormControl>
                      <div>
                        <Input
                          {...form.register("name")}
                          onFocus={(e) => e.target.select()}
                          placeholder="Evnroll"
                        />
                        <FormMessage className="mt-2" />
                      </div>
                    </FormControl>
                  </FormItem>
                )}
              />

              {/* LOGO (OPTIONAL) */}
              <FormField
                name="logo"
                control={form.control}
                render={({ field }) => (
                  <FormItem className="col-span-4">
                    <FormLabel htmlFor="logo" className="text-left">
                      Logo (Optional)
                    </FormLabel>
                    <FormControl>
                      <div>
                        <Input
                          {...form.register("logo")}
                          onFocus={(e) => e.target.select()}
                          placeholder="https://i.imgur.com/dnIig58.png"
                        />
                        <FormMessage className="mt-2" />
                      </div>
                    </FormControl>
                  </FormItem>
                )}
              />

              {/* PRIORITY */}
              <FormField
                name="priority"
                control={form.control}
                render={({ field }) => (
                  <FormItem className="col-span-4">
                    <FormLabel htmlFor="priority" className="text-left">
                      Priority
                    </FormLabel>
                    <FormDescription>
                      Smaller values appear at the top of the page
                    </FormDescription>
                    <FormControl>
                      <div>
                        <Input
                          {...form.register("priority", {
                            setValueAs: (v) =>
                              v === "" ? undefined : parseInt(v, 10),
                          })}
                          onFocus={(e) => e.target.select()}
                          type="number"
                          placeholder="50"
                        />
                        <FormMessage className="mt-2" />
                      </div>
                    </FormControl>
                  </FormItem>
                )}
              />
              
              {/* NOTES */}
              <FormField
                name="notes"
                control={form.control}
                render={({ field }) => (
                  <FormItem className="col-span-4">
                    <FormLabel>Notes</FormLabel>
                    <FormControl className="col-span-3">
                      <div>
                        <Textarea
                          {...form.register("notes")}
                          placeholder=""
                          defaultValue={company.notes}
                          onFocus={(e) => e.target.select()}
                        />
                        <FormMessage className="mt-2" />
                      </div>
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>
            <DialogFooter className="gap-2">
              <Button
                type="button"
                variant="destructive"
                onClick={async () => {
                  await deleteCompany({
                    company,
                    user,
                  });
                  setOpen(false);
                  reload();
                }}
              >
                Delete
              </Button>
              <Button type="submit">Save</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
