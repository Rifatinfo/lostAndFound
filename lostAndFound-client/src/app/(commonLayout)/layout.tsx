
import { Header } from "@/components/shared/navbar/Header";
import { LoginToastProvider } from "@/components/modules/auth/LoginToastProvider";

const CommonLayout = ({ children }: { children: React.ReactNode }) => {

    return (
        <>
            <LoginToastProvider />
            <Header/>
            {children}
        </>
    );
};

export default CommonLayout;