import React, { useState } from 'react';
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface StationSelectProps {
  value?: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export function StationSelect({ value, onChange, placeholder = "选择车站" }: StationSelectProps) {
  const [open, setOpen] = useState(false);

  const { data: stations = [], isLoading } = useQuery({
    queryKey: ['stations'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('stations')
        .select('name, code')
        .order('name');
      
      if (error) throw error;
      return data || [];
    }
  });

  const selectedStation = stations.find(station => station.code === value);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between"
          disabled={isLoading}
        >
          {selectedStation ? selectedStation.name : placeholder}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0">
        <Command>
          <CommandInput placeholder="搜索车站..." />
          <CommandEmpty>未找到车站</CommandEmpty>
          <CommandGroup className="max-h-60 overflow-auto">
            {stations.map((station) => (
              <CommandItem
                key={station.code}
                value={station.code}
                onSelect={(currentValue) => {
                  onChange(currentValue);
                  setOpen(false);
                }}
              >
                <Check
                  className={cn(
                    "mr-2 h-4 w-4",
                    value === station.code ? "opacity-100" : "opacity-0"
                  )}
                />
                {station.name}
              </CommandItem>
            ))}
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  );
}