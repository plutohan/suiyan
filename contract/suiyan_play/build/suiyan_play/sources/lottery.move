module suiyan_play::lottery;

use sui::event;
use sui::random::{Random};
use sui::random::new_generator;
use sui::coin::{Self, Coin};
use sui::sui::SUI;
use sui::balance::{Self, Balance};
use suiyan_token::suiyan::SUIYAN;

const ENotActiveLottery: u64 = 1;
const EInvalidSlot: u64 = 2;
const EInsufficientPayment: u64 = 3;
const ENotCreator: u64 = 4;
const ENotWinner: u64 = 5;
const ENoWinner: u64 = 6;
const SLOT_COUNT: u64 = 9;

// Admin fee configuration
// Purpose: When a player loses, a percentage of their entry fee goes to admin.
// This prevents abuse where attackers could exploit gas cost differences
// between winning and losing paths to gain an advantage.
// By adding a real SUI cost to losing (admin fee transfer), losing becomes
// more expensive than winning, removing any incentive to manipulate outcomes.

/// Admin capability - holder can update lottery config
public struct AdminCap has key, store {
  id: UID
}

/// Global lottery configuration - shared object
public struct LotteryConfig has key {
  id: UID,
  admin: address,
  loss_fee_bps: u64  // Fee in basis points (500 = 5%)
}
// LOTTERY_PRIZE and FEE are now parameters instead of constants
// const LOTTERY_PRIZE: u64 = 100_000_000; // 0.1 SUI in MIST (1 SUI = 1,000,000,000 MIST)
// const FEE: u64 = 15_000_000; // 0.015 SUI in MIST

public struct Lottery has key {
  id: UID,
  creator: address,
  slots: vector<bool>,
  winner: option::Option<address>,
  winning_slot: u64,
  last_picker: option::Option<address>,
  last_slot: u64,
  prize: Balance<SUIYAN>,  // Prize is in SUIYAN tokens
  remaining_fee: Balance<SUI>,    // Fees remain in SUI
  fee: u64  // Store the fee per slot for this lottery (in SUI)
}

public struct LotteryCreatedEvent has copy, drop, store {
  lottery_id: ID,
  creator: address,
  slot_count: u64,
  prize: u64,
  fee: u64
}

public struct PickedEvent has copy, drop, store {
  lottery_id: ID,
  slot_index: u64,
  won: bool,
  random_number: u64,
}

/// Initialize the lottery module - creates AdminCap and LotteryConfig
fun init(ctx: &mut tx_context::TxContext) {
  let sender = tx_context::sender(ctx);

  // Create and transfer AdminCap to deployer
  let admin_cap = AdminCap {
    id: object::new(ctx)
  };
  transfer::transfer(admin_cap, sender);

  // Create and share LotteryConfig with default values
  let config = LotteryConfig {
    id: object::new(ctx),
    admin: sender,
    loss_fee_bps: 500  // Default 5% fee
  };
  transfer::share_object(config);
}

/// Update the loss fee (only admin with AdminCap can call)
public fun update_loss_fee(
  _: &AdminCap,
  config: &mut LotteryConfig,
  new_fee_bps: u64
) {
  config.loss_fee_bps = new_fee_bps;
}

/// Update the admin address (only current admin with AdminCap can call)
public fun update_admin(
  _: &AdminCap,
  config: &mut LotteryConfig,
  new_admin: address
) {
  config.admin = new_admin;
}

public entry fun create_lottery(
  payment: Coin<SUIYAN>,  // Prize payment in SUIYAN tokens
  fee: u64,  // Fee per slot in MIST (SUI)
  ctx: &mut tx_context::TxContext
) {
  // Get the prize amount from the payment coin
  let prize_amount = coin::value(&payment);

  let creator = tx_context::sender(ctx);

  let lottery = Lottery {
    id: sui::object::new(ctx),
    creator,
    slots: make_empty_vec(SLOT_COUNT),
    winner: option::none(),
    winning_slot: 0,
    last_picker: option::none(),
    last_slot: 0,
    prize: coin::into_balance(payment),
    remaining_fee: balance::zero(),
    fee  // Store the fee for this lottery
  };

  event::emit(LotteryCreatedEvent {
    lottery_id: object::id(&lottery),
    creator,
    slot_count: SLOT_COUNT,
    prize: prize_amount,
    fee
  });

  transfer::share_object(lottery);
}

fun fill(v: &mut vector<bool>, n: u64) {
    if (n == 0) return;
    vector::push_back(v, false);
    fill(v, n - 1);
}

fun make_empty_vec(n: u64): vector<bool> {
    let mut v = vector::empty<bool>();
    fill(&mut v, n);
    v
}

fun count_unpicked_slots(slots: &vector<bool>): u64 {
    let mut count = 0;
    let mut i = 0;
    let len = vector::length(slots);
    while (i < len) {
        if (*vector::borrow(slots, i) == false) {
            count = count + 1;
        };
        i = i + 1;
    };
    count
}

entry fun pick_slot(
  slot_index: u64,
  lottery: &mut Lottery,
  config: &LotteryConfig,
  r: &Random,
  payment: Coin<SUI>,
  ctx: &mut tx_context::TxContext
): u64 {
  assert!(option::is_none(&lottery.winner), ENotActiveLottery);
  assert!(lottery.slots[slot_index] == false, EInvalidSlot);
  assert!(coin::value(&payment) == lottery.fee, EInsufficientPayment);

  // Collect the fee
  balance::join(&mut lottery.remaining_fee, coin::into_balance(payment));

  let slot = vector::borrow_mut(&mut lottery.slots, slot_index);
  * slot = true;

  // Count remaining unpicked slots
  let remaining_slots = count_unpicked_slots(&lottery.slots);

  // Generate random number and determine if won
  let random_number: u64;
  let won: bool;

  // If this is the last slot, winner is guaranteed
  if (remaining_slots == 0) {
    won = true;
    random_number = 0; // No random number needed for guaranteed win
  } else {
    let winning_number = 10000 / lottery.slots.length();
    let mut generator = new_generator(r, ctx);
    random_number = generator.generate_u64_in_range(0,10000);
    won = random_number < winning_number * 3; //@TODO this is for testing purpose
  };

  let sender = tx_context::sender(ctx);

  if (won) {
    lottery.winner = option::some(sender);
    lottery.winning_slot = slot_index;
  } else {
    // Update last picker tracking
    lottery.last_picker = option::some(sender);
    lottery.last_slot = slot_index;

    // Calculate and transfer admin fee (percentage of entry fee goes to admin on loss)
    let admin_fee = (lottery.fee * config.loss_fee_bps) / 10000;
    if (admin_fee > 0 && balance::value(&lottery.remaining_fee) >= admin_fee) {
      let admin_coin = coin::from_balance(balance::split(&mut lottery.remaining_fee, admin_fee), ctx);
      transfer::public_transfer(admin_coin, config.admin);
    };
  };

  event::emit(PickedEvent {
    lottery_id: object::id(lottery),
    slot_index,
    won,
    random_number,
  });

  random_number
}

public fun collect_fee(lottery: &mut Lottery, ctx: &mut tx_context::TxContext) {
  // Only creator can collect fees
  assert!(tx_context::sender(ctx) == lottery.creator, ENotCreator);

  let fee_amount = balance::value(&lottery.remaining_fee);
  if (fee_amount > 0) {
    let fee_coin = coin::from_balance(balance::split(&mut lottery.remaining_fee, fee_amount), ctx);
    transfer::public_transfer(fee_coin, lottery.creator);
  };
}

public fun collect_prize(lottery: &mut Lottery, ctx: &mut tx_context::TxContext) {
  // Must have a winner
  assert!(option::is_some(&lottery.winner), ENoWinner);

  // Only winner can collect prize
  let winner_addr = *option::borrow(&lottery.winner);
  assert!(tx_context::sender(ctx) == winner_addr, ENotWinner);

  let prize_amount = balance::value(&lottery.prize);
  if (prize_amount > 0) {
    // Prize is in SUIYAN tokens
    let prize_coin = coin::from_balance<SUIYAN>(balance::split(&mut lottery.prize, prize_amount), ctx);
    transfer::public_transfer(prize_coin, winner_addr);
  };
}

// Public accessor functions for testing
public fun is_active(lottery: &Lottery): bool {
  option::is_none(&lottery.winner)
}

public fun get_winner(lottery: &Lottery): option::Option<address> {
  lottery.winner
}

public fun get_slot(lottery: &Lottery, index: u64): bool {
  lottery.slots[index]
}

public fun get_slots_length(lottery: &Lottery): u64 {
  lottery.slots.length()
}

public fun get_winning_slot(lottery: &Lottery): u64 {
  lottery.winning_slot
}

public fun slot_count(): u64 {
  SLOT_COUNT
}

public fun get_creator(lottery: &Lottery): address {
  lottery.creator
}

public fun get_prize(lottery: &Lottery): u64 {
  balance::value(&lottery.prize)
}

public fun get_remaining_fee(lottery: &Lottery): u64 {
  balance::value(&lottery.remaining_fee)
}

public fun get_last_picker(lottery: &Lottery): option::Option<address> {
  lottery.last_picker
}

public fun get_last_slot(lottery: &Lottery): u64 {
  lottery.last_slot
}

public fun get_fee(lottery: &Lottery): u64 {
  lottery.fee
}

// LotteryConfig accessor functions
public fun get_config_admin(config: &LotteryConfig): address {
  config.admin
}

public fun get_config_loss_fee_bps(config: &LotteryConfig): u64 {
  config.loss_fee_bps
}

// Test-only functions
#[test_only]
public fun create_config_for_testing(ctx: &mut tx_context::TxContext): LotteryConfig {
  LotteryConfig {
    id: object::new(ctx),
    admin: tx_context::sender(ctx),
    loss_fee_bps: 500
  }
}
