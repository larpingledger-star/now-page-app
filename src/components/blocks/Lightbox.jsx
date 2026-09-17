import React, { useEffect } from "react";
import { createPortal } from "react-dom";
import { motion } from "framer-motion";
import { X } from "lucide-react";
import { Image as UIImage } from "@/components/ui/image";

export default function Lightbox({ src, caption, onClose }) {
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [onClose]);

  return createPortal(
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="fixed inset-0 z-[70] flex items-center justify-center bg-black/85 p-4 sm:p-8"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Image fullscreen view"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.97 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.98 }}
        transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
        className="flex h-[82vh] w-full max-w-[1100px] items-center justify-center"
        onClick={(e) => e.stopPropagation()}
      >
        <UIImage src={src} alt={caption || ""} fittingType="fit" className="h-full w-full" />
      </motion.div>
      {caption && (
        <p className="absolute bottom-5 left-0 right-0 px-6 text-center font-mono text-[12px] tracking-wide text-white/70">
          {caption}
        </p>
      )}
      <button
        type="button"
        onClick={onClose}
        aria-label="Close"
        className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white/90 transition-colors hover:bg-white/20"
      >
        <X className="h-5 w-5" />
      </button>
    </motion.div>,
    document.body
  );
}