#[test_only]
module suiyan_play::tests {
    use suiyan_play::lottery;
    use suiyan_token::suiyan::{Self as token, SUIYAN};
    use sui::random::{Self, Random};
    use sui::test_scenario::{Self as ts};
    use sui::test_utils::{Self};
    use sui::coin::{Self, TreasuryCap};
    use sui::sui::SUI;

    const ADMIN: address = @0xAD;
    const PLAYER: address = @0x1;
    const LOTTERY_PRIZE: u64 = 100_000_000; // 0.1 SUIYAN tokens
    const FEE: u64 = 15_000_000; // 0.015 SUI

    #[test]
    fun test_create_lottery_and_pick() {
        let mut scenario = ts::begin(@0x0);
        let mut treasury = token::init_for_testing(ts::ctx(&mut scenario));
        random::create_for_testing(ts::ctx(&mut scenario));
        ts::next_tx(&mut scenario, ADMIN);

        // Create lottery with SUIYAN tokens as prize
        {
            let payment = coin::mint(&mut treasury, LOTTERY_PRIZE, ts::ctx(&mut scenario));
            lottery::create_lottery(payment, FEE, ts::ctx(&mut scenario));
        };
        ts::next_tx(&mut scenario, PLAYER);

        // Pick a slot (fee is in SUI)
        {
            let mut lottery = ts::take_shared<lottery::Lottery>(&scenario);
            let r = ts::take_shared<Random>(&scenario);
            let fee_payment = coin::mint_for_testing<SUI>(FEE, ts::ctx(&mut scenario));

            lottery::pick_slot(0, &mut lottery, &r, fee_payment, ts::ctx(&mut scenario));
            assert!(lottery::get_slot(&lottery, 0) == true, 1);

            ts::return_shared(lottery);
            ts::return_shared(r);
        };

        test_utils::destroy(treasury);
        ts::end(scenario);
    }

    #[test]
    fun test_winner_can_collect_prize() {
        let mut scenario = ts::begin(@0x0);
        let mut treasury = token::init_for_testing(ts::ctx(&mut scenario));
        random::create_for_testing(ts::ctx(&mut scenario));
        ts::next_tx(&mut scenario, ADMIN);

        {
            let payment = coin::mint(&mut treasury, LOTTERY_PRIZE, ts::ctx(&mut scenario));
            lottery::create_lottery(payment, FEE, ts::ctx(&mut scenario));
        };
        ts::next_tx(&mut scenario, PLAYER);

        // Keep picking slots until someone wins
        {
            let mut lottery = ts::take_shared<lottery::Lottery>(&scenario);
            let r = ts::take_shared<Random>(&scenario);

            let mut i = 0;
            while (lottery::is_active(&lottery) && i < lottery::slot_count()) {
                if (!lottery::get_slot(&lottery, i)) {
                    let fee = coin::mint_for_testing<SUI>(FEE, ts::ctx(&mut scenario));
                    lottery::pick_slot(i, &mut lottery, &r, fee, ts::ctx(&mut scenario));
                };
                i = i + 1;
            };

            assert!(!lottery::is_active(&lottery), 1);
            ts::return_shared(lottery);
            ts::return_shared(r);
        };

        ts::next_tx(&mut scenario, PLAYER);

        // Winner collects prize
        {
            let mut lottery = ts::take_shared<lottery::Lottery>(&scenario);
            lottery::collect_prize(&mut lottery, ts::ctx(&mut scenario));
            ts::return_shared(lottery);
        };

        test_utils::destroy(treasury);
        ts::end(scenario);
    }

    #[test]
    fun test_creator_can_collect_fees() {
        let mut scenario = ts::begin(@0x0);
        let mut treasury = token::init_for_testing(ts::ctx(&mut scenario));
        random::create_for_testing(ts::ctx(&mut scenario));
        ts::next_tx(&mut scenario, ADMIN);

        {
            let payment = coin::mint(&mut treasury, LOTTERY_PRIZE, ts::ctx(&mut scenario));
            lottery::create_lottery(payment, FEE, ts::ctx(&mut scenario));
        };
        ts::next_tx(&mut scenario, PLAYER);

        // Pick a slot
        {
            let mut lottery = ts::take_shared<lottery::Lottery>(&scenario);
            let r = ts::take_shared<Random>(&scenario);
            let fee_payment = coin::mint_for_testing<SUI>(FEE, ts::ctx(&mut scenario));
            lottery::pick_slot(0, &mut lottery, &r, fee_payment, ts::ctx(&mut scenario));
            ts::return_shared(lottery);
            ts::return_shared(r);
        };

        ts::next_tx(&mut scenario, ADMIN);

        // Creator collects fees
        {
            let mut lottery = ts::take_shared<lottery::Lottery>(&scenario);
            lottery::collect_fee(&mut lottery, ts::ctx(&mut scenario));
            ts::return_shared(lottery);
        };

        test_utils::destroy(treasury);
        ts::end(scenario);
    }
}
