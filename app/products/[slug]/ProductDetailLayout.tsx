import type { ReactNode } from "react";
import { PageContainer } from "@/components/ui/Layout";

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
    <PageContainer>
      <div>{breadcrumb}</div>

      <div className="mt-16 flex flex-col justify-between gap-10 lg:flex-row">
        <div className="w-full max-w-full aspect-square lg:max-w-[800px]">
          {image}
        </div>

        <div className="lg:max-w-[700px]">{details}</div>
      </div>

      {recommendations}
    </PageContainer>
  );
}
