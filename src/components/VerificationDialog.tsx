import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { Loader } from "lucide-react";

interface VerificationDialogProps {
  open: boolean;
  onClose: () => void;
  onVerify: (code: string) => Promise<void>;
}

export const VerificationDialog = ({
  open,
  onClose,
  onVerify,
}: VerificationDialogProps) => {
  const [code, setCode] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);

  const handleVerify = async () => {
    if (!code) {
      toast({
        title: "请输入验证码",
        variant: "destructive",
      });
      return;
    }

    setIsVerifying(true);
    try {
      await onVerify(code);
      toast({
        title: "验证成功",
      });
      onClose();
    } catch (error) {
      toast({
        title: "验证失败",
        description: error instanceof Error ? error.message : "请重试",
        variant: "destructive",
      });
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>输入短信验证码</DialogTitle>
          <DialogDescription>
            请输入发送到您手机上的12306验证码
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <Input
            type="text"
            placeholder="请输入验证码"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            maxLength={6}
            className="text-center text-2xl tracking-widest"
          />
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={onClose} disabled={isVerifying}>
              取消
            </Button>
            <Button onClick={handleVerify} disabled={isVerifying}>
              {isVerifying && <Loader className="mr-2 h-4 w-4 animate-spin" />}
              验证
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};