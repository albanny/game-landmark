import { Address, BigInt } from "@graphprotocol/graph-ts";
import { createAccount } from "./account";
import { LandmarkMinted } from "./entities/PIXLandmark/PIXLandmark";
import { LandmarkType, Landmark, Account } from "./entities/schema";

export function handleLandmarkMinted(event: LandmarkMinted): void {
  let landmark = new Landmark(event.params.tokenId.toString());
  createAccount(event.params.account);
  landmark.account = event.params.account.toHexString();
  landmark.tokenId = event.params.tokenId;
  landmark.category = BigInt.fromI32(event.params.category);
  createLandmarkType(event.params.landmarkType);
  landmark.landmarkType = event.params.landmarkType.toString();
  landmark.save();

  let account = Account.load(event.params.account.toHexString());
  account.balance = account.balance.plus(BigInt.fromI32(1));
  account.save();
}

export function createLandmarkType(type: BigInt): void {
  let landmarkType = LandmarkType.load(type.toString());

  if (landmarkType == null) {
    landmarkType = new LandmarkType(type.toString());
    landmarkType.landmarkType = type;
  }

  landmarkType.save();
}
