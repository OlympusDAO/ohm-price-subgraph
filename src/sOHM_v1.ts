import { LogRebase as LogRebaseEvent } from "../generated/sOHM_v1/sOHM_v1";
import { LogRebase } from "../generated/schema";
import { savePriceSnapshot } from "./priceSnapshot";

export function handleLogRebase(event: LogRebaseEvent): void {
  let entity = new LogRebase(
    event.transaction.hash.concatI32(event.logIndex.toI32()),
  );
  entity.epoch = event.params.epoch;
  entity.totalSupply = event.params.totalSupply;

  entity.blockNumber = event.block.number;
  entity.blockTimestamp = event.block.timestamp;
  entity.transactionHash = event.transaction.hash;

  entity.save();

  // Save the price snapshot
  savePriceSnapshot(event.block);
}
