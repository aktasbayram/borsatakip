import { render, screen, fireEvent } from '@testing-library/react';
import LoginPage from '../page';

// Mock hooks
jest.mock('next/navigation', () => ({
    useRouter: () => ({ push: jest.fn(), refresh: jest.fn() }),
}));
jest.mock('next-auth/react', () => ({
    signIn: jest.fn(),
}));
jest.mock('notistack', () => ({
    useSnackbar: () => ({ enqueueSnackbar: jest.fn() }),
}));

describe('LoginPage', () => {
    it('renders login form', () => {
        render(<LoginPage />);

        expect(screen.getByLabelText(/Email/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/Şifre/i)).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /Giriş Yap/i })).toBeInTheDocument();
    });

    it('allows input entry', () => {
        render(<LoginPage />);

        const emailInput = screen.getByLabelText(/Email/i) as HTMLInputElement;
        fireEvent.change(emailInput, { target: { value: 'test@example.com' } });

        expect(emailInput.value).toBe('test@example.com');
    });
});
