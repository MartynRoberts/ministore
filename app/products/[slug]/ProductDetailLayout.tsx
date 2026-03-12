import type { ReactNode } from "react";

type Props = {
  breadcrumb: ReactNode;
  image: ReactNode;
  details: ReactNode;
  recommendations?: ReactNode;
};

export default function ProductDetailLayout({
  breadcrumb,
  image,
  details,
  recommendations,
}: Props) {
  return (
    <div className="mx-auto my-16 w-full max-w-[1680px] px-4">
      <div>{breadcrumb}</div>

      <div className="mt-16 flex flex-col justify-between gap-10 lg:flex-row">
        <div className="w-full max-w-full aspect-square lg:max-w-[800px]">
          {image}
        </div>

        <div className="lg:max-w-[700px]">{details}</div>
      </div>

      {recommendations}
    </div>
  );
}