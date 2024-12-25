import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import type { UserProfileProps } from '@/types/components';

export const UserProfile: React.FC<UserProfileProps> = ({ userId }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>用户信息</CardTitle>
        <CardDescription>您的账号信息已通过RPA集成</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">
          您的12306账号信息已通过RPA系统集成，无需在此处填写。
        </p>
      </CardContent>
    </Card>
  );
};