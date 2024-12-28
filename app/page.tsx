import Header from "@/src/features/shared/Header";
import Home from "./Home";
import MainLayout from '@/src/features/shared/MainLayout'

export default function IndexPage() {
  return (
    <MainLayout>
      <Home/>
    </MainLayout>
  );
}
