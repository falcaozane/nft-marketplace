"use client";
import { useContext, useState } from "react";
import { useRouter } from "next/navigation";
import { uploadFileToIPFS, uploadJSONToIPFS } from "@/utils/pinata";
import marketplace from "@/app/marketplace.json";
import { ethers } from "ethers";
import { WalletContext } from "@/context/wallet";

export default function SellNFT() {
  const [formParams, updateFormParams] = useState({
    name: "",
    description: "",
    price: "",
  });
  const [fileURL, setFileURL] = useState();
  const [message, updateMessage] = useState("");
  const [btn, setBtn] = useState(false);
  const [btnContent, setBtnContent] = useState("List NFT");
  const router = useRouter();
  const { isConnected, signer } = useContext(WalletContext);

  async function onFileChange(e) {
    try {
      const file = e.target.files[0];
      const data = new FormData();
      data.set("file", file);
      setBtn(false);
      updateMessage("Uploading image... Please don't click anything!");
      const response = await uploadFileToIPFS(data);
      if (response.success === true) {
        setBtn(true);
        updateMessage("");
        setFileURL(response.pinataURL);
      }
    } catch (e) {
      console.log("Error during file upload...", e);
    }
  }

  async function uploadMetadataToIPFS() {
    const { name, description, price } = formParams;
    if (!name || !description || !price || !fileURL) {
      updateMessage("Please fill all the fields!");
      return -1;
    }

    const nftJSON = {
      name,
      description,
      price,
      image: fileURL,
    };

    try {
      const response = await uploadJSONToIPFS(nftJSON);
      if (response.success === true) {
        return response.pinataURL;
      }
    } catch (e) {
      console.log("Error uploading JSON metadata: ", e);
    }
  }

  async function listNFT(e) {
    try {
      setBtnContent("Processing...");
      const metadataURL = await uploadMetadataToIPFS();
      if (metadataURL === -1) return;

      updateMessage("Uploading NFT...Please dont click anythying!");

      let contract = new ethers.Contract(
        marketplace.address,
        marketplace.abi,
        signer
      );
      const price = ethers.parseEther(formParams.price);

      let transaction = await contract.createToken(metadataURL, price);
      await transaction.wait();

      setBtnContent("List NFT");
      setBtn(false);
      updateMessage("");
      updateFormParams({ name: "", description: "", price: "" });
      alert("Successfully listed your NFT!");
      router.push("/");
    } catch (e) {
      alert("Upload error", e);
    }
  }

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-r from-cyan-400 to-purple-500">
      {isConnected ? (
        <div className="flex flex-col items-center justify-center flex-grow mx-2">
          <div className="bg-gray-200 w-full max-w-lg p-5 shadow-lg rounded-lg my-3 md:my-5 mx-2">
            <h2 className="text-4xl text-orange-600 mt-5 mb-8 text-center uppercase font-extrabold">Upload your NFT</h2>
            <div className="mb-8">
              <div className="mb-4">
                <label className="block text-left mx-1 text-lg font-bold mb-2 text-orange-600">
                  NFT name
                  <span className="text-red-600 text-base">*</span>
                </label>
                <input
                  type="text"
                  className="w-full p-3 text-base bg-inherit text-black border border-black rounded-lg"
                  value={formParams.name}
                  onChange={(e) =>
                    updateFormParams({ ...formParams, name: e.target.value })
                  }
                />
              </div>
              <div className="mb-4">
                <label className="block text-left mx-1 text-lg font-bold mb-2 text-orange-600">
                  NFT description
                  <span className="text-red-600 text-base">*</span>
                </label>
                <textarea
                  className="w-full p-3 text-base bg-inherit text-black border border-black rounded-lg h-32"
                  value={formParams.description}
                  onChange={(e) =>
                    updateFormParams({
                      ...formParams,
                      description: e.target.value,
                    })
                  }
                />
              </div>
              <div className="mb-4">
                <label className="block text-left mx-1 text-lg font-bold mb-2 text-orange-600">
                  Price (in Eth)
                  <span className="text-red-600 text-base">*</span>
                </label>
                <input
                  type="number"
                  className="w-full p-3 text-base bg-inherit text-black border border-black rounded-lg"
                  value={formParams.price}
                  onChange={(e) =>
                    updateFormParams({ ...formParams, price: e.target.value })
                  }
                />
              </div>
              <div className="mb-4">
                <label className="block text-left mx-1 text-lg font-bold mb-2 text-orange-600">
                  Upload image
                  <span className="text-red-600 text-base">*</span>
                </label>
                <input
                  type="file"
                  className="w-full p-3 text-base bg-inherit text-black border border-black rounded-lg"
                  onChange={onFileChange}
                />
              </div>
              <br />
              <div className="text-red-600 font-medium text-center mt-2">{message}</div>
              <button
                onClick={listNFT}
                type="submit"
                className={`border-none rounded-lg w-full mt-4 text-lg font-bold py-3 px-6 flex items-center justify-center ${
                  btn ? "bg-orange-600 text-white cursor-pointer hover:bg-orange-700" : "bg-gray-500 text-gray-300 cursor-not-allowed opacity-50"
                }`}
              >
                {btnContent === "Processing..." && (
                  <span className="inline-block border-4 border-gray-300 border-l-white rounded-full mr-2 w-6 h-6 animate-spin" />
                )}
                {btnContent}
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center flex-grow">
          <div className="text-4xl font-bold text-red-600 max-w-6xl mx-auto mb-20 p-4">
            Connect Your Wallet to Continue...
          </div>
        </div>
      )}
    </div>
  );
}
