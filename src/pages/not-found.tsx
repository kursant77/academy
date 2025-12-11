import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertCircle, Home, ArrowLeft } from "lucide-react";
import { Link } from "wouter";
import { SEO } from "@/components/SEO";

export default function NotFound() {
  return (
    <>
      <SEO
        title="404 - Sahifa topilmadi"
        description="Siz qidirayotgan sahifa topilmadi. Bosh sahifaga qayting yoki boshqa sahifalarni ko'rib chiqing."
        noindex={true}
        nofollow={true}
      />
      <div className="min-h-screen w-full flex items-center justify-center bg-background p-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6 text-center">
            <div className="flex justify-center mb-4">
              <AlertCircle className="h-16 w-16 text-destructive" />
            </div>
            <h1 className="text-3xl font-bold mb-2">404</h1>
            <h2 className="text-xl font-semibold mb-4 text-muted-foreground">
              Sahifa topilmadi
            </h2>
            <p className="text-sm text-muted-foreground mb-6">
              Kechirasiz, siz qidirayotgan sahifa mavjud emas yoki o'chirilgan bo'lishi mumkin.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button asChild>
                <Link href="/">
                  <Home className="h-4 w-4 mr-2" />
                  Bosh sahifaga
                </Link>
              </Button>
              <Button variant="outline" onClick={() => window.history.back()}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Orqaga
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
