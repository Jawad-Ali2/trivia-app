"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Button } from "./ui/button";
import Image from "next/image";
import Login from "@/app/(auth)/login/page";
import axiosInstance from "@/lib/axios";
import { useAuth } from "@/store/AuthProvider";

export default function Navbar() {
  const store = useAuth();
  const { isAuthenticated, setIsAuthenticated, setAccessToken, setUser, user } =
    store();
  const [showProfileMenu, setShowProfileMenu] = useState<boolean>(false);
  const [showMenu, setShowMenu] = useState<boolean>(false);
  const [isLoginModalOpen, setIsLoginModal] = useState<boolean>(false);

  useEffect(() => {
    async function getUser() {
      try {
        const response = await axiosInstance("auth/profile");

        if (response.status === 200) {
          const data = response.data;
          console.log(data);
          setIsAuthenticated(true);
          setUser(data);
          setAccessToken(localStorage.getItem("accessToken") || "");
          if (!localStorage.getItem("user")) localStorage.setItem("user", JSON.stringify(data));
        } else {
          setIsAuthenticated(false);
          setAccessToken("");
          setUser({
            userId: NaN,
            username: "",
            email: "",
            role: "",
          });
        }
      } catch (error) {
        localStorage.removeItem("accessToken");
        localStorage.removeItem("user");
        console.error(error);
      }
    }

    getUser();
  }, []);

  function handleProfileMenu() {
    setShowProfileMenu((prev) => !prev);
  }

  function handleShowMenu() {
    setShowMenu((prev) => !prev);
  }

  return (
    <nav className="bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 shadow-lg">
      <div className="mx-auto max-w-7xl px-2 sm:px-6 lg:px-8">
        <div className="relative flex h-[5.5rem] items-center justify-between">
          <div
            className="absolute inset-y-0 left-0 flex items-center sm:hidden"
            onClick={handleShowMenu}
          >
            <button
              type="button"
              className="relative inline-flex items-center justify-center rounded-md p-2 text-gray-400 hover:bg-gray-700 hover:text-white focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
              aria-controls="mobile-menu"
              aria-expanded="false"
            >
              <span className="sr-only">Open main menu</span>
              <svg
                className="block h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="1.5"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
                />
              </svg>
            </button>
          </div>

          <div className="flex flex-1 items-center justify-center sm:justify-start">
            <Link href={"/"}>
              <div className="flex flex-shrink-0 items-center">
                <Image
                  // className="h-20 w-auto"
                  // src="https://tailwindui.com/img/logos/mark.svg?color=indigo&shade=500"
                  src="/trivia-master.svg"
                  height={90}
                  width={90}
                  alt="Your Company"
                />
              </div>
            </Link>
            <div className="hidden sm:ml-6 sm:block ">
              <div className="flex space-x-4">
                <Link
                  href="/trivia"
                  className="rounded-md bg-indigo-600 px-3 py-2 text-sm font-medium text-white hover:bg-indigo-500 transition-all"
                >
                  Quick
                </Link>
                <Link
                  href="#"
                  className="rounded-md px-3 py-2 text-sm font-medium text-gray-300 hover:bg-gray-700 hover:text-white transition-all"
                >
                  Category
                </Link>
                <Link
                  href="#"
                  className="rounded-md px-3 py-2 text-sm font-medium text-gray-300 hover:bg-gray-700 hover:text-white transition-all"
                >
                  Practice
                </Link>
              </div>
            </div>
          </div>

          <div className="absolute inset-y-0 right-0 flex items-center pr-2 sm:static sm:inset-auto sm:ml-6 sm:pr-0">
            {isAuthenticated ? (
              <>
                <button
                  type="button"
                  className="relative rounded-full bg-gray-800 p-1 text-gray-400 hover:text-white focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-gray-800"
                >
                  <span className="sr-only">View notifications</span>
                  <svg
                    className="h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth="1.5"
                    stroke="currentColor"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0"
                    />
                  </svg>
                </button>

                <div className="relative ml-3" onClick={handleProfileMenu}>
                  <div>
                    <button
                      type="button"
                      className="relative flex rounded-full bg-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-gray-800"
                      id="user-menu-button"
                      aria-expanded="false"
                      aria-haspopup="true"
                    >
                      <span className="sr-only">Open user menu</span>
                      <img
                        className="h-8 w-8 rounded-full"
                        src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
                        alt=""
                      />
                    </button>
                  </div>

                  <div
                    className={`absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none ${
                      !showProfileMenu && "hidden"
                    }`}
                    role="menu"
                    aria-orientation="vertical"
                    aria-labelledby="user-menu-button"
                  >
                    <Link
                      href="/profile"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      role="menuitem"
                    >
                      Your Profile
                    </Link>
                    <Link
                      href="#"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      role="menuitem"
                    >
                      Settings
                    </Link>
                    <Button
                      className="block px-4 py-2 text-sm hover:bg-secondary text-white w-[70%] mx-auto my-3"
                      role="menuitem"
                    >
                      Sign out
                    </Button>
                  </div>
                </div>
              </>
            ) : (
              <>
                <Button
                  onClick={() => setIsLoginModal(true)}
                  className="ml-4 bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-500 transition-all"
                >
                  Login
                </Button>
                <Login
                  isOpen={isLoginModalOpen}
                  onClose={() => setIsLoginModal(false)}
                />
              </>
            )}
            {/* <Link href="/login">
              <Button className="ml-4 bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-500 transition-all">
                Sign In
              </Button>
            </Link> */}
          </div>
        </div>
      </div>

      <div className={`sm:hidden ${!showMenu && "hidden"}`} id="mobile-menu">
        <div className="space-y-1 px-2 pb-3 pt-2">
          <Link
            href="#"
            className="block rounded-md bg-gray-900 px-3 py-2 text-base font-medium text-white"
          >
            Dashboard
          </Link>
          <Link
            href="#"
            className="block rounded-md px-3 py-2 text-base font-medium text-gray-300 hover:bg-gray-700 hover:text-white"
          >
            Team
          </Link>
          <Link
            href="#"
            className="block rounded-md px-3 py-2 text-base font-medium text-gray-300 hover:bg-gray-700 hover:text-white"
          >
            Projects
          </Link>
          <Link
            href="#"
            className="block rounded-md px-3 py-2 text-base font-medium text-gray-300 hover:bg-gray-700 hover:text-white"
          >
            Calendar
          </Link>
        </div>
      </div>
    </nav>
  );
}

// "use client";

// import Link from "next/link";
// import { useState } from "react";
// import { Button } from "./ui/button";

// export default function Navbar() {
//   const [showProfileMenu, setShowProfileMenu] = useState<boolean>(false);
//   const [showMenu, setShowMenu] = useState<boolean>(false);

//   function handleProfileMenu() {
//     setShowProfileMenu((prev) => !prev);
//   }

//   function handleShowMenu() {
//     setShowMenu((prev) => !prev);
//   }

//   return (
//     <nav className="bg-gray-800">
//       <div className="mx-auto max-w-7xl px-2 sm:px-6 lg:px-8">
//         <div className="relative flex h-16 items-center justify-between">
//           <div
//             className="absolute inset-y-0 left-0 flex items-center sm:hidden "
//             onClick={handleShowMenu}
//           >
//             {/* <!-- Mobile menu button--> */}
//             <button
//               type="button"
//               className="relative inline-flex items-center justify-center rounded-md p-2 text-gray-400 hover:bg-gray-700 hover:text-white focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
//               aria-controls="mobile-menu"
//               aria-expanded="false"
//             >
//               <span className="absolute -inset-0.5"></span>
//               <span className="sr-only">Open main menu</span>

//               <svg
//                 className="block h-6 w-6"
//                 fill="none"
//                 viewBox="0 0 24 24"
//                 strokeWidth="1.5"
//                 stroke="currentColor"
//                 aria-hidden="true"
//               >
//                 <path
//                   strokeLinecap="round"
//                   strokeLinejoin="round"
//                   d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
//                 />
//               </svg>
//               {/* <!--
//             Icon when menu is open.

//             Menu open: "block", Menu closed: "hidden"
//           --> */}
//               {/* <svg
//                 className="hidden h-6 w-6"
//                 fill="none"
//                 viewBox="0 0 24 24"
//                 strokeWidth="1.5"
//                 stroke="currentColor"
//                 aria-hidden="true"
//               >
//                 <path
//                   strokeLinecap="round"
//                   strokeLinejoin="round"
//                   d="M6 18L18 6M6 6l12 12"
//                 />
//               </svg> */}
//             </button>
//           </div>
//           <div className="flex flex-1 items-center justify-center sm:items-stretch sm:justify-start">
//             <Link href={"/"}>
//               <div className="flex flex-shrink-0 items-center">
//                 <img
//                   className="h-8 w-auto"
//                   src="https://tailwindui.com/img/logos/mark.svg?color=indigo&shade=500"
//                   alt="Your Company"
//                 />
//               </div>
//             </Link>
//             <div className="hidden sm:ml-6 sm:block">
//               <div className="flex space-x-4">
//                 {/* <!-- Current: "bg-gray-900 text-white", Default: "text-gray-300 hover:bg-gray-700 hover:text-white" --> */}
//                 <Link
//                   href="#"
//                   className="rounded-md bg-gray-900 px-3 py-2 text-sm font-medium text-white"
//                   aria-current="page"
//                 >
//                   Quick
//                 </Link>
//                 <Link
//                   href="#"
//                   className="rounded-md px-3 py-2 text-sm font-medium text-gray-300 hover:bg-gray-700 hover:text-white"
//                 >
//                   Category
//                 </Link>
//                 <Link
//                   href="#"
//                   className="rounded-md px-3 py-2 text-sm font-medium text-gray-300 hover:bg-gray-700 hover:text-white"
//                 >
//                   Practice
//                 </Link>
//               </div>
//             </div>
//           </div>
//           <div className="absolute inset-y-0 right-0 flex items-center pr-2 sm:static sm:inset-auto sm:ml-6 sm:pr-0">
//             <button
//               type="button"
//               className="relative rounded-full bg-gray-800 p-1 text-gray-400 hover:text-white focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-gray-800"
//             >
//               <span className="absolute -inset-1.5"></span>
//               <span className="sr-only">View notifications</span>
//               <svg
//                 className="h-6 w-6"
//                 fill="none"
//                 viewBox="0 0 24 24"
//                 strokeWidth="1.5"
//                 stroke="currentColor"
//                 aria-hidden="true"
//               >
//                 <path
//                   strokeLinecap="round"
//                   strokeLinejoin="round"
//                   d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0"
//                 />
//               </svg>
//             </button>

//             {/* <!-- Profile dropdown --> */}
//             <div className="relative ml-3" onClick={handleProfileMenu}>
//               <div>
//                 <button
//                   type="button"
//                   className="relative flex rounded-full bg-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-gray-800"
//                   id="user-menu-button"
//                   aria-expanded="false"
//                   aria-haspopup="true"
//                 >
//                   <span className="absolute -inset-1.5"></span>
//                   <span className="sr-only">Open user menu</span>
//                   <img
//                     className="h-8 w-8 rounded-full"
//                     src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
//                     alt=""
//                   />
//                 </button>
//               </div>

//               {/* <!--
//             Dropdown menu, show/hide based on menu state.

//             Entering: "transition ease-out duration-100"
//               From: "transform opacity-0 scale-95"
//               To: "transform opacity-100 scale-100"
//             Leaving: "transition ease-in duration-75"
//               From: "transform opacity-100 scale-100"
//               To: "transform opacity-0 scale-95"
//           --> */}

//               <div
//                 className={`absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none ${
//                   !showProfileMenu && "hidden"
//                 }`}
//                 role="menu"
//                 aria-orientation="vertical"
//                 aria-labelledby="user-menu-button"
//                 // tabIndex="-1"
//               >
//                 {/* <!-- Active: "bg-gray-100", Not Active: "" --> */}
//                 <Link
//                   href="/profile"
//                   className="block px-4 py-2 text-sm text-gray-700"
//                   role="menuitem"
//                   //   tabIndex="-1"
//                   id="user-menu-item-0"
//                 >
//                   Your Profile
//                 </Link>
//                 <Link
//                   href="#"
//                   className="block px-4 py-2 text-sm text-gray-700"
//                   role="menuitem"
//                   //   tabIndex="-1"
//                   id="user-menu-item-1"
//                 >
//                   Settings
//                 </Link>
//                 {/* // TODO: Setup dynamic login and sign out  */}
//                 {/* <Button
//                   className="block px-4 py-2 text-sm m-3"
//                   role="menuitem"
//                   //   tabIndex="-1"
//                   id="user-menu-item-2"
//                 >
//                   Sign out
//                 </Button> */}
//               </div>
//             </div>
//           </div>

//           <Link href="/login">
//             <Button
//               className="block px-4 py-2 text-sm m-3"
//               role="menuitem"
//               //   tabIndex="-1"
//               id="user-menu-item-2"
//             >
//               Sign in
//             </Button>
//           </Link>
//         </div>
//       </div>

//       {/* <!-- Mobile menu, show/hide based on menu state. --> */}
//       <div className={`sm:hidden ${!showMenu && "hidden"}`} id="mobile-menu">
//         <div className="space-y-1 px-2 pb-3 pt-2">
//           {/* <!-- Current: "bg-gray-900 text-white", Default: "text-gray-300 hover:bg-gray-700 hover:text-white" --> */}
//           <Link
//             href="#"
//             className="block rounded-md bg-gray-900 px-3 py-2 text-base font-medium text-white"
//             aria-current="page"
//           >
//             Dashboard
//           </Link>
//           <Link
//             href="#"
//             className="block rounded-md px-3 py-2 text-base font-medium text-gray-300 hover:bg-gray-700 hover:text-white"
//           >
//             Team
//           </Link>
//           <Link
//             href="#"
//             className="block rounded-md px-3 py-2 text-base font-medium text-gray-300 hover:bg-gray-700 hover:text-white"
//           >
//             Projects
//           </Link>
//           <Link
//             href="#"
//             className="block rounded-md px-3 py-2 text-base font-medium text-gray-300 hover:bg-gray-700 hover:text-white"
//           >
//             Calendar
//           </Link>
//         </div>
//       </div>
//     </nav>
//   );
// }
