import GetIpfsUrlFromPinata from "@/utils/index";
import Image from "next/image";
import Link from "next/link";

export default function NFTCard({ item }) {
  const IPFSUrls = GetIpfsUrlFromPinata(item.image);
  const IPFSUrl = IPFSUrls[0]; // Select the first gateway URL

  const limitedDescription =
    item.description.length > 100
      ? item.description.substring(0, 100) + "..."
      : item.description;

  return (
    <div className="relative overflow-hidden rounded-lg group w-96 h-80">
      <div className="relative w-full h-full transition-transform duration-300 ease-in-out group-hover:scale-100">
        <Image src={IPFSUrl} alt="" layout="fill" objectFit="cover" className="rounded-lg md:mx-4" />
      </div>
      <div className="absolute rounded-lg bottom-0 w-full bg-gradient-to-t from-orange-500/80 to-yellow-300/50 p-4 box-border transition-opacity duration-500 ease-in-out opacity-0 translate-y-full group-hover:opacity-100 group-hover:translate-y-0 md:mx-4">
        <Link href={`/nft/${item.tokenId}`} className="text-white no-underline group-hover:underline">
          <strong className="text-lg font-extrabold mb-2 block">{item.name}</strong>
          <p className="text-base m-0 overflow-hidden text-ellipsis max-h-[3em] whitespace-nowrap">
            {limitedDescription}
          </p>
        </Link>
      </div>
    </div>
  );
}
