import { redis } from "./redis";


export default async function handler(req: any, res: any) {
  await redis.set("hello", "world");

  const value = await redis.get("hello");

  res.status(200).json({
    value,
  });
}
