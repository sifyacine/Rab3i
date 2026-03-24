import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ShieldAlert, ArrowRight, Home } from "lucide-react";
import { Button } from "@/components/ui/button";

const ForbiddenPage = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-6 text-right" dir="rtl">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-md w-full text-center space-y-6"
      >
        <div className="relative inline-block">
          <div className="p-6 rounded-3xl bg-destructive/10 text-destructive mb-2 relative z-10">
            <ShieldAlert size={64} strokeWidth={1.5} />
          </div>
          <div className="absolute -inset-4 bg-destructive/5 blur-2xl rounded-full" />
        </div>
        
        <div className="space-y-2">
          <h1 className="text-4xl font-black text-foreground">403</h1>
          <h2 className="text-2xl font-bold text-foreground">غير مصرح لك بالدخول</h2>
          <p className="text-muted-foreground leading-relaxed">
            عذراً، لا تمتلك الصلاحيات الكافية للوصول إلى هذه الصفحة. يرجى التأكد من تسجيل الدخول بالحساب الصحيح.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 pt-4">
          <Button asChild variant="default" className="flex-1 gap-2 bg-gradient-brand shadow-lg shadow-primary/20 h-12 rounded-xl">
            <Link to="/"><Home size={18} /> العودة للرئيسية</Link>
          </Button>
          <Button asChild variant="outline" className="flex-1 gap-2 h-12 rounded-xl">
            <Link to="/login">تسجيل الدخول <ArrowRight size={18} /></Link>
          </Button>
        </div>
      </motion.div>
    </div>
  );
};

export default ForbiddenPage;
