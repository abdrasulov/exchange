import axios from "axios";
import {createAccessToken, createSignature} from "@/lib/sumsub";

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

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-6">
            <script src="https://static.sumsub.com/idensic/static/sns-websdk-builder.js"></script>
            <div id="sumsub-websdk-container"></div>

            {error && <p className="text-red-500 mb-4">{error}</p>}
            {token ? (
                <div className="bg-white p-6 rounded-2xl shadow-lg">
                    <h2 className="text-xl font-bold mb-2 text-gray-800">Access Token</h2>
                    <p className="font-mono break-all text-gray-700">{token}</p>
                </div>
            ) : (
                <p className="text-gray-600">No token available</p>
            )}
        </div>
    );
}