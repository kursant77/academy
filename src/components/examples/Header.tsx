import { Header } from "../Header";
import { ThemeProvider } from "@/contexts/ThemeProvider";

export default function HeaderExample() {
  return (
    <ThemeProvider>
      <Header />
    </ThemeProvider>
  );
}
