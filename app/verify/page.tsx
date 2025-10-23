import axios from "axios";
import {createAccessToken, createSignature} from "@/lib/sumsub";
import SumsubWidget from "@/app/verify/sumsubWidget";

axios.interceptors.request.use(createSignature, function (error) {
    return Promise.reject(error);
})

export default async function Verify() {
    const externalUserId = "johndoeu";
    const levelName = "id-only";

    let token: string | null = null;
    let error: string | null = null;

    try {
        const response = await axios(createAccessToken(externalUserId, levelName, 1200));
        token = response.data.token;
    } catch (err: any) {
        error = err.response?.data?.message || "Failed to fetch token";
    }

    if (!token) {
        return <p className="text-center text-red-500 mt-20">Failed to load verification, {error}</p>;
    }

    return <SumsubWidget accessToken={token} />;
}