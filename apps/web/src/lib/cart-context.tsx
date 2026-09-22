"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  computeWarnings,
  computeSuggestions,
  estimateBuildSize,
  type DependencyWarning,
  type Suggestion,
} from "@buildour/catalog";
import { catalog, getItem } from "./catalog";
import { emptyCart, type CartItem, type CartState } from "./types";

/**
 * Cart state for the prototype.
 *
 * Kept in React state and mirrored to localStorage so a refresh does not lose a
 * half-built cart. Phase 1 replaces the storage layer with a `projects` row in
 * Supabase; everything above this hook stays as it is.
 */

const STORAGE_KEY = "buildour.cart.v1";

interface CartContextValue {
  cart: CartState;
  ready: boolean;
  /** Add or replace a configured item. */
  putItem: (item: CartItem) => void;
  removeItem: (itemId: string) => void;
  hasItem: (itemId: string) => boolean;
  getCartItem: (itemId: string) => CartItem | undefined;
  markAlreadyHave: (itemId: string) => void;
  unmarkAlreadyHave: (itemId: string) => void;
  setAnswers: (systemId: string, answers: Record<string, unknown>) => void;
  setProfile: (profile: Record<string, unknown>, complete?: boolean) => void;
  setDataLocation: (itemId: string | null) => void;
  setDeploymentTarget: (itemId: string | null) => void;
  setCartNote: (note: string) => void;
  clear: () => void;
  warnings: DependencyWarning[];
  suggestions: Suggestion[];
  size: ReturnType<typeof estimateBuildSize>;
  itemCount: number;
  systemsInCart: string[];
}

const CartContext = createContext<CartContextValue | null>(null);

function read(): CartState {
  if (typeof window === "undefined") return emptyCart;
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (!stored) return emptyCart;
    return { ...emptyCart, ...(JSON.parse(stored) as Partial<CartState>) };
  } catch {
    // Private windows and blocked site data both land here. An empty cart is
    // the right answer; losing the cart is better than a blank screen.
    return emptyCart;
  }
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<CartState>(emptyCart);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setCart(read());
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(cart));
    } catch {
      // Nothing to do: the cart still works for this session.
    }
  }, [cart, ready]);

  const putItem = useCallback((item: CartItem) => {
    setCart((current) => {
      const rest = current.items.filter((existing) => existing.itemId !== item.itemId);
      return {
        ...current,
        items: [...rest, item],
        // Adding something for real supersedes "I already have this".
        alreadyHave: current.alreadyHave.filter((id) => id !== item.itemId),
      };
    });
  }, []);

  const removeItem = useCallback((itemId: string) => {
    setCart((current) => ({
      ...current,
      items: current.items.filter((item) => item.itemId !== itemId),
    }));
  }, []);

  const markAlreadyHave = useCallback((itemId: string) => {
    setCart((current) => ({
      ...current,
      alreadyHave: current.alreadyHave.includes(itemId)
        ? current.alreadyHave
        : [...current.alreadyHave, itemId],
    }));
  }, []);

  const unmarkAlreadyHave = useCallback((itemId: string) => {
    setCart((current) => ({
      ...current,
      alreadyHave: current.alreadyHave.filter((id) => id !== itemId),
    }));
  }, []);

  const setAnswers = useCallback((systemId: string, answers: Record<string, unknown>) => {
    setCart((current) => ({
      ...current,
      answers: { ...current.answers, [systemId]: { ...current.answers[systemId], ...answers } },
    }));
  }, []);

  const setProfile = useCallback((profile: Record<string, unknown>, complete = false) => {
    setCart((current) => ({
      ...current,
      profile: { ...current.profile, ...profile },
      profileComplete: complete || current.profileComplete,
    }));
  }, []);

  const setDataLocation = useCallback((itemId: string | null) => {
    setCart((current) => ({ ...current, dataLocationId: itemId }));
  }, []);

  const setDeploymentTarget = useCallback((itemId: string | null) => {
    setCart((current) => ({ ...current, deploymentTargetId: itemId }));
  }, []);

  const setCartNote = useCallback((note: string) => {
    setCart((current) => ({ ...current, cartNote: note }));
  }, []);

  const clear = useCallback(() => setCart(emptyCart), []);

  /**
   * Warnings are computed from the same pure function the phase-1 server
   * generator uses, so what the buyer sees and what lands in the manifest can
   * never drift apart.
   */
  const { warnings, suggestions, size } = useMemo(() => {
    const entries = [
      ...cart.items.map((item) => ({ itemId: item.itemId })),
      ...cart.alreadyHave.map((itemId) => ({ itemId, alreadyHave: true })),
    ];
    return {
      warnings: computeWarnings(entries, catalog),
      suggestions: computeSuggestions(entries, catalog),
      // Build size counts only what is actually being built.
      size: estimateBuildSize(
        cart.items.map((item) => ({ itemId: item.itemId })),
        catalog,
      ),
    };
  }, [cart.items, cart.alreadyHave]);

  const value = useMemo<CartContextValue>(() => {
    const systemsInCart = [...new Set(cart.items.map((item) => item.systemId))];
    return {
      cart,
      ready,
      putItem,
      removeItem,
      hasItem: (itemId) => cart.items.some((item) => item.itemId === itemId),
      getCartItem: (itemId) => cart.items.find((item) => item.itemId === itemId),
      markAlreadyHave,
      unmarkAlreadyHave,
      setAnswers,
      setProfile,
      setDataLocation,
      setDeploymentTarget,
      setCartNote,
      clear,
      warnings,
      suggestions,
      size,
      itemCount: cart.items.length,
      systemsInCart,
    };
  }, [
    cart,
    ready,
    putItem,
    removeItem,
    markAlreadyHave,
    unmarkAlreadyHave,
    setAnswers,
    setProfile,
    setDataLocation,
    setDeploymentTarget,
    setCartNote,
    clear,
    warnings,
    suggestions,
    size,
  ]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartContextValue {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart must be used inside a CartProvider");
  return context;
}

/** Turns a stored option value into the words the buyer picked, for cart chips. */
export function describeOption(itemId: string, key: string, value: unknown): string | null {
  const item = getItem(itemId);
  const option = item?.options.find((candidate) => candidate.key === key);
  if (!option) return null;
  if (value === undefined || value === null || value === "") return null;

  const labelFor = (raw: unknown): string => {
    const match = option.choices?.find((choice) =>
      typeof choice === "string" ? choice === raw : choice.value === raw,
    );
    if (!match) return String(raw);
    return typeof match === "string" ? match.replace(/_/g, " ") : match.label;
  };

  // A boolean chip states the setting rather than repeating the question.
  if (option.type === "boolean") {
    if (!value) return null;
    return option.chip ?? option.label.replace(/\?$/, "");
  }
  if (option.type === "multiselect") {
    const list = Array.isArray(value) ? value : [];
    if (list.length === 0) return null;
    return list.map(labelFor).join(", ");
  }
  if (option.type === "select") return labelFor(value);
  if (option.type === "number" || option.type === "currency") {
    const words = option.unit ? `${value} ${option.unit}` : String(value);
    return option.chip ? `${option.chip}: ${words}` : words;
  }
  return String(value);
}
