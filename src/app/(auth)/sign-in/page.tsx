import { SignInForm } from '@/features/auth/_components/sign-in-from'
import { requireUnAuth } from '@/lib/auth-utils';

const SignInPage = async() => {
    await  requireUnAuth();
    return (
        <SignInForm/>
    )
}

export default SignInPage