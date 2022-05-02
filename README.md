# Amadeus Sample Contract Project

Full Contract Exported from [Amadeus Platfrom](https://www.amadeus-nft.io/).
Contains ERC721A, AmadeusSample.
For AmadeusSample, contains allowListMint, publicSaleMint, auctionMint modules.

You can run bash command below to test Contract.

```shell
npx hardhat test test/index.test.ts
```

# Test Result

```
Primary Account: 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266
Test Mint Account: 0x70997970C51812dc3A010C7d01b50e0d17dc79C8
Azuki : 0x5FbDB2315678afecb367f032d93F642f64180aa3
    AllowList
      ✔ Not Start
      ✔ set start and not set allowed (45ms)
      ✔ set allowlist, mint greater than maxbatchsize (38ms)
      ✔ Should allow mint (43ms)
      ✔ Should allow mint, reach max
      ✔ Should allow mint, mint 1 to test account (42ms)
      ✔ Should not allow mint, allowList mint reached max
    PublicSale
      ✔ Not Start
      ✔ set started, mint greater than maxbatchsize
      ✔ Should allow mint, money not enouth
      ✔ Should allow mint, 
      ✔ Should allow mint, reach max
      ✔ Should allow mint, mint 1 to test account
      ✔ Should not allow mint, public sale mint reached max
    Auction
      ✔ Not Start
      ✔ set started, mint greater than maxbatchsize
      ✔ Should allow mint, money not enouth
      ✔ Should allow mint, 
      ✔ Should allow mint, reach max
      ✔ Should allow mint, mint 1 to test account
      ✔ Should not allow mint, auction mint reached max
    Researve
      ✔ researve mint
    WithDraw
      ✔ with draw


  23 passing (2s)

```
