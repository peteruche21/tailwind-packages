export type Coin = {
  readonly denom: string;
  readonly amount: string;
}

export type AminoMsg = {
  readonly type: string;
  readonly value: any;
}

export type StdFee = {
  readonly amount: readonly Coin[];
  readonly gas: string;
  /** The granter address that is used for paying with feegrants */
  readonly granter?: string;
  /** The fee payer address. The payer must have signed the transaction. */
  readonly payer?: string;
}

export type StdSignDoc = {
  readonly chain_id: string;
  readonly account_number: string;
  readonly sequence: string;
  readonly fee: StdFee;
  readonly msgs: readonly AminoMsg[];
  readonly memo: string;
}

export type Algo = "secp256k1" | "ed25519" | "sr25519";

export type AccountData = {
  /** A printable address (typically bech32 encoded) */
  readonly address: string;
  readonly algo: Algo;
  readonly pubkey: Uint8Array;
}

export type Pubkey = {
  readonly type: string;
  readonly value: any;
}

export type StdSignature = {
  readonly pub_key: Pubkey;
  readonly signature: string;
}

export interface AminoSignResponse {
  /**
   * The sign doc that was signed.
   * This may be different from the input signDoc when the signer modifies it as part of the signing process.
   */
  readonly signed: StdSignDoc;
  readonly signature: StdSignature;
}

export interface OfflineAminoSigner {
  /**
   * Get AccountData array from wallet. Rejects if not enabled.
   */
  readonly getAccounts: () => Promise<readonly AccountData[]>;
  /**
   * Request signature from whichever key corresponds to provided bech32-encoded address. Rejects if not enabled.
   *
   * The signer implementation may offer the user the ability to override parts of the signDoc. It must
   * return the doc that was signed in the response.
   *
   * @param signerAddress The address of the account that should sign the transaction
   * @param signDoc The content that should be signed
   */
  readonly signAmino: (signerAddress: string, signDoc: StdSignDoc) => Promise<AminoSignResponse>;
}


export interface SignDoc {
  /**
   * body_bytes is protobuf serialization of a TxBody that matches the
   * representation in TxRaw.
   */
  bodyBytes: Uint8Array;
  /**
   * auth_info_bytes is a protobuf serialization of an AuthInfo that matches the
   * representation in TxRaw.
   */
  authInfoBytes: Uint8Array;
  /**
   * chain_id is the unique identifier of the chain this transaction targets.
   * It prevents signed transactions from being used on another chain by an
   * attacker
   */
  chainId: string;
  /** account_number is the account number of the account in state */
  accountNumber: bigint;
}

export interface DirectSignResponse {
  /**
   * The sign doc that was signed.
   * This may be different from the input signDoc when the signer modifies it as part of the signing process.
   */
  readonly signed: SignDoc;
  readonly signature: StdSignature;
}

export interface OfflineDirectSigner {
  readonly getAccounts: () => Promise<readonly AccountData[]>;
  readonly signDirect: (signerAddress: string, signDoc: SignDoc) => Promise<DirectSignResponse>;
}

export type TailwindOfflineSigner = OfflineAminoSigner &
  OfflineDirectSigner &
  Readonly<{
    declareFundsRequired: (_: {
      readonly token: { denom: string; chain: string };
      readonly amount: string;
      readonly dst_chain: string;
    }) => void;
    declareMaxGasEstimate: (gas: number) => void;
  }>;

export type TailwindWallet = {
  getOfflineSigner: (chainId: string) => Promise<TailwindOfflineSigner>,
  getAccount: (chainId: string, address: string) => Promise<AccountData>,
};

export const getTailwindWallet = async (): Promise<TailwindWallet> => {
  return new Promise<TailwindWallet>((resolve, reject) => {
    const ev = new Event("tailwind.readystatechange");
    const pollTailwindReady = () => {
      if (document.readyState === "complete") {
        console.log("TailwindJS API ready, dispatching event...");
        document.dispatchEvent(ev);
      } else {
        // poll until ready
        setTimeout(pollTailwindReady, 100);
      }
    };

    pollTailwindReady();
  }) 
}
