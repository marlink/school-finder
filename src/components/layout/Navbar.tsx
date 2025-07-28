"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { 
  Menu, 
  X, 
  Search, 
  Heart, 
  User, 
  Settings, 
  LogOut, 
  GraduationCap,
  MapPin,
  Star,
  TrendingUp,
  Bell,
  Sparkles
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const pathname = usePathname();
  const { data: session, status } = useSession();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navigation = [
    { 
      name: "Szukaj", 
      href: "/search", 
      icon: Search,
      description: "Znajdź idealną szkołę"
    },
    { 
      name: "Regiony", 
      href: "/regions", 
      icon: MapPin,
      description: "Przeglądaj według lokalizacji"
    },
    { 
      name: "Porównaj", 
      href: "/compare", 
      icon: TrendingUp,
      description: "Porównaj szkoły"
    },
    { 
      name: "O nas", 
      href: "/about", 
      icon: Star,
      description: "Dowiedz się więcej"
    },
  ];

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  };

  const handleSignOut = async () => {
    await signOut({ callbackUrl: "/" });
  };

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      isScrolled 
        ? "bg-white/95 backdrop-blur-lg shadow-xl border-b border-orange-100" 
        : "bg-white/80 backdrop-blur-sm"
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-3 group">
            <div className="relative">
              <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-200 group-hover:scale-105">
                <GraduationCap className="h-6 w-6 text-white" />
              </div>
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-gradient-to-br from-yellow-400 to-orange-400 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                <Sparkles className="h-2 w-2 text-white" />
              </div>
            </div>
            <div className="hidden sm:block">
              <div className="text-xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
                SchoolFinder
              </div>
              <div className="text-xs text-gray-500 -mt-1">Znajdź swoją szkołę</div>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            {navigation.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href);
              
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`group relative px-4 py-2 rounded-xl transition-all duration-200 ${
                    active
                      ? "bg-gradient-to-r from-orange-50 to-red-50 text-orange-600 shadow-sm"
                      : "text-gray-600 hover:text-orange-600 hover:bg-orange-50/50"
                  }`}
                >
                  <div className="flex items-center space-x-2">
                    <Icon className={`h-4 w-4 transition-colors ${
                      active ? "text-orange-500" : "text-gray-400 group-hover:text-orange-500"
                    }`} />
                    <span className="font-medium text-sm">{item.name}</span>
                  </div>
                  
                  {/* Tooltip */}
                  <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 px-3 py-1 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap">
                    {item.description}
                    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-b-4 border-transparent border-b-gray-900"></div>
                  </div>
                  
                  {/* Active indicator */}
                  {active && (
                    <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-orange-500 rounded-full"></div>
                  )}
                </Link>
              );
            })}
          </div>

          {/* User Menu */}
          <div className="flex items-center space-x-3">
            {status === "loading" ? (
              <div className="w-8 h-8 bg-gray-200 rounded-full animate-pulse"></div>
            ) : session ? (
              <div className="flex items-center space-x-3">
                {/* Notifications */}
                <Button
                  variant="ghost"
                  size="sm"
                  className="relative p-2 hover:bg-orange-50 rounded-xl"
                >
                  <Bell className="h-5 w-5 text-gray-600" />
                  <Badge className="absolute -top-1 -right-1 w-5 h-5 p-0 bg-red-500 text-white text-xs flex items-center justify-center">
                    3
                  </Badge>
                </Button>

                {/* Favorites */}
                <Link href="/favorites">
                  <Button
                    variant="ghost"
                    size="sm"
                    className={`p-2 rounded-xl transition-colors ${
                      isActive("/favorites")
                        ? "bg-orange-50 text-orange-600"
                        : "hover:bg-orange-50 text-gray-600"
                    }`}
                  >
                    <Heart className={`h-5 w-5 ${
                      isActive("/favorites") ? "fill-orange-500 text-orange-500" : ""
                    }`} />
                  </Button>
                </Link>

                {/* User Dropdown */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-10 w-10 rounded-xl hover:bg-orange-50">
                      <Avatar className="h-8 w-8 ring-2 ring-orange-200">
                        <AvatarImage src={session.user?.image || ""} alt={session.user?.name || ""} />
                        <AvatarFallback className="bg-gradient-to-br from-orange-400 to-red-400 text-white text-sm font-medium">
                          {session.user?.name?.charAt(0) || session.user?.email?.charAt(0) || "U"}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56 bg-white/95 backdrop-blur-lg border-orange-100" align="end" forceMount>
                    <DropdownMenuLabel className="font-normal">
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium leading-none text-gray-900">
                          {session.user?.name || "Użytkownik"}
                        </p>
                        <p className="text-xs leading-none text-gray-500">
                          {session.user?.email}
                        </p>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator className="bg-orange-100" />
                    <DropdownMenuItem className="hover:bg-orange-50 cursor-pointer">
                      <User className="mr-2 h-4 w-4 text-orange-500" />
                      <span>Profil</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem className="hover:bg-orange-50 cursor-pointer">
                      <Settings className="mr-2 h-4 w-4 text-orange-500" />
                      <span>Ustawienia</span>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator className="bg-orange-100" />
                    <DropdownMenuItem 
                      className="hover:bg-red-50 cursor-pointer text-red-600"
                      onClick={handleSignOut}
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Wyloguj się</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Link href="/auth/signin">
                  <Button 
                    variant="ghost" 
                    size="sm"
                    className="text-gray-600 hover:text-orange-600 hover:bg-orange-50 rounded-xl"
                  >
                    Zaloguj się
                  </Button>
                </Link>
                <Link href="/auth/signin">
                  <Button 
                    size="sm"
                    className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white shadow-lg hover:shadow-xl transition-all duration-200 rounded-xl"
                  >
                    Dołącz
                  </Button>
                </Link>
              </div>
            )}

            {/* Mobile menu button */}
            <Button
              variant="ghost"
              size="sm"
              className="md:hidden p-2 hover:bg-orange-50 rounded-xl"
              onClick={() => setIsOpen(!isOpen)}
            >
              {isOpen ? (
                <X className="h-5 w-5 text-gray-600" />
              ) : (
                <Menu className="h-5 w-5 text-gray-600" />
              )}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="md:hidden absolute top-full left-0 right-0 bg-white/95 backdrop-blur-lg border-b border-orange-100 shadow-xl">
            <div className="px-4 py-6 space-y-3">
              {navigation.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.href);
                
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                      active
                        ? "bg-gradient-to-r from-orange-50 to-red-50 text-orange-600"
                        : "text-gray-600 hover:text-orange-600 hover:bg-orange-50"
                    }`}
                    onClick={() => setIsOpen(false)}
                  >
                    <Icon className={`h-5 w-5 ${
                      active ? "text-orange-500" : "text-gray-400"
                    }`} />
                    <div>
                      <div className="font-medium">{item.name}</div>
                      <div className="text-xs text-gray-500">{item.description}</div>
                    </div>
                  </Link>
                );
              })}
              
              {!session && (
                <div className="pt-4 border-t border-orange-100 space-y-2">
                  <Link href="/auth/signin" onClick={() => setIsOpen(false)}>
                    <Button 
                      variant="outline" 
                      className="w-full justify-start border-orange-200 hover:bg-orange-50"
                    >
                      <User className="mr-2 h-4 w-4" />
                      Zaloguj się
                    </Button>
                  </Link>
                  <Link href="/auth/signin" onClick={() => setIsOpen(false)}>
                    <Button className="w-full justify-start bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600">
                      <Sparkles className="mr-2 h-4 w-4" />
                      Dołącz do nas
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
