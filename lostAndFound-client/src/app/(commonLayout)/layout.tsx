
import { AppShell } from "@/components/modules/layout/AppShell";
import { LoginToastProvider } from "@/components/modules/auth/LoginToastProvider";

const CommonLayout = ({ children }: { children: React.ReactNode }) => {
    return (
        <>
            <LoginToastProvider />
            <AppShell>{children}</AppShell>
        </>
    );
};

export default CommonLayout;
