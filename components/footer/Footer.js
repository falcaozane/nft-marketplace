import Link from "next/link";
import { FaTwitter, FaTelegram, FaYoutube } from "react-icons/fa";

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="w-full bg-gray-800 text-white p-2 shadow-lg">
      <div className="max-w-6xl mx-auto flex flex-col items-center justify-center">
        <div className='flex flex-1 space-x-5 md:space-x-72'>
          <p className="text-md my-2">Copyright &copy; {year} NFTStore. All rights reserved!</p>
          <ul className="flex space-x-4 my-2">
            <li>
              <Link href="#">
                <FaTwitter className='text-white' size={20} />
              </Link>
            </li>
            <li>
              <Link href="https://telegram.org/">
                <FaTelegram className='text-white' size={20} />
              </Link>
            </li>
            <li>
              <Link href="#">
                <FaYoutube className='text-white' size={20} />
              </Link>
            </li>
          </ul>
        </div>
      </div>
    </footer>
  );
}
