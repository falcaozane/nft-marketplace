import Image from "next/image";
import Link from "next/link";

export default function HomePage() {
  return (
    <div className="flex flex-col h-screen bg-gradient-to-r from-cyan-400 to-purple-500">
      <div className="flex items-center justify-between max-w-6xl mx-auto mb-20 w-full flex-grow p-5 gap-5">
        <div>
          <h1 className="text-5xl font-bold leading-tight mb-8 text-white">
            Where Art Meets Innovation, Step into NFTstore!
          </h1>
          <p className="text-2xl leading-relaxed mb-12 text-white">
            Enter the nexus of creativity and innovation at NFTstore. Uncover a
            realm of digital marvels, and together, let's redefine the future of
            collectibles.
          </p>
          <div className="flex items-center gap-8">
            <Link href="/marketplace" className="bg-red-400 text-white font-semibold text-lg py-4 px-8 rounded-md transition duration-300 hover:bg-red-500">
              Buy Now!
            </Link>
            <Link href="/sellNFT" className="bg-white text-black font-semibold text-lg py-4 px-8 rounded-md transition duration-300 hover:bg-gray-300">
              List Now!
            </Link>
          </div>
        </div>
        <Image src="/pic1.png" alt="NFTs" width={1075} height={650} />
      </div>
    </div>
  );
}
