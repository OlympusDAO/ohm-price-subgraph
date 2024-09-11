import {
  Address,
  BigDecimal,
  BigInt,
  Bytes,
  ethereum,
} from "@graphprotocol/graph-ts";
import { PriceSnapshot } from "../generated/schema";
import { UniswapV2Pair } from "../generated/sOHM_v1/UniswapV2Pair";
import { ChainlinkPriceFeed } from "../generated/sOHM_v1/ChainlinkPriceFeed";
import {
  V0_UNISWAP_V2_PAIR_START_BLOCK,
  OHM_V1,
  OHM_V2,
  DAI,
  WETH,
  V1_UNISWAP_V2_PAIR_START_BLOCK,
  V0_UNISWAP_V2_PAIR,
  V1_UNISWAP_V2_PAIR,
} from "./constants";
import { toDecimal } from "./dateHelper";

function getVersion(block: ethereum.Block): BigInt {
  if (block.number.lt(V1_UNISWAP_V2_PAIR_START_BLOCK)) {
    return BigInt.fromI32(0);
  }

  return BigInt.fromI32(1);
}

function getToken(block: ethereum.Block): Bytes {
  const version = getVersion(block);

  if (version.equals(BigInt.fromI32(0))) {
    return Bytes.fromHexString(OHM_V1);
  }

  return Bytes.fromHexString(OHM_V2);
}

function getEthChainlinkPrice(): BigDecimal {
  const ethPrice = ChainlinkPriceFeed.bind(
    Address.fromString("0x5f4ec3df9cbd43714fe2740f5e3616155c5b8419"),
  );
  const price = ethPrice.latestAnswer();

  return toDecimal(price, 8);
}

function getUniswapV2Price(pair: Address, ohm: Address): BigDecimal {
  const pairContract = UniswapV2Pair.bind(pair);

  const reserves = pairContract.getReserves();

  // Determine which token is OHM
  const token0 = pairContract.token0();
  const token1 = pairContract.token1();

  const otherToken = token0.equals(ohm) ? token1 : token0;

  const ohmReserves = toDecimal(
    token0.equals(ohm) ? reserves.value0 : reserves.value1,
    9,
  );
  const otherReserves = toDecimal(
    token0.equals(ohm) ? reserves.value1 : reserves.value0,
    18,
  );

  // DAI is easy
  if (otherToken.equals(Address.fromString(DAI))) {
    return otherReserves.div(ohmReserves);
  }

  // If it is WETH, we need to get the ETH price from chainlink
  if (otherToken.equals(Address.fromString(WETH))) {
    const ethPrice = getEthChainlinkPrice();

    return otherReserves.times(ethPrice).div(ohmReserves);
  }

  throw new Error("Unknown token: " + otherToken.toHexString());
}

class PriceResult {
  price: BigDecimal;
  source: Bytes;
}

function getPrice(block: ethereum.Block): PriceResult {
  // If before start block, return 0
  if (block.number.lt(V0_UNISWAP_V2_PAIR_START_BLOCK)) {
    return { price: BigDecimal.fromString("0"), source: Bytes.fromUTF8("") };
  }

  // If before the V2 pair start block, use the V1 pair
  if (block.number.lt(V1_UNISWAP_V2_PAIR_START_BLOCK)) {
    return {
      price: getUniswapV2Price(
        Address.fromString(V0_UNISWAP_V2_PAIR),
        Address.fromString(OHM_V1),
      ),
      source: Bytes.fromHexString(V0_UNISWAP_V2_PAIR),
    };
  }

  // Use the V2 pair
  return {
    price: getUniswapV2Price(
      Address.fromString(V1_UNISWAP_V2_PAIR),
      Address.fromString(OHM_V2),
    ),
    source: Bytes.fromHexString(V1_UNISWAP_V2_PAIR),
  };

  // TODO: add support for Balancer, Uniswap V3 pools
}

export function savePriceSnapshot(
  block: ethereum.Block,
  index: BigDecimal,
): void {
  const entity = new PriceSnapshot(Bytes.fromI32(block.number.toI32()));

  entity.blockNumber = block.number;
  entity.blockTimestamp = block.timestamp;
  entity.date = new Date(block.timestamp.toI64() * 1000).toISOString();

  entity.version = getVersion(block);
  entity.index = index;
  entity.token = getToken(block);

  const priceResult = getPrice(block);
  entity.price = priceResult.price;
  entity.priceSource = priceResult.source;
  entity.indexAdjustedPrice = entity.price.times(index);

  entity.save();
}
