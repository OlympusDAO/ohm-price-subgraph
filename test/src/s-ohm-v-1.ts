import {
  Approval as ApprovalEvent,
  LogMonetaryPolicyUpdated as LogMonetaryPolicyUpdatedEvent,
  LogRebase as LogRebaseEvent,
  OwnershipTransferred as OwnershipTransferredEvent,
  Transfer as TransferEvent
} from "../generated/sOHM_v1/sOHM_v1"
import {
  Approval,
  LogMonetaryPolicyUpdated,
  LogRebase,
  OwnershipTransferred,
  Transfer
} from "../generated/schema"

export function handleApproval(event: ApprovalEvent): void {
  let entity = new Approval(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.owner = event.params.owner
  entity.spender = event.params.spender
  entity.value = event.params.value

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleLogMonetaryPolicyUpdated(
  event: LogMonetaryPolicyUpdatedEvent
): void {
  let entity = new LogMonetaryPolicyUpdated(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.monetaryPolicy = event.params.monetaryPolicy

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleLogRebase(event: LogRebaseEvent): void {
  let entity = new LogRebase(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.epoch = event.params.epoch
  entity.totalSupply = event.params.totalSupply

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleOwnershipTransferred(
  event: OwnershipTransferredEvent
): void {
  let entity = new OwnershipTransferred(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.previousOwner = event.params.previousOwner
  entity.newOwner = event.params.newOwner

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleTransfer(event: TransferEvent): void {
  let entity = new Transfer(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.from = event.params.from
  entity.to = event.params.to
  entity.value = event.params.value

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}
