import dotenv from "dotenv";
dotenv.config('/.env');
export const sk = process.env.STRIPE_SECRET_KEY;

export const wh = process.env.WH_SECRET;


console.log(process.env.S_SECRET_KEY)

