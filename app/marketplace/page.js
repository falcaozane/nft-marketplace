"use client";
import { WalletContext } from "@/context/wallet";
import { useContext, useEffect, useState } from "react";
import { ethers } from "ethers";
import MarketplaceJson from "@/app/marketplace.json";
import axios from "axios";
import NFTCard from "@/components/nftCard/NFTCard";

export default function Marketplace() {
  const [items, setItems] = useState([]);
  const { isConnected, signer } = useContext(WalletContext);

  async function getNFTitems() {
    const itemsArray = [];
    if (!signer) return;
    let contract = new ethers.Contract(
      MarketplaceJson.address,
      MarketplaceJson.abi,
      signer
    );

    try {
      let transaction = await contract.getAllListedNFTs();

      for (const i of transaction) {
        const tokenId = parseInt(i.tokenId);
        const tokenURI = await contract.tokenURI(tokenId);
        const meta = (await axios.get(tokenURI)).data;
        const price = ethers.formatEther(i.price);

        const item = {
          price,
          tokenId,
          seller: i.seller,
          owner: i.owner,
          image: meta.image,
          name: meta.name,
          description: meta.description,
        };

        itemsArray.push(item);
      }
    } catch (error) {
      console.error("Error fetching NFT items:", error);
    }

    return itemsArray;
  }

  useEffect(() => {
    const fetchData = async () => {
      if (isConnected) {
        try {
          const itemsArray = await getNFTitems();
          setItems(itemsArray);
        } catch (error) {
          console.error("Error fetching NFT items:", error);
        }
      }
    };

    fetchData();
  }, [isConnected]); // Added signer and getNFTitems as dependencies

  return (
    <div className="flex flex-col h-screen bg-gradient-to-r from-cyan-400 to-purple-500">
      <div className="flex flex-col items-center flex-grow">
        <div className="max-w-6xl w-full mx-auto p-4 flex-grow py-5">
          {isConnected ? (
            <>
              <div className="my-5">
                <h2 className="text-4xl text-center text-white mb-7 uppercase">
                  NFT Marketplace
                </h2>
                {items.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                    {items.map((value, index) => (
                      <NFTCard item={value} key={index} />
                    ))}
                  </div>
                ) : (
                  <div className="text-2xl font-bold text-gray-300 text-center my-4">
                    No NFT Listed Now...
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="text-3xl font-bold text-red-500 text-center my-4">
              You are not connected...
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
