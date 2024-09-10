import { Address, BigDecimal } from "@graphprotocol/graph-ts";
import {
  LogRebase as LogRebaseEvent,
  sOHM_v3,
} from "../generated/sOHM_v3/sOHM_v3";
import { savePriceSnapshot } from "./priceSnapshot";
import { SOHM_V3 } from "./constants";

function getIndex(): BigDecimal {
  const sOhmContract = sOHM_v3.bind(Address.fromString(SOHM_V3));

  return sOhmContract.index().toBigDecimal();
}

export function handleLogRebase(event: LogRebaseEvent): void {
  // Save the price snapshot
  savePriceSnapshot(event.block, getIndex());
}
