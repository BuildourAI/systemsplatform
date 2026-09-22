/** A configured item in the cart. The cart is the contract, so this is the record. */
export interface CartItem {
  itemId: string;
  systemId: string;
  options: Record<string, unknown>;
  freeText: Record<string, string>;
  /** Set when the buyer said they already have a missing requirement. */
  alreadyHave?: boolean;
}

export interface CartState {
  profile: Record<string, unknown>;
  profileComplete: boolean;
  /** System-level answers, keyed by system id then question key. */
  answers: Record<string, Record<string, unknown>>;
  items: CartItem[];
  /** Exactly one of each, chosen on the cart page. */
  dataLocationId: string | null;
  deploymentTargetId: string | null;
  cartNote: string;
  /** Requirements the buyer said they already run elsewhere. */
  alreadyHave: string[];
}

export const emptyCart: CartState = {
  profile: {},
  profileComplete: false,
  answers: {},
  items: [],
  dataLocationId: null,
  deploymentTargetId: null,
  cartNote: "",
  alreadyHave: [],
};
