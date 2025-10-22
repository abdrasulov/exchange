"use client";
import { useTurnkey, AuthState } from "@turnkey/react-wallet-kit";

function LoginButton() {
    const { handleLogin } = useTurnkey();
    return <button onClick={handleLogin}>Login / Sign Up</button>;
}

function AuthStatus() {
    const { authState, user, handleLogin } = useTurnkey();
    console.log("user");
    console.log(user);

    return (
        <div>
            {authState === AuthState.Authenticated ? (
                <p>Welcome back, {user?.userName}!</p>
            ) : (
                <button onClick={handleLogin}>Log in</button>
            )}

            <p>
                {authState}
            </p>
        </div>
    );
}
export default function Home() {
    return (
        <AuthStatus />
    );
}
