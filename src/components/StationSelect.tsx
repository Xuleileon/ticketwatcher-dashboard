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
  CommandLoading,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from "@/components/ui/use-toast";

interface Station {
  name: string;
  code: string;
}

interface StationSelectProps {
  value?: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export function StationSelect({ value, onChange, placeholder = "选择车站" }: StationSelectProps) {
  const [open, setOpen] = useState(false);
  const { toast } = useToast();

  const { data: stations = [], isLoading, error } = useQuery({
    queryKey: ['stations'],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from('stations')
          .select('name, code')
          .order('name');
        
        if (error) {
          throw error;
        }

        if (!data || data.length === 0) {
          toast({
            variant: "destructive",
            title: "错误",
            description: "未能加载车站信息，请稍后重试",
          });
          return [];
        }

        return data;
      } catch (err) {
        console.error('Error fetching stations:', err);
        toast({
          variant: "destructive",
          title: "错误",
          description: "加载车站信息失败",
        });
        return [];
      }
    },
    retry: 2,
    staleTime: 300000, // Cache for 5 minutes
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
          {isLoading ? "加载中..." : selectedStation ? selectedStation.name : placeholder}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0">
        <Command>
          <CommandInput placeholder="搜索车站..." />
          {isLoading ? (
            <CommandLoading>加载车站信息...</CommandLoading>
          ) : error ? (
            <CommandEmpty>加载车站失败，请重试</CommandEmpty>
          ) : stations.length === 0 ? (
            <CommandEmpty>未找到车站</CommandEmpty>
          ) : (
            <CommandGroup>
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
          )}
        </Command>
      </PopoverContent>
    </Popover>
  );
}