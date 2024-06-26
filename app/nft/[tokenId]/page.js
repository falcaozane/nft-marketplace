"use client";
import { WalletContext } from "@/context/wallet";
import { useParams, useRouter } from "next/navigation";
import { useContext, useEffect, useState } from "react";
import MarketplaceJson from "../../marketplace.json";
import { ethers } from "ethers";
import axios from "axios";
import GetIpfsUrlFromPinata from "@/utils/index";
import Image from "next/image";

export default function NFTPage() {
  const params = useParams();
  const tokenId = params.tokenId;
  const [item, setItem] = useState();
  const [msg, setmsg] = useState();
  const [btnContent, setBtnContent] = useState("Buy NFT");
  const { isConnected, userAddress, signer } = useContext(WalletContext);
  const router = useRouter();

  async function getNFTData() {
    if (!signer) return;
    let contract = new ethers.Contract(
      MarketplaceJson.address,
      MarketplaceJson.abi,
      signer
    );
    let tokenURI = await contract.tokenURI(tokenId);
    const listedToken = await contract.getNFTListing(tokenId);

    const ipfsUrls = GetIpfsUrlFromPinata(tokenURI);

    let meta;
    for (const url of ipfsUrls) {
      try {
        meta = (await axios.get(url)).data;
        break;
      } catch (error) {
        console.error(`Error fetching metadata from ${url}:`, error);
      }
    }

    if (!meta) {
      throw new Error("Unable to fetch metadata from any IPFS gateway.");
    }

    const item = {
      price: meta.price,
      tokenId,
      seller: listedToken.seller,
      owner: listedToken.owner,
      image: meta.image,
      name: meta.name,
      description: meta.description,
      isListed: listedToken.isListed,
    };
    return item;
  }

  useEffect(() => {
    async function fetchData() {
      if (!signer) return;
      try {
        const itemTemp = await getNFTData();
        setItem(itemTemp);
      } catch (error) {
        console.error("Error fetching NFT items:", error);
        setItem(null);
      }
    }

    fetchData();
  }, [isConnected, signer]);

  async function buyNFT() {
    try {
      if (!signer) return;
      let contract = new ethers.Contract(
        MarketplaceJson.address,
        MarketplaceJson.abi,
        signer
      );
      const salePrice = ethers.parseUnits(item.price, "ether").toString();
      setBtnContent("Processing...");
      setmsg("Buying the NFT... Please Wait (Up to 5 mins)");
      let transaction = await contract.executeSale(tokenId, {
        value: salePrice,
      });
      await transaction.wait();
      alert("You successfully bought the NFT!");
      setmsg("");
      setBtnContent("Buy NFT");
      router.push("/");
    } catch (e) {
      console.log("Buying Error: ", e);
    }
  }

  return (
    <div className="flex flex-col h-screen bg-gradient-to-r from-cyan-400 to-purple-500">
      <div className="flex flex-col items-center justify-center flex-grow">
        {isConnected ? (
          <div className="bg-gray-100 max-w-6xl w-full mx-auto shadow-lg rounded-lg p-4 overflow-hidden">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="w-full ">
                <Image src={item?.image} alt="" width={800} height={520} className="w-full h-auto rounded-lg" />
              </div>
              <div className="w-full md:w-1/2 flex flex-col justify-between p-4">
                <div className="space-y-4">
                  <div className="text-xl font-bold text-orange-600">
                    <p>Name: {item?.name}</p>
                  </div>
                  <div className="text-xl text-gray-700">
                    <p>Description: {item?.description}</p>
                  </div>
                  <div className="text-xl font-bold text-orange-600">
                    <p>Price: {item?.price} ETH</p>
                  </div>
                  <div className=" text-sm md:text-xl font-bold text-orange-600">
                    <p>Seller: {item?.seller}</p>
                  </div>
                </div>
                <div className="mt-4 text-center">
                  <div className="text-red-600 text-lg">{msg}</div>
                  {item?.isListed ? (
                    userAddress.toLowerCase() === item?.seller.toLowerCase() ? (
                      <div className="text-red-600 font-bold">You already own this NFT!</div>
                    ) : (
                      <button
                        onClick={buyNFT}
                        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                      >
                        {btnContent === "Processing..." && (
                          <span className="spinner" />
                        )}
                        {btnContent}
                      </button>
                    )
                  ) : (
                    <div className="text-red-600 font-bold">
                      <p className="text-sm md:text-xl">This NFT was bought by: {item?.owner}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-white text-2xl">You are not connected...</div>
        )}
      </div>
    </div>
  );
}
