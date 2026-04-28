import { ethers } from "ethers";
import { abi } from "./abi";

export function getContract() {
  const rpc = process.env.RPC_URL;
  const key = process.env.PRIVATE_KEY;
  const address = process.env.CONTRACT_ADDRESS;

  if (!rpc || !key || !address) {
    throw new Error("Missing env RPC_URL / PRIVATE_KEY / CONTRACT_ADDRESS");
  }

  const provider = new ethers.JsonRpcProvider(rpc);
  const wallet = new ethers.Wallet(key, provider);

  return new ethers.Contract(address, abi, wallet);
}