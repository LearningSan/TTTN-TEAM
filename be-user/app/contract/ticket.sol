// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24; // Updated
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
contract MyNFT is ERC721, Ownable {
    uint256 public nextTokenId;

constructor() ERC721("MyTicketNFT", "MTK") Ownable(msg.sender) {}
    function mint(address to) external onlyOwner {
        _safeMint(to, nextTokenId);
        nextTokenId++;
    }
}