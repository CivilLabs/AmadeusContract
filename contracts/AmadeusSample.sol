// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "./ERC721A.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

contract AmadeusSampleContract is Ownable, ERC721A, ReentrancyGuard {
    constructor(
    ) ERC721A("test", "TEST", 2, 6) {}

    // For marketing etc.
    function reserveMint(uint256 quantity) external onlyOwner {
        require(
            totalSupply() + quantity <= collectionSize,
            "too many already minted before dev mint"
        );
        uint256 numChunks = quantity / maxBatchSize;
        for (uint256 i = 0; i < numChunks; i++) {
            _safeMint(msg.sender, maxBatchSize);
        }
        if (quantity % maxBatchSize != 0){
            _safeMint(msg.sender, quantity % maxBatchSize);
        }
    }

    // metadata URI
    string private _baseTokenURI;

    function _baseURI() internal view virtual override returns (string memory) {
        return _baseTokenURI;
    }

    function setBaseURI(string calldata baseURI) external onlyOwner {
        _baseTokenURI = baseURI;
    }

    function withdrawMoney() external onlyOwner nonReentrant {
        (bool success, ) = msg.sender.call{value: address(this).balance}("");
        require(success, "Transfer failed.");
    }

    function setOwnersExplicit(uint256 quantity) external onlyOwner nonReentrant {
        _setOwnersExplicit(quantity);
    }

    function numberMinted(address owner) public view returns (uint256) {
        return _numberMinted(owner);
    }

    function getOwnershipData(uint256 tokenId)
    external
    view
    returns (TokenOwnership memory)
    {
        return ownershipOf(tokenId);
    }

    function refundIfOver(uint256 price) private {
        require(msg.value >= price, "Need to send more ETH.");
        if (msg.value > price) {
            payable(msg.sender).transfer(msg.value - price);
        }
    }
    // allowList mint
    uint256 private allowListMintPrice = 0.020000 ether;
    // default false
    bool private allowListStatus = false;
    uint256 private allowListMintAmount = 2;
    uint256 public immutable maxPerAddressDuringMint = 2;

    mapping(address => uint256) public allowList;

    function allowListMint(uint256 quantity) external payable {
        require(tx.origin == msg.sender, "The caller is another contract");
        require(allowListStatus, "allowList sale has not begun yet");
        require(allowList[msg.sender] >= quantity, "not eligible for allowList mint");
        require(allowListMintAmount >= quantity, "allowList mint reached max");
        require(totalSupply() + quantity <= collectionSize, "reached max supply");
        allowList[msg.sender] -= quantity;
        _safeMint(msg.sender, quantity);
        allowListMintAmount -= quantity;
        refundIfOver(allowListMintPrice*quantity);
    }

    function setAllowList(address[] calldata allowList_) external onlyOwner{
        for(uint256 i = 0;i < allowList_.length;i++){
            allowList[allowList_[i]] = maxPerAddressDuringMint;
        }
    }

    function setAllowListStatus(bool status) external onlyOwner {
        allowListStatus = status;
    }

    function getAllowListStatus() external view returns(bool){
        return allowListStatus;
    }
    //public sale
    bool public publicSaleStatus = false;
    uint256 public publicPrice = 0.0200000 ether;
    uint256 public amountForPublicSale = 2;
    // per mint public sale limitation
    uint256 public immutable publicSalePerMint = 2;

    function publicSaleMint(uint256 quantity) external payable {
        require(
        publicSaleStatus,
        "public sale has not begun yet"
        );
        require(
        totalSupply() + quantity <= collectionSize,
        "reached max supply"
        );
        require(
        amountForPublicSale  >= quantity,
        "reached public sale max amount"
        );

        require(
        quantity <= publicSalePerMint,
        "reached public sale per mint max amount"
        );

        _safeMint(msg.sender, quantity);
        amountForPublicSale -= quantity;
        refundIfOver(uint256(publicPrice) * quantity);
    }

    function setPublicSaleStatus(bool status) external onlyOwner {
        publicSaleStatus = status;
    }

    function getPublicSaleStatus() external view returns(bool) {
        return publicSaleStatus;
    }
    // auction
    uint256 public amountForAuction = 2;
    uint256 public constant AUCTION_START_PRICE = 0.500000 ether;
    uint256 public constant AUCTION_END_PRICE = 0.100000 ether;
    uint256 public constant AUCTION_PRICE_CURVE_LENGTH = 60 minutes;
    uint256 public constant AUCTION_DROP_INTERVAL = 10 minutes;
    uint256 public constant AUCTION_DROP_PER_STEP =
    (AUCTION_START_PRICE - AUCTION_END_PRICE) /
    (AUCTION_PRICE_CURVE_LENGTH / AUCTION_DROP_INTERVAL);
    uint256 public auctionSaleStartTime = 0;
    // per mint auction limitation
    uint256 public immutable auctionPerMint = 2;


    function getAuctionPrice(uint256 _saleStartTime) public view returns (uint256) {
        if (block.timestamp < _saleStartTime) {
            return AUCTION_START_PRICE;
        }
        if (block.timestamp - _saleStartTime >= AUCTION_PRICE_CURVE_LENGTH) {
            return AUCTION_END_PRICE;
        } else {
            uint256 steps = (block.timestamp - _saleStartTime) /
            AUCTION_DROP_INTERVAL;
            return AUCTION_START_PRICE - (steps * AUCTION_DROP_PER_STEP);
        }
    }

    function auctionMint(uint256 quantity) external payable {
        require(
        auctionSaleStartTime != 0 && block.timestamp >= uint256(auctionSaleStartTime),
        "sale has not started yet"
        );
        require(
        amountForAuction >= quantity,
        "not enough remaining for auction"
        );
        require(
        quantity <= auctionPerMint,
        "reached auction per mint max amount"
        );
        require(
        totalSupply() + quantity <= collectionSize,
        "reached max supply"
        );

        uint256 totalCost = getAuctionPrice(auctionSaleStartTime) * quantity;
        _safeMint(msg.sender, quantity);
        amountForAuction -= quantity;
        refundIfOver(totalCost);
    }

    function setAuctionSaleStart() external onlyOwner {
        auctionSaleStartTime = block.timestamp;
    }

    function setAuctionSaleEnd() external onlyOwner{
        auctionSaleStartTime = 0;
    }

    function getAuctionStatus() external view returns(bool){
        return auctionSaleStartTime != 0 && block.timestamp >= uint256(auctionSaleStartTime);
    }
}