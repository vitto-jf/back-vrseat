import { PlayFabAdmin, PlayFabClient, PlayFabServer } from "playfab-sdk";
import { CompileErrorReport } from "../../utils/utils.js";
import { error } from "console";
import { playfabConfig } from "../../config/playfab.js";
import { getDataSponsor } from "../sponsor/index.js";

PlayFabServer.settings.developerSecretKey = playfabConfig.secretKey;
export async function addItemToUserInventory(itemId, userId, objectData) {
  try {
    if (itemId === undefined || userId === undefined) throw Error("Bad params");
    console.log(`addItemToUserInventory( ${itemId} , ${userId}`);
    PlayFabServer.GrantItemsToUser(
      {
        CatalogVersion: "HLS1",
        ItemIds: itemId,
        PlayFabId: userId,
      },
      async (error, result) => {
        console.log(result);
        if (result !== null) {
          console.log(result.data.ItemGrantResults);

          await addCustomDataItemInventory(
            result.data.ItemGrantResults[0].ItemInstanceId,
            userId,
            objectData
          );
          return result;
        } else if (error !== null) {
          console.log("error: " + CompileErrorReport(error));
          return error;
        }
      }
    );
  } catch (error) {
    console.log(CompileErrorReport(error));
    return error;
  }
}

export async function addCustomDataItemInventory(
  ItemInstanceId,
  userId,
  objectData
) {
  try {
    if (ItemInstanceId === undefined || userId === undefined)
      throw Error("Bad params");
    console.log(`MODIFY USER( ${ItemInstanceId} , ${userId}`);

    PlayFabServer.UpdateUserInventoryItemCustomData(
      {
        ItemInstanceId: ItemInstanceId,
        PlayFabId: userId,
        Data: objectData,
      },
      (error, result) => {
        console.log(result);
        if (result !== null) {
          console.log(result.data);
          console.log(result);

          return result;
        } else if (error !== null) {
          console.log("error: " + CompileErrorReport(error));
          return error;
        }
      }
    );
  } catch (error) {
    console.log(CompileErrorReport(error));
    return error;
  }
}
