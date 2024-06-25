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
    console.log(tokenURI);
    const listedToken = await contract.getNFTListing(tokenId);
    tokenURI = GetIpfsUrlFromPinata(tokenURI);
    console.log(tokenURI);
    const meta = (await axios.get(tokenURI)).data;
    const item = {
      price: meta.price,
      tokenId,
      seller: listedToken.seller,
      owner: listedToken.owner,
      image: meta.image,
      name: meta.name,
      description: meta.description,
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
      setmsg("Buying the NFT... Please Wait (Upto 5 mins)");
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
    <div className="flex flex-col h-screen bg-slate-200">
      <div className="flex flex-col items-center justify-center flex-grow p-4">
        {isConnected ? (
          <div className="bg-white max-w-6xl w-full mx-auto shadow-lg rounded-lg overflow-hidden">
            <div className="flex flex-col md:flex-row">
              <Image
                src={item?.image}
                alt={item?.name}
                width={800}
                height={520}
                className="w-full h-auto md:w-1/2 rounded-lg"
                loading="lazy"
              />
              <div className="flex flex-col px-2 py-4 md:p-6">
                <div className="space-y-4 px-2">
                  <div className="md:text-2xl font-bold text-orange-600">
                    <span className="flex">Name: <p className="text-orange-800 mx-2"> {item?.name} </p></span>
                  </div>
                  <div className="md:text-xl text-gray-700">
                    <span className="block font-bold text-orange-600">Description:</span>
                    <span className="block">{item?.description}</span>
                  </div>
                  <div className="md:text-xl font-bold text-orange-600">
                    <span className="block">Price: {item?.price} ETH</span>
                    <span className="block"></span>
                  </div>
                  <div className="md:text-xl font-bold text-orange-600">
                    <span className="block">Seller:</span>
                    <p className="text-wrap text-xs md:text-lg">{item?.seller}</p>
                  </div>
                </div>
                <div className="mt-4 text-center">
                  <div className="text-red-600 text-lg">{msg}</div>
                  {userAddress?.toLowerCase() === item?.seller?.toLowerCase() ? (
                    <div className="text-green-600 text-2xl font-semibold">
                      You already Own!
                    </div>
                  ) : (
                    <button
                      onClick={buyNFT}
                      className="flex items-center justify-center my-4 mx-2 p-3 text-white bg-red-500 rounded-md font-bold text-lg transition-all duration-300 hover:bg-red-600"
                    >
                      {btnContent === "Processing..." && (
                        <span className="inline-block w-6 h-6 mr-2 border-4 border-gray-300 border-t-white rounded-full animate-spin"></span>
                      )}
                      {btnContent}
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-4xl font-bold text-red-500 text-center my-4">
            You are not connected...
          </div>
        )}
      </div>
    </div>
  );
}
