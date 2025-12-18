export type Balance = {
    id: string;
    symbol: string;
    name: string;
    balance: number;
};

export type Token = {
    id: string;
    symbol: string;
    name: string;
    contractAddress: string;
    decimals: number;
}
