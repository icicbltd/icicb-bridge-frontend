require('colors');
const fs = require('fs');
const hre = require("hardhat");
const { ethers } = require("hardhat");
const wICICBs = require("./wICICBs.json");
const networks = require("../src/config/networks.json");

async function main() {
	const signer = await hre.ethers.getSigner();
	const bridgeAddress = networks.BSC.bridge;
	const Token = await hre.ethers.getContractFactory("IRC20");
	const token = await Token.deploy("ICICB", "ICICB", 18);
	await token.deployed();
	var tx = await token.transferOwnership(bridgeAddress)
	await tx.wait();

	//add token 
	const BridgeABI = artifacts.readArtifactSync("Bridge").abi;
	const bridge = new ethers.Contract(bridgeAddress, BridgeABI, signer);
	tx = await bridge.addToken([token.address]);
	await tx.wait();

	fs.writeFileSync(`./wICICBs.json`, JSON.stringify({...wICICBs,"BSC":token.address}, null, 4));
}

main().then(() => {
	console.log("success");
}).catch((error) => {
	console.error(error);
	process.exit(1);
});
