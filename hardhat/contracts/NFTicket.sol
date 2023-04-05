//SPDX-License-Identifier: MIT

pragma solidity ^0.8.7;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Royalty.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/utils/Address.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract TicketNFT is
    ERC721URIStorage,
    Ownable,
    ERC721Royalty,
    ERC721Enumerable
{
    using Counters for Counters.Counter;
    using Address for address;
    Counters.Counter private _tokenIds;
    uint256 constant public feePercentage = 2;
    uint256 public feesToWithdraw;

    mapping(string => address) public tokenURIsOwners;
    mapping(string => uint256) public tokenURIsPrices;
    mapping(string => uint256) public tokenURIsOwnersBalance;
    
    event mint(uint256 tokenId, address player, string tokenURI);
    event tokenURISet(string tokenURI, address URIOwner, uint256 price);
    event withdrawnFees(address owner, uint256 amount);
    event withdrawnOwnerURI(string tokenURI, address URIOwner, uint256 amount);

    modifier onlyTokenURIOwner(string memory _tokenURI) {
        require(tokenURIsOwners[_tokenURI] == msg.sender, "Not the owner of the URI");
        _;
    }

    constructor() ERC721("Online Ticket", "OT") {}

    function supportsInterface(
        bytes4 interfaceId
    )
        public
        view
        override(ERC721, ERC721Enumerable, ERC721Royalty)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
    
    function tokenURI(
        uint256 tokenId
    )
        public
        view
        virtual
        override(ERC721, ERC721URIStorage)
        returns (string memory)
    {
        return super.tokenURI(tokenId);
    }

    function setTokenURI(string memory _tokenURI, uint256 price) public {
        require(tokenURIsOwners[_tokenURI] == address(0), "Token URI already belong to someone");
        require(price > 0, "Price must be greater than zero");
        tokenURIsOwners[_tokenURI] = msg.sender;
        tokenURIsPrices[_tokenURI] = price;

        emit tokenURISet(_tokenURI, msg.sender, price);
    }

    function _mintTicket(
        string memory _tokenURI,
        address receiver
    ) internal returns (uint256) {
        uint256 newItemId = _tokenIds.current();
        _mint(receiver, newItemId);
        _setTokenURI(newItemId, _tokenURI);
        emit mint(newItemId, receiver, _tokenURI);
        _tokenIds.increment();
        return newItemId;
    }

    function mintTicket(
        string memory _tokenURI
    ) public payable returns (uint256 newItemId) {
        uint256 price = tokenURIsPrices[_tokenURI];
        require(price > 0, "Token URI not set");
        require(msg.value >= price, "You need to pay the price to mint a ticket");
        
        newItemId = _mintTicket(_tokenURI, msg.sender);

        if (msg.value > price) {
            Address.sendValue(payable(msg.sender), msg.value - price);
        }

        uint256 fee = _calculateFees(price);
        tokenURIsOwnersBalance[_tokenURI] = tokenURIsOwnersBalance[_tokenURI] + (price - fee);
        feesToWithdraw += fee;
    }


    function mintSeveralTickets(
        address[] memory receivers,
        string memory _tokenURI
    ) public payable onlyTokenURIOwner(_tokenURI) {
        uint256 fees = _calculateFees(tokenURIsPrices[_tokenURI] * receivers.length);
        require(msg.value >= fees, "Need to pay the fees");

        for (uint256 i = 0; i < receivers.length;) {
            _mintTicket(_tokenURI, receivers[i]);

            unchecked {
                i++;
            }

        }

        if (msg.value > fees) {
            Address.sendValue(payable(msg.sender), msg.value - fees);
        }

        feesToWithdraw += fees;
    }

    function transfer(address to, uint256 tokenId) public {
        _transfer(msg.sender, to, tokenId);
    }

    function burn(uint256 tokenId) public {
        require(ownerOf(tokenId) == msg.sender, "Not the owner");
        _burn(tokenId);
    }

    function withdrawOwnerURI(string memory _tokenURI) public onlyTokenURIOwner(_tokenURI) {
        uint256 balance = tokenURIsOwnersBalance[_tokenURI];
        delete tokenURIsOwnersBalance[_tokenURI];

        Address.sendValue(payable(msg.sender), balance);
        emit withdrawnOwnerURI(_tokenURI, msg.sender, balance);
    }

    function withdrawFees() public onlyOwner {
        uint256 fees = feesToWithdraw;
        delete feesToWithdraw;

        Address.sendValue(payable(msg.sender), fees);
        emit withdrawnFees(msg.sender, fees);
    }

    function _calculateFees(uint256 amount) internal pure returns(uint256) {
        return (amount * feePercentage) / 100;
    }

    function _beforeTokenTransfer(
        address from,
        address to,
        uint256 tokenId,
        uint256 batchSize
    ) internal override(ERC721, ERC721Enumerable) {
        super._beforeTokenTransfer(from, to, tokenId, batchSize);
    }

    function _burn(
        uint256 tokenId
    ) internal override(ERC721, ERC721URIStorage, ERC721Royalty) {
        super._burn(tokenId);
    }
}