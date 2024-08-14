import { PlayFab, PlayFabClient, PlayFabServer } from "playfab-sdk";

export async function processItemInventoryUser(productsId, token) {
  try {
    console.log("Iniciando proceso de verificación de items...");

    PlayFab._internalSettings.sessionTicket = token.data.PFsessionUser;

    // Verificar si el item existe en el catálogo
    console.log("Verificando si el item existe en el catálogo...");
    const catalogItems = await new Promise((resolve, reject) => {
      PlayFabClient.GetCatalogItems({ CatalogVersion: "HLS1" }, (errors, result) => {
        if (result) {
          resolve(result.data.Catalog);
        } else {
          reject(errors);
        }
      });
    });

    const itemExists = productsId.every((p) =>
      catalogItems.some((i) => i.ItemId === p)
    );

    if (!itemExists) {
      console.log("Item no encontrado en el catálogo.");
      return { message: "Item no existe", isSuccess: false };
    }
    console.log("Items verificados en el catálogo.");

    // Verificar si el item está duplicado en el inventario del usuario
    console.log("Verificando si el item está duplicado en el inventario del usuario...");
    const userInventory = await new Promise((resolve, reject) => {
      PlayFabServer.GetUserInventory({ PlayFabId: token.data.PFuserId }, (error, result) => {
        if (result) {
          resolve(result.data.Inventory);
        } else {
          reject(error);
        }
      });
    });

    const isDuplicated = productsId.some((p) =>
      userInventory.some((i) => i.ItemId === p)
    );

    if (isDuplicated) {
      console.log("Item duplicado en el inventario del usuario.");
      return {
        message: "El producto está duplicado en el inventario",
        isSuccess: false,
      };
    }
    console.log("Item no duplicado en el inventario del usuario.");

    // Agregar el item al inventario del usuario
    console.log("Agregando item al inventario del usuario...");
    const addItemResult = await new Promise((resolve, reject) => {
      PlayFabServer.GrantItemsToUser(
        {
          CatalogVersion: "HLS1",
          ItemIds: productsId,
          PlayFabId: token.data.PFuserId,
        },
        (error, result) => {
          if (result) {
            resolve(result);
          } else {
            reject(error);
          }
        }
      );
    });

    if (!addItemResult) {
      console.log("Ocurrió un error al agregar el item al inventario.");
      return {
        message: "Ocurrió un error al agregar el item",
        isSuccess: false,
      };
    }
    console.log("Item agregado al inventario del usuario.");

    return { message: "Item agregado", isSuccess: true };
  } catch (err) {
    console.error("Error en processItemInventoryUser:", err);
    return {
      message: "Error al procesar el inventario del usuario",
      isSuccess: false,
      error: err.message || err,
    };
  }
}
