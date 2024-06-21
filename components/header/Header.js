"use client";
import { WalletContext } from "@/context/wallet";
import { BrowserProvider } from "ethers";
import Link from "next/link";
import { useContext, useState } from "react";
import { FaBars, FaTimes } from "react-icons/fa";
import { SiWalletconnect } from "react-icons/si";

export default function Header() {
  const {
    isConnected,
    setIsConnected,
    userAddress,
    setUserAddress,
    signer,
    setSigner,
  } = useContext(WalletContext);

  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const connectWallet = async () => {
    if (!window.ethereum) {
      throw new Error("Metamask is not installed");
    }

    try {
      const provider = new BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      setSigner(signer);
      const accounts = await provider.send("eth_requestAccounts", []);
      setIsConnected(true);
      setUserAddress(accounts[0]);
      const network = await provider.getNetwork();
      const chainID = network.chainId;
      const sepoliaNetworkId = "11155111";

      if (chainID.toString() !== sepoliaNetworkId) {
        alert("Please switch your MetaMask to sepolia network");
        return;
      }
    } catch (error) {
      console.error("connection error: ", error);
    }
  };

  return (
    <header className="sticky top-0 z-20 left-0 w-full bg-gray-800 text-white p-4 shadow-lg">
      <div className="max-w-6xl mx-auto flex items-center justify-between">
        <div className="text-lg md:text-2xl font-bold">
          <Link href="/">NFT marketplace</Link>
        </div>
        <nav className="hidden md:flex items-center space-x-4">
          <ul className="flex space-x-16">
            <li>
              <Link href="/marketplace" className="text-blue-300 hover:text-blue-500">
                MarketPlace
              </Link>
            </li>
            <li>
              <Link href="/sellNFT" className="text-blue-300 hover:text-blue-500">
                List
              </Link>
            </li>
            <li>
              <Link href="/profile" className="text-blue-300 hover:text-blue-500">
                Profile
              </Link>
            </li>
          </ul>
        </nav>
        <button
          className={`px-4 py-2 rounded-md flex items-center ${
            isConnected ? "bg-green-500 cursor-not-allowed" : "bg-red-500 hover:bg-red-600"
          }`}
          onClick={connectWallet}
        >
          {isConnected ? (
            <>{userAddress?.slice(0, 8)}...</>
          ) : (
            <>
              <SiWalletconnect className='mx-1' />
              <span className='hidden md:inline-block'>Connect Wallet</span>
            </>
          )}
        </button>
        <div className="md:hidden">
          <button onClick={() => setIsMenuOpen(!isMenuOpen)}>
            {isMenuOpen ? <FaTimes /> : <FaBars />}
          </button>
        </div>
      </div>
      {isMenuOpen && (
        <nav className="md:hidden flex flex-col items-center space-y-4 mt-4">
          <ul className="flex flex-col items-center space-y-4">
            <li>
              <Link href="/marketplace" className="text-blue-300 hover:text-blue-500">
                MarketPlace
              </Link>
            </li>
            <li>
              <Link href="/sellNFT" className="text-blue-300 hover:text-blue-500">
                List
              </Link>
            </li>
            <li>
              <Link href="/profile" className="text-blue-300 hover:text-blue-500">
                Profile
              </Link>
            </li>
          </ul>
        </nav>
      )}
    </header>
  );
}
