"use client";
import {AuthState, useTurnkey} from "@turnkey/react-wallet-kit";
import {UserPage} from "@/app/userPage";
import {GuestPage} from "@/app/guestPage";

export default function Home() {
    const {authState} = useTurnkey();

    return authState === AuthState.Authenticated ? <UserPage/> : <GuestPage/>;
}
