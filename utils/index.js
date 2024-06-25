export default function GetIpfsUrlFromPinata(pinataUrl) {
  let IPFSUrlParts = pinataUrl.split("/");
  const hash = IPFSUrlParts[IPFSUrlParts.length - 1];
  
  const gateways = [
    "https://ipfs.io/ipfs/",
  ];

  return gateways.map(gateway => `${gateway}${hash}`);
}
