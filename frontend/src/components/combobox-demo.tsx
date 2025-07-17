import * as React from "react"
import { Check, ChevronsUpDown } from "lucide-react"

import { cn } from "@/lib/utils"
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

interface ComboboxItem {
  value: string;
  label: string;
}

interface ComboboxDemoProps {
  value: string;
  onChange: (value: string) => void;
  items: ComboboxItem[];
  placeholder?: string;
}

export default function ComboboxDemo({ value, onChange, items, placeholder }: ComboboxDemoProps) {
  const [open, setOpen] = React.useState(false);
  const [search, setSearch] = React.useState('');
  const query = search.toLowerCase();
  const filteredItems = items.filter(item =>
    typeof item.label === 'string' && item.label.toLowerCase().includes(query)
  );

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between"
        >
          {value
            ? (items.find((item) => item.value === value)?.label ?? value)
            : placeholder || 'Select...'}
          <ChevronsUpDown className="opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent side="top" align="center" className="w-full p-0">
        <Command>
          <CommandInput
            placeholder={`Search${placeholder ? ` ${placeholder.replace('Select ','').replace('...','')}` : ''}...`}
            className="h-9"
            value={search}
            onValueChange={(val: string) => setSearch(val)}
          />
          <CommandList>
            {/* Show empty when no matches */}
            {filteredItems.length === 0 && (
              <CommandEmpty>No category found, please create a new or select from the list.</CommandEmpty>
            )}
            <CommandGroup>
              {/* List existing matches */}
              {filteredItems.map((item) => (
                <CommandItem
                  key={item.value}
                  value={item.value}
                  onSelect={(currentValue) => {
                    if (currentValue !== value) {
                      onChange(currentValue);
                    }
                    setOpen(false);
                  }}
                >
                  {item.label}
                  <Check
                    className={cn(
                      "ml-auto",
                      value === item.value ? "opacity-100" : "opacity-0"
                    )}
                  />
                </CommandItem>
              ))}
            </CommandGroup>
            {/* Option to add new item if search text is not already an option */}
            {search && !items.some(i => i.value.toLowerCase() === search.toLowerCase()) && (
              <CommandItem
                value={search}
                onSelect={() => {
                  onChange(search);
                  setSearch('');
                  setOpen(false);
                }}
              >
                Add "{search}"
              </CommandItem>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
