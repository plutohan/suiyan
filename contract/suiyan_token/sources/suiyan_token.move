module suiyan_token::suiyan {
    use sui::coin::{Self, Coin, TreasuryCap};
    use sui::url;

    /// The SUIYAN token
    public struct SUIYAN has drop {}

    /// Initialize the token with metadata
    fun init(witness: SUIYAN, ctx: &mut TxContext) {
        let (treasury, metadata) = coin::create_currency(
            witness,
            9, // decimals
            b"SUIYAN", // symbol
            b"Suiyan Token", // name
            b"The official token for Suiyan Lottery - win big with SUIYAN!", // description
            option::some(url::new_unsafe_from_bytes(b"https://suiyan.io/token-icon.png")), // icon URL (placeholder)
            ctx
        );

        // Freeze the metadata object (makes it immutable)
        transfer::public_freeze_object(metadata);

        // Transfer the treasury cap to the deployer
        // The deployer can mint tokens as needed
        transfer::public_transfer(treasury, tx_context::sender(ctx));
    }

    /// Mint new tokens (only treasury cap holder can call this)
    public fun mint(
        treasury: &mut TreasuryCap<SUIYAN>,
        amount: u64,
        ctx: &mut TxContext
    ): Coin<SUIYAN> {
        coin::mint(treasury, amount, ctx)
    }

    /// Mint and transfer tokens to a recipient (entry function for CLI usage)
    public entry fun mint_and_transfer(
        treasury: &mut TreasuryCap<SUIYAN>,
        amount: u64,
        recipient: address,
        ctx: &mut TxContext
    ) {
        let coin = coin::mint(treasury, amount, ctx);
        transfer::public_transfer(coin, recipient);
    }

    /// Burn tokens
    public fun burn(
        treasury: &mut TreasuryCap<SUIYAN>,
        coin: Coin<SUIYAN>
    ) {
        coin::burn(treasury, coin);
    }

    #[test_only]
    /// Create treasury cap for testing
    public fun init_for_testing(ctx: &mut TxContext): TreasuryCap<SUIYAN> {
        let witness = SUIYAN {};
        let (treasury, metadata) = coin::create_currency(
            witness,
            9,
            b"SUIYAN",
            b"Suiyan Token",
            b"Test token",
            option::none(),
            ctx
        );
        transfer::public_freeze_object(metadata);
        treasury
    }
}
