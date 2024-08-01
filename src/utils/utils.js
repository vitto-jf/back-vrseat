import crypto from 'crypto'

export const JWT_SECRET = "test";

export const ENCRYPTION_KEY = Buffer.from(
  "uN9a1gQ3KPJbbC+k1b3E9T62j90G7o3lsoJDD9SH3hQ=",
  "base64"
);
const IV_LENGTH = 16; 

// Función para cifrar
export function encrypt(text) {
  let iv = crypto.randomBytes(IV_LENGTH);
  let cipher = crypto.createCipheriv("aes-256-cbc", ENCRYPTION_KEY, iv);
  let encrypted = cipher.update(text, "utf8", "hex");
  encrypted += cipher.final("hex");
  return iv.toString("hex") + ":" + encrypted;
}

export function CompileErrorReport(error) {
    if (error == null) return "";
    let fullErrors = error.errorMessage;
    for (let paramName in error.errorDetails)
      for (let msgIdx in error.errorDetails[paramName])
        fullErrors += `\n${paramName}: ${error.errorDetails[paramName][msgIdx]}`;
    return fullErrors;
  }
// Función para descifrar
export function decrypt(text) {
  let textParts = text.split(":");
  let iv = Buffer.from(textParts.shift(), "hex");
  let encryptedText = Buffer.from(textParts.join(":"), "hex");
  let decipher = crypto.createDecipheriv("aes-256-cbc", ENCRYPTION_KEY, iv);

  try {
    let decrypted = decipher.update(encryptedText, "hex", "utf8");
    decrypted += decipher.final("utf8");
    return decrypted;
  } catch (error) {
    console.error("Error during decryption:", error);
    throw new Error("Failed to decrypt data");
  }
}