"use client";
import { WalletContext } from "@/context/wallet";
import { useContext, useEffect, useState } from "react";
import { ethers } from "ethers";
import MarketplaceJson from "@/app/marketplace.json";
import axios from "axios";
import NFTTile from "@/components/nftCard/NFTCard";

export default function Profile() {
  const [items, setItems] = useState([]);
  const [totalPrice, setTotalPrice] = useState("0");
  const { isConnected, userAddress, signer } = useContext(WalletContext);

  async function getNFTitems() {
    let sumPrice = 0;
    const itemsArray = [];
    if (!signer) return;
    let contract = new ethers.Contract(
      MarketplaceJson.address,
      MarketplaceJson.abi,
      signer
    );

    let transaction = await contract.getMyNFTs();

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
      sumPrice += Number(price);
    }
    return { itemsArray, sumPrice };
  }

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { itemsArray, sumPrice } = await getNFTitems();
        setItems(itemsArray);
        setTotalPrice(sumPrice);
      } catch (error) {
        console.error("Error fetching NFT items:", error);
      }
    };

    fetchData();
  }, [isConnected]);

  return (
    <div className="flex flex-col h-full bg-slate-400">
      <div className="flex flex-col items-center justify-center flex-grow">
        <div className="max-w-7xl w-full mx-auto p-4 flex-grow overflow-y-auto">
          {isConnected ? (
            <>
              <div className="my-5 text-center">
                <span className="block text-2xl font-bold text-white">Wallet Address: </span>
                <span className="text-wrap text-sm md:text-xl font-bold text-white">{userAddress}</span>
              </div>
              <div className="flex justify-between my-5">
                <div>
                  <span className="block text-xl font-bold text-white">Number of NFTs:</span>
                  <span className="block text-xl font-bold text-white">{items?.length}</span>
                </div>
                <div>
                  <span className="block text-xl font-bold text-white">Total Value:</span>
                  <span className="block text-xl font-bold text-white">{totalPrice} ETH</span>
                </div>
              </div>
              <div className="mt-10">
                <h2 className="text-4xl text-center text-white mb-7 uppercase">Your NFTs</h2>
                {items?.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                    {items?.map((value, index) => (
                      <NFTTile item={value} key={index} />
                    ))}
                  </div>
                ) : (
                  <div className="text-2xl font-bold text-red-500 text-center my-4">
                    You don&apos;t have any NFT...
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="text-3xl font-bold text-red-500 text-center my-4 py-10 h-screen">
              You are not connected...
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
