import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangleIcon, InfoIcon } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import type { AuthError, AuthChangeEvent } from '@supabase/supabase-js';

const AuthPage = () => {
  const navigate = useNavigate();
  const [authError, setAuthError] = useState<string | null>(null);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event: AuthChangeEvent, session) => {
      console.log("Auth state changed:", event, session);
      
      if (event === 'SIGNED_IN' && session) {
        toast({
          title: "登录成功",
          description: "正在跳转到主页...",
        });
        navigate('/');
      }

      if (event === 'SIGNED_OUT') {
        navigate('/auth');
      }

      if (event === 'PASSWORD_RECOVERY') {
        toast({
          title: "密码重置邮件已发送",
          description: "请检查您的邮箱",
        });
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const handleError = (error: AuthError) => {
    console.error('Auth error:', error);
    setAuthError(error.message);
    toast({
      variant: "destructive",
      title: "登录失败",
      description: error.message,
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>登录/注册</CardTitle>
          <CardDescription>登录以使用自动抢票系统</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Alert>
              <InfoIcon className="h-4 w-4" />
              <AlertDescription>
                首次使用请先点击"注册"创建账号
              </AlertDescription>
            </Alert>
            
            {authError && (
              <Alert variant="destructive">
                <AlertTriangleIcon className="h-4 w-4" />
                <AlertDescription>{authError}</AlertDescription>
              </Alert>
            )}

            <Auth
              supabaseClient={supabase}
              appearance={{ 
                theme: ThemeSupa,
                variables: {
                  default: {
                    colors: {
                      brand: '#1e40af',
                      brandAccent: '#1e3a8a',
                    },
                  },
                },
              }}
              localization={{
                variables: {
                  sign_in: {
                    email_label: '邮箱',
                    password_label: '密码',
                    button_label: '登录',
                    loading_button_label: '登录中...',
                    email_input_placeholder: '请输入邮箱',
                    password_input_placeholder: '请输入密码',
                    link_text: '已有账号？立即登录',
                  },
                  sign_up: {
                    email_label: '邮箱',
                    password_label: '密码',
                    button_label: '注册',
                    loading_button_label: '注册中...',
                    email_input_placeholder: '请输入邮箱',
                    password_input_placeholder: '请输入密码',
                    link_text: '没有账号？立即注册',
                  },
                  forgotten_password: {
                    link_text: '忘记密码？',
                    button_label: '重置密码',
                    loading_button_label: '发送重置邮件中...',
                    confirmation_text: '请检查您的邮箱',
                  },
                },
              }}
              theme="light"
              providers={[]}
              onError={handleError}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AuthPage;