"use client"

import * as React from "react"
import { ChevronsUpDown, X } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { Checkbox } from "./checkbox"

type Option = {
  label: string
  value: string
}

type MultipleSelectProps = {
  options?: Option[]
  placeholder?: string
  value?: string[]
  onChange?: (value: string[]) => void
  disabled?: boolean
  className?: string
}

const DEFAULT_OPTIONS: Option[] = [
  { label: "Light", value: "light" },
  { label: "Dark", value: "dark" },
  { label: "System", value: "system" },
]

/**
 * Multi-select popover built on Command + Popover.
 *
 * @param options Optional list of { label, value } choices. Defaults to light/dark/system.
 * @param placeholder Placeholder text when no items are selected.
 * @param value Controlled list of selected values. Omit to use the internal state.
 * @param onChange Callback fired with the next array of selected values.
 * @param disabled Disables the trigger and selections when true.
 * @param className Optional className applied to the outer wrapper.
 *
 * @example
 * <MultipleSelect
 *   options={[
 *     { label: "Design", value: "design" },
 *     { label: "Engineering", value: "engineering" },
 *   ]}
 *   value={selected}
 *   onChange={setSelected}
 * />
 */
export const MultipleSelect: React.FC<MultipleSelectProps> = ({
  options = DEFAULT_OPTIONS,
  placeholder = "Select options...",
  value,
  onChange,
  disabled = false,
  className,
}) => {
  const [open, setOpen] = React.useState(false)
  const [internalValue, setInternalValue] = React.useState<string[]>(
    value ?? []
  )
  const isControlled = value !== undefined
  const selectedValues = isControlled ? value ?? [] : internalValue

  React.useEffect(() => {
    if (isControlled) {
      setInternalValue(value ?? [])
    }
  }, [isControlled, value])

  const updateSelectedValues = (nextValues: string[]) => {
    if (!isControlled) {
      setInternalValue(nextValues)
    }
    onChange?.(nextValues)
  }

  const toggleValue = (nextValue: string) => {
    const nextValues = selectedValues.includes(nextValue)
      ? selectedValues.filter((current) => current !== nextValue)
      : [...selectedValues, nextValue]

    updateSelectedValues(nextValues)
  }

  const removeValue = (removedValue: string) => {
    const nextValues = selectedValues.filter((value) => value !== removedValue)
    updateSelectedValues(nextValues)
  }

  const displayLabel = React.useMemo(() => {
    if (!selectedValues.length) return placeholder

    const labels = selectedValues
      .map(
        (current) =>
          options.find((option) => option.value === current)?.label ?? current
      )
      .filter(Boolean)

    if (labels.length <= 2) {
      return labels.join(", ")
    }

    return `${labels.slice(0, 2).join(", ")} +${labels.length - 2} more`
  }, [options, placeholder, selectedValues])

  const selectedOptions = React.useMemo(
    () => options.filter((option) => selectedValues.includes(option.value)),
    [options, selectedValues]
  )

  return (
    <div className={cn("space-y-2", className)}>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between"
            disabled={disabled}
          >
            <span className="truncate text-left">{displayLabel}</span>
            <ChevronsUpDown className="size-4 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent
          align="start"
          sideOffset={4}
          className="w-[--radix-popover-trigger-width] min-w-[--radix-popover-trigger-width] p-0"
          style={{ width: "var(--radix-popover-trigger-width)" }}
        >
          <Command>
            <CommandInput placeholder="Search options..." />
            <CommandList>
              <CommandEmpty>No options found.</CommandEmpty>
              <CommandGroup>
                {options.map((option) => {
                  const isSelected = selectedValues.includes(option.value)

                  return (
                    <CommandItem
                      key={option.value}
                      value={option.label}
                      onSelect={() => toggleValue(option.value)}
                      className="gap-2"
                    >
                      <Checkbox checked = {isSelected} />
                      <span>{option.label}</span>
                    </CommandItem>
                  )
                })}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      <div className="flex flex-wrap gap-2">
        {selectedOptions.map((option) => (
          <Badge
            key={option.value}
            variant="secondary"
            className="gap-1 pr-1"
          >
            {option.label}
            <button
              type="button"
              onClick={() => removeValue(option.value)}
              className="rounded-full p-1 transition-colors hover:bg-accent/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <X className="size-3" />
            </button>
          </Badge>
        ))}
      </div>
    </div>
  )
}
