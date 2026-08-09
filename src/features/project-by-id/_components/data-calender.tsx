import {
  addMonths,
  format,
  getDay,
  parse,
  startOfWeek,
  subMonths,
} from "date-fns";
import { enUS } from "date-fns/locale";
import { CalendarIcon, ChevronLeftIcon, ChevronRightIcon } from "lucide-react";
import { useState } from "react";
import { Calendar, dateFnsLocalizer } from "react-big-calendar";

import { Button } from "@/components/ui/button";
import type { Task } from "../types";
import { EventCard } from "./event-card";

import "react-big-calendar/lib/css/react-big-calendar.css";
import "./data-calendar.css";

const locales = {
  "en-Us": enUS,
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

interface CustomToolbarProps {
  date: Date;
  onNavigate: (action: "PREV" | "NEXT" | "TODAY") => void;
}

const CustomToolbar = ({ date, onNavigate }: CustomToolbarProps) => {
  return (
    <div className="flex mb-4 gap-x-2 items-center w-full lg:w-auto justify-center lg:justify-start">
      <Button
        onClick={() => onNavigate("PREV")}
        variant="secondary"
        size="icon"
      >
        <ChevronLeftIcon className="size-4" />
      </Button>
      <div className="flex items-center border border-input rounded-md px-3 py-2 h-8 justify-center w-full lg:w-auto">
        <CalendarIcon className="size-4 mr-2" />
        <p className="text-sm">{format(date, "MMMM yyyy")}</p>
      </div>
      <Button
        onClick={() => onNavigate("NEXT")}
        variant="secondary"
        size="icon"
      >
        <ChevronRightIcon className="size-4" />
      </Button>
    </div>
  );
};

interface DataCalendarProps {
  data: Task[];
}

const getTaskStartDate = (task: Task) =>
  task.startDate ?? task.dueDate ?? task.endDate;
const getTaskEndDate = (task: Task) =>
  task.endDate ?? task.dueDate ?? task.startDate;

export const DataCalendar = ({ data }: DataCalendarProps) => {
  const tasksWithDate = data.filter((task) => Boolean(getTaskStartDate(task)));

  const [value, setValue] = useState<Date>(
    tasksWithDate.length > 0
      ? new Date(getTaskStartDate(tasksWithDate[0]) as Date)
      : new Date(),
  );

  const events = tasksWithDate.map((task) => ({
    start: new Date(getTaskStartDate(task) as Date),
    end: new Date(getTaskEndDate(task) as Date),
    title: task.name,
    project: task.project,
    assignee: task.assignee,
    status: task.status,
    id: task.id,
  }));

  const handleNavigate = (action: "PREV" | "NEXT" | "TODAY") => {
    if (action === "PREV") {
      setValue(subMonths(value, 1));
    } else if (action === "NEXT") {
      setValue(addMonths(value, 1));
    } else if (action === "TODAY") {
      setValue(new Date());
    }
  };

  return (
    <Calendar
      localizer={localizer}
      date={value}
      events={events}
      views={["month"]}
      defaultView="month"
      toolbar
      showAllEvents
      className="h-full"
      max={new Date(new Date().setFullYear(new Date().getFullYear() + 1))}
      formats={{
        weekdayFormat: (date, culture, localizer) =>
          localizer?.format(date, "EEE", culture) ?? "",
      }}
      components={{
        eventWrapper: ({ event }) => (
          <EventCard
            id={event.id}
            title={event.title}
            assignee={event.assignee}
            project={event.project}
            status={event.status}
          />
        ),
        toolbar: () => (
          <CustomToolbar date={value} onNavigate={handleNavigate} />
        ),
      }}
    />
  );
};
