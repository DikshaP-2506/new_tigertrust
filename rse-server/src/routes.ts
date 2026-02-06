import { Router } from "express";
import { buildFeatures } from "./features";
import { computeTigerScore } from "./scoring";
import { getTier } from "./tier";

const router = Router();

router.post("/risk/recalculate", async (req, res) => {
const { wallet } = req.body;

if (!wallet) {
return res.status(400).json({ error: "wallet required" });
}

try {
const features = await buildFeatures(wallet);
const score = computeTigerScore(features);
const tier = getTier(score);


res.json({
  wallet,
  score,
  tier,
  features_used: features
});

}
catch (e: any) {
console.log("========== RSE ERROR ==========");
console.log(e?.response?.data || e.message || e);
console.log("================================");

res.status(500).json({
error: "failed to read wallet data",
detail: e?.message
});
}
});


export default router;