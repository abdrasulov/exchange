import {WalletAccount} from "@turnkey/core";

export function Balances(props: { account: WalletAccount }) {
    let account = props.account;

    if (account.addressFormat == "ADDRESS_FORMAT_ETHEREUM") {
        return (
            <div>
                {account.address}
            </div>
        )
    } else {
        return (
            <div></div>
        )
    }
}