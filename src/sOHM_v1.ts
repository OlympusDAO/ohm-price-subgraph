import { Address, BigDecimal, BigInt, log } from "@graphprotocol/graph-ts";
import {
  LogRebase as LogRebaseEvent,
  sOHM_v1,
} from "../generated/sOHM_v1/sOHM_v1";
import { savePriceSnapshot } from "./priceSnapshot";
import { SOHM_V1 } from "./constants";
import { toDecimal } from "./dateHelper";

const UINT256_MAX = BigInt.fromString(
  "115792089237316195423570985008687907853269984665640564039457584007913129639935",
);

function getIndex(): BigDecimal {
  const sOhmContract = sOHM_v1.bind(Address.fromString(SOHM_V1));

  const fragmentSupply = BigInt.fromI32(500000).times(
    BigInt.fromI32(10).pow(9),
  );
  const totalGons = UINT256_MAX.minus(UINT256_MAX.mod(fragmentSupply));
  const totalSupply = sOhmContract.totalSupply();

  log.info("total gons: ", [totalGons.toString()]);
  log.info("total supply: ", [totalSupply.toString()]);
  log.info("gons per fragment: ", [totalGons.div(totalSupply).toString()]);
  // TODO finalise this
  const index = toDecimal(totalSupply, 9).div(toDecimal(totalGons, 9));

  return index;
}

export function handleLogRebase(event: LogRebaseEvent): void {
  // Save the price snapshot
  savePriceSnapshot(event.block, getIndex());
}
