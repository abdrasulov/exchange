'use client';
import AssetCard from "@/components/AssetCard";

export default function AssetDetails() {
  return (
    <div className="space-y-4">
      <AssetCard
        name="Bitcoin"
        code="BTC"
        amount="0.4521 BTC"
        value="≈ $19,342.12"
        bgColor="bg-orange-100"
        textColor="text-orange-600"
        darkBgColor="dark:bg-orange-900/30"
        darkTextColor="dark:text-orange-500"
        svgComment="SVG4"
      />
      <AssetCard
        name="Ethereum"
        code="ETH"
        amount="4.102 ETH"
        value="≈ $8,450.00"
        bgColor="bg-indigo-100"
        textColor="text-indigo-600"
        darkBgColor="dark:bg-indigo-900/30"
        darkTextColor="dark:text-indigo-400"
        svgComment="SVG8"
      />
      <AssetCard
        name="USD Coin"
        code="USDC"
        amount="15,058.42 USDC"
        value="≈ $15,058.42"
        bgColor="bg-blue-100"
        textColor="text-blue-600"
        darkBgColor="dark:bg-blue-900/30"
        darkTextColor="dark:text-blue-400"
        svgComment="SVG9"
      />
    </div>
  );
}
