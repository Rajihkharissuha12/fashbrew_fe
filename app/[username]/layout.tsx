"use client";
import Navbar from "@/app/[username]/components/Navbar";
import { useParams } from "next/navigation";
import CoffeeFooter from "../footer/page";

export default function HomeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const params = useParams();
  const username = params?.username as string;
  return (
    <>
      <Navbar username={username} />
      {children}
      <CoffeeFooter />
    </>
  );
}
