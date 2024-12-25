import React from 'react';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface TrainFilterProps {
  trainNumber: string;
  onTrainNumberChange: (value: string) => void;
}

const TrainFilter: React.FC<TrainFilterProps> = ({
  trainNumber,
  onTrainNumberChange,
}) => {
  return (
    <div className="space-y-2">
      <Label htmlFor="trainNumber">车次号</Label>
      <Input
        id="trainNumber"
        placeholder="输入车次号，如 G1234"
        value={trainNumber}
        onChange={(e) => onTrainNumberChange(e.target.value)}
        className="w-[200px]"
      />
    </div>
  );
};

export default TrainFilter;