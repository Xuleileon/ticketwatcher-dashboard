import React from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface StationSelectProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
}

// 模拟热门站点数据
const POPULAR_STATIONS = [
  "北京",
  "上海",
  "广州",
  "深圳",
  "杭州",
  "南京",
  "武汉",
  "成都",
];

const StationSelect: React.FC<StationSelectProps> = ({ label, value, onChange }) => {
  return (
    <div className="flex flex-col gap-2">
      <label className="text-sm font-medium text-gray-700">{label}</label>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger className="w-[200px]">
          <SelectValue placeholder="选择站点" />
        </SelectTrigger>
        <SelectContent>
          {POPULAR_STATIONS.map((station) => (
            <SelectItem key={station} value={station}>
              {station}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

export default StationSelect;