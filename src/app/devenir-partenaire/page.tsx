import { Metadata } from "next";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import DevenirPartenaireForm from "@/components/public/DevenirPartenaireForm";

export const metadata: Metadata = {
  title: "Devenir Partenaire — Immelio Transaction",
  description: "Rejoignez le réseau de partenaires Immelio Transaction. Accédez à des outils exclusifs, programmes neufs et commissions attractives.",
};

export default function DevenirPartenairePage() {
  return (
    <>
      <Header />
      <DevenirPartenaireForm />
      <Footer />
    </>
  );
}
