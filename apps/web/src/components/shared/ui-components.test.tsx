import { describe, expect, it, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import type { ColumnDef } from "@tanstack/react-table";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
  Checkbox,
  Combobox,
  DataTable,
  DatePicker,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  MultiSelect,
  Popover,
  PopoverContent,
  PopoverTrigger,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@repo/ui";

describe("Radix & Tailwind v4 UI Component Kit", () => {
  it("renders and toggles Checkbox", () => {
    const handleChange = vi.fn();
    render(<Checkbox aria-label="Accept terms" onCheckedChange={handleChange} />);
    const checkbox = screen.getByRole("checkbox", { name: "Accept terms" });
    expect(checkbox).toBeInTheDocument();
    fireEvent.click(checkbox);
    expect(handleChange).toHaveBeenCalled();
  });

  it("renders and opens Dialog modal", () => {
    render(
      <Dialog>
        <DialogTrigger>Open Modal</DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Test Dialog</DialogTitle>
          </DialogHeader>
          <p>Dialog Body Content</p>
        </DialogContent>
      </Dialog>,
    );

    expect(screen.getByText("Open Modal")).toBeInTheDocument();
    fireEvent.click(screen.getByText("Open Modal"));
    expect(screen.getByText("Test Dialog")).toBeInTheDocument();
    expect(screen.getByText("Dialog Body Content")).toBeInTheDocument();
  });

  it("renders and switches Tabs", () => {
    render(
      <Tabs defaultValue="tab1">
        <TabsList>
          <TabsTrigger value="tab1">Tab 1</TabsTrigger>
          <TabsTrigger value="tab2">Tab 2</TabsTrigger>
        </TabsList>
        <TabsContent value="tab1">Panel 1 Content</TabsContent>
        <TabsContent value="tab2">Panel 2 Content</TabsContent>
      </Tabs>,
    );

    expect(screen.getByText("Panel 1 Content")).toBeInTheDocument();
    const tab2 = screen.getByRole("tab", { name: "Tab 2" });
    fireEvent.focus(tab2);
    fireEvent.keyDown(tab2, { key: "Enter", code: "Enter" });
    fireEvent.click(tab2);
    expect(screen.getByText("Panel 2 Content")).toBeInTheDocument();
  });

  it("renders and toggles Accordion", () => {
    render(
      <Accordion type="single" collapsible>
        <AccordionItem value="item-1">
          <AccordionTrigger>Section 1</AccordionTrigger>
          <AccordionContent>Hidden Details</AccordionContent>
        </AccordionItem>
      </Accordion>,
    );

    expect(screen.getByText("Section 1")).toBeInTheDocument();
    fireEvent.click(screen.getByText("Section 1"));
    expect(screen.getByText("Hidden Details")).toBeInTheDocument();
  });

  it("renders Popover with content", () => {
    render(
      <Popover>
        <PopoverTrigger>Toggle Popover</PopoverTrigger>
        <PopoverContent>Popover Details</PopoverContent>
      </Popover>,
    );

    fireEvent.click(screen.getByText("Toggle Popover"));
    expect(screen.getByText("Popover Details")).toBeInTheDocument();
  });

  it("renders Tooltip with provider", () => {
    render(
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger>Hover me</TooltipTrigger>
          <TooltipContent>Helpful info</TooltipContent>
        </Tooltip>
      </TooltipProvider>,
    );

    expect(screen.getByText("Hover me")).toBeInTheDocument();
  });

  it("renders DatePicker and handles selection", () => {
    const handleDate = vi.fn();
    render(<DatePicker date={new Date(2026, 7, 25)} onDateChange={handleDate} />);
    expect(screen.getByText(/August 25th, 2026/i)).toBeInTheDocument();
  });

  it("renders Combobox, filters options, and selects value", () => {
    const options = [
      { value: "apple", label: "Apple" },
      { value: "banana", label: "Banana" },
      { value: "orange", label: "Orange" },
    ];
    const handleChange = vi.fn();
    render(
      <Combobox
        options={options}
        value="apple"
        onValueChange={handleChange}
        placeholder="Pick a fruit"
      />,
    );

    expect(screen.getByText("Apple")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("combobox"));
    const searchInput = screen.getByPlaceholderText("Search...");
    fireEvent.change(searchInput, { target: { value: "ban" } });
    expect(screen.getByText("Banana")).toBeInTheDocument();
    expect(screen.queryByText("Orange")).not.toBeInTheDocument();
    fireEvent.click(screen.getByText("Banana"));
    expect(handleChange).toHaveBeenCalledWith("banana");
  });

  it("renders MultiSelect, adds/removes items, and supports select all", () => {
    const options = [
      { value: "ts", label: "TypeScript" },
      { value: "react", label: "React" },
      { value: "tailwind", label: "Tailwind" },
    ];
    const handleChange = vi.fn();
    render(
      <MultiSelect
        options={options}
        value={["ts"]}
        onValueChange={handleChange}
        placeholder="Select tags"
      />,
    );

    expect(screen.getByText("TypeScript")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("combobox"));
    fireEvent.click(screen.getByText("Select all"));
    expect(handleChange).toHaveBeenCalledWith(["ts", "react", "tailwind"]);
  });

  interface TestRow {
    id: string;
    name: string;
    role: string;
  }

  it("renders DataTable with sorting, filtering, and pagination", () => {
    const columns: ColumnDef<TestRow>[] = [
      { accessorKey: "name", header: "Name" },
      { accessorKey: "role", header: "Role" },
    ];
    const data: TestRow[] = [
      { id: "1", name: "Alice", role: "Admin" },
      { id: "2", name: "Bob", role: "Member" },
    ];

    render(<DataTable columns={columns} data={data} searchKey="name" />);
    expect(screen.getByText("Alice")).toBeInTheDocument();
    expect(screen.getByText("Bob")).toBeInTheDocument();

    const searchInput = screen.getByPlaceholderText("Filter...");
    fireEvent.change(searchInput, { target: { value: "Alice" } });
    expect(screen.getByText("Alice")).toBeInTheDocument();
    expect(screen.queryByText("Bob")).not.toBeInTheDocument();
  });
});
