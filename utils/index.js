// utils/ipfs.js
export default function GetIpfsUrlFromPinata(pinataUrl) {
  let IPFSUrlParts = pinataUrl.split("/");
  const hash = IPFSUrlParts[IPFSUrlParts.length - 1];
  
  const gateways = [
    "https://gateway.pinata.cloud/ipfs/",
    "https://ipfs.io/ipfs/",
    "https://cloudflare-ipfs.com/ipfs/"
  ];

  return gateways.map(gateway => `${gateway}${hash}`);
}
