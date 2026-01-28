'use client';

import { useState, useEffect } from 'react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { LoginForm } from '@/components/auth/LoginForm';
import { RegisterForm } from '@/components/auth/RegisterForm';
import { usePathname } from 'next/navigation';

interface AuthModalProps {
    isOpen: boolean;
    onClose: () => void;
    initialView?: 'LOGIN' | 'REGISTER';
}

export function AuthModal({ isOpen, onClose, initialView = 'LOGIN' }: AuthModalProps) {
    const [view, setView] = useState<'LOGIN' | 'REGISTER'>(initialView);
    const pathname = usePathname();

    useEffect(() => {
        if (isOpen) {
            setView(initialView);
        }
    }, [isOpen, initialView]);

    // If we are already on login/register pages, do not show modal to avoid confusion?
    // User requested modal "instead of pages", but pages might still exist for direct links.
    // If user is on /login page, clicking "Login" in header might be redundant but harmless.

    const handleSwitchToRegister = () => setView('REGISTER');
    const handleSwitchToLogin = () => setView('LOGIN');

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle className="text-center text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                        {view === 'LOGIN' ? 'Giriş Yap' : 'Hesap Oluştur'}
                    </DialogTitle>
                    <DialogDescription className="text-center">
                        {view === 'LOGIN'
                            ? 'Portföyünüzü yönetmek için giriş yapın.'
                            : 'Borsa Takip dünyasına katılın.'}
                    </DialogDescription>
                </DialogHeader>

                <div className="mt-4">
                    {view === 'LOGIN' ? (
                        <LoginForm
                            onSuccess={onClose}
                            onRegisterClick={handleSwitchToRegister}
                            embedded={true}
                        />
                    ) : (
                        <RegisterForm
                            onSuccess={onClose} // Or switch to login? Usually auto-login or redirect. Form handles it.
                            onLoginClick={handleSwitchToLogin}
                            embedded={true}
                        />
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}
