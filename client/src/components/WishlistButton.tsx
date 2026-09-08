import { Heart } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { startLogin } from "@/const";
import { useAuth } from "@/_core/hooks/useAuth";

export default function WishlistButton({ productHandle, compact = false }: { productHandle: string; compact?: boolean }) {
  const { isAuthenticated } = useAuth();
  const [saved, setSaved] = useState(false);

  const toggle = () => {
    if (!isAuthenticated) {
      toast("Sign in to save this item", { action: { label: "Sign in", onClick: () => startLogin() } });
      return;
    }
    setSaved(current => !current);
    toast(saved ? "Removed from saved items" : "Saved for later");
  };

  return <button type="button" onClick={toggle} aria-label={saved ? "Remove from wishlist" : "Save to wishlist"} data-product-handle={productHandle} className={`${compact ? "grid size-10" : "inline-flex gap-2 px-3 py-2"} items-center justify-center rounded-full border border-white/20 bg-black/35 text-[#f0ece6] backdrop-blur-md transition hover:border-[#d9e9f8] hover:text-[#d9e9f8] ${saved ? "border-[#d9e9f8] text-[#d9e9f8]" : ""}`}><Heart className={`size-4 ${saved ? "fill-current" : ""}`} /></button>;
}
