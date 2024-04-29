"use client";

import Link from "next/link";

import {
  getOrders,
  getCompanies,
  createOrder,
  deleteOrder,
  editOrder,
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
import { Input } from "@/components/ui/input";
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

import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import z from "zod";

const ReloadContext = createContext<Function>(() => {});
const DataContext = createContext<{
  companies: CompanyType[];
  orders: OrderType[];
}>({ companies: [], orders: [] });

type CompanyType = {
  id: number;
  name: string;
  image: any;
  priority: number;
};

type OrderType = {
  order_id: number;
  name: string;
  company: number;
  quantity: number;
  completed: number;
  priority: number;
  notes: string;
  start: any;
  end: any;
  log: any;
  id: string;
};

export default function Orders() {
  return (
    <>
      <Menu />
      <OrderList />
    </>
  );
}

// The menu bar component.
function Menu() {
  return (
    <>
      <div className="invisible h-8 font-RobotoMono" />
      <div className="fixed top-0 z-10 w-screen h-8 m-auto shadow-xl bg-cool-grey-50">
        <div className="mx-auto w-fit">
          <Link href="./">
            <img src="./inverted-logo.png" className="pr-3 mx-auto mt-2 h-7" />
          </Link>
        </div>
      </div>
    </>
  );
}

function OrderList() {
  const [orders, setOrders] = useState<OrderType[]>([]);
  const [companies, setCompanies] = useState<CompanyType[]>([]);

  function reload() {
    getOrders({ setOrders });
    getCompanies({ setCompanies });
  }

  useEffect(() => {
    reload();
  }, []);

  return (
    <DataContext.Provider value={{ orders, companies }}>
      <ReloadContext.Provider value={reload}>
        <div className="mt-6 mb-6 max-w-[1280px] mx-auto flex gap-x-6 gap-y-4 flex-wrap justify-center">
          {companies.map((company) => {
            return (
              <Company
                company={company}
                orders={orders.filter((order) => {
                  return order.company == company.id;
                })}
                key={company.id}
              />
            );
          })}
        </div>
      </ReloadContext.Provider>
    </DataContext.Provider>
  );
}

function Company({
  company,
  orders,
}: {
  company: CompanyType;
  orders: OrderType[];
}) {
  let [fileExists, setFileExists] = useState(true);

  let sortedOrders = useMemo(() => {
    return orders.sort((a: OrderType, b: OrderType) => {
      if (a.priority > b.priority) return -1;
      else if (a.priority < b.priority) return 1;
      else if (a.quantity > b.quantity) return -1;
      else if (a.quantity < b.quantity) return 1;
      else if (a.name < b.name) return -1;
      else return 1;
    });
  }, [orders]);

  return (
    <div className="w-13 h-fit font-inter">
      {/* Logo & button */}
      <div className="relative mb-4 h-fit">
        <div className="h-[48px]">
          {fileExists ? (
            <img
              src={`/companies/logos/${company.name}.png`}
              className="absolute bottom-0 h-[32px]"
              alt={company.name}
              onError={() => {
                setFileExists(false);
              }}
            />
          ) : (
            <h3 className="absolute bottom-0 text-2xl font-semibold align-bottom">
              {company.name}
            </h3>
          )}
          <CreateOrderForm company={company} />
        </div>
      </div>
      {sortedOrders.map((order) => {
        return <Order company={company} order={order} key={order.order_id} />;
      })}
    </div>
  );
}

function Order({ company, order }: { company: CompanyType; order: OrderType }) {
  const reload = useContext(ReloadContext);
  const { companies }: any = useContext(DataContext);

  const [openPopup, setOpenPopup] = useState(false);

  const companyNames = companies.map((c: CompanyType) => c.name);
  const CompanyEnum = z.enum(companyNames, {
    required_error: "Company is required",
    message: "Company must be chosen from list",
  });

  type PriorityEnum = "Low" | "Medium" | "High";

  let defaultPriority: PriorityEnum = "Medium";
  if (order.priority == 0) defaultPriority = "Low";
  else if (order.priority == 2) defaultPriority = "High";

  const formSchema = z.object({
    company: CompanyEnum,
    name: z.string().min(2, {
      message: "Minimum 2 characters",
    }),
    id: z.optional(z.string()),
    completed: z
      .number({ message: "Value is required" })
      .min(0, { message: "Value cannot be negative" }),
    total: z
      .number({ message: "Value is required" })
      .min(0, { message: "Value cannot be negative" }),
    priority: z.optional(
      z.enum(["Low", "Medium", "High"], {
        invalid_type_error: "Invalid input",
      })
    ),
  });

  type FormType = z.infer<typeof formSchema>;

  const form = useForm<FormType>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      company: company.name,
      name: order.name,
      id: order.id,
      completed: order.completed,
      total: order.quantity,
      priority: defaultPriority,
    },
  });

  const onSubmit = async (data: FormType) => {
    let priority = 1;
    if (data.priority == "Low") priority = 0;
    else if (data.priority == "High") priority = 2;

    let editedOrder = {
      name: data.name,
      company: companies.find((c: CompanyType) => data.company == c.name).id,
      quantity: data.total,
      completed: data.completed,
      priority: priority,
      notes: "",
      id: data.id,
      order_id: order.order_id,
    };

    await editOrder({ order: editedOrder });
    setOpenPopup(false);
    reload();
  };

  let priorityStyle = "border-l-yellow-500";

  if (order.priority == 1) priorityStyle = "border-l-blue-500";
  else if (order.priority == 2) priorityStyle = "border-l-red-500";

  return (
    <Dialog open={openPopup} onOpenChange={setOpenPopup}>
      <DialogTrigger asChild>
        <div
          className={`${priorityStyle} relative mb-4 w-13 h-[80px] bg-cool-grey-50 rounded-md border-l-8 shadow-md transition-all cursor-pointer hover:shadow-lg hover:-translate-y-1`}
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
        </div>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] bg-white">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <DialogHeader>
              <DialogTitle>Edit order</DialogTitle>
              <DialogDescription>Edit an order.</DialogDescription>
            </DialogHeader>
            <div className="grid grid-cols-4 gap-4 py-4">
              {/* PART NAME */}
              <FormField
                name="name"
                control={form.control}
                render={({ field }) => (
                  <FormItem className="col-span-2">
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
                            valueAsNumber: true,
                          })}
                          type="number"
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
                            valueAsNumber: true,
                            required: true,
                          })}
                          placeholder="2000"
                          type="number"
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
              {/* COMPANY */}
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
            </div>
            <DialogFooter className="gap-2">
              <Button
                type="button"
                variant="destructive"
                onClick={async () => {
                  await deleteOrder({ order: { order_id: order.order_id } });
                  setOpenPopup(false);
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

function CreateOrderForm({ company }: { company: CompanyType }) {
  const reload = useContext(ReloadContext);
  const { companies }: any = useContext(DataContext);

  const [openPopup, setOpenPopup] = useState(false);

  const companyNames = companies.map((c: CompanyType) => c.name);
  const CompanyEnum = z.enum(companyNames, {
    required_error: "Company is required",
    message: "Company must be chosen from list",
  });

  const formSchema = z.object({
    company: CompanyEnum,
    name: z.string().min(2, {
      message: "Minimum 2 characters",
    }),
    id: z.optional(z.string()),
    completed: z
      .number({ message: "Value is required" })
      .min(0, { message: "Value cannot be negative" }),
    total: z
      .number({ message: "Value is required" })
      .min(0, { message: "Value cannot be negative" }),
    priority: z.optional(
      z.enum(["Low", "Medium", "High"], {
        invalid_type_error: "Invalid input",
      })
    ),
  });

  type FormType = z.infer<typeof formSchema>;

  const form = useForm<FormType>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      company: company.name,
      name: undefined,
      id: undefined,
      completed: 0,
      total: undefined,
      priority: undefined,
    },
  });

  useEffect(() => {
    form.reset();
  }, [openPopup]);

  const onSubmit = async (data: FormType) => {
    let priority = 1;
    if (data.priority == "Low") priority = 0;
    else if (data.priority == "High") priority = 2;

    let order = {
      name: data.name,
      company: company.id,
      quantity: data.total,
      completed: data.completed,
      priority: priority,
      notes: "",
      id: data.id,
    };

    await createOrder({ order });
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
                  <FormItem className="col-span-2">
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
                            valueAsNumber: true,
                          })}
                          type="number"
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
                            valueAsNumber: true,
                            required: true,
                          })}
                          placeholder="2000"
                          type="number"
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
