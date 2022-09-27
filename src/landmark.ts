import { Address, BigInt } from "@graphprotocol/graph-ts";
import { createAccount } from "./account";
import {
  LandmarkMinted,
  TransferBatch,
  TransferSingle,
} from "./entities/PIXLandmark/PIXLandmark";
import { Landmark, Account, Global } from "./entities/schema";

let ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";

export function handleLandmarkMinted(event: LandmarkMinted): void {
  let entityId = "landmarkMinted - " + event.params.tokenId.toString();
  let entity = Global.load(entityId);
  if (entity == null) {
    entity = new Global(entityId);
    entity.value = BigInt.fromI32(0);
  }
  entity.value = entity.value.plus(event.params.amount);
  entity.save();

  let landmarkId = getLandmarkId(event.params.account, event.params.tokenId);
  let landmark = Landmark.load(landmarkId);
  if (landmark == null) {
    landmark = new Landmark(landmarkId);
    createAccount(event.params.account);
    landmark.account = event.params.account.toHexString();
    landmark.tokenId = event.params.tokenId;
    landmark.amount = BigInt.fromI32(0);
    landmark.category = BigInt.fromI32(event.params.category);
  }
  landmark.amount = landmark.amount.plus(event.params.amount);
  landmark.save();
}

export function handleTransfer(event: TransferSingle): void {
  if (event.params.from.toHexString() == ZERO_ADDRESS) {
    return;
  }

  let fromLandmarkId = getLandmarkId(event.params.from, event.params.id);
  let fromLandmark = Landmark.load(fromLandmarkId);
  fromLandmark.amount = fromLandmark.amount.minus(event.params.value);
  fromLandmark.save();

  if (event.params.to.toHexString() == ZERO_ADDRESS) {
    return;
  }

  let toLandmarkId = getLandmarkId(event.params.to, event.params.id);
  let toLandmark = Landmark.load(toLandmarkId);
  if (toLandmark == null) {
    toLandmark = new Landmark(toLandmarkId);
    createAccount(event.params.to);
    toLandmark.account = event.params.to.toHexString();
    toLandmark.tokenId = event.params.id;
    toLandmark.amount = BigInt.fromI32(0);
    toLandmark.category = fromLandmark.category;
  }
  toLandmark.amount = toLandmark.amount.plus(event.params.value);
  toLandmark.save();
}

export function handleTransferBatch(event: TransferBatch): void {
  if (event.params.from.toHexString() == ZERO_ADDRESS) {
    return;
  }

  let ids = event.params.ids;
  let values = event.params.values;
  let length = ids.length;

  for (let index = 0; index < length; index++) {
    let id = ids[index];
    let value = values[index];

    let fromLandmarkId = getLandmarkId(event.params.from, id);
    let fromLandmark = Landmark.load(fromLandmarkId);
    fromLandmark.amount = fromLandmark.amount.minus(value);
    fromLandmark.save();

    if (event.params.to.toHexString() == ZERO_ADDRESS) {
      return;
    }

    let toLandmarkId = getLandmarkId(event.params.to, id);
    let toLandmark = Landmark.load(toLandmarkId);
    if (toLandmark == null) {
      toLandmark = new Landmark(toLandmarkId);
      createAccount(event.params.to);
      toLandmark.account = event.params.to.toHexString();
      toLandmark.tokenId = id;
      toLandmark.amount = BigInt.fromI32(0);
      toLandmark.category = fromLandmark.category;
    }
    toLandmark.amount = toLandmark.amount.plus(value);
    toLandmark.save();
  }
}

function getLandmarkId(account: Address, tokenId: BigInt): string {
  return "PIXLandmark - " + account.toHexString() + " - " + tokenId.toString();
}
