"use client";
import { WalletContext } from "@/context/wallet";
import { useParams, useRouter } from "next/navigation";
import { useContext, useEffect, useState } from "react";
import MarketplaceJson from "../../marketplace.json";
import { ethers } from "ethers";
import axios from "axios";
import GetIpfsUrlFromPinata from "@/utils/index";
import Image from "next/image";
import styles from "./nft.module.css";


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
    <div className="flex flex-col h-screen bg-gradient-to-r from-cyan-400 to-purple-500">
      <div className="flex flex-col items-center justify-center flex-grow">
        {isConnected ? (
          <div className="bg-gray-100 max-w-6xl w-full mx-auto shadow-lg rounded-lg p-4 overflow-hidden">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <Image src={item?.image} alt="" width={800} height={520} />
              <div className="flex flex-col items-center justify-between p-4">
                <div className="space-y-4">
                  <div className="text-xl font-bold text-orange-600">
                    <span className="">Name:</span>
                    <span className="">{item?.name}</span>
                  </div>
                  <div className="text-xl text-gray-700">
                    <span className="">Description:</span>
                    <span className="">{item?.description}</span>
                  </div>
                  <div className="text-xl font-bold text-orange-600">
                    <span className="">Price:</span>
                    <span className="">{item?.price} ETH</span>
                  </div>
                  <div className="text-xl font-bold text-orange-600">
                    <span className="">Seller:</span>
                    <span className="">{item?.seller}</span>
                  </div>
                </div>
                <div className="mt-4 text-center">
                  <div className="text-red-600 text-lg">{msg}</div>
                  {userAddress.toLowerCase() === item?.seller.toLowerCase() ? (
                    <div className={styles.msgAlert}>You already Own!</div>
                  ) : (
                    <button
                      onClick={() => {
                        buyNFT();
                      }}
                      className={styles.Btn}
                    >
                      {btnContent === "Processing..." && (
                        <span className={styles.spinner} />
                      )}
                      {btnContent}
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className={styles.notConnected}>You are not connected...</div>
        )}
      </div>
    </div>
  );
}