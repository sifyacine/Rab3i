import { motion } from "framer-motion";
import { FolderOpen } from "lucide-react";
import { Button } from "./button";

interface EmptyStateProps {
  title: string;
  description: string;
  actionText?: string;
  onAction?: () => void;
  icon?: any;
}

export const EmptyState = ({ title, description, actionText, onAction, icon: Icon = FolderOpen }: EmptyStateProps) => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center p-12 text-center rounded-2xl border-2 border-dashed border-border/40 bg-card/30"
    >
      <div className="p-4 rounded-full bg-primary/10 text-primary mb-4">
        <Icon size={40} strokeWidth={1.5} />
      </div>
      <h3 className="text-lg font-bold text-foreground mb-2">{title}</h3>
      <p className="text-sm text-muted-foreground max-w-xs mb-6 leading-relaxed">{description}</p>
      {actionText && onAction && (
        <Button onClick={onAction} className="rounded-xl px-8 bg-gradient-brand shadow-lg shadow-primary/20">
          {actionText}
        </Button>
      )}
    </motion.div>
  );
};
