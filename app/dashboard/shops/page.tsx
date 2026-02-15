import { Suspense } from "react";
import ShopsList from "./shopsclient";

export default function UsersPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ShopsList />
    </Suspense>
  );
}
