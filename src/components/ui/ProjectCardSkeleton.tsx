import { motion } from "framer-motion";

export default function ProjectCardSkeleton({ index }: { index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: index * 0.05 }}
      className="relative h-full overflow-hidden rounded-2xl bg-gradient-to-br from-muted/50 to-muted/30"
    >
      <motion.div
        animate={{
          x: ["-100%", "100%"],
        }}
        transition={{
          duration: 1.5,
          repeat: Infinity,
          ease: "linear",
        }}
        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent"
      />
      
      <div className="absolute inset-0 flex flex-col justify-end p-6 space-y-3">
        <div className="h-6 w-20 rounded-full bg-white/10" />
        <div className="h-8 w-3/4 rounded-lg bg-white/10" />
        <div className="flex gap-2">
          <div className="h-5 w-16 rounded bg-white/10" />
          <div className="h-5 w-20 rounded bg-white/10" />
        </div>
      </div>
    </motion.div>
  );
}
