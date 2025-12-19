interface AssetCardProps {
    name: string;
    code: string;
    amount: string;
    value: string;
    bgColor: string;
    textColor: string;
    darkBgColor: string;
    darkTextColor: string;
    svgComment: string;
}

const AssetCard = ({ name, code, amount, value, bgColor, textColor, darkBgColor, darkTextColor, svgComment }: AssetCardProps) => {
    return (
        <div></div>
    )
};

export default AssetCard;
