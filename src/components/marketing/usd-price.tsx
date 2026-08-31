type UsdPriceProps = {
  amount: string;
  qualifier?: string;
  suffix?: string;
};

export function UsdPrice({ amount, qualifier, suffix }: UsdPriceProps) {
  return (
    <>
      {qualifier ? `${qualifier} ` : null}
      <span dangerouslySetInnerHTML={{ __html: "&#36;" }} />
      {amount}
      {suffix}
    </>
  );
}
