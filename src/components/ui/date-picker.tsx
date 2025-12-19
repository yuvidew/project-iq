"use client";

import * as React from "react";
import { CalendarIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";

interface DatePickerProps {
    selectDate?: (date: Date) => void;
    onSelectDate?: (date: Date) => void;
    defaultDate?: Date;
    placeholder?: string;
    className?: string;
}

/**
 * DatePicker renders a calendar popover for picking a single date.
 * @param selectDate callback when a date is selected (alias for onSelectDate)
 * @param onSelectDate callback when a date is selected
 * @param defaultDate initial selected date
 * @param placeholder label shown when no date is selected
 * @example
 * <DatePicker
 *   onSelectDate={(date) => console.log("Selected date:", date)}
 *  placeholder="Choose a date"
 * />
 */

export const DatePicker = ({
    selectDate,
    onSelectDate,
    defaultDate,
    placeholder = "Select date",
    className,
}: DatePickerProps) => {
    const [open, setOpen] = React.useState(false);
    const [date, setDate] = React.useState<Date | undefined>(defaultDate);

    // Handle date selection from the calendar
    const handleSelect = (nextDate?: Date) => {
        setDate(nextDate);
        if (nextDate) {
            selectDate?.(nextDate);
            onSelectDate?.(nextDate);
            setOpen(false);
        }
    };

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    id="date"
                    className={`w-auto justify-between font-normal ${className}`}
                >
                    {date ? date.toLocaleDateString() : placeholder}
                    <CalendarIcon />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto overflow-hidden p-0" align="start">
                <Calendar
                    mode="single"
                    selected={date}
                    captionLayout="dropdown"
                    onSelect={handleSelect}
                />
            </PopoverContent>
        </Popover>
    );
}
