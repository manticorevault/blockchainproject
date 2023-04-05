import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { expect } from "chai";
import { BigNumber } from "ethers";
import { ethers } from "hardhat";
import { it } from "mocha";
import { TicketNFT, TicketNFT__factory } from "../typechain-types";
import { Address } from "@nomicfoundation/ethereumjs-util";


describe("TicketNFT", () => {
    let deployer: SignerWithAddress, player: SignerWithAddress, account1: SignerWithAddress, account2: SignerWithAddress;
    let nftContract: TicketNFT;
    let tokenId: BigNumber;
    let firstTokenId: BigNumber;
    let secondTokenId: BigNumber;
    const tokenURI1 = "myTokenURI_1";
    const tokenURI2 = "myTokenURI_2";
    const feePercentage = 2;
    const price = ethers.utils.parseEther("0.1");

    function calculateFees(amount: BigNumber) {
        return (amount.div(100)).mul(feePercentage);
    }

    const mintOne = async (account: SignerWithAddress) => {
        const mintTx = await nftContract.connect(account).mintTicket(tokenURI1, {value: price});
        const receiptMintTx = await mintTx.wait();
        tokenId = receiptMintTx.events![0!].args!.tokenId;
        
        expect(await nftContract.tokenURI(tokenId)).to.eq(tokenURI1);
        expect(await nftContract.ownerOf(tokenId)).to.eq(account.address);
    }


    const MintSeveral = async(accounts: Array<string>) => {
        const mintTx = await nftContract.connect(player).mintSeveralTickets(
            accounts,
            tokenURI1,
            {value: calculateFees(price.mul(accounts.length))}
        )

        const receiptMintTx = await mintTx.wait();
        firstTokenId = receiptMintTx.events![0].args!.tokenId;
        secondTokenId = receiptMintTx.events![2].args!.tokenId;
    }

    beforeEach(async () => {
        [deployer, player, account1, account2] = await ethers.getSigners();

        const nftContractFactory = new TicketNFT__factory(deployer);
        nftContract = await nftContractFactory.deploy();
        await nftContract.deployTransaction.wait();
    });

    describe("Set Token URI", async () => {
        it("Set token URI", async () => {
            await nftContract.connect(player).setTokenURI(tokenURI1, price);
            expect(await nftContract.tokenURIsOwners(tokenURI1)).to.eq(player.address);
            expect(await nftContract.tokenURIsPrices(tokenURI1)).to.eq(price);
        });
        it("Cannot set token URI if already set", async () => {
            await nftContract.connect(player).setTokenURI(tokenURI1, price);
            await expect(nftContract.connect(player).setTokenURI(tokenURI1, price)).to.be.reverted;
        });
        it("Cannot set token URI with zero price", async () => {
            await expect(nftContract.connect(player).setTokenURI(tokenURI1, 0)).to.be.reverted;
        });
    })

    describe("Mint", async () => {
        beforeEach(async () => {
            await nftContract.connect(player).setTokenURI(tokenURI1, price);
            expect(await ethers.provider.getBalance(nftContract.address)).to.eq(0);
        });

        it("Mint by one and withdraw", async () => {
            await mintOne(account1);
            await mintOne(account2);

            const expectedFees = calculateFees(price.mul(2));
            const expectedOwnerBalance = (price.mul(2)).sub(expectedFees);
            expect(expectedOwnerBalance.add(expectedFees)).to.eq(price.mul(2));
            expect(await ethers.provider.getBalance(nftContract.address)).to.eq(price.mul(2));

            expect(await nftContract.feesToWithdraw()).to.eq(expectedFees);
            expect(await nftContract.tokenURIsOwnersBalance(tokenURI1)).to.eq(expectedOwnerBalance);

            await nftContract.connect(player).withdrawOwnerURI(tokenURI1);
            expect(await nftContract.tokenURIsOwnersBalance(tokenURI1)).to.eq(0);

            await nftContract.connect(deployer).withdrawFees();
            expect(await nftContract.feesToWithdraw()).to.eq(0);

           expect(await ethers.provider.getBalance(nftContract.address)).to.eq(0);
        });

        it("Mint several and withdraw", async () => {
            await MintSeveral([account1.address, account2.address]);
            expect(firstTokenId).to.eq(0);
            expect(secondTokenId).to.eq(1);

            expect(await nftContract.ownerOf(firstTokenId)).to.eq(account1.address);
            expect(await nftContract.ownerOf(secondTokenId)).to.eq(account2.address);

            const expectedFees = calculateFees(price.mul(2));
            expect(await nftContract.feesToWithdraw()).to.eq(expectedFees);
            expect(await nftContract.tokenURIsOwnersBalance(tokenURI1)).to.eq(0);
            expect(await ethers.provider.getBalance(nftContract.address)).to.eq(expectedFees);

            await nftContract.connect(deployer).withdrawFees();
            expect(await nftContract.feesToWithdraw()).to.eq(0);
            
            expect(await ethers.provider.getBalance(nftContract.address)).to.eq(0);
        });
        it("Cannot buy token URI when not set", async () => {
            await expect(nftContract.connect(account1).mintTicket(tokenURI2, {value: price})).to.be.reverted;
        });
        it("Cannot buy token URI if price is not paid", async () => {
            await expect(nftContract.connect(account1).mintTicket(tokenURI2)).to.be.reverted;
        });
        it("Cannot mint several tokens if fees are not paid", async () => {
            await expect(nftContract.connect(player).mintSeveralTickets(
                [account1.address, account2.address],
                tokenURI1,
            )).to.be.reverted;
        });
        it("Sends extra ETH back to the user when minting by one token", async () => {
            expect(await ethers.provider.getBalance(nftContract.address)).to.eq(0);
            await nftContract.connect(account1).mintTicket(tokenURI1, {value: price.mul(3)});
            expect(await ethers.provider.getBalance(nftContract.address)).to.eq(price);
        });
        it("Sends extra ETH back to the user when minting several tokens", async () => {
            expect(await ethers.provider.getBalance(nftContract.address)).to.eq(0);
            await nftContract.connect(player).mintSeveralTickets(
                [account1.address, account2.address],
                tokenURI1,
                { value: price.mul(2) }
            );
            expect(await ethers.provider.getBalance(nftContract.address)).to.eq(calculateFees(price.mul(2)));
        });
    });

    describe("Withdraw",async () => {
        beforeEach(async () => {
            await nftContract.connect(player).setTokenURI(tokenURI1, price);
            await mintOne(account1);
            await MintSeveral([account1.address, account2.address]);
        });

        it("Only owner can withdraw fees", async () => {
            await expect(nftContract.connect(player).withdrawFees()).to.be.reverted;
            await expect(nftContract.connect(account1).withdrawFees()).to.be.reverted;
        });
        it("Only URI owner can withdraw payment", async () => {
            await expect(nftContract.connect(deployer).withdrawOwnerURI(tokenURI1)).to.be.reverted;
            await expect(nftContract.connect(account1).withdrawOwnerURI(tokenURI1)).to.be.reverted;
        });
    });

    describe("Transfer",async () => {
        beforeEach(async () => {
            await nftContract.connect(player).setTokenURI(tokenURI1, price);
            await mintOne(account1);
        });

        it("Transfer nft", async () => {
            await nftContract.connect(account1).transfer(account2.address, tokenId!);
            expect(await nftContract.ownerOf(tokenId!)).to.eq(account2.address);
        });
        it("Can't transfer another person's nft", async () => {
            await expect(nftContract.connect(account2).transfer(player.address, tokenId!)).to.be.reverted;
        });
        it("Can't transfer nft if was burned", async () => {
            await nftContract.connect(account1).burn(tokenId!);
            await expect(nftContract.connect(account1).transfer(account2.address, tokenId!)).to.be.reverted;
        });
    });

    describe("Burn",async () => {
        beforeEach(async () => {
            await nftContract.connect(player).setTokenURI(tokenURI1, price);
            await mintOne(account1);
        });

        it("Burn nft", async () => {
            await nftContract.connect(account1).burn(tokenId!);
        });
        it("Can't burn another person's nft", async () => {
            await expect(nftContract.connect(account2).burn(tokenId!)).to.be.reverted;
        });
    });
});