import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangleIcon } from "lucide-react";

const AuthPage = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log("Auth state changed:", event, session);
      if (session) {
        navigate('/');
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>登录/注册</CardTitle>
          <CardDescription>登录以使用自动抢票系统</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Alert variant="destructive" className="mb-4">
              <AlertTriangleIcon className="h-4 w-4" />
              <AlertDescription>
                首次使用请先点击"注册"创建账号。如遇到问题，请确保已经验证邮箱。
              </AlertDescription>
            </Alert>
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
                  },
                  sign_up: {
                    email_label: '邮箱',
                    password_label: '密码',
                    button_label: '注册',
                  },
                },
              }}
              theme="light"
              providers={[]}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AuthPage;