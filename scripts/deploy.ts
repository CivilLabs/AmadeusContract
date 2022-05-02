// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// When running the script with `npx hardhat run <script>` you'll find the Hardhat
// Runtime Environment's members available in the global scope.
import { ethers } from "hardhat";

async function main() {
  const AmadeusSampleContract = await ethers.getContractFactory(
    "AmadeusSampleContract"
  );
  const amadeusSampleContract = await AmadeusSampleContract.deploy();
  await amadeusSampleContract.deployed();
  console.log("AmadeusSampleContract deployed to:", amadeusSampleContract.address);
  await amadeusSampleContract.setBaseURI("Base URI Of Metadata");
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
