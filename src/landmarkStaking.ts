import { Address, BigInt } from '@graphprotocol/graph-ts';
import {
  PIXLandStaked,
  PIXLandUnstaked,
} from './entities/PIXLandStaking/LandmarkStaking';
import { LandmarkStaking, Landmark, Global } from './entities/schema';

export function handleLandmarkStaked(event: PIXLandStaked): void {
  let landmarkStaking = LandmarkStaking.load(
    getLandmarkStakingId(event.params.account, event.params.tokenId)
  );
  let landmark = Landmark.load(
    getLandmarkId(event.params.account, event.params.tokenId)
  );

  if (landmarkStaking == null) {
    landmarkStaking = new LandmarkStaking(
      getLandmarkStakingId(event.params.account, event.params.tokenId)
    );
    landmarkStaking.tokenId = event.params.tokenId;
    landmarkStaking.category = landmark.category;
    landmarkStaking.amount = BigInt.fromI32(0);
    landmarkStaking.account = event.params.account.toHexString();
  }

  landmarkStaking.amount = landmarkStaking.amount.plus(event.params.amount);
  landmarkStaking.save();

  let entity = Global.load(
    getLandmarkStakingCategoryId(landmarkStaking.category)
  );
  if (entity == null) {
    entity = new Global(getLandmarkStakingCategoryId(landmarkStaking.category));
    entity.value = BigInt.fromI32(0);
  }
  entity.value = entity.value.plus(event.params.amount);
  entity.save();
}

export function handleLandmarkUnstaked(event: PIXLandUnstaked): void {
  let landmarkStaking = LandmarkStaking.load(
    getLandmarkStakingId(event.params.account, event.params.tokenId)
  );

  landmarkStaking.amount = landmarkStaking.amount.minus(event.params.amount);
  landmarkStaking.save();

  let entity = Global.load(
    getLandmarkStakingCategoryId(landmarkStaking.category)
  );
  entity.value = entity.value.minus(event.params.amount);
  entity.save();
}

function getLandmarkStakingId(account: Address, tokenId: BigInt): string {
  return (
    'PIXLandmarkStaking - ' + account.toHexString() + ' - ' + tokenId.toString()
  );
}

function getLandmarkId(account: Address, tokenId: BigInt): string {
  return 'PIXLandmark - ' + account.toHexString() + ' - ' + tokenId.toString();
}

function getLandmarkStakingCategoryId(category: BigInt): string {
  return 'PIXLandmarkStaking - Category - ' + category.toString();
}
