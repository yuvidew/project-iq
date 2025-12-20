import { SignUpForm } from '@/features/auth/_components/sign-up-from'
import { requireUnAuth } from '@/lib/auth-utils'
import React from 'react'

const SignUpPage = async () => {
    await requireUnAuth()
    return (
        <SignUpForm/>
    )
}

export default SignUpPage