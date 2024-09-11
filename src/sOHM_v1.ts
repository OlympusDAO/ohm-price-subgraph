import { Address, BigDecimal, BigInt, log } from "@graphprotocol/graph-ts";
import {
  LogRebase as LogRebaseEvent,
  sOHM_v1,
} from "../generated/sOHM_v1/sOHM_v1";
import { savePriceSnapshot } from "./priceSnapshot";
import { SOHM_V0 } from "./constants";
import { toDecimal } from "./dateHelper";

function getIndex(): BigDecimal {
  const sOhmContract = sOHM_v1.bind(Address.fromString(SOHM_V0));

  const totalSupply = sOhmContract.totalSupply();
  // total supply / 5e14
  const index = toDecimal(totalSupply, 9).div(
    toDecimal(BigInt.fromU64(500000000000000), 0),
  );

  return index;
}

export function handleLogRebase(event: LogRebaseEvent): void {
  // Save the price snapshot
  savePriceSnapshot(event.block, getIndex());
}
