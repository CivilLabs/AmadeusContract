import { describe } from "mocha";
import { ethers } from "hardhat";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { Contract } from "ethers";
import { expect } from "chai";
import { parseEther } from "ethers/lib/utils";
import { expectException } from "../utils/expectExpect";

describe("Azuki", function () {
  let primaryAccount: SignerWithAddress;
  let testMintAccount: SignerWithAddress;
  let testContract: Contract;

  before("Setup", async function () {
    // Set Primary Account
    const signers = await ethers.getSigners();
    primaryAccount = signers[0];
    testMintAccount = signers[1];
    console.info(`Primary Account: ${primaryAccount.address}`);
    console.info(`Test Mint Account: ${testMintAccount.address}`);
    const TestContract = await ethers.getContractFactory(
      "AmadeusSampleContract"
    );
    testContract = await TestContract.deploy();
    await testContract.deployed();
    console.log("Azuki :", testContract.address);
  });
  describe("AllowList", async function () {
    it("Not Start", async function () {
      await expectException(
        testContract.allowListMint(2, {
          value: parseEther("0.02"),
        }),
        "allowList sale has not begun yet"
      );
    });
    it("set start and not set allowed", async function () {
      await testContract.setAllowListStatus(true);
      const status = await testContract.getAllowListStatus();
      expect(status).to.equal(true);
      await expectException(
        testContract.allowListMint(2, {
          value: parseEther("0.02"),
        }),
        "not eligible for allowList mint"
      );
    });
    it("set allowlist, mint greater than maxbatchsize", async function () {
      const allowList = ["0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266", "0x70997970C51812dc3A010C7d01b50e0d17dc79C8"];
      await testContract.setAllowList(allowList);
      await expectException(
        testContract.allowListMint(3, {
          value: parseEther("0.02"),
        }),
        "not eligible for allowList mint"
      );
    });
    it("Should allow mint", async function () {
      await testContract.allowListMint(1, {
        value: parseEther("0.02"),
      });
      const balanceOf = await testContract.balanceOf(primaryAccount.address);
      expect(balanceOf.toNumber()).to.equal(1);
    });
    it("Should allow mint, reach max", async function () {
      // connect test account
      await expectException(
        testContract.connect(testMintAccount).allowListMint(2, {
          value: parseEther("0.04"),
        }),
        "allowList mint reached max"
      );
    });
    it("Should allow mint, mint 1 to test account", async function () {
      // connect test account
      await testContract.connect(testMintAccount).allowListMint(1, {
        value: parseEther("0.02"),
      });
      const balanceOfT = await testContract.balanceOf(testMintAccount.address);
      expect(balanceOfT.toNumber()).to.equal(1);
    });
    it("Should not allow mint, allowList mint reached max", async function () {
      // connect test account
      await expectException(
        testContract.connect(testMintAccount).allowListMint(1, {
          value: parseEther("0.02"),
        }),
        "allowList mint reached max"
      );
    });
  });
  describe("PublicSale", async function () {
    it("Not Start", async function () {
      await expectException(
        testContract.publicSaleMint(2, {
          value: parseEther("0.02"),
        }),
        "public sale has not begun yet"
      );
    });
    it("set started, mint greater than maxbatchsize", async function () {
      await testContract.setPublicSaleStatus(true);
      await expectException(
        testContract.publicSaleMint(3, {
          value: parseEther("0.02"),
        }),
        "reached public sale max amount"
      );
    });
    it("Should allow mint, money not enouth", async function () {
      await expectException(
        testContract.connect(testMintAccount).publicSaleMint(2, {
          value: parseEther("0.01"),
        }),
        "Need to send more ETH."
      );
    });
    it("Should allow mint, ", async function () {
      await testContract.publicSaleMint(1, {
        value: parseEther("0.02"),
      });
      const balanceOfP = await testContract.balanceOf(primaryAccount.address);
      expect(balanceOfP.toNumber()).to.equal(2);
    });
    it("Should allow mint, reach max", async function () {
      // connect test account
      await expectException(
        testContract.connect(testMintAccount).publicSaleMint(2, {
          value: parseEther("0.04"),
        }),
        "reached public sale max amount"
      );
    });
    it("Should allow mint, mint 1 to test account", async function () {
      // connect test account
      await testContract.connect(testMintAccount).publicSaleMint(1, {
        value: parseEther("0.02"),
      });
      const balanceOfT = await testContract.balanceOf(testMintAccount.address);
      expect(balanceOfT.toNumber()).to.equal(2);
    });
    it("Should not allow mint, public sale mint reached max", async function () {
      // connect test account
      await expectException(
        testContract.connect(testMintAccount).publicSaleMint(1, {
          value: parseEther("0.02"),
        }),
        "reached public sale max amount"
      );
    });
  });
  describe("Auction", async function () {
    it("Not Start", async function () {
      await expectException(
        testContract.auctionMint(2, {
          value: parseEther("0.04"),
        }),
        "sale has not started yet"
      );
    });
    it("set started, mint greater than maxbatchsize", async function () {
      await testContract.setAuctionSaleStart();
      await expectException(
        testContract.auctionMint(3, {
          value: parseEther("0.02"),
        }),
        "not enough remaining for auction"
      );
    });
    it("Should allow mint, money not enouth", async function () {
      await expectException(
        testContract.connect(testMintAccount).auctionMint(2, {
          value: parseEther("0.01"),
        }),
        "Need to send more ETH."
      );
    });
    it("Should allow mint, ", async function () {
      await testContract.auctionMint(1, {
        value: parseEther("0.5"),
      });
      const balanceOfA = await testContract.balanceOf(primaryAccount.address);
      expect(balanceOfA.toNumber()).to.equal(3);
    });
    it("Should allow mint, reach max", async function () {
      // connect test account
      await expectException(
        testContract.connect(testMintAccount).auctionMint(2, {
          value: parseEther("1.0"),
        }),
        "not enough remaining for auction"
      );
    });
    it("Should allow mint, mint 1 to test account", async function () {
      // connect test account
      await testContract.connect(testMintAccount).auctionMint(1, {
        value: parseEther("0.5"),
      });
      const balanceOfT = await testContract.balanceOf(testMintAccount.address);
      expect(balanceOfT.toNumber()).to.equal(3);
    });
    it("Should not allow mint, auction mint reached max", async function () {
      // connect test account
      await expectException(
        testContract.connect(testMintAccount).auctionMint(1, {
          value: parseEther("0.5"),
        }),
        "not enough remaining for auction"
      );
    });
  });
  describe("Researve", async function () {
    it("researve mint", async function () {
      await expectException(
        testContract.connect(primaryAccount).reserveMint(1),
        "too many already minted before dev mint"
      );
    });
  });
  describe("WithDraw", async function () {
    it("with draw", async function () {
      await testContract.connect(primaryAccount).withdrawMoney();
    });
  });
});
