import { Address, BigDecimal } from "@graphprotocol/graph-ts";
import {
  LogRebase as LogRebaseEvent,
  sOHM_v2,
} from "../generated/sOHM_v2/sOHM_v2";
import { savePriceSnapshot } from "./priceSnapshot";
import { SOHM_V2 } from "./constants";
import { toDecimal } from "./dateHelper";

function getIndex(): BigDecimal {
  const sOhmContract = sOHM_v2.bind(Address.fromString(SOHM_V2));

  return toDecimal(sOhmContract.index(), 9);
}

export function handleLogRebase(event: LogRebaseEvent): void {
  // Save the price snapshot
  savePriceSnapshot(event.block, getIndex());
}
